import type {
  InvestmentSuggestion,
  PortfolioConfig,
  PortfolioInvestment,
} from "./types";

export type ConfigIssue = { path: string; message: string };

const ACCOUNT = /^[A-Z][A-Za-z0-9-]*(?::[A-Z][A-Za-z0-9-]*)+$/u;
const CURRENCY = /^[A-Z][A-Z0-9'._/-]{0,31}$/u;
const ID = /^[a-z][a-z0-9_-]{0,63}$/u;

export function validateConfig(config: PortfolioConfig): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (!CURRENCY.test(config.baseCurrency))
    issues.push({
      path: "baseCurrency",
      message: "基础货币格式不正确",
    });
  const ids = new Set<string>();
  const assets = new Set<string>();
  config.investments.forEach((investment, index) => {
    const path = `investments.${index}`;
    if (!investment.id || !ID.test(investment.id) || ids.has(investment.id))
      issues.push({ path: `${path}.id`, message: "投资账户 id 重复或为空" });
    ids.add(investment.id);
    if (!investment.name.trim())
      issues.push({ path: `${path}.name`, message: "名称不能为空" });
    if (!ACCOUNT.test(investment.assetAccount))
      issues.push({
        path: `${path}.assetAccount`,
        message: "资产账户格式不正确",
      });
    if (!CURRENCY.test(investment.commodity))
      issues.push({
        path: `${path}.commodity`,
        message: "商品代码格式不正确",
      });
    const assetKey = `${investment.assetAccount}\0${investment.commodity}`;
    if (assets.has(assetKey))
      issues.push({
        path: `${path}.assetAccount`,
        message: "同一资产账户与商品组合只能配置一次",
      });
    assets.add(assetKey);
    for (const account of [
      ...investment.cashAccounts,
      ...investment.dividendAccounts,
    ]) {
      if (!ACCOUNT.test(account))
        issues.push({
          path: `${path}.accounts`,
          message: `账户格式不正确：${account}`,
        });
    }
    if (
      new Set(investment.cashAccounts).size !==
        investment.cashAccounts.length ||
      new Set(investment.dividendAccounts).size !==
        investment.dividendAccounts.length
    )
      issues.push({
        path: `${path}.accounts`,
        message: "现金账户或分红账户不能重复",
      });
  });
  const groupIds = new Set<string>();
  config.groups.forEach((group, index) => {
    const path = `groups.${index}`;
    if (
      !group.id ||
      !ID.test(group.id) ||
      groupIds.has(group.id) ||
      ids.has(group.id)
    )
      issues.push({ path: `${path}.id`, message: "分组 id 重复或为空" });
    groupIds.add(group.id);
    if (!group.name.trim())
      issues.push({ path: `${path}.name`, message: "分组名称不能为空" });
    if (new Set(group.investmentIds).size !== group.investmentIds.length)
      issues.push({
        path: `${path}.investmentIds`,
        message: "同一投资账户不能重复加入分组",
      });
    for (const id of group.investmentIds)
      if (!ids.has(id))
        issues.push({
          path: `${path}.investmentIds`,
          message: `引用了不存在的投资账户：${id}`,
        });
  });
  return issues;
}

function nextId(prefix: string, used: Set<string>): string {
  let index = 1;
  while (used.has(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

export function createInvestment(config: PortfolioConfig): PortfolioInvestment {
  const id = nextId("inv", new Set(config.investments.map((item) => item.id)));
  return {
    id,
    name: "新投资账户",
    assetAccount: "Assets:Brokerage:",
    commodity: "",
    cashAccounts: [],
    dividendAccounts: [],
    enabled: true,
  };
}

export function investmentFromSuggestion(
  suggestion: InvestmentSuggestion,
  config: PortfolioConfig,
): PortfolioInvestment {
  return {
    id: nextId("inv", new Set(config.investments.map((item) => item.id))),
    name: suggestion.name,
    assetAccount: suggestion.assetAccount,
    commodity: suggestion.commodity,
    cashAccounts: suggestion.cashAccounts,
    dividendAccounts: suggestion.dividendAccounts,
    enabled: true,
  };
}

export function createGroup(config: PortfolioConfig) {
  return {
    id: nextId("grp", new Set(config.groups.map((item) => item.id))),
    name: "新分组",
    investmentIds: [],
  };
}

export function splitAccounts(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[,\n，]/u)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
