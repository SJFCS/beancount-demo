export type PeriodicKind = "amortization" | "depreciation";
export type PeriodicFrequency =
  "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type PeriodicGenerationMode = "all" | "through_today" | "pending";

export type PeriodicRule = {
  id: string;
  ruleKey: string;
  kind: PeriodicKind;
  name: string;
  startDate: string;
  endDate: string;
  frequency: PeriodicFrequency;
  stepCount: number;
  periods: number;
  amount: string;
  postingAmount: string;
  postingNegative: boolean;
  splitOriginalPosting: boolean;
  residualValue: string;
  precision: number;
  currency: string;
  sourceAccount: string;
  expenseAccount: string;
  meta: string;
  transactionDate: string;
  postingAccount: string;
  postingIndex: number;
  transactionIndex: number;
  derivedSource: boolean;
  derivedExpense: boolean;
  replaceOriginalPosting: boolean;
  dayWeighted: boolean;
  finalPeriodFraction: number;
  dates: string[];
  endBoundary: string;
  note: string;
  warnings: string[];
  autoOpenedAccounts: string[];
  postingFlag?: string;
  postingCost?: unknown;
  postingPrice?: unknown;
  postingMeta?: Record<string, unknown>;
  enabled: boolean;
};

export type ScheduleRow = {
  key: string;
  ruleId: string;
  ruleName: string;
  kind: PeriodicKind;
  date: string;
  period: number;
  periodCount: number;
  amount: string;
  openingBalance: string;
  closingBalance: string;
  currency: string;
  sourceAccount: string;
  expenseAccount: string;
  pending: boolean;
};

export type RulePlan = {
  ruleId: string;
  ruleKey: string;
  name: string;
  kind: PeriodicKind;
  currency: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  originalAmount: string;
  unappliedAmount: string;
  residualValue: string;
  scheduledTotal: string;
  periodAmount: string;
  periods: number;
  frequency: PeriodicFrequency;
  stepCount: number;
  dayWeighted: boolean;
  sourceAccount: string;
  expenseAccount: string;
  meta: string;
  transactionDate: string;
  warnings: string[];
  rows: ScheduleRow[];
};

export type PeriodicPlan = {
  rules: RulePlan[];
  rows: ScheduleRow[];
  currencies: string[];
};

export type PeriodicIssue = {
  message: string;
  meta?: string;
  date?: string;
  name?: string;
};

export type View = {
  revision: string;
  mode: PeriodicGenerationMode;
  rules: PeriodicRule[];
  plan: PeriodicPlan;
  next: ScheduleRow | null;
  issues: PeriodicIssue[];
  autoOpened: string[];
  ledgerError: string | null;
  summary: {
    transactions: number;
    rules: number;
    periods: number;
    transactionsWithRules: number;
  };
};

export type Api = {
  fetchLocal(path: string, init?: RequestInit): Promise<Response>;
};

export type Props = {
  ledgerId: string;
  primaryCurrency: string;
  canWrite: boolean;
  api: Api;
};
