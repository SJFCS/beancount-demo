import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { formatAxisDate, formatNumber } from "./format";
import type { SeriesPoint } from "./types";

export type ChartSeries = {
  name: string;
  points: SeriesPoint[];
  color?: string;
  dashed?: boolean;
  step?: boolean;
};

type AreaOptions = {
  baselineValue?: number;
  baselineSeries?: number;
  baselineStep?: boolean;
  positiveColor?: string;
  negativeColor?: string;
};

export const CHART_COLORS = [
  "var(--pf-chart-1)",
  "var(--pf-chart-2)",
  "var(--pf-chart-3)",
  "var(--pf-chart-4)",
  "var(--pf-chart-5)",
  "var(--pf-chart-6)",
  "var(--pf-chart-7)",
  "var(--pf-chart-8)",
  "var(--pf-chart-9)",
  "var(--pf-chart-10)",
];

const WIDTH = 920;
const PADDING = { left: 78, right: 22, top: 18, bottom: 42 };

function useHover(series: ChartSeries[], width: number, height: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{
    x: number;
    date: string;
    rows: Array<{ name: string; value: number; color: string }>;
  } | null>(null);
  const all = series.flatMap((item) => item.points);
  const minTime = Math.min(
    ...all.map((point) => Date.parse(`${point.date}T00:00:00Z`)),
  );
  const maxTime = Math.max(
    ...all.map((point) => Date.parse(`${point.date}T00:00:00Z`)),
  );
  const plotWidth = width - PADDING.left - PADDING.right;
  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || plotWidth <= 0) return;
    const local = ((event.clientX - rect.left) / rect.width) * width;
    const ratio = Math.max(0, Math.min(1, (local - PADDING.left) / plotWidth));
    const time = minTime + (maxTime - minTime) * ratio;
    let nearestDate = "";
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const item of series)
      for (const point of item.points) {
        const pointTime = Date.parse(`${point.date}T00:00:00Z`);
        const distance = Math.abs(pointTime - time);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestDate = point.date;
        }
      }
    if (!nearestDate) return;
    const rows = series.flatMap((item, index) => {
      let found: SeriesPoint | null = null;
      for (const point of item.points) {
        if (point.date <= nearestDate) found = point;
        else break;
      }
      return found
        ? [
            {
              name: item.name,
              value: found.value,
              color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
            },
          ]
        : [];
    });
    const x =
      PADDING.left +
      ((Date.parse(`${nearestDate}T00:00:00Z`) - minTime) /
        Math.max(1, maxTime - minTime)) *
        plotWidth;
    setHover({ x, date: nearestDate, rows });
  };
  const onLeave = () => setHover(null);
  return { ref, hover, onMove, onLeave, minTime, maxTime, height };
}

export function LineChart({
  series,
  height = 300,
  format = formatNumber,
  area = false,
  empty = "没有可绘制的数据",
}: {
  series: ChartSeries[];
  height?: number;
  format?: (value: number) => string;
  area?: boolean | AreaOptions;
  empty?: string;
}) {
  const dimensions = useHover(series, WIDTH, height);
  const chart = useMemo(() => {
    const points = series.flatMap((item) => item.points);
    if (points.length === 0) return null;
    const areaOptions = area === false ? null : area === true ? {} : area;
    const minTime = Math.min(
      ...points.map((point) => Date.parse(`${point.date}T00:00:00Z`)),
    );
    const maxTime = Math.max(
      ...points.map((point) => Date.parse(`${point.date}T00:00:00Z`)),
    );
    const values = points.map((point) => point.value);
    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);
    if (areaOptions && areaOptions.baselineSeries === undefined) {
      const baseline = areaOptions.baselineValue ?? 0;
      minValue = Math.min(baseline, minValue);
      maxValue = Math.max(baseline, maxValue);
    }
    if (minValue === maxValue) {
      const padding = Math.abs(minValue || 1) * 0.1;
      minValue -= padding;
      maxValue += padding;
    } else {
      const padding = (maxValue - minValue) * 0.08;
      minValue -= padding;
      maxValue += padding;
    }
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const plotHeight = height - PADDING.top - PADDING.bottom;
    const x = (date: string) =>
      PADDING.left +
      ((Date.parse(`${date}T00:00:00Z`) - minTime) /
        Math.max(1, maxTime - minTime)) *
        plotWidth;
    const y = (value: number) =>
      PADDING.top +
      ((maxValue - value) / Math.max(1e-12, maxValue - minValue)) * plotHeight;
    const paths = series.map((item) => {
      let path = "";
      for (const [index, point] of item.points.entries()) {
        if (index === 0) path += `M ${x(point.date)} ${y(point.value)}`;
        else if (item.step) path += ` H ${x(point.date)} V ${y(point.value)}`;
        else path += ` L ${x(point.date)} ${y(point.value)}`;
      }
      return path;
    });
    const areaFill = (() => {
      if (!areaOptions || series[0]?.points.length < 2) return null;
      const reference =
        areaOptions.baselineSeries === undefined
          ? null
          : series[areaOptions.baselineSeries];
      const baselinePoints = new Map(
        reference?.points.map((point) => [point.date, point.value]),
      );
      let carriedBaseline =
        areaOptions.baselineValue ?? reference?.points[0]?.value ?? 0;
      const samples = series[0].points.map((point) => {
        if (baselinePoints.has(point.date))
          carriedBaseline = baselinePoints.get(point.date)!;
        return {
          date: point.date,
          value: point.value,
          baseline: reference
            ? carriedBaseline
            : (areaOptions.baselineValue ?? 0),
        };
      });
      const positive: string[] = [];
      const negative: string[] = [];
      const addSegment = (
        x0: number,
        value0: number,
        baseline0: number,
        x1: number,
        value1: number,
        baseline1: number,
      ) => {
        const difference = value0 - baseline0 + (value1 - baseline1);
        if (Math.abs(difference) <= 1e-9) return;
        const path = `M ${x0} ${y(value0)} L ${x1} ${y(value1)} L ${x1} ${y(
          baseline1,
        )} L ${x0} ${y(baseline0)} Z`;
        (difference > 0 ? positive : negative).push(path);
      };
      for (let index = 1; index < samples.length; index += 1) {
        const previous = samples[index - 1];
        const current = samples[index];
        const x0 = x(previous.date);
        const x1 = x(current.date);
        const baseline1 = areaOptions.baselineStep
          ? previous.baseline
          : current.baseline;
        const startDifference = previous.value - previous.baseline;
        const endDifference = current.value - baseline1;
        if (
          startDifference * endDifference < 0 &&
          Math.abs(startDifference - endDifference) > 1e-9
        ) {
          const ratio = startDifference / (startDifference - endDifference);
          const crossX = x0 + (x1 - x0) * ratio;
          const crossValue =
            previous.value + (current.value - previous.value) * ratio;
          const crossBaseline =
            previous.baseline + (baseline1 - previous.baseline) * ratio;
          addSegment(
            x0,
            previous.value,
            previous.baseline,
            crossX,
            crossValue,
            crossBaseline,
          );
          addSegment(
            crossX,
            crossValue,
            crossBaseline,
            x1,
            current.value,
            baseline1,
          );
        } else {
          addSegment(
            x0,
            previous.value,
            previous.baseline,
            x1,
            current.value,
            baseline1,
          );
        }
      }
      return {
        positive: positive.join(" "),
        negative: negative.join(" "),
        positiveColor: areaOptions.positiveColor ?? "var(--pf-green)",
        negativeColor: areaOptions.negativeColor ?? "var(--pf-red)",
        baselineY:
          areaOptions.baselineSeries === undefined
            ? y(areaOptions.baselineValue ?? 0)
            : null,
      };
    })();
    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const value = minValue + ((maxValue - minValue) * index) / 4;
      return { value, y: y(value) };
    });
    const xTicks = Array.from({ length: 5 }, (_, index) => {
      const time = minTime + ((maxTime - minTime) * index) / 4;
      return {
        x: PADDING.left + (plotWidth * index) / 4,
        label: formatAxisDate(time),
      };
    });
    return {
      minTime,
      maxTime,
      minValue,
      maxValue,
      x,
      y,
      paths,
      areaFill,
      yTicks,
      xTicks,
    };
  }, [series, height, area]);

  if (!chart) return <div className="pf-empty-chart">{empty}</div>;

  return (
    <div className="pf-chart">
      <svg
        ref={dimensions.ref}
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        onPointerMove={dimensions.onMove}
        onPointerLeave={dimensions.onLeave}
      >
        {chart.yTicks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={tick.y}
              y2={tick.y}
              className="pf-grid-line"
            />
            <text
              x={PADDING.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="pf-axis-label"
            >
              {format(tick.value)}
            </text>
          </g>
        ))}
        {chart.xTicks.map((tick) => (
          <text
            key={tick.label + tick.x}
            x={tick.x}
            y={height - 14}
            textAnchor="middle"
            className="pf-axis-label"
          >
            {tick.label}
          </text>
        ))}
        {chart.areaFill?.baselineY !== null &&
        chart.areaFill?.baselineY !== undefined ? (
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={chart.areaFill.baselineY}
            y2={chart.areaFill.baselineY}
            className="pf-grid-line strong"
          />
        ) : null}
        {chart.areaFill?.positive ? (
          <path
            d={chart.areaFill.positive}
            className="pf-area pf-area-profit"
            style={{ fill: chart.areaFill.positiveColor }}
          />
        ) : null}
        {chart.areaFill?.negative ? (
          <path
            d={chart.areaFill.negative}
            className="pf-area pf-area-loss"
            style={{ fill: chart.areaFill.negativeColor }}
          />
        ) : null}
        {chart.paths.map((path, index) => (
          <path
            key={series[index].name + index}
            d={path}
            fill="none"
            stroke={
              series[index].color ?? CHART_COLORS[index % CHART_COLORS.length]
            }
            strokeWidth={2.2}
            strokeDasharray={series[index].dashed ? "6 5" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {dimensions.hover ? (
          <g>
            <line
              x1={dimensions.hover.x}
              x2={dimensions.hover.x}
              y1={PADDING.top}
              y2={height - PADDING.bottom}
              className="pf-cursor-line"
            />
          </g>
        ) : null}
      </svg>
      {dimensions.hover ? (
        <div
          className="pf-chart-tooltip"
          style={{
            left: `${(dimensions.hover.x / WIDTH) * 100}%`,
          }}
        >
          <strong>{dimensions.hover.date}</strong>
          {dimensions.hover.rows.map((row) => (
            <span key={row.name}>
              <i style={{ backgroundColor: row.color }} />
              {row.name}
              <b>{format(row.value)}</b>
            </span>
          ))}
        </div>
      ) : null}
      {series.length > 1 ? (
        <div className="pf-legend">
          {series.map((item, index) => (
            <span key={item.name + index}>
              <i
                style={{
                  backgroundColor:
                    item.color ?? CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
              {item.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BarChart({
  data,
  format,
  height = 260,
}: {
  data: Array<{ label: string; value: number }>;
  format: (value: number) => string;
  height?: number;
}) {
  if (data.length === 0)
    return <div className="pf-empty-chart">没有可绘制的数据</div>;
  const width = Math.max(420, data.length * 76);
  const padding = { left: 64, right: 12, top: 20, bottom: 40 };
  const values = data.map((item) => item.value);
  let min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  if (min === max) max = min + 1;
  const plotHeight = height - padding.top - padding.bottom;
  const y = (value: number) =>
    padding.top + ((max - value) / (max - min)) * plotHeight;
  const barWidth = Math.max(
    12,
    (width - padding.left - padding.right) / data.length - 14,
  );
  return (
    <div className="pf-chart pf-bar-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={y(0)}
          y2={y(0)}
          className="pf-grid-line strong"
        />
        {[0, 0.5, 1].map((ratio) => {
          const value = min + (max - min) * ratio;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y(value)}
                y2={y(value)}
                className="pf-grid-line"
              />
              <text
                x={padding.left - 8}
                y={y(value) + 4}
                textAnchor="end"
                className="pf-axis-label"
              >
                {format(value)}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => {
          const x =
            padding.left +
            (index + 0.5) *
              ((width - padding.left - padding.right) / data.length);
          const top = Math.min(y(item.value), y(0));
          const barHeight = Math.max(1, Math.abs(y(item.value) - y(0)));
          return (
            <g key={item.label}>
              <rect
                x={x - barWidth / 2}
                y={top}
                width={barWidth}
                height={barHeight}
                rx={4}
                className={
                  item.value >= 0 ? "pf-bar-positive" : "pf-bar-negative"
                }
              >
                <title>{`${item.label}: ${format(item.value)}`}</title>
              </rect>
              <text
                x={x}
                y={height - 15}
                textAnchor="middle"
                className="pf-axis-label"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function pairedSeries(
  values: Array<{ date: string }>,
  keys: Array<{
    key: string;
    name: string;
    color?: string;
    dashed?: boolean;
    step?: boolean;
  }>,
): ChartSeries[] {
  return keys.map((item) => ({
    name: item.name,
    color: item.color,
    dashed: item.dashed,
    step: item.step,
    points: values.flatMap((value) => {
      const raw = (value as unknown as Record<string, unknown>)[item.key];
      return typeof raw === "number" ? [{ date: value.date, value: raw }] : [];
    }),
  }));
}
