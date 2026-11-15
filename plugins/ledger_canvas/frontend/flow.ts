export type FlowKind = "payment" | "receipt" | "transfer" | "mixed" | "other";

export type FlowClassification = {
  kind: FlowKind;
  label: string;
};

export function accountRoot(account: string): string {
  return account.split(":")[0]?.toLowerCase() ?? "";
}

export function classifyFlow(accounts: readonly string[]): FlowClassification {
  const distinctAccounts = new Set(accounts);
  const roots = new Set([...distinctAccounts].map(accountRoot));
  const hasExpense = roots.has("expenses");
  const hasIncome = roots.has("income");

  if (hasExpense && hasIncome) return { kind: "mixed", label: "混合" };
  if (hasExpense) return { kind: "payment", label: "付款" };
  if (hasIncome) return { kind: "receipt", label: "收款" };
  if (
    distinctAccounts.size > 1 &&
    (roots.has("assets") || roots.has("liabilities"))
  ) {
    return { kind: "transfer", label: "账户流转" };
  }
  return { kind: "other", label: "其他" };
}
