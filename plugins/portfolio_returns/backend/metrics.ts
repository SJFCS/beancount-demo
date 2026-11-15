import type { CashFlow, PortfolioAnalysis, PortfolioValue } from "./engine";
import { addDays, daysBetween } from "./engine";

export type MetricName =
  | "returns"
  | "twr"
  | "pnl"
  | "xirr"
  | "mdm"
  | "mdd"
  | "volatility";
export type SeriesPoint = { date: string; value: number };
export type IntervalMetric = { label: string; value: number };

const EPSILON = 1e-12;

function valueAt(
  values: PortfolioValue[],
  date: string,
): PortfolioValue | null {
  if (values.length === 0 || values[0].date > date)
    return { date, market: 0, cost: 0, cash: 0 };
  let result: PortfolioValue | null = null;
  for (const value of values) {
    if (value.date > date) break;
    result = value;
  }
  return result ?? { date, market: 0, cost: 0, cash: 0 };
}

function valuesInRange(
  values: PortfolioValue[],
  startDate: string,
  endDate: string,
): PortfolioValue[] {
  if (values.length === 0) return [];
  const start = valueAt(values, addDays(startDate, -1));
  if (!start) return [];
  const inside = values.filter(
    (value) => value.date >= startDate && value.date <= endDate,
  );
  return [{ ...start, date: startDate }, ...inside];
}

export function returnsSeries(values: PortfolioValue[]): SeriesPoint[] {
  return values.map((value) => ({
    date: value.date,
    value: value.cost > EPSILON ? value.market / value.cost - 1 : 0,
  }));
}

export function pnlSeries(values: PortfolioValue[]): SeriesPoint[] {
  return values.map((value) => ({
    date: value.date,
    value: value.market - value.cash,
  }));
}

export function twrSeries(values: PortfolioValue[]): SeriesPoint[] {
  if (values.length === 0) return [];
  const result: SeriesPoint[] = [{ date: values[0].date, value: 0 }];
  let cumulative = 1;
  for (let index = 1; index < values.length; index += 1) {
    const current = values[index - 1];
    const next = values[index];
    const cashFlow = next.cash - current.cash;
    const begin = current.market;
    const end = next.market - cashFlow;
    if (Math.abs(begin) <= EPSILON) continue;
    cumulative *= end / begin;
    result.push({ date: next.date, value: cumulative - 1 });
  }
  return result;
}

export function mddSeries(values: PortfolioValue[]): SeriesPoint[] {
  let peak = 1;
  return twrSeries(values).map((point) => {
    const wealth = 1 + point.value;
    peak = Math.max(peak, wealth);
    return {
      date: point.date,
      value: peak > EPSILON ? (wealth - peak) / peak : 0,
    };
  });
}

export function seriesForMetric(
  metric: MetricName,
  values: PortfolioValue[],
): SeriesPoint[] {
  switch (metric) {
    case "returns":
      return returnsSeries(values);
    case "twr":
      return twrSeries(values);
    case "pnl":
      return pnlSeries(values);
    case "mdd":
      return mddSeries(values);
    case "volatility":
      return overValues(values, 365);
    default:
      return [];
  }
}

function overValues(
  values: PortfolioValue[],
  windowDays: number,
): SeriesPoint[] {
  if (values.length === 0) return [];
  const result: SeriesPoint[] = [];
  const startTime = Date.parse(`${values[0].date}T00:00:00Z`);
  const endTime = Date.parse(`${values.at(-1)!.date}T00:00:00Z`);
  const points = Math.min(80, Math.max(2, values.length));
  for (let index = 0; index < points; index += 1) {
    const time = startTime + ((endTime - startTime) * index) / (points - 1);
    const date = new Date(time).toISOString().slice(0, 10);
    const begin = new Date(time - windowDays * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const slice = values.filter(
      (value) => value.date >= begin && value.date <= date,
    );
    result.push({
      date,
      value: slice.length >= 3 ? volatility(slice) : 0,
    });
  }
  return result;
}

export function mdd(values: PortfolioValue[]): number {
  return Math.min(0, ...mddSeries(values).map((point) => point.value));
}

export function volatility(values: PortfolioValue[]): number {
  const series = twrSeries(values);
  if (series.length < 3) return 0;
  const intervals: Array<{ days: number; value: number }> = [];
  for (let index = 2; index < series.length; index += 1) {
    const previous = series[index - 1];
    const current = series[index];
    const growth =
      previous.value + 1 > EPSILON
        ? (current.value + 1) / (previous.value + 1) - 1
        : 0;
    intervals.push({
      days: Math.max(1, daysBetween(previous.date, current.date)),
      value: growth,
    });
  }
  if (intervals.length < 2) return 0;
  const mean =
    intervals.reduce((total, item) => total + item.value, 0) / intervals.length;
  const variance =
    intervals.reduce((total, item) => total + (item.value - mean) ** 2, 0) /
    (intervals.length - 1);
  const meanDays =
    intervals.reduce((total, item) => total + item.days, 0) / intervals.length;
  return Math.sqrt(variance) * Math.sqrt(365 / Math.max(meanDays, 1));
}

function xnpv(
  rate: number,
  flows: Array<{ date: string; amount: number }>,
  endDate: string,
): number {
  const base = 1 + rate;
  if (base <= 0) return Number.NaN;
  let total = 0;
  for (const flow of flows) {
    const years = daysBetween(flow.date, endDate) / 365;
    total += flow.amount * base ** years;
  }
  return total;
}

function findXirrRoot(
  flows: Array<{ date: string; amount: number }>,
  endDate: string,
): number | null {
  const rates: number[] = [];
  for (let index = 1; index <= 80; index += 1) rates.push(-1 + index / 80);
  for (let index = 0; index <= 160; index += 1)
    rates.push(10 ** (-6 + (index / 160) * 11));
  const unique = [...new Set(rates)].sort((left, right) => left - right);
  let previousRate = unique[0];
  let previousValue = xnpv(previousRate, flows, endDate);
  const roots: number[] = [];
  for (let index = 1; index < unique.length; index += 1) {
    const rate = unique[index];
    const value = xnpv(rate, flows, endDate);
    if (
      Number.isFinite(previousValue) &&
      Number.isFinite(value) &&
      previousValue * value <= 0
    ) {
      let low = previousRate;
      let high = rate;
      let lowValue = previousValue;
      for (let iteration = 0; iteration < 100; iteration += 1) {
        const middle = (low + high) / 2;
        const middleValue = xnpv(middle, flows, endDate);
        if (!Number.isFinite(middleValue)) break;
        if (Math.abs(middleValue) < 1e-9) {
          low = middle;
          high = middle;
          break;
        }
        if (lowValue * middleValue <= 0) high = middle;
        else {
          low = middle;
          lowValue = middleValue;
        }
      }
      roots.push((low + high) / 2);
    }
    previousRate = rate;
    previousValue = value;
  }
  if (roots.length === 0) return null;
  return roots.sort((left, right) => Math.abs(left) - Math.abs(right))[0];
}

export function xirr(
  flows: CashFlow[],
  values: PortfolioValue[],
  startDate: string,
  endDate: string,
): number {
  const start = valueAt(values, startDate);
  const end = valueAt(values, endDate);
  if (!start || !end) return 0;
  const dated = flows
    .filter((flow) => flow.date > startDate && flow.date <= endDate)
    .map((flow) => ({ date: flow.date, amount: flow.amount }));
  if (start.market > EPSILON)
    dated.unshift({ date: startDate, amount: -start.market });
  if (end.market > EPSILON) dated.push({ date: endDate, amount: end.market });
  if (dated.length < 2) return 0;
  return Math.max(-1, findXirrRoot(dated, endDate) ?? 0);
}

export function modifiedDietz(
  flows: CashFlow[],
  values: PortfolioValue[],
  startDate: string,
  endDate: string,
): number {
  const start = valueAt(values, startDate);
  const end = valueAt(values, endDate);
  if (!start || !end) return 0;
  const periodDays = Math.max(1, daysBetween(startDate, endDate));
  const relevant = flows.filter(
    (flow) => flow.date > startDate && flow.date <= endDate,
  );
  const netFlow = relevant.reduce((total, flow) => total - flow.amount, 0);
  const weightedFlow = relevant.reduce((total, flow) => {
    const elapsed = daysBetween(startDate, flow.date);
    const weight = (periodDays - elapsed) / periodDays;
    return total - weight * flow.amount;
  }, 0);
  const denominator = start.market + weightedFlow;
  if (Math.abs(denominator) <= EPSILON) return 0;
  return (end.market - start.market - netFlow) / denominator;
}

export function totalPnl(
  values: PortfolioValue[],
  startDate: string,
  endDate: string,
  openingValue?: PortfolioValue | null,
): number {
  const start = openingValue ?? valueAt(values, addDays(startDate, -1));
  const end = valueAt(values, endDate);
  if (!start || !end) return 0;
  return end.market - end.cash - (start.market - start.cash);
}

export function periodOpeningValue(
  analysis: PortfolioAnalysis,
  startDate: string,
): PortfolioValue | null {
  const priorDate = addDays(startDate, -1);
  return analysis.openingValue.date === priorDate
    ? analysis.openingValue
    : valueAt(analysis.values, priorDate);
}

export function metricValue(
  metric: MetricName,
  analysis: PortfolioAnalysis,
  startDate: string,
  endDate: string,
): number {
  switch (metric) {
    case "xirr":
      return xirr(analysis.flows, analysis.values, startDate, endDate);
    case "mdm":
      return modifiedDietz(analysis.flows, analysis.values, startDate, endDate);
    case "twr": {
      const series = twrSeries(
        valuesInRange(analysis.values, startDate, endDate),
      );
      return series.at(-1)?.value ?? 0;
    }
    case "pnl":
      return totalPnl(
        analysis.values,
        startDate,
        endDate,
        periodOpeningValue(analysis, startDate),
      );
    case "mdd":
      return mdd(valuesInRange(analysis.values, startDate, endDate));
    case "volatility":
      return volatility(valuesInRange(analysis.values, startDate, endDate));
    case "returns": {
      const end = valueAt(analysis.values, endDate);
      return end && end.cost > EPSILON ? end.market / end.cost - 1 : 0;
    }
  }
}

export function intervalValues(
  analysis: PortfolioAnalysis,
  metric: MetricName,
  intervals: Array<{ label: string; startDate: string; endDate: string }>,
): IntervalMetric[] {
  return intervals.map((interval) => ({
    label: interval.label,
    value: metricValue(metric, analysis, interval.startDate, interval.endDate),
  }));
}

export function rebaseSeries(
  metric: MetricName,
  series: SeriesPoint[],
  commonDate: string,
): SeriesPoint[] {
  const index = series.findIndex((point) => point.date >= commonDate);
  if (index < 0) return [];
  const truncated = series.slice(index);
  if (truncated.length === 0) return [];
  const base = truncated[0].value;
  if (metric === "twr")
    return truncated.map((point) => ({
      date: point.date,
      value: (point.value + 1) / (base + 1) - 1,
    }));
  return truncated.map((point) => ({
    date: point.date,
    value: point.value - base,
  }));
}

export function valueAtDate(
  values: PortfolioValue[],
  date: string,
): PortfolioValue | null {
  return valueAt(values, date);
}
