export type LedgerAmount = {
  number: string;
  currency: string;
};

export type LedgerCostNumber =
  | { kind: "per_unit"; value: string }
  | { kind: "total"; value: string }
  | { kind: "compound"; per_unit: string; total: string }
  | { kind: "per_unit_from_total"; per_unit: string };

export type LedgerPosting = {
  account: string;
  units?: LedgerAmount;
  cost?: {
    number?: LedgerCostNumber;
    currency?: string;
    date?: string;
    label?: string;
  };
  price?: LedgerAmount;
  flag?: string;
  meta?: Record<string, unknown>;
};

export type LedgerTransaction = {
  type: "transaction";
  date: string;
  flag: string;
  payee?: string;
  narration?: string;
  tags: string[];
  links: string[];
  postings: LedgerPosting[];
  meta?: Record<string, unknown>;
};

export type LedgerPrice = {
  type: "price";
  date: string;
  currency: string;
  amount: LedgerAmount;
  meta?: Record<string, unknown>;
};

export type LedgerCommodity = {
  type: "commodity";
  date: string;
  currency: string;
  meta?: Record<string, unknown>;
};

export type LedgerOpen = {
  type: "open";
  date: string;
  account: string;
  currencies: string[];
  meta?: Record<string, unknown>;
};

export type LedgerOther = {
  type:
    | "balance"
    | "close"
    | "pad"
    | "event"
    | "note"
    | "document"
    | "query"
    | "custom";
  date: string;
  meta?: Record<string, unknown>;
};

export type LedgerDirective =
  | LedgerTransaction
  | LedgerPrice
  | LedgerCommodity
  | LedgerOpen
  | LedgerOther;
