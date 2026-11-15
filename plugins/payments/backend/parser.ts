import BigNumber from "bignumber.js";
import type { Row, Batch, Account } from "../types";
import { requiresStatusReview, reviewWarnings } from "../review";
import { metadataFieldName, paymentMethodField } from "../metadata";
import { clean, hash, refundReceipt, reference } from "./utils";
export function parseRows(
  table: string[][],
  id: string,
  accounts: Account[],
): Pick<Batch, "provider" | "rows" | "ignored"> {
  const headerIndex = table.findIndex(
    (row) =>
      row.map(clean).includes("交易时间") &&
      row.map(clean).includes("交易对方"),
  );
  if (headerIndex < 0) throw new Error("未找到微信或支付宝账单表头");
  const header = table[headerIndex].map(clean);
  const provider =
    header.includes("交易订单号") && header.includes("商品说明")
      ? "alipay"
      : header.includes("交易单号") && header.includes("商品")
        ? "wechat"
        : null;
  if (!provider)
    throw new Error("不支持的账单格式，请使用微信或支付宝原始导出文件");
  const required = [
    "交易时间",
    "交易对方",
    "收/支",
    provider === "wechat" ? "金额(元)" : "金额",
    provider === "wechat" ? "当前状态" : "交易状态",
    provider === "wechat" ? "交易单号" : "交易订单号",
  ];
  for (const key of required)
    if (header.filter((h) => h === key).length !== 1)
      throw new Error(`账单缺少或重复列：${key}`);
  const rows: Row[] = [];
  let ignored = 0;
  for (let index = headerIndex + 1; index < table.length; index++) {
    const source = table[index];
    const get = (...names: string[]) =>
      clean(source[header.findIndex((name) => names.includes(name))] ?? "");
    const time = get("交易时间");
    if (!source.some((cell) => clean(cell))) continue;
    if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/u.test(time)) {
      if (
        /^[\s\-—=]*$/u.test(time) ||
        /^(说明|注[：:]|温馨提示|导出|统计|共计)/u.test(time)
      ) {
        ignored++;
        continue;
      }
      throw new Error(`第 ${index + 1} 行交易时间无效，已停止导入以避免遗漏`);
    }
    const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/u.exec(time)!;
    const date = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
    if (
      !Number.isFinite(Date.parse(date)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
    )
      throw new Error(`第 ${index + 1} 行日期无效`);
    const raw = get("金额(元)", "金额").replace(/[,，¥￥\s]/gu, "");
    if (!/^\d+(?:\.\d{1,2})?$/u.test(raw))
      throw new Error(`第 ${index + 1} 行金额无效`);
    const direction = get("收/支"),
      status = get("当前状态", "交易状态");
    const category = get("交易类型", "交易分类"),
      description = get("商品", "商品说明");
    const payment = clean(
      source[
        header.findIndex(
          (name) => metadataFieldName(name) === paymentMethodField,
        )
      ] ?? "",
    );
    const warnings: string[] = [];
    const neutral = !["收入", "支出"].includes(direction);
    const failed = /关闭|失败|撤销|未支付|已取消/u.test(status);
    const refund = /退款|退还/u.test(`${category} ${status}`);
    if (neutral) warnings.push(reviewWarnings.neutral.message);
    if (refund) warnings.push(reviewWarnings.refund.message);
    if (requiresStatusReview({ status }))
      warnings.push(reviewWarnings.status.message);
    const amount = new BigNumber(raw)
      .times(
        direction === "收入" || refundReceipt({ direction, category, status })
          ? 1
          : -1,
      )
      .toFixed(2);
    if (new BigNumber(amount).isZero())
      warnings.push(reviewWarnings.zero.message);
    const defaultSource =
      provider === "wechat"
        ? "Assets:Digital:WeChatPay"
        : "Assets:Digital:AliPay";
    // Bank card funding must be chosen explicitly; the wallet is not necessarily debited.
    const wallet = /^(零钱|账户余额|余额)$/u.test(payment);
    const sourceAccount =
      wallet && accounts.some((a) => a.name === defaultSource)
        ? defaultSource
        : "";
    if (!sourceAccount) warnings.push(reviewWarnings.funding.message);
    const orderId = get("交易单号", "交易订单号").replace(/^['’]/u, "");
    if (!orderId) warnings.push(reviewWarnings.order.message);
    rows.push({
      id: hash(`${id}:${index}`),
      line: index + 1,
      date,
      time,
      payee: get("交易对方"),
      description,
      amount,
      direction,
      category,
      payment,
      status,
      orderId,
      merchantId: get("商户单号", "商家订单号"),
      originalFields: Array.from(
        { length: Math.max(header.length, source.length) },
        (_, column) => ({
          name: table[headerIndex][column] ?? "",
          value: source[column] ?? "",
        }),
      ),
      refundReference: reference(get("原交易单号", "原交易订单号", "原订单号")),
      sourceAccount,
      targetAccount: "",
      selected:
        !neutral && !failed && !refund && !new BigNumber(amount).isZero(),
      duplicateReviewed: false,
      statusReviewed: false,
      duplicates: [],
      warnings,
    });
  }
  if (!rows.length) throw new Error("账单没有可识别的交易");
  return { provider, rows, ignored };
}
