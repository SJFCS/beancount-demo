import { useMemo, useState } from "react";
import { Icon, PanelHeading } from "./components";
import {
  compactNumber,
  formatMoney,
  formatNumber,
  rowsForCurrency,
} from "./model";
import type { RulePlan, ScheduleRow } from "./types";

type MonthPoint = {
  month: string;
  expense: number;
  closing: number;
};

const WIDTH = 900;
const HEIGHT = 250;
const PADDING = { top: 24, right: 22, bottom: 42, left: 66 };

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function buildPoints(rules: RulePlan[], rows: ScheduleRow[]): MonthPoint[] {
  const months = [...new Set(rows.map((row) => monthKey(row.date)))].sort();
  const expenses = new Map<string, number>();
  for (const row of rows) {
    const key = monthKey(row.date);
    expenses.set(key, (expenses.get(key) ?? 0) + Number(row.amount));
  }
  const cursors = new Map(rules.map((rule) => [rule.ruleId, 0]));
  return months.map((month) => {
    let closing = 0;
    for (const rule of rules) {
      let cursor = cursors.get(rule.ruleId) ?? 0;
      while (rule.rows[cursor] && monthKey(rule.rows[cursor].date) <= month) {
        cursor += 1;
      }
      cursors.set(rule.ruleId, cursor);
      const latest = cursor > 0 ? rule.rows[cursor - 1] : undefined;
      closing += latest
        ? Number(latest.closingBalance)
        : Number(rule.totalAmount);
    }
    return {
      month,
      expense: expenses.get(month) ?? 0,
      closing,
    };
  });
}

function yTicks(maximum: number): number[] {
  const safe = maximum > 0 ? maximum : 1;
  return [safe, safe / 2, 0];
}

function xIndices(count: number): number[] {
  if (count <= 1) return [0];
  const target = Math.min(7, count);
  const result = new Set<number>();
  for (let index = 0; index < target; index += 1) {
    result.add(Math.round((index * (count - 1)) / (target - 1)));
  }
  return [...result].sort((left, right) => left - right);
}

function ExpenseChart({
  points,
  currency,
}: {
  points: MonthPoint[];
  currency: string;
}) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maximum = Math.max(...points.map((point) => point.expense), 1);
  const barWidth = Math.max(
    3,
    Math.min(24, (plotWidth / points.length) * 0.56),
  );
  return (
    <svg
      className="pr-chart-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`${currency} 每期入账金额柱状图`}
    >
      <title>{currency} 每期入账金额</title>
      <desc>按月汇总所有启用规则每期的费用金额。</desc>
      <defs>
        <linearGradient id="pr-bar-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cb684f" />
          <stop offset="1" stopColor="#e3a16f" />
        </linearGradient>
      </defs>
      {yTicks(maximum).map((tick, index) => {
        const y = PADDING.top + (plotHeight * (maximum - tick)) / maximum;
        return (
          <g key={`${tick}-${index}`}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={WIDTH - PADDING.right}
              y2={y}
              className="pr-chart-grid"
            />
            <text
              x={PADDING.left - 10}
              y={y + 4}
              textAnchor="end"
              className="pr-chart-axis"
            >
              {compactNumber(tick)}
            </text>
          </g>
        );
      })}
      {points.map((point, index) => {
        const x =
          PADDING.left +
          (plotWidth * (index + 0.5)) / Math.max(points.length, 1);
        const height = (plotHeight * point.expense) / maximum;
        return (
          <rect
            key={point.month}
            x={x - barWidth / 2}
            y={PADDING.top + plotHeight - height}
            width={barWidth}
            height={Math.max(height, point.expense > 0 ? 1.5 : 0)}
            rx={Math.min(5, barWidth / 3)}
            fill="url(#pr-bar-gradient)"
          >
            <title>
              {point.month} · {formatMoney(point.expense, currency)}
            </title>
          </rect>
        );
      })}
      {xIndices(points.length).map((index) => {
        const point = points[index];
        const x =
          PADDING.left +
          (plotWidth * (index + 0.5)) / Math.max(points.length, 1);
        return (
          <text
            key={point.month}
            x={x}
            y={HEIGHT - 15}
            textAnchor="middle"
            className="pr-chart-axis is-x"
          >
            {point.month}
          </text>
        );
      })}
      <line
        x1={PADDING.left}
        y1={PADDING.top + plotHeight}
        x2={WIDTH - PADDING.right}
        y2={PADDING.top + plotHeight}
        className="pr-chart-baseline"
      />
    </svg>
  );
}

function BalanceChart({
  points,
  currency,
}: {
  points: MonthPoint[];
  currency: string;
}) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maximum = Math.max(...points.map((point) => point.closing), 1);
  const coordinates = points.map((point, index) => ({
    x: PADDING.left + (plotWidth * (index + 0.5)) / Math.max(points.length, 1),
    y: PADDING.top + (plotHeight * (maximum - point.closing)) / maximum,
    point,
  }));
  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath = coordinates.length
    ? `${linePath} L${coordinates.at(-1)!.x},${PADDING.top + plotHeight} L${coordinates[0].x},${PADDING.top + plotHeight} Z`
    : "";
  return (
    <svg
      className="pr-chart-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`${currency} 剩余账面价值折线图`}
    >
      <title>{currency} 剩余账面价值</title>
      <desc>
        逐期扣减摊销或折旧后的剩余计划成本，期末等于预估残值；显式 total
        未纳入计划的部分不计入此曲线。
      </desc>
      <defs>
        <linearGradient id="pr-area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d7061" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2d7061" stopOpacity="0.015" />
        </linearGradient>
      </defs>
      {yTicks(maximum).map((tick, index) => {
        const y = PADDING.top + (plotHeight * (maximum - tick)) / maximum;
        return (
          <g key={`${tick}-${index}`}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={WIDTH - PADDING.right}
              y2={y}
              className="pr-chart-grid"
            />
            <text
              x={PADDING.left - 10}
              y={y + 4}
              textAnchor="end"
              className="pr-chart-axis"
            >
              {compactNumber(tick)}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#pr-area-gradient)" />
      <path d={linePath} className="pr-chart-line" />
      {coordinates.map(({ x, y, point }) => (
        <circle key={point.month} cx={x} cy={y} r="3.4">
          <title>
            {point.month} · 剩余 {formatMoney(point.closing, currency)}
          </title>
        </circle>
      ))}
      {xIndices(points.length).map((index) => {
        const point = points[index];
        const x =
          PADDING.left +
          (plotWidth * (index + 0.5)) / Math.max(points.length, 1);
        return (
          <text
            key={point.month}
            x={x}
            y={HEIGHT - 15}
            textAnchor="middle"
            className="pr-chart-axis is-x"
          >
            {point.month}
          </text>
        );
      })}
      <line
        x1={PADDING.left}
        y1={PADDING.top + plotHeight}
        x2={WIDTH - PADDING.right}
        y2={PADDING.top + plotHeight}
        className="pr-chart-baseline"
      />
    </svg>
  );
}

export function ScheduleChart({
  rules,
  rows,
  currencies,
  primaryCurrency,
  updating,
}: {
  rules: RulePlan[];
  rows: ScheduleRow[];
  currencies: string[];
  primaryCurrency: string;
  updating: boolean;
}) {
  const initialCurrency = currencies.includes(primaryCurrency)
    ? primaryCurrency
    : (currencies[0] ?? primaryCurrency);
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const currency = currencies.includes(selectedCurrency)
    ? selectedCurrency
    : initialCurrency;
  const currencyRows = rowsForCurrency(rows, currency);
  const currencyRules = rules.filter((rule) => rule.currency === currency);
  const points = useMemo(
    () =>
      buildPoints(
        rules.filter((rule) => rule.currency === currency),
        rowsForCurrency(rows, currency),
      ),
    [currency, rows, rules],
  );
  const scheduled = currencyRules.reduce(
    (total, rule) => total + Number(rule.scheduledTotal),
    0,
  );
  const next = currencyRules
    .flatMap((rule) => rule.rows)
    .filter((row) => row.period === 1)
    .map((row) => row.date)
    .sort()[0];

  return (
    <section className="pr-panel pr-chart-panel" aria-busy={updating}>
      <PanelHeading
        eyebrow="Forecast"
        title="计划曲线"
        description="柱形为当月内存计划入账，折线为全部规则合计的剩余账面价值。图表只合并同一币种，避免把不同单位直接相加。"
        actions={
          currencies.length > 1 ? (
            <label className="pr-currency-select">
              <span>查看币种</span>
              <select
                value={currency}
                onChange={(event) => setSelectedCurrency(event.target.value)}
              >
                {currencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="pr-unit-chip">{currency}</span>
          )
        }
      />
      {currencyRows.length === 0 ? (
        <div className="pr-chart-empty">
          <Icon name="chart" size={28} />
          <strong>暂无计划曲线</strong>
          <p>在账本元数据中写一条完整规则后，曲线会在这里出现。</p>
        </div>
      ) : (
        <div className={`pr-chart-content${updating ? " is-updating" : ""}`}>
          <div className="pr-chart-meta">
            <span>
              <b>{currencyRules.length}</b> 条规则
            </span>
            <span>
              <b>{currencyRows.length}</b> 期分录
            </span>
            <span>
              计划入账 <b>{formatMoney(scheduled, currency)}</b>
            </span>
            <span>
              首次入账 <b>{next ?? "—"}</b>
            </span>
          </div>
          <div className="pr-chart-block">
            <div className="pr-chart-caption">
              <span>每期费用</span>
              <small>同月多条规则已汇总</small>
            </div>
            <ExpenseChart points={points} currency={currency} />
          </div>
          <div className="pr-chart-block is-balance">
            <div className="pr-chart-caption">
              <span>剩余计划成本</span>
              <small>
                期末残值{" "}
                {formatNumber(
                  currencyRules.reduce(
                    (total, rule) => total + Number(rule.residualValue),
                    0,
                  ),
                )}{" "}
                {currency}
              </small>
            </div>
            <BalanceChart points={points} currency={currency} />
          </div>
        </div>
      )}
    </section>
  );
}
