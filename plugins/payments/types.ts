export type Row = {
  id: string;
  line: number;
  date: string;
  time: string;
  payee: string;
  description: string;
  amount: string;
  direction: string;
  category: string;
  payment: string;
  status: string;
  orderId: string;
  merchantId: string;
  originalFields?: Array<{ name: string; value: string }>;
  sourceAccount: string;
  targetAccount: string;
  selected: boolean;
  notImported?: boolean;
  duplicateReviewed: boolean;
  statusReviewed?: boolean;
  duplicates: string[];
  warnings: string[];
  confidence?: number;
  reasoning?: string;
  aiFallback?: boolean;
  locked?: boolean;
  committedAt?: string;
  outputPath?: string;
  refundReference?: string;
  refund?: {
    groupId: string;
    relatedLines: number[];
    kind: "full" | "partial";
    basis: string;
  };
};
export type Batch = {
  id: string;
  provider: "wechat" | "alipay";
  filename: string;
  sourcePath: string;
  sourceSha: string;
  createdAt: string;
  rows: Row[];
  ignored: number;
  committedAt?: string;
  outputPath?: string;
  refundVersion?: number;
  lifecycleVersion?: 2;
  locked?: boolean;
  classification?: ClassificationProgress;
};
export type Suggestion = {
  rowIndex: number;
  targetAccount: string;
  confidence: number;
  reasoning: string | null;
};
export type ClassificationFailure = Pick<
  Row,
  "id" | "line" | "date" | "payee" | "description" | "amount" | "targetAccount"
> & {
  reason: string;
  suggestedAccount?: string;
  reasoning?: string;
  fallbackAccount?: string;
};
export type ClassificationProgress = {
  jobId?: string;
  phase: "ready" | "classifying" | "saving" | "complete" | "failed";
  total: number;
  skipped: number;
  processed: number;
  succeeded: number;
  failed: number;
  failures: ClassificationFailure[];
  candidateIds: string[];
  succeededIds: string[];
  batch: number;
  batches: number;
  batchSize: number;
  error: string;
};
export type Account = {
  name: string;
  date: string;
  currencies: string[];
  closed?: string;
};
export type PaymentAccount = {
  provider: string;
  payment: string;
  match?: "exact" | "regex";
  description?: CounterpartyDescriptionMatch;
  priority?: number;
  account: string;
};
export type CounterpartyKind =
  | "transfer-income"
  | "transfer-expense"
  | "income"
  | "expense"
  | "movement";
export type CounterpartyDescriptionMatch = {
  match: "contains" | "regex";
  pattern: string;
};
export type CounterpartyAccount = {
  provider: string;
  kind: CounterpartyKind;
  match?: "exact" | "regex";
  pattern?: string;
  description?: CounterpartyDescriptionMatch;
  priority?: number;
  account: string;
};
export type PaymentConfig = {
  version: 1;
  paymentAccounts: PaymentAccount[];
  counterpartyAccounts?: CounterpartyAccount[];
};
export const CONFIG_PATH = "plugins/payments/config.json";
export const DEFAULT_ACCOUNTS_PATH = "accounts/payments.bean";
export type Existing = {
  date: string;
  payee: string;
  description: string;
  postings: Array<{ account: string; amount: string; currency: string }>;
  label: string;
  orderId?: string;
  provider?: string;
  importBatch?: string;
  importLine?: number;
  file: string;
};
