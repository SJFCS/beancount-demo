import type { CounterpartyKind } from "../types";
import type { SelectTagOption } from "./searchable-select";

export const counterpartyKindLabels: Record<CounterpartyKind, string> = {
  expense: "支出",
  income: "收入",
  movement: "账户流转",
  "transfer-expense": "转账支出",
  "transfer-income": "转账收入",
};

export const counterpartyKindOptions: SelectTagOption[] = [
  { value: "expense", label: "支出", color: "#dc2626" },
  { value: "income", label: "收入", color: "#15803d" },
  { value: "movement", label: "账户流转", color: "#2563eb" },
  { value: "transfer-expense", label: "转账支出", color: "#b45309" },
  { value: "transfer-income", label: "转账收入", color: "#7c3aed" },
];

export const counterpartyScopeOptions: SelectTagOption[] = [
  { value: "all", label: "全部", color: "#475569" },
  ...counterpartyKindOptions,
];
