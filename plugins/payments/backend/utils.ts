import { createHash } from "node:crypto";
import type { Row } from "../types";
import { DEFAULT_ACCOUNTS_PATH } from "../types";
export const ACCOUNT =
  /^(Assets|Liabilities|Equity|Income|Expenses)(?::[\p{Lu}\p{Lo}\p{Nd}][\p{L}\p{Nd}-]*)+$/u;
export const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export const quote = (value: string) =>
  JSON.stringify(value.replace(/[\r\n\u0000-\u001f]/gu, " "));
export const clean = (value: string = "") =>
  value.replace(/^\uFEFF/u, "").trim();
export const normalize = (value: string) =>
  value.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
export const refundReceipt = (
  row: Pick<Row, "direction" | "category" | "status">,
) =>
  /退款|退还/u.test(`${row.category} ${row.status}`) &&
  (row.direction === "收入" ||
    (!["收入", "支出"].includes(row.direction) &&
      /退款|退还/u.test(row.category)));
export const reference = (value: string = "") => {
  const result = clean(value).replace(/^['’]/u, "");
  return /^(?:\/|无|-+)?$/u.test(result) ? "" : result;
};
export const draftPath = (id: string) => {
  if (!/^[a-f0-9]{64}$/u.test(id)) throw new Error("无效的导入批次");
  return `plugins/payments/drafts/${id}.json`;
};
function directory(value: unknown, fallback: string) {
  const result = typeof value === "string" ? value : fallback;
  if (
    result
      .split("/")
      .some(
        (part) => !part || part === "." || part === ".." || part === ".git",
      ) ||
    /[\\\u0000-\u001f"*?]/u.test(result)
  )
    throw new Error("插件目录必须是安全的账本相对路径");
  return result;
}
export function folders(settings: Record<string, unknown>) {
  const input = directory(settings.input_dir, "import_data");
  const output = directory(settings.output_dir, "transaction/imported");
  if (
    input === output ||
    input.startsWith(`${output}/`) ||
    output.startsWith(`${input}/`)
  )
    throw new Error("原始账单和 Bean 输出目录必须分开");
  return { input, output };
}

export function accountFile(settings: Record<string, unknown>) {
  const value = settings.account_file;
  const result =
    typeof value === "string" && value.trim()
      ? value.trim()
      : DEFAULT_ACCOUNTS_PATH;
  if (
    !/\.bean$/iu.test(result) ||
    result
      .split("/")
      .some(
        (part) => !part || part === "." || part === ".." || part === ".git",
      ) ||
    /[\\\u0000-\u001f"*?]/u.test(result)
  )
    throw new Error("账户文件必须是以 .bean 结尾的安全账本相对路径");
  return result;
}
