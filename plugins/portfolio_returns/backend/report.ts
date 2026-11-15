import type { PortfolioConfig } from "./config";
import { expandSelection } from "./config";
import {
  analyzePortfolio,
  buildPriceBook,
  heatmapIntervals,
  periodIntervals,
  yearlyIntervals,
} from "./engine";
import type { CashFlow, PortfolioAnalysis, PortfolioValue } from "./engine";
import {
  intervalValues,
  xirr,
  metricValue,
  modifiedDietz,
  periodOpeningValue,
  pnlSeries,
  rebaseSeries,
  returnsSeries,
  seriesForMetric,
  totalPnl,
  twrSeries,
  valueAtDate,
} from "./metrics";
import type { MetricName, SeriesPoint } from "./metrics";
import type { LedgerDirective } from "./types";

type Summary = {
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

type NamedMetric = Summary & {
  id: string;
  name: string;
  currency: string;
};

export type ReportOptions = {
  startDate: string;
  endDate: string;
  currency: string;
  selection: string[];
  compareWith: string[];
  metric: MetricName;
};

export type Report = {
  query: ReportOptions;
  summary: Summary;
  totals: {
    investments: NamedMetric;
  };
  series: {
    values: PortfolioValue[];
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
  investments: NamedMetric[];
  groups: NamedMetric[];
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
  missingPrices: PortfolioAnalysis["missingPrices"];
  warnings: string[];
};

function emptySummary(): Summary {
  return {
    units: [],
    marketValue: 0,
    costValue: 0,
    cashInvested: 0,
    totalPnl: 0,
    realizedPnl: 0,
    unrealizedPnl: 0,
    xirr: 0,
    mdm: 0,
    twr: 0,
    mdd: 0,
    volatility: 0,
    flowCount: 0,
  };
}

function summarize(
  analysis: PortfolioAnalysis,
  startDate: string,
  endDate: string,
): Summary {
  const start = periodOpeningValue(analysis, startDate);
  const end = valueAtDate(analysis.values, endDate);
  if (!start || !end) return emptySummary();
  const units = new Map<string, number>();
  for (const investment of analysis.investments) {
    if (Math.abs(investment.units) <= 1e-12) continue;
    units.set(
      investment.commodity,
      (units.get(investment.commodity) ?? 0) + investment.units,
    );
  }
  const unrealized = end.market - end.cost - (start.market - start.cost);
  const total = totalPnl(analysis.values, startDate, endDate, start);
  return {
    units: [...units.entries()]
      .map(([commodity, value]) => ({ commodity, units: value }))
      .sort((left, right) => left.commodity.localeCompare(right.commodity)),
    marketValue: end.market,
    costValue: end.cost,
    cashInvested: end.cash,
    totalPnl: total,
    realizedPnl: total - unrealized,
    unrealizedPnl: unrealized,
    xirr: xirr(analysis.flows, analysis.values, startDate, endDate),
    mdm: modifiedDietz(analysis.flows, analysis.values, startDate, endDate),
    twr: metricValue("twr", analysis, startDate, endDate),
    mdd: metricValue("mdd", analysis, startDate, endDate),
    volatility: metricValue("volatility", analysis, startDate, endDate),
    flowCount: analysis.flows.filter(
      (flow) => flow.date >= startDate && flow.date <= endDate,
    ).length,
  };
}

function periodOf(date: string, period: "monthly" | "yearly"): string {
  return period === "monthly" ? date.slice(0, 7) : date.slice(0, 4);
}

function cashFlowChart(
  flows: CashFlow[],
  period: "monthly" | "yearly",
): Array<{ date: string; dividend: number; external: number }> {
  const map = new Map<
    string,
    { date: string; dividend: number; external: number }
  >();
  for (const flow of flows) {
    const date = periodOf(flow.date, period);
    const row = map.get(date) ?? { date, dividend: 0, external: 0 };
    if (flow.isDividend) row.dividend += flow.amount;
    else row.external += flow.amount;
    map.set(date, row);
  }
  return [...map.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

function dividendChart(
  analysis: PortfolioAnalysis,
  period: "monthly" | "yearly",
): {
  keys: Array<{ id: string; name: string }>;
  rows: Array<Record<string, string | number>>;
} {
  const names = new Map(
    analysis.investments.map((investment) => [investment.id, investment.name]),
  );
  const keys = analysis.investments.map((investment) => ({
    id: investment.id,
    name: investment.name,
  }));
  const rows = new Map<string, Record<string, string | number>>();
  for (const flow of analysis.flows) {
    if (!flow.isDividend) continue;
    const date = periodOf(flow.date, period);
    const row = rows.get(date) ?? { date };
    row[flow.investmentId] =
      Number(row[flow.investmentId] ?? 0) + Math.abs(flow.amount);
    rows.set(date, row);
  }
  return {
    keys,
    rows: [...rows.values()].sort((left, right) =>
      String(left.date).localeCompare(String(right.date)),
    ),
  };
}

function priceSeries(
  directives: LedgerDirective[],
  commodity: string,
  target: string,
  startDate: string,
  endDate: string,
): SeriesPoint[] {
  if (commodity === target) return [];
  const prices = buildPriceBook(directives);
  const dates = new Set<string>();
  for (const directive of directives) {
    if (directive.type !== "price") continue;
    if (directive.date < startDate || directive.date > endDate) continue;
    if (
      (directive.currency === commodity &&
        directive.amount.currency === target) ||
      (directive.currency === target && directive.amount.currency === commodity)
    )
      dates.add(directive.date);
  }
  return [...dates]
    .sort()
    .map((date) => ({
      date,
      value: prices.rateAt(commodity, target, date) ?? 0,
    }))
    .filter((point) => point.value > 0);
}

export function buildReport(
  directives: LedgerDirective[],
  config: PortfolioConfig,
  options: ReportOptions,
): Report {
  const cache = new Map<string, PortfolioAnalysis>();
  const analyze = (ids: string[]): PortfolioAnalysis => {
    const key = [...ids].sort().join(",");
    let analysis = cache.get(key);
    if (!analysis) {
      analysis = analyzePortfolio(directives, config, {
        startDate: options.startDate,
        endDate: options.endDate,
        currency: options.currency,
        investmentIds: ids,
      });
      cache.set(key, analysis);
    }
    return analysis;
  };

  const selectedIds = expandSelection(config, options.selection);
  const analysis = analyze(selectedIds);
  const summary = summarize(analysis, options.startDate, options.endDate);
  const enabledInvestmentIds = config.investments
    .filter((investment) => investment.enabled)
    .map((investment) => investment.id);
  const investmentsSummary = summarize(
    analyze(enabledInvestmentIds),
    options.startDate,
    options.endDate,
  );
  const investmentReports = config.investments
    .filter((investment) => investment.enabled)
    .map((investment) => {
      const item = analyze([investment.id]);
      return {
        id: investment.id,
        name: investment.name,
        currency: options.currency,
        ...summarize(item, options.startDate, options.endDate),
      };
    });
  const groupReports = config.groups.map((group) => {
    const item = analyze(
      group.investmentIds.filter((id) =>
        config.investments.some(
          (investment) => investment.id === id && investment.enabled,
        ),
      ),
    );
    return {
      id: group.id,
      name: group.name,
      currency: options.currency,
      ...summarize(item, options.startDate, options.endDate),
    };
  });
  const allocationTotal = analysis.investments.reduce(
    (total, investment) => total + Math.max(investment.marketValue, 0),
    0,
  );
  const allocation = analysis.investments
    .filter((investment) => investment.marketValue > 1e-12)
    .map((investment) => ({
      id: investment.id,
      name: investment.name,
      currency: investment.commodity,
      marketValue: investment.marketValue,
      weight:
        allocationTotal > 0 ? investment.marketValue / allocationTotal : 0,
    }))
    .sort((left, right) => right.marketValue - left.marketValue);

  const heatmap = intervalValues(
    analysis,
    options.metric,
    heatmapIntervals(options.startDate, options.endDate),
  );
  const yearly = intervalValues(
    analysis,
    options.metric,
    yearlyIntervals(options.startDate, options.endDate),
  );
  const periods = intervalValues(
    analysis,
    options.metric,
    periodIntervals(options.startDate, options.endDate),
  );

  const compare: Report["compare"]["series"] = [
    {
      name: "组合",
      data: seriesForMetric(options.metric, analysis.values),
      kind: "portfolio",
    },
  ];
  for (const id of options.compareWith) {
    if (id.startsWith("currency:")) {
      const currency = id.slice("currency:".length);
      const prices = priceSeries(
        directives,
        currency,
        options.currency,
        options.startDate,
        options.endDate,
      );
      if (prices.length > 0) {
        compare.push({
          name: `${currency} / ${options.currency}`,
          data: prices.map((point) => ({
            date: point.date,
            value: point.value / prices[0].value - 1,
          })),
          kind: "commodity",
        });
      }
      continue;
    }
    const group = config.groups.find((item) => item.id === id);
    if (group) {
      const groupAnalysis = analyze(group.investmentIds);
      compare.push({
        name: `分组 · ${group.name}`,
        data: seriesForMetric(options.metric, groupAnalysis.values),
        kind: "group",
      });
      continue;
    }
    const investment = config.investments.find((item) => item.id === id);
    if (investment) {
      const item = analyze([investment.id]);
      compare.push({
        name: `账户 · ${investment.name}`,
        data: seriesForMetric(options.metric, item.values),
        kind: "investment",
      });
    }
  }

  let commonDate: string | null = null;
  const seriesWithData = compare.filter((item) => item.data.length > 0);
  if (seriesWithData.length > 0) {
    const latestStart = seriesWithData.reduce(
      (latest, item) =>
        item.data[0].date > latest ? item.data[0].date : latest,
      seriesWithData[0].data[0].date,
    );
    const earliestEnd = seriesWithData.reduce(
      (earliest, item) =>
        item.data.at(-1)!.date < earliest ? item.data.at(-1)!.date : earliest,
      seriesWithData[0].data.at(-1)!.date,
    );
    if (latestStart <= earliestEnd) {
      commonDate = latestStart;
      for (const item of seriesWithData)
        item.data = rebaseSeries(options.metric, item.data, commonDate);
    }
  }

  const missingMap = new Map<
    string,
    PortfolioAnalysis["missingPrices"][number]
  >();
  for (const item of cache.values())
    for (const missing of item.missingPrices)
      missingMap.set(
        `${missing.currency}\0${missing.target}\0${missing.date}`,
        missing,
      );
  const warnings = [
    ...new Set([...cache.values()].flatMap((item) => item.warnings)),
  ];

  return {
    query: options,
    summary,
    totals: {
      investments: {
        id: "all-investments",
        name: "全部投资合计",
        currency: options.currency,
        ...investmentsSummary,
      },
    },
    series: {
      values: analysis.values,
      performance: pnlSeries(analysis.values),
      returns: returnsSeries(analysis.values),
      twr: twrSeries(analysis.values),
      mdd: seriesForMetric("mdd", analysis.values),
    },
    allocation,
    investments: investmentReports,
    groups: groupReports,
    intervals: { heatmap, yearly, periods },
    cashFlows: {
      chart: {
        monthly: cashFlowChart(
          analysis.flows.filter(
            (flow) =>
              flow.date >= options.startDate && flow.date <= options.endDate,
          ),
          "monthly",
        ),
        yearly: cashFlowChart(
          analysis.flows.filter(
            (flow) =>
              flow.date >= options.startDate && flow.date <= options.endDate,
          ),
          "yearly",
        ),
      },
      table: analysis.flows
        .filter(
          (flow) =>
            flow.date >= options.startDate && flow.date <= options.endDate,
        )
        .sort(
          (left, right) =>
            right.date.localeCompare(left.date) ||
            right.key.localeCompare(left.key),
        )
        .map((flow) => ({
          date: flow.date,
          amount: flow.amount,
          isDividend: flow.isDividend,
          source: flow.source,
          investmentId: flow.investmentId,
          account: flow.account,
          transaction: flow.transaction,
        })),
    },
    dividends: {
      monthly: dividendChart(
        {
          ...analysis,
          flows: analysis.flows.filter(
            (flow) =>
              flow.date >= options.startDate && flow.date <= options.endDate,
          ),
        },
        "monthly",
      ),
      yearly: dividendChart(
        {
          ...analysis,
          flows: analysis.flows.filter(
            (flow) =>
              flow.date >= options.startDate && flow.date <= options.endDate,
          ),
        },
        "yearly",
      ),
    },
    compare: { series: compare, commonDate },
    missingPrices: [...missingMap.values()].sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        left.currency.localeCompare(right.currency) ||
        left.target.localeCompare(right.target),
    ),
    warnings,
  };
}
