import type {
  Catalog,
  DateRangePreset,
  InvestmentSuggestion,
  PortfolioConfig,
  PortfolioGroup,
  PortfolioInvestment,
} from "../backend/config";

export type {
  Catalog,
  DateRangePreset,
  InvestmentSuggestion,
  PortfolioConfig,
  PortfolioGroup,
  PortfolioInvestment,
};

export type MetricName =
  | "returns"
  | "twr"
  | "pnl"
  | "xirr"
  | "mdm"
  | "mdd"
  | "volatility";

export type View = {
  revision: string;
  config: PortfolioConfig;
  configText: string;
  configPath: string;
  exists: boolean;
  catalog: Catalog;
  primaryCurrency: string;
  operatingCurrencies: string[];
  configError: string | null;
  ledgerError: string | null;
  ledgerErrors: Array<{
    message: string;
    file: string | null;
    line: number | null;
    severity: string;
  }>;
  today: string;
};

export type Summary = {
  units: Array<{ commodity: string; units: number }>;
  marketValue: number;
  costValue: number;
  cashInvested: number;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  xirr: number;
  mdm: number;
  twr: number;
  mdd: number;
  volatility: number;
  flowCount: number;
};

export type ValuePoint = {
  date: string;
  market: number;
  cost: number;
  cash: number;
};

export type SeriesPoint = { date: string; value: number };

export type Report = {
  query: {
    startDate: string;
    endDate: string;
    currency: string;
    selection: string[];
    compareWith: string[];
    metric: MetricName;
  };
  summary: Summary;
  totals: {
    investments: Summary & { id: string; name: string; currency: string };
  };
  series: {
    values: ValuePoint[];
    performance: SeriesPoint[];
    returns: SeriesPoint[];
    twr: SeriesPoint[];
    mdd: SeriesPoint[];
  };
  allocation: Array<{
    id: string;
    name: string;
    currency: string;
    marketValue: number;
    weight: number;
  }>;
  investments: Array<Summary & { id: string; name: string; currency: string }>;
  groups: Array<Summary & { id: string; name: string; currency: string }>;
  intervals: {
    heatmap: Array<{ label: string; value: number }>;
    yearly: Array<{ label: string; value: number }>;
    periods: Array<{ label: string; value: number }>;
  };
  cashFlows: {
    chart: {
      monthly: Array<{ date: string; dividend: number; external: number }>;
      yearly: Array<{ date: string; dividend: number; external: number }>;
    };
    table: Array<{
      date: string;
      amount: number;
      isDividend: boolean;
      source: string;
      investmentId: string;
      account: string;
      transaction: string;
    }>;
  };
  dividends: {
    monthly: {
      keys: Array<{ id: string; name: string }>;
      rows: Array<Record<string, string | number>>;
    };
    yearly: {
      keys: Array<{ id: string; name: string }>;
      rows: Array<Record<string, string | number>>;
    };
  };
  compare: {
    series: Array<{ name: string; data: SeriesPoint[]; kind: string }>;
    commonDate: string | null;
  };
  missingPrices: Array<{ currency: string; target: string; date: string }>;
  warnings: string[];
};

export type Api = {
  fetchLocal(path: string, init?: RequestInit): Promise<Response>;
};

export type Props = {
  ledgerId: string;
  primaryCurrency?: string;
  canWrite: boolean;
  settings: Record<string, unknown>;
  api: Api;
};

export type Tab =
  | "portfolio"
  | "performance"
  | "returns"
  | "investments"
  | "dividends"
  | "cashflows"
  | "config";

export type DraftState = {
  config: PortfolioConfig;
  issues: Array<{ path: string; message: string }>;
};
