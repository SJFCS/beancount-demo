export type MetaValue = string | number | boolean | null;
export type TextMatcher = string | string[];
export type MatchMode = "all" | "any";
export type Join = "and" | "or";
export type ConditionKey =
  "account" | "payee" | "narration" | "tags" | "any" | "meta";
export type ConditionLogic = {
  join?: Join;
  exclude?: boolean;
};
export type TagPair = {
  key: string;
  value: string;
  join?: Join;
  exclude?: boolean;
};
export type MetaPair = {
  key: string;
  value: MetaValue;
  join?: Join;
  exclude?: boolean;
};
export type StructuredFilter = {
  account?: TextMatcher;
  payee?: TextMatcher;
  narration?: TextMatcher;
  tags?: string[];
  tagPairs?: TagPair[];
  tagMode?: "all" | "any";
  meta?: Record<string, MetaValue>;
  metaPairs?: MetaPair[];
  metaMode?: MatchMode;
  matchMode?: MatchMode;
  conditionLogic?: Partial<Record<ConditionKey, ConditionLogic>>;
  any?: TextMatcher;
};
export type Filter = string | StructuredFilter;
export type PresetScope = "mapping" | "query";
export type PresetViewMode = "raw" | "mapped";
export type PresetDataView = {
  mode: PresetViewMode;
  disabledRuleIds: string[];
};
export type PresetExpression =
  | { preset: string }
  | { all: PresetExpression[] }
  | { any: PresetExpression[] };
export type Rule = {
  id: string;
  name?: string;
  enabled: boolean;
  preset?: string;
  presetExpr?: PresetExpression;
  time?: string;
  addTags: string[];
  removeTags: string[];
  addMeta: Record<string, MetaValue>;
  removeMeta: string[];
  setPayee?: string;
  setNarration?: string;
};
export type QueryGroupBy = "payee" | "narration" | "meta";
export type QueryPeriod =
  | "none"
  | "auto"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "yearly";
export type QueryMode = "recurring" | "table";
export type QueryColumnSource = "date" | "payee" | "narration" | "meta";
export type QueryColumn = {
  id: string;
  label: string;
  source: QueryColumnSource;
  metaKey?: string;
};
export type QueryRule = {
  id: string;
  name?: string;
  enabled: boolean;
  preset?: string;
  presetExpr?: PresetExpression;
  time?: string;
  groupBy: QueryGroupBy;
  groupMetaKey?: string;
  period: QueryPeriod;
  periodMetaKey?: string;
  mode?: QueryMode;
  columns?: QueryColumn[];
  groupByColumns?: string[];
};
export type RuleDropPosition = "before" | "after";
export type RuleDropTarget = {
  ruleId: string;
  position: RuleDropPosition;
};
export type Config = {
  version: 1;
  enabled: boolean;
  presets: Record<string, Filter>;
  presetScopes: Record<string, PresetScope>;
  presetViews: Record<string, PresetDataView>;
  rules: Rule[];
  queries: QueryRule[];
};
export type RuleResult = {
  ruleId: string;
  ruleName: string;
  matched: number;
  examples: Array<{
    directiveIndex: number;
    date: string;
    originalPayee: string;
    payee: string;
    originalNarration?: string;
    narration: string;
    postings?: Array<{
      account: string;
      amount: string;
      currency: string;
    }>;
    originalTags: string[];
    tags: string[];
    originalMeta: Record<string, string>;
    meta: Record<string, string>;
    originalAccounts: string[];
    accounts: string[];
  }>;
};
export type PreviewTransaction = {
  directiveIndex: number;
  date: string;
  payee: string;
  narration: string;
  accounts: string[];
  tags: string[];
  meta: Record<string, string>;
};
export type PresetPreview = {
  matched: number;
  transactions: PreviewTransaction[];
};
export type CatalogValue = { value: string; count: number };
export type SelectionCatalog = {
  accounts: CatalogValue[];
  payees: CatalogValue[];
  narrations: CatalogValue[];
  tags: CatalogValue[];
  metadata: Array<{
    key: string;
    count: number;
    values: CatalogValue[];
  }>;
};
export type QueryFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannual"
  | "yearly"
  | "custom"
  | "unknown";
export type QueryPeriodSource = "fixed" | "metadata" | "inferred" | "unknown";
export type QueryAmount = {
  currency: string;
  total: number;
  average: number;
  annual: number | null;
  occurrences: number;
};
export type QueryPosting = {
  account: string;
  amount: string;
  currency: string;
  cost?: {
    number: string;
    currency: string;
    date?: string;
    label?: string;
  };
  price?: {
    number: string;
    currency: string;
  };
};
export type QueryOccurrence = {
  directiveIndex: number;
  date: string;
  payee: string;
  narration: string;
  accounts: string[];
  postings: QueryPosting[];
  tags: string[];
  meta: Record<string, string>;
  amounts: Array<{ currency: string; amount: number }>;
};
export type QueryGroup = {
  key: string;
  label: string;
  matched: number;
  firstDate: string;
  lastDate: string;
  intervalDays: number | null;
  frequency: QueryFrequency;
  occurrencesPerYear: number | null;
  regularity: number | null;
  periodSource: QueryPeriodSource;
  amounts: QueryAmount[];
  occurrences: QueryOccurrence[];
  occurrencesTruncated: boolean;
};
export type QueryRuleResult = {
  ruleId: string;
  ruleName: string;
  matched: number;
  groups: QueryGroup[];
  annualTotals: Array<{ currency: string; amount: number }>;
  unannualizedGroups: number;
  table?: QueryTable;
};
export type QueryTableCell = {
  values: string[];
  total: number;
};
export type QueryTableRow = {
  key: string;
  cells: Record<string, QueryTableCell>;
  matched: number;
  firstDate: string;
  lastDate: string;
  intervalDays: number | null;
  frequency: QueryFrequency;
  occurrencesPerYear: number | null;
  regularity: number | null;
  periodSource: QueryPeriodSource;
  amounts: QueryAmount[];
  occurrences: QueryOccurrence[];
  occurrencesTruncated: boolean;
};
export type QueryTable = {
  columns: QueryColumn[];
  groupByColumns: string[];
  rows: QueryTableRow[];
};
export type Summary = {
  transactions: number;
  matchedTransactions: number;
  rules: number;
  enabledRules: number;
  queries: number;
  enabledQueries: number;
  presets: number;
};
export type PreviewView = {
  results: RuleResult[];
  queryResults: QueryRuleResult[];
  presetPreviews: Record<string, PresetPreview>;
  presetCatalogs: Record<string, SelectionCatalog>;
  selectionCatalog: SelectionCatalog;
  summary: Summary;
};
export type CatalogPreview = Pick<
  PreviewView,
  "presetCatalogs" | "selectionCatalog"
>;
export type View = PreviewView & {
  revision: string;
  config: Config;
  configError: string | null;
  configSource: string | null;
  presetsSource: string | null;
};
export type Props = {
  ledgerId: string;
  canWrite: boolean;
  api: { fetchLocal(path: string, init?: RequestInit): Promise<Response> };
};
