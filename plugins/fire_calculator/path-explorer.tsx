import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  usesGuardrailInitialRate,
  type FirePathSummary,
  type FireResult,
} from "./model";

type PathZoom = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

type ChartPoint = {
  summary: FirePathSummary;
  cx: number;
  cy: number;
};

type Brush = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const compactMoney = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  if (absolute >= 100000000)
    return `${(value / 100000000).toLocaleString("zh-CN", {
      maximumFractionDigits: 2,
    })}亿`;
  if (absolute >= 10000)
    return `${(value / 10000).toLocaleString("zh-CN", {
      maximumFractionDigits: absolute >= 1000000 ? 0 : 1,
    })}万`;
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
};

const rateText = (value: number | null, missing = "未到退休") =>
  value === null ? missing : `${value.toFixed(2)}%`;

const finalBalanceFor = (item: FirePathSummary, nominal: boolean) =>
  nominal ? item.nominalFinalBalance : item.finalBalance;

const retirementBalanceFor = (item: FirePathSummary, nominal: boolean) =>
  nominal ? item.nominalRetirementBalance : item.retirementBalance;

const pathRateFor = (item: FirePathSummary, guardrailInitialRate: boolean) =>
  guardrailInitialRate
    ? item.guardrailInitialRate
    : item.retirementWithdrawalRate;

function comparePaths(
  a: FirePathSummary,
  b: FirePathSummary,
  guardrailInitialRate: boolean,
) {
  const aRate = pathRateFor(a, guardrailInitialRate);
  const bRate = pathRateFor(b, guardrailInitialRate);
  if (aRate === null && bRate === null)
    return a.run - b.run;
  if (aRate === null) return 1;
  if (bRate === null) return -1;
  return aRate - bRate || a.run - b.run;
}

const PathPoints = React.memo(function PathPoints({
  points,
}: {
  points: ChartPoint[];
}) {
  return (
    <g aria-hidden="true">
      {points.map((point) => (
        <circle
          key={point.summary.run}
          cx={point.cx}
          cy={point.cy}
          r="2.6"
          className={`fc-path-point${point.summary.failureAge === null ? "" : " is-failure"}`}
        />
      ))}
    </g>
  );
});

export function defaultFirePathRun(result: FireResult) {
  if (result.pathSummaries.length === 0) return 0;
  if (result.totalRuns <= 1) return result.pathSummaries[0].run;
  const guardrailInitialRate = usesGuardrailInitialRate(result.config);
  const medianRate = (
    guardrailInitialRate
      ? result.guardrailInitialRate
      : result.retirementWithdrawalRate
  )?.median;
  if (medianRate !== undefined) {
    const candidates = result.pathSummaries.filter(
      (item) => pathRateFor(item, guardrailInitialRate) !== null,
    );
    if (candidates.length > 0)
      return [...candidates].sort(
        (a, b) =>
          Math.abs(pathRateFor(a, guardrailInitialRate)! - medianRate) -
            Math.abs(pathRateFor(b, guardrailInitialRate)! - medianRate) ||
          Number(a.failureAge !== null) - Number(b.failureAge !== null) ||
          a.run - b.run,
      )[0].run;
  }
  const medianFinalBalance = result.finalBalance?.median;
  if (medianFinalBalance !== undefined)
    return [...result.pathSummaries].sort(
      (a, b) =>
        Math.abs(a.finalBalance - medianFinalBalance) -
          Math.abs(b.finalBalance - medianFinalBalance) ||
        Number(a.failureAge !== null) - Number(b.failureAge !== null) ||
        a.run - b.run,
    )[0].run;
  return result.pathSummaries[Math.floor(result.pathSummaries.length / 2)].run;
}

export function SelectedPathDock({
  summary,
  nominal,
  currency,
  manual,
  guardrailInitialRate,
  onOpen,
}: {
  summary: FirePathSummary;
  nominal: boolean;
  currency: string;
  manual: boolean;
  guardrailInitialRate: boolean;
  onOpen(): void;
}) {
  const ending = finalBalanceFor(summary, nominal);
  const retirement = retirementBalanceFor(summary, nominal);
  const rate = pathRateFor(summary, guardrailInitialRate);
  const rateLabel = guardrailInitialRate ? "护栏初始率" : "退休首年净提款率";
  const missingRate = guardrailInitialRate ? "未建立初始率" : "未到退休";
  const rateTitle = guardrailInitialRate
    ? "当前路径护栏初始率 = max(0, 建立初始率当年的策略消费预算 − 常规收入) ÷ 当年年初资产（均为年度金额）；只在首个正净提款年度建立，不含一次性收支。点击打开全部路径图表。"
    : "当前路径退休首年净提款率 = max(0, 退休首年策略消费预算 − 常规收入) ÷ 退休日资产（均为年度金额）；不含一次性收支，不是退休期平均值或全部路径 P50。点击打开全部路径图表。";
  const rateDescription = guardrailInitialRate
    ? "此处是当前路径的护栏初始率，按首个正净提款年度的策略消费预算减去常规收入后除以当年年初资产计算，不是退休首年率或全部路径 P50。"
    : "此处是当前路径的退休首年净提款率，按退休首年策略消费预算减去常规收入后除以退休日资产计算，不是退休期平均值，也不是全部路径 P50。";

  return (
    <button
      type="button"
      className="fc-selected-path-dock"
      aria-live="polite"
      aria-haspopup="dialog"
      title={rateTitle}
      data-selected-run={summary.run}
      onClick={onOpen}
    >
      <span className="fc-selected-path-dock-head">
        <span>{manual ? "当前情景" : "当前路径"}</span>
        <strong>{manual ? "手动情景" : `第 ${summary.run + 1} 条`}</strong>
      </span>
      <span className="fc-selected-path-dock-assets">
        <span className="is-rate">
          <em>{rateLabel}</em>
          <b>{rateText(rate, missingRate)}</b>
        </span>
        <span>
          <em>退休日资产</em>
          <b>
            {retirement === null
              ? "—"
              : `${compactMoney(retirement)} ${currency}`}
          </b>
        </span>
        <span>
          <em>期末资产</em>
          <b>
            {compactMoney(ending)} {currency}
          </b>
        </span>
        <span className="fc-sr-only">
          {rateDescription}
        </span>
        {summary.failureAge === null ? null : (
          <span className="is-failure">
            <em>耗尽年龄</em>
            <b>{summary.failureAge.toFixed(1)} 岁</b>
          </span>
        )}
      </span>
    </button>
  );
}

export function PathExplorer({
  result,
  selectedRun,
  onSelectedRunChange,
  nominal,
  onNominalChange,
  currency,
  onClose,
}: {
  result: FireResult;
  selectedRun: number;
  onSelectedRunChange(run: number): void;
  nominal: boolean;
  onNominalChange(value: boolean): void;
  currency: string;
  onClose?: () => void;
}) {
  const id = useId();
  const sliderId = `${id}-slider`;
  const svg = useRef<SVGSVGElement>(null);
  const dragStart = useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const [hovered, setHovered] = useState<{
    summary: FirePathSummary;
    x: number;
    y: number;
    flipX: boolean;
    flipY: boolean;
  } | null>(null);
  const [brush, setBrush] = useState<Brush | null>(null);
  const [zoom, setZoom] = useState<PathZoom | null>(null);

  useEffect(() => {
    setZoom(null);
    setBrush(null);
    dragStart.current = null;
  }, [nominal, result]);

  const guardrailInitialRate = usesGuardrailInitialRate(result.config);
  const rateLabel = guardrailInitialRate ? "护栏初始率" : "退休首年净提款率";
  const missingRateLabel = guardrailInitialRate
    ? "未建立初始率"
    : "未到退休";
  const rateStatistics = guardrailInitialRate
    ? result.guardrailInitialRate
    : result.retirementWithdrawalRate;
  const ordered = useMemo(
    () =>
      [...result.pathSummaries].sort((a, b) =>
        comparePaths(a, b, guardrailInitialRate),
      ),
    [guardrailInitialRate, result.pathSummaries],
  );
  const selected =
    result.pathSummaries.find((item) => item.run === selectedRun) ??
    result.pathSummaries[0];
  const selectedPosition = Math.max(
    0,
    ordered.findIndex((item) => item.run === selected.run),
  );
  const hoveredPosition =
    hovered === null
      ? null
      : Math.max(
          0,
          ordered.findIndex((item) => item.run === hovered.summary.run),
        );
  const sliderSummary = hovered?.summary ?? selected;
  const sliderPosition = hoveredPosition ?? selectedPosition;
  const plotted = useMemo(
    () =>
      ordered.flatMap((item) => {
        const rate = pathRateFor(item, guardrailInitialRate);
        return rate === null ? [] : [{ summary: item, rate }];
      }),
    [guardrailInitialRate, ordered],
  );
  const width = 900;
  const height = 320;
  const left = 72;
  const right = 26;
  const top = 24;
  const bottom = 48;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxRate = Math.max(
    0.1,
    ...plotted.map((item) => item.rate),
  );
  const maxBalance = Math.max(
    1,
    ...plotted.map((item) => finalBalanceFor(item.summary, nominal)),
  );
  const fullDomain = useMemo<PathZoom>(
    () => ({ xMin: 0, xMax: maxRate, yMin: 0, yMax: maxBalance }),
    [maxBalance, maxRate],
  );
  const domain = zoom ?? fullDomain;
  const x = (rate: number) =>
    left + ((rate - domain.xMin) / (domain.xMax - domain.xMin)) * plotWidth;
  const y = (balance: number) =>
    top +
    (1 - (balance - domain.yMin) / (domain.yMax - domain.yMin)) * plotHeight;
  const rateAtX = (position: number) =>
    domain.xMin + ((position - left) / plotWidth) * (domain.xMax - domain.xMin);
  const balanceAtY = (position: number) =>
    domain.yMax - ((position - top) / plotHeight) * (domain.yMax - domain.yMin);
  const pointData = useMemo(
    () =>
      plotted
        .filter(({ summary, rate }) => {
          const balance = finalBalanceFor(summary, nominal);
          return (
            rate >= domain.xMin &&
            rate <= domain.xMax &&
            balance >= domain.yMin &&
            balance <= domain.yMax
          );
        })
        .map(({ summary, rate }) => ({
          summary,
          cx: x(rate),
          cy: y(finalBalanceFor(summary, nominal)),
        })),
    [domain, nominal, plotted],
  );
  const ratePercentiles = rateStatistics
    ? [
        {
          key: "p10",
          label: "P10",
          value: rateStatistics.p10,
          description: "10% 的路径低于此值",
          tone: "outer",
          row: 0,
        },
        {
          key: "p25",
          label: "P25",
          value: rateStatistics.p25,
          description: "25% 的路径低于此值",
          tone: "inner",
          row: 1,
        },
        {
          key: "p50",
          label: "P50",
          value: rateStatistics.median,
          description: "中位数：一半路径低于此值，一半高于此值",
          tone: "median",
          row: 0,
        },
        {
          key: "p75",
          label: "P75",
          value: rateStatistics.p75,
          description: "75% 的路径低于此值",
          tone: "inner",
          row: 1,
        },
        {
          key: "p90",
          label: "P90",
          value: rateStatistics.p90,
          description: "90% 的路径低于此值",
          tone: "outer",
          row: 0,
        },
      ]
    : [];
  const selectedRate = pathRateFor(selected, guardrailInitialRate);
  const missingRateCount = result.pathSummaries.length - plotted.length;
  const selectedEnding = finalBalanceFor(selected, nominal);
  const selectedVisible =
    selectedRate !== null &&
    selectedRate >= domain.xMin &&
    selectedRate <= domain.xMax &&
    selectedEnding >= domain.yMin &&
    selectedEnding <= domain.yMax;

  const pointerPosition = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svg.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  };
  const nearestPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    const pointer = pointerPosition(event);
    if (!pointer) return null;
    let nearest:
      | {
          point: (typeof pointData)[number];
          distance: number;
        }
      | undefined;
    for (const point of pointData) {
      const distance = Math.hypot(point.cx - pointer.x, point.cy - pointer.y);
      if (nearest === undefined || distance < nearest.distance)
        nearest = { point, distance };
    }
    return nearest && nearest.distance <= 24 ? nearest.point : null;
  };
  const updateBrush = (event: React.PointerEvent<SVGSVGElement>) => {
    const start = dragStart.current;
    const pointer = pointerPosition(event);
    if (!start || !pointer) return;
    setHovered(null);
    setBrush({
      x1: start.x,
      y1: start.y,
      x2: clamp(pointer.x, left, width - right),
      y2: clamp(pointer.y, top, height - bottom),
    });
  };
  const finishBrush = (event: React.PointerEvent<SVGSVGElement>) => {
    const start = dragStart.current;
    if (!start) return;
    const pointer = pointerPosition(event);
    const currentBrush = pointer
      ? {
          x1: start.x,
          y1: start.y,
          x2: clamp(pointer.x, left, width - right),
          y2: clamp(pointer.y, top, height - bottom),
        }
      : brush;
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture?.(start.pointerId))
      event.currentTarget.releasePointerCapture?.(start.pointerId);
    setBrush(null);
    if (!currentBrush) return;
    const x1 = Math.min(currentBrush.x1, currentBrush.x2);
    const x2 = Math.max(currentBrush.x1, currentBrush.x2);
    const y1 = Math.min(currentBrush.y1, currentBrush.y2);
    const y2 = Math.max(currentBrush.y1, currentBrush.y2);
    const zoomX = x2 - x1 >= 12;
    const zoomY = y2 - y1 >= 12;
    if (!zoomX && !zoomY) return;
    const nextZoom = {
      xMin: zoomX ? rateAtX(x1) : domain.xMin,
      xMax: zoomX ? rateAtX(x2) : domain.xMax,
      yMin: zoomY ? balanceAtY(y2) : domain.yMin,
      yMax: zoomY ? balanceAtY(y1) : domain.yMax,
    };
    if (
      nextZoom.xMax - nextZoom.xMin <= 1e-8 ||
      nextZoom.yMax - nextZoom.yMin <= 1e-8
    )
      return;
    suppressClick.current = true;
    setZoom(nextZoom);
  };

  return (
    <section
      className="fc-card fc-path-explorer"
      aria-labelledby={`${id}-title`}
      data-selected-run={selected.run}
      data-zoomed={zoom !== null}
    >
      <header className="fc-card-header">
        <div>
          <h3 id={`${id}-title`} className="fc-card-title">
            全部路径 · 提款率与期末资产
          </h3>
          <p>
            每一点是一条完整路径 · 横轴为{rateLabel} · 纵轴为期末
            {nominal ? "名义" : "实际"}资产
          </p>
        </div>
        <div className="fc-card-header-actions">
          <span className="fc-badge">
            第 {selected.run + 1} 条 / 共{" "}
            {result.totalRuns.toLocaleString("zh-CN")} 条
          </span>
          <div
            className="fc-toggle"
            role="group"
            aria-label="路径资产金额显示口径"
          >
            <button
              type="button"
              aria-pressed={!nominal}
              onClick={() => onNominalChange(false)}
            >
              今日购买力
            </button>
            <button
              type="button"
              aria-pressed={nominal}
              onClick={() => onNominalChange(true)}
            >
              名义金额
            </button>
          </div>
          {onClose ? (
            <button
              type="button"
              className="fc-btn small ghost fc-path-explorer-close"
              aria-label="关闭全部路径图表"
              title="关闭图表"
              onClick={onClose}
            >
              ×
            </button>
          ) : null}
        </div>
      </header>
      <p className="fc-flow-note">
        悬浮图中的点可预览该路径在滑块中的位置，点击点或拖动下方滑块切换路径。在图上横向拖框可放大提款率轴，纵向拖框可放大资产轴，框选区域可同时放大两轴；放大后可用“重置缩放”返回全图。
        滑块始终按全部路径的{rateLabel}从低到高排列，路径编号保留原始模拟编号。
        {missingRateCount > 0
          ? ` 有 ${missingRateCount.toLocaleString("zh-CN")} 条路径${missingRateLabel}，不进入散点，但仍可通过滑块查看。`
          : ""}
      </p>
      {ratePercentiles.length > 0 ? (
        <div
          className="fc-path-explorer-percentiles"
          aria-label={`全路径${rateLabel}分位`}
        >
          <div className="fc-path-explorer-percentiles-heading">
            <span>全路径{rateLabel}分位</span>
            <small>P50 是中位数：一半路径低于它，一半高于它</small>
          </div>
          <div className="fc-path-explorer-percentiles-items">
            {ratePercentiles.map((percentile) => (
              <span
                key={percentile.key}
                className={`fc-path-percentile-chip is-${percentile.tone}`}
                title={`${percentile.label}：${percentile.description}`}
              >
                <i />
                <em>{percentile.label}</em>
                <strong>{percentile.value.toFixed(2)}%</strong>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <div className="fc-path-explorer-chart-stage">
        <div className="fc-chart-wrap fc-path-explorer-chart-wrap">
          <svg
            ref={svg}
            className={`fc-chart fc-path-explorer-chart${brush ? " is-brushing" : ""}`}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-labelledby={`${id}-chart-title ${id}-chart-desc`}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              const pointer = pointerPosition(event);
              if (
                !pointer ||
                pointer.x < left ||
                pointer.x > width - right ||
                pointer.y < top ||
                pointer.y > height - bottom
              )
                return;
              dragStart.current = {
                x: pointer.x,
                y: pointer.y,
                pointerId: event.pointerId,
              };
              suppressClick.current = false;
              setHovered(null);
              event.currentTarget.setPointerCapture?.(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (dragStart.current) {
                updateBrush(event);
                return;
              }
              const point = nearestPoint(event);
              if (!point) {
                setHovered(null);
                return;
              }
              setHovered({
                summary: point.summary,
                x: event.clientX,
                y: event.clientY,
                flipX: event.clientX > window.innerWidth - 320,
                flipY: event.clientY > window.innerHeight - 220,
              });
            }}
            onPointerUp={finishBrush}
            onPointerCancel={() => {
              dragStart.current = null;
              setBrush(null);
              setHovered(null);
            }}
            onPointerLeave={() => {
              if (!dragStart.current) setHovered(null);
            }}
            onClick={(event) => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              const point = nearestPoint(event);
              if (point) onSelectedRunChange(point.summary.run);
            }}
          >
            <title id={`${id}-chart-title`}>全部路径 · 提款率与期末资产</title>
            <desc id={`${id}-chart-desc`}>
              横轴为{rateLabel}，纵轴为期末资产。每个点代表一条完整模拟路径，点击点可查看该路径的明细；在绘图区拖框可放大局部。竖向分位线标出全部路径{rateLabel}的
              P10、P25、P50、P75、P90，其中 P50 为中位数。
            </desc>
            <text x={left} y={13}>
              期末资产
            </text>
            <text x={width - right} y={13} textAnchor="end">
              {rateLabel}
            </text>
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <g key={`x-${fraction}`}>
                <line
                  className="fc-grid-line"
                  x1={x(domain.xMin + (domain.xMax - domain.xMin) * fraction)}
                  x2={x(domain.xMin + (domain.xMax - domain.xMin) * fraction)}
                  y1={top}
                  y2={height - bottom}
                />
                <text
                  x={x(domain.xMin + (domain.xMax - domain.xMin) * fraction)}
                  y={height - bottom + 18}
                  textAnchor="middle"
                >
                  {(
                    domain.xMin +
                    (domain.xMax - domain.xMin) * fraction
                  ).toFixed(domain.xMax - domain.xMin < 1 ? 2 : 1)}
                  %
                </text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <g key={`y-${fraction}`}>
                <line
                  className="fc-grid-line"
                  x1={left}
                  x2={width - right}
                  y1={y(domain.yMin + (domain.yMax - domain.yMin) * fraction)}
                  y2={y(domain.yMin + (domain.yMax - domain.yMin) * fraction)}
                />
                <text
                  x={left - 12}
                  y={
                    y(domain.yMin + (domain.yMax - domain.yMin) * fraction) + 3
                  }
                  textAnchor="end"
                >
                  {compactMoney(
                    domain.yMin + (domain.yMax - domain.yMin) * fraction,
                  )}
                </text>
              </g>
            ))}
            {ratePercentiles
              .filter(
                (percentile) =>
                  percentile.value >= domain.xMin &&
                  percentile.value <= domain.xMax,
              )
              .map((percentile) => (
                <g key={percentile.key}>
                  <line
                    className={`fc-path-percentile is-${percentile.tone}`}
                    x1={x(percentile.value)}
                    x2={x(percentile.value)}
                    y1={top}
                    y2={height - bottom}
                  />
                  <text
                    x={x(percentile.value)}
                    y={percentile.row === 0 ? top - 7 : top + 11}
                    textAnchor="middle"
                    className={`fc-path-percentile-label is-${percentile.tone}`}
                  >
                    {percentile.label} {percentile.value.toFixed(2)}%
                  </text>
                </g>
              ))}
            <g aria-hidden="true">
              <PathPoints points={pointData} />
              {selectedVisible && selectedRate !== null ? (
                <g
                  className="fc-path-selected"
                  transform={`translate(${x(selectedRate)} ${y(selectedEnding)})`}
                >
                  <circle r="9" />
                  <circle r="5" />
                </g>
              ) : null}
              {brush ? (
                <rect
                  className="fc-path-brush"
                  x={Math.min(brush.x1, brush.x2)}
                  y={Math.min(brush.y1, brush.y2)}
                  width={Math.abs(brush.x2 - brush.x1)}
                  height={Math.abs(brush.y2 - brush.y1)}
                />
              ) : null}
            </g>
            <text x={left} y={height - 8}>
              {rateLabel}
            </text>
          </svg>
          {hovered ? (
            <div
              className={`fc-chart-tooltip fc-chart-tooltip--cursor${hovered.flipX ? " is-left" : ""}${hovered.flipY ? " is-above" : ""}`}
              role="tooltip"
              style={{ left: hovered.x, top: hovered.y }}
            >
              <strong>第 {hovered.summary.run + 1} 条路径</strong>
              <small>
                {hovered.summary.failureAge === null
                  ? "覆盖整个规划期"
                  : `${hovered.summary.failureAge.toFixed(1)} 岁耗尽`}
              </small>
              <span>
                <em>{rateLabel}</em>
                <b>
                  {rateText(
                    pathRateFor(hovered.summary, guardrailInitialRate),
                    missingRateLabel,
                  )}
                </b>
              </span>
              {guardrailInitialRate &&
              hovered.summary.guardrailInitialAge !== null ? (
                <span>
                  <em>初始率建立年龄</em>
                  <b>{hovered.summary.guardrailInitialAge} 岁</b>
                </span>
              ) : null}
              <span>
                <em>退休日资产</em>
                <b>
                  {retirementBalanceFor(hovered.summary, nominal) === null
                    ? "—"
                    : `${compactMoney(retirementBalanceFor(hovered.summary, nominal)!)} ${currency}`}
                </b>
              </span>
              <span>
                <em>期末资产</em>
                <b>
                  {compactMoney(finalBalanceFor(hovered.summary, nominal))}{" "}
                  {currency}
                </b>
              </span>
            </div>
          ) : null}
        </div>
        {zoom ? (
          <button
            type="button"
            className="fc-btn small fc-path-reset-zoom"
            onClick={() => setZoom(null)}
          >
            重置缩放
          </button>
        ) : null}
      </div>
      <div className="fc-path-explorer-slider">
        <div className="fc-path-explorer-slider-head">
          <label htmlFor={sliderId}>浏览完整路径</label>
          <output htmlFor={sliderId}>
            第 {sliderSummary.run + 1} 条 · {sliderPosition + 1} /{" "}
            {ordered.length}
          </output>
        </div>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={Math.max(0, ordered.length - 1)}
          value={sliderPosition}
          onChange={(event) => {
            const next = ordered[Number(event.currentTarget.value)];
            if (next) onSelectedRunChange(next.run);
          }}
          aria-label="浏览完整路径"
          aria-valuetext={`第 ${sliderSummary.run + 1} 条路径，${rateLabel} ${rateText(pathRateFor(sliderSummary, guardrailInitialRate), missingRateLabel)}，期末资产 ${compactMoney(finalBalanceFor(sliderSummary, nominal))} ${currency}`}
        />
      </div>
      <div className="fc-chart-legend fc-path-explorer-legend">
        <span>
          <i className="fc-path-success-swatch" />
          覆盖整个规划期
        </span>
        <span className="is-failure">
          <i className="fc-path-failure-swatch" />
          中途耗尽
        </span>
        <span>
          <i className="fc-path-selected-swatch" />
          当前路径
        </span>
        {ratePercentiles.length > 0 ? (
          <span>
            <i className="fc-path-percentile-swatch" />
            全路径 P10–P90 · P50 中位数
          </span>
        ) : null}
      </div>
    </section>
  );
}

export function PathExplorerDialog({
  open,
  onClose,
  result,
  selectedRun,
  onSelectedRunChange,
  nominal,
  onNominalChange,
  currency,
}: {
  open: boolean;
  onClose(): void;
  result: FireResult;
  selectedRun: number;
  onSelectedRunChange(run: number): void;
  nominal: boolean;
  onNominalChange(value: boolean): void;
  currency: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div
      className="fc-path-explorer-dialog-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className="fc-path-explorer-dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-label="全部路径 · 提款率与期末资产"
        tabIndex={-1}
      >
        <PathExplorer
          result={result}
          selectedRun={selectedRun}
          onSelectedRunChange={onSelectedRunChange}
          nominal={nominal}
          onNominalChange={onNominalChange}
          currency={currency}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
