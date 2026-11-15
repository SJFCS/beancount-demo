import BigNumber from "bignumber.js";
import type { Row, Batch } from "../types";
import { normalize, refundReceipt, reference } from "./utils";
export function matchRefunds(batch: Batch): Batch {
  // Upgrade old drafts once; subsequent manual amount/selection edits are retained.
  const rows = batch.rows.map((row) =>
    !batch.refundVersion &&
    refundReceipt(row) &&
    !["收入", "支出"].includes(row.direction)
      ? { ...row, amount: new BigNumber(row.amount).abs().toFixed(2) }
      : row,
  );
  const receipts = rows.filter(
    (row) => refundReceipt(row) && new BigNumber(row.amount).isPositive(),
  );
  const originals = rows.filter(
    (row) =>
      !refundReceipt(row) &&
      !/失败|撤销|未支付|已取消/u.test(row.status) &&
      new BigNumber(row.amount).isNegative(),
  );
  const matches = new Map<
    string,
    Array<{ receipt: Row; basis: string; exact: boolean }>
  >();
  for (const receipt of receipts) {
    const candidates = originals.flatMap<{
      original: Row;
      score: number;
      elapsed: number;
      exact: boolean;
      basis: string;
    }>((original) => {
      const refundAmount = new BigNumber(receipt.amount);
      const originalAmount = new BigNumber(original.amount).abs();
      const elapsed =
        Date.parse(receipt.time.replace(/\//gu, "-").replace(" ", "T")) -
        Date.parse(original.time.replace(/\//gu, "-").replace(" ", "T"));
      if (
        !Number.isFinite(elapsed) ||
        elapsed < 0 ||
        refundAmount.isGreaterThan(originalAmount)
      )
        return [];
      const order = reference(original.orderId);
      const merchant = reference(original.merchantId);
      const exact = !!(
        (order &&
          (order === reference(receipt.orderId) ||
            order === receipt.refundReference ||
            (order.length >= 8 && receipt.description.includes(order)))) ||
        (merchant && merchant === reference(receipt.merchantId))
      );
      if (exact)
        return [
          { original, score: 100, elapsed, exact, basis: "订单号 / 商户单号" },
        ];
      // Alipay marks some fully refunded purchases as closed; link those only by an explicit reference.
      if (/关闭/u.test(original.status)) return [];
      if (!refundAmount.isEqualTo(originalAmount) || elapsed > 90 * 86400000)
        return [];
      const samePayee =
        !!normalize(receipt.payee) &&
        normalize(receipt.payee) === normalize(original.payee);
      const sameDescription =
        !!normalize(receipt.description) &&
        normalize(receipt.description) === normalize(original.description);
      const refunded = /已全额退款|已退款|已退还|对方已退还/u.test(
        original.status,
      );
      const transfer =
        /转账/u.test(receipt.category) && /转账/u.test(original.category);
      if (!samePayee && !(refunded && (sameDescription || transfer))) return [];
      return [
        {
          original,
          score: refunded ? 30 : sameDescription ? 20 : 10,
          elapsed,
          exact,
          basis: refunded ? "已退还状态、金额及时间" : "交易对方、金额及时间",
        },
      ];
    });
    candidates.sort((a, b) => b.score - a.score || a.elapsed - b.elapsed);
    const best = candidates[0];
    if (!best) continue;
    const next = candidates[1];
    // Repeated merchant purchases are ambiguous unless a reference or refunded status distinguishes them.
    if (
      next?.score === best.score &&
      (best.exact || best.score < 30 || next.elapsed === best.elapsed)
    )
      continue;
    const group = matches.get(best.original.id) ?? [];
    group.push({ receipt, basis: best.basis, exact: best.exact });
    matches.set(best.original.id, group);
  }
  const links = new Map<string, NonNullable<Row["refund"]>>();
  for (const [originalId, group] of matches) {
    if (group.length > 1 && group.some((match) => !match.exact)) continue;
    const original = rows.find((row) => row.id === originalId)!;
    const total = group.reduce(
      (sum, { receipt }) => sum.plus(receipt.amount),
      new BigNumber(0),
    );
    const members = [original, ...group.map(({ receipt }) => receipt)];
    for (const row of members)
      links.set(row.id, {
        groupId: originalId,
        relatedLines: members
          .filter((member) => member.id !== row.id)
          .map((member) => member.line),
        kind: total.isEqualTo(new BigNumber(original.amount).abs())
          ? "full"
          : "partial",
        basis: group[0].basis,
      });
  }
  return {
    ...batch,
    refundVersion: 1,
    rows: rows.map((row) => {
      if (row.locked || row.committedAt) return row;
      const refund = links.get(row.id);
      const newlyMatched =
        refund &&
        (row.refund?.groupId !== refund.groupId ||
          row.refund?.kind !== refund.kind);
      return { ...row, refund, selected: newlyMatched ? false : row.selected };
    }),
  };
}
