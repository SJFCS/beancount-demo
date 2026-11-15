import React, { useId, useMemo } from "react";
import {
  buildSpendingCutBins,
  type SpendingCutBin,
} from "./spending-cut-distribution";
import type { FirePathSummary, FireResult, SpendingStatistics } from "./model";

function percent(value: number, digits = 1) {
  return `${value.toFixed(digits).replace(/\.0$/u, "")}%`;
}

function amount(value: number) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 0,
  });
}

function compactMoney(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 10000)
    return `${(value / 10000).toLocaleString("zh-CN", {
      maximumFractionDigits: 1,
    })}万`;
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function SpendingCutChart({
  bins,
  successfulRuns,
}: {
  bins: SpendingCutBin[];
  successfulRuns: number;
}) {
  const id = useId();
  const width = 900;
  const height = 270;
  const left = 54;
  const right = 18;
  const top = 28;
  const bottom = 54;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const baseline = height - bottom;
  const columnWidth = plotWidth / bins.length;
  const maximumShare = Math.max(0, ...bins.map((bin) => bin.share));
  const scaleMaximum = Math.max(0.05, Math.min(1, maximumShare * 1.14));
  const y = (share: number) => baseline - (share / scaleMaximum) * plotHeight;

  return (
    <div className="fc-spending-cut-chart-wrap">
      <svg
        className="fc-chart fc-spending-cut-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>成功路径消费下调幅度分布</title>
        <desc id={`${id}-desc`}>
          按每条成功路径退休后相对当年计划消费的最大降幅分组。柱高表示该组占全部成功路径的比例，
          未同时列出的下调路径不会虚构为一条逐路径曲线。
        </desc>
        <text x={left} y={13}>
          成功路径占比
        </text>
        <text x={width - right} y={13} textAnchor="end">
          最大降幅
        </text>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const share = scaleMaximum * tick;
          return (
            <g key={tick}>
              <line
                className="fc-grid-line"
                x1={left}
                x2={width - right}
                y1={y(share)}
                y2={y(share)}
              />
              <text x={left - 10} y={y(share) + 3} textAnchor="end">
                {percent(share * 100, 0)}
              </text>
            </g>
          );
        })}
        {bins.map((bin, index) => {
          const barHeight = Math.max(
            bin.count > 0 ? 2 : 0,
            (bin.share / scaleMaximum) * plotHeight,
          );
          const x = left + index * columnWidth + columnWidth * 0.17;
          const barWidth = columnWidth * 0.66;
          return (
            <g key={bin.key} className={`fc-spending-cut-bin is-${bin.key}`}>
              <rect
                x={x}
                y={baseline - barHeight}
                width={barWidth}
                height={barHeight}
                rx="3"
              >
                <title>
                  {bin.label}：{bin.count.toLocaleString("zh-CN")} 条，
                  占成功路径 {percent(bin.share * 100)}
                </title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={Math.max(top + 10, baseline - barHeight - 7)}
                textAnchor="middle"
                className="fc-spending-cut-count"
              >
                {bin.count.toLocaleString("zh-CN")}
              </text>
              <text
                x={left + index * columnWidth + columnWidth / 2}
                y={baseline + 18}
                textAnchor="middle"
                className="fc-spending-cut-bin-label"
              >
                {bin.label}
              </text>
              <text
                x={left + index * columnWidth + columnWidth / 2}
                y={baseline + 34}
                textAnchor="middle"
                className="fc-spending-cut-bin-share"
              >
                {percent(bin.share * 100)}
              </text>
            </g>
          );
        })}
        <line
          className="fc-axis-line"
          x1={left}
          x2={width - right}
          y1={baseline}
          y2={baseline}
        />
      </svg>
      <p className="fc-spending-cut-chart-note">
        分母为全部 {successfulRuns.toLocaleString("zh-CN")}{" "}
        条成功路径；每根柱表示该路径曾经达到的最大降幅，不代表最后一个月的降幅。
      </p>
    </div>
  );
}

function SpendingMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export function SpendingCutCard({
  result,
  statistics,
  currency,
  selectedRun,
  onSelectedRunChange,
}: {
  result: FireResult;
  statistics: SpendingStatistics;
  currency: string;
  selectedRun: number;
  onSelectedRunChange(run: number): void;
}) {
  const id = useId();
  const successful = useMemo(
    () => result.pathSummaries.filter((path) => path.failureAge === null),
    [result.pathSummaries],
  );
  const bins = useMemo(() => buildSpendingCutBins(successful), [successful]);
  const cutPaths = useMemo(
    () =>
      successful
        .filter((path) => path.maxSpendingCut > 1e-8)
        .sort(
          (a, b) =>
            b.maxSpendingCut - a.maxSpendingCut ||
            a.finalSpending - b.finalSpending ||
            a.run - b.run,
        ),
    [successful],
  );
  const maxCut = statistics.maxCut;

  return (
    <section
      className="fc-card fc-spending-cut-card"
      aria-labelledby={`${id}-title`}
    >
      <header className="fc-card-header">
        <div>
          <h3 id={`${id}-title`} className="fc-card-title">
            成功路径 · 消费下调幅度
          </h3>
          <p>按每条路径退休后相对当年计划消费的最大降幅分组 · 今日购买力</p>
        </div>
        <span className="fc-badge">
          {statistics.cutRuns.toLocaleString("zh-CN")} /{" "}
          {successful.length.toLocaleString("zh-CN")} 条曾下调
        </span>
      </header>
      <div className="fc-spending-cut-summary">
        <SpendingMetric
          label="成功路径中曾下调"
          value={percent(statistics.cutsRate)}
          detail={`${statistics.cutRuns.toLocaleString("zh-CN")} / ${successful.length.toLocaleString("zh-CN")} 条`}
        />
        <SpendingMetric
          label="下调路径 · 最大降幅中位数"
          value={maxCut ? percent(maxCut.median) : "—"}
          detail={
            maxCut
              ? `P25 ${percent(maxCut.p25)} · P75 ${percent(maxCut.p75)}`
              : "没有路径下调"
          }
        />
        <SpendingMetric
          label="最终月消费中位数"
          value={`${amount(statistics.median)} ${currency}`}
          detail={`P10 ${amount(statistics.p10)} · P90 ${amount(statistics.p90)}`}
        />
      </div>
      <div className="fc-spending-cut-layout">
        <SpendingCutChart bins={bins} successfulRuns={successful.length} />
        <div className="fc-spending-cut-ledger">
          <div className="fc-spending-cut-ledger-head">
            <div>
              <h4 id={`${id}-paths-title`}>降幅最大的路径</h4>
              <p>
                全部下调路径按最大降幅从高到低排列；点击路径编号切换下方明细。
              </p>
            </div>
            <span>{cutPaths.length.toLocaleString("zh-CN")} 条</span>
          </div>
          {cutPaths.length > 0 ? (
            <>
              <div className="fc-spending-cut-table-wrap">
                <table
                  className="fc-spending-cut-table"
                  aria-labelledby={`${id}-paths-title`}
                >
                  <thead>
                    <tr>
                      <th scope="col">路径</th>
                      <th scope="col">最大降幅</th>
                      <th scope="col">发生年龄</th>
                      <th scope="col">最终月消费</th>
                      <th scope="col">最终 / 计划</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cutPaths.map((path) => (
                      <tr
                        key={path.run}
                        className={
                          path.run === selectedRun ? "is-selected" : undefined
                        }
                      >
                        <th scope="row">
                          <button
                            type="button"
                            aria-label={`查看第 ${path.run + 1} 条路径，最大降幅 ${percent(path.maxSpendingCut)}`}
                            aria-pressed={path.run === selectedRun}
                            onClick={() => onSelectedRunChange(path.run)}
                          >
                            #{path.run + 1}
                          </button>
                        </th>
                        <td>{percent(path.maxSpendingCut)}</td>
                        <td>
                          {path.maxSpendingCutAge === null
                            ? "—"
                            : `${path.maxSpendingCutAge} 岁`}
                        </td>
                        <td>{`${compactMoney(path.finalSpending)} ${currency}`}</td>
                        <td>
                          {path.finalSpendingPercentOfPlan === null
                            ? "—"
                            : percent(path.finalSpendingPercentOfPlan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="fc-spending-cut-empty">
              本次成功路径都没有降低计划消费。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
