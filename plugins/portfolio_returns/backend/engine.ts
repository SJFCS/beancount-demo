import type {
  AccountOption,
  Catalog,
  CommodityOption,
  DateRangePreset,
  InvestmentSuggestion,
  PortfolioConfig,
  PortfolioInvestment,
} from "./config";
import { expandSelection } from "./config";
import type {
  LedgerDirective,
  LedgerPosting,
  LedgerTransaction,
} from "./types";

type Transaction = LedgerTransaction;

type PricePoint = {
  date: string;
  rate: number;
};

type PriceBook = {
  rateAt(source: string, target: string, date: string): number | null;
  knownPairs(): Set<string>;
};

export type CashFlow = {
  date: string;
  amount: number;
  isDividend: boolean;
  source: "cash" | "other" | "dividend" | "reinvest";
  investmentId: string;
  account: string;
  transaction: string;
  key: string;
};

export type InvestmentState = {
  id: string;
  name: string;
  assetAccount: string;
  commodity: string;
  units: number;
  costBasis: number;
  costCurrency: string;
  marketValue: number;
  costValue: number;
  flows: CashFlow[];
};

export type PortfolioValue = {
  date: string;
  market: number;
  cost: number;
  cash: number;
};

export type PortfolioAnalysis = {
  investments: InvestmentState[];
  values: PortfolioValue[];
  openingValue: PortfolioValue;
  flows: CashFlow[];
  flowsByInvestment: Record<string, CashFlow[]>;
  warnings: string[];
  missingPrices: Array<{
    currency: string;
    target: string;
    date: string;
  }>;
  firstTransactionDate: string | null;
  valuationDate: string;
};

type InvestmentRuntime = {
  config: PortfolioInvestment;
  units: number;
  costBasis: number;
  costCurrency: string;
  flows: CashFlow[];
};

const FIAT = new Set([
  "USD",
  "EUR",
  "CNY",
  "RMB",
  "JPY",
  "GBP",
  "HKD",
  "TWD",
  "KRW",
  "CAD",
  "AUD",
  "NZD",
  "CHF",
  "SGD",
  "INR",
  "BRL",
  "RUB",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "TRY",
  "ZAR",
]);

const EPSILON = 1e-12;

export function todayIso(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateFromIso(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function addDays(value: string, days: number): string {
  const date = dateFromIso(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addMonths(value: string, months: number): string {
  const date = dateFromIso(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

export function daysBetween(start: string, end: string): number {
  return Math.round(
    (dateFromIso(end).getTime() - dateFromIso(start).getTime()) / 86_400_000,
  );
}

export function rangeDates(
  preset: DateRangePreset,
  firstDate: string,
  lastDate: string,
): { startDate: string; endDate: string } {
  const endDate = lastDate;
  let startDate = firstDate;
  switch (preset) {
    case "3M":
      startDate = addMonths(endDate, -3);
      break;
    case "6M":
      startDate = addMonths(endDate, -6);
      break;
    case "YTD":
      startDate = `${endDate.slice(0, 4)}-01-01`;
      break;
    case "1Y":
      startDate = addMonths(endDate, -12);
      break;
    case "2Y":
      startDate = addMonths(endDate, -24);
      break;
    case "3Y":
      startDate = addMonths(endDate, -36);
      break;
    case "5Y":
      startDate = addMonths(endDate, -60);
      break;
    case "10Y":
      startDate = addMonths(endDate, -120);
      break;
    case "MAX":
      startDate = firstDate;
      break;
  }
  return {
    startDate: startDate < firstDate ? firstDate : startDate,
    endDate,
  };
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function monthEnd(year: number, month: number): string {
  return isoDate(new Date(Date.UTC(year, month, 0)));
}

export function heatmapIntervals(
  startDate: string,
  endDate: string,
): Array<{ label: string; startDate: string; endDate: string }> {
  const result: Array<{ label: string; startDate: string; endDate: string }> =
    [];
  const startYear = Number(startDate.slice(0, 4));
  const endYear = Number(endDate.slice(0, 4));
  for (let year = startYear; year <= endYear; year += 1) {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    result.push({
      label: String(year),
      startDate: yearStart < startDate ? startDate : yearStart,
      endDate: yearEnd > endDate ? endDate : yearEnd,
    });
    for (let month = 1; month <= 12; month += 1) {
      const inMonthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const inMonthEnd = monthEnd(year, month);
      if (inMonthEnd < startDate || inMonthStart > endDate) continue;
      result.push({
        label: `${year}-${String(month).padStart(2, "0")}`,
        startDate: inMonthStart < startDate ? startDate : inMonthStart,
        endDate: inMonthEnd > endDate ? endDate : inMonthEnd,
      });
    }
  }
  return result.filter((item) => item.startDate <= item.endDate);
}

export function yearlyIntervals(
  startDate: string,
  endDate: string,
): Array<{ label: string; startDate: string; endDate: string }> {
  return heatmapIntervals(startDate, endDate).filter(
    (item) => !item.label.includes("-"),
  );
}

export function periodIntervals(
  startDate: string,
  endDate: string,
): Array<{ label: string; startDate: string; endDate: string }> {
  const candidates = [
    ["3M", addMonths(endDate, -3)],
    ["6M", addMonths(endDate, -6)],
    ["YTD", `${endDate.slice(0, 4)}-01-01`],
    ["1Y", addMonths(endDate, -12)],
    ["2Y", addMonths(endDate, -24)],
    ["3Y", addMonths(endDate, -36)],
    ["4Y", addMonths(endDate, -48)],
    ["5Y", addMonths(endDate, -60)],
    ["10Y", addMonths(endDate, -120)],
    ["15Y", addMonths(endDate, -180)],
    ["MAX", startDate],
  ] as const;
  return candidates
    .filter(([, start]) => start >= startDate)
    .map(([label, start]) => ({
      label,
      startDate: start,
      endDate,
    }));
}

function latestPoint(
  points: PricePoint[] | undefined,
  date: string,
): PricePoint | null {
  if (!points?.length) return null;
  let low = 0;
  let high = points.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (points[middle].date <= date) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found < 0 ? null : points[found];
}

function addPrice(
  map: Map<string, PricePoint[]>,
  source: string,
  target: string,
  date: string,
  rate: number,
) {
  if (
    source === target ||
    !source ||
    !target ||
    !Number.isFinite(rate) ||
    rate <= 0
  )
    return;
  const key = `${source}\0${target}`;
  const points = map.get(key) ?? [];
  const existing = points.find((item) => item.date === date);
  if (existing) existing.rate = rate;
  else points.push({ date, rate });
  map.set(key, points);
}

function costPerUnit(
  posting: LedgerPosting,
  absoluteUnits: number,
): { number: number; currency: string } | null {
  const cost = posting.cost;
  if (!cost || !cost.currency || !cost.number || absoluteUnits <= 0)
    return null;
  let number = 0;
  if (cost.number.kind === "per_unit") number = Number(cost.number.value);
  else if (cost.number.kind === "total")
    number = Number(cost.number.value) / absoluteUnits;
  else if (cost.number.kind === "compound")
    number =
      Number(cost.number.per_unit) + Number(cost.number.total) / absoluteUnits;
  else if (cost.number.kind === "per_unit_from_total")
    number = Number(cost.number.per_unit);
  if (!Number.isFinite(number)) return null;
  return { number, currency: cost.currency };
}

export function buildPriceBook(directives: LedgerDirective[]): PriceBook {
  const map = new Map<string, PricePoint[]>();
  const neighbors = new Map<string, Set<string>>();
  for (const directive of directives) {
    if (directive.type === "price") {
      addPrice(
        map,
        directive.currency,
        directive.amount.currency,
        directive.date,
        Number(directive.amount.number),
      );
    }
    if (directive.type !== "transaction") continue;
    for (const posting of directive.postings) {
      if (!posting.units) continue;
      const units = Math.abs(Number(posting.units.number));
      const unitCost = costPerUnit(posting, units);
      if (unitCost)
        addPrice(
          map,
          posting.units.currency,
          unitCost.currency,
          directive.date,
          unitCost.number,
        );
      if (posting.price) {
        addPrice(
          map,
          posting.units.currency,
          posting.price.currency,
          directive.date,
          Number(posting.price.number),
        );
      }
    }
  }
  for (const key of map.keys()) {
    const [source, target] = key.split("\0");
    const sourceNeighbors = neighbors.get(source) ?? new Set<string>();
    sourceNeighbors.add(target);
    neighbors.set(source, sourceNeighbors);
    const targetNeighbors = neighbors.get(target) ?? new Set<string>();
    targetNeighbors.add(source);
    neighbors.set(target, targetNeighbors);
  }
  for (const points of map.values())
    points.sort((left, right) => left.date.localeCompare(right.date));

  const edgeRate = (source: string, target: string, date: string) => {
    const direct = latestPoint(map.get(`${source}\0${target}`), date);
    if (direct) return direct.rate;
    const inverse = latestPoint(map.get(`${target}\0${source}`), date);
    if (inverse && inverse.rate > 0) return 1 / inverse.rate;
    return null;
  };

  return {
    knownPairs() {
      return new Set(map.keys());
    },
    rateAt(source, target, date) {
      if (source === target) return 1;
      const queue: Array<{ currency: string; rate: number; depth: number }> = [
        { currency: source, rate: 1, depth: 0 },
      ];
      const visited = new Set<string>([source]);
      while (queue.length) {
        const current = queue.shift()!;
        if (current.depth >= 5) continue;
        for (const next of neighbors.get(current.currency) ?? []) {
          if (visited.has(next)) continue;
          const rate = edgeRate(current.currency, next, date);
          if (rate === null) continue;
          if (next === target) return current.rate * rate;
          visited.add(next);
          queue.push({
            currency: next,
            rate: current.rate * rate,
            depth: current.depth + 1,
          });
        }
      }
      return null;
    },
  };
}

function transactionLabel(transaction: Transaction): string {
  return `${transaction.payee ?? ""} ${transaction.narration ?? ""}`.trim();
}

function relevantInvestmentIds(
  transaction: Transaction,
  investments: PortfolioInvestment[],
): PortfolioInvestment[] {
  return investments.filter((investment) =>
    transaction.postings.some(
      (posting) =>
        posting.account === investment.assetAccount ||
        investment.dividendAccounts.includes(posting.account),
    ),
  );
}

function selectedAssetAccounts(
  investments: PortfolioInvestment[],
): Set<string> {
  return new Set(investments.map((investment) => investment.assetAccount));
}

function postingWeight(posting: LedgerPosting): {
  number: number;
  currency: string;
} | null {
  if (!posting.units) return null;
  const units = Number(posting.units.number);
  if (!Number.isFinite(units)) return null;
  if (posting.price) {
    const price = Number(posting.price.number);
    if (Number.isFinite(price))
      return {
        number: units * price,
        currency: posting.price.currency,
      };
  }
  return { number: units, currency: posting.units.currency };
}

function convertAmount(
  amount: { number: number; currency: string },
  target: string,
  date: string,
  prices: PriceBook,
): number | null {
  const rate = prices.rateAt(amount.currency, target, date);
  return rate === null ? null : amount.number * rate;
}

function inferCashPostings(
  transaction: Transaction,
  investment: PortfolioInvestment,
  allInvestments: PortfolioInvestment[],
): LedgerPosting[] {
  if (investment.cashAccounts.length > 0) {
    return transaction.postings.filter((posting) =>
      investment.cashAccounts.includes(posting.account),
    );
  }
  const assetAccounts = selectedAssetAccounts(allInvestments);
  return transaction.postings.filter(
    (posting) =>
      (posting.account.startsWith("Assets:") ||
        posting.account.startsWith("Liabilities:")) &&
      !assetAccounts.has(posting.account) &&
      !investment.dividendAccounts.includes(posting.account),
  );
}

function buildTransactionCashFlows(
  transaction: Transaction,
  transactionIndex: number,
  investment: PortfolioInvestment,
  allInvestments: PortfolioInvestment[],
  target: string,
  prices: PriceBook,
  miss: (currency: string, date: string) => void,
): CashFlow[] {
  const hasDividend = transaction.postings.some((posting) =>
    investment.dividendAccounts.includes(posting.account),
  );
  const cashPostings = inferCashPostings(
    transaction,
    investment,
    allInvestments,
  );
  const flows: CashFlow[] = [];
  const label = transactionLabel(transaction);
  for (const [postingIndex, posting] of transaction.postings.entries()) {
    if (!cashPostings.includes(posting)) continue;
    const weight = postingWeight(posting);
    if (!weight) continue;
    const amount = convertAmount(weight, target, transaction.date, prices);
    if (amount === null) {
      miss(weight.currency, transaction.date);
      continue;
    }
    if (Math.abs(amount) <= EPSILON) continue;
    const source = investment.cashAccounts.includes(posting.account)
      ? "cash"
      : "other";
    flows.push({
      date: transaction.date,
      amount,
      isDividend: hasDividend,
      source,
      investmentId: investment.id,
      account: posting.account,
      transaction: label,
      key: `${transactionIndex}:${postingIndex}:${source}`,
    });
  }
  if (hasDividend && cashPostings.length === 0) {
    for (const [postingIndex, posting] of transaction.postings.entries()) {
      if (
        posting.account !== investment.assetAccount ||
        !posting.units ||
        posting.units.currency !== investment.commodity
      )
        continue;
      const weight = postingWeight(posting);
      if (!weight) continue;
      const amount = convertAmount(weight, target, transaction.date, prices);
      if (amount === null) {
        miss(weight.currency, transaction.date);
        continue;
      }
      if (Math.abs(amount) <= EPSILON) continue;
      flows.push({
        date: transaction.date,
        amount,
        isDividend: true,
        source: "dividend",
        investmentId: investment.id,
        account: posting.account,
        transaction: label,
        key: `${transactionIndex}:${postingIndex}:dividend`,
      });
      flows.push({
        date: transaction.date,
        amount: -amount,
        isDividend: false,
        source: "reinvest",
        investmentId: investment.id,
        account: posting.account,
        transaction: label,
        key: `${transactionIndex}:${postingIndex}:reinvest`,
      });
    }
  }
  return flows;
}

function applyAssetPosting(
  runtime: InvestmentRuntime,
  posting: LedgerPosting,
  date: string,
  prices: PriceBook,
  miss: (currency: string, date: string) => void,
) {
  if (
    posting.account !== runtime.config.assetAccount ||
    !posting.units ||
    posting.units.currency !== runtime.config.commodity
  )
    return;
  const quantity = Number(posting.units.number);
  if (!Number.isFinite(quantity) || Math.abs(quantity) <= EPSILON) return;
  if (quantity > 0) {
    const unitCost = costPerUnit(posting, quantity);
    let cost = unitCost?.number ?? null;
    const currency =
      unitCost?.currency ?? runtime.costCurrency ?? runtime.config.commodity;
    if (cost === null) {
      const rate = prices.rateAt(runtime.config.commodity, currency, date);
      if (rate === null) {
        miss(runtime.config.commodity, date);
        cost = 0;
      } else cost = rate;
    }
    runtime.costCurrency = currency;
    runtime.costBasis += quantity * cost;
    runtime.units += quantity;
    return;
  }

  const absolute = Math.abs(quantity);
  const sold = Math.min(absolute, Math.max(runtime.units, 0));
  if (runtime.units > EPSILON)
    runtime.costBasis -= (runtime.costBasis / runtime.units) * sold;
  runtime.units += quantity;
  if (runtime.units <= EPSILON) {
    runtime.units = 0;
    runtime.costBasis = 0;
  } else if (runtime.costBasis < 0) {
    runtime.costBasis = 0;
  }
}

function investmentMarketValue(
  runtime: InvestmentRuntime,
  target: string,
  date: string,
  prices: PriceBook,
  miss: (currency: string, date: string) => void,
): number {
  if (runtime.units <= EPSILON) return 0;
  const rate = prices.rateAt(runtime.config.commodity, target, date);
  if (rate !== null) return runtime.units * rate;
  if (runtime.costCurrency !== target) {
    const costRate = prices.rateAt(runtime.costCurrency, target, date);
    const unitCost =
      runtime.units > EPSILON ? runtime.costBasis / runtime.units : 0;
    if (costRate !== null) {
      miss(runtime.config.commodity, date);
      return runtime.units * unitCost * costRate;
    }
  }
  miss(runtime.config.commodity, date);
  return runtime.costBasis;
}

function investmentCostValue(
  runtime: InvestmentRuntime,
  target: string,
  date: string,
  prices: PriceBook,
  miss: (currency: string, date: string) => void,
): number {
  if (Math.abs(runtime.costBasis) <= EPSILON) return 0;
  const rate = prices.rateAt(runtime.costCurrency, target, date);
  if (rate !== null) return runtime.costBasis * rate;
  miss(runtime.costCurrency, date);
  return runtime.costBasis;
}

function dedupeFlows(flows: CashFlow[]): CashFlow[] {
  const seen = new Set<string>();
  const result: CashFlow[] = [];
  for (const flow of flows) {
    if (seen.has(flow.key)) continue;
    seen.add(flow.key);
    result.push(flow);
  }
  return result.sort(
    (left, right) =>
      left.date.localeCompare(right.date) || left.key.localeCompare(right.key),
  );
}

export function analyzePortfolio(
  directives: LedgerDirective[],
  config: PortfolioConfig,
  options: {
    startDate: string;
    endDate: string;
    currency: string;
    investmentIds: string[];
  },
): PortfolioAnalysis {
  const selectedIds = new Set(options.investmentIds);
  const allEnabled = config.investments.filter((item) => item.enabled);
  const investments = allEnabled.filter((item) => selectedIds.has(item.id));
  const prices = buildPriceBook(directives);
  const warnings = new Set<string>();
  const missing = new Map<
    string,
    { currency: string; target: string; date: string }
  >();
  const miss = (currency: string, date: string) => {
    const key = `${currency}\0${options.currency}\0${date}`;
    if (missing.has(key)) return;
    missing.set(key, {
      currency,
      target: options.currency,
      date,
    });
    if (missing.size <= 20)
      warnings.add(
        `缺少 ${date} 的 ${currency}/${options.currency} 报价，暂以成本或最近可用价格估算。`,
      );
  };

  const transactions = directives
    .map((directive, index) => ({ directive, index }))
    .filter(
      (item): item is { directive: Transaction; index: number } =>
        item.directive.type === "transaction",
    );
  const relevantTransactions = transactions.filter(
    (item) => relevantInvestmentIds(item.directive, investments).length > 0,
  );
  const firstTransactionDate =
    relevantTransactions.length > 0
      ? relevantTransactions[0].directive.date
      : null;

  const runtimes = new Map<string, InvestmentRuntime>();
  for (const investment of investments) {
    runtimes.set(investment.id, {
      config: investment,
      units: 0,
      costBasis: 0,
      costCurrency: options.currency,
      flows: [],
    });
  }
  const flowsByInvestment: Record<string, CashFlow[]> = Object.fromEntries(
    investments.map((investment) => [investment.id, []]),
  );

  const eventDates = new Set<string>();
  for (const item of relevantTransactions) {
    if (item.directive.date <= options.endDate)
      eventDates.add(item.directive.date);
  }
  for (const directive of directives) {
    if (
      directive.type === "price" &&
      directive.date <= options.endDate &&
      directive.date >= (firstTransactionDate ?? options.startDate) &&
      (investments.some(
        (investment) =>
          investment.commodity === directive.currency ||
          investment.commodity === directive.amount.currency,
      ) ||
        directive.currency === options.currency ||
        directive.amount.currency === options.currency)
    )
      eventDates.add(directive.date);
  }
  const dates = [...eventDates].sort();
  const effectiveStart =
    firstTransactionDate && firstTransactionDate > options.startDate
      ? firstTransactionDate
      : options.startDate;
  const transactionsByDate = new Map<
    string,
    Array<{ directive: Transaction; index: number }>
  >();
  for (const item of relevantTransactions) {
    const list = transactionsByDate.get(item.directive.date) ?? [];
    list.push(item);
    transactionsByDate.set(item.directive.date, list);
  }

  const values: PortfolioValue[] = [];
  let started = false;
  const processDate = (date: string) => {
    for (const item of transactionsByDate.get(date) ?? []) {
      const matching = relevantInvestmentIds(item.directive, investments);
      for (const investment of matching) {
        const runtime = runtimes.get(investment.id);
        if (!runtime) continue;
        for (const posting of item.directive.postings)
          applyAssetPosting(runtime, posting, date, prices, miss);
        const flows = buildTransactionCashFlows(
          item.directive,
          item.index,
          investment,
          investments,
          options.currency,
          prices,
          miss,
        );
        runtime.flows.push(...flows);
        flowsByInvestment[investment.id].push(...flows);
      }
    }
  };

  const valueAtDate = (date: string): PortfolioValue => {
    let market = 0;
    let cost = 0;
    for (const runtime of runtimes.values()) {
      market += investmentMarketValue(
        runtime,
        options.currency,
        date,
        prices,
        miss,
      );
      cost += investmentCostValue(
        runtime,
        options.currency,
        date,
        prices,
        miss,
      );
    }
    const allFlows = dedupeFlows(
      [...runtimes.values()].flatMap((runtime) => runtime.flows),
    );
    const cash = -allFlows
      .filter((flow) => flow.date <= date)
      .reduce((total, flow) => total + flow.amount, 0);
    return { date, market, cost, cash };
  };
  const addValue = (date: string) => {
    const current = valueAtDate(date);
    const previous = values.at(-1);
    if (previous?.date === date) {
      values[values.length - 1] = current;
    } else {
      values.push(current);
    }
  };

  let openingValue: PortfolioValue | null = null;
  for (const date of dates) {
    if (date > options.endDate) break;
    if (openingValue === null && date >= options.startDate)
      openingValue = valueAtDate(addDays(options.startDate, -1));
    if (!started && date > effectiveStart) {
      addValue(effectiveStart);
      started = true;
    }
    processDate(date);
    if (date < effectiveStart) continue;
    addValue(date);
    started = true;
  }
  if (!started && firstTransactionDate && effectiveStart <= options.endDate)
    addValue(effectiveStart);
  if (openingValue === null)
    openingValue = valueAtDate(addDays(options.startDate, -1));

  for (const flow of Object.values(flowsByInvestment))
    flow.sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        left.key.localeCompare(right.key),
    );
  const finalStates: InvestmentState[] = investments.map((investment) => {
    const runtime = runtimes.get(investment.id)!;
    return {
      id: investment.id,
      name: investment.name,
      assetAccount: investment.assetAccount,
      commodity: investment.commodity,
      units: runtime.units,
      costBasis: runtime.costBasis,
      costCurrency: runtime.costCurrency,
      marketValue: investmentMarketValue(
        runtime,
        options.currency,
        options.endDate,
        prices,
        miss,
      ),
      costValue: investmentCostValue(
        runtime,
        options.currency,
        options.endDate,
        prices,
        miss,
      ),
      flows: dedupeFlows(runtime.flows),
    };
  });
  return {
    investments: finalStates,
    values,
    openingValue,
    flows: dedupeFlows(
      investments.flatMap((investment) => flowsByInvestment[investment.id]),
    ),
    flowsByInvestment,
    warnings: [...warnings],
    missingPrices: [...missing.values()].sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        left.currency.localeCompare(right.currency),
    ),
    firstTransactionDate,
    valuationDate: options.endDate,
  };
}

function commodityName(
  directive: Extract<LedgerDirective, { type: "commodity" }>,
) {
  const value = directive.meta?.name;
  return typeof value === "string" && value.trim()
    ? value.trim()
    : directive.currency;
}

function collectCatalog(
  directives: LedgerDirective[],
  baseCurrency: string,
): Catalog {
  const accounts = new Map<string, Set<string>>();
  const commodities = new Map<string, string>();
  const currencies = new Set<string>();
  let startDate: string | null = null;
  let endDate: string | null = null;

  const updateRange = (date: string) => {
    if (!startDate || date < startDate) startDate = date;
    if (!endDate || date > endDate) endDate = date;
  };

  for (const directive of directives) {
    if (directive.type === "transaction" || directive.type === "price")
      updateRange(directive.date);
    if (directive.type === "commodity") {
      commodities.set(directive.currency, commodityName(directive));
      currencies.add(directive.currency);
    }
    if (directive.type === "open") {
      const currenciesForAccount = accounts.get(directive.account) ?? new Set();
      for (const currency of directive.currencies)
        currenciesForAccount.add(currency);
      accounts.set(directive.account, currenciesForAccount);
    }
    if (directive.type === "price") {
      currencies.add(directive.currency);
      currencies.add(directive.amount.currency);
    }
    if (directive.type !== "transaction") continue;
    for (const posting of directive.postings) {
      const accountCurrencies = accounts.get(posting.account) ?? new Set();
      if (posting.units) {
        accountCurrencies.add(posting.units.currency);
        currencies.add(posting.units.currency);
      }
      if (posting.cost?.currency) currencies.add(posting.cost.currency);
      if (posting.price) currencies.add(posting.price.currency);
      accounts.set(posting.account, accountCurrencies);
    }
  }

  const suggestionMap = new Map<
    string,
    {
      assetAccount: string;
      commodity: string;
      units: number;
      lastDate: string;
      cashAccounts: Set<string>;
      dividendAccounts: Set<string>;
    }
  >();
  for (const directive of directives) {
    if (directive.type !== "transaction") continue;
    const assetPostings = directive.postings.filter(
      (posting) =>
        posting.units &&
        posting.account.startsWith("Assets:") &&
        !/(?:^|:)Cash$/u.test(posting.account) &&
        posting.account.split(":").length >= 2,
    );
    for (const posting of assetPostings) {
      if (!posting.units) continue;
      const key = `${posting.account}\0${posting.units.currency}`;
      const current = suggestionMap.get(key) ?? {
        assetAccount: posting.account,
        commodity: posting.units.currency,
        units: 0,
        lastDate: directive.date,
        cashAccounts: new Set<string>(),
        dividendAccounts: new Set<string>(),
      };
      current.units += Number(posting.units.number);
      current.lastDate = directive.date;
      for (const other of directive.postings) {
        if (
          other.account.startsWith("Assets:") &&
          /(?:^|:)Cash$/u.test(other.account)
        )
          current.cashAccounts.add(other.account);
        if (
          other.account.startsWith("Income:") &&
          /dividend|interest|income/iu.test(other.account)
        )
          current.dividendAccounts.add(other.account);
      }
      suggestionMap.set(key, current);
    }
  }

  const prices = buildPriceBook(directives);
  const suggestions: InvestmentSuggestion[] = [...suggestionMap.values()]
    .filter(
      (item) =>
        Math.abs(item.units) > EPSILON &&
        item.commodity !== baseCurrency &&
        !FIAT.has(item.commodity),
    )
    .map((item) => {
      const rate = prices.rateAt(item.commodity, baseCurrency, item.lastDate);
      return {
        assetAccount: item.assetAccount,
        commodity: item.commodity,
        name:
          commodities.get(item.commodity) ??
          `${item.assetAccount} (${item.commodity})`,
        cashAccounts: [...item.cashAccounts].sort(),
        dividendAccounts: [...item.dividendAccounts].sort(),
        units: String(item.units),
        marketValue: rate === null ? null : String(item.units * rate),
        lastDate: item.lastDate,
      };
    })
    .sort(
      (left, right) =>
        right.lastDate.localeCompare(left.lastDate) ||
        left.assetAccount.localeCompare(right.assetAccount),
    )
    .slice(0, 200);

  return {
    accounts: [...accounts.entries()]
      .map(([account, accountCurrencies]) => ({
        account,
        currencies: [...accountCurrencies].sort(),
      }))
      .sort((left, right) => left.account.localeCompare(right.account)),
    commodities: [...commodities.entries()]
      .map(([commodity, name]) => ({ commodity, name }))
      .sort((left, right) => left.commodity.localeCompare(right.commodity)),
    currencies: [...currencies].sort(),
    suggestions,
    dateRange: startDate && endDate ? { startDate, endDate } : null,
  };
}

export function scanCatalog(
  directives: LedgerDirective[],
  baseCurrency: string,
): Catalog {
  return collectCatalog(directives, baseCurrency);
}

export function selectionFromConfig(
  config: PortfolioConfig,
  selection: string[],
): string[] {
  return expandSelection(config, selection);
}
