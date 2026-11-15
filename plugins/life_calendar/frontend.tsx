import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  boundaryAge,
  buildCalendarMonth,
  cloneLifeCalendarConfig,
  computeLifeCalendar,
  normalizeMonthBoundary,
  type CalendarCell,
  type CalendarCellState,
  type CalendarMonth,
  type LifeCalendarConfig,
  type LifeCalendarPlan,
} from "./life-calendar";
import { LIFE_CALENDAR_STYLES } from "./styles";

type Props = {
  ledgerId: string;
  canWrite: boolean;
  api: {
    fetchLocal(path: string, init?: RequestInit): Promise<Response>;
  };
};

type ConfigView = {
  revision: string;
  config: LifeCalendarConfig;
  configError: string | null;
  configPath: string;
  exists: boolean;
};

type CustomTypeDraft = {
  id: string;
  label: string;
  startMonth: string;
  endMonth: string;
  display: "fill" | "underline";
  color: string;
};

type FormDraft = {
  birthday: string;
  lifeExpectancy: string;
  retirementAge: string;
  sleepHours: string;
  workHours: string;
  showNominalAge: boolean;
  customTypes: CustomTypeDraft[];
};

type ViewTransition = {
  direction: "expand" | "collapse";
  origin: { x: number; y: number };
};

type LifeBudgetKey = "lived" | "free-before" | "free-after" | "work" | "sleep";

const CUSTOM_TYPE_COLORS = [
  "#6587c7",
  "#c879a1",
  "#d38a49",
  "#6f9b68",
  "#8b75b5",
  "#b96b52",
];
const LIFE_GRID_COLUMNS = 10;
const ACTUAL_AGE_FIRST_CELL_INDEX = 1;

const BASE_STAGES: Array<{
  id: string;
  label: string;
  state: CalendarCellState;
  color: string;
}> = [
  { id: "base-past", label: "已走过", state: "past", color: "var(--lc-teal)" },
  {
    id: "base-current",
    label: "现在",
    state: "current",
    color: "var(--lc-amber)",
  },
  {
    id: "base-future",
    label: "退休前",
    state: "future",
    color: "var(--lc-future)",
  },
  {
    id: "base-retirement",
    label: "退休",
    state: "retirement",
    color: "var(--lc-retire)",
  },
];

type BaseStageSummary = (typeof BASE_STAGES)[number] & {
  cellCount: number;
  range: string;
};

const DATE_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
});

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function todayIso(): string {
  const now = new Date();
  return [
    String(now.getFullYear()).padStart(4, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value: Date): string {
  return DATE_FORMAT.format(value);
}

function formatYears(value: number): string {
  return Math.max(0, value).toFixed(1);
}

function summarizeBaseStages(plan: LifeCalendarPlan): BaseStageSummary[] {
  return BASE_STAGES.map((stage) => {
    const cells = plan.cells.filter((cell) => cell.state === stage.state);
    const first = cells[0]?.year;
    const last = cells.at(-1)?.year;
    const range =
      first === undefined || last === undefined
        ? "无"
        : first === last
          ? String(first)
          : `${first}–${last}`;
    return { ...stage, cellCount: cells.length, range };
  });
}

function formatMonth(
  value: string,
  birthday: string,
  showNominalAge: boolean,
  lifeExpectancy: number,
  today: string,
): string {
  const label =
    value === "start"
      ? "起点"
      : value === "end"
        ? "终点"
        : value.replace("-", ".");
  const age = boundaryAge(
    value,
    birthday,
    showNominalAge,
    lifeExpectancy,
    today,
  );
  return age === null ? label : `${label} · ${age} 岁`;
}

function normalizedBoundary(
  value: string,
  birthday: string,
  showNominalAge: boolean,
  edge: "start" | "end",
): string {
  return normalizeMonthBoundary(value, birthday, showNominalAge, edge) ?? value;
}

function toFormDraft(config: LifeCalendarConfig): FormDraft {
  return {
    birthday: config.birthday,
    lifeExpectancy: String(config.lifeExpectancy),
    retirementAge: String(config.retirementAge),
    sleepHours: String(config.sleepHours),
    workHours: String(config.workHours),
    showNominalAge: config.showNominalAge,
    customTypes: config.customTypes.map((type) => ({
      id: type.id,
      label: type.label,
      startMonth: type.startMonth,
      endMonth: type.endMonth,
      display: type.display,
      color: type.color,
    })),
  };
}

function numberFromInput(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function lifeExpectancyFromDraft(draft: FormDraft): number | undefined {
  const value = numberFromInput(draft.lifeExpectancy);
  return Number.isInteger(value) && value >= 1 ? value : undefined;
}

function toConfig(draft: FormDraft): LifeCalendarConfig {
  return {
    version: 1,
    birthday: draft.birthday,
    lifeExpectancy: numberFromInput(draft.lifeExpectancy),
    retirementAge: numberFromInput(draft.retirementAge),
    sleepHours: numberFromInput(draft.sleepHours),
    workHours: numberFromInput(draft.workHours),
    showNominalAge: draft.showNominalAge,
    customTypes: draft.customTypes.map((type) => ({
      id: type.id,
      label: type.label,
      startMonth: normalizedBoundary(
        type.startMonth,
        draft.birthday,
        draft.showNominalAge,
        "start",
      ),
      endMonth: normalizedBoundary(
        type.endMonth,
        draft.birthday,
        draft.showNominalAge,
        "end",
      ),
      display: type.display,
      color: type.color,
    })),
  };
}

function nextCustomTypeId(types: CustomTypeDraft[]): string {
  let index = types.length + 1;
  while (types.some((type) => type.id === `custom-${index}`)) index += 1;
  return `custom-${index}`;
}

function requestView(
  api: Props["api"],
  ledgerId: string,
  signal?: AbortSignal,
): Promise<ConfigView> {
  return api
    .fetchLocal(
      `/api-gateway/local/plugins/life_calendar/api?ledgerId=${encodeURIComponent(ledgerId)}`,
      { signal },
    )
    .then(async (response) => {
      const payload = (await response.json()) as ConfigView & {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "读取配置失败");
      return payload;
    });
}

function cellClass(
  cell: CalendarCell,
  activeStageId: string | null = null,
  marksRetirementStart = false,
): string {
  const activeBaseStage = activeStageId
    ? BASE_STAGES.find((stage) => stage.id === activeStageId)
    : null;
  const baseHighlighted = activeBaseStage?.state === cell.state;
  const hasFill = cell.fillSegments.length > 0;
  const hasUnderline = cell.customTypes.some(
    (type) => type.display === "underline",
  );
  const highlightedStage = activeStageId
    ? cell.customTypes.find((type) => type.id === activeStageId)
    : null;
  return [
    "lc-cell",
    `is-${cell.state}`,
    cell.isCurrent ? "lc-current-button" : "",
    marksRetirementStart ? "lc-retirement-marker" : "",
    cell.customTypes.length > 0 ? "has-custom-stage" : "",
    hasFill ? "has-custom-fill" : "",
    hasUnderline ? "has-custom-underline" : "",
    highlightedStage || baseHighlighted ? "is-stage-highlighted" : "",
    highlightedStage?.display === "fill" ? "is-stage-fill-highlighted" : "",
    highlightedStage?.display === "underline"
      ? "is-stage-underline-highlighted"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function formatPercent(value: number): string {
  return `${Number((value * 100).toFixed(4))}%`;
}

function fillSegmentLayout(cell: CalendarCell) {
  return cell.fillSegments.map((segment) => {
    const months = segment.endMonth - segment.startMonth + 1;
    return {
      ...segment,
      left: formatPercent((segment.startMonth - 1) / 12),
      width: formatPercent(months / 12),
    };
  });
}

function cellBaseColor(cell: CalendarCell): string {
  switch (cell.state) {
    case "past":
      return "var(--lc-teal)";
    case "current":
      return "var(--lc-amber)";
    case "retirement":
      return "var(--lc-retire)";
    default:
      return "var(--lc-future)";
  }
}

function stageCellStyle(
  cell: CalendarCell,
  activeStageId: string | null,
): CSSProperties {
  const fillStage = cell.fillSegments[0];
  const activeBaseStage = activeStageId
    ? BASE_STAGES.find((stage) => stage.id === activeStageId)
    : null;
  const baseHighlighted = activeBaseStage?.state === cell.state;
  const highlightedStage = activeStageId
    ? cell.customTypes.find((type) => type.id === activeStageId)
    : null;
  const currentColor = cell.isCurrent ? "var(--lc-amber)" : null;
  return {
    "--lc-stage-color": currentColor ?? fillStage?.color ?? "transparent",
    "--lc-stage-highlight-color":
      currentColor ??
      highlightedStage?.color ??
      activeBaseStage?.color ??
      fillStage?.color ??
      "transparent",
    "--lc-cell-border-base":
      currentColor ?? fillStage?.color ?? cellBaseColor(cell),
  } as CSSProperties;
}

function cellLabel(
  cell: CalendarCell,
  yearLabel = String(cell.year),
): string {
  const custom = cell.customTypes.map((type) => type.label).join("、");
  const age = cell.isCurrent
    ? `当前年龄 ${cell.displayAge.toFixed(1)} 岁`
    : `年龄 ${cell.displayAge} 岁`;
  if (cell.isCurrent) {
    return `打开 ${yearLabel} 年 ${new Date().getMonth() + 1} 月的本月视图，${age}${custom ? `，${custom}` : ""}`;
  }
  const state =
    cell.state === "past"
      ? "已经走过"
      : cell.state === "retirement"
        ? "退休"
        : "未来";
  return `${yearLabel} 年，${age}，${state}${custom ? `，${custom}` : ""}`;
}

function CellContent({
  cell,
  activeStageId,
  yearLabel,
}: {
  cell: CalendarCell;
  activeStageId: string | null;
  yearLabel: string;
}) {
  const underlineStages = cell.customTypes.filter(
    (type) => type.display === "underline",
  );
  const fillSegments = fillSegmentLayout(cell);
  const activeFillSegments = activeStageId
    ? fillSegments.filter((segment) => segment.id === activeStageId)
    : [];
  const isBirthYearRange = yearLabel.includes("-");
  return (
    <>
      {fillSegments.length > 0 ? (
        <span
          className={`lc-cell-canvas${activeFillSegments.length > 0 ? " is-muted" : ""}`}
          style={
            {
              "--lc-cell-base-color": cellBaseColor(cell),
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <span className="lc-cell-fills">
            {fillSegments.map((segment) => (
              <i
                className="lc-fill-segment"
                key={segment.id}
                style={{
                  background: segment.color,
                  left: segment.left,
                  width: segment.width,
                }}
              />
            ))}
          </span>
        </span>
      ) : null}
      {activeFillSegments.length > 0 ? (
        <span className="lc-active-fill-layer" aria-hidden="true">
          {activeFillSegments.map((segment) => (
            <i
              className="lc-active-fill"
              key={segment.id}
              style={{
                background: segment.color,
                left: segment.left,
                width: segment.width,
              }}
            />
          ))}
        </span>
      ) : null}
      {cell.isCurrent && fillSegments.length > 0 ? (
        <span className="lc-current-style-overlay" aria-hidden="true" />
      ) : null}
      <span className="lc-cell-number">
        {cell.isCurrent ? cell.displayAge.toFixed(1) : cell.displayAge}
      </span>
      <span className={`lc-cell-year${isBirthYearRange ? " is-range" : ""}`}>
        {yearLabel}
      </span>
      {underlineStages.length > 0 ? (
        <span className="lc-cell-customs" aria-hidden="true">
          {underlineStages.map((type) => (
            <i
              className={activeStageId === type.id ? "is-active" : undefined}
              key={type.id}
              style={{ background: type.color }}
            />
          ))}
        </span>
      ) : null}
    </>
  );
}

function LifeGrid({
  plan,
  today,
  onOpenMonth,
  onOpenSettings,
}: {
  plan: LifeCalendarPlan;
  today: string;
  onOpenMonth(anchor: HTMLElement): void;
  onOpenSettings(): void;
}) {
  const currentDisplayAge =
    plan.cells[plan.currentOrdinal - 1]?.displayAge ?? plan.currentAgeExact;
  const visibleCells = plan.showNominalAge
    ? plan.cells
    : plan.cells.slice(ACTUAL_AGE_FIRST_CELL_INDEX);
  const totalYears = plan.livedYearsExact + plan.remainingYearsExact;
  const budgetWidth = (years: number) =>
    totalYears > 0 ? (years / totalYears) * 100 : 0;
  const sleepShare =
    (plan.sleepYears / Math.max(plan.remainingYearsExact, 1)) * 100;
  const workShare =
    (plan.workYears / Math.max(plan.remainingYearsExact, 1)) * 100;
  const freeBeforeShare =
    (plan.freeYearsBeforeRetirement / Math.max(plan.remainingYearsExact, 1)) *
    100;
  const freeAfterShare =
    (plan.freeYearsAfterRetirement / Math.max(plan.remainingYearsExact, 1)) *
    100;
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [activeBudgetKey, setActiveBudgetKey] = useState<LifeBudgetKey | null>(
    null,
  );
  const budgetItems: Array<{
    key: LifeBudgetKey;
    label: string;
    years: number;
    share: string;
  }> = [
    {
      key: "lived",
      label: "已走过",
      years: plan.livedYearsExact,
      share: `${Math.round(plan.progressPercent)}% 人生`,
    },
    {
      key: "free-before",
      label: "退休前自由",
      years: plan.freeYearsBeforeRetirement,
      share: `余生 ${Math.round(freeBeforeShare)}%`,
    },
    {
      key: "free-after",
      label: "退休后自由",
      years: plan.freeYearsAfterRetirement,
      share: `余生 ${Math.round(freeAfterShare)}%`,
    },
    {
      key: "work",
      label: "退休前工作",
      years: plan.workYears,
      share: `余生 ${Math.round(workShare)}%`,
    },
    {
      key: "sleep",
      label: "睡眠",
      years: plan.sleepYears,
      share: `余生 ${Math.round(sleepShare)}%`,
    },
  ];
  return (
    <section className="lc-calendar-card" aria-labelledby="lc-grid-title">
      <div className="lc-card-head">
        <div className="lc-card-intro">
          <div className="lc-card-titleline">
            <span className="lc-card-kicker">Life calendar · 一年一格</span>
            <span className="lc-card-count">至 {plan.lifeExpectancy} 岁</span>
            <button
              type="button"
              className="lc-settings-open"
              aria-label="打开人生日历设置"
              onClick={onOpenSettings}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
              </svg>
              设置
            </button>
          </div>
          <h2 id="lc-grid-title">
            把这一生，<em>摊开来看。</em>
          </h2>
          <p>
            以出生日期为起点，一格代表一年。走过的年份沉淀成青色，正在经历的
            一年亮起，退休之后铺成一片新绿。
          </p>
        </div>
        <div className="lc-card-stats" aria-label="人生进度">
          <strong>{Math.round(plan.progressPercent)}%</strong>
          <b>
            {currentDisplayAge.toFixed(1)}
            <small> 岁</small>
          </b>
        </div>
      </div>
      <div
        className={`lc-life-budget${activeBudgetKey ? " is-inspecting" : ""}`}
        role="img"
        aria-label={`人生时间构成：已走过 ${formatYears(plan.livedYearsExact)} 年，退休前自由 ${formatYears(plan.freeYearsBeforeRetirement)} 年，退休后自由 ${formatYears(plan.freeYearsAfterRetirement)} 年，睡眠 ${formatYears(plan.sleepYears)} 年，退休前工作 ${formatYears(plan.workYears)} 年`}
      >
        {budgetItems.map((item) => {
          const active = activeBudgetKey === item.key;
          return (
            <span
              key={item.key}
              className={[
                `is-${item.key}`,
                active ? "is-active" : "",
                activeBudgetKey && !active ? "is-muted" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width: `${budgetWidth(item.years)}%` }}
              onMouseEnter={() => setActiveBudgetKey(item.key)}
              onMouseLeave={() => setActiveBudgetKey(null)}
            />
          );
        })}
      </div>
      <div className="lc-life-budget-key" aria-label="人生时间构成说明">
        {budgetItems.map((item) => {
          const active = activeBudgetKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={active ? "is-active" : undefined}
              aria-pressed={active}
              onMouseEnter={() => setActiveBudgetKey(item.key)}
              onMouseLeave={() => setActiveBudgetKey(null)}
              onFocus={() => setActiveBudgetKey(item.key)}
              onBlur={() => setActiveBudgetKey(null)}
            >
              <i className={`is-${item.key}`} aria-hidden="true" />
              {item.label}
              <b>{formatYears(item.years)} 年</b>
              <em>{item.share}</em>
            </button>
          );
        })}
      </div>
      <div className="lc-calendar-body">
        <div className="lc-calendar-main">
          <ol
            className={`lc-grid${activeStageId ? " is-inspecting-stage" : ""}`}
            aria-label="人生年份格子"
            style={
              {
                "--lc-rows": Math.ceil(
                  visibleCells.length / LIFE_GRID_COLUMNS,
                ),
              } as CSSProperties
            }
          >
            {visibleCells.map((cell) => {
              const marksRetirementStart =
                cell.year === plan.retirementYear && !cell.isCurrent;
              const yearLabel =
                !plan.showNominalAge &&
                cell.index === ACTUAL_AGE_FIRST_CELL_INDEX
                  ? `${plan.birthday.getUTCFullYear()}-${cell.year}`
                  : String(cell.year);
              const label = cellLabel(cell, yearLabel);
              return cell.isCurrent ? (
                <li key={cell.index}>
                  <button
                    type="button"
                    className={cellClass(
                      cell,
                      activeStageId,
                      marksRetirementStart,
                    )}
                    style={stageCellStyle(cell, activeStageId)}
                    aria-label={label}
                    onClick={(event) => onOpenMonth(event.currentTarget)}
                  >
                    <CellContent
                      cell={cell}
                      activeStageId={activeStageId}
                      yearLabel={yearLabel}
                    />
                  </button>
                </li>
              ) : (
                <li key={cell.index}>
                  <div
                    className={cellClass(
                      cell,
                      activeStageId,
                      marksRetirementStart,
                    )}
                    style={stageCellStyle(cell, activeStageId)}
                    title={label}
                    aria-label={label}
                    role="img"
                  >
                    <CellContent
                      cell={cell}
                      activeStageId={activeStageId}
                      yearLabel={yearLabel}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="lc-grid-footer">
            <div className="lc-legend" aria-label="格子图例">
              {BASE_STAGES.map((stage) => {
                const label =
                  stage.state === "retirement"
                    ? `${plan.retirementYear} 年起退休`
                    : stage.label;
                const active = activeStageId === stage.id;
                return (
                  <button
                    type="button"
                    className={`lc-legend-item${active ? " is-active" : ""}`}
                    key={stage.id}
                    style={
                      {
                        "--lc-legend-color": stage.color,
                      } as CSSProperties
                    }
                    aria-pressed={active}
                    onMouseEnter={() => setActiveStageId(stage.id)}
                    onMouseLeave={() => setActiveStageId(null)}
                    onFocus={() => setActiveStageId(stage.id)}
                    onBlur={() => setActiveStageId(null)}
                    onClick={() =>
                      setActiveStageId((current) =>
                        current === stage.id ? null : stage.id,
                      )
                    }
                  >
                    <i aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="lc-current-hint">点击黄色格子进入本月视图</p>
          </div>
        </div>
        <aside className="lc-stage-panel" aria-label="人生阶段">
          <div className="lc-stage-panel-head">
            <span>Stages</span>
            <strong>人生阶段</strong>
          </div>
          <section className="lc-custom-stage-section">
            <div className="lc-stage-subhead">
              <span>自定义覆盖</span>
              <small>{plan.customTypes.length} 个阶段</small>
            </div>
            {plan.customTypes.length > 0 ? (
              <ul className="lc-stage-list">
                {plan.customTypes.map((type) => {
                  const cellCount = plan.cells.filter((cell) =>
                    cell.customTypes.some((item) => item.id === type.id),
                  ).length;
                  const active = activeStageId === type.id;
                  return (
                    <li key={type.id}>
                      <button
                        type="button"
                        className={`lc-stage-item${active ? " is-active" : ""}`}
                        style={
                          { "--lc-stage-color": type.color } as CSSProperties
                        }
                        aria-pressed={active}
                        onMouseEnter={() => setActiveStageId(type.id)}
                        onMouseLeave={() => setActiveStageId(null)}
                        onFocus={() => setActiveStageId(type.id)}
                        onBlur={() => setActiveStageId(null)}
                        onPointerDown={(event) => event.preventDefault()}
                      >
                        <i
                          className={
                            type.display === "underline"
                              ? "is-underline"
                              : undefined
                          }
                          aria-hidden="true"
                        />
                        <span>
                          <strong>{type.label}</strong>
                          <small className="lc-stage-range">
                            <span>
                              {formatMonth(
                                type.startMonth,
                                plan.birthday.toISOString().slice(0, 10),
                                plan.showNominalAge,
                                plan.lifeExpectancy,
                                today,
                              )}
                            </span>
                            <span>
                              {formatMonth(
                                type.endMonth,
                                plan.birthday.toISOString().slice(0, 10),
                                plan.showNominalAge,
                                plan.lifeExpectancy,
                                today,
                              )}
                            </span>
                          </small>
                        </span>
                        <em>{cellCount} 格</em>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="lc-stage-empty">
                在设置中添加阶段后，可在这里悬停查看对应的年份。
              </p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}

function MonthView({
  plan,
  month,
  onBack,
}: {
  plan: LifeCalendarPlan;
  month: CalendarMonth;
  onBack(): void;
}) {
  return (
    <section className="lc-month-card" aria-labelledby="lc-month-title">
      <div style={{ padding: "25px clamp(20px, 2.8vw, 36px) 0" }}>
        <button type="button" className="lc-back" onClick={onBack}>
          <span aria-hidden="true">←</span>
          回到人生格子
        </button>
      </div>
      <div className="lc-month-heading">
        <div>
          <span className="lc-card-kicker">This month / 本月视图</span>
          <h2 id="lc-month-title">{month.monthLabel}</h2>
          <p>
            第 {plan.currentOrdinal} 个年头，今年{" "}
            {plan.currentAge + (plan.showNominalAge ? 1 : 0)} 岁。
            你现在正站在人生的这一格里，再次点击黄色日期即可回到年视图。
          </p>
        </div>
        <div className="lc-month-stamp">
          <strong>{String(month.day).padStart(2, "0")}</strong>
          <span>今天 · 星期{WEEKDAYS[(new Date().getDay() + 6) % 7]}</span>
        </div>
      </div>
      <div className="lc-month-body">
        <table className="lc-month-table">
          <caption>{month.monthLabel}日历</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((weekday) => (
                <th key={weekday} scope="col">
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {month.weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <td key={`${weekIndex}-${dayIndex}`}>
                    {day ? (
                      day.isToday ? (
                        <button
                          type="button"
                          className="lc-day is-today lc-day-current"
                          aria-current="date"
                          aria-label={`返回年视图，${month.year}年${month.month}月${day.day}日，今天`}
                          onClick={onBack}
                        >
                          {day.day}
                        </button>
                      ) : (
                        <div
                          className={[
                            "lc-day",
                            day.isPast ? "is-past" : "",
                            day.weekday >= 5 ? "is-weekend" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          aria-label={`${month.year}年${month.month}月${day.day}日`}
                        >
                          {day.day}
                        </div>
                      )
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <aside className="lc-month-panel" aria-label="本月进度">
          <span className="lc-month-panel-label">Month progress</span>
          <div className="lc-month-fraction">
            <strong>{month.day}</strong>
            <span>/ {month.daysInMonth} 天</span>
          </div>
          <p>
            本月已经走过 {Math.round(month.progressPercent)}%，还有{" "}
            {month.daysLeft} 天。
          </p>
          <div
            className="lc-month-progress"
            aria-label={`本月进度 ${Math.round(month.progressPercent)}%`}
          >
            <i style={{ width: `${month.progressPercent}%` }} />
          </div>
          <dl className="lc-month-details">
            <div>
              <dt>出生日期</dt>
              <dd>{formatDate(plan.birthday)}</dd>
            </div>
            <div>
              <dt>当前年份</dt>
              <dd>{plan.currentYear}</dd>
            </div>
            <div>
              <dt>退休年份</dt>
              <dd>{plan.retirementYear}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function SettingsDialog({
  dialogRef,
  draft,
  summary,
  baseStages,
  canWrite,
  busy,
  dirty,
  valid,
  today,
  onClose,
  onSave,
  onUpdate,
  onShowNominalAge,
  onAddCustomType,
  onUpdateCustomType,
  onRemoveCustomType,
  onMoveCustomType,
}: {
  dialogRef: React.RefObject<HTMLElement | null>;
  draft: FormDraft;
  summary?: {
    age: string;
    retirementYear: number;
    totalYears: number;
  };
  baseStages: BaseStageSummary[];
  canWrite: boolean;
  busy: boolean;
  dirty: boolean;
  valid: boolean;
  today: string;
  onClose(): void;
  onSave(): void;
  onUpdate<
    K extends keyof Pick<
      FormDraft,
      | "birthday"
      | "lifeExpectancy"
      | "retirementAge"
      | "sleepHours"
      | "workHours"
    >,
  >(
    key: K,
    value: FormDraft[K],
  ): void;
  onShowNominalAge(value: boolean): void;
  onAddCustomType(): void;
  onUpdateCustomType(
    id: string,
    patch: Partial<Omit<CustomTypeDraft, "id">>,
  ): void;
  onRemoveCustomType(id: string): void;
  onMoveCustomType(sourceId: string, targetId: string): void;
}) {
  const [draggingTypeId, setDraggingTypeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const lifeExpectancy = lifeExpectancyFromDraft(draft);

  function finishDragging() {
    setDraggingTypeId(null);
    setDropTargetId(null);
  }

  function commitBoundary(
    type: CustomTypeDraft,
    field: "startMonth" | "endMonth",
  ) {
    const value = type[field];
    const normalized = normalizeMonthBoundary(
      value,
      draft.birthday,
      draft.showNominalAge,
      field === "startMonth" ? "start" : "end",
    );
    if (normalized && normalized !== value) {
      onUpdateCustomType(type.id, { [field]: normalized });
    }
  }

  return (
    <div
      className="lc-settings-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="lc-settings lc-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lc-settings-title"
        tabIndex={-1}
      >
        <div className="lc-settings-head">
          <div className="lc-settings-kickerline">
            <span>Your parameters</span>
            <button
              type="button"
              className="lc-settings-close"
              aria-label="关闭人生日历设置"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="lc-settings-title-row">
            <div>
              <h2 id="lc-settings-title">人生的坐标</h2>
              <p>
                修改后会即时更新预览。只有点击保存，参数才会写入当前账本的配置文件。
              </p>
            </div>
            {summary ? (
              <div className="lc-settings-summary" aria-label="参数预览">
                <div>
                  <span>现在</span>
                  <strong>{summary.age} 岁</strong>
                </div>
                <div>
                  <span>退休</span>
                  <strong>{summary.retirementYear}</strong>
                </div>
                <div>
                  <span>总跨度</span>
                  <strong>{summary.totalYears} 年</strong>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <form
          className="lc-settings-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <section className="lc-settings-section">
            <div className="lc-settings-section-head">
              <h3>时间参数</h3>
              <span>决定格子数量、退休位置与时间预算</span>
            </div>
            <div className="lc-settings-fields">
              <label className="lc-field">
                <span className="lc-field-label">
                  出生日期
                  <small>Birthday</small>
                </span>
                <input
                  className="lc-input"
                  type="date"
                  value={draft.birthday}
                  max={today}
                  disabled={!canWrite}
                  onChange={(event) =>
                    onUpdate("birthday", event.currentTarget.value)
                  }
                />
              </label>
              <label className="lc-field">
                <span className="lc-field-label">
                  预期寿命
                  <small>1–120 年</small>
                </span>
                <input
                  className="lc-input"
                  type="number"
                  min={1}
                  max={120}
                  step={1}
                  value={draft.lifeExpectancy}
                  disabled={!canWrite}
                  onChange={(event) =>
                    onUpdate("lifeExpectancy", event.currentTarget.value)
                  }
                />
              </label>
              <label className="lc-field">
                <span className="lc-field-label">
                  退休年龄
                  <small>{draft.showNominalAge ? "按虚岁" : "按实岁"}</small>
                </span>
                <input
                  className="lc-input"
                  type="number"
                  min={0}
                  max={lifeExpectancy}
                  step={1}
                  value={draft.retirementAge}
                  disabled={!canWrite}
                  onChange={(event) =>
                    onUpdate("retirementAge", event.currentTarget.value)
                  }
                />
              </label>
              <label className="lc-field">
                <span className="lc-field-label">
                  每日睡眠
                  <small>小时/天</small>
                </span>
                <input
                  className="lc-input"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={draft.sleepHours}
                  disabled={!canWrite}
                  onChange={(event) =>
                    onUpdate("sleepHours", event.currentTarget.value)
                  }
                />
              </label>
              <label className="lc-field">
                <span className="lc-field-label">
                  退休前工作
                  <small>小时/天</small>
                </span>
                <input
                  className="lc-input"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={draft.workHours}
                  disabled={!canWrite}
                  onChange={(event) =>
                    onUpdate("workHours", event.currentTarget.value)
                  }
                />
              </label>
              <label className="lc-age-mode">
                <span>
                  <strong>虚岁显示</strong>
                  <small>
                    {draft.showNominalAge ? "首格 1 岁" : "实岁首格 0 岁"}
                  </small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={draft.showNominalAge}
                  disabled={!canWrite}
                  aria-label="虚岁显示"
                  onChange={(event) =>
                    onShowNominalAge(event.currentTarget.checked)
                  }
                />
                <i aria-hidden="true" />
              </label>
            </div>
          </section>
          <div
            className="lc-default-types"
            role="group"
            aria-labelledby="lc-default-types-title"
          >
            <div className="lc-custom-head">
              <div className="lc-custom-title">
                <span id="lc-default-types-title">默认底色</span>
                <small>位于最底层，仅显示自定义阶段未覆盖的月份</small>
              </div>
            </div>
            <ul
              className="lc-base-stage-list is-settings"
              aria-label="默认底色阶段"
            >
              {baseStages.map((stage) => (
                <li
                  key={stage.id}
                  style={{ "--lc-stage-color": stage.color } as CSSProperties}
                >
                  <i aria-hidden="true" />
                  <span>
                    <strong>{stage.label}</strong>
                    <small>{stage.range}</small>
                  </span>
                  <em>{stage.cellCount} 格</em>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="lc-custom-types"
            role="group"
            aria-labelledby="lc-custom-types-title"
          >
            <div className="lc-custom-head">
              <div className="lc-custom-title">
                <span id="lc-custom-types-title">自定义类型</span>
                <small>年龄会按当前虚实岁设置转换为年月</small>
              </div>
              <button
                type="button"
                className="lc-add-type"
                aria-label="添加自定义类型"
                disabled={!canWrite || draft.customTypes.length >= 12}
                onClick={onAddCustomType}
              >
                + 添加
              </button>
            </div>
            {draft.customTypes.length === 0 ? (
              <p className="lc-custom-empty">
                添加阶段后，格子上会出现对应颜色的标记。
              </p>
            ) : (
              <div className="lc-custom-list">
                {draft.customTypes.map((type, index) => (
                  <div
                    className={[
                      "lc-custom-row",
                      draggingTypeId === type.id ? "is-dragging" : "",
                      dropTargetId === type.id && draggingTypeId !== type.id
                        ? "is-drop-target"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={type.id}
                    onDragOver={(event) => {
                      if (!draggingTypeId || !canWrite) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropTargetId(type.id);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const sourceId =
                        draggingTypeId ||
                        event.dataTransfer.getData("text/plain");
                      if (sourceId && sourceId !== type.id) {
                        onMoveCustomType(sourceId, type.id);
                      }
                      finishDragging();
                    }}
                  >
                    <button
                      type="button"
                      className="lc-drag-handle"
                      aria-label={`拖动排序：${type.label || index + 1}`}
                      title="拖动排序，也可用上下方向键调整"
                      draggable={canWrite && !busy}
                      disabled={!canWrite || busy}
                      onDragStart={(event) => {
                        setDraggingTypeId(type.id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", type.id);
                      }}
                      onDragEnd={finishDragging}
                      onKeyDown={(event) => {
                        if (
                          event.key !== "ArrowUp" &&
                          event.key !== "ArrowDown"
                        )
                          return;
                        const target =
                          draft.customTypes[
                            index + (event.key === "ArrowUp" ? -1 : 1)
                          ];
                        if (!target) return;
                        event.preventDefault();
                        onMoveCustomType(type.id, target.id);
                      }}
                    >
                      <svg
                        viewBox="0 0 10 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        {[3, 8, 13].map((y) => (
                          <React.Fragment key={y}>
                            <circle cx="2.5" cy={y} r="1.1" />
                            <circle cx="7.5" cy={y} r="1.1" />
                          </React.Fragment>
                        ))}
                      </svg>
                    </button>
                    <input
                      className="lc-color-input"
                      type="color"
                      value={type.color}
                      aria-label={`类型 ${index + 1} 的颜色`}
                      disabled={!canWrite}
                      onChange={(event) =>
                        onUpdateCustomType(type.id, {
                          color: event.currentTarget.value,
                        })
                      }
                    />
                    <input
                      className="lc-mini-input is-name"
                      type="text"
                      maxLength={24}
                      value={type.label}
                      aria-label={`类型 ${index + 1} 名称`}
                      disabled={!canWrite}
                      onChange={(event) =>
                        onUpdateCustomType(type.id, {
                          label: event.currentTarget.value,
                        })
                      }
                    />
                    <select
                      className="lc-mini-select is-display"
                      value={type.display}
                      aria-label={`类型 ${index + 1} 展示方式`}
                      title="按覆盖月份分格填充，或在格底添加彩色下划线"
                      disabled={!canWrite}
                      onChange={(event) =>
                        onUpdateCustomType(type.id, {
                          display: event.currentTarget.value as
                            | "fill"
                            | "underline",
                        })
                      }
                    >
                      <option value="fill">填充</option>
                      <option value="underline">下划线</option>
                    </select>
                    <label className="lc-boundary-field is-start-month">
                      <input
                        className="lc-mini-input"
                        type="text"
                        value={type.startMonth}
                        maxLength={7}
                        spellCheck={false}
                        autoCapitalize="none"
                        placeholder="YYYY-MM / now+3 / 年龄"
                        aria-label={`类型 ${index + 1} 开始边界，可填年月、now+N、年龄或 start`}
                        title="now+3 表示当前月份往后 3 年；年龄会自动转换为年月；填 start 表示从第一格开始"
                        disabled={!canWrite}
                        onChange={(event) =>
                          onUpdateCustomType(type.id, {
                            startMonth: event.currentTarget.value,
                          })
                        }
                        onBlur={() => commitBoundary(type, "startMonth")}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                      />
                      {boundaryAge(
                        type.startMonth,
                        draft.birthday,
                        draft.showNominalAge,
                        lifeExpectancy,
                        today,
                      ) !== null ? (
                        <small>
                          {boundaryAge(
                            type.startMonth,
                            draft.birthday,
                            draft.showNominalAge,
                            lifeExpectancy,
                            today,
                          )}
                          岁
                        </small>
                      ) : null}
                    </label>
                    <span className="lc-range-dash" aria-hidden="true">
                      –
                    </span>
                    <label className="lc-boundary-field is-end-month">
                      <input
                        className="lc-mini-input"
                        type="text"
                        value={type.endMonth}
                        maxLength={7}
                        spellCheck={false}
                        autoCapitalize="none"
                        placeholder="YYYY-MM / now+3 / 年龄"
                        aria-label={`类型 ${index + 1} 结束边界，可填年月、now+N、年龄或 end`}
                        title="now+3 表示当前月份往后 3 年；年龄会自动转换为年月；填 end 表示覆盖到最后一格"
                        disabled={!canWrite}
                        onChange={(event) =>
                          onUpdateCustomType(type.id, {
                            endMonth: event.currentTarget.value,
                          })
                        }
                        onBlur={() => commitBoundary(type, "endMonth")}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                      />
                      {boundaryAge(
                        type.endMonth,
                        draft.birthday,
                        draft.showNominalAge,
                        lifeExpectancy,
                        today,
                      ) !== null ? (
                        <small>
                          {boundaryAge(
                            type.endMonth,
                            draft.birthday,
                            draft.showNominalAge,
                            lifeExpectancy,
                            today,
                          )}
                          岁
                        </small>
                      ) : null}
                    </label>
                    <button
                      type="button"
                      className="lc-remove-type"
                      aria-label={`删除类型 ${type.label || index + 1}`}
                      disabled={!canWrite}
                      onClick={() => onRemoveCustomType(type.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lc-settings-actions">
            <p className="lc-form-note">
              {canWrite
                ? "保存后会写入当前账本的 plugins/life_calendar/config.json。"
                : "当前账本为只读，参数无法保存。"}
            </p>
            <button
              type="submit"
              className="lc-save"
              disabled={!canWrite || !dirty || busy || !valid}
            >
              {busy ? "保存中…" : dirty ? "保存设置" : "设置已保存"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function LifeCalendarPage({ ledgerId, canWrite, api }: Props) {
  const today = todayIso();
  const [view, setView] = useState<ConfigView | null>(null);
  const [draft, setDraft] = useState<FormDraft | null>(null);
  const [mode, setMode] = useState<"grid" | "month">("grid");
  const [viewTransition, setViewTransition] = useState<ViewTransition | null>(
    null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const stageRef = useRef<HTMLElement>(null);
  const settingsDialogRef = useRef<HTMLElement>(null);
  const lastOriginRef = useRef<{ x: number; y: number } | null>(null);
  const switchingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void requestView(api, ledgerId, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        setView(next);
        setDraft(toFormDraft(cloneLifeCalendarConfig(next.config)));
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [api, ledgerId]);

  useEffect(() => {
    if (!settingsOpen) return;
    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSettingsOpen(false);
      }
    };
    const frame = requestAnimationFrame(() => {
      settingsDialogRef.current
        ?.querySelector<HTMLButtonElement>(".lc-settings-close")
        ?.focus();
    });
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      returnFocus?.focus();
    };
  }, [settingsOpen]);

  const plan = useMemo(
    () => (draft ? computeLifeCalendar(toConfig(draft), today) : null),
    [draft, today],
  );
  const baseStages = plan?.ok ? summarizeBaseStages(plan) : [];
  const month = useMemo(() => buildCalendarMonth(today), [today]);
  const draftConfig = useMemo(() => (draft ? toConfig(draft) : null), [draft]);
  const dirty =
    view !== null &&
    draftConfig !== null &&
    JSON.stringify(view.config) !== JSON.stringify(draftConfig);

  useLayoutEffect(() => {
    if (!viewTransition) return;
    const stage = stageRef.current;
    const yearCard =
      stage?.querySelector<HTMLElement>(".lc-calendar-card") ?? null;
    const monthCard =
      stage?.querySelector<HTMLElement>(".lc-month-card") ?? null;
    const finish = () => {
      switchingRef.current = false;
      setViewTransition(null);
      if (viewTransition.direction === "collapse") setMode("grid");
    };
    if (
      !yearCard ||
      !monthCard ||
      typeof yearCard.animate !== "function" ||
      typeof monthCard.animate !== "function" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
      return;
    }

    let cancelled = false;
    const expanding = viewTransition.direction === "expand";
    const easing = "cubic-bezier(.2, .76, .24, 1)";
    monthCard.style.transformOrigin = `${viewTransition.origin.x}px ${viewTransition.origin.y}px`;
    monthCard.style.willChange = "transform, opacity";
    yearCard.style.willChange = "transform, opacity";

    const backgroundAnimation = yearCard.animate(
      expanding
        ? [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(.93)", opacity: 0.38 },
          ]
        : [
            { transform: "scale(.93)", opacity: 0.38 },
            { transform: "scale(1)", opacity: 1 },
          ],
      {
        duration: expanding ? 410 : 510,
        delay: expanding ? 0 : 55,
        easing,
        fill: "both",
      },
    );
    const foregroundAnimation = monthCard.animate(
      viewTransition.direction === "expand"
        ? [
            { transform: "scale(.13)", opacity: 0.12 },
            { transform: "scale(1)", opacity: 1 },
          ]
        : [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(.32)", opacity: 0.35, offset: 0.72 },
            { transform: "scale(.13)", opacity: 0, offset: 1 },
          ],
      {
        duration: expanding ? 510 : 565,
        delay: expanding ? 55 : 0,
        easing,
        fill: "both",
      },
    );
    Promise.all([backgroundAnimation.finished, foregroundAnimation.finished])
      .then(() => {
        if (cancelled) return;
        monthCard.style.transformOrigin = "";
        monthCard.style.willChange = "";
        yearCard.style.willChange = "";
        finish();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      backgroundAnimation.cancel();
      foregroundAnimation.cancel();
    };
  }, [viewTransition]);

  function openMonth(anchor: HTMLElement) {
    if (mode !== "grid" || switchingRef.current) return;
    const stage = stageRef.current;
    const stageRect = stage?.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const origin = stageRect
      ? {
          x: anchorRect.left + anchorRect.width / 2 - stageRect.left,
          y: anchorRect.top + anchorRect.height / 2 - stageRect.top,
        }
      : {
          x: (stage?.clientWidth ?? 0) / 2,
          y: (stage?.clientHeight ?? 0) / 2,
        };
    lastOriginRef.current = origin;
    switchingRef.current = true;
    setViewTransition({ direction: "expand", origin });
    setMode("month");
  }

  function closeMonth() {
    if (mode !== "month" || switchingRef.current) return;
    const origin = lastOriginRef.current ?? {
      x: (stageRef.current?.clientWidth ?? 0) / 2,
      y: (stageRef.current?.clientHeight ?? 0) / 2,
    };
    switchingRef.current = true;
    setViewTransition({ direction: "collapse", origin });
  }

  function update<
    K extends keyof Pick<
      FormDraft,
      | "birthday"
      | "lifeExpectancy"
      | "retirementAge"
      | "sleepHours"
      | "workHours"
    >,
  >(key: K, value: FormDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setNotice("");
    setError("");
  }

  async function save() {
    if (!draftConfig || !view || !canWrite || busy || !plan?.ok) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/life_calendar/api/save",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: view.revision,
            config: draftConfig,
          }),
        },
      );
      const payload = (await response.json()) as ConfigView & {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "保存设置失败");
      setView(payload);
      setDraft(toFormDraft(cloneLifeCalendarConfig(payload.config)));
      setNotice("设置已保存到 plugins/life_calendar/config.json");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  function addCustomType() {
    setDraft((current) => {
      if (!current || current.customTypes.length >= 12) return current;
      const index = current.customTypes.length;
      const startMonth = today.slice(0, 7);
      const endMonth = `${Number(startMonth.slice(0, 4)) + 1}${startMonth.slice(4)}`;
      return {
        ...current,
        customTypes: [
          ...current.customTypes,
          {
            id: nextCustomTypeId(current.customTypes),
            label: "新阶段",
            startMonth,
            endMonth,
            display: "fill",
            color: CUSTOM_TYPE_COLORS[index % CUSTOM_TYPE_COLORS.length]!,
          },
        ],
      };
    });
    setNotice("");
    setError("");
  }

  function setShowNominalAge(showNominalAge: boolean) {
    setDraft((current) => (current ? { ...current, showNominalAge } : current));
    setNotice("");
    setError("");
  }

  function updateCustomType(
    id: string,
    patch: Partial<Omit<CustomTypeDraft, "id">>,
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            customTypes: current.customTypes.map((type) =>
              type.id === id ? { ...type, ...patch } : type,
            ),
          }
        : current,
    );
    setNotice("");
    setError("");
  }

  function removeCustomType(id: string) {
    setDraft((current) =>
      current
        ? {
            ...current,
            customTypes: current.customTypes.filter((type) => type.id !== id),
          }
        : current,
    );
    setNotice("");
    setError("");
  }

  function moveCustomType(sourceId: string, targetId: string) {
    setDraft((current) => {
      if (!current || sourceId === targetId) return current;
      const sourceIndex = current.customTypes.findIndex(
        (type) => type.id === sourceId,
      );
      const targetIndex = current.customTypes.findIndex(
        (type) => type.id === targetId,
      );
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const customTypes = [...current.customTypes];
      const [moved] = customTypes.splice(sourceIndex, 1);
      if (!moved) return current;
      customTypes.splice(targetIndex, 0, moved);
      return { ...current, customTypes };
    });
    setNotice("");
    setError("");
  }

  return (
    <section className="lc-shell">
      <style>{LIFE_CALENDAR_STYLES}</style>
      <div className="lc-page">
        {error ? (
          <div className="lc-error" role="alert">
            <strong>操作没有完成</strong>
            <span>{error}</span>
          </div>
        ) : null}
        {view?.configError ? (
          <div className="lc-warning" role="alert">
            <strong>配置无法读取</strong>
            <span>
              `{view.configPath}`：{view.configError}
              。当前展示默认值，修正或保存后会覆盖它。
            </span>
          </div>
        ) : null}
        {notice ? (
          <div className="lc-success" role="status">
            {notice}
          </div>
        ) : null}

        <div className="lc-workspace">
          <main ref={stageRef} className="lc-stage">
            {loading ? (
              <div className="lc-loading" role="status">
                正在读取 life_calendar/config.json…
              </div>
            ) : !draft ? (
              <div className="lc-loading" role="alert">
                无法准备人生日历。
              </div>
            ) : !plan?.ok ? (
              <div className="lc-empty" role="alert">
                <strong>还差一个有效日期</strong>
                <span>{plan?.error ?? "请打开设置检查参数。"}</span>
                <button
                  type="button"
                  className="lc-empty-settings"
                  onClick={() => setSettingsOpen(true)}
                >
                  调整参数
                </button>
              </div>
            ) : (
              <>
                <div
                  className="lc-view-layer"
                  hidden={mode === "month" && !viewTransition}
                >
                  <LifeGrid
                    plan={plan}
                    today={today}
                    onOpenMonth={openMonth}
                    onOpenSettings={() => setSettingsOpen(true)}
                  />
                </div>
                {month ? (
                  <div
                    className="lc-view-layer"
                    hidden={mode === "grid" && !viewTransition}
                  >
                    <MonthView plan={plan} month={month} onBack={closeMonth} />
                  </div>
                ) : null}
              </>
            )}
          </main>
          {settingsOpen && draft ? (
            <SettingsDialog
              dialogRef={settingsDialogRef}
              draft={draft}
              baseStages={baseStages}
              summary={
                plan?.ok
                  ? {
                      age: (
                        plan.currentAgeExact + (plan.showNominalAge ? 1 : 0)
                      ).toFixed(1),
                      retirementYear: plan.retirementYear,
                      totalYears: plan.lifeExpectancy,
                    }
                  : undefined
              }
              canWrite={canWrite}
              busy={busy}
              dirty={dirty}
              valid={Boolean(plan?.ok)}
              today={today}
              onClose={() => setSettingsOpen(false)}
              onSave={save}
              onUpdate={update}
              onShowNominalAge={setShowNominalAge}
              onAddCustomType={addCustomType}
              onUpdateCustomType={updateCustomType}
              onRemoveCustomType={removeCustomType}
              onMoveCustomType={moveCustomType}
            />
          ) : null}
        </div>

        <footer className="lc-footnote">
          <span>Data stays in your ledger</span>
          <span>plugins/life_calendar/config.json</span>
        </footer>
      </div>
    </section>
  );
}
