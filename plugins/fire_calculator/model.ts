import {
  buildBalanceDistribution,
  type BalanceDistribution,
} from "./balance-distribution";

/** All rates and weights are percentages; money shares one user-selected unit. */
export type FireMode = "monthly" | "manual";
export type FireStrategy = "fixed" | "percentage" | "guardrails";
export type FireEvent = {
  id: string;
  label: string;
  age: number;
  kind: "income" | "expense";
  amount: number;
  inflationAdjusted: boolean;
  enabled?: boolean;
};
export type FireCashflow = {
  id: string;
  label: string;
  kind: "income" | "expense";
  amount: number;
  startAge: number;
  endAge: number;
  startAtCurrentAge?: boolean;
  startAtRetirement?: boolean;
  startAfterPrevious?: boolean;
  startSameAsPrevious?: boolean;
  endAtRetirement?: boolean;
  endAtLifeExpectancy?: boolean;
  endSameAsPrevious?: boolean;
  inflationAdjusted: boolean;
  enabled?: boolean;
};
export type FireConfig = {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  initialBalance: number;
  birthYear?: number;
  cashflows: FireCashflow[];
  allocation: { stocks: number; bonds: number; cash: number };
  stockReturn: number;
  bondReturn: number;
  stockVolatility: number;
  bondVolatility: number;
  inflationRate: number;
  inflationVolatility: number;
  managementFee: number;
  stockTax: number;
  bondTax: number;
  cashMode: "inflation" | "none" | "real";
  cashRealReturn: number;
  rebalanceMonths: number;
  mode: FireMode;
  strategy: FireStrategy;
  withdrawalRate: number;
  guardrailRateMode: "initial" | "manual";
  guardrailManualRate: number;
  guardrailRaiseThreshold: number;
  guardrailCutThreshold: number;
  guardrailAdjustment: number;
  guardrailMinSpending: number;
  guardrailMaxSpending: number;
  simulations: number;
  seed: number;
  events: FireEvent[];
};
export type FireYear = {
  age: number;
  min: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  max: number;
  successRate: number;
};
export type BalanceStatistics = {
  mean: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
};
export type SpendingStatistics = {
  min: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  max: number;
  medianPercentOfPlan: number | null;
  cutsRate: number;
  cutRuns: number;
  maxCut: SpendingCutStatistics | null;
};
export type SpendingCutStatistics = {
  min: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  max: number;
  count: number;
};
export type FailureAgeStatistics = {
  min: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  max: number;
};
export type RetirementWithdrawalRateStatistics = {
  min: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  max: number;
  count: number;
};
/** Cash flows are signed only for investment gains and inflation effects. */
export type FireLedgerAmounts = {
  openingBalance: number;
  income: number;
  oneTimeIncome: number;
  plannedSpending: number;
  budgetSpending: number;
  spending: number;
  oneTimeExpenses: number;
  contributions: number;
  withdrawals: number;
  investmentGain: number;
  fees: number;
  taxes: number;
  inflationEffect: number;
  closingBalance: number;
  shortfall: number;
};
export type FireLedgerAsset = {
  nominal: number;
  real: number;
  nominalReturnRate: number | null;
  realReturnRate: number | null;
};
export type FireLedgerAssets = {
  stocks: FireLedgerAsset;
  bonds: FireLedgerAsset;
  cash: FireLedgerAsset;
};
export type FireLedgerYear = {
  age: number;
  months: number;
  failed: boolean;
  /** Time-weighted investment return for this year, gross of fees and taxes. */
  investmentReturnRate: number | null;
  /** `investmentReturnRate` deflated by this year's realized inflation. */
  realInvestmentReturnRate: number | null;
  /** Year-end asset-class balances and their time-weighted returns. */
  assets: FireLedgerAssets;
  /** Cumulative CPI index at the start of this detail year. */
  cpiStart: number;
  /** Cumulative CPI index at the end of this detail year. */
  cpiEnd: number;
  /** Net regular withdrawal rate used by the guardrail in this year; percent. */
  guardrailWithdrawalRate: number | null;
  /** Whether this year established the path's guardrail baseline. */
  guardrailRateIsInitial: boolean;
  /** Actual guardrail action after applying configured bounds. */
  guardrailAction: "raise" | "cut" | "hold" | null;
  nominal: FireLedgerAmounts;
  real: FireLedgerAmounts;
};
export type FireDetailPath = {
  label: string;
  run: number;
  failureAge: number | null;
  years: FireLedgerYear[];
};
export type FirePathSummary = {
  run: number;
  finalBalance: number;
  nominalFinalBalance: number;
  retirementBalance: number | null;
  nominalRetirementBalance: number | null;
  retirementWithdrawalRate: number | null;
  guardrailInitialRate: number | null;
  guardrailInitialAge: number | null;
  failureAge: number | null;
  finalSpending: number;
  finalPlan: number;
  finalSpendingPercentOfPlan: number | null;
  maxSpendingCut: number;
  maxSpendingCutAge: number | null;
};
export type FireResult = {
  config: FireConfig;
  successRate: number;
  successfulRuns: number;
  totalRuns: number;
  years: FireYear[];
  nominalYears: FireYear[];
  balanceDistributions: BalanceDistribution[];
  nominalBalanceDistributions: BalanceDistribution[];
  initialPlan: number;
  retirementWithdrawalRate: RetirementWithdrawalRateStatistics | null;
  guardrailInitialRate: RetirementWithdrawalRateStatistics | null;
  finalBalance: BalanceStatistics | null;
  nominalFinalBalance: BalanceStatistics | null;
  finalSpending: SpendingStatistics | null;
  failureAges: number[];
  failureAgeStatistics: FailureAgeStatistics | null;
  medianFailureAge: number | null;
  detailPaths: FireDetailPath[];
  pathSummaries: FirePathSummary[];
};
export type SimulationOptions = {
  onProgress?: (percent: number) => void;
  isCancelled?: () => boolean;
  batchSize?: number;
};

export function usesGuardrailInitialRate(
  config: Pick<FireConfig, "strategy" | "guardrailRateMode">,
): boolean {
  return (
    config.strategy === "guardrails" && config.guardrailRateMode === "initial"
  );
}

export function defaultFireConfig(): FireConfig {
  return {
    currentAge: 35,
    retirementAge: 45,
    lifeExpectancy: 95,
    initialBalance: 3_000_000,
    cashflows: [
      {
        id: "default-living-expense",
        label: "生活支出",
        kind: "expense",
        amount: 12_000,
        startAge: 35,
        endAge: 95,
        inflationAdjusted: true,
      },
      {
        id: "default-salary",
        label: "工资收入",
        kind: "income",
        amount: 30_000,
        startAge: 35,
        endAge: 44,
        endAtRetirement: true,
        inflationAdjusted: true,
      },
      {
        id: "default-pension",
        label: "养老金",
        kind: "income",
        amount: 4_000,
        startAge: 65,
        endAge: 95,
        inflationAdjusted: true,
      },
    ],
    allocation: { stocks: 60, bonds: 30, cash: 10 },
    stockReturn: 7,
    bondReturn: 3,
    stockVolatility: 18,
    bondVolatility: 6,
    inflationRate: 2.5,
    inflationVolatility: 1.5,
    managementFee: 0.3,
    stockTax: 0,
    bondTax: 0,
    cashMode: "real",
    cashRealReturn: 0,
    rebalanceMonths: 12,
    mode: "monthly",
    strategy: "fixed",
    withdrawalRate: 4,
    guardrailRateMode: "initial",
    guardrailManualRate: 4,
    guardrailRaiseThreshold: 80,
    guardrailCutThreshold: 120,
    guardrailAdjustment: 10,
    guardrailMinSpending: 50,
    guardrailMaxSpending: 150,
    simulations: 1_000,
    seed: 42,
    events: [],
  };
}

/**
 * Fill only fields introduced after older plans were saved. Invalid values are
 * deliberately preserved so validation still rejects them.
 */
export function upgradeFireConfig(config: FireConfig): FireConfig {
  const defaults = defaultFireConfig();
  return {
    ...config,
    guardrailRateMode:
      config.guardrailRateMode === undefined
        ? defaults.guardrailRateMode
        : config.guardrailRateMode,
    guardrailManualRate:
      config.guardrailManualRate === undefined
        ? defaults.guardrailManualRate
        : config.guardrailManualRate,
    guardrailRaiseThreshold:
      config.guardrailRaiseThreshold === undefined
        ? defaults.guardrailRaiseThreshold
        : config.guardrailRaiseThreshold,
    guardrailCutThreshold:
      config.guardrailCutThreshold === undefined
        ? defaults.guardrailCutThreshold
        : config.guardrailCutThreshold,
    guardrailAdjustment:
      config.guardrailAdjustment === undefined
        ? defaults.guardrailAdjustment
        : config.guardrailAdjustment,
    guardrailMinSpending:
      config.guardrailMinSpending === undefined
        ? defaults.guardrailMinSpending
        : config.guardrailMinSpending,
    guardrailMaxSpending:
      config.guardrailMaxSpending === undefined
        ? defaults.guardrailMaxSpending
        : config.guardrailMaxSpending,
  };
}

/** Validation never silently repairs a financial assumption. */
export function validateFireConfig(config: FireConfig): string[] {
  const errors: string[] = [];
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  // Saved plan data is untyped at runtime.
  if (!isRecord(config)) return ["方案须为有效的配置对象"];
  if (
    !isRecord(config.allocation) ||
    ["stocks", "bonds", "cash"].some(
      (key) =>
        typeof config.allocation[key as keyof FireConfig["allocation"]] !==
        "number",
    )
  )
    errors.push("资产配置须包含股票、债券与现金三个数值比例");
  if (!Array.isArray(config.events)) {
    errors.push("一次性收支须为列表");
  } else if (
    config.events.some(
      (event) =>
        !isRecord(event) ||
        typeof event.id !== "string" ||
        typeof event.label !== "string" ||
        typeof event.age !== "number" ||
        typeof event.amount !== "number" ||
        typeof event.kind !== "string" ||
        typeof event.inflationAdjusted !== "boolean" ||
        (event.enabled !== undefined && typeof event.enabled !== "boolean"),
    )
  ) {
    errors.push("一次性收支的记录格式不完整");
  }
  if (config.cashflows !== undefined) {
    if (!Array.isArray(config.cashflows)) {
      errors.push("定期收支须为列表");
    } else if (
      config.cashflows.some(
        (cashflow) =>
          !isRecord(cashflow) ||
          typeof cashflow.id !== "string" ||
          typeof cashflow.label !== "string" ||
          typeof cashflow.kind !== "string" ||
          typeof cashflow.amount !== "number" ||
          typeof cashflow.startAge !== "number" ||
          typeof cashflow.endAge !== "number" ||
          (cashflow.startAtCurrentAge !== undefined &&
            typeof cashflow.startAtCurrentAge !== "boolean") ||
          (cashflow.startAtRetirement !== undefined &&
            typeof cashflow.startAtRetirement !== "boolean") ||
          (cashflow.startAfterPrevious !== undefined &&
            typeof cashflow.startAfterPrevious !== "boolean") ||
          (cashflow.startSameAsPrevious !== undefined &&
            typeof cashflow.startSameAsPrevious !== "boolean") ||
          (cashflow.endAtRetirement !== undefined &&
            typeof cashflow.endAtRetirement !== "boolean") ||
          (cashflow.endAtLifeExpectancy !== undefined &&
            typeof cashflow.endAtLifeExpectancy !== "boolean") ||
          (cashflow.endSameAsPrevious !== undefined &&
            typeof cashflow.endSameAsPrevious !== "boolean") ||
          typeof cashflow.inflationAdjusted !== "boolean" ||
          (cashflow.enabled !== undefined &&
            typeof cashflow.enabled !== "boolean"),
      )
    ) {
      errors.push("定期收支的记录格式不完整");
    }
  }
  if (errors.length) return errors;
  const within = (
    value: number,
    min: number,
    max: number,
    label: string,
    integer = false,
  ) => {
    if (
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    )
      errors.push(
        `${label}须为 ${min}–${max} 之间的${integer ? "整数" : "数值"}`,
      );
  };
  within(config.currentAge, 0, 119, "当前年龄", true);
  if (config.birthYear !== undefined)
    within(config.birthYear, 1900, new Date().getFullYear(), "出生年份", true);
  within(config.retirementAge, config.currentAge, 120, "退休年龄", true);
  within(config.lifeExpectancy, config.currentAge + 1, 120, "预期寿命", true);
  within(config.initialBalance, 0, 1e12, "初始资产");
  for (const [name, value] of Object.entries(config.allocation))
    within(value, 0, 100, `${name} 资产占比`);
  if (
    !Number.isFinite(
      config.allocation.stocks +
        config.allocation.bonds +
        config.allocation.cash,
    ) ||
    Math.abs(
      config.allocation.stocks +
        config.allocation.bonds +
        config.allocation.cash -
        100,
    ) > 1e-6
  )
    errors.push("股票、债券与现金比例之和须等于 100%");
  within(config.stockReturn, -99, 100, "股票年化收益");
  within(config.bondReturn, -99, 100, "债券年化收益");
  within(config.stockVolatility, 0, 100, "股票年化波动率");
  within(config.bondVolatility, 0, 100, "债券年化波动率");
  within(config.inflationRate, -50, 100, "年通胀率");
  within(config.inflationVolatility, 0, 50, "通胀年化波动率");
  within(config.managementFee, 0, 20, "年管理费");
  within(config.stockTax, 0, 100, "股票收益税率");
  within(config.bondTax, 0, 100, "债券收益税率");
  within(config.cashRealReturn, -50, 100, "现金通胀收益");
  within(config.withdrawalRate, 0.1, 100, "年提款比例");
  within(config.guardrailManualRate, 0.1, 100, "护栏手动提取率");
  within(config.guardrailRaiseThreshold, 0.1, 500, "消费上调触发线");
  within(config.guardrailCutThreshold, 0.1, 500, "消费下调触发线");
  within(config.guardrailAdjustment, 0.1, 100, "护栏单次调整幅度");
  within(config.guardrailMinSpending, 0, 100, "护栏最低消费");
  within(config.guardrailMaxSpending, 100, 500, "护栏最高消费");
  if (
    Number.isFinite(config.guardrailRaiseThreshold) &&
    Number.isFinite(config.guardrailCutThreshold) &&
    config.guardrailRaiseThreshold >= config.guardrailCutThreshold
  )
    errors.push("消费上调触发线须低于消费下调触发线");
  within(config.simulations, 1, 10_000, "模拟次数", true);
  within(config.seed, 0, 4_294_967_295, "随机种子", true);
  if (!["monthly", "manual"].includes(config.mode)) errors.push("计算模式无效");
  if (!["fixed", "percentage", "guardrails"].includes(config.strategy))
    errors.push("提款策略无效");
  if (!["initial", "manual"].includes(config.guardrailRateMode))
    errors.push("护栏提取率基准无效");
  if (!["inflation", "none", "real"].includes(config.cashMode))
    errors.push("现金收益模式无效");
  if (![0, 1, 3, 6, 12].includes(config.rebalanceMonths))
    errors.push("再平衡间隔须为 0、1、3、6 或 12 个月");
  if (config.events.length > 100) errors.push("一次性收支最多支持 100 项");
  config.events.forEach((event, index) => {
    within(
      event.age,
      config.currentAge,
      config.lifeExpectancy - 1,
      `收支 ${index + 1} 的年龄`,
      true,
    );
    within(event.amount, 0, 1e12, `收支 ${index + 1} 的金额`);
    if (!["income", "expense"].includes(event.kind))
      errors.push(`收支 ${index + 1} 的类型无效`);
    if (typeof event.inflationAdjusted !== "boolean")
      errors.push(`收支 ${index + 1} 须指定是否随通胀调整`);
  });
  if (config.cashflows !== undefined) {
    if (config.cashflows.length > 100) errors.push("定期收支最多支持 100 项");
    const seenCashflowIds = new Set<string>();
    config.cashflows.forEach((cashflow, index) => {
      if (seenCashflowIds.has(cashflow.id))
        errors.push(`定期收支 ${index + 1} 的标识重复`);
      seenCashflowIds.add(cashflow.id);
      if (cashflow.label.length > 80)
        errors.push(`定期收支 ${index + 1} 的名称最多 80 个字符`);
      if (
        [
          cashflow.startAtCurrentAge,
          cashflow.startAtRetirement,
          cashflow.startAfterPrevious,
          cashflow.startSameAsPrevious,
        ].filter(Boolean).length > 1
      )
        errors.push(
          `定期收支 ${index + 1} 的开始年龄只能选择一种跟随方式（自当前年龄、自退休、自上个卡片开始年龄、自上个卡片结束年龄）`,
        );
      if (
        [
          cashflow.endAtRetirement,
          cashflow.endAtLifeExpectancy,
          cashflow.endSameAsPrevious,
        ].filter(Boolean).length > 1
      )
        errors.push(
          `定期收支 ${index + 1} 的结束年龄只能选择一种跟随方式（至退休、至生命结束、至上个卡片结束年龄）`,
        );
      within(
        cashflow.startAge,
        0,
        120,
        `定期收支 ${index + 1} 的开始年龄`,
        true,
      );
      within(cashflow.amount, 0, 1e12, `定期收支 ${index + 1} 的金额`);
      within(cashflow.endAge, 0, 120, `定期收支 ${index + 1} 的结束年龄`, true);
      const effectiveStartAge = cashflowStartAge(
        config.cashflows,
        index,
        config,
      );
      if (
        !cashflow.endAtRetirement &&
        !cashflow.endAtLifeExpectancy &&
        !(
          cashflow.endSameAsPrevious &&
          previousCashflowIndex(config.cashflows, index) >= 0
        ) &&
        Number.isFinite(cashflow.endAge) &&
        Number.isFinite(effectiveStartAge) &&
        cashflow.endAge < effectiveStartAge
      )
        errors.push(`定期收支 ${index + 1} 的结束年龄不得早于开始年龄`);
      if (!["income", "expense"].includes(cashflow.kind))
        errors.push(`定期收支 ${index + 1} 的类型无效`);
      if (typeof cashflow.inflationAdjusted !== "boolean")
        errors.push(`定期收支 ${index + 1} 须指定是否随通胀调整`);
    });
  }
  return errors;
}

type RandomSource = () => number;
type Portfolio = { stocks: number; bonds: number; cash: number };
type PathResult = {
  real: number[];
  nominal: number[];
  alive: boolean[];
  failureAge: number | null;
  finalSpending: number;
  finalPlan: number;
  maxSpendingCut: number;
  maxSpendingCutAge: number | null;
  retirementPlan: number | null;
  retirementBalance: number | null;
  nominalRetirementBalance: number | null;
  retirementWithdrawalRate: number | null;
  guardrailInitialRate: number | null;
  guardrailInitialAge: number | null;
  details: FireLedgerYear[];
};

function emptyLedger(openingBalance: number): FireLedgerAmounts {
  return {
    openingBalance,
    income: 0,
    oneTimeIncome: 0,
    plannedSpending: 0,
    budgetSpending: 0,
    spending: 0,
    oneTimeExpenses: 0,
    contributions: 0,
    withdrawals: 0,
    investmentGain: 0,
    fees: 0,
    taxes: 0,
    inflationEffect: 0,
    closingBalance: openingBalance,
    shortfall: 0,
  };
}

function emptyLedgerAsset(): FireLedgerAsset {
  return {
    nominal: 0,
    real: 0,
    nominalReturnRate: null,
    realReturnRate: null,
  };
}

function emptyLedgerAssets(): FireLedgerAssets {
  return {
    stocks: emptyLedgerAsset(),
    bonds: emptyLedgerAsset(),
    cash: emptyLedgerAsset(),
  };
}

type AssetGrowth = {
  nominal: number;
  real: number;
  months: number;
};

function emptyAssetGrowth(): AssetGrowth {
  return {
    nominal: 1,
    real: 1,
    months: 0,
  };
}

function annualizedReturn(growth: number, months: number): number | null {
  return months > 0 && growth > 0
    ? (growth ** (12 / months) - 1) * 100
    : null;
}

/** A separate deterministic random stream per path keeps batches equivalent. */
function randomSource(seed: number, run: number): RandomSource {
  let state = (seed ^ Math.imul(run + 1, 0x9e3779b9)) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function normalSource(random: RandomSource): RandomSource {
  let spare: number | undefined;
  return () => {
    if (spare !== undefined) {
      const value = spare;
      spare = undefined;
      return value;
    }
    const radius = Math.sqrt(-2 * Math.log(1 - random()));
    const angle = 2 * Math.PI * random();
    spare = radius * Math.sin(angle);
    return radius * Math.cos(angle);
  };
}

/**
 * The inputs describe arithmetic annual mean return and annual standard
 * deviation. Matching the gross return's lognormal moments, then scaling its
 * log mean/variance by time, preserves the expected annual compounded return.
 */
function lognormalParameters(mean: number, volatility: number) {
  const gross = 1 + mean / 100;
  const variance = Math.log1p((volatility / 100 / gross) ** 2);
  return {
    mean: Math.log(gross) - variance / 2,
    deviation: Math.sqrt(variance),
  };
}

/** Index of the previous card of the same kind (income/expense), or -1. */
function previousCashflowIndex(cashflows: FireCashflow[], index: number) {
  const kind = cashflows[index].kind;
  for (let cursor = index - 1; cursor >= 0; cursor--) {
    if (cashflows[cursor].kind === kind) return cursor;
  }
  return -1;
}

function cashflowEndAge(
  cashflows: FireCashflow[],
  index: number,
  config: FireConfig,
): number {
  const cashflow = cashflows[index];
  if (cashflow.endAtRetirement) return config.retirementAge - 1;
  if (cashflow.endAtLifeExpectancy) return config.lifeExpectancy;
  const previous = previousCashflowIndex(cashflows, index);
  if (cashflow.endSameAsPrevious && previous >= 0)
    return cashflowEndAge(cashflows, previous, config);
  return cashflow.endAge;
}

function cashflowStartAge(
  cashflows: FireCashflow[],
  index: number,
  config: FireConfig,
): number {
  const cashflow = cashflows[index];
  if (cashflow.startAtCurrentAge) return config.currentAge;
  if (cashflow.startAtRetirement) return config.retirementAge;
  const previous = previousCashflowIndex(cashflows, index);
  if (cashflow.startAfterPrevious && previous >= 0) {
    return Math.min(
      config.lifeExpectancy,
      Math.max(
        config.currentAge,
        cashflowEndAge(cashflows, previous, config) + 1,
      ),
    );
  }
  if (cashflow.startSameAsPrevious && previous >= 0)
    return cashflowStartAge(cashflows, previous, config);
  return cashflow.startAge;
}

function activeCashflows(
  cashflows: FireCashflow[],
  config: FireConfig,
  age: number,
  cpi: number,
) {
  let income = 0;
  let realIncome = 0;
  let realExpense = 0;
  for (let index = 0; index < cashflows.length; index++) {
    const cashflow = cashflows[index];
    if (cashflow.enabled === false) continue;
    const startAge = cashflowStartAge(cashflows, index, config);
    const endAge = cashflowEndAge(cashflows, index, config);
    if (age < startAge || age > endAge) continue;
    const realAmount = cashflow.inflationAdjusted
      ? cashflow.amount
      : cashflow.amount / cpi;
    if (cashflow.kind === "income") {
      realIncome += realAmount;
      income += realAmount * cpi;
    } else {
      realExpense += realAmount;
    }
  }
  return { income, realIncome, realExpense };
}

function sum(portfolio: Portfolio): number {
  return portfolio.stocks + portfolio.bonds + portfolio.cash;
}

function allocate(portfolio: Portfolio, amount: number, config: FireConfig) {
  portfolio.stocks += (amount * config.allocation.stocks) / 100;
  portfolio.bonds += (amount * config.allocation.bonds) / 100;
  portfolio.cash += (amount * config.allocation.cash) / 100;
}

/** Cash is spent first; any shortfall is sold pro rata from stocks and bonds. */
function pay(portfolio: Portfolio, amount: number): boolean {
  const total = sum(portfolio);
  // Decimal inputs and twelve compounded month factors can leave tiny dust.
  const tolerance = Math.max(1e-8, Math.abs(total) * 1e-12);
  if (amount > total + tolerance) return false;
  if (amount >= total) {
    portfolio.stocks = portfolio.bonds = portfolio.cash = 0;
    return true;
  }
  const fromCash = Math.min(portfolio.cash, amount);
  portfolio.cash -= fromCash;
  const remaining = amount - fromCash;
  if (remaining > 0) {
    const invested = portfolio.stocks + portfolio.bonds;
    const fraction = Math.max(0, 1 - remaining / invested);
    portfolio.stocks *= fraction;
    portfolio.bonds *= fraction;
  }
  return true;
}

function runPath(
  config: FireConfig,
  run: number,
  captureDetails = false,
): PathResult {
  const random = randomSource(config.seed, run);
  const normal = normalSource(random);
  const stock = lognormalParameters(config.stockReturn, config.stockVolatility);
  const bond = lognormalParameters(config.bondReturn, config.bondVolatility);
  const inflation = lognormalParameters(
    config.inflationRate,
    config.inflationVolatility,
  );
  const monthlyFeeFactor = (1 - config.managementFee / 100) ** (1 / 12);
  const cashflows = config.cashflows;
  const portfolio: Portfolio = { stocks: 0, bonds: 0, cash: 0 };
  allocate(portfolio, config.initialBalance, config);
  const result: PathResult = {
    real: [config.initialBalance],
    nominal: [config.initialBalance],
    alive: [true],
    failureAge: null,
    finalSpending: 0,
    finalPlan: 0,
    maxSpendingCut: 0,
    maxSpendingCutAge: null,
    retirementPlan: null,
    retirementBalance: null,
    nominalRetirementBalance: null,
    retirementWithdrawalRate: null,
    guardrailInitialRate: null,
    guardrailInitialAge: null,
    details: [],
  };
  let cpi = 1;
  let guardrailMultiplier = 1;
  let guardrailBaselineRate =
    config.guardrailRateMode === "manual"
      ? config.guardrailManualRate / 100
      : null;
  const years = config.lifeExpectancy - config.currentAge;
  const yearsOfEvents = new Map<number, FireEvent[]>();
  for (const event of config.events) {
    if (event.enabled === false) continue;
    const existing = yearsOfEvents.get(event.age) ?? [];
    existing.push(event);
    yearsOfEvents.set(event.age, existing);
  }
  const fail = (age: number) => {
    result.failureAge = age;
    // Failure is permanent, even when a later windfall would restore assets.
    while (result.real.length <= years) {
      result.real.push(0);
      result.nominal.push(0);
      result.alive.push(false);
    }
    return result;
  };

  for (let year = 0; year < years; year += 1) {
    const age = config.currentAge + year;
    const ledger: FireLedgerYear | null = captureDetails
      ? {
          age,
          months: 0,
          failed: false,
          investmentReturnRate: null,
          realInvestmentReturnRate: null,
          assets: emptyLedgerAssets(),
          cpiStart: cpi,
          cpiEnd: cpi,
          guardrailWithdrawalRate: null,
          guardrailRateIsInitial: false,
          guardrailAction: null,
          nominal: emptyLedger(sum(portfolio)),
          real: emptyLedger(sum(portfolio) / cpi),
        }
      : null;
    const record = (key: keyof FireLedgerAmounts, amount: number) => {
      if (!ledger) return;
      ledger.nominal[key] += amount;
      ledger.real[key] += amount / cpi;
    };
    let investmentGrowth = 1;
    let realInvestmentGrowth = 1;
    let investmentMonths = 0;
    const assetGrowth: Record<keyof FireLedgerAssets, AssetGrowth> = {
      stocks: emptyAssetGrowth(),
      bonds: emptyAssetGrowth(),
      cash: emptyAssetGrowth(),
    };
    const closeLedger = (failed = false) => {
      if (!ledger) return;
      ledger.failed = failed;
      ledger.investmentReturnRate = annualizedReturn(
        investmentGrowth,
        investmentMonths,
      );
      ledger.realInvestmentReturnRate = annualizedReturn(
        realInvestmentGrowth,
        investmentMonths,
      );
      const closeAsset = (
        asset: FireLedgerAsset,
        nominal: number,
        growth: AssetGrowth,
      ) => {
        asset.nominal = failed ? 0 : nominal;
        asset.real = asset.nominal / cpi;
        asset.nominalReturnRate = annualizedReturn(
          growth.nominal,
          growth.months,
        );
        asset.realReturnRate = annualizedReturn(growth.real, growth.months);
      };
      closeAsset(ledger.assets.stocks, portfolio.stocks, assetGrowth.stocks);
      closeAsset(ledger.assets.bonds, portfolio.bonds, assetGrowth.bonds);
      closeAsset(ledger.assets.cash, portfolio.cash, assetGrowth.cash);
      ledger.cpiEnd = cpi;
      ledger.nominal.closingBalance = failed ? 0 : sum(portfolio);
      ledger.real.closingBalance = ledger.nominal.closingBalance / cpi;
      result.details.push(ledger);
    };
    const retired = age >= config.retirementAge;
    const active = activeCashflows(cashflows, config, age, cpi);
    const plannedReal = active.realExpense;
    let budgetReal = plannedReal;
    if (retired && config.strategy === "percentage") {
      // Re-set the real budget once per year; within that year it follows CPI.
      budgetReal = (sum(portfolio) * config.withdrawalRate) / 100 / 12 / cpi;
    } else if (retired && config.strategy === "guardrails") {
      const annualNetWithdrawal =
        Math.max(0, guardrailMultiplier * plannedReal - active.realIncome) *
        12 *
        cpi;
      const balance = sum(portfolio);
      if (ledger && balance > 0) {
        ledger.guardrailWithdrawalRate = (annualNetWithdrawal / balance) * 100;
        ledger.guardrailAction = "hold";
      }
      if (guardrailBaselineRate === null) {
        // Income covering consumption does not establish a positive rate.
        if (annualNetWithdrawal > 0 && balance > 0) {
          guardrailBaselineRate = annualNetWithdrawal / balance;
          result.guardrailInitialRate = (annualNetWithdrawal / balance) * 100;
          result.guardrailInitialAge = age;
          if (ledger) ledger.guardrailRateIsInitial = true;
        }
      } else if (balance > 0) {
        const rate = annualNetWithdrawal / balance;
        const previousMultiplier = guardrailMultiplier;
        if (
          rate >
          guardrailBaselineRate * (config.guardrailCutThreshold / 100)
        ) {
          guardrailMultiplier *= 1 - config.guardrailAdjustment / 100;
        } else if (
          rate <
          guardrailBaselineRate * (config.guardrailRaiseThreshold / 100)
        ) {
          guardrailMultiplier *= 1 + config.guardrailAdjustment / 100;
        }
        guardrailMultiplier = Math.max(
          config.guardrailMinSpending / 100,
          Math.min(config.guardrailMaxSpending / 100, guardrailMultiplier),
        );
        if (ledger)
          ledger.guardrailAction =
            guardrailMultiplier > previousMultiplier + 1e-12
              ? "raise"
              : guardrailMultiplier < previousMultiplier - 1e-12
                ? "cut"
                : "hold";
      }
      budgetReal = guardrailMultiplier * plannedReal;
    }
    if (retired && plannedReal > 1e-8) {
      const spendingCut = Math.max(0, (1 - budgetReal / plannedReal) * 100);
      if (spendingCut > result.maxSpendingCut + 1e-8) {
        result.maxSpendingCut = spendingCut;
        result.maxSpendingCutAge = age;
      }
    }
    result.finalSpending = budgetReal;
    result.finalPlan = plannedReal;
    if (age === config.retirementAge) {
      result.retirementPlan = plannedReal;
      const retirementBalance = sum(portfolio);
      result.retirementBalance = retirementBalance / cpi;
      result.nominalRetirementBalance = retirementBalance;
      const annualNetWithdrawalReal =
        Math.max(0, budgetReal - active.realIncome) * 12;
      result.retirementWithdrawalRate =
        annualNetWithdrawalReal <= 1e-8
          ? 0
          : retirementBalance > 0
            ? (annualNetWithdrawalReal / (retirementBalance / cpi)) * 100
            : null;
      if (
        config.strategy === "guardrails" &&
        config.guardrailRateMode === "manual"
      ) {
        result.guardrailInitialRate = config.guardrailManualRate;
        result.guardrailInitialAge = age;
      }
    }

    let annualStockGross = 1;
    let annualBondGross = 1;
    let annualInflationGross = 1;
    if (config.mode === "manual") {
      annualStockGross = 1 + config.stockReturn / 100;
      annualBondGross = 1 + config.bondReturn / 100;
      annualInflationGross = 1 + config.inflationRate / 100;
    }
    const fixedMonthlyStock = annualStockGross ** (1 / 12);
    const fixedMonthlyBond = annualBondGross ** (1 / 12);
    const fixedMonthlyInflation = annualInflationGross ** (1 / 12);
    let stockGain = 0;
    let bondGain = 0;
    for (let month = 0; month < 12; month += 1) {
      const active = activeCashflows(cashflows, config, age, cpi);
      // Re-evaluate plan-derived budgets per month: a cashflow that does not
      // follow inflation stays a fixed nominal amount, so its real plan (and
      // strategy budget) declines as the month's CPI advances. Multiplying the
      // year-start real budget by the current CPI would silently re-inflate it.
      const monthlyBudgetReal =
        retired && config.strategy === "percentage"
          ? budgetReal
          : retired && config.strategy === "guardrails"
            ? guardrailMultiplier * active.realExpense
            : active.realExpense;
      const consumption = monthlyBudgetReal * cpi;
      let eventIncome = 0;
      let eventExpense = 0;
      if (month === 0) {
        for (const event of yearsOfEvents.get(age) ?? []) {
          const amount = event.amount * (event.inflationAdjusted ? cpi : 1);
          if (event.kind === "income") eventIncome += amount;
          else eventExpense += amount;
        }
      }
      const netCashflow =
        active.income + eventIncome - consumption - eventExpense;
      if (ledger) ledger.months = month + 1;
      record("income", active.income);
      record("oneTimeIncome", eventIncome);
      record("plannedSpending", active.realExpense * cpi);
      record("budgetSpending", consumption);
      const available = sum(portfolio) + active.income + eventIncome;
      // A failed month uses available funds for living costs first, then events.
      // Unfunded spending is a shortfall, never a paid expense or negative asset.
      record("spending", Math.min(consumption, available));
      record(
        "oneTimeExpenses",
        Math.min(eventExpense, Math.max(0, available - consumption)),
      );
      record("contributions", Math.max(0, netCashflow));
      record(
        "withdrawals",
        Math.min(sum(portfolio), Math.max(0, -netCashflow)),
      );
      if (netCashflow > 0) allocate(portfolio, netCashflow, config);
      else if (netCashflow < 0 && !pay(portfolio, -netCashflow)) {
        record("shortfall", Math.max(0, -netCashflow - sum(portfolio)));
        closeLedger(true);
        return fail(age + month / 12);
      }

      const investmentBase = sum(portfolio);
      const stockGross =
        config.mode === "monthly"
          ? Math.exp(
              stock.mean / 12 + (stock.deviation / Math.sqrt(12)) * normal(),
            )
          : fixedMonthlyStock;
      const bondGross =
        config.mode === "monthly"
          ? Math.exp(
              bond.mean / 12 + (bond.deviation / Math.sqrt(12)) * normal(),
            )
          : fixedMonthlyBond;
      const cpiGross =
        config.mode === "monthly"
          ? Math.exp(
              inflation.mean / 12 +
                (inflation.deviation / Math.sqrt(12)) * normal(),
            )
          : fixedMonthlyInflation;
      const stockChange = portfolio.stocks * (stockGross - 1);
      const bondChange = portfolio.bonds * (bondGross - 1);
      stockGain += stockChange;
      bondGain += bondChange;
      const investedFee =
        (portfolio.stocks + stockChange + portfolio.bonds + bondChange) *
        (1 - monthlyFeeFactor);
      portfolio.stocks = (portfolio.stocks + stockChange) * monthlyFeeFactor;
      portfolio.bonds = (portfolio.bonds + bondChange) * monthlyFeeFactor;
      const cashGross =
        config.cashMode === "none"
          ? 1
          : cpiGross *
            (config.cashMode === "real"
              ? (1 + config.cashRealReturn / 100) ** (1 / 12)
              : 1);
      const cashChange = portfolio.cash * (cashGross - 1);
      const grossInvestmentGain = stockChange + bondChange + cashChange;
      if (investmentBase > 1e-8) {
        const monthlyGrowth = 1 + grossInvestmentGain / investmentBase;
        investmentGrowth *= monthlyGrowth;
        realInvestmentGrowth *= monthlyGrowth / cpiGross;
        investmentMonths += 1;
      }
      if (portfolio.stocks > 1e-8) {
        assetGrowth.stocks.nominal *= stockGross;
        assetGrowth.stocks.real *= stockGross / cpiGross;
        assetGrowth.stocks.months += 1;
      }
      if (portfolio.bonds > 1e-8) {
        assetGrowth.bonds.nominal *= bondGross;
        assetGrowth.bonds.real *= bondGross / cpiGross;
        assetGrowth.bonds.months += 1;
      }
      if (portfolio.cash > 1e-8) {
        assetGrowth.cash.nominal *= cashGross;
        assetGrowth.cash.real *= cashGross / cpiGross;
        assetGrowth.cash.months += 1;
      }
      record("investmentGain", grossInvestmentGain);
      record(
        "fees",
        investedFee + (portfolio.cash + cashChange) * (1 - monthlyFeeFactor),
      );
      portfolio.cash *= cashGross * monthlyFeeFactor;
      if (ledger) {
        // This term reconciles real opening assets and transaction-time flows
        // with closing assets at the new month's purchasing power.
        ledger.real.inflationEffect +=
          sum(portfolio) / (cpi * cpiGross) - sum(portfolio) / cpi;
      }
      cpi *= cpiGross;
      if (month === 11) {
        // A simple annual levy on positive net investment P&L per asset class.
        // It is independent of contributions and is not a capital-gains model.
        const tax =
          (Math.max(0, stockGain) * config.stockTax) / 100 +
          (Math.max(0, bondGain) * config.bondTax) / 100;
        record("taxes", Math.min(tax, sum(portfolio)));
        if (tax > 0 && !pay(portfolio, tax)) {
          record("shortfall", Math.max(0, tax - sum(portfolio)));
          closeLedger(true);
          return fail(age + 1);
        }
      }
      if (
        config.rebalanceMonths > 0 &&
        (year * 12 + month + 1) % config.rebalanceMonths === 0
      ) {
        const amount = sum(portfolio);
        portfolio.stocks = portfolio.bonds = portfolio.cash = 0;
        allocate(portfolio, amount, config);
      }
    }
    const balance = sum(portfolio);
    result.nominal.push(balance);
    result.real.push(balance / cpi);
    result.alive.push(true);
    closeLedger();
  }
  return result;
}

/** Linear interpolation between adjacent order statistics. */
function percentile(sorted: number[], fraction: number): number {
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  return (
    sorted[lower] +
    (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower)
  );
}

function balanceStatistics(values: number[]): BalanceStatistics | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    mean: sorted.reduce((total, value) => total + value, 0) / sorted.length,
    median: percentile(sorted, 0.5),
    p25: percentile(sorted, 0.25),
    p75: percentile(sorted, 0.75),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function withdrawalRateStatistics(
  values: Array<number | null>,
): RetirementWithdrawalRateStatistics | null {
  const sorted = values
    .filter(
      (value): value is number =>
        value !== null && Number.isFinite(value),
    )
    .sort((a, b) => a - b);
  return sorted.length
    ? {
        min: sorted[0],
        p10: percentile(sorted, 0.1),
        p25: percentile(sorted, 0.25),
        median: percentile(sorted, 0.5),
        p75: percentile(sorted, 0.75),
        p90: percentile(sorted, 0.9),
        max: sorted[sorted.length - 1],
        count: sorted.length,
      }
    : null;
}

function summarize(config: FireConfig, paths: PathResult[]): FireResult {
  const successful = paths.filter((path) => path.failureAge === null);
  const years: FireYear[] = [];
  const nominalYears: FireYear[] = [];
  const balanceDistributions: BalanceDistribution[] = [];
  const nominalBalanceDistributions: BalanceDistribution[] = [];
  for (
    let year = 0;
    year <= config.lifeExpectancy - config.currentAge;
    year += 1
  ) {
    const alive = paths.filter((path) => path.alive[year]).length;
    const yearStatistics = (
      field: "real" | "nominal",
    ): { year: FireYear; distribution: BalanceDistribution } => {
      const balances = paths
        .map((path) => path[field][year])
        .sort((a, b) => a - b);
      return {
        year: {
          age: config.currentAge + year,
          min: balances[0],
          p10: percentile(balances, 0.1),
          p25: percentile(balances, 0.25),
          p50: percentile(balances, 0.5),
          p75: percentile(balances, 0.75),
          p90: percentile(balances, 0.9),
          max: balances[balances.length - 1],
          successRate: (alive / paths.length) * 100,
        },
        distribution: buildBalanceDistribution(balances),
      };
    };
    const realYear = yearStatistics("real");
    const nominalYear = yearStatistics("nominal");
    years.push(realYear.year);
    nominalYears.push(nominalYear.year);
    balanceDistributions.push(realYear.distribution);
    nominalBalanceDistributions.push(nominalYear.distribution);
  }
  const failureAges = paths
    .flatMap((path) => (path.failureAge === null ? [] : [path.failureAge]))
    .sort((a, b) => a - b);
  const failureAgeStatistics: FailureAgeStatistics | null = failureAges.length
    ? {
        min: failureAges[0],
        p10: percentile(failureAges, 0.1),
        p25: percentile(failureAges, 0.25),
        median: percentile(failureAges, 0.5),
        p75: percentile(failureAges, 0.75),
        p90: percentile(failureAges, 0.9),
        max: failureAges[failureAges.length - 1],
      }
    : null;
  const spending = successful
    .map((path) => path.finalSpending)
    .sort((a, b) => a - b);
  const retirementPlans = paths
    .map((path) => path.retirementPlan)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const retirementWithdrawalRate = withdrawalRateStatistics(
    paths.map((path) => path.retirementWithdrawalRate),
  );
  const guardrailInitialRate = withdrawalRateStatistics(
    paths.map((path) => path.guardrailInitialRate),
  );
  const spendingRatios = successful
    .map((path) =>
      path.finalPlan > 0 ? (path.finalSpending / path.finalPlan) * 100 : null,
    )
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const spendingCuts = successful
    .map((path) => path.maxSpendingCut)
    .filter((value) => value > 1e-8)
    .sort((a, b) => a - b);
  const cutRuns = spendingCuts.length;
  const pathSummaries = paths.map((path, run) => ({
    run,
    finalBalance: path.real.at(-1) ?? 0,
    nominalFinalBalance: path.nominal.at(-1) ?? 0,
    retirementBalance: path.retirementBalance,
    nominalRetirementBalance: path.nominalRetirementBalance,
    retirementWithdrawalRate: path.retirementWithdrawalRate,
    guardrailInitialRate: path.guardrailInitialRate,
    guardrailInitialAge: path.guardrailInitialAge,
    failureAge: path.failureAge,
    finalSpending: path.finalSpending,
    finalPlan: path.finalPlan,
    finalSpendingPercentOfPlan:
      path.finalPlan > 0 ? (path.finalSpending / path.finalPlan) * 100 : null,
    maxSpendingCut: path.maxSpendingCut,
    maxSpendingCutAge: path.maxSpendingCutAge,
  }));
  // Keep three full samples for API compatibility and existing consumers.
  // The UI instead replays the currently selected path on demand.
  // Never join independently computed yearly percentiles into a cash ledger.
  const ranked = paths
    .map((path, run) => ({ path, run }))
    .sort((a, b) => a.path.real.at(-1)! - b.path.real.at(-1)! || a.run - b.run);
  const samples =
    config.mode === "manual"
      ? ([[0, "手动情景"]] as const)
      : ([
          [0.1, "最终余额较低样本"],
          [0.5, "最终余额居中样本"],
          [0.9, "最终余额较高样本"],
        ] as const);
  const detailPaths = samples.map(([fraction, label]) => {
    const { run } = ranked[Math.round((ranked.length - 1) * fraction)];
    const detailed = runPath(config, run, true);
    return {
      label,
      run,
      failureAge: detailed.failureAge,
      years: detailed.details,
    };
  });
  return {
    config,
    successRate: (successful.length / paths.length) * 100,
    successfulRuns: successful.length,
    totalRuns: paths.length,
    years,
    nominalYears,
    balanceDistributions,
    nominalBalanceDistributions,
    initialPlan: retirementPlans.length ? percentile(retirementPlans, 0.5) : 0,
    retirementWithdrawalRate,
    guardrailInitialRate,
    finalBalance: balanceStatistics(
      successful.map((path) => path.real[path.real.length - 1]),
    ),
    nominalFinalBalance: balanceStatistics(
      successful.map((path) => path.nominal[path.nominal.length - 1]),
    ),
    finalSpending: spending.length
      ? {
          min: spending[0],
          p10: percentile(spending, 0.1),
          p25: percentile(spending, 0.25),
          median: percentile(spending, 0.5),
          p75: percentile(spending, 0.75),
          p90: percentile(spending, 0.9),
          max: spending[spending.length - 1],
          medianPercentOfPlan: spendingRatios.length
            ? percentile(spendingRatios, 0.5)
            : null,
          cutRuns,
          cutsRate: (cutRuns / successful.length) * 100,
          maxCut: spendingCuts.length
            ? {
                min: spendingCuts[0],
                p10: percentile(spendingCuts, 0.1),
                p25: percentile(spendingCuts, 0.25),
                median: percentile(spendingCuts, 0.5),
                p75: percentile(spendingCuts, 0.75),
                p90: percentile(spendingCuts, 0.9),
                max: spendingCuts[spendingCuts.length - 1],
                count: spendingCuts.length,
              }
            : null,
        }
      : null,
    failureAges,
    failureAgeStatistics,
    medianFailureAge: failureAgeStatistics?.median ?? null,
    detailPaths,
    pathSummaries,
  };
}

function validatedSnapshot(config: FireConfig): FireConfig {
  const upgraded = upgradeFireConfig(config);
  const errors = validateFireConfig(upgraded);
  if (errors.length) throw new Error(errors.join("；"));
  return {
    ...upgraded,
    allocation: { ...upgraded.allocation },
    cashflows: upgraded.cashflows.map((cashflow) => ({ ...cashflow })),
    events: upgraded.events.map((event) => ({ ...event })),
  };
}

/** Deterministic entry point for small jobs, tests and non-UI callers. */
export function simulateFire(config: FireConfig): FireResult {
  const snapshot = validatedSnapshot(config);
  const count = snapshot.mode === "manual" ? 1 : snapshot.simulations;
  const paths = Array.from({ length: count }, (_, index) =>
    runPath(snapshot, index),
  );
  return summarize(snapshot, paths);
}

/** Replay one deterministic path with its full monthly ledger. */
export function simulateFirePath(
  config: FireConfig,
  run: number,
): FireDetailPath {
  const snapshot = validatedSnapshot(config);
  const count = snapshot.mode === "manual" ? 1 : snapshot.simulations;
  if (!Number.isInteger(run) || run < 0 || run >= count)
    throw new Error(`路径编号必须在 1 到 ${count} 之间`);
  const detailed = runPath(snapshot, run, true);
  return {
    label: snapshot.mode === "manual" ? "手动情景" : `第 ${run + 1} 条路径`,
    run,
    failureAge: detailed.failureAge,
    years: detailed.details,
  };
}

/** Cooperative batches keep the plugin responsive without a worker dependency. */
export async function simulateFireAsync(
  config: FireConfig,
  options: SimulationOptions = {},
): Promise<FireResult> {
  const snapshot = validatedSnapshot(config);
  const count = snapshot.mode === "manual" ? 1 : snapshot.simulations;
  const batchSize = Math.max(1, Math.min(100, options.batchSize ?? 25));
  const paths: PathResult[] = [];
  // Yield until the browser paints so every reported batch is actually
  // visible; otherwise rapid batches coalesce into one final jump.
  const yieldForPaint = () =>
    new Promise<void>((resolve) => {
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(() => resolve());
      else setTimeout(resolve, 16);
    });
  const checkCancellation = () => {
    if (options.isCancelled?.()) {
      const error = new Error("模拟已取消");
      error.name = "AbortError";
      throw error;
    }
  };
  options.onProgress?.(0);
  for (let run = 0; run < count; run += 1) {
    checkCancellation();
    paths.push(runPath(snapshot, run));
    if ((run + 1) % batchSize === 0 || run === count - 1) {
      options.onProgress?.(((run + 1) / count) * 95);
      await yieldForPaint();
    }
  }
  checkCancellation();
  const result = summarize(snapshot, paths);
  options.onProgress?.(100);
  return result;
}
