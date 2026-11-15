import type { Row } from "./types";

export const reviewWarnings = {
  duplicates: { label: "重复候选", message: "疑似重复" },
  status: { label: "交易状态需人工确认", message: "交易状态需人工确认" },
  refund: {
    label: "退款相关",
    message: "退款相关：可能同时存在原支出和退款收入，请核对后选择",
  },
  neutral: {
    label: "不计收支",
    message: "不计收支：请确认资金方向及转账双方账户",
  },
  zero: { label: "零金额交易", message: "零金额交易默认不记账" },
  funding: {
    label: "待选实际资金账户",
    message: "请按支付方式选择实际资金账户",
  },
  order: {
    label: "缺少交易单号",
    message: "缺少交易单号，使用日期和金额辅助查重",
  },
} as const;

export type ReviewWarningType = keyof typeof reviewWarnings;
export const statusReviewWarning = reviewWarnings.status.message;

export function requiresStatusReview(row: Pick<Row, "status">) {
  const status = row.status.trim();
  return (
    !status.includes("成功") &&
    !/已收钱|已存入|已转账|已收款|对方已收钱/u.test(status)
  );
}

export function matchesReviewWarning(row: Row, type: ReviewWarningType) {
  if (type === "duplicates") return row.duplicates.length > 0;
  if (type === "status") return requiresStatusReview(row);
  return row.warnings.includes(reviewWarnings[type].message);
}

export function hasReviewWarnings(row: Row) {
  return row.duplicates.length > 0 || transactionWarnings(row).length > 0;
}

export function transactionWarnings(row: Pick<Row, "status" | "warnings">) {
  const warnings = row.warnings.filter(
    (warning) =>
      warning !== statusReviewWarning &&
      warning !== "交易关闭或失败：默认不记账" &&
      warning !== "组合支付或优惠：请核实实际扣款，必要时在 Bean 中拆分",
  );
  if (requiresStatusReview(row)) warnings.push(statusReviewWarning);
  return warnings;
}

export function needsAccountMapping(
  row: Pick<Row, "sourceAccount" | "targetAccount">,
) {
  return !row.sourceAccount || !row.targetAccount;
}

export function needsReviewConfirmation(
  row: Pick<
    Row,
    "status" | "duplicates" | "duplicateReviewed" | "statusReviewed"
  >,
) {
  return (
    (row.duplicates.length > 0 && !row.duplicateReviewed) ||
    (requiresStatusReview(row) && !row.statusReviewed)
  );
}
