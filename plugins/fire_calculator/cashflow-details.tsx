import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  usesGuardrailInitialRate,
  type FireDetailPath,
  type FireLedgerAmounts,
  type FireResult,
} from "./model";

const money = (value: number) => {
  const displayValue = Math.abs(value) < 0.5 ? 0 : value;
  return displayValue.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
};
const shortMoney = (value: number) =>
  Math.abs(value) >= 10_000
    ? `${(value / 10_000).toLocaleString("zh-CN", { maximumFractionDigits: 1 })}万`
    : money(value);
const currentPathScope = (label: string) =>
  `当前路径 · ${label.replace(/路径$/, "")}`;
const ASSET_ROWS = [
  ["stocks", "股票"],
  ["bonds", "债券"],
  ["cash", "现金"],
] as const;

function DisclosureChevron() {
  return (
    <svg
      className="fc-disclosure-chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type DetailColumnKey =
  | keyof FireLedgerAmounts
  | "annualInflation"
  | "investmentReturn"
  | "spendingAdjustment"
  | "guardrailWithdrawalRate"
  | "status";
type DetailValueOrder = "year" | "month";

const COLUMN_HELP_TEXT: Partial<Record<DetailColumnKey, string>> = {
  plannedSpending:
    "计划生活费 = 当年处于生效年龄区间内的定期支出项目汇总。\n这是提款策略调整前的原始生活预算，按今日购买力或名义金额显示，不含一次性支出，也不扣收入。\n今日购买力口径下，跟随通胀的支出保持不变；名义金额口径下，它按当前路径的随机通胀逐年增长，同比增幅与“当年通胀”列一致。不跟随通胀的支出在名义口径下保持录入金额不变。",
  annualInflation:
    "当年通胀 = 当前路径本年累计价格涨幅，由月度随机抽样得到。\n其长期平均接近设定的年通胀率，但单年会因随机波动明显偏高或偏低，个别年份可能远超或远低于设定值。\n明细表展示的是完整的一条路径，不是逐年平均或中位数；手动模式则固定等于设定年通胀率。",
  spendingAdjustment:
    "消费调整 = 策略消费预算 − 计划生活费，是提款策略对生活预算的调整，与通胀无关。\n护栏模式下调整会跨年保留，因此标注“累计”；百分比是当年调整额 ÷ 当年计划生活费，不是通胀率。\n不跟随通胀的支出在名义口径下计划金额保持不变，此列出现百分比表示护栏调整，而不是通胀。",
  budgetSpending:
    "策略消费预算 = 当前提款策略允许你当年花多少钱，是计算净提款率和判断现金流是否够用的目标预算。\n固定实际金额：等于计划生活费。\n组合比例：年初资产 × 提款率。\n动态护栏：计划生活费 × 当前累计护栏系数，并受最低、最高消费比例限制。\n该列不扣收入、不含一次性支出，也不代表实际支付；实际支付见“支出”列。",
  spending:
    "支出 = 当年实际能支付的生活费。\n资金充足时等于策略消费预算；不足时只记录已支付部分，差额进入“未付缺口”并导致路径失败。\n不扣收入，不含一次性支出。",
  investmentReturn:
    "投资年化 = 当前路径按每个月组合收益链式计算的时间加权收益率，剔除定期收入、支出、投入和提取对收益率分母的影响。\n分子采用“投资盈亏”口径，尚未扣除管理费和收益税；不足一年时按实际已完成的投资月份折算年化。\n今日购买力口径会再按当年实际通胀折算为实际收益率；名义金额口径显示名义收益率。",
};

const HIDEABLE_COLUMNS = new Set<DetailColumnKey>([
  "openingBalance",
  "income",
  "oneTimeIncome",
  "plannedSpending",
  "annualInflation",
  "investmentReturn",
  "budgetSpending",
  "guardrailWithdrawalRate",
  "spendingAdjustment",
  "spending",
  "oneTimeExpenses",
  "contributions",
  "withdrawals",
  "investmentGain",
  "fees",
  "taxes",
  "inflationEffect",
  "shortfall",
  "status",
]);

type FlowRowKey =
  | "openingBalance"
  | "income"
  | "oneTimeIncome"
  | "spending"
  | "oneTimeExpenses"
  | "investmentGain"
  | "fees"
  | "taxes"
  | "inflationEffect"
  | "closingBalance";

const HIDEABLE_FLOW_ROWS = new Set<FlowRowKey>([
  "openingBalance",
  "income",
  "oneTimeIncome",
  "spending",
  "oneTimeExpenses",
  "investmentGain",
  "fees",
  "taxes",
  "inflationEffect",
  "closingBalance",
]);

const MONTHLY_AVERAGE_COLUMNS = new Set<keyof FireLedgerAmounts>([
  "income",
  "oneTimeIncome",
  "plannedSpending",
  "budgetSpending",
  "spending",
  "oneTimeExpenses",
  "contributions",
  "withdrawals",
  "investmentGain",
  "fees",
  "taxes",
  "inflationEffect",
  "shortfall",
]);

function readHiddenFlowRows(storageKey: string): Set<FlowRowKey> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return new Set();
    const values = JSON.parse(stored) as unknown;
    if (!Array.isArray(values)) return new Set();
    return new Set(
      values.filter(
        (value): value is FlowRowKey =>
          typeof value === "string" &&
          HIDEABLE_FLOW_ROWS.has(value as FlowRowKey),
      ),
    );
  } catch {
    return new Set();
  }
}

function writeHiddenFlowRows(storageKey: string, hiddenRows: Set<FlowRowKey>) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...hiddenRows]));
  } catch {}
}

function readHiddenFlowSeries(storageKey: string): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return new Set();
    const values = JSON.parse(stored) as unknown;
    if (!Array.isArray(values)) return new Set();
    return new Set(
      values.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set();
  }
}

function writeHiddenFlowSeries(storageKey: string, hiddenSeries: Set<string>) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...hiddenSeries]));
  } catch {}
}

function readHiddenColumns(storageKey: string): Set<DetailColumnKey> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return new Set();
    const values = JSON.parse(stored) as unknown;
    if (!Array.isArray(values)) return new Set();
    return new Set(
      values.filter(
        (value): value is DetailColumnKey =>
          typeof value === "string" &&
          HIDEABLE_COLUMNS.has(value as DetailColumnKey),
      ),
    );
  } catch {
    return new Set();
  }
}

function writeHiddenColumns(
  storageKey: string,
  hiddenColumns: Set<DetailColumnKey>,
) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...hiddenColumns]));
  } catch {}
}

function readDetailValueOrder(storageKey: string): DetailValueOrder {
  if (typeof localStorage === "undefined") return "year";
  try {
    return localStorage.getItem(storageKey) === "month" ? "month" : "year";
  } catch {
    return "year";
  }
}

function writeDetailValueOrder(
  storageKey: string,
  valueOrder: DetailValueOrder,
) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey, valueOrder);
  } catch {}
}

export function CashflowTrend({
  result,
  path,
  storageKey,
  nominal,
  onNominalChange,
  selectedYear,
  onSelectedYearChange,
  currency,
  hoveredYear,
  onHoveredYearChange,
}: {
  result: FireResult;
  path: FireDetailPath;
  storageKey: string;
  nominal: boolean;
  onNominalChange(value: boolean): void;
  selectedYear: number;
  onSelectedYearChange(value: number): void;
  currency: string;
  hoveredYear: number | null;
  onHoveredYearChange(value: number | null): void;
}) {
  const id = useId();
  const seriesStorageKey = storageKey.replace(
    /:hidden-columns$/,
    ":hidden-flow-series",
  );
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() =>
    readHiddenFlowSeries(seriesStorageKey),
  );
  const [cursorTooltip, setCursorTooltip] = useState<{
    x: number;
    y: number;
    flipX: boolean;
    flipY: boolean;
  } | null>(null);
  const trendSvg = useRef<SVGSVGElement>(null);
  const chartFrame = useRef<HTMLDivElement>(null);
  const [chartCanvasHeight, setChartCanvasHeight] = useState(290);
  useLayoutEffect(() => {
    const frame = chartFrame.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const updateChartHeight = () => {
      if (window.matchMedia?.("(max-width: 800px)").matches) {
        setChartCanvasHeight(290);
        return;
      }
      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setChartCanvasHeight(
        Math.max(290, Math.round((800 * rect.height) / rect.width)),
      );
    };
    updateChartHeight();
    const observer = new ResizeObserver(updateChartHeight);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  const index = Math.min(selectedYear, path.years.length - 1);
  const year = path.years[index];
  const field = nominal ? "nominal" : "real";
  const amounts = year[field];
  const unit = `${currency} · ${nominal ? "名义金额" : "今日购买力"}`;
  const totalIncome = amounts.income + amounts.oneTimeIncome;
  const totalExpenses = amounts.spending + amounts.oneTimeExpenses;
  const netCashflow = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? (netCashflow / totalIncome) * 100 : null;
  const withdrawalShare =
    totalExpenses > 0 ? (amounts.withdrawals / totalExpenses) * 100 : null;
  const expenseCoverage =
    totalExpenses > 0 ? amounts.closingBalance / totalExpenses : null;
  const series = [
    {
      label: "收入（含一次性）",
      color: "var(--fc-green)",
      dash: undefined,
      width: 2,
      value: (amounts: FireLedgerAmounts) =>
        amounts.income + amounts.oneTimeIncome,
    },
    {
      label: "支出（含一次性）",
      color: "var(--fc-amber)",
      dash: undefined,
      width: 2,
      value: (amounts: FireLedgerAmounts) =>
        amounts.spending + amounts.oneTimeExpenses,
    },
    {
      label: "从资产提取",
      color: "var(--fc-flow-withdrawal)",
      dash: "10 4",
      width: 3,
      value: (amounts: FireLedgerAmounts) => amounts.withdrawals,
    },
    {
      label: "投资盈亏（税费前）",
      color: "var(--fc-flow-investment)",
      dash: "1 6",
      width: 2,
      value: (amounts: FireLedgerAmounts) => amounts.investmentGain,
    },
  ];
  const visibleSeries = series.filter(
    (entry) => !hiddenSeries.has(entry.label),
  );
  const values = path.years.flatMap((item) =>
    visibleSeries.map((entry) => entry.value(item[field])),
  );
  const max = Math.max(1, ...values) * 1.1;
  const min = Math.min(0, ...values) * 1.1;
  const left = 80,
    right = 24,
    top = 24,
    width = 800;
  const bottom = chartCanvasHeight - 40;
  const x = (i: number) =>
    left + (i / Math.max(1, path.years.length - 1)) * (width - left - right);
  const y = (value: number) =>
    bottom - ((value - min) / (max - min)) * (bottom - top);
  const ageTicks = [
    ...new Set([
      0,
      Math.round((path.years.length - 1) / 2),
      path.years.length - 1,
    ]),
  ];
  const tooltipIndex =
    hoveredYear === null
      ? null
      : Math.min(path.years.length - 1, Math.max(0, hoveredYear));
  const tooltipYear = tooltipIndex === null ? null : path.years[tooltipIndex];
  const tooltipAmounts = tooltipYear?.[field];
  const toggleSeries = (label: string) => {
    setHiddenSeries((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      writeHiddenFlowSeries(seriesStorageKey, next);
      return next;
    });
    setHoveredSeries(null);
  };
  const showTrendTooltip = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = trendSvg.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const local = ((event.clientX - rect.left) / rect.width) * width;
    const next = Math.max(
      0,
      Math.min(
        path.years.length - 1,
        Math.round(
          ((local - left) / (width - left - right)) * (path.years.length - 1),
        ),
      ),
    );
    setCursorTooltip({
      x: event.clientX,
      y: event.clientY,
      flipX: event.clientX > window.innerWidth - 340,
      flipY: event.clientY > window.innerHeight - 230,
    });
    onHoveredYearChange(next);
    onSelectedYearChange(next);
  };

  return (
    <section
      className="fc-card fc-flow fc-flow-trend"
      aria-labelledby={`${id}-card-title`}
      data-selected-age={year.age}
      data-path-run={path.run}
    >
      <header className="fc-card-header">
        <div>
          <h3 id={`${id}-card-title`} className="fc-card-title">
            {currentPathScope(path.label)} · 收入、支出与资产提取
          </h3>
          <p>单条完整模拟路径的年度现金流 · {unit}</p>
        </div>
        <div className="fc-card-header-actions">
          <span className="fc-badge">
            {year.age} → {year.age + 1} 岁
          </span>
          <div
            className="fc-toggle"
            role="group"
            aria-label="年度现金流金额显示口径"
          >
            <button
              type="button"
              aria-pressed={!nominal}
              title="现金流已按各路径通胀折算，相当于今天的消费力"
              onClick={() => onNominalChange(false)}
            >
              今日购买力
            </button>
            <button
              type="button"
              aria-pressed={nominal}
              title="未来账面数字，未扣除通胀"
              onClick={() => onNominalChange(true)}
            >
              名义金额
            </button>
          </div>
        </div>
      </header>
      <p className="fc-flow-note">
        {result.config.mode === "manual"
          ? "手动模式展示这一条固定情景。"
          : "当前选择的完整路径，不是逐年分位数拼接。"}
        {path.failureAge === null
          ? "此路径覆盖整个规划期。"
          : `此路径在 ${path.failureAge.toFixed(2)} 岁无法付清，明细止于失败当月。`}
      </p>
      <div
        className="fc-flow-trend-summary"
        role="group"
        aria-label="当前路径年度现金流摘要"
      >
        <div>
          <span>年度收支结余</span>
          <strong className={netCashflow < 0 ? "is-negative" : undefined}>
            {netCashflow > 0 ? "+" : ""}
            {money(netCashflow)}
          </strong>
          <small>收入 − 支出</small>
        </div>
        <div>
          <span>储蓄率</span>
          <strong>
            {savingsRate == null ? "—" : `${savingsRate.toFixed(1)}%`}
          </strong>
          <small>结余 ÷ 收入</small>
        </div>
        <div>
          <span>从资产提取</span>
          <strong>{money(amounts.withdrawals)}</strong>
          <small>
            {withdrawalShare == null
              ? "本年无支出"
              : `占支出 ${withdrawalShare.toFixed(0)}%`}
          </small>
        </div>
        <div>
          <span>年末资产</span>
          <strong>{money(amounts.closingBalance)}</strong>
          <small>
            {expenseCoverage == null
              ? "本年无支出"
              : `约覆盖 ${expenseCoverage.toFixed(1)} 年支出`}
          </small>
        </div>
      </div>
      <p className="fc-flow-waterfall-help fc-flow-trend-help">
        图表按年龄展示这一条路径的收入、支出、资产提取与投资盈亏。悬停或用共用年度滑块切换年份，下方明细会同步更新。
      </p>
      <div className="fc-flow-chart-stage">
        <div ref={chartFrame} className="fc-flow-chart-scroll">
          <svg
            ref={trendSvg}
            className="fc-flow-chart"
            viewBox={`0 0 800 ${chartCanvasHeight}`}
            role="img"
            aria-labelledby={`${id}-title ${id}-desc`}
            onPointerMove={showTrendTooltip}
            onPointerLeave={() => {
              setCursorTooltip(null);
              onHoveredYearChange(null);
            }}
          >
            <title id={`${id}-title`}>年度收入、支出、提取与投资盈亏走势</title>
            <desc id={`${id}-desc`}>
              横轴为年龄，纵轴为年度金额。实线表示收入和支出，长虚线表示从资产提取，点线表示投资盈亏。两张图共用年度滑块。
            </desc>
            {[0, 1, 2, 3, 4].map((tick) => {
              const value = min + ((max - min) * tick) / 4;
              return (
                <g key={tick}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={y(value)}
                    y2={y(value)}
                    className="fc-grid-line"
                  />
                  <text x={left - 10} y={y(value) + 4} textAnchor="end">
                    {shortMoney(value)}
                  </text>
                </g>
              );
            })}
            <text x={left} y={14}>
              {currency} / 年
            </text>
            {min < 0 && (
              <line
                x1={left}
                x2={width - right}
                y1={y(0)}
                y2={y(0)}
                className="fc-axis-line"
              />
            )}
            {visibleSeries.map((entry) => (
              <polyline
                key={entry.label}
                points={path.years
                  .map((item, i) => `${x(i)},${y(entry.value(item[field]))}`)
                  .join(" ")}
                fill="none"
                stroke={entry.color}
                strokeWidth={entry.width}
                strokeDasharray={entry.dash}
                opacity={
                  hoveredSeries === null || hoveredSeries === entry.label
                    ? 1
                    : 0.16
                }
                className="fc-flow-series-line"
              />
            ))}
            <g
              className="fc-flow-selected-marker"
              style={{ transform: `translateX(${x(index)}px)` }}
            >
              <line
                x1="0"
                x2="0"
                y1={top}
                y2={bottom}
                className="fc-axis-line fc-flow-year-marker"
                strokeDasharray="3 3"
              />
              {visibleSeries.map((entry) => (
                <circle
                  key={entry.label}
                  cx="0"
                  cy={y(entry.value(amounts))}
                  r="3.5"
                  fill={entry.color}
                  opacity={
                    hoveredSeries === null || hoveredSeries === entry.label
                      ? 1
                      : 0.16
                  }
                  className="fc-flow-series-point"
                />
              ))}
            </g>
            {ageTicks.map((i) => (
              <text key={i} x={x(i)} y={bottom + 25} textAnchor="middle">
                {path.years[i].age + (i === path.years.length - 1 ? 1 : 0)} 岁
              </text>
            ))}
          </svg>
        </div>
        {tooltipIndex !== null &&
        tooltipYear &&
        tooltipAmounts &&
        visibleSeries.length > 0 ? (
          <div
            className={`fc-flow-trend-tooltip${cursorTooltip ? `${cursorTooltip.flipX ? " is-left" : ""}${cursorTooltip.flipY ? " is-above" : ""}` : ` fc-flow-trend-tooltip--anchored${tooltipIndex > path.years.length * 0.62 ? " is-left" : ""}`}`}
            role="tooltip"
            style={
              cursorTooltip
                ? { left: cursorTooltip.x, top: cursorTooltip.y }
                : undefined
            }
          >
            <strong>
              {tooltipYear.age} → {tooltipYear.age + 1} 岁 · {unit}
            </strong>
            {visibleSeries.map((entry) => (
              <span key={entry.label}>
                <i
                  aria-hidden="true"
                  style={{
                    borderTopColor: entry.color,
                    borderTopStyle: entry.dash ? "dashed" : "solid",
                  }}
                />
                <em>{entry.label}</em>
                <b>{money(entry.value(tooltipAmounts))}</b>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="fc-chart-legend">
        {series.map((entry) => {
          const hidden = hiddenSeries.has(entry.label);
          return (
            <button
              key={entry.label}
              type="button"
              className={
                `${hidden ? "is-hidden" : ""}${
                  hoveredSeries !== null && hoveredSeries !== entry.label
                    ? " is-dimmed"
                    : ""
                }`.trim() || undefined
              }
              aria-pressed={!hidden}
              aria-label={`${hidden ? "显示" : "隐藏"}${entry.label}`}
              title={`${hidden ? "显示" : "隐藏"}${entry.label}`}
              onClick={() => toggleSeries(entry.label)}
              onPointerEnter={() => {
                if (!hidden) setHoveredSeries(entry.label);
              }}
              onPointerLeave={() => setHoveredSeries(null)}
              onFocus={() => {
                if (!hidden) setHoveredSeries(entry.label);
              }}
              onBlur={() => setHoveredSeries(null)}
            >
              <i
                className="fc-line-swatch"
                style={{
                  color: entry.color,
                  borderTopStyle: entry.dash ? "dashed" : "solid",
                }}
              />
              {entry.label}
            </button>
          );
        })}
      </div>
      <footer className="fc-chart-bottom">
        <span>
          {index === path.years.length - 1
            ? "路径终点"
            : "使用共用年度滑块查看"}{" "}
          · 点击图例可隐藏
        </span>
        <span>{nominal ? "未来面额，未扣除通胀" : "已扣除各路径通胀"}</span>
      </footer>
    </section>
  );
}

export function CashflowDetails({
  distribution,
  result,
  path,
  selectedYear,
  onSelectedYearChange,
  nominal,
  onNominalChange,
  currency,
  storageKey,
}: {
  distribution: React.ReactNode;
  result: FireResult;
  path: FireDetailPath;
  selectedYear: number;
  onSelectedYearChange(value: number): void;
  nominal: boolean;
  onNominalChange(value: boolean): void;
  currency: string;
  storageKey: string;
}) {
  const id = useId();
  const [hiddenColumns, setHiddenColumns] = useState<Set<DetailColumnKey>>(() =>
    readHiddenColumns(storageKey),
  );
  const rowStorageKey = storageKey.replace(
    /:hidden-columns$/,
    ":hidden-flow-rows",
  );
  const valueOrderStorageKey = storageKey.replace(
    /:hidden-columns$/,
    ":detail-value-order",
  );
  const [hiddenRows, setHiddenRows] = useState<Set<FlowRowKey>>(() =>
    readHiddenFlowRows(rowStorageKey),
  );
  const [valueOrder, setValueOrder] = useState<DetailValueOrder>(() =>
    readDetailValueOrder(valueOrderStorageKey),
  );
  const monthFirst = valueOrder === "month";
  const [activeWaterfall, setActiveWaterfall] = useState<{
    rowIndex: number;
    x: number;
    y: number;
    flipX: boolean;
    flipY: boolean;
  } | null>(null);
  const columnSettingsRef = useRef<HTMLDetailsElement>(null);
  const rowSettingsRef = useRef<HTMLDetailsElement>(null);
  const index = Math.min(selectedYear, path.years.length - 1);
  const year = path.years[index];
  const guardrailInitialYear = path.years.find(
    (item) => item.guardrailRateIsInitial,
  );
  const guardrailRetirementYear = path.years.find(
    (item) => item.age === result.config.retirementAge,
  );
  const guardrailManualRate =
    result.config.guardrailRateMode === "manual"
      ? result.config.guardrailManualRate
      : null;
  const guardrailBaselineRate =
    guardrailManualRate ??
    guardrailInitialYear?.guardrailWithdrawalRate ??
    null;
  const guardrailRatesMatch =
    guardrailBaselineRate !== null &&
    guardrailRetirementYear !== undefined &&
    guardrailRetirementYear.guardrailWithdrawalRate !== null &&
    Math.abs(
      guardrailBaselineRate - guardrailRetirementYear.guardrailWithdrawalRate,
    ) < 1e-9 &&
    (guardrailManualRate !== null ||
      guardrailInitialYear?.age === guardrailRetirementYear.age);
  const guardrailRateLabel =
    guardrailManualRate === null ? "护栏初始率" : "手动护栏率";
  const topRateLabel = usesGuardrailInitialRate(result.config)
    ? "护栏初始率"
    : "退休首年净提款率";
  const topRate = usesGuardrailInitialRate(result.config)
    ? result.guardrailInitialRate
    : result.retirementWithdrawalRate;
  const guardrailHelpText =
    guardrailBaselineRate === null
      ? `当前路径尚未建立护栏初始率。初始率建立后，按以下公式计算：\n上调线 = 护栏初始率 × ${result.config.guardrailRaiseThreshold}%\n下调线 = 护栏初始率 × ${result.config.guardrailCutThreshold}%\n净提款率低于上调线时，本年上调消费 ${result.config.guardrailAdjustment}%；高于下调线时，本年下调消费 ${result.config.guardrailAdjustment}%。`
      : `净提款率 =（进入当年护栏判断的年度策略消费预算 − 年度常规收入）÷ 年初资产\n${guardrailRateLabel}：${guardrailBaselineRate.toFixed(2)}%\n上调线：${guardrailBaselineRate.toFixed(2)}% × ${result.config.guardrailRaiseThreshold}% = ${(guardrailBaselineRate * (result.config.guardrailRaiseThreshold / 100)).toFixed(2)}%\n下调线：${guardrailBaselineRate.toFixed(2)}% × ${result.config.guardrailCutThreshold}% = ${(guardrailBaselineRate * (result.config.guardrailCutThreshold / 100)).toFixed(2)}%\n当前率低于上调线时，本年上调消费 ${result.config.guardrailAdjustment}%；高于下调线时，本年下调消费 ${result.config.guardrailAdjustment}%。数值随当前路径与护栏配置动态更新。`;
  const field = nominal ? "nominal" : "real";
  const amounts = year[field];
  const unit = `${currency} · ${nominal ? "名义金额" : "今日购买力"}`;
  const totalAssets = ASSET_ROWS.reduce(
    (total, [key]) => total + year.assets[key][field],
    0,
  );
  const totalReturnRate = nominal
    ? year.investmentReturnRate
    : year.realInvestmentReturnRate;
  const totalIncome = amounts.income + amounts.oneTimeIncome;
  const totalExpenses = amounts.spending + amounts.oneTimeExpenses;
  const closingBalanceLabel = year.failed ? "中止时资产" : "年末资产";
  const investmentAndInflationEffect =
    amounts.investmentGain -
    amounts.fees -
    amounts.taxes +
    (nominal ? 0 : amounts.inflationEffect);
  const showWaterfallTooltip = (
    event: React.PointerEvent<HTMLElement>,
    rowIndex: number,
  ) => {
    setActiveWaterfall({
      rowIndex,
      x: event.clientX,
      y: event.clientY,
      flipX: event.clientX > window.innerWidth - 440,
      flipY: event.clientY > window.innerHeight - 150,
    });
  };

  const activeMonths = Math.max(1, year.months);
  const movements: Array<{
    key: FlowRowKey;
    label: string;
    value: number;
    total?: boolean;
    monthly?: number;
    oneTime?: boolean;
  }> = [
    {
      key: "openingBalance",
      label: "年初资产",
      value: amounts.openingBalance,
      total: true,
    },
    {
      key: "income",
      label: "全年定期收入",
      value: amounts.income,
      monthly: Math.abs(amounts.income / activeMonths),
    },
    {
      key: "oneTimeIncome",
      label: "全年一次性收入",
      value: amounts.oneTimeIncome,
      oneTime: true,
    },
    {
      key: "spending",
      label: "全年生活支出",
      value: -amounts.spending,
      monthly: Math.abs(amounts.spending / activeMonths),
    },
    {
      key: "oneTimeExpenses",
      label: "全年一次性支出",
      value: -amounts.oneTimeExpenses,
      oneTime: true,
    },
    {
      key: "investmentGain",
      label: "全年投资盈亏",
      value: amounts.investmentGain,
      monthly: Math.abs(amounts.investmentGain / activeMonths),
    },
    {
      key: "fees",
      label: "全年管理费",
      value: -amounts.fees,
      monthly: Math.abs(amounts.fees / activeMonths),
    },
    {
      key: "taxes",
      label: "全年收益税",
      value: -amounts.taxes,
      monthly: Math.abs(amounts.taxes / activeMonths),
    },
    ...(!nominal
      ? [
          {
            key: "inflationEffect",
            label: "购买力折算影响",
            value: amounts.inflationEffect,
            monthly: Math.abs(amounts.inflationEffect / activeMonths),
          },
        ]
      : []),
    {
      key: "closingBalance",
      label: year.failed ? "中止时资产" : "年末资产",
      value: amounts.closingBalance,
      total: true,
    },
  ];
  let running = 0;
  const bars = movements.map((item) => {
    const from = item.total ? 0 : running;
    const to = item.total ? item.value : from + item.value;
    running = to;
    return { ...item, from, to };
  });
  const visibleBars = bars.filter((bar) => !hiddenRows.has(bar.key));
  const barMin = Math.min(0, ...bars.flatMap((b) => [b.from, b.to]));
  const barMax = Math.max(1, ...bars.flatMap((b) => [b.from, b.to]));
  const position = (value: number) =>
    ((value - barMin) / (barMax - barMin)) * 100;
  const hasDynamicSpending = result.config.strategy !== "fixed";
  const columns: Array<[DetailColumnKey, string]> = [
    ["openingBalance", "年初资产"],
    ["income", "定期收入"],
    ["oneTimeIncome", "一次性收入"],
    ["plannedSpending", "计划生活费"],
    ["annualInflation", "当年通胀"],
    ...(result.config.strategy === "guardrails"
      ? [["guardrailWithdrawalRate", "净提款率"] as [DetailColumnKey, string]]
      : []),
    ...(hasDynamicSpending
      ? [["spendingAdjustment", "消费调整"] as [DetailColumnKey, string]]
      : []),
    ["budgetSpending", "策略消费预算"],
    ["spending", "支出"],
    ["oneTimeExpenses", "一次性支出"],
    ["contributions", "投入资产"],
    ["withdrawals", "从资产提取"],
    ["investmentGain", "投资盈亏"],
    ["investmentReturn", "投资年化"],
    ["fees", "管理费"],
    ["taxes", "收益税"],
    ...(!nominal
      ? [
          ["inflationEffect", "通胀购买力变化"] as [
            keyof FireLedgerAmounts,
            string,
          ],
        ]
      : []),
    ["shortfall", "未付缺口"],
    ["status", "状态"],
  ];
  const visibleColumns = columns.filter(([key]) => !hiddenColumns.has(key));
  const toggleColumn = (key: DetailColumnKey) => {
    const next = new Set(hiddenColumns);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHiddenColumns(next);
    writeHiddenColumns(storageKey, next);
  };
  const toggleRow = (key: FlowRowKey) => {
    const next = new Set(hiddenRows);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHiddenRows(next);
    writeHiddenFlowRows(rowStorageKey, next);
  };
  const selectValueOrder = (next: DetailValueOrder) => {
    setValueOrder(next);
    writeDetailValueOrder(valueOrderStorageKey, next);
  };

  useEffect(() => {
    setHiddenColumns(readHiddenColumns(storageKey));
  }, [storageKey]);

  useEffect(() => {
    setValueOrder(readDetailValueOrder(valueOrderStorageKey));
  }, [valueOrderStorageKey]);

  useEffect(() => {
    setHiddenRows(readHiddenFlowRows(rowStorageKey));
  }, [rowStorageKey]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      for (const details of [
        columnSettingsRef.current,
        rowSettingsRef.current,
      ]) {
        if (
          details?.open &&
          event.target instanceof Node &&
          !details.contains(event.target)
        ) {
          details.open = false;
        }
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  return (
    <>
      {distribution}
      <section
        className="fc-card fc-flow fc-flow-waterfall-card"
        aria-labelledby={`${id}-title`}
      >
        <header className="fc-card-header">
          <div>
            <h3 id={`${id}-title`} className="fc-card-title">
              {currentPathScope(path.label)} · 年度资产变化与明细
            </h3>
            <p>{currency} · 与同屏图表共用情景和年度</p>
          </div>
          <div className="fc-card-header-actions">
            <span className="fc-badge">
              {year.age} → {year.age + 1} 岁
            </span>
            <div
              className="fc-toggle"
              role="group"
              aria-label="年度资产变化金额显示口径"
            >
              <button
                type="button"
                aria-pressed={!nominal}
                title="瀑布图和明细表已按该路径通胀折算，相当于今天的消费力"
                onClick={() => onNominalChange(false)}
              >
                今日购买力
              </button>
              <button
                type="button"
                aria-pressed={nominal}
                title="瀑布图和明细表显示未来账面数字，未扣除通胀"
                onClick={() => onNominalChange(true)}
              >
                名义金额
              </button>
            </div>
          </div>
        </header>
        <p className="fc-flow-note">
          下方瀑布图跟随共用年度与金额口径。投入与提取是收支抵扣后的资产转入、转出，不再重复计入资产变化。
        </p>
        <div className="fc-flow-summary" role="group" aria-label="资产变化摘要">
          <div>
            <span>年初资产</span>
            <strong>{money(amounts.openingBalance)}</strong>
          </div>
          <i>＋</i>
          <div>
            <span>全年收入</span>
            <strong>{money(totalIncome)}</strong>
            <small>{year.months} 个月累计</small>
          </div>
          <i>−</i>
          <div>
            <span>全年支出</span>
            <strong>{money(totalExpenses)}</strong>
            <small>生活支出及一次性支出</small>
          </div>
          <i>{investmentAndInflationEffect < 0 ? "−" : "＋"}</i>
          <div>
            <span>投资及购买力调整</span>
            <strong>{money(Math.abs(investmentAndInflationEffect))}</strong>
            <small>盈亏、费用、税与通胀影响</small>
          </div>
          <i>＝</i>
          <div className="is-total">
            <span>年末资产</span>
            <strong>{money(amounts.closingBalance)}</strong>
          </div>
        </div>
        <p className="fc-flow-waterfall-help">
          条形承接上一行后的余额。垂直虚线标出变化前后的余额：绿色条形向右表示资产增加，橙色条形向左表示资产减少。
        </p>
        <div
          className="fc-flow-waterfall"
          role="group"
          aria-label={`${year.age}岁资产变化，${unit}；年初${money(amounts.openingBalance)}，期末${money(amounts.closingBalance)}`}
        >
          <div className="fc-flow-waterfall-heading">
            <h4>这一年的资产如何变化</h4>
            <div className="fc-flow-waterfall-actions">
              <details
                ref={rowSettingsRef}
                className="fc-column-settings fc-row-settings"
              >
                <summary className="fc-btn small">
                  行显示
                  <span>
                    {visibleBars.length}/{bars.length}
                  </span>
                  <DisclosureChevron />
                </summary>
                <div className="fc-column-menu fc-row-menu">
                  <div className="fc-column-menu-head">
                    <strong>隐藏或显示资产变化行</strong>
                    <button
                      className="fc-btn small ghost"
                      type="button"
                      disabled={hiddenRows.size === 0}
                      onClick={() => {
                        const next = new Set<FlowRowKey>();
                        setHiddenRows(next);
                        writeHiddenFlowRows(rowStorageKey, next);
                      }}
                    >
                      全部显示
                    </button>
                  </div>
                  <fieldset>
                    <legend>资产变化行</legend>
                    {movements.map((movement) => (
                      <label key={movement.key}>
                        <input
                          type="checkbox"
                          checked={!hiddenRows.has(movement.key)}
                          onChange={() => toggleRow(movement.key)}
                        />
                        <span>{movement.label}</span>
                      </label>
                    ))}
                  </fieldset>
                </div>
              </details>
            </div>
          </div>
          {visibleBars.map((bar) => {
            const rowIndex = bars.indexOf(bar);
            const hasBar = Math.abs(bar.value) >= 0.5;
            const barColor = bar.total
              ? "var(--fc-soft-ink)"
              : bar.value < 0
                ? "var(--fc-amber)"
                : "var(--fc-green)";
            const direction = bar.total
              ? "total"
              : bar.value < 0
                ? "decrease"
                : "increase";
            const fromPosition = position(bar.from);
            const toPosition = position(bar.to);
            const expandsLeft = bar.to < bar.from;
            const barWidth = Math.abs(toPosition - fromPosition);
            const guidePositions = hasBar
              ? [`${fromPosition}%`, `${toPosition}%`]
              : [`${fromPosition}%`];
            const monthlyDetail =
              bar.monthly === undefined
                ? bar.oneTime
                  ? "；在发生月份一次计入"
                  : ""
                : `；月均 ${money(bar.monthly)} ${currency}`;
            const balanceDetail = bar.total
              ? ""
              : `；计入后资产 ${money(bar.to)} ${currency}`;
            const detail = `${bar.label}：${bar.value > 0 ? "+" : ""}${money(bar.value)} ${currency}${monthlyDetail}${balanceDetail}`;
            return (
              <div
                className="fc-flow-waterfall-row"
                key={bar.key}
                data-row-key={bar.key}
              >
                <span>
                  {bar.label}
                  {bar.monthly !== undefined ? (
                    <small>
                      （月均 {money(bar.monthly)} {currency}）
                    </small>
                  ) : bar.oneTime ? (
                    <small>（发生时一次计入）</small>
                  ) : null}
                </span>
                <div
                  className={`fc-flow-waterfall-track${hasBar ? " has-bar" : ""}${activeWaterfall?.rowIndex === rowIndex ? " is-active" : ""}`}
                  role={hasBar ? "group" : undefined}
                  tabIndex={hasBar ? 0 : undefined}
                  aria-label={detail}
                  onPointerEnter={(event) => {
                    if (hasBar) showWaterfallTooltip(event, rowIndex);
                  }}
                  onPointerMove={(event) => {
                    if (hasBar) showWaterfallTooltip(event, rowIndex);
                  }}
                  onPointerLeave={() => setActiveWaterfall(null)}
                  onFocus={(event) => {
                    if (!hasBar) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    setActiveWaterfall({
                      rowIndex,
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height,
                      flipX: false,
                      flipY: false,
                    });
                  }}
                  onBlur={() => setActiveWaterfall(null)}
                >
                  {guidePositions.map((guidePosition, guideIndex) => (
                    <i
                      key={`${bar.label}-guide-${guideIndex}`}
                      aria-hidden="true"
                      className="fc-flow-waterfall-guide"
                      style={{ left: guidePosition }}
                    />
                  ))}
                  {hasBar ? (
                    <i
                      aria-hidden="true"
                      className={`fc-flow-waterfall-bar is-${direction}`}
                      data-direction={direction}
                      style={{
                        left: expandsLeft ? "auto" : `${fromPosition}%`,
                        right: expandsLeft ? `${100 - fromPosition}%` : "auto",
                        width: `${barWidth}%`,
                        background: barColor,
                        color: barColor,
                      }}
                    />
                  ) : null}
                  {activeWaterfall?.rowIndex === rowIndex ? (
                    <span
                      className={`fc-flow-waterfall-tooltip${activeWaterfall.flipX ? " is-left" : ""}${activeWaterfall.flipY ? " is-above" : ""}`}
                      role="tooltip"
                      style={{
                        left: activeWaterfall.x,
                        top: activeWaterfall.y,
                      }}
                    >
                      <strong>{bar.label}</strong>
                      <span>
                        年度金额：{bar.value > 0 ? "+" : ""}
                        {money(bar.value)} {currency}
                      </span>
                      {bar.monthly !== undefined ? (
                        <span>
                          月均：{money(bar.monthly)} {currency}
                        </span>
                      ) : bar.oneTime ? (
                        <span>在发生月份一次计入</span>
                      ) : null}
                      {!bar.total ? (
                        <span>
                          计入后资产：{money(bar.to)} {currency}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </div>
                <b>
                  {!bar.total && bar.value > 0 ? "+" : ""}
                  {money(bar.value)}
                </b>
              </div>
            );
          })}
        </div>
        <div className="fc-flow-legend-spacer" aria-hidden="true" />
        <footer className="fc-chart-bottom fc-flow-waterfall-bottom">
          年初资产 ＋ 收入 ＋ 投资盈亏 − 支出 − 税费
          {!nominal ? " ＋ 通胀购买力变化" : ""} ＝
          期末资产。投入与提取是收支抵扣后的资产转入、转出，已包含在收支中，不再重复加减；收益税单列。
        </footer>
      </section>
      <section
        className="fc-card fc-flow fc-flow-table-card"
        aria-labelledby={`${id}-table-title`}
        data-selected-age={year.age}
        data-path-run={path.run}
        data-value-order={valueOrder}
      >
        <header className="fc-card-header">
          <div>
            <h3 id={`${id}-table-title`} className="fc-card-title">
              年度收支与资产明细 · {unit}
            </h3>
            <p>
              {path.label} · {closingBalanceLabel}{" "}
              {money(amounts.closingBalance)} {currency} ·
              与资产变化卡片共用年度和金额口径
            </p>
          </div>
          <div className="fc-flow-table-actions">
            <div
              className="fc-toggle"
              role="group"
              aria-label="年度明细金额显示口径"
            >
              <button
                type="button"
                aria-pressed={!nominal}
                title="明细表与资产变化已按该路径通胀折算，相当于今天的消费力"
                onClick={() => onNominalChange(false)}
              >
                今日购买力
              </button>
              <button
                type="button"
                aria-pressed={nominal}
                title="明细表与资产变化显示未来账面数字，未扣除通胀"
                onClick={() => onNominalChange(true)}
              >
                名义金额
              </button>
            </div>
            <div
              className="fc-toggle"
              role="group"
              aria-label="年度明细金额主次顺序"
            >
              <button
                type="button"
                aria-pressed={!monthFirst}
                title="年度金额在上，月均在下方"
                onClick={() => selectValueOrder("year")}
              >
                年在上
              </button>
              <button
                type="button"
                aria-pressed={monthFirst}
                title="月均在上，年度金额在下方"
                onClick={() => selectValueOrder("month")}
              >
                月在上
              </button>
            </div>
            <details ref={columnSettingsRef} className="fc-column-settings">
              <summary className="fc-btn small">
                列显示
                <span>
                  {visibleColumns.length}/{columns.length}
                </span>
                <DisclosureChevron />
              </summary>
              <div className="fc-column-menu">
                <div className="fc-column-menu-head">
                  <strong>隐藏或显示明细列</strong>
                  <button
                    className="fc-btn small ghost"
                    type="button"
                    disabled={hiddenColumns.size === 0}
                    onClick={() => {
                      const next = new Set<DetailColumnKey>();
                      setHiddenColumns(next);
                      writeHiddenColumns(storageKey, next);
                    }}
                  >
                    全部显示
                  </button>
                </div>
                <fieldset>
                  <legend>明细列</legend>
                  {columns.map(([key, label]) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(key)}
                        onChange={() => toggleColumn(key)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>
              </div>
            </details>
          </div>
        </header>
        <div
          className="fc-asset-summary"
          role="group"
          aria-labelledby={`${id}-assets-title`}
        >
          <div className="fc-asset-summary-head">
            <div>
              <h4 id={`${id}-assets-title`}>
                {year.failed ? "中止时" : "年末"}资产构成
              </h4>
              <p>
                {year.age} 岁 · {nominal ? "名义金额" : "今日购买力"} ·
                {year.failed
                  ? "余额归零，年化按中止前月份计算"
                  : "时间加权年化，管理费与收益税前"}
              </p>
            </div>
            <div className="fc-asset-summary-total">
              <span>{year.failed ? "中止时组合总额" : "年末组合总额"}</span>
              <strong>
                {money(totalAssets)} <small>{currency}</small>
              </strong>
            </div>
          </div>
          <table
            className="fc-asset-table"
            aria-labelledby={`${id}-assets-title`}
          >
            <thead>
              <tr>
                <th scope="col">资产类别</th>
                <th scope="col">年末金额</th>
                <th scope="col">投资占比</th>
                <th scope="col">年化增长</th>
              </tr>
            </thead>
            <tbody>
              {ASSET_ROWS.map(([key, label]) => {
                const asset = year.assets[key];
                const amount = asset[field];
                const share =
                  totalAssets > 1e-8
                    ? Math.min(100, Math.max(0, (amount / totalAssets) * 100))
                    : 0;
                const rate = nominal
                  ? asset.nominalReturnRate
                  : asset.realReturnRate;
                return (
                  <tr className={`fc-asset-row is-${key}`} key={key}>
                    <th scope="row">
                      <span className="fc-asset-name">
                        <i aria-hidden="true" />
                        {label}
                      </span>
                    </th>
                    <td>
                      <span className="fc-asset-amount">{money(amount)}</span>
                    </td>
                    <td>
                      <span className="fc-asset-allocation">
                        <span
                          className="fc-asset-allocation-track"
                          role="progressbar"
                          aria-label={`${label}投资占比`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(share * 10) / 10}
                          aria-valuetext={`${share.toFixed(1)}%`}
                        >
                          <i style={{ width: `${share}%` }} />
                        </span>
                        <b>{share.toFixed(1)}%</b>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`fc-asset-return${
                          rate === null
                            ? " is-empty"
                            : rate < 0
                              ? " is-negative"
                              : rate > 0
                                ? " is-positive"
                                : ""
                        }`}
                      >
                        {rate === null
                          ? "—"
                          : `${rate >= 0 ? "+" : "−"}${Math.abs(rate).toFixed(2)}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="fc-asset-row is-total">
                <th scope="row">组合合计</th>
                <td>
                  <span className="fc-asset-amount">{money(totalAssets)}</span>
                </td>
                <td>
                  <span className="fc-asset-total-share">
                    {totalAssets > 1e-8 ? "100.0%" : "—"}
                  </span>
                </td>
                <td>
                  <span
                    className={`fc-asset-return${
                      totalReturnRate === null
                        ? " is-empty"
                        : totalReturnRate < 0
                          ? " is-negative"
                          : " is-positive"
                    }`}
                  >
                    {totalReturnRate === null
                      ? "—"
                      : `${totalReturnRate >= 0 ? "+" : "−"}${Math.abs(totalReturnRate).toFixed(2)}%`}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="fc-flow-note">
          计划生活费是填写的支出，策略消费预算是提款策略调整后的花费，支出是实际能支付的金额。投资盈亏包含现金收益、未扣税费；提取可以动用本金。
          投资年化按月度组合收益链式计算并剔除投入、提取影响，今日购买力口径会扣除当年实际通胀；金额与收益率均为税费前口径。
          消费调整金额是策略消费预算相对当年计划的累计偏离；动态护栏中，绿色上箭头和红色下箭头只表示本年实际执行的上调或下调。此前调整仍保留时，本年可能显示累计金额但没有箭头，并标注“本年不变”。
          现金流可切换“年在上”或“月在上”；月均等于年度金额 ÷
          当年实际模拟月份。资产余额保留年度余额，不计算月均。
        </p>
        {result.config.strategy === "guardrails" && guardrailRetirementYear ? (
          <p
            className={`fc-guardrail-rate-note ${guardrailRatesMatch ? "is-consistent" : "is-mismatch"}`}
            role="note"
          >
            <strong>
              {guardrailManualRate !== null
                ? guardrailRatesMatch
                  ? "手动率与退休首年率一致"
                  : "手动率与退休首年率不同"
                : guardrailRatesMatch
                  ? "两率口径一致"
                  : "两率基准不同"}
            </strong>{" "}
            · 当前路径
            {guardrailManualRate !== null ? (
              <>
                ：手动护栏率 {guardrailManualRate.toFixed(2)}%；退休首年率{" "}
                {guardrailRetirementYear.guardrailWithdrawalRate === null
                  ? "无法计算"
                  : `${guardrailRetirementYear.guardrailWithdrawalRate.toFixed(2)}%`}{" "}
                · {guardrailRetirementYear.age} 岁。
              </>
            ) : guardrailInitialYear ? (
              <>
                ：护栏初始率{" "}
                {guardrailInitialYear.guardrailWithdrawalRate?.toFixed(2)}% ·{" "}
                {guardrailInitialYear.age} 岁；退休首年率{" "}
                {guardrailRetirementYear.guardrailWithdrawalRate === null
                  ? "无法计算"
                  : `${guardrailRetirementYear.guardrailWithdrawalRate.toFixed(2)}%`}{" "}
                · {guardrailRetirementYear.age} 岁。
              </>
            ) : (
              <>
                ：退休首年率{" "}
                {guardrailRetirementYear.guardrailWithdrawalRate === null
                  ? "无法计算"
                  : `${guardrailRetirementYear.guardrailWithdrawalRate.toFixed(2)}%`}
                ，退休首年没有正的净提款，尚未建立护栏初始率；后续首次出现正净提款时才会建立基准。
              </>
            )}
            <span className="fc-guardrail-rate-formula">
              口径：（进入当年护栏判断的年度策略消费预算 − 年度常规收入）÷
              年初资产，不含一次性收支。
              {result.totalRuns > 1 && topRate !== null
                ? ` 顶部 ${topRate.median.toFixed(2)}% 是全部路径${topRateLabel}的 P50，本表比较当前路径。`
                : ""}
            </span>
          </p>
        ) : null}
        <div
          className="fc-flow-table-scroll"
          role="region"
          aria-label="年度明细，可横向和纵向滚动，表头固定"
          tabIndex={0}
        >
          <table
            className="fc-flow-table"
            aria-labelledby={`${id}-table-title`}
          >
            <thead>
              <tr>
                <th scope="col">年龄区间</th>
                {visibleColumns.map(([key, label]) => {
                  const helpText =
                    key === "guardrailWithdrawalRate"
                      ? guardrailHelpText
                      : COLUMN_HELP_TEXT[key];
                  return (
                    <th scope="col" key={key}>
                      {label}
                      {helpText ? (
                        <button
                          type="button"
                          className="fc-column-help"
                          aria-label={helpText}
                          data-tooltip={helpText}
                        >
                          ?
                        </button>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {path.years.map((item, itemIndex) => {
                const months = Math.max(1, item.months);
                return (
                  <tr
                    key={item.age}
                    className={`${itemIndex === index ? "is-selected " : ""}${item.failed ? "is-failed" : ""}`.trim()}
                  >
                    <th scope="row">
                      <button
                        className="fc-btn small ghost"
                        type="button"
                        aria-pressed={itemIndex === index}
                        onClick={() => onSelectedYearChange(itemIndex)}
                      >
                        {item.age} → {item.age + 1} 岁
                      </button>
                    </th>
                    {visibleColumns.map(([key]) => {
                      if (key === "status") {
                        return (
                          <td key={key}>
                            {item.failed ? `失败 · ${item.months}个月` : "全年"}
                          </td>
                        );
                      }
                      if (key === "spendingAdjustment") {
                        const planned = item[field].plannedSpending;
                        const budget = item[field].budgetSpending;
                        const adjustment = budget - planned;
                        const adjustmentPercent =
                          Math.abs(planned) >= 0.5
                            ? Math.abs(adjustment / planned) * 100
                            : null;
                        const isGuardrail =
                          result.config.strategy === "guardrails";
                        const guardrailAction = item.guardrailAction;
                        const direction = isGuardrail
                          ? guardrailAction === "raise"
                            ? "up"
                            : guardrailAction === "cut"
                              ? "down"
                              : "none"
                          : adjustment > 0
                            ? "up"
                            : adjustment < 0
                              ? "down"
                              : "none";
                        const hasAdjustment = Math.abs(adjustment) >= 0.5;
                        const actionLabel = isGuardrail
                          ? item.guardrailRateIsInitial
                            ? "本年建立护栏初始率"
                            : guardrailAction === "raise"
                              ? `本年上调 ${result.config.guardrailAdjustment}%`
                              : guardrailAction === "cut"
                                ? `本年下调 ${result.config.guardrailAdjustment}%`
                                : "本年不变"
                          : direction === "up"
                            ? "上调"
                            : "下调";
                        const cumulativeLabel =
                          adjustmentPercent === null
                            ? ""
                            : `累计较计划 ${adjustment > 0 ? "+" : "−"}${adjustmentPercent.toFixed(1)}%`;
                        const description = isGuardrail
                          ? `计划 ${money(planned)}，策略预算 ${money(budget)}；${actionLabel}${cumulativeLabel ? `，${cumulativeLabel}` : ""}；月均偏离 ${money(Math.abs(adjustment) / months)}`
                          : direction === "none"
                            ? `计划 ${money(planned)}，策略预算 ${money(budget)}，未调整`
                            : `计划 ${money(planned)}，策略预算 ${money(budget)}，${direction === "up" ? "上调" : "下调"} ${money(Math.abs(adjustment))}${adjustmentPercent === null ? "" : `，调整 ${adjustmentPercent.toFixed(1)}%`}；月均 ${money(Math.abs(adjustment) / months)}`;
                        const visualDirection =
                          isGuardrail && hasAdjustment && direction === "none"
                            ? "hold"
                            : direction;
                        return (
                          <td key={key}>
                            <span
                              className={`fc-spending-adjustment is-${visualDirection}`}
                              title={description}
                              aria-label={description}
                              data-guardrail-action={
                                isGuardrail ? guardrailAction : undefined
                              }
                            >
                              {!hasAdjustment ? (
                                "—"
                              ) : (
                                <>
                                  <span className="fc-spending-adjustment-main">
                                    {direction === "none" ? null : (
                                      <svg
                                        viewBox="0 0 12 18"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d={
                                            direction === "up"
                                              ? "M6 16V3M2 7l4-4 4 4"
                                              : "M6 2v13M2 11l4 4 4-4"
                                          }
                                        />
                                      </svg>
                                    )}
                                    <strong>
                                      {adjustment > 0 ? "+" : "−"}
                                      {money(
                                        Math.abs(
                                          monthFirst
                                            ? adjustment / months
                                            : adjustment,
                                        ),
                                      )}
                                    </strong>
                                  </span>
                                  <small>
                                    {isGuardrail
                                      ? actionLabel
                                      : direction === "up"
                                        ? "上调"
                                        : "下调"}
                                    {!isGuardrail && adjustmentPercent !== null
                                      ? ` ${adjustmentPercent.toFixed(1)}%`
                                      : ""}
                                    {isGuardrail && cumulativeLabel
                                      ? ` · ${cumulativeLabel}`
                                      : ""}{" "}
                                    · {monthFirst ? "全年" : "月均"}{" "}
                                    {money(
                                      Math.abs(
                                        monthFirst
                                          ? adjustment
                                          : adjustment / months,
                                      ),
                                    )}
                                  </small>
                                </>
                              )}
                            </span>
                          </td>
                        );
                      }
                      if (key === "guardrailWithdrawalRate") {
                        const rate = item.guardrailWithdrawalRate;
                        const isInitial = item.guardrailRateIsInitial;
                        const isRetirement =
                          item.age === result.config.retirementAge;
                        const matchesManualBaseline =
                          guardrailManualRate !== null &&
                          guardrailBaselineRate !== null &&
                          rate !== null &&
                          Math.abs(guardrailBaselineRate - rate) < 1e-9;
                        const className =
                          (isInitial && isRetirement) ||
                          (isRetirement && matchesManualBaseline)
                            ? "is-consistent"
                            : isInitial
                              ? "is-initial"
                              : isRetirement
                                ? "is-mismatch"
                                : "";
                        const label =
                          isInitial && isRetirement
                            ? "护栏初始率 · 退休首年率"
                            : isInitial
                              ? "护栏初始率"
                              : isRetirement && matchesManualBaseline
                                ? "手动护栏率 · 退休首年率"
                                : isRetirement
                                  ? "退休首年率"
                                  : rate === null
                                    ? ""
                                    : item.guardrailAction === "raise"
                                      ? "本年上调"
                                      : item.guardrailAction === "cut"
                                        ? "本年下调"
                                        : "区间内 · 不变";
                        const rateVsBaseline =
                          guardrailBaselineRate && rate !== null
                            ? (rate / guardrailBaselineRate) * 100
                            : null;
                        const description =
                          rate === null
                            ? "年初资产为零，无法计算净提款率"
                            : `护栏净提款率 ${rate.toFixed(2)}%，按（进入当年护栏判断的年度策略消费预算 − 年度常规收入）÷ 年初资产计算，不含一次性收支，策略消费预算不是实际支付支出；${rateVsBaseline === null ? "" : `相当于${guardrailRateLabel}的 ${rateVsBaseline.toFixed(1)}%；`}${label || "用于当年护栏判断"}`;
                        return (
                          <td key={key}>
                            <span
                              className={`fc-guardrail-rate ${className}`.trim()}
                              title={description}
                              aria-label={description}
                            >
                              <strong>
                                {rate === null ? "—" : `${rate.toFixed(2)}%`}
                              </strong>
                              {label ? <small>{label}</small> : null}
                            </span>
                          </td>
                        );
                      }
                      if (key === "annualInflation") {
                        const growth =
                          item.cpiStart > 0
                            ? (item.cpiEnd / item.cpiStart - 1) * 100
                            : null;
                        return (
                          <td key={key}>
                            <span className="fc-flow-table-value">
                              <span>
                                {growth === null
                                  ? "—"
                                  : `${growth >= 0 ? "+" : "−"}${Math.abs(growth).toFixed(1)}%`}
                              </span>
                              <small>
                                预期 {result.config.inflationRate.toFixed(1)}%/年
                              </small>
                            </span>
                          </td>
                        );
                      }
                      if (key === "investmentReturn") {
                        const rate = nominal
                          ? item.investmentReturnRate
                          : item.realInvestmentReturnRate;
                        return (
                          <td key={key}>
                            <span className="fc-flow-table-value">
                              <span>
                                {rate === null
                                  ? "—"
                                  : `${rate >= 0 ? "+" : "−"}${Math.abs(rate).toFixed(2)}%`}
                              </span>
                              <small>
                                {rate === null
                                  ? "无可用投资资本"
                                  : `${nominal ? "名义" : "购买力"} · 税费前`}
                              </small>
                            </span>
                          </td>
                        );
                      }
                      const value = item[field][key];
                      const hasMonthlyAverage =
                        MONTHLY_AVERAGE_COLUMNS.has(key) &&
                        Math.abs(value) >= 0.5;
                      const previousYear =
                        itemIndex > 0 ? path.years[itemIndex - 1] : null;
                      const openingBalanceChange =
                        key === "openingBalance" && previousYear
                          ? item[field].openingBalance -
                            previousYear[field].openingBalance
                          : 0;
                      const openingBalanceTone =
                        Math.abs(openingBalanceChange) < 0.5
                          ? "is-neutral"
                          : openingBalanceChange > 0
                            ? "is-increase"
                            : "is-decrease";
                      return (
                        <td key={key}>
                          <span className="fc-flow-table-value">
                            <span>
                              {money(
                                monthFirst && hasMonthlyAverage
                                  ? value / months
                                  : value,
                              )}
                            </span>
                            {hasMonthlyAverage ? (
                              <small>
                                {monthFirst ? "全年" : "月均"}{" "}
                                {money(monthFirst ? value : value / months)}
                              </small>
                            ) : key === "openingBalance" && previousYear ? (
                              <small className={openingBalanceTone}>
                                {Math.abs(openingBalanceChange) < 0.5
                                  ? "与去年持平"
                                  : `较去年 ${openingBalanceChange > 0 ? "+" : "−"}${money(Math.abs(openingBalanceChange))}`}
                              </small>
                            ) : null}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="fc-flow-pagination">
          共 {path.years.length} 年 · 点击年龄查看当年变化
        </p>
      </section>
    </>
  );
}
