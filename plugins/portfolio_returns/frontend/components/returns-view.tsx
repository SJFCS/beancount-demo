import { Fragment } from "react";
import { BarChart } from "../charts";
import { formatMoney, formatPercent, toneForValue } from "../format";
import type { MetricName, Report } from "../types";
import { Empty, MetricSelect, Panel, metricText } from "./ui";

const MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function heatColor(
  value: number,
  max: number,
  scheme: "green-red" | "red-green",
  metric: MetricName,
): string {
  if (Math.abs(value) < 1e-12) return "var(--pf-soft)";
  const strength = Math.min(1, Math.abs(value) / Math.max(max, 1e-9));
  const opacity = 0.1 + strength * 0.42;
  let tone = toneForValue(value, scheme);
  if (metric === "mdd") tone = "loss";
  return tone === "profit"
    ? `color-mix(in srgb, var(--pf-green) ${Math.round(opacity * 100)}%, transparent)`
    : `color-mix(in srgb, var(--pf-red) ${Math.round(opacity * 100)}%, transparent)`;
}

export function ReturnsView({
  report,
  metric,
  setMetric,
  currency,
  scheme,
}: {
  report: Report;
  metric: MetricName;
  setMetric(value: MetricName): void;
  currency: string;
  scheme: "green-red" | "red-green";
}) {
  if (report.series.values.length === 0) {
    return (
      <Panel title="收益指标">
        <Empty title="暂无收益数据" />
      </Panel>
    );
  }
  const formatter = (value: number) => metricText(metric, value, currency);
  const compact = (value: number) =>
    metric === "pnl"
      ? formatMoney(value, currency, true)
      : formatPercent(value, 1);
  const monthValues = report.intervals.heatmap.filter((item) =>
    item.label.includes("-"),
  );
  const max = Math.max(
    1e-9,
    ...monthValues.map((item) => Math.abs(item.value)),
  );
  const years = [
    ...new Set(
      report.intervals.heatmap
        .filter((item) => !item.label.includes("-"))
        .map((item) => item.label),
    ),
  ];
  const heatmapMap = new Map(
    report.intervals.heatmap.map((item) => [item.label, item.value]),
  );
  const yearlyMap = new Map(
    report.intervals.yearly.map((item) => [item.label, item.value]),
  );
  return (
    <div className="pf-stack">
      <Panel
        title="月度收益热力图"
        description="每一行是年度，每个格是该月的区间指标；最右侧为全年汇总。"
        action={
          <MetricSelect
            value={metric}
            setValue={setMetric}
            options={[
              { value: "xirr", label: "XIRR" },
              { value: "twr", label: "TWR" },
              { value: "mdm", label: "MDM" },
              { value: "pnl", label: "盈亏" },
            ]}
          />
        }
      >
        <div className="pf-heatmap">
          <div className="pf-heatmap-grid">
            <div className="pf-heatmap-cell header">年份</div>
            {MONTH_LABELS.map((month) => (
              <div className="pf-heatmap-cell header" key={month}>
                {month}
              </div>
            ))}
            <div className="pf-heatmap-cell header">全年</div>
            {years.map((year) => (
              <Fragment key={year}>
                <div className="pf-heatmap-cell year" key={`${year}-label`}>
                  {year}
                </div>
                {MONTH_LABELS.map((_, index) => {
                  const label = `${year}-${String(index + 1).padStart(2, "0")}`;
                  const value = heatmapMap.get(label);
                  return (
                    <div
                      key={label}
                      className={`pf-heatmap-cell${value === undefined ? " empty" : ""}`}
                      style={{
                        background:
                          value === undefined
                            ? undefined
                            : heatColor(value, max, scheme, metric),
                      }}
                      title={
                        value === undefined
                          ? `${label} 无数据`
                          : `${label} ${formatter(value)}`
                      }
                    >
                      {value === undefined ? "·" : compact(value)}
                    </div>
                  );
                })}
                <div
                  className="pf-heatmap-cell year-total"
                  title={`${year} ${formatter(yearlyMap.get(year) ?? 0)}`}
                >
                  {compact(yearlyMap.get(year) ?? 0)}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </Panel>
      <div className="pf-layout">
        <Panel title="年度收益">
          <BarChart
            data={report.intervals.yearly}
            format={(value) =>
              metric === "pnl"
                ? formatMoney(value, currency, true)
                : formatPercent(value, 1)
            }
          />
        </Panel>
        <Panel title="区间收益">
          <BarChart
            data={report.intervals.periods}
            format={(value) =>
              metric === "pnl"
                ? formatMoney(value, currency, true)
                : formatPercent(value, 1)
            }
          />
        </Panel>
      </div>
    </div>
  );
}
