import type {
  Batch,
  Account,
  PaymentAccount,
  CounterpartyAccount,
} from "../types";
export type { ClassificationProgress } from "../types";
export type Catalog = {
  input: string;
  output: string;
  files: string[];
  accounts: Account[];
  paymentAccounts: PaymentAccount[];
  counterpartyAccounts?: CounterpartyAccount[];
  configRevision: string;
  configPath: string;
  batches: Array<
    Omit<Batch, "rows" | "ignored"> & {
      count: number;
      committedCount?: number;
      notImportedCount: number;
      revision: string;
    }
  >;
};
export type Detail = {
  batch: Batch;
  revision: string;
  accounts: Account[];
  paymentAccounts: PaymentAccount[];
  counterpartyAccounts?: CounterpartyAccount[];
  configRevision: string;
};
export type Props = {
  ledgerId: string;
  canWrite: boolean;
  api: {
    fetchLocal(path: string, init?: RequestInit): Promise<Response>;
    graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
  };
};

export type AccountPanel = {
  mode: "payment" | "counterparty" | "description";
  descriptionScope?: "all" | "counterparty" | "payment";
  context: "batch" | "row";
  payments: string[];
  counterparties: string[];
  account: string;
  date: string;
  rowId?: string;
  match: "exact" | "regex";
  pattern: string;
  descriptionMatch?: "contains" | "regex";
  descriptionPattern?: string;
  kind: import("../types").CounterpartyKind | "payment" | "all";
};
