import type { Row } from "../types";
import { fundingAccountRoots } from "../account-scope";
const UNSPECIFIED_PAYMENT = "未注明缴费方式";
export const paymentMethodLabel = (payment: string) =>
  payment || UNSPECIFIED_PAYMENT;
export const providerName = (value: string) =>
  value === "wechat"
    ? "微信支付"
    : value === "alipay"
      ? "支付宝"
      : value
        ? value.toUpperCase()
        : "未知来源";
export function flow(row: Row) {
  const amount = Number(row.amount);
  const betweenFundingAccounts = [row.sourceAccount, row.targetAccount].every(
    (account) =>
      fundingAccountRoots.some((root) => account.startsWith(`${root}:`)),
  );
  const neutral =
    !["收入", "支出"].includes(row.direction) &&
    !/退款|退还/u.test(`${row.category} ${row.status}`) &&
    !/^(Expenses|Income):/u.test(row.targetAccount);
  if (
    betweenFundingAccounts ||
    neutral ||
    !Number.isFinite(amount) ||
    amount === 0
  )
    return { kind: "transfer", label: "账户流转", incoming: amount > 0 };
  return amount > 0
    ? { kind: "income", label: "收入", incoming: true }
    : { kind: "expense", label: "支出", incoming: false };
}
export const refundColor = (id: string) =>
  `hsl(${[...id].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 360, 0)} 65% 42%)`;

export type RefundMatchKind = "full" | "incomplete";
export type TransactionGroup = {
  id: string;
  rows: Row[];
  summaryRows?: Row[];
  paired: boolean;
  refundKind?: RefundMatchKind;
};

function amountCents(value: string) {
  const match = /^([+-]?)(\d+)(?:\.(\d{0,2}))?$/u.exec(value.trim());
  if (!match) return undefined;
  const cents =
    BigInt(match[2]) * 100n + BigInt((match[3] ?? "").padEnd(2, "0"));
  return match[1] === "-" ? -cents : cents;
}

function formatCents(value: bigint) {
  const absolute = value < 0n ? -value : value;
  return `${value < 0n ? "-" : ""}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function refundSummary(rows: Row[]) {
  const values = rows.map((row) => amountCents(row.amount));
  const valid = values.every((value) => value !== undefined);
  const paid = values.reduce<bigint>(
    (sum, value) => sum + (value !== undefined && value < 0n ? -value : 0n),
    0n,
  );
  const refunded = values.reduce<bigint>(
    (sum, value) => sum + (value !== undefined && value > 0n ? value : 0n),
    0n,
  );
  const lines = new Set(rows.map((row) => row.line));
  const complete =
    valid &&
    paid > 0n &&
    refunded > 0n &&
    paid === refunded &&
    rows.every(
      (row) =>
        row.refund?.kind === "full" &&
        row.refund.relatedLines.every((line) => lines.has(line)),
    );
  return {
    complete,
    paid: valid ? formatCents(paid) : undefined,
    refunded: valid ? formatCents(refunded) : undefined,
    net: valid ? formatCents(refunded - paid) : undefined,
  };
}

export function groupTransactions(rows: Row[]): TransactionGroup[] {
  const parents = rows.map((_, index) => index);
  const root = (index: number): number => {
    while (parents[index] !== index) {
      parents[index] = parents[parents[index]];
      index = parents[index];
    }
    return index;
  };
  const join = (left: number, right: number) => {
    parents[root(right)] = root(left);
  };
  const byLine = new Map(rows.map((row, index) => [row.line, index]));
  const byGroup = new Map<string, number>();
  // Only explicit refund groups and source-line links connect transactions.
  rows.forEach((row, index) => {
    if (!row.refund) return;
    const existing = byGroup.get(row.refund.groupId);
    if (existing !== undefined) join(index, existing);
    else byGroup.set(row.refund.groupId, index);
    for (const line of row.refund.relatedLines) {
      const related = byLine.get(line);
      if (related !== undefined) join(index, related);
    }
  });
  const groups = new Map<number, Row[]>();
  rows.forEach((row, index) => {
    const key = root(index);
    const members = groups.get(key) ?? [];
    members.push(row);
    groups.set(key, members);
  });
  return [...groups.values()].map((members) => ({
    id: members[0].id,
    rows: members,
    paired: members.length > 1,
    refundKind: members.some((row) => row.refund)
      ? refundSummary(members).complete
        ? "full"
        : "incomplete"
      : undefined,
  }));
}
