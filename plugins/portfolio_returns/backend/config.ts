export const CONFIG_FILE = "plugins/portfolio_returns/config.json";
export const CONFIG_VERSION = 1;

export type PnlColorScheme = "green-red" | "red-green";
export type DateRangePreset =
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "2Y"
  | "3Y"
  | "5Y"
  | "10Y"
  | "MAX";

export type PortfolioInvestment = {
  id: string;
  name: string;
  assetAccount: string;
  commodity: string;
  cashAccounts: string[];
  dividendAccounts: string[];
  enabled: boolean;
};

export type PortfolioGroup = {
  id: string;
  name: string;
  investmentIds: string[];
};

export type PortfolioDisplay = {
  pnlColorScheme: PnlColorScheme;
  defaultRange: DateRangePreset;
};

export type PortfolioConfig = {
  version: 1;
  baseCurrency: string;
  investments: PortfolioInvestment[];
  groups: PortfolioGroup[];
  display: PortfolioDisplay;
};

export type AccountOption = {
  account: string;
  currencies: string[];
};

export type CommodityOption = {
  commodity: string;
  name: string;
};

export type InvestmentSuggestion = {
  assetAccount: string;
  commodity: string;
  name: string;
  cashAccounts: string[];
  dividendAccounts: string[];
  units: string;
  marketValue: string | null;
  lastDate: string;
};

export type Catalog = {
  accounts: AccountOption[];
  commodities: CommodityOption[];
  currencies: string[];
  suggestions: InvestmentSuggestion[];
  dateRange: { startDate: string; endDate: string } | null;
};

const ACCOUNT = /^[A-Z][A-Za-z0-9-]*(?::[A-Z][A-Za-z0-9-]*)+$/u;
const CURRENCY = /^[A-Z][A-Z0-9'._/-]{0,31}$/u;
const ID = /^[a-z][a-z0-9_-]{0,63}$/u;
const RANGES = new Set<DateRangePreset>([
  "3M",
  "6M",
  "YTD",
  "1Y",
  "2Y",
  "3Y",
  "5Y",
  "10Y",
  "MAX",
]);

function mapping(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label}必须是对象`);
  return value as Record<string, unknown>;
}

function text(
  value: unknown,
  label: string,
  pattern?: RegExp,
  maxLength = 120,
): string {
  if (typeof value !== "string") throw new Error(`${label}必须是字符串`);
  const result = value.trim();
  if (!result || result.length > maxLength)
    throw new Error(`${label}长度必须在 1 到 ${maxLength} 之间`);
  if (pattern && !pattern.test(result))
    throw new Error(`${label}格式不正确：${result}`);
  return result;
}

function textList(
  value: unknown,
  label: string,
  pattern: RegExp,
  maxItems = 200,
): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > maxItems)
    throw new Error(`${label}必须是最多 ${maxItems} 项的数组`);
  const result = value.map((item, index) =>
    text(item, `${label}[${index}]`, pattern, 200),
  );
  if (new Set(result).size !== result.length)
    throw new Error(`${label}不能包含重复项`);
  return result;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function defaultPortfolioConfig(baseCurrency = "CNY"): PortfolioConfig {
  return {
    version: CONFIG_VERSION,
    baseCurrency: CURRENCY.test(baseCurrency) ? baseCurrency : "CNY",
    investments: [],
    groups: [],
    display: {
      pnlColorScheme: "green-red",
      defaultRange: "1Y",
    },
  };
}

export function parsePortfolioConfig(
  value: unknown,
  fallbackCurrency = "CNY",
): PortfolioConfig {
  if (value === undefined || value === null || value === "")
    return defaultPortfolioConfig(fallbackCurrency);
  const input = mapping(value, "配置");
  if (input.version !== undefined && input.version !== CONFIG_VERSION)
    throw new Error(`不支持的配置版本：${String(input.version)}`);
  const baseCurrency = text(
    input.baseCurrency ?? fallbackCurrency,
    "基础货币",
    CURRENCY,
    32,
  ).toUpperCase();

  const rawInvestments = Array.isArray(input.investments)
    ? input.investments
    : [];
  if (rawInvestments.length > 200) throw new Error("投资账户不能超过 200 个");
  const investmentIds = new Set<string>();
  const investments = rawInvestments.map((raw, index) => {
    const item = mapping(raw, `投资账户 ${index + 1}`);
    const id = text(item.id, `投资账户 ${index + 1} 的 id`, ID, 64);
    if (investmentIds.has(id)) throw new Error(`投资账户 id 重复：${id}`);
    investmentIds.add(id);
    const assetAccount = text(
      item.assetAccount,
      `投资账户 ${index + 1} 的资产账户`,
      ACCOUNT,
      200,
    );
    const commodity = text(
      item.commodity,
      `投资账户 ${index + 1} 的商品`,
      CURRENCY,
      32,
    );
    return {
      id,
      name: text(
        item.name || `${assetAccount} (${commodity})`,
        `投资账户 ${index + 1} 的名称`,
        undefined,
        100,
      ),
      assetAccount,
      commodity,
      cashAccounts: textList(
        item.cashAccounts,
        `投资账户 ${index + 1} 的现金账户`,
        ACCOUNT,
      ),
      dividendAccounts: textList(
        item.dividendAccounts,
        `投资账户 ${index + 1} 的分红账户`,
        ACCOUNT,
      ),
      enabled: bool(item.enabled, true),
    };
  });
  const uniqueAssets = new Set<string>();
  for (const investment of investments) {
    const key = `${investment.assetAccount}\0${investment.commodity}`;
    if (uniqueAssets.has(key))
      throw new Error(
        `资产账户与商品组合重复：${investment.assetAccount} / ${investment.commodity}`,
      );
    uniqueAssets.add(key);
  }

  const rawGroups = Array.isArray(input.groups) ? input.groups : [];
  if (rawGroups.length > 200) throw new Error("投资分组不能超过 200 个");
  const groupIds = new Set<string>();
  const groups = rawGroups.map((raw, index) => {
    const item = mapping(raw, `分组 ${index + 1}`);
    const id = text(item.id, `分组 ${index + 1} 的 id`, ID, 64);
    if (groupIds.has(id)) throw new Error(`分组 id 重复：${id}`);
    if (investmentIds.has(id)) throw new Error(`分组 id 与投资账户冲突：${id}`);
    groupIds.add(id);
    const ids = textList(
      item.investmentIds,
      `分组 ${index + 1} 的投资账户`,
      ID,
    );
    for (const investmentId of ids) {
      if (!investmentIds.has(investmentId))
        throw new Error(`分组 ${id} 引用了不存在的投资账户 ${investmentId}`);
    }
    return {
      id,
      name: text(item.name, `分组 ${index + 1} 的名称`, undefined, 100),
      investmentIds: ids,
    };
  });

  const displayInput =
    input.display === undefined ? {} : mapping(input.display, "显示设置");
  const pnlColorScheme =
    displayInput.pnlColorScheme === "red-green" ? "red-green" : "green-red";
  const defaultRange = RANGES.has(displayInput.defaultRange as DateRangePreset)
    ? (displayInput.defaultRange as DateRangePreset)
    : "1Y";

  return {
    version: CONFIG_VERSION,
    baseCurrency,
    investments,
    groups,
    display: { pnlColorScheme, defaultRange },
  };
}

export function portfolioConfigDocument(config: PortfolioConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function expandSelection(
  config: PortfolioConfig,
  selection: string[],
): string[] {
  const enabled = config.investments.filter((item) => item.enabled);
  const enabledIds = new Set(enabled.map((item) => item.id));
  if (selection.length === 0) return [...enabledIds];
  const result = new Set<string>();
  for (const id of selection) {
    if (enabledIds.has(id)) result.add(id);
    const group = config.groups.find((item) => item.id === id);
    if (group)
      for (const investmentId of group.investmentIds)
        if (enabledIds.has(investmentId)) result.add(investmentId);
  }
  return [...result];
}
