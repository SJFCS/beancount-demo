export type Amount = { number: string; currency: string };

export type Sample = {
  date: string;
  declaredValue: Amount;
  price: string;
  units: string;
  marketValue: string;
  marketValueCurrency?: string;
  conversionRate?: string;
  conversionDate?: string;
};

export type AccountReport = {
  account: string;
  currency: string;
  pnlAccount: string;
  quote: string;
  enabled: boolean;
  autoMapped: boolean;
  autoOpened: boolean;
  units: string;
  costBasis: string;
  lastPrice: string;
  lastPriceDate: string | null;
  marketValue: string;
  unrealizedPnl: string;
  realizedPnl: string;
  samples: Sample[];
  warnings: string[];
};

export type Total = {
  quote: string;
  marketValue: string;
  costBasis: string;
  unrealizedPnl: string;
  realizedPnl: string;
};

export type ErrorItem = {
  message: string;
  file: string | null;
  line: number | null;
  severity: string;
};

export type Analysis = {
  errors: Array<{ message: string; file: string | null; line: number | null }>;
  accounts: AccountReport[];
  totals: Total[];
  generated: {
    prices: number;
    opens: number;
    commodities: number;
  };
};

export type AccountDraft = {
  account: string;
  currency: string;
  pnlAccount: string;
  quote: string;
  enabled: boolean;
};

export type ConfigDraft = {
  version: 1;
  accounts: AccountDraft[];
};

export type View = {
  revision: string;
  config: unknown;
  configText: string;
  configPath: string;
  exists: boolean;
  analysis: Analysis;
  configError: string | null;
  ledgerError: string | null;
  ledgerErrors: ErrorItem[];
};

export type Props = {
  ledgerId: string;
  primaryCurrency?: string;
  canWrite: boolean;
  api: { fetchLocal(path: string, init?: RequestInit): Promise<Response> };
};

export type Issue = { path: string; message: string };

export type UpdateDraft = (
  change: (current: ConfigDraft) => ConfigDraft,
) => void;
