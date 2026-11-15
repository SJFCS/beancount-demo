import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  defaultFireConfig,
  simulateFireAsync,
  simulateFirePath,
  upgradeFireConfig,
  usesGuardrailInitialRate,
  validateFireConfig,
  type FireConfig,
  type FireCashflow,
  type FireResult,
} from "./model";
import { AllocationSlider } from "./allocation-slider";
import { DragNumber } from "./drag-number";
import { FIRE_STYLES } from "./styles";
import { CashflowDetails, CashflowTrend } from "./cashflow-details";
import {
  defaultFirePathRun,
  PathExplorerDialog,
  SelectedPathDock,
} from "./path-explorer";
import { SpendingCutCard } from "./spending-cut-card";

type PluginApi = {
  fetchLocal(path: string, init?: RequestInit): Promise<Response>;
};
type Props = {
  ledgerId: string;
  primaryCurrency?: string;
  api: PluginApi;
  canWrite?: boolean;
};
type FirePlan = {
  id: string;
  name: string;
  config: FireConfig;
};
type ConfirmationRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "default" | "danger";
};
type PlansView = {
  revision: string;
  activeId: string | null;
  plans: FirePlan[];
  exists: boolean;
  error: string | null;
};
type NumericKey = {
  [K in keyof FireConfig]-?: FireConfig[K] extends number ? K : never;
}[keyof FireConfig];
type IconName =
  | "leaf"
  | "sliders"
  | "play"
  | "save"
  | "reset"
  | "shield"
  | "chart"
  | "info"
  | "lock"
  | "inflation"
  | "user"
  | "pie"
  | "wallet"
  | "trend"
  | "target"
  | "pen"
  | "trash"
  | "chevron";

function Icon({ name, size = 15 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    leaf: (
      <>
        <path d="M19 4C10 2 3 7 5 14c2 7 12 5 14-10Z" />
        <path d="m5 20 9-11M8 14l6 1" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h6m4 0h6M4 12h10m4 0h2M4 18h2m4 0h10" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="16" cy="12" r="2" />
        <circle cx="8" cy="18" r="2" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7Z" />,
    save: (
      <>
        <path d="M5 3h12l4 4v14H3V3Zm2 0v6h10V3M7 21v-8h10v8" />
        <path d="M14 4v3" />
      </>
    ),
    reset: (
      <>
        <path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 4v16h17M7 15l4-5 4 3 5-8" />
      </>
    ),
    inflation: (
      <>
        <path d="m4 17 5-5 4 3 7-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
      </>
    ),
    pie: (
      <>
        <path d="M21 12a9 9 0 1 1-9-9v9Z" />
        <path d="M15 3.6A9 9 0 0 1 20.4 9H15Z" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h13v4" />
        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6H8" />
        <path d="M16 13h4" />
      </>
    ),
    trend: (
      <>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    pen: (
      <>
        <path d="m14.5 4.5 5 5L9 20H4v-5Z" />
        <path d="m12.5 6.5 5 5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m6 7 1 13h10l1-13" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7v1" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ConfirmationDialog({
  request,
  titleId,
  descriptionId,
  panelRef,
  cancelRef,
  onCancel,
  onConfirm,
}: {
  request: ConfirmationRequest;
  titleId: string;
  descriptionId: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
  cancelRef: React.RefObject<HTMLButtonElement | null>;
  onCancel(): void;
  onConfirm(): void;
}) {
  return (
    <div
      className="fc-confirm-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        className={`fc-confirm-dialog${
          request.tone === "danger" ? " is-danger" : ""
        }`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <span className="fc-confirm-icon" aria-hidden="true">
          <Icon name={request.tone === "danger" ? "trash" : "info"} size={16} />
        </span>
        <div className="fc-confirm-copy">
          <h2 id={titleId}>{request.title}</h2>
          <p id={descriptionId}>{request.message}</p>
        </div>
        <div className="fc-confirm-actions">
          <button
            ref={cancelRef}
            type="button"
            className="fc-btn"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className={`fc-btn${request.tone === "danger" ? " danger" : " primary"}`}
            onClick={onConfirm}
          >
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CalculationFlowArrow() {
  return (
    <svg
      className="fc-calculation-flow-arrow"
      viewBox="0 0 20 24"
      aria-hidden="true"
    >
      <path d="M10 2v18M5 15l5 5 5-5" />
    </svg>
  );
}

function CalculationFlowBranchArrows({ merge = false }: { merge?: boolean }) {
  return (
    <svg
      className="fc-calculation-flow-branch-arrows"
      viewBox="0 0 640 48"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={
          merge
            ? "M160 1v15h160v18M154 28l6 6 6-6M480 1v15H320v18M474 28l6 6 6-6"
            : "M320 1v15H160v18M154 28l6 6 6-6M320 16h160v18M474 28l6 6 6-6"
        }
      />
    </svg>
  );
}

function prepareLoadedPlan(loadedPlan: FireConfig): FireConfig {
  const upgraded = upgradeFireConfig(loadedPlan);
  return {
    ...upgraded,
    cashflows: upgraded.cashflows.map((cashflow) =>
      cashflow.endAtRetirement
        ? cashflow
        : {
            ...cashflow,
            startAge: Math.min(upgraded.lifeExpectancy, cashflow.startAge),
            endAge: Math.min(upgraded.lifeExpectancy, cashflow.endAge),
          },
    ),
  };
}

function readBooleanPreference(key: string, fallback: boolean): boolean {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function writeBooleanPreference(key: string, value: boolean) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

const STRATEGIES: Record<
  FireConfig["strategy"],
  { title: string; description: string }
> = {
  fixed: {
    title: "固定购买力提款",
    description:
      "退休后按各年龄计划的生活支出生活，支出随通胀调整。定期收入先抵扣支出，差额从投资组合提取。",
  },
  percentage: {
    title: "固定比例提款",
    description:
      "退休后每年按年初组合余额的固定比例安排消费，不再跟随计划支出，市场回落时支出也会下降。成功率需结合消费水平一起判断。",
  },
  guardrails: {
    title: "动态护栏提款",
    description:
      "以各年龄计划支出为起点，按年度净提款率是否越过消费上调、下调触发线来调整消费，并受最低、最高消费比例约束。成功率需结合消费调整一起判断。",
  },
};

const MODE_LABELS: Record<FireConfig["mode"], string> = {
  monthly: "月度随机模拟",
  manual: "手动指定收益",
};
const SETTINGS_SECTIONS = [
  { number: "01", title: "年龄与起始资产", icon: "user" },
  { number: "02", title: "投资组合配置", icon: "pie" },
  { number: "03", title: "收入与支出", icon: "wallet" },
  { number: "04", title: "收益、通胀与费率", icon: "trend" },
  { number: "05", title: "模拟模式与提款策略", icon: "target" },
] as const;
const ASSET_COLORS = { stocks: "#58835d", bonds: "#b2c49b", cash: "#e0d8b2" };

function cloneConfig(config: FireConfig): FireConfig {
  return JSON.parse(JSON.stringify(config)) as FireConfig;
}
function planCacheKey(planId: string | null, config: FireConfig): string {
  return `${planId ?? ""}::${JSON.stringify(config)}`;
}
function nextPlanName(plans: readonly { name: string }[]) {
  const names = new Set(plans.map((plan) => plan.name));
  let ordinal = plans.length + 1;
  while (names.has(`方案 ${ordinal}`)) ordinal += 1;
  return `方案 ${ordinal}`;
}
function useCardOrder<T extends { id: string }>(
  items: T[],
  onChange: (next: T[]) => void,
) {
  const refs = useRef(new Map<string, HTMLElement>());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const start =
    (id: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggingId(id);
    };
  const move =
    (id: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (draggingId !== id) return;
      const order = itemsRef.current;
      const from = order.findIndex((item) => item.id === id);
      if (from < 0) return;
      let insertion = 0;
      for (const item of order) {
        if (item.id === id) continue;
        const element = refs.current.get(item.id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (event.clientY > rect.top + rect.height / 2) insertion += 1;
      }
      if (insertion === from) return;
      const next = [...order];
      const [moved] = next.splice(from, 1);
      next.splice(insertion, 0, moved);
      onChange(next);
    };
  const end = () => {
    if (draggingId !== null) setDraggingId(null);
  };
  const register = (id: string) => (node: HTMLElement | null) => {
    if (node) refs.current.set(id, node);
    else refs.current.delete(id);
  };
  return { draggingId, start, move, end, register };
}
function compact(value: number): { value: string; unit: string } {
  if (!Number.isFinite(value)) return { value: "—", unit: "" };
  const absolute = Math.abs(value);
  if (absolute >= 100000000)
    return {
      value: (value / 100000000).toLocaleString("zh-CN", {
        maximumFractionDigits: 2,
      }),
      unit: "亿",
    };
  if (absolute >= 10000)
    return {
      value: (value / 10000).toLocaleString("zh-CN", {
        maximumFractionDigits: absolute >= 1000000 ? 0 : 1,
      }),
      unit: "万",
    };
  return {
    value: value.toLocaleString("zh-CN", { maximumFractionDigits: 0 }),
    unit: "",
  };
}
function amount(value: number) {
  const item = compact(value);
  return `${item.value}${item.unit}`;
}
function percent(value: number) {
  return `${value.toFixed(1)}%`;
}
function moneyHint(value: number, period: "once" | "monthly") {
  if (!Number.isFinite(value)) return "—";
  const annual = period === "monthly" ? value * 12 : value;
  const wan = `${(annual / 10000).toLocaleString("zh-CN", {
    maximumFractionDigits: 4,
    useGrouping: false,
  })}万`;
  return period === "monthly" ? <>年合计 {wan}</> : wan;
}
function monthlyAmount(value: number) {
  return (Number.isFinite(value) ? value : 0).toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  });
}
function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  hint,
  moneyPeriod,
  draggable = true,
  unitAction,
}: {
  label: string;
  value: number;
  onChange(value: number): void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  unitAction?: { title: string; onClick(): void };
  hint?: string;
  moneyPeriod?: "once" | "monthly";
  draggable?: boolean;
}) {
  const id = useId();
  return (
    <div className="fc-field">
      <label className="fc-field-label" htmlFor={id}>
        {label}
        {hint ? <small>{hint}</small> : null}
      </label>
      <div className={`fc-value-input${draggable ? " fc-scrub-input" : ""}`}>
        <DragNumber
          id={id}
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          scrub={draggable}
          aria-describedby={
            draggable
              ? `${id}-drag-hint${moneyPeriod ? ` ${id}-amount-hint` : ""}`
              : moneyPeriod
                ? `${id}-amount-hint`
                : undefined
          }
          onChange={onChange}
        />
        {unit ? (
          unitAction ? (
            <button
              type="button"
              className="fc-unit-toggle"
              title={unitAction.title}
              aria-label={unitAction.title}
              onClick={unitAction.onClick}
            >
              {unit}
            </button>
          ) : (
            <b>{unit}</b>
          )
        ) : null}
        {draggable ? (
          <span className="fc-input-grip" aria-hidden="true">
            ↔
          </span>
        ) : null}
      </div>
      {draggable ? (
        <span className="fc-sr-only" id={`${id}-drag-hint`}>
          点击输入，按住左右拖动调整，也可用上下方向键调整。
        </span>
      ) : null}
      {moneyPeriod ? (
        <p className="fc-amount-hint" id={`${id}-amount-hint`}>
          {moneyHint(value, moneyPeriod)}
        </p>
      ) : null}
    </div>
  );
}
function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange(value: T): void;
}) {
  const id = useId();
  return (
    <label className="fc-field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const selected = options.find(
            ([key]) => String(key) === event.currentTarget.value,
          );
          if (selected) onChange(selected[0]);
        }}
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
function previousCashflowIndex(cashflows: FireCashflow[], index: number) {
  const kind = cashflows[index].kind;
  for (let cursor = index - 1; cursor >= 0; cursor--) {
    if (cashflows[cursor].kind === kind) return cursor;
  }
  return -1;
}

function cashflowEndAge(
  cashflows: FireCashflow[],
  index: number,
  config: FireConfig,
): number {
  const cashflow = cashflows[index];
  if (cashflow.endAtRetirement) return config.retirementAge - 1;
  if (cashflow.endAtLifeExpectancy) return config.lifeExpectancy;
  const previous = previousCashflowIndex(cashflows, index);
  if (cashflow.endSameAsPrevious && previous >= 0)
    return cashflowEndAge(cashflows, previous, config);
  return cashflow.endAge;
}
function cashflowStartAge(
  cashflows: FireCashflow[],
  index: number,
  config: FireConfig,
): number {
  const cashflow = cashflows[index];
  if (cashflow.startAtCurrentAge) return config.currentAge;
  if (cashflow.startAtRetirement) return config.retirementAge;
  const previous = previousCashflowIndex(cashflows, index);
  if (cashflow.startAfterPrevious && previous >= 0) {
    return Math.min(
      config.lifeExpectancy,
      Math.max(
        config.currentAge,
        cashflowEndAge(cashflows, previous, config) + 1,
      ),
    );
  }
  if (cashflow.startSameAsPrevious && previous >= 0)
    return cashflowStartAge(cashflows, previous, config);
  return cashflow.startAge;
}
function AgeRangeControl({
  start,
  end,
  min,
  max,
  startDisabled,
  endDisabled,
  onStartChange,
  onEndChange,
}: {
  start: number;
  end: number;
  min: number;
  max: number;
  startDisabled?: boolean;
  endDisabled?: boolean;
  onStartChange(value: number): void;
  onEndChange(value: number): void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const active = useRef<"start" | "end" | null>(null);
  const position = (value: number) =>
    Math.max(0, Math.min(100, ((value - min) / Math.max(1, max - min)) * 100));
  const valueFromPointer = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return min;
    const fraction = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)),
    );
    return Math.round(min + fraction * (max - min));
  };
  const thumb = (kind: "start" | "end", value: number, disabled: boolean) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || event.button !== 0) return;
      active.current = kind;
      event.currentTarget.setPointerCapture(event.pointerId);
      const next = valueFromPointer(event.clientX);
      if (kind === "start") onStartChange(Math.min(next, end));
      else onEndChange(Math.max(next, start));
    },
    onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (active.current !== kind) return;
      const next = valueFromPointer(event.clientX);
      if (kind === "start") onStartChange(Math.min(next, end));
      else onEndChange(Math.max(next, start));
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (active.current !== kind) return;
      active.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => {
      if (active.current === kind) active.current = null;
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = Math.max(min, Math.min(max, value + delta));
      if (kind === "start") onStartChange(Math.min(next, end));
      else onEndChange(Math.max(next, start));
    },
  });
  return (
    <div className="fc-age-range">
      <div className="fc-age-track" ref={track}>
        <span
          className="fc-age-fill"
          style={{
            left: `${position(start)}%`,
            right: `${100 - position(end)}%`,
          }}
        />
        <button
          type="button"
          className="fc-age-thumb is-start"
          aria-label="开始年龄滑块"
          style={{ left: `${position(start)}%` }}
          disabled={startDisabled}
          {...thumb("start", start, Boolean(startDisabled))}
        />
        <button
          type="button"
          className="fc-age-thumb is-end"
          aria-label="结束年龄滑块"
          style={{ left: `${position(end)}%` }}
          disabled={endDisabled}
          {...thumb("end", end, Boolean(endDisabled))}
        />
      </div>
      <div className="fc-age-values">
        <DragNumber
          aria-label="开始年龄"
          min={min}
          max={max}
          step={1}
          value={start}
          disabled={startDisabled}
          onChange={(value) => onStartChange(Math.min(value, end))}
        />
        <span>—</span>
        <DragNumber
          aria-label="结束年龄"
          min={min}
          max={max}
          step={1}
          value={end}
          disabled={endDisabled}
          onChange={(value) => onEndChange(Math.max(value, start))}
        />
        <b>岁</b>
      </div>
    </div>
  );
}
function Section({
  number,
  title,
  icon,
  columns = 3,
  children,
}: {
  number: string;
  title: string;
  icon?: IconName;
  columns?: number;
  children: ReactNode;
}) {
  return (
    <section className="fc-section">
      <div className="fc-section-title">
        <span className="fc-section-number">{number}</span>
        {icon ? <Icon name={icon} size={14} /> : null}
        {title}
      </div>
      <div
        className="fc-section-content"
        style={{ "--fc-cols": String(columns) } as React.CSSProperties}
      >
        {children}
      </div>
    </section>
  );
}

function BalanceChart({
  result,
  nominal,
  onNominalChange,
  currency,
  selectedYear,
  onSelectedYearChange,
  hoveredYear,
  onHoveredYearChange,
}: {
  result: FireResult;
  nominal: boolean;
  onNominalChange(value: boolean): void;
  currency: string;
  selectedYear: number;
  onSelectedYearChange(value: number): void;
  hoveredYear: number | null;
  onHoveredYearChange(value: number | null): void;
}) {
  const chartId = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [cursorTooltip, setCursorTooltip] = useState<{
    x: number;
    y: number;
    flipX: boolean;
    flipY: boolean;
  } | null>(null);
  const points = nominal ? result.nominalYears : result.years;
  const width = 900,
    height = 345,
    left = 64,
    right = 22,
    top = 24,
    bottom = 42;
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom;
  const max = Math.max(1, ...points.map((point) => point.p90)) * 1.08;
  const maxAge = points.at(-1)?.age ?? result.config.lifeExpectancy;
  const minAge = points[0]?.age ?? result.config.currentAge;
  const x = (index: number) =>
    left + (points.length <= 1 ? 0 : (index / (points.length - 1)) * plotWidth);
  const y = (value: number) => top + (1 - value / max) * plotHeight;
  const path = (key: "p10" | "p25" | "p50" | "p75" | "p90") =>
    points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${x(index).toFixed(2)},${y(point[key]).toFixed(2)}`,
      )
      .join(" ");
  const band = (lower: "p10" | "p25", upper: "p75" | "p90") =>
    `${path(upper)} ${points
      .map((point, index) => ({ point, index }))
      .reverse()
      .map(
        ({ point, index }) =>
          `L${x(index).toFixed(2)},${y(point[lower]).toFixed(2)}`,
      )
      .join(" ")} Z`;
  // A detail row is a one-year interval. Its selected balance is the closing
  // boundary at the end of that interval (40 → 41 highlights age 41).
  const selectedIndex = Math.min(points.length - 1, selectedYear + 1);
  const selected = points[selectedIndex];
  const selectedIntervalAge =
    points[Math.max(0, selectedIndex - 1)]?.age ?? selected.age;
  const priorSelected =
    selectedIndex > 0 ? (points[selectedIndex - 1] ?? null) : null;
  const selectedMedianChange = priorSelected
    ? selected.p50 - priorSelected.p50
    : null;
  const tooltipIndex =
    hoveredYear === null
      ? null
      : Math.min(points.length - 1, Math.max(0, hoveredYear + 1));
  const tooltipSelected = tooltipIndex === null ? null : points[tooltipIndex];
  const retiredX =
    left +
    ((result.config.retirementAge - minAge) / Math.max(1, maxAge - minAge)) *
      plotWidth;
  const hasRetirement =
    result.config.retirementAge > minAge &&
    result.config.retirementAge < maxAge;
  return (
    <section
      className="fc-card fc-balance-chart"
      aria-labelledby={`${chartId}-title`}
      data-selected-age={selected.age}
    >
      <header className="fc-card-header">
        <div>
          <h3 id={`${chartId}-title`} className="fc-card-title">
            <Icon name="chart" />
            全部路径 · 资产余额的可能路径
          </h3>
          <p>
            不同分位点下，投资组合随年龄的变化 ·
            {nominal
              ? "名义金额：未来账面数字，未扣除通胀"
              : "今日购买力：已扣除通胀，相当于今天的钱"}
          </p>
        </div>
        <div className="fc-card-header-actions">
          <span className="fc-badge">
            {selectedIntervalAge} → {selected.age} 岁
          </span>
          <div className="fc-toggle" role="group" aria-label="金额显示口径">
            <button
              type="button"
              aria-pressed={!nominal}
              title="余额已按各路径通胀折算，相当于今天的消费力"
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
      <div className="fc-balance-snapshot" aria-live="polite">
        <span>
          P50 中位数
          <strong>{amount(selected.p50)}</strong>
          <small>
            {selectedMedianChange == null
              ? "路径起点"
              : `较上年 ${selectedMedianChange >= 0 ? "+" : "−"}${amount(Math.abs(selectedMedianChange))}`}
          </small>
        </span>
        <span>
          P10–P90 区间
          <strong>
            {amount(selected.p10)}–{amount(selected.p90)}
          </strong>
          <small>80% 路径落在此区间</small>
        </span>
        <span>
          P25–P75 区间
          <strong>
            {amount(selected.p25)}–{amount(selected.p75)}
          </strong>
          <small>中间 50% 路径</small>
        </span>
      </div>
      <div className="fc-chart-wrap">
        <svg
          ref={svg}
          className="fc-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${chartId}-title ${chartId}-desc`}
          onPointerMove={(event) => {
            const rect = svg.current?.getBoundingClientRect();
            if (!rect) return;
            const local = ((event.clientX - rect.left) / rect.width) * width;
            const next = Math.max(
              0,
              Math.min(
                points.length - 1,
                Math.round(((local - left) / plotWidth) * (points.length - 1)),
              ),
            );
            onHoveredYearChange(
              Math.max(0, Math.min(Math.max(0, points.length - 2), next - 1)),
            );
            setCursorTooltip({
              x: event.clientX,
              y: event.clientY,
              flipX: event.clientX > window.innerWidth - 290,
              flipY: event.clientY > window.innerHeight - 280,
            });
            onSelectedYearChange(Math.max(0, next - 1));
          }}
          onPointerLeave={() => {
            setCursorTooltip(null);
            onHoveredYearChange(null);
          }}
        >
          <desc id={`${chartId}-desc`}>
            浅色带为第10至90百分位，深色带为第25至75百分位，实线为中位数。图表包含失败的模拟路径，余额耗尽后归零。拖动两张图共用的年度滑块可查看各年龄余额。
          </desc>
          <defs>
            <linearGradient id={`${chartId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c6d8a8" stopOpacity=".56" />
              <stop offset="100%" stopColor="#e6eed7" stopOpacity=".4" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((tick) => {
            const value = (max * tick) / 4;
            return (
              <g key={tick}>
                <line
                  className="fc-grid-line"
                  x1={left}
                  y1={y(value)}
                  x2={width - right}
                  y2={y(value)}
                />
                <text x={left - 12} y={y(value) + 3} textAnchor="end">
                  {amount(value)}
                </text>
              </g>
            );
          })}
          <text x={left} y={12}>
            {currency}
          </text>
          <path d={band("p10", "p90")} fill={`url(#${chartId}-fill)`} />
          <path d={band("p25", "p75")} fill="#b2c995" fillOpacity=".46" />
          <path
            d={path("p90")}
            stroke="#bbce9f"
            strokeWidth="1"
            strokeDasharray="3 4"
            fill="none"
          />
          <path
            d={path("p10")}
            stroke="#bbce9f"
            strokeWidth="1"
            strokeDasharray="3 4"
            fill="none"
          />
          <path
            d={path("p50")}
            stroke="#628348"
            strokeWidth="2.7"
            fill="none"
            strokeLinejoin="round"
          />
          {hasRetirement ? (
            <g>
              <line
                x1={retiredX}
                x2={retiredX}
                y1={top}
                y2={height - bottom}
                stroke="#95a985"
                strokeDasharray="4 4"
              />
              <text x={retiredX + 6} y={top + 10}>
                退休 {result.config.retirementAge} 岁
              </text>
            </g>
          ) : null}
          <line
            className="fc-axis-line"
            x1={left}
            x2={width - right}
            y1={height - bottom}
            y2={height - bottom}
          />
          {[0, 1, 2, 3, 4, 5].map((tick) => {
            const age = Math.round(minAge + ((maxAge - minAge) * tick) / 5);
            return (
              <text
                key={tick}
                x={left + (plotWidth * tick) / 5}
                y={height - 18}
                textAnchor="middle"
              >
                {age} 岁
              </text>
            );
          })}
          {selected ? (
            <g
              className="fc-balance-selected-marker"
              style={{ transform: `translateX(${x(selectedIndex)}px)` }}
            >
              <line
                x1="0"
                x2="0"
                y1={top}
                y2={height - bottom}
                stroke="#6f8c56"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx="0"
                cy={y(selected.p50)}
                r="4"
                fill="#628348"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          ) : null}
        </svg>
        {tooltipSelected && tooltipIndex !== null ? (
          <div
            className={`fc-chart-tooltip${cursorTooltip ? ` fc-chart-tooltip--cursor${cursorTooltip.flipX ? " is-left" : ""}${cursorTooltip.flipY ? " is-above" : ""}` : " fc-chart-tooltip--linked"}`}
            role="tooltip"
            style={
              cursorTooltip
                ? { left: cursorTooltip.x, top: cursorTooltip.y }
                : tooltipIndex > points.length * 0.6
                  ? { right: "10%" }
                  : { left: "14%" }
            }
          >
            <strong>
              {tooltipSelected.age} 岁 · 全部路径 ·{" "}
              {nominal ? "名义金额" : "今日购买力"}
            </strong>
            <small>失败路径从失败后起按 0 计入</small>
            {(
              [
                ["最大值", tooltipSelected.max],
                ["P90", tooltipSelected.p90],
                ["P75", tooltipSelected.p75],
                ["中位数", tooltipSelected.p50],
                ["P25", tooltipSelected.p25],
                ["P10", tooltipSelected.p10],
                ["最小值", tooltipSelected.min],
              ] as Array<[string, number]>
            ).map(([label, value]) => (
              <span key={label}>
                {label}
                <b>{amount(value)}</b>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="fc-chart-legend">
        <span>
          <i className="fc-line-swatch" style={{ color: "#628348" }} />
          P50 中位数
        </span>
        <span>
          <i className="fc-band-swatch" style={{ color: "#c3d5ab" }} />
          P25–P75 区间
        </span>
        <span>
          <i className="fc-band-swatch" style={{ color: "#e4ecd6" }} />
          P10–P90 区间
        </span>
      </div>
      <footer className="fc-chart-bottom">
        <span>
          {selected.age} 岁 · 包含全部模拟路径，各年龄分位点不代表同一条人生轨迹
        </span>
        <span>{nominal ? "未来面额，未扣除通胀" : "已扣除各路径通胀"}</span>
      </footer>
    </section>
  );
}

function SelectedAgeDistributionChart({
  year,
  distribution,
  intervalAge,
  nominal,
  onNominalChange,
  currency,
}: {
  year: FireResult["years"][number];
  distribution: FireResult["balanceDistributions"][number];
  intervalAge: number;
  nominal: boolean;
  onNominalChange(value: boolean): void;
  currency: string;
}) {
  const chartId = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [activeBin, setActiveBin] = useState<{
    index: number;
    x: number;
    y: number;
    flipX: boolean;
    flipY: boolean;
  } | null>(null);
  const width = 900;
  const height = 345;
  const left = 64;
  const right = 22;
  const top = 30;
  const bottom = 50;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const baseline = height - bottom;
  const binWidth = plotWidth / distribution.bins.length;
  const maximumShare = Math.max(
    0,
    ...distribution.bins.map((bin) => bin.share),
  );
  const scaleMaximum = Math.max(0.05, Math.min(1, maximumShare * 1.08));
  const x = (value: number) =>
    left +
    (Math.max(0, Math.min(distribution.domainEnd, value)) /
      distribution.domainEnd) *
      plotWidth;
  const y = (share: number) => baseline - (share / scaleMaximum) * plotHeight;
  const markerGroups = new Map<number, string[]>();
  for (const [label, value] of [
    ["P10", year.p10],
    ["P25", year.p25],
    ["P50", year.p50],
    ["P75", year.p75],
    ["P90", year.p90],
  ] as const) {
    const labels = markerGroups.get(value) ?? [];
    labels.push(label);
    markerGroups.set(value, labels);
  }
  const markerValues = [...markerGroups].map(([value, labels]) => ({
    label: labels.join(" / "),
    value,
    isMedian: labels.includes("P50"),
  }));
  const tooltipBin =
    activeBin === null ? null : (distribution.bins[activeBin.index] ?? null);
  const tooltipCumulative =
    activeBin === null
      ? 0
      : distribution.bins
          .slice(0, activeBin.index + 1)
          .reduce((total, bin) => total + bin.share, 0);
  const percentLabel = (value: number) =>
    `${(value * 100).toFixed(1).replace(/\.0$/u, "")}%`;
  const payableRuns = distribution.totalCount - distribution.zeroCount;

  return (
    <section
      className="fc-card fc-balance-distribution"
      aria-labelledby={`${chartId}-title`}
      data-selected-age={year.age}
    >
      <header className="fc-card-header">
        <div>
          <h3 id={`${chartId}-title`} className="fc-card-title">
            <Icon name="chart" />
            全部路径 · 所选年龄的资产分布
          </h3>
          <p>年末 · 全部模拟路径 · {nominal ? "名义金额" : "今日购买力"}</p>
        </div>
        <div className="fc-card-header-actions">
          <span className="fc-badge">
            {intervalAge} → {year.age} 岁
          </span>
          <div
            className="fc-toggle"
            role="group"
            aria-label="年度资产分布金额显示口径"
          >
            <button
              type="button"
              aria-pressed={!nominal}
              title="资产余额已按各路径通胀折算，相当于今天的购买力"
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
      <div className="fc-balance-distribution-summary" aria-live="polite">
        <span>
          截至此年龄仍可支付
          <strong>{year.successRate.toFixed(1)}%</strong>
          <small>
            {payableRuns.toLocaleString("zh-CN")} /{" "}
            {distribution.totalCount.toLocaleString("zh-CN")} 条
          </small>
        </span>
        <span className="is-failure">
          此年龄已耗尽
          <strong>{(distribution.zeroShare * 100).toFixed(1)}%</strong>
          <small>
            {distribution.zeroCount.toLocaleString("zh-CN")} /{" "}
            {distribution.totalCount.toLocaleString("zh-CN")} 条
          </small>
        </span>
        <span>
          全部路径 P50
          <strong>
            {amount(year.p50)} {currency}
          </strong>
        </span>
      </div>
      <div className="fc-chart-wrap fc-balance-distribution-wrap">
        <svg
          ref={svg}
          className="fc-chart fc-balance-distribution-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${chartId}-title ${chartId}-desc`}
          onPointerMove={(event) => {
            const rect = svg.current?.getBoundingClientRect();
            if (!rect || rect.width <= 0) return;
            const local = ((event.clientX - rect.left) / rect.width) * width;
            const ratio = Math.max(0, Math.min(1, (local - left) / plotWidth));
            const index = Math.min(
              distribution.bins.length - 1,
              Math.floor(ratio * distribution.bins.length),
            );
            setActiveBin({
              index,
              x: event.clientX,
              y: event.clientY,
              flipX: event.clientX > window.innerWidth - 330,
              flipY: event.clientY > window.innerHeight - 180,
            });
          }}
          onPointerLeave={() => setActiveBin(null)}
        >
          <desc id={`${chartId}-desc`}>
            {intervalAge}至{year.age}
            岁年末全部路径的资产余额分布。柱形高度表示落在该余额区间的路径占比，垂直虚线表示全部路径的
            P10、P25、P50、P75 和
            P90。资产已经耗尽的失败路径计入零资产区间。横轴范围随所选年龄变化。
          </desc>
          <text x={left} y={14}>
            路径占比
          </text>
          <text x={width - right} y={14} textAnchor="end">
            {currency} / 年末
          </text>
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const share = scaleMaximum * tick;
            return (
              <g key={tick}>
                <line
                  className="fc-grid-line"
                  x1={left}
                  y1={y(share)}
                  x2={width - right}
                  y2={y(share)}
                />
                <text x={left - 12} y={y(share) + 3} textAnchor="end">
                  {percentLabel(share)}
                </text>
              </g>
            );
          })}
          {distribution.bins.map((bin, index) => {
            if (bin.count === 0) return null;
            return (
              <g key={index}>
                <rect
                  x={left + index * binWidth + 1}
                  y={top}
                  width={Math.max(1, binWidth - 2)}
                  height={plotHeight}
                  rx="2"
                  fill="var(--fc-green-line)"
                  className={`fc-balance-distribution-bar${activeBin?.index === index ? " is-active" : ""}`}
                  style={{
                    transform: `scaleY(${bin.share / scaleMaximum})`,
                    transformOrigin: "center bottom",
                    transformBox: "fill-box",
                  }}
                >
                  <title>
                    {amount(bin.start)}–{amount(bin.end)} {currency}：
                    {bin.count.toLocaleString("zh-CN")} 条，
                    {percentLabel(bin.share)}
                    {index === 0 && distribution.zeroCount > 0
                      ? `；其中资产归零 ${distribution.zeroCount.toLocaleString("zh-CN")} 条`
                      : ""}
                  </title>
                </rect>
                {index === 0 && distribution.zeroCount > 0 ? (
                  <rect
                    x={left + 1}
                    y={top}
                    width={Math.max(1, binWidth - 2)}
                    height={plotHeight}
                    rx="2"
                    fill="var(--fc-amber)"
                    className={`fc-balance-distribution-zero-segment${activeBin?.index === 0 ? " is-active" : ""}`}
                    style={{
                      transform: `scaleY(${distribution.zeroShare / scaleMaximum})`,
                      transformOrigin: "center bottom",
                      transformBox: "fill-box",
                    }}
                  >
                    <title>
                      截至 {year.age} 岁资产耗尽：
                      {distribution.zeroCount.toLocaleString("zh-CN")} 条，
                      {percentLabel(distribution.zeroShare)}
                    </title>
                  </rect>
                ) : null}
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
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <text
              key={tick}
              x={left + plotWidth * tick}
              y={height - 7}
              textAnchor="middle"
            >
              {amount(distribution.domainEnd * tick)}
            </text>
          ))}
          {markerValues.map((marker, index) => (
            <g
              key={marker.label}
              className="fc-balance-percentile-marker"
              style={{ transform: `translateX(${x(marker.value)}px)` }}
            >
              <line
                x1="0"
                x2="0"
                y1={top}
                y2={baseline}
                className={
                  marker.isMedian
                    ? "fc-balance-percentile-line is-median"
                    : "fc-balance-percentile-line"
                }
              />
              <text
                x="0"
                y={baseline + 16 + (index % 2) * 13}
                textAnchor="middle"
                className="fc-balance-percentile-label"
              >
                {marker.label}
              </text>
              <title>
                {marker.label}：{amount(marker.value)} {currency}
              </title>
            </g>
          ))}
        </svg>
        {activeBin && tooltipBin ? (
          <div
            className={`fc-flow-trend-tooltip${activeBin.flipX ? " is-left" : ""}${activeBin.flipY ? " is-above" : ""}`}
            role="tooltip"
            style={{ left: activeBin.x, top: activeBin.y }}
          >
            <strong>
              {intervalAge} → {year.age} 岁年末 ·{" "}
              {nominal ? "名义金额" : "今日购买力"}
            </strong>
            <span>
              <i aria-hidden="true" />
              <em>资产区间</em>
              <b>
                {amount(tooltipBin.start)}–{amount(tooltipBin.end)} {currency}
              </b>
            </span>
            <span>
              <i aria-hidden="true" />
              <em>路径数量</em>
              <b>{tooltipBin.count.toLocaleString("zh-CN")} 条</b>
            </span>
            <span>
              <i aria-hidden="true" />
              <em>占全部路径</em>
              <b>{percentLabel(tooltipBin.share)}</b>
            </span>
            <span>
              <i aria-hidden="true" />
              <em>此区间及以下</em>
              <b>{percentLabel(tooltipCumulative)}</b>
            </span>
            {activeBin.index === 0 && distribution.zeroCount > 0 ? (
              <span className="is-failure">
                <i aria-hidden="true" />
                <em>其中资产归零</em>
                <b>
                  {distribution.zeroCount.toLocaleString("zh-CN")} 条 ·{" "}
                  {percentLabel(distribution.zeroShare)}
                </b>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="fc-chart-legend fc-balance-distribution-legend">
        <span>
          <i className="fc-balance-bar-swatch" />
          柱高 = 全部路径余额区间占比
        </span>
        <span>
          <i className="fc-balance-zero-swatch" />
          橙色 = 截至该年龄已经耗尽
        </span>
        <span>
          <i className="fc-balance-line-swatch" />
          垂直虚线 = 全部路径分位点
        </span>
        <span className="is-failure">资产归零路径按 0 计入</span>
      </div>
      <footer className="fc-chart-bottom">
        <span>
          P10 {amount(year.p10)} · P25 {amount(year.p25)} · P50{" "}
          {amount(year.p50)} · P75 {amount(year.p75)} · P90 {amount(year.p90)}{" "}
          {currency}
        </span>
        <span>横轴随所选年龄缩放</span>
      </footer>
    </section>
  );
}

function ResultPanel({
  result,
  config,
  running,
  progress,
  currency,
  columnStorageKey,
  nominalStorageKey,
}: {
  result: FireResult | null;
  config: FireConfig;
  running: boolean;
  progress: number;
  currency: string;
  columnStorageKey: string;
  nominalStorageKey: string;
}) {
  const [nominal, setNominalState] = useState(() =>
    readBooleanPreference(nominalStorageKey, false),
  );
  const [selection, setSelection] = useState<{
    result: FireResult;
    run: number;
  } | null>(null);
  const [pathExplorerOpen, setPathExplorerOpen] = useState(false);
  const [spendingCutOpen, setSpendingCutOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(0);
  const [hoveredChartYear, setHoveredChartYear] = useState<number | null>(null);
  const [dockBounds, setDockBounds] = useState<{
    left: number;
    width: number;
    compact: boolean;
  } | null>(null);
  const results = useRef<HTMLDivElement>(null);
  const sharedYearId = useId();
  const calculationFlowTitleId = useId();
  const spendingCutDetailsId = useId();

  const setNominal = (value: boolean) => {
    setNominalState(value);
    writeBooleanPreference(nominalStorageKey, value);
  };
  const openPathExplorer = useCallback(() => setPathExplorerOpen(true), []);
  const closePathExplorer = useCallback(() => setPathExplorerOpen(false), []);

  useEffect(() => {
    setNominalState(readBooleanPreference(nominalStorageKey, false));
  }, [nominalStorageKey]);

  useEffect(() => {
    setSelectedYear(0);
    setHoveredChartYear(null);
    setPathExplorerOpen(false);
    setSpendingCutOpen(false);
  }, [result]);

  useEffect(() => {
    if (!result) {
      setDockBounds(null);
      return;
    }
    const updateDockBounds = () => {
      const rect = results.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportPadding = 12;
      const availableWidth = Math.max(
        1,
        window.innerWidth - viewportPadding * 2,
      );
      const width = Math.min(
        rect.width > 0 ? rect.width : availableWidth,
        availableWidth,
      );
      const left =
        rect.width > 0
          ? Math.max(
              viewportPadding,
              Math.min(rect.left, window.innerWidth - width - viewportPadding),
            )
          : viewportPadding;
      const compact = width < 600;
      setDockBounds((current) =>
        current?.left === left &&
        current.width === width &&
        current.compact === compact
          ? current
          : { left, width, compact },
      );
    };
    updateDockBounds();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateDockBounds);
    if (results.current) observer?.observe(results.current);
    window.addEventListener("resize", updateDockBounds);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateDockBounds);
    };
  }, [result]);

  const activeRun = result
    ? selection?.result === result &&
      result.pathSummaries.some((item) => item.run === selection.run)
      ? selection.run
      : defaultFirePathRun(result)
    : 0;
  const selectedDetailPath = useMemo(
    () => (result ? simulateFirePath(result.config, activeRun) : null),
    [result, activeRun],
  );

  if (!result)
    return (
      <div className="fc-loading" role="status">
        {running ? (
          <span className="fc-spinner" />
        ) : (
          <Icon name="leaf" size={25} />
        )}
        <strong>
          {running ? "为未来，留一点计算的时间" : "准备好你的退休计划"}
        </strong>
        <p>
          {running
            ? `正在模拟不同的市场路径 · ${Math.round(progress)}%`
            : "调整参数后，点击“运行模拟”查看结果。"}
        </p>
      </div>
    );
  if (!selectedDetailPath) return null;
  const snapshot = result.config;
  const stale = JSON.stringify(config) !== JSON.stringify(snapshot);
  const finalYear = (nominal ? result.nominalYears : result.years).at(-1);
  const showGuardrailInitialRate = usesGuardrailInitialRate(snapshot);
  const withdrawalRate = showGuardrailInitialRate
    ? result.guardrailInitialRate
    : result.retirementWithdrawalRate;
  const withdrawalRateLabel = showGuardrailInitialRate
    ? result.totalRuns > 1
      ? "全路径护栏初始率"
      : "护栏初始率"
    : result.totalRuns > 1
      ? "全路径退休首年净提款率"
      : "退休首年净提款率";
  const withdrawalRatePercentiles = withdrawalRate
    ? ([
        ["最小", withdrawalRate.min],
        ["P10", withdrawalRate.p10],
        ["P25", withdrawalRate.p25],
        ["P50", withdrawalRate.median],
        ["P75", withdrawalRate.p75],
        ["P90", withdrawalRate.p90],
        ["最大", withdrawalRate.max],
      ] as const)
    : [];
  const strategy = STRATEGIES[snapshot.strategy];
  const ending = finalYear ? compact(finalYear.p50) : { value: "—", unit: "" };
  const failureAgeItems: Array<[string, number]> = result.failureAgeStatistics
    ? [
        ["最小（最早）", result.failureAgeStatistics.min],
        ["P10", result.failureAgeStatistics.p10],
        ["P25", result.failureAgeStatistics.p25],
        ["中位数", result.failureAgeStatistics.median],
        ["P75", result.failureAgeStatistics.p75],
        ["P90", result.failureAgeStatistics.p90],
        ["最大（最晚）", result.failureAgeStatistics.max],
      ]
    : [];
  const failureAgeLabel = (value: number) =>
    `${value.toFixed(1).replace(/\.0$/u, "")} 岁`;
  const hasDistributionStatistics =
    snapshot.strategy === "fixed" || failureAgeItems.length > 0;
  const activeSummary =
    result.pathSummaries.find((item) => item.run === activeRun) ??
    result.pathSummaries[0];
  const selectRun = (run: number) => {
    setSelection({ result, run });
    setSelectedYear(0);
    setHoveredChartYear(null);
  };
  const detailPath = selectedDetailPath;
  const detailIndex = Math.min(selectedYear, detailPath.years.length - 1);
  const detailYear = detailPath.years[detailIndex];
  const detailAmounts = detailYear[nominal ? "nominal" : "real"];
  const selectedDistributionYears = nominal
    ? result.nominalYears
    : result.years;
  const selectedDistributions = nominal
    ? result.nominalBalanceDistributions
    : result.balanceDistributions;
  const selectedDistributionIndex = Math.min(
    detailIndex + 1,
    selectedDistributionYears.length - 1,
  );
  const selectedDistributionYear =
    selectedDistributionYears[selectedDistributionIndex];
  const selectedDistribution = selectedDistributions[selectedDistributionIndex];
  return (
    <div
      ref={results}
      className="fc-results"
      data-controls-compact={dockBounds?.compact === true}
      aria-live="polite"
      aria-busy={running}
    >
      <div className="fc-result-label">
        <h2>
          <span className="fc-live-dot" />
          模拟结果
        </h2>
        <span className={`fc-badge${stale ? " stale" : ""}`}>
          {running
            ? `计算中 ${Math.round(progress)}%`
            : stale
              ? "参数已更改 · 请重新运行"
              : `${MODE_LABELS[snapshot.mode]} · ${result.totalRuns.toLocaleString("zh-CN")} 次`}
        </span>
      </div>
      <div className="fc-summary">
        <article className="fc-stat highlight">
          <div className="fc-stat-label">
            <Icon name="shield" size={12} />
            计划成功率
          </div>
          <div className="fc-stat-value">
            {result.successRate.toFixed(1)}
            <small>%</small>
          </div>
          <div className="fc-stat-caption">
            {result.successfulRuns.toLocaleString("zh-CN")} /{" "}
            {result.totalRuns.toLocaleString("zh-CN")} 条路径走到终点
          </div>
        </article>
        <article className="fc-stat">
          <div className="fc-stat-label">规划时长</div>
          <div className="fc-stat-value">
            {snapshot.lifeExpectancy - snapshot.currentAge}
            <small>年</small>
          </div>
          <div className="fc-stat-caption">
            {snapshot.currentAge} 岁 → {snapshot.lifeExpectancy} 岁
          </div>
        </article>
        <article className="fc-stat">
          <div className="fc-stat-label">{withdrawalRateLabel}</div>
          <div className="fc-stat-rate-body">
            <div className="fc-stat-value">
              {withdrawalRate ? withdrawalRate.median.toFixed(1) : "—"}
              <small>{withdrawalRate ? "%" : ""}</small>
            </div>
            {withdrawalRate && result.totalRuns > 1 ? (
              <dl
                className="fc-stat-percentiles"
                aria-label={
                  showGuardrailInitialRate
                    ? "护栏初始率分位统计"
                    : "退休首年净提款率分位统计"
                }
              >
                {withdrawalRatePercentiles.map(([label, value]) => (
                  <div
                    key={label}
                    className={
                      label === "P50"
                        ? "is-primary"
                        : label === "最小" || label === "最大"
                          ? "is-extreme"
                          : undefined
                    }
                  >
                    <dt>{label}</dt>
                    <dd>{percent(value)}</dd>
                  </div>
                ))}
                <div>
                  <dt>{showGuardrailInitialRate ? "已建立" : "样本"}</dt>
                  <dd>{withdrawalRate.count.toLocaleString("zh-CN")}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <div className="fc-stat-caption">
            {withdrawalRate
              ? showGuardrailInitialRate
                ? `${result.totalRuns > 1 ? "全路径样本分布" : "单一路径"} · ${withdrawalRate.count.toLocaleString("zh-CN")} / ${result.totalRuns.toLocaleString("zh-CN")} 条路径建立初始率 · 首个正净提款年度 · (策略预算 − 常规收入) ÷ 年初资产`
                : `${result.totalRuns > 1 ? "全路径样本分布" : "手动指定 · 单一路径"} · (策略消费预算 − 常规收入) ÷ 退休日资产`
              : showGuardrailInitialRate
                ? "没有路径建立护栏初始率"
                : "没有路径到达退休日"}
          </div>
        </article>
        <article className="fc-stat">
          <div className="fc-stat-label">期末中位数</div>
          <div className="fc-stat-value">
            {ending.value}
            <small>{ending.unit}</small>
          </div>
          <div className="fc-stat-caption">
            全部路径 · 失败按 0 计入 · {nominal ? "名义金额" : "今日购买力"}
          </div>
        </article>
      </div>
      {snapshot.strategy !== "fixed" ? (
        <div className={`fc-dynamic-note${spendingCutOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="fc-dynamic-note-line"
            aria-expanded={spendingCutOpen}
            aria-controls={spendingCutDetailsId}
            onClick={() => setSpendingCutOpen((open) => !open)}
          >
            <Icon name="info" size={13} />
            <span className="fc-dynamic-note-copy">
              动态提款会调整生活水平，请同时关注消费。
              {result.finalSpending
                ? `成功路径中，${percent(result.finalSpending.cutsRate)} 曾降低实际消费；最终月消费中位数为 ${amount(result.finalSpending.median)} ${currency}（今日购买力）。`
                : "本次没有成功路径，暂无消费统计。"}
            </span>
            {result.finalSpending ? (
              <span className="fc-dynamic-note-action">
                <span>
                  {spendingCutOpen ? "收起消费降幅明细" : "查看消费降幅明细"}
                </span>
                <svg
                  className="fc-disclosure-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            ) : null}
          </button>
          <div
            id={spendingCutDetailsId}
            className="fc-dynamic-note-body"
            hidden={!spendingCutOpen}
          >
            {spendingCutOpen && result.finalSpending ? (
              <SpendingCutCard
                result={result}
                statistics={result.finalSpending}
                currency={currency}
                selectedRun={activeRun}
                onSelectedRunChange={selectRun}
              />
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="fc-lower">
        <section className="fc-card">
          <div className="fc-strategy">
            <div className="fc-strategy-icon">
              <Icon name="shield" size={18} />
            </div>
            <div>
              <h3>{strategy.title}</h3>
              <p>{strategy.description}</p>
            </div>
          </div>
          {snapshot.strategy !== "fixed" ? (
            <div className="fc-strategy-metrics">
              <div>
                <span>最终月消费中位数 · 今日购买力</span>
                <strong>
                  {result.finalSpending
                    ? amount(result.finalSpending.median)
                    : "—"}{" "}
                  <small style={{ fontSize: 9, fontWeight: 400 }}>
                    {currency}
                  </small>
                </strong>
              </div>
              <div>
                <span>相当于原计划消费</span>
                <strong>
                  {result.finalSpending?.medianPercentOfPlan == null
                    ? "—"
                    : percent(result.finalSpending.medianPercentOfPlan)}
                </strong>
              </div>
            </div>
          ) : null}
          {hasDistributionStatistics ? (
            <div className="fc-strategy-distribution-stats">
              <dl>
                {snapshot.strategy === "fixed" ? (
                  <div className="is-primary">
                    <dt>退休首年月支出</dt>
                    <dd>
                      {amount(result.initialPlan)} <small>{currency}</small>
                    </dd>
                  </div>
                ) : null}
                {failureAgeItems.map(([label, value]) => (
                  <div key={label} className="is-failure">
                    <dt>{label}</dt>
                    <dd>{failureAgeLabel(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      </div>
      <PathExplorerDialog
        open={pathExplorerOpen}
        onClose={closePathExplorer}
        result={result}
        selectedRun={activeRun}
        onSelectedRunChange={selectRun}
        nominal={nominal}
        onNominalChange={setNominal}
        currency={currency}
      />
      <div
        className="fc-shared-chart-controls"
        role="region"
        aria-label="图表查看控制"
        data-dock="floating"
        data-compact={dockBounds?.compact === true}
        style={
          dockBounds
            ? { left: dockBounds.left, width: dockBounds.width }
            : undefined
        }
      >
        <SelectedPathDock
          summary={activeSummary}
          nominal={nominal}
          currency={currency}
          manual={snapshot.mode === "manual"}
          guardrailInitialRate={showGuardrailInitialRate}
          onOpen={openPathExplorer}
        />
        <div className="fc-field fc-shared-year-field">
          <div className="fc-shared-year-meta">
            <div className="fc-shared-year-value">
              <label htmlFor={sharedYearId}>查看年度</label>
              <output htmlFor={sharedYearId} aria-live="polite">
                {detailYear.age} → {detailYear.age + 1} 岁
              </output>
            </div>
            <p className="fc-shared-year-summary" aria-live="polite">
              投入 {amount(detailAmounts.contributions)} {currency} · 提取{" "}
              {amount(detailAmounts.withdrawals)} {currency}
              {detailYear.failed
                ? ` · 未付缺口 ${amount(detailAmounts.shortfall)} ${currency}`
                : ""}
            </p>
          </div>
          <div className="fc-shared-year-range">
            <input
              id={sharedYearId}
              type="range"
              min={0}
              max={Math.max(0, detailPath.years.length - 1)}
              value={detailIndex}
              onChange={(event) => {
                setSelectedYear(Number(event.currentTarget.value));
                setHoveredChartYear(null);
              }}
              aria-label="查看年度"
              aria-valuetext={`${detailYear.age}至${detailYear.age + 1}岁${detailYear.failed ? "，中途失败" : ""}`}
            />
            <span className="fc-flow-range-end">
              {(detailPath.years.at(-1)?.age ?? detailYear.age) + 1} 岁
            </span>
          </div>
        </div>
      </div>
      <div className="fc-result-chart-grid">
        <BalanceChart
          result={result}
          nominal={nominal}
          onNominalChange={setNominal}
          currency={currency}
          selectedYear={detailIndex}
          onSelectedYearChange={setSelectedYear}
          hoveredYear={hoveredChartYear}
          onHoveredYearChange={setHoveredChartYear}
        />
        <CashflowTrend
          result={result}
          path={detailPath}
          storageKey={columnStorageKey}
          nominal={nominal}
          onNominalChange={setNominal}
          selectedYear={detailIndex}
          onSelectedYearChange={setSelectedYear}
          currency={currency}
          hoveredYear={hoveredChartYear}
          onHoveredYearChange={setHoveredChartYear}
        />
        <CashflowDetails
          key={`${columnStorageKey}:${JSON.stringify(snapshot)}`}
          distribution={
            <SelectedAgeDistributionChart
              year={selectedDistributionYear}
              distribution={selectedDistribution}
              intervalAge={detailYear.age}
              nominal={nominal}
              onNominalChange={setNominal}
              currency={currency}
            />
          }
          result={result}
          path={detailPath}
          selectedYear={detailIndex}
          onSelectedYearChange={setSelectedYear}
          nominal={nominal}
          onNominalChange={setNominal}
          currency={currency}
          storageKey={columnStorageKey}
        />
      </div>
      <details className="fc-card fc-explanation">
        <summary>
          <Icon name="info" size={13} />
          这些结果是怎样计算的？
        </summary>
        <section
          className="fc-calculation-flow"
          aria-labelledby={calculationFlowTitleId}
        >
          <header className="fc-calculation-flow-header">
            <strong id={calculationFlowTitleId}>按月计算路径</strong>
            <span>每个模拟月按以下顺序结算</span>
          </header>
          <div className="fc-calculation-flow-body">
            <div className="fc-calculation-flow-node">
              <span className="fc-calculation-flow-step">01</span>
              <span>月初资产</span>
            </div>
            <CalculationFlowArrow />
            <div className="fc-calculation-flow-node">
              <span className="fc-calculation-flow-step">02</span>
              <span>收到定期收入和一次性收入</span>
            </div>
            <CalculationFlowArrow />
            <div className="fc-calculation-flow-node">
              <span className="fc-calculation-flow-step">03</span>
              <span>支付生活预算和一次性支出</span>
            </div>
            <CalculationFlowArrow />
            <div className="fc-calculation-flow-node is-decision">
              <span className="fc-calculation-flow-step">判断</span>
              <strong>当月净现金流</strong>
            </div>
            <CalculationFlowBranchArrows />
            <div className="fc-calculation-flow-branches">
              <div className="fc-calculation-flow-branch is-positive">
                <span>为正</span>
                <strong>投入资产并按目标比例配置</strong>
              </div>
              <div className="fc-calculation-flow-branch is-negative">
                <span>为负</span>
                <strong>先花现金，再按比例卖股票和债券</strong>
              </div>
            </div>
            <CalculationFlowBranchArrows merge />
            <div className="fc-calculation-flow-node">
              <span className="fc-calculation-flow-step">04</span>
              <span>投资组合产生收益或亏损</span>
            </div>
            <CalculationFlowArrow />
            <div className="fc-calculation-flow-node">
              <span className="fc-calculation-flow-step">05</span>
              <span>扣除管理费</span>
            </div>
            <CalculationFlowArrow />
            <div className="fc-calculation-flow-node">
              <span className="fc-calculation-flow-step">年末</span>
              <span>按当年正投资收益估税</span>
            </div>
            <CalculationFlowArrow />
            <div className="fc-calculation-flow-node is-result">
              <span className="fc-calculation-flow-step">06</span>
              <span>再平衡并记录月末资产</span>
            </div>
          </div>
        </section>
        <ul>
          <li>
            成功表示从当前年龄到预期寿命，组合始终能够支付所需现金流。市场模型是情景推演，成功率并非未来承诺。
          </li>
          <li>
            每月先处理定期收支和一次性事件，再计算投资收益；生活支出由当期生效的支出项目决定。勾选随通胀调整的金额按今日购买力增长。
          </li>
          <li>
            {showGuardrailInitialRate
              ? "自动护栏模式下，顶部全路径护栏初始率以每条路径首个正净提款年度的年初资产为分母，分子为当年策略消费预算减常规收入后的年度净提款额。退休首年收支抵消时不会建立初始率，该路径会从当前统计中排除。"
              : "全路径退休首年净提款率以每条路径退休当日的资产为分母，分子为退休首年策略消费预算减常规收入后的年度净提款额，最低按 0 计。"}
            策略消费预算不是实际支付支出；计算排除一次性收支；卡片数值为
            P50，同时展示最小、P10、P25、P75、P90 和最大。
          </li>
          <li>
            股票、债券的预期收益是税前名义年化收益率；管理费单独扣除，税率应用于年度累计正投资收益，税基未扣管理费。
          </li>
          <li>
            {snapshot.mode === "manual"
              ? "手动模式沿用设定的固定年化收益和通胀率，仅生成一条路径，成功率为该情景结果。"
              : "月度随机模式每月按预期收益和波动率独立抽样，股票、债券及通胀的随机冲击彼此独立；固定随机种子以便对比方案。"}
          </li>
          <li>
            {snapshot.strategy === "fixed"
              ? "固定购买力策略按各年龄计划的生活支出消费；定期收入抵扣后才从资产提款。"
              : snapshot.strategy === "guardrails"
                ? `动态护栏每年按年初净提款率调整消费；当前允许计划支出的 ${snapshot.guardrailMinSpending}%–${snapshot.guardrailMaxSpending}%，消费上调、下调触发线分别为初始净提款率的 ${snapshot.guardrailRaiseThreshold}% 和 ${snapshot.guardrailCutThreshold}%。`
                : "动态策略允许降低消费，较高的成功率可能来自支出下降，请同时查看最终实际消费。"}
          </li>
          <li>
            各年龄余额分位数包含失败路径；最终余额和最终消费统计只包含成功路径。两组统计的样本范围不同。
          </li>
        </ul>
      </details>
    </div>
  );
}

export default function FireCalculator({
  ledgerId,
  primaryCurrency = "CNY",
  api,
  canWrite = true,
}: Props) {
  const [config, setConfig] = useState<FireConfig>(() => defaultFireConfig());
  const [plans, setPlans] = useState<FirePlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const planBeforeCreateRef = useRef<string | null>(null);
  const initialConfig = useRef(config);
  const [result, setResult] = useState<FireResult | null>(null);
  const resultsByPlan = useRef(new Map<string, FireResult>());
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const settingsStorageKey = `fire-calculator:${ledgerId}:settings-open`;
  const columnStorageKey = `fire-calculator:${ledgerId}:hidden-columns`;
  const nominalStorageKey = `fire-calculator:${ledgerId}:nominal-amounts`;
  const [settingsOpen, setSettingsOpen] = useState(() =>
    readBooleanPreference(settingsStorageKey, true),
  );
  const [settingsSection, setSettingsSection] = useState("01");
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const [renamingPlanId, setRenamingPlanId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const renameCommittedRef = useRef(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const planMenuButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationRequest | null>(
    null,
  );
  const confirmationResolver = useRef<((confirmed: boolean) => void) | null>(
    null,
  );
  const confirmationPanelRef = useRef<HTMLDivElement>(null);
  const confirmationCancelRef = useRef<HTMLButtonElement>(null);
  const configCloseRef = useRef<HTMLButtonElement>(null);
  const configPanelRef = useRef<HTMLElement>(null);
  const settingsToggleRef = useRef<HTMLButtonElement>(null);
  const [expandedCashflowIds, setExpandedCashflowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [lastSaved, setLastSaved] = useState("");
  const settingsPanelId = useId();
  const confirmationTitleId = useId();
  const confirmationDescriptionId = useId();
  const runToken = useRef(0);
  const mounted = useRef(true);
  const revision = useRef("");
  const issues = useMemo(() => validateFireConfig(config), [config]);
  const currency = primaryCurrency || "CNY";
  const activePlan = plans.find((item) => item.id === activePlanId) ?? null;
  const draftPlanName = nextPlanName(plans);
  const planLabel = creatingPlan
    ? draftPlanName
    : (activePlan?.name ?? "暂无方案");
  const settingsPlanLabel = creatingPlan
    ? `${draftPlanName}（未保存）`
    : (activePlan?.name ?? "当前配置");
  const savedPlans = useMemo(
    () =>
      plans.map((item) =>
        item.id === activePlanId
          ? { id: item.id, name: item.name, config }
          : item,
      ),
    [plans, activePlanId, config],
  );
  const lastSavedPlans = useMemo(() => {
    if (!lastSaved) return [];
    try {
      const state = JSON.parse(lastSaved) as { plans?: FirePlan[] };
      return Array.isArray(state.plans) ? state.plans : [];
    } catch {
      return [];
    }
  }, [lastSaved]);
  const dirty =
    activePlanId === null ||
    JSON.stringify(savedPlans) !== JSON.stringify(lastSavedPlans);
  const isUntouchedNewPlanDraft =
    creatingPlan &&
    activePlanId === null &&
    JSON.stringify(config) === JSON.stringify(defaultFireConfig());
  const hasDiscardableChanges = dirty && !isUntouchedNewPlanDraft;
  const settleConfirmation = useCallback((confirmed: boolean) => {
    const resolve = confirmationResolver.current;
    confirmationResolver.current = null;
    setConfirmation(null);
    resolve?.(confirmed);
  }, []);
  const requestConfirmation = useCallback(
    (request: ConfirmationRequest) =>
      new Promise<boolean>((resolve) => {
        confirmationResolver.current?.(false);
        confirmationResolver.current = resolve;
        setConfirmation(request);
      }),
    [],
  );
  const incomeCashflows = useMemo(
    () => config.cashflows.filter((item) => item.kind === "income"),
    [config.cashflows],
  );
  const expenseCashflows = useMemo(
    () => config.cashflows.filter((item) => item.kind === "expense"),
    [config.cashflows],
  );
  const cashflowIncomeOrder = useCardOrder(incomeCashflows, (next) =>
    reorderCashflowKind("income", next),
  );
  const cashflowExpenseOrder = useCardOrder(expenseCashflows, (next) =>
    reorderCashflowKind("expense", next),
  );
  const incomeEvents = useMemo(
    () => config.events.filter((item) => item.kind === "income"),
    [config.events],
  );
  const expenseEvents = useMemo(
    () => config.events.filter((item) => item.kind === "expense"),
    [config.events],
  );
  const eventIncomeOrder = useCardOrder(incomeEvents, (next) =>
    reorderEventKind("income", next),
  );
  const eventExpenseOrder = useCardOrder(expenseEvents, (next) =>
    reorderEventKind("expense", next),
  );

  useEffect(() => {
    setSettingsOpen(readBooleanPreference(settingsStorageKey, true));
  }, [settingsStorageKey]);

  useEffect(() => {
    if (!planMenuOpen) return;
    const closeOnPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".fc-plan-menu") !== null)
        return;
      renameInputRef.current?.blur();
      setPlanMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlanMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("touchstart", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("touchstart", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [planMenuOpen]);

  useEffect(() => {
    if (!confirmation) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmationCancelRef.current?.focus();
    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        settleConfirmation(false);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = confirmationPanelRef.current;
      if (!dialog) return;
      event.stopImmediatePropagation();
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.closest("[hidden]") === null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [confirmation, settleConfirmation]);

  useEffect(
    () => () => {
      confirmationResolver.current?.(false);
      confirmationResolver.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!settingsOpen) return;
    configCloseRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleSettings();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = configPanelRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.closest("[hidden]") === null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyDown);
      if (settingsToggleRef.current?.isConnected)
        settingsToggleRef.current.focus();
    };
  }, [settingsOpen, settingsStorageKey, creatingPlan]);

  useEffect(() => {
    setExpandedCashflowIds(new Set());
  }, [ledgerId]);

  function toggleSettings() {
    const next = !settingsOpen;
    if (!next && creatingPlan) discardCreatingPlanDraft();
    setSettingsOpen(next);
    writeBooleanPreference(settingsStorageKey, next);
  }

  function toggleCashflowDetails(id: string) {
    setExpandedCashflowIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const run = useCallback(async (draft: FireConfig, cacheKey?: string) => {
    const validation = validateFireConfig(draft);
    if (validation.length > 0) {
      setError(validation[0]);
      return;
    }
    const token = ++runToken.current;
    setRunning(true);
    setProgress(0);
    setError("");
    setNotice("");
    try {
      const output = await simulateFireAsync(cloneConfig(draft), {
        onProgress: (value) => {
          if (mounted.current && token === runToken.current) setProgress(value);
        },
        isCancelled: () => !mounted.current || token !== runToken.current,
      });
      if (mounted.current && token === runToken.current) {
        setResult(output);
        if (cacheKey !== undefined) resultsByPlan.current.set(cacheKey, output);
      }
    } catch (cause) {
      if (
        mounted.current &&
        token === runToken.current &&
        !(cause instanceof Error && cause.name === "AbortError")
      )
        setError(
          cause instanceof Error
            ? cause.message
            : "模拟未完成，请检查参数后重试。",
        );
    } finally {
      if (mounted.current && token === runToken.current) setRunning(false);
    }
  }, []);

  const readSavedPlan = useCallback(
    async (signal?: AbortSignal, preserveWhenEmpty = false) => {
      const response = await api.fetchLocal(
        `/api-gateway/local/plugins/fire_calculator/api?ledgerId=${encodeURIComponent(ledgerId)}`,
        { signal },
      );
      const payload = (await response.json()) as PlansView & {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "读取方案失败");
      revision.current = payload.revision;
      if (payload.error) throw new Error(payload.error);
      const nextPlans = payload.plans.map((item) => ({
        id: item.id,
        name: item.name,
        config: prepareLoadedPlan(upgradeFireConfig(item.config)),
      }));
      const nextActive =
        nextPlans.find((item) => item.id === payload.activeId) ?? null;
      if (preserveWhenEmpty && nextPlans.length === 0) {
        setLastSaved(JSON.stringify({ activeId: null, plans: [] }));
        return {
          activeId: null,
          plans: nextPlans,
          config: defaultFireConfig(),
          exists: payload.exists,
        };
      }
      setCreatingPlan(false);
      setPlans(nextPlans);
      setActivePlanId(nextActive?.id ?? null);
      const nextConfig = nextActive
        ? cloneConfig(nextActive.config)
        : defaultFireConfig();
      setConfig(nextConfig);
      setLastSaved(
        JSON.stringify({
          activeId: nextActive?.id ?? null,
          plans: nextPlans,
        }),
      );
      initialConfig.current = nextConfig;
      return {
        activeId: nextActive?.id ?? null,
        plans: nextPlans,
        config: nextConfig,
        exists: payload.exists,
      };
    },
    [api, ledgerId],
  );

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    void (async () => {
      try {
        const loaded = await readSavedPlan(controller.signal);
        if (loaded.plans.length > 0 && loaded.exists)
          setNotice("已载入 plugins/fire_calculator/plan.json");
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "读取方案失败");
      }
      void run(initialConfig.current);
    })();
    return () => {
      mounted.current = false;
      runToken.current += 1;
      controller.abort();
    };
  }, [readSavedPlan, run]);

  function update<K extends keyof FireConfig>(key: K, value: FireConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
    setNotice("");
  }
  function number(key: NumericKey, value: number) {
    update(key, value);
  }
  function setBirthYear(year: number) {
    const now = new Date().getFullYear();
    const age = Math.max(18, Math.min(99, now - year));
    setConfig((current) => ({ ...current, birthYear: year, currentAge: age }));
    setNotice("");
  }
  function setLifeExpectancy(value: number) {
    setConfig((current) => ({
      ...current,
      lifeExpectancy: value,
      cashflows: current.cashflows.map((cashflow) => ({
        ...cashflow,
        startAge: Math.min(value, cashflow.startAge),
        endAge: cashflow.endAtRetirement
          ? cashflow.endAge
          : Math.min(value, cashflow.endAge),
      })),
    }));
    setNotice("");
  }
  function toggleBirthYear(checked: boolean) {
    if (checked) {
      const now = new Date().getFullYear();
      setConfig((current) => ({
        ...current,
        birthYear: now - current.currentAge,
      }));
    } else {
      setConfig((current) => {
        const next = { ...current };
        delete next.birthYear;
        return next;
      });
    }
    setNotice("");
  }
  function cashInflationReturn(value: number) {
    setConfig((current) => ({
      ...current,
      cashMode: "real",
      cashRealReturn: value,
    }));
    setNotice("");
  }
  function field(
    key: NumericKey,
    label: string,
    options: {
      min?: number;
      max?: number;
      step?: number;
      unit?: string;
      hint?: string;
      moneyPeriod?: "once" | "monthly";
      draggable?: boolean;
    } = {},
  ) {
    return (
      <NumberField
        label={label}
        value={config[key]}
        onChange={(value) => number(key, value)}
        {...options}
      />
    );
  }
  function setAllocation(asset: keyof FireConfig["allocation"], value: number) {
    const next = Math.max(0, Math.min(100, Math.round(value)));
    setConfig((current) => {
      const others = (
        Object.keys(current.allocation) as Array<keyof FireConfig["allocation"]>
      ).filter((key) => key !== asset);
      const sum = current.allocation[others[0]] + current.allocation[others[1]];
      const remaining = 100 - next;
      const first =
        sum === 0
          ? Math.round(remaining / 2)
          : Math.round((remaining * current.allocation[others[0]]) / sum);
      return {
        ...current,
        allocation: {
          ...current.allocation,
          [asset]: next,
          [others[0]]: first,
          [others[1]]: remaining - first,
        },
      };
    });
    setNotice("");
  }
  async function savePlan() {
    if (issues.length > 0 || saving || !canWrite) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let planId = activePlanId;
      let planList = savedPlans;
      if (planId === null) {
        planId = `plan-${Date.now()}-1`;
        planList = [
          ...plans,
          { id: planId, name: nextPlanName(plans), config },
        ];
      }
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/fire_calculator/api/save",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: revision.current,
            activeId: planId,
            plans: planList,
          }),
        },
      );
      const payload = (await response.json()) as PlansView & {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "保存方案失败");
      revision.current = payload.revision;
      const nextPlans = payload.plans;
      const nextActiveId = payload.activeId;
      setPlans(nextPlans);
      setActivePlanId(nextActiveId);
      setLastSaved(
        JSON.stringify({ activeId: nextActiveId, plans: nextPlans }),
      );
      setCreatingPlan(false);
      planBeforeCreateRef.current = null;
      setNotice("方案已保存到 plugins/fire_calculator/plan.json");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存方案失败");
    } finally {
      setSaving(false);
    }
  }
  async function resetPlan() {
    if (reloading || saving) return;
    runToken.current += 1;
    setRunning(false);
    setProgress(0);
    setReloading(true);
    setError("");
    setNotice("");
    try {
      const loaded = await readSavedPlan(undefined, true);
      if (loaded.plans.length === 0) {
        setError("尚无已保存方案，未修改当前参数。");
        return;
      }
      const key = planCacheKey(loaded.activeId, loaded.config);
      if (!showCachedResult(loaded.activeId, loaded.config))
        void run(loaded.config, key);
      setNotice("已重新读取已保存方案，未保存的更改已丢弃。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取方案失败");
    } finally {
      if (mounted.current) setReloading(false);
    }
  }
  async function confirmDiscard(message: string): Promise<boolean> {
    if (!hasDiscardableChanges) return true;
    return requestConfirmation({
      title: "放弃未保存的修改？",
      message,
      confirmLabel: "丢弃并继续",
      tone: "danger",
    });
  }
  function showCachedResult(planId: string | null, planConfig: FireConfig) {
    const cached = resultsByPlan.current.get(planCacheKey(planId, planConfig));
    if (!cached) return false;
    runToken.current += 1;
    setRunning(false);
    setProgress(0);
    setResult(cached);
    setError("");
    return true;
  }
  function discardCreatingPlanDraft() {
    const fallback =
      plans.find((item) => item.id === planBeforeCreateRef.current) ??
      plans[0] ??
      null;
    planBeforeCreateRef.current = null;
    setCreatingPlan(false);
    setActivePlanId(fallback?.id ?? null);
    if (fallback) {
      const nextConfig = cloneConfig(fallback.config);
      setConfig(nextConfig);
      const key = planCacheKey(fallback.id, nextConfig);
      if (!showCachedResult(fallback.id, nextConfig)) void run(nextConfig, key);
    } else {
      setConfig(defaultFireConfig());
    }
    setNotice("未保存的新方案已取消。");
  }
  async function activatePlan(id: string) {
    if (id === activePlanId) return;
    const plan = plans.find((item) => item.id === id);
    if (!plan) return;
    if (
      !(await confirmDiscard(
        "当前方案有未保存的修改，切换后将丢弃这些修改。确定切换吗？",
      ))
    )
      return;
    const nextConfig = cloneConfig(plan.config);
    setActivePlanId(id);
    setCreatingPlan(false);
    planBeforeCreateRef.current = null;
    setConfig(nextConfig);
    setNotice("");
    const key = planCacheKey(id, nextConfig);
    if (!showCachedResult(id, nextConfig)) void run(nextConfig, key);
  }
  async function createPlan() {
    if (!canWrite) return;
    if (
      !(await confirmDiscard(
        "当前方案有未保存的修改，新建方案后将丢弃这些修改。确定新建吗？",
      ))
    )
      return;
    planBeforeCreateRef.current = activePlanId;
    const nextConfig = defaultFireConfig();
    setActivePlanId(null);
    setCreatingPlan(true);
    setConfig(nextConfig);
    setNotice("已打开新建方案页面，保存后才会加入方案列表。");
    setSettingsSection("01");
    setSettingsOpen(true);
    writeBooleanPreference(settingsStorageKey, true);
  }
  async function deletePlan(id: string) {
    if (!canWrite) return;
    const plan = plans.find((item) => item.id === id);
    if (!plan) return;
    const confirmed = await requestConfirmation({
      title: "删除这个方案？",
      message: `“${plan.name}”将从 plan.json 中删除，删除后无法恢复。`,
      confirmLabel: "删除方案",
      tone: "danger",
    });
    if (!confirmed) return;
    setError("");
    setNotice("");
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/fire_calculator/api/delete",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: revision.current,
            id,
          }),
        },
      );
      const payload = (await response.json()) as PlansView & {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "删除方案失败");
      const nextPlans = plans.filter((item) => item.id !== id);
      const nextActive =
        payload.plans.find((item) => item.id === payload.activeId) ?? null;
      setPlans(nextPlans);
      setActivePlanId(nextActive?.id ?? null);
      setCreatingPlan(false);
      if (activePlanId === id) {
        const nextConfig = nextActive
          ? cloneConfig(nextActive.config)
          : defaultFireConfig();
        setConfig(nextConfig);
        const key = planCacheKey(nextActive?.id ?? null, nextConfig);
        if (!showCachedResult(nextActive?.id ?? null, nextConfig))
          void run(nextConfig, key);
      }
      revision.current = payload.revision;
      setLastSaved(
        JSON.stringify({ activeId: payload.activeId, plans: nextPlans }),
      );
      setNotice("方案已删除并自动保存");
      planMenuButtonRef.current?.focus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "删除方案失败");
    }
  }
  function selectPlan(id: string) {
    setPlanMenuOpen(false);
    setRenamingPlanId(null);
    void activatePlan(id);
  }
  function startPlanRename(id: string) {
    const plan = plans.find((item) => item.id === id);
    if (!plan) return;
    renameCommittedRef.current = false;
    setRenamingPlanId(id);
    setRenameDraft(plan.name);
  }
  async function commitPlanRename() {
    if (!canWrite) return;
    if (renamingPlanId === null || renameCommittedRef.current) return;
    renameCommittedRef.current = true;
    const id = renamingPlanId;
    const name = renameDraft.trim() || "未命名方案";
    const plan = plans.find((item) => item.id === id);
    setRenamingPlanId(null);
    if (!plan || plan.name === name) return;
    setError("");
    setNotice("");
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/fire_calculator/api/rename",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: revision.current,
            id,
            name,
          }),
        },
      );
      const payload = (await response.json()) as PlansView & {
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "保存方案名称失败");
      revision.current = payload.revision;
      const savedNames = new Map(
        payload.plans.map((item) => [item.id, item.name]),
      );
      const nextPlans = plans.map((item) => {
        const savedName = savedNames.get(item.id);
        return savedName === undefined ? item : { ...item, name: savedName };
      });
      setPlans(nextPlans);
      setLastSaved(
        JSON.stringify({ activeId: payload.activeId, plans: nextPlans }),
      );
      setNotice("方案名称已自动保存");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存方案名称失败");
    }
  }
  function cancelPlanRename() {
    renameCommittedRef.current = true;
    setRenamingPlanId(null);
  }
  function createAndOpenPlan() {
    setPlanMenuOpen(false);
    setRenamingPlanId(null);
    void createPlan();
  }
  function cancelRun() {
    runToken.current += 1;
    setRunning(false);
    setNotice("本次模拟已取消，可调整参数后重新运行。");
  }
  function eventUpdate(
    id: string,
    patch: Partial<FireConfig["events"][number]>,
  ) {
    update(
      "events",
      config.events.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  }
  function addEvent(kind: "income" | "expense") {
    const position = config.events.length + 1;
    update("events", [
      ...config.events,
      {
        id: `event-${Date.now()}-${config.events.length}`,
        label:
          kind === "income"
            ? `一次性收入 ${position}`
            : `一次性支出 ${position}`,
        age: Math.min(
          config.lifeExpectancy - 1,
          Math.max(config.currentAge, config.retirementAge + 5),
        ),
        kind,
        amount: 100000,
        inflationAdjusted: true,
      },
    ]);
  }
  function cashflowUpdate(
    id: string,
    patch: Partial<FireConfig["cashflows"][number]>,
  ) {
    update(
      "cashflows",
      config.cashflows.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  }
  function addCashflow(kind: FireCashflow["kind"]) {
    const amount = 10_000;
    const position = config.cashflows.length + 1;
    const kindCashflows = config.cashflows.filter((item) => item.kind === kind);
    const previous = kindCashflows.at(-1);
    const previousEnd = previous
      ? cashflowEndAge(kindCashflows, kindCashflows.length - 1, config)
      : config.currentAge - 1;
    const startAge = Math.min(
      config.lifeExpectancy,
      Math.max(config.currentAge, previousEnd + 1),
    );
    update("cashflows", [
      ...config.cashflows,
      {
        id: `cashflow-${Date.now()}-${config.cashflows.length}`,
        label:
          kind === "income" ? `定期收入 ${position}` : `定期支出 ${position}`,
        kind,
        amount,
        startAge,
        startAtCurrentAge: previous === undefined,
        startAfterPrevious: previous !== undefined,
        endAge: config.lifeExpectancy,
        endAtRetirement: true,
        inflationAdjusted: true,
      },
    ]);
  }
  function reorderCashflowKind(
    kind: FireCashflow["kind"],
    nextKindItems: FireCashflow[],
  ) {
    setConfig((current) => {
      let cursor = 0;
      return {
        ...current,
        cashflows: current.cashflows.map((item) =>
          item.kind === kind ? nextKindItems[cursor++] : item,
        ),
      };
    });
  }
  function reorderEventKind(
    kind: FireConfig["events"][number]["kind"],
    nextKindItems: FireConfig["events"][number][],
  ) {
    setConfig((current) => {
      let cursor = 0;
      return {
        ...current,
        events: current.events.map((item) =>
          item.kind === kind ? nextKindItems[cursor++] : item,
        ),
      };
    });
  }
  function moveCashflow(id: string, delta: number) {
    setConfig((current) => {
      const item = current.cashflows.find((entry) => entry.id === id);
      if (!item) return current;
      const kindItems = current.cashflows.filter(
        (entry) => entry.kind === item.kind,
      );
      const index = kindItems.findIndex((entry) => entry.id === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= kindItems.length) return current;
      const nextKindItems = [...kindItems];
      const [moved] = nextKindItems.splice(index, 1);
      nextKindItems.splice(target, 0, moved);
      let cursor = 0;
      return {
        ...current,
        cashflows: current.cashflows.map((entry) =>
          entry.kind === item.kind ? nextKindItems[cursor++] : entry,
        ),
      };
    });
  }
  function moveEvent(id: string, delta: number) {
    setConfig((current) => {
      const item = current.events.find((entry) => entry.id === id);
      if (!item) return current;
      const kindItems = current.events.filter(
        (entry) => entry.kind === item.kind,
      );
      const index = kindItems.findIndex((entry) => entry.id === id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= kindItems.length) return current;
      const nextKindItems = [...kindItems];
      const [moved] = nextKindItems.splice(index, 1);
      nextKindItems.splice(target, 0, moved);
      let cursor = 0;
      return {
        ...current,
        events: current.events.map((entry) =>
          entry.kind === item.kind ? nextKindItems[cursor++] : entry,
        ),
      };
    });
  }

  const workYears = Math.max(0, config.retirementAge - config.currentAge);
  const retireYears = Math.max(0, config.lifeExpectancy - config.retirementAge);
  const lifeSpan = Math.max(1, config.lifeExpectancy - config.currentAge);
  const workPct = Math.min(100, (workYears / lifeSpan) * 100);

  return (
    <div
      className={`fc-shell${
        cashflowIncomeOrder.draggingId ||
        cashflowExpenseOrder.draggingId ||
        eventIncomeOrder.draggingId ||
        eventExpenseOrder.draggingId
          ? " is-reordering"
          : ""
      }`}
    >
      <style>{FIRE_STYLES}</style>
      {confirmation ? (
        <ConfirmationDialog
          request={confirmation}
          titleId={confirmationTitleId}
          descriptionId={confirmationDescriptionId}
          panelRef={confirmationPanelRef}
          cancelRef={confirmationCancelRef}
          onCancel={() => settleConfirmation(false)}
          onConfirm={() => settleConfirmation(true)}
        />
      ) : null}
      <div className="fc-page">
        <header className="fc-header">
          <div>
            <div className="fc-eyebrow">
              <span className="fc-brand-mark">
                <Icon name="leaf" size={15} />
              </span>
              FINANCIAL INDEPENDENCE
            </div>
            <div className="fc-title-row">
              <h1>
                FIRE<span>退休规划模拟器</span>
              </h1>
            </div>
            <p>把理想生活放进数字里，看看未来有多少种可能。</p>
          </div>
          <div className="fc-actions">
            <div className="fc-plan-toolbar" aria-label="方案管理">
              <div className="fc-plan-menu">
                <button
                  ref={planMenuButtonRef}
                  type="button"
                  className="fc-plan-menu-button"
                  aria-haspopup="listbox"
                  aria-expanded={planMenuOpen}
                  title="切换方案"
                  onClick={() => setPlanMenuOpen((open) => !open)}
                >
                  <span>{planLabel}</span>
                  <Icon name="chevron" size={12} />
                </button>
                {planMenuOpen ? (
                  <div
                    className="fc-plan-menu-popover"
                    role="listbox"
                    aria-label="选择方案"
                  >
                    {plans.length === 0 ? (
                      <div className="fc-plan-menu-empty">暂无方案</div>
                    ) : (
                      plans.map((item) => (
                        <div className="fc-plan-menu-item" key={item.id}>
                          {renamingPlanId === item.id ? (
                            <input
                              className="fc-plan-menu-rename-input"
                              aria-label="方案新名称"
                              autoFocus
                              ref={renameInputRef}
                              value={renameDraft}
                              maxLength={60}
                              onChange={(event) =>
                                setRenameDraft(event.currentTarget.value)
                              }
                              onBlur={commitPlanRename}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  commitPlanRename();
                                } else if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelPlanRename();
                                }
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              className={`fc-plan-menu-option${
                                item.id === activePlanId ? " is-active" : ""
                              }`}
                              role="option"
                              aria-selected={item.id === activePlanId}
                              onClick={() => selectPlan(item.id)}
                            >
                              {item.name}
                            </button>
                          )}
                          {renamingPlanId !== item.id ? (
                            <button
                              type="button"
                              className="fc-plan-menu-rename"
                              aria-label={`重命名${item.name}`}
                              title="重命名方案"
                              disabled={!canWrite}
                              onClick={() => startPlanRename(item.id)}
                            >
                              <Icon name="pen" size={12} />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="fc-plan-menu-delete"
                            aria-label={`删除${item.name}`}
                            title="删除方案"
                            disabled={!canWrite}
                            onClick={() => void deletePlan(item.id)}
                          >
                            <Icon name="trash" size={12} />
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      className="fc-plan-menu-create"
                      role="option"
                      disabled={!canWrite}
                      onClick={createAndOpenPlan}
                    >
                      ＋ 新建方案
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                ref={settingsToggleRef}
                className={`fc-btn fc-settings-toggle${
                  settingsOpen ? " is-active" : ""
                }`}
                type="button"
                aria-controls={settingsPanelId}
                aria-expanded={settingsOpen}
                onClick={toggleSettings}
              >
                <Icon name="sliders" />
                设置
              </button>
            </div>
          </div>
        </header>
        {error ? (
          <div className="fc-message fc-error" role="alert">
            <Icon name="info" />
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="fc-message" role="status">
            <Icon name="info" />
            {notice}
          </div>
        ) : null}
        <div className="fc-workspace">
          {settingsOpen ? (
            <div
              className="fc-config-overlay"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) toggleSettings();
              }}
            >
              <aside
                ref={configPanelRef}
                id={settingsPanelId}
                className="fc-config"
                role="dialog"
                aria-modal="true"
                aria-label="退休规划参数"
                tabIndex={-1}
              >
                <header className="fc-config-header">
                  <h2>
                    <Icon name="sliders" />
                    规划参数
                    <span className="fc-config-plan-tag">
                      · {settingsPlanLabel}
                    </span>
                  </h2>
                  <div className="fc-config-header-right">
                    <span>所有金额均为 {currency}</span>
                    <button
                      ref={configCloseRef}
                      type="button"
                      className="fc-config-close"
                      aria-label="关闭设置"
                      title="关闭设置"
                      onClick={toggleSettings}
                    >
                      ×
                    </button>
                  </div>
                </header>
                <div className="fc-config-layout">
                  <nav className="fc-config-nav" aria-label="设置分类">
                    {SETTINGS_SECTIONS.map((section) => (
                      <button
                        key={section.number}
                        type="button"
                        className={`fc-config-nav-item${
                          settingsSection === section.number ? " is-active" : ""
                        }`}
                        aria-current={
                          settingsSection === section.number
                            ? "page"
                            : undefined
                        }
                        aria-label={`${section.number} ${section.title}`}
                        onClick={() => setSettingsSection(section.number)}
                      >
                        <Icon name={section.icon} size={14} />
                        {section.title}
                      </button>
                    ))}
                  </nav>
                  <div className="fc-config-panel">
                    <div className="fc-config-body">
                      <div
                        className="fc-config-section-pane"
                        hidden={settingsSection !== "01"}
                      >
                        <Section number="01" title="年龄与起始资产" icon="user">
                          <div className="fc-field-row">
                            {field("initialBalance", "初始投资金额", {
                              unit: currency,
                              moneyPeriod: "once",
                              min: 0,
                              max: 10000000000,
                              step: 10000,
                              draggable: true,
                            })}
                          </div>
                          <div className="fc-field-row">
                            {config.birthYear !== undefined ? (
                              <NumberField
                                label="出生年份"
                                value={config.birthYear}
                                min={1900}
                                max={new Date().getFullYear()}
                                step={1}
                                unit="年"
                                hint={`${Math.max(
                                  0,
                                  new Date().getFullYear() - config.birthYear,
                                )} 岁`}
                                unitAction={{
                                  title: "切换为直接填写当前年龄",
                                  onClick: () => toggleBirthYear(false),
                                }}
                                onChange={setBirthYear}
                              />
                            ) : (
                              <NumberField
                                label="当前年龄"
                                value={config.currentAge}
                                draggable
                                unit="岁"
                                min={18}
                                max={99}
                                unitAction={{
                                  title: "切换为按出生年份计算",
                                  onClick: () => toggleBirthYear(true),
                                }}
                                onChange={(value) =>
                                  number("currentAge", value)
                                }
                              />
                            )}
                          </div>
                          <div className="fc-field-row">
                            <NumberField
                              label="预期寿命"
                              value={config.lifeExpectancy}
                              draggable
                              unit="岁"
                              min={40}
                              max={120}
                              onChange={setLifeExpectancy}
                            />
                          </div>
                          <div className="fc-field-row">
                            {field("retirementAge", "计划退休年龄", {
                              draggable: true,
                              unit: "岁",
                              min: config.currentAge,
                              max: Math.max(
                                config.currentAge,
                                config.lifeExpectancy - 1,
                              ),
                            })}
                          </div>
                          <div className="fc-life-bar">
                            <div className="fc-life-bar-head">
                              <span>
                                {workYears > 0
                                  ? `还需 ${workYears} 年`
                                  : "从现在开始退休"}
                              </span>
                              <span aria-label="退休后至预期寿命">
                                退休后 {retireYears} 年
                              </span>
                            </div>
                            <div className="fc-life-bar-track">
                              <i
                                className="is-work"
                                style={{ width: `${workPct}%` }}
                              />
                              <i
                                className="is-retired"
                                style={{ width: `${100 - workPct}%` }}
                              />
                            </div>
                            <div className="fc-life-bar-labels">
                              <span style={{ left: 0 }}>
                                {config.currentAge} 岁
                              </span>
                              <span style={{ left: `${workPct}%` }}>
                                退休 {config.retirementAge} 岁
                              </span>
                              <span style={{ right: 0 }}>
                                {config.lifeExpectancy} 岁
                              </span>
                            </div>
                          </div>
                          <p className="fc-note">
                            所有数值输入框均可点击输入，或按住左右拖动微调。
                          </p>
                        </Section>
                      </div>
                      <div
                        className="fc-config-section-pane"
                        hidden={settingsSection !== "02"}
                      >
                        <Section number="02" title="投资组合配置" icon="pie">
                          <label className="fc-inline-field">
                            <span>投资组合再平衡</span>
                            <select
                              value={config.rebalanceMonths}
                              onChange={(event) =>
                                update(
                                  "rebalanceMonths",
                                  Number(event.currentTarget.value),
                                )
                              }
                            >
                              <option value={0}>不再平衡</option>
                              <option value={1}>每月</option>
                              <option value={3}>每季度</option>
                              <option value={6}>每半年</option>
                              <option value={12}>每年</option>
                            </select>
                          </label>
                          <AllocationSlider
                            allocation={config.allocation}
                            colors={ASSET_COLORS}
                            onChange={(allocation) =>
                              update("allocation", allocation)
                            }
                          />
                          {(
                            [
                              ["stocks", "股票类资产"],
                              ["bonds", "债券类资产"],
                              ["cash", "现金类资产"],
                            ] as const
                          ).map(([asset, label]) => (
                            <div className="fc-asset-field" key={asset}>
                              <div className="fc-asset-top">
                                <label
                                  className="fc-asset-name"
                                  htmlFor={`fc-${asset}-value`}
                                >
                                  <i
                                    className="fc-dot"
                                    style={{ color: ASSET_COLORS[asset] }}
                                  />
                                  {label}
                                </label>
                                <div className="fc-asset-input">
                                  <DragNumber
                                    id={`fc-${asset}-value`}
                                    aria-label={`${label}比例`}
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={config.allocation[asset]}
                                    onChange={(value) =>
                                      setAllocation(asset, value)
                                    }
                                  />
                                  <span>%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <p className="fc-note">
                            拖动上方分界点调整相邻资产；输入百分比时，其余资产按比例分配余量，始终合计
                            100%。
                          </p>
                        </Section>
                      </div>
                      <div
                        className="fc-config-section-pane"
                        hidden={settingsSection !== "03"}
                      >
                        <Section number="03" title="收入与支出" icon="wallet">
                          <p className="fc-note">
                            收入与支出均按起止年龄生效：同一时期的多个支出叠加为该年龄的生活支出，可分段设置不同水平；某个年龄没有生效的支出项目时不产生生活支出。
                          </p>
                          <h4 className="fc-subheading">定期收入与支出</h4>
                          <div className="fc-cashflow-columns">
                            {(["income", "expense"] as const).map((kind) => {
                              const items =
                                kind === "income"
                                  ? incomeCashflows
                                  : expenseCashflows;
                              const order =
                                kind === "income"
                                  ? cashflowIncomeOrder
                                  : cashflowExpenseOrder;
                              return (
                                <div
                                  className={`fc-cashflow-column fc-cashflow-column-${kind}`}
                                  key={kind}
                                >
                                  <h5 className="fc-cashflow-column-title">
                                    {kind === "income" ? "收入" : "支出"}
                                    <span>{items.length} 项</span>
                                  </h5>
                                  <div className="fc-cashflow-list">
                                    {items.map((cashflow) => {
                                      const index = config.cashflows.findIndex(
                                        (item) => item.id === cashflow.id,
                                      );
                                      const previousIndex =
                                        previousCashflowIndex(
                                          config.cashflows,
                                          index,
                                        );
                                      const previous =
                                        previousIndex >= 0
                                          ? config.cashflows[previousIndex]
                                          : undefined;
                                      const startAge = cashflowStartAge(
                                        config.cashflows,
                                        index,
                                        config,
                                      );
                                      const endAge = cashflowEndAge(
                                        config.cashflows,
                                        index,
                                        config,
                                      );
                                      const expanded = expandedCashflowIds.has(
                                        cashflow.id,
                                      );
                                      const amountText = monthlyAmount(
                                        cashflow.amount,
                                      );
                                      return (
                                        <div
                                          className={`fc-event fc-cashflow-${cashflow.kind}${
                                            order.draggingId === cashflow.id
                                              ? " is-dragging"
                                              : ""
                                          }${cashflow.enabled === false ? " is-disabled" : ""}${
                                            expanded
                                              ? " is-expanded"
                                              : " is-collapsed"
                                          }`}
                                          key={cashflow.id}
                                          ref={order.register(cashflow.id)}
                                          title={
                                            expanded
                                              ? "点击卡片收起年龄设置"
                                              : undefined
                                          }
                                          onClick={(event) => {
                                            if (!expanded) return;
                                            const target = event.target;
                                            if (
                                              target instanceof Element &&
                                              target.closest(
                                                ".fc-event-body, .fc-event-actions, .fc-event-age-tag, button, input, select, textarea, label, a",
                                              ) !== null
                                            )
                                              return;
                                            toggleCashflowDetails(cashflow.id);
                                          }}
                                        >
                                          <div className="fc-event-head">
                                            <button
                                              type="button"
                                              className="fc-drag-handle"
                                              aria-label={`拖动定期收支 ${index + 1}`}
                                              title="按住拖动调整顺序，也可用上下方向键"
                                              onPointerDown={order.start(
                                                cashflow.id,
                                              )}
                                              onPointerMove={order.move(
                                                cashflow.id,
                                              )}
                                              onPointerUp={order.end}
                                              onPointerCancel={order.end}
                                              onKeyDown={(event) => {
                                                if (
                                                  event.key === "ArrowUp" ||
                                                  event.key === "ArrowDown"
                                                ) {
                                                  event.preventDefault();
                                                  moveCashflow(
                                                    cashflow.id,
                                                    event.key === "ArrowUp"
                                                      ? -1
                                                      : 1,
                                                  );
                                                }
                                              }}
                                            >
                                              ⠿
                                            </button>
                                            <div className="fc-event-summary">
                                              <div className="fc-event-title-row">
                                                <input
                                                  className="fc-event-title-input"
                                                  aria-label="名称"
                                                  title="点击编辑名称"
                                                  value={cashflow.label}
                                                  maxLength={80}
                                                  onChange={(e) =>
                                                    cashflowUpdate(
                                                      cashflow.id,
                                                      {
                                                        label:
                                                          e.currentTarget.value,
                                                      },
                                                    )
                                                  }
                                                />
                                                {expanded ? (
                                                  <span
                                                    className="fc-event-amount"
                                                    title={`每月金额 ${amountText} ${currency}`}
                                                  >
                                                    <strong>
                                                      {amountText}
                                                    </strong>{" "}
                                                    <small>{currency}/月</small>
                                                  </span>
                                                ) : (
                                                  <span className="fc-event-amount">
                                                    <DragNumber
                                                      className="fc-event-amount-input"
                                                      aria-label="每月金额"
                                                      inputMode="decimal"
                                                      min={0}
                                                      max={100000000}
                                                      step={1000}
                                                      value={cashflow.amount}
                                                      onChange={(value) =>
                                                        cashflowUpdate(
                                                          cashflow.id,
                                                          {
                                                            amount: value,
                                                          },
                                                        )
                                                      }
                                                    />
                                                    <small>{currency}/月</small>
                                                  </span>
                                                )}
                                                <div className="fc-event-actions">
                                                  <button
                                                    type="button"
                                                    className={`fc-card-toggle${
                                                      cashflow.enabled === false
                                                        ? " off"
                                                        : ""
                                                    }`}
                                                    aria-label={`${
                                                      cashflow.enabled === false
                                                        ? "启用"
                                                        : "停用"
                                                    }定期收支 ${index + 1}`}
                                                    aria-pressed={
                                                      cashflow.enabled !== false
                                                    }
                                                    title={
                                                      cashflow.enabled === false
                                                        ? "恢复该项参与模拟"
                                                        : "临时停用，不参与模拟"
                                                    }
                                                    onClick={() =>
                                                      cashflowUpdate(
                                                        cashflow.id,
                                                        {
                                                          enabled:
                                                            cashflow.enabled ===
                                                            false
                                                              ? true
                                                              : false,
                                                        },
                                                      )
                                                    }
                                                  >
                                                    {cashflow.enabled === false
                                                      ? "启用"
                                                      : "停用"}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    aria-label={`删除定期收支 ${index + 1}`}
                                                    onClick={() =>
                                                      update(
                                                        "cashflows",
                                                        config.cashflows.filter(
                                                          (item) =>
                                                            item.id !==
                                                            cashflow.id,
                                                        ),
                                                      )
                                                    }
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              </div>
                                              <div className="fc-event-meta">
                                                <span
                                                  className="fc-event-age-tag"
                                                  role="button"
                                                  tabIndex={0}
                                                  aria-expanded={expanded}
                                                  aria-controls={`${cashflow.id}-details`}
                                                  title={`生效年龄：${startAge} 至 ${endAge} 岁（含两端）；点击${
                                                    expanded ? "收起" : "展开"
                                                  }年龄设置`}
                                                  onClick={() =>
                                                    toggleCashflowDetails(
                                                      cashflow.id,
                                                    )
                                                  }
                                                  onKeyDown={(event) => {
                                                    if (
                                                      event.key === "Enter" ||
                                                      event.key === " "
                                                    ) {
                                                      event.preventDefault();
                                                      toggleCashflowDetails(
                                                        cashflow.id,
                                                      );
                                                    }
                                                  }}
                                                >
                                                  {startAge} → {endAge} 岁
                                                </span>
                                                <button
                                                  type="button"
                                                  className={`fc-event-inflation-tag${
                                                    cashflow.inflationAdjusted
                                                      ? ""
                                                      : " is-fixed"
                                                  }`}
                                                  aria-pressed={
                                                    cashflow.inflationAdjusted
                                                  }
                                                  aria-label={`将每月金额切换为${
                                                    cashflow.inflationAdjusted
                                                      ? "固定金额"
                                                      : "跟随通胀"
                                                  }`}
                                                  title={
                                                    cashflow.inflationAdjusted
                                                      ? `当前每月金额跟随 ${config.inflationRate.toFixed(1)}%/年 通胀调整；点击改为固定金额`
                                                      : "当前每月金额固定不变；点击改为跟随通胀"
                                                  }
                                                  onClick={() =>
                                                    cashflowUpdate(
                                                      cashflow.id,
                                                      {
                                                        inflationAdjusted:
                                                          !cashflow.inflationAdjusted,
                                                      },
                                                    )
                                                  }
                                                >
                                                  <Icon
                                                    name="inflation"
                                                    size={11}
                                                  />
                                                  {cashflow.inflationAdjusted
                                                    ? `跟随通胀 ${config.inflationRate.toFixed(
                                                        1,
                                                      )}%`
                                                    : "固定金额"}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                          <div
                                            className="fc-event-body"
                                            id={`${cashflow.id}-details`}
                                            hidden={!expanded}
                                          >
                                            {expanded ? (
                                              <>
                                                {previous !== undefined ? (
                                                  <p className="fc-note fc-cashflow-previous-note">
                                                    上一张卡片：{previous.label}
                                                    （
                                                    {cashflowStartAge(
                                                      config.cashflows,
                                                      previousIndex,
                                                      config,
                                                    )}{" "}
                                                    →{" "}
                                                    {cashflowEndAge(
                                                      config.cashflows,
                                                      previousIndex,
                                                      config,
                                                    )}{" "}
                                                    岁）
                                                  </p>
                                                ) : null}
                                                <div className="fc-age-controls">
                                                  <div className="fc-age-head">
                                                    <div className="fc-age-side">
                                                      <span className="fc-age-label">
                                                        开始年龄
                                                      </span>
                                                      <div className="fc-age-end-checks">
                                                        <label className="fc-end-age-check">
                                                          <input
                                                            type="checkbox"
                                                            checked={
                                                              cashflow.startAtCurrentAge ===
                                                              true
                                                            }
                                                            onChange={(e) =>
                                                              cashflowUpdate(
                                                                cashflow.id,
                                                                {
                                                                  startAtCurrentAge:
                                                                    e
                                                                      .currentTarget
                                                                      .checked,
                                                                  startAtRetirement:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.startAtRetirement,
                                                                  startAfterPrevious:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.startAfterPrevious,
                                                                  startSameAsPrevious:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.startSameAsPrevious,
                                                                  startAge: e
                                                                    .currentTarget
                                                                    .checked
                                                                    ? cashflow.startAge
                                                                    : Math.max(
                                                                        config.currentAge,
                                                                        cashflow.startAge,
                                                                      ),
                                                                },
                                                              )
                                                            }
                                                          />
                                                          自当前年龄
                                                        </label>
                                                        <label className="fc-end-age-check">
                                                          <input
                                                            type="checkbox"
                                                            checked={
                                                              cashflow.startAtRetirement ===
                                                              true
                                                            }
                                                            onChange={(e) =>
                                                              cashflowUpdate(
                                                                cashflow.id,
                                                                {
                                                                  startAtRetirement:
                                                                    e
                                                                      .currentTarget
                                                                      .checked,
                                                                  startAtCurrentAge:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.startAtCurrentAge,
                                                                  startAfterPrevious:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.startAfterPrevious,
                                                                  startSameAsPrevious:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.startSameAsPrevious,
                                                                },
                                                              )
                                                            }
                                                          />
                                                          自退休
                                                        </label>
                                                        {previous !==
                                                          undefined && (
                                                          <>
                                                            <label className="fc-end-age-check">
                                                              <input
                                                                type="checkbox"
                                                                checked={
                                                                  cashflow.startSameAsPrevious ===
                                                                  true
                                                                }
                                                                onChange={(e) =>
                                                                  cashflowUpdate(
                                                                    cashflow.id,
                                                                    {
                                                                      startSameAsPrevious:
                                                                        e
                                                                          .currentTarget
                                                                          .checked,
                                                                      startAtCurrentAge:
                                                                        e
                                                                          .currentTarget
                                                                          .checked
                                                                          ? false
                                                                          : cashflow.startAtCurrentAge,
                                                                      startAtRetirement:
                                                                        e
                                                                          .currentTarget
                                                                          .checked
                                                                          ? false
                                                                          : cashflow.startAtRetirement,
                                                                      startAfterPrevious:
                                                                        e
                                                                          .currentTarget
                                                                          .checked
                                                                          ? false
                                                                          : cashflow.startAfterPrevious,
                                                                    },
                                                                  )
                                                                }
                                                              />
                                                              自上个卡片开始年龄
                                                            </label>
                                                            <label className="fc-end-age-check">
                                                              <input
                                                                type="checkbox"
                                                                checked={
                                                                  cashflow.startAfterPrevious ===
                                                                  true
                                                                }
                                                                onChange={(e) =>
                                                                  cashflowUpdate(
                                                                    cashflow.id,
                                                                    {
                                                                      startAfterPrevious:
                                                                        e
                                                                          .currentTarget
                                                                          .checked,
                                                                      startAtRetirement:
                                                                        e
                                                                          .currentTarget
                                                                          .checked
                                                                          ? false
                                                                          : cashflow.startAtRetirement,
                                                                      startAtCurrentAge:
                                                                        e
                                                                          .currentTarget
                                                                          .checked
                                                                          ? false
                                                                          : cashflow.startAtCurrentAge,
                                                                      startSameAsPrevious:
                                                                        e
                                                                          .currentTarget
                                                                          .checked
                                                                          ? false
                                                                          : cashflow.startSameAsPrevious,
                                                                    },
                                                                  )
                                                                }
                                                              />
                                                              自上个卡片结束年龄
                                                            </label>
                                                          </>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="fc-age-side is-end">
                                                      <span className="fc-age-label">
                                                        结束年龄
                                                      </span>
                                                      <div className="fc-age-end-checks">
                                                        <label className="fc-end-age-check">
                                                          <input
                                                            type="checkbox"
                                                            checked={
                                                              cashflow.endAtRetirement ===
                                                              true
                                                            }
                                                            onChange={(e) =>
                                                              cashflowUpdate(
                                                                cashflow.id,
                                                                {
                                                                  endAtRetirement:
                                                                    e
                                                                      .currentTarget
                                                                      .checked,
                                                                  endAtLifeExpectancy:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.endAtLifeExpectancy,
                                                                  endSameAsPrevious:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.endSameAsPrevious,
                                                                },
                                                              )
                                                            }
                                                          />
                                                          至退休
                                                        </label>
                                                        <label className="fc-end-age-check">
                                                          <input
                                                            type="checkbox"
                                                            checked={
                                                              cashflow.endAtLifeExpectancy ===
                                                              true
                                                            }
                                                            onChange={(e) =>
                                                              cashflowUpdate(
                                                                cashflow.id,
                                                                {
                                                                  endAtLifeExpectancy:
                                                                    e
                                                                      .currentTarget
                                                                      .checked,
                                                                  endAtRetirement:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.endAtRetirement,
                                                                  endSameAsPrevious:
                                                                    e
                                                                      .currentTarget
                                                                      .checked
                                                                      ? false
                                                                      : cashflow.endSameAsPrevious,
                                                                },
                                                              )
                                                            }
                                                          />
                                                          至生命结束
                                                        </label>
                                                        {previous !==
                                                          undefined && (
                                                          <label className="fc-end-age-check">
                                                            <input
                                                              type="checkbox"
                                                              checked={
                                                                cashflow.endSameAsPrevious ===
                                                                true
                                                              }
                                                              onChange={(e) =>
                                                                cashflowUpdate(
                                                                  cashflow.id,
                                                                  {
                                                                    endSameAsPrevious:
                                                                      e
                                                                        .currentTarget
                                                                        .checked,
                                                                    endAtRetirement:
                                                                      e
                                                                        .currentTarget
                                                                        .checked
                                                                        ? false
                                                                        : cashflow.endAtRetirement,
                                                                    endAtLifeExpectancy:
                                                                      e
                                                                        .currentTarget
                                                                        .checked
                                                                        ? false
                                                                        : cashflow.endAtLifeExpectancy,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                            至上个卡片结束年龄
                                                          </label>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <AgeRangeControl
                                                    start={startAge}
                                                    end={endAge}
                                                    min={config.currentAge}
                                                    max={config.lifeExpectancy}
                                                    startDisabled={
                                                      cashflow.startAtCurrentAge ===
                                                        true ||
                                                      cashflow.startAtRetirement ===
                                                        true ||
                                                      (cashflow.startSameAsPrevious ===
                                                        true &&
                                                        previous !==
                                                          undefined) ||
                                                      (cashflow.startAfterPrevious ===
                                                        true &&
                                                        previous !== undefined)
                                                    }
                                                    endDisabled={
                                                      cashflow.endAtRetirement ===
                                                        true ||
                                                      cashflow.endAtLifeExpectancy ===
                                                        true ||
                                                      (cashflow.endSameAsPrevious ===
                                                        true &&
                                                        previous !== undefined)
                                                    }
                                                    onStartChange={(value) =>
                                                      cashflowUpdate(
                                                        cashflow.id,
                                                        {
                                                          startAge: Math.max(
                                                            config.currentAge,
                                                            Math.min(
                                                              value,
                                                              cashflowEndAge(
                                                                config.cashflows,
                                                                index,
                                                                config,
                                                              ),
                                                            ),
                                                          ),
                                                          endAge:
                                                            cashflow.endAtRetirement ||
                                                            cashflow.endAtLifeExpectancy ||
                                                            (cashflow.endSameAsPrevious &&
                                                              previous !==
                                                                undefined)
                                                              ? cashflow.endAge
                                                              : Math.max(
                                                                  value,
                                                                  cashflow.endAge,
                                                                ),
                                                        },
                                                      )
                                                    }
                                                    onEndChange={(value) =>
                                                      cashflowUpdate(
                                                        cashflow.id,
                                                        {
                                                          endAtRetirement: false,
                                                          endAtLifeExpectancy: false,
                                                          endSameAsPrevious: false,
                                                          endAge: Math.min(
                                                            config.lifeExpectancy,
                                                            value,
                                                          ),
                                                        },
                                                      )
                                                    }
                                                  />
                                                </div>
                                              </>
                                            ) : null}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="fc-button-row">
                                    <button
                                      type="button"
                                      className="fc-btn small"
                                      onClick={() => addCashflow(kind)}
                                      disabled={config.cashflows.length >= 50}
                                    >
                                      ＋ 添加
                                      {kind === "income" ? "收入" : "支出"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="fc-note">
                            收入与支出分列展示，拖动排序只在同列内进行。“上一张卡片”指同一列（同一类型）中排在该卡片前的一张。起止年龄均包含在区间内，金额为每月金额，折叠状态即可直接编辑。新增卡片默认自同列上一张卡片结束年龄后一年开始、至退休结束。点击生效年龄标签展开或收起年龄设置；拖动两端滑块或直接输入数字调整年龄，“自当前年龄”“自退休”“自上个卡片开始年龄”“自上个卡片结束年龄”决定开始年龄，“至退休”“至生命结束”“至上个卡片结束年龄”决定结束年龄，三者互斥。
                          </p>
                          <h4 className="fc-subheading">一次性现金流</h4>
                          <div className="fc-event-columns">
                            {(["income", "expense"] as const).map((kind) => {
                              const items =
                                kind === "income"
                                  ? incomeEvents
                                  : expenseEvents;
                              const order =
                                kind === "income"
                                  ? eventIncomeOrder
                                  : eventExpenseOrder;
                              return (
                                <div
                                  className={`fc-event-column fc-event-column-${kind}`}
                                  key={kind}
                                >
                                  <h5 className="fc-cashflow-column-title">
                                    {kind === "income" ? "收入" : "支出"}
                                    <span>{items.length} 项</span>
                                  </h5>
                                  <div className="fc-event-list">
                                    {items.map((event) => {
                                      const index = config.events.findIndex(
                                        (item) => item.id === event.id,
                                      );
                                      return (
                                        <div
                                          className={`fc-event fc-cashflow-${event.kind}${
                                            order.draggingId === event.id
                                              ? " is-dragging"
                                              : ""
                                          }${
                                            event.enabled === false
                                              ? " is-disabled"
                                              : ""
                                          }`}
                                          key={event.id}
                                          ref={order.register(event.id)}
                                        >
                                          <div className="fc-event-head">
                                            <button
                                              type="button"
                                              className="fc-drag-handle"
                                              aria-label={`拖动一次性现金流 ${index + 1}`}
                                              title="按住拖动调整顺序，也可用上下方向键"
                                              onPointerDown={order.start(
                                                event.id,
                                              )}
                                              onPointerMove={order.move(
                                                event.id,
                                              )}
                                              onPointerUp={order.end}
                                              onPointerCancel={order.end}
                                              onKeyDown={(keyEvent) => {
                                                if (
                                                  keyEvent.key === "ArrowUp" ||
                                                  keyEvent.key === "ArrowDown"
                                                ) {
                                                  keyEvent.preventDefault();
                                                  moveEvent(
                                                    event.id,
                                                    keyEvent.key === "ArrowUp"
                                                      ? -1
                                                      : 1,
                                                  );
                                                }
                                              }}
                                            >
                                              ⠿
                                            </button>
                                            <div className="fc-event-summary">
                                              <div className="fc-event-title-row">
                                                <input
                                                  className="fc-event-title-input"
                                                  aria-label="名称"
                                                  title="点击编辑名称"
                                                  value={event.label}
                                                  maxLength={80}
                                                  onChange={(e) =>
                                                    eventUpdate(event.id, {
                                                      label:
                                                        e.currentTarget.value,
                                                    })
                                                  }
                                                />
                                                <span className="fc-event-amount">
                                                  <DragNumber
                                                    className="fc-event-amount-input"
                                                    aria-label="金额"
                                                    inputMode="decimal"
                                                    min={0}
                                                    max={100000000}
                                                    step={10000}
                                                    value={event.amount}
                                                    onChange={(value) =>
                                                      eventUpdate(event.id, {
                                                        amount: value,
                                                      })
                                                    }
                                                  />
                                                  <small>{currency}</small>
                                                </span>
                                                <div className="fc-event-actions">
                                                  <button
                                                    type="button"
                                                    className={`fc-card-toggle${
                                                      event.enabled === false
                                                        ? " off"
                                                        : ""
                                                    }`}
                                                    aria-label={`${
                                                      event.enabled === false
                                                        ? "启用"
                                                        : "停用"
                                                    }一次性现金流 ${index + 1}`}
                                                    aria-pressed={
                                                      event.enabled !== false
                                                    }
                                                    title={
                                                      event.enabled === false
                                                        ? "恢复该项参与模拟"
                                                        : "临时停用，不参与模拟"
                                                    }
                                                    onClick={() =>
                                                      eventUpdate(event.id, {
                                                        enabled:
                                                          event.enabled ===
                                                          false
                                                            ? true
                                                            : false,
                                                      })
                                                    }
                                                  >
                                                    {event.enabled === false
                                                      ? "启用"
                                                      : "停用"}
                                                  </button>
                                                  <button
                                                    type="button"
                                                    aria-label={`删除一次性现金流 ${index + 1}`}
                                                    onClick={() =>
                                                      update(
                                                        "events",
                                                        config.events.filter(
                                                          (item) =>
                                                            item.id !==
                                                            event.id,
                                                        ),
                                                      )
                                                    }
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              </div>
                                              <div className="fc-event-meta">
                                                <label className="fc-event-age-tag fc-event-age-input-wrap">
                                                  发生年龄
                                                  <DragNumber
                                                    className="fc-event-age-input"
                                                    aria-label="发生年龄"
                                                    inputMode="numeric"
                                                    min={config.currentAge}
                                                    max={
                                                      config.lifeExpectancy - 1
                                                    }
                                                    step={1}
                                                    value={event.age}
                                                    onChange={(value) =>
                                                      eventUpdate(event.id, {
                                                        age: value,
                                                      })
                                                    }
                                                  />
                                                  岁
                                                </label>
                                                <button
                                                  type="button"
                                                  className={`fc-event-inflation-tag${
                                                    event.inflationAdjusted
                                                      ? ""
                                                      : " is-fixed"
                                                  }`}
                                                  aria-pressed={
                                                    event.inflationAdjusted
                                                  }
                                                  aria-label={`将一次性金额切换为${
                                                    event.inflationAdjusted
                                                      ? "固定金额"
                                                      : "跟随通胀"
                                                  }`}
                                                  title={
                                                    event.inflationAdjusted
                                                      ? `当前金额跟随 ${config.inflationRate.toFixed(1)}%/年 通胀调整；点击改为固定金额`
                                                      : "当前金额固定不变；点击改为跟随通胀"
                                                  }
                                                  onClick={() =>
                                                    eventUpdate(event.id, {
                                                      inflationAdjusted:
                                                        !event.inflationAdjusted,
                                                    })
                                                  }
                                                >
                                                  <Icon
                                                    name="inflation"
                                                    size={11}
                                                  />
                                                  {event.inflationAdjusted
                                                    ? `跟随通胀 ${config.inflationRate.toFixed(
                                                        1,
                                                      )}%`
                                                    : "固定金额"}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="fc-button-row">
                                    <button
                                      type="button"
                                      className="fc-btn small"
                                      onClick={() => addEvent(kind)}
                                      disabled={config.events.length >= 50}
                                    >
                                      {`＋ 添加一次性${
                                        kind === "income" ? "收入" : "支出"
                                      }`}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Section>
                      </div>
                      <div
                        className="fc-config-section-pane"
                        hidden={settingsSection !== "04"}
                      >
                        <Section
                          number="04"
                          title="收益、通胀与费率"
                          icon="trend"
                          columns={6}
                        >
                          <div className="fc-field-stack fc-span-2">
                            <h4 className="fc-field-stack-title is-stocks">
                              股票
                            </h4>
                            {field("stockReturn", "股票年化收益率", {
                              min: -50,
                              max: 100,
                              step: 0.1,
                              unit: "%",
                            })}
                            {field("stockVolatility", "股票年化波动率", {
                              min: 0,
                              max: 100,
                              step: 0.5,
                              unit: "%",
                            })}
                          </div>
                          <div className="fc-field-stack fc-span-2">
                            <h4 className="fc-field-stack-title is-bonds">
                              债券
                            </h4>
                            {field("bondReturn", "债券年化收益率", {
                              min: -50,
                              max: 100,
                              step: 0.1,
                              unit: "%",
                            })}
                            {field("bondVolatility", "债券年化波动率", {
                              min: 0,
                              max: 100,
                              step: 0.5,
                              unit: "%",
                            })}
                          </div>
                          <div className="fc-field-stack fc-span-2">
                            <h4 className="fc-field-stack-title is-inflation">
                              现金通胀收益
                            </h4>
                            <NumberField
                              label="现金实际收益"
                              value={
                                config.cashMode === "real"
                                  ? config.cashRealReturn
                                  : 0
                              }
                              min={-50}
                              max={30}
                              step={0.1}
                              unit="%"
                              hint="在通胀之上"
                              onChange={cashInflationReturn}
                            />
                            <p className="fc-note">
                              0%
                              表示现金购买力不变；正数表示跑赢通胀，负数表示跑输通胀。管理费仍会从现金中扣除。
                            </p>
                          </div>
                          <div className="fc-field-stack fc-span-3">
                            <h4 className="fc-field-stack-title is-fees">
                              税率管理费
                            </h4>
                            {field("stockTax", "股票收益税率", {
                              min: 0,
                              max: 100,
                              step: 1,
                              unit: "%",
                            })}
                            {field("bondTax", "债券收益税率", {
                              min: 0,
                              max: 100,
                              step: 1,
                              unit: "%",
                            })}
                            {field("managementFee", "年化管理费", {
                              min: 0,
                              max: 10,
                              step: 0.05,
                              unit: "%",
                            })}
                          </div>
                          <div className="fc-field-stack fc-span-3">
                            <h4 className="fc-field-stack-title is-inflation">
                              通胀和波动
                            </h4>
                            {field("inflationRate", "年通胀率", {
                              min: -10,
                              max: 50,
                              step: 0.1,
                              unit: "%",
                            })}
                            {field("inflationVolatility", "通胀年波动率", {
                              min: 0,
                              max: 30,
                              step: 0.1,
                              unit: "%",
                            })}
                          </div>
                          <p className="fc-note">
                            收益率填税前名义年化值，管理费单独扣除。税率用于年度正投资收益的简化估算；手动模式不使用波动率参数。
                          </p>
                        </Section>
                      </div>
                      <div
                        className="fc-config-section-pane"
                        hidden={settingsSection !== "05"}
                      >
                        <Section
                          number="05"
                          title="模拟模式与提款策略"
                          icon="target"
                        >
                          <SelectField
                            label="计算模式"
                            value={config.mode}
                            options={[
                              ["monthly", "月度随机 · 月收益独立抽样"],
                              ["manual", "手动指定 · 固定年化情景"],
                            ]}
                            onChange={(value) => update("mode", value)}
                          />
                          <SelectField
                            label="退休后的提款策略"
                            value={config.strategy}
                            options={[
                              ["fixed", "固定购买力 · 保持生活水平"],
                              ["percentage", "固定比例 · 按组合余额消费"],
                              ["guardrails", "动态护栏 · 随市场调整支出"],
                            ]}
                            onChange={(value) => update("strategy", value)}
                          />
                          {config.strategy === "percentage"
                            ? field("withdrawalRate", "年度提款比例", {
                                min: 0.1,
                                max: 30,
                                step: 0.1,
                                unit: "%",
                              })
                            : null}
                          {config.strategy === "guardrails" ? (
                            <SelectField
                              label="护栏提取率基准"
                              value={config.guardrailRateMode}
                              options={[
                                ["initial", "护栏初始率 · 首个正净提款年度"],
                                ["manual", "手动指定提取率"],
                              ]}
                              onChange={(value) =>
                                update("guardrailRateMode", value)
                              }
                            />
                          ) : null}
                          {config.strategy === "guardrails" &&
                          config.guardrailRateMode === "manual"
                            ? field("guardrailManualRate", "手动提取率", {
                                min: 0.1,
                                max: 30,
                                step: 0.1,
                                unit: "%",
                              })
                            : null}
                          {config.mode === "manual" ? (
                            <p className="fc-note">
                              使用上方“收益、通胀与费率”中的收益率及通胀率，计算一条固定情景路径。
                            </p>
                          ) : null}
                          <p className="fc-note">
                            {STRATEGIES[config.strategy].description}
                          </p>
                          {config.strategy === "guardrails" ? (
                            <>
                              <p className="fc-note">
                                {config.guardrailRateMode === "initial"
                                  ? "基准率 = 开始护栏时同一条路径的（策略消费预算 − 常规收入）÷ 年初资产；若退休首年没有正净提款，会顺延到后续首个正净提款年度建立。"
                                  : `基准率 = 手动指定的 ${config.guardrailManualRate}%/年，从退休首年开始用于触发线计算；实际净提款率仍按当年预算、收入和年初资产计算。`}
                                此后每年用当前净提款率与基准率比较。
                              </p>
                              {field(
                                "guardrailRaiseThreshold",
                                "消费上调触发线",
                                {
                                  min: 0.1,
                                  max: 500,
                                  step: 0.1,
                                  unit: "%",
                                  hint: "基准率 ×",
                                },
                              )}
                              {field(
                                "guardrailCutThreshold",
                                "消费下调触发线",
                                {
                                  min: 0.1,
                                  max: 500,
                                  step: 0.1,
                                  unit: "%",
                                  hint: "基准率 ×",
                                },
                              )}
                              {field("guardrailAdjustment", "单次调整幅度", {
                                min: 0.1,
                                max: 100,
                                step: 0.1,
                                unit: "%",
                              })}
                              {field("guardrailMinSpending", "最低消费", {
                                min: 0,
                                max: 100,
                                step: 1,
                                unit: "%",
                                hint: "计划支出 ×",
                              })}
                              {field("guardrailMaxSpending", "最高消费", {
                                min: 100,
                                max: 500,
                                step: 1,
                                unit: "%",
                                hint: "计划支出 ×",
                              })}
                              <p className="fc-note">
                                每年初比较一次：当前净提款率低于“基准率 ×{" "}
                                {config.guardrailRaiseThreshold}
                                %”时，消费预算上调 {config.guardrailAdjustment}
                                %；高于“基准率 × {config.guardrailCutThreshold}
                                %”时，消费预算下调 {config.guardrailAdjustment}
                                %。调整后限制在“当年计划支出 ×{" "}
                                {config.guardrailMinSpending.toFixed(0)}%～
                                {config.guardrailMaxSpending.toFixed(0)}%”。
                              </p>
                            </>
                          ) : null}
                          <SelectField
                            label="模拟次数"
                            value={config.simulations}
                            options={[
                              [500, "500 次"],
                              [1000, "1,000 次"],
                              [2000, "2,000 次"],
                              [5000, "5,000 次"],
                            ]}
                            onChange={(value) => update("simulations", value)}
                          />
                          {field("seed", "随机种子", {
                            min: 1,
                            max: 2147483647,
                            step: 1,
                          })}
                          <p className="fc-note">
                            相同种子可复现模拟结果，便于比较不同参数；手动模式只计算一次。
                          </p>
                        </Section>
                      </div>
                    </div>
                    <footer className="fc-config-footer">
                      {issues.length > 0 ? (
                        <ul className="fc-issues" aria-label="需要检查的参数">
                          {issues.slice(0, 5).map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="fc-config-actions">
                        {running ? (
                          <button
                            className="fc-btn primary"
                            type="button"
                            onClick={cancelRun}
                          >
                            取消模拟 · {Math.round(progress)}%
                          </button>
                        ) : (
                          <button
                            className="fc-btn primary"
                            type="button"
                            disabled={issues.length > 0 || reloading}
                            onClick={() =>
                              void run(
                                config,
                                planCacheKey(activePlanId, config),
                              )
                            }
                          >
                            <Icon name="play" size={14} />
                            运行模拟
                          </button>
                        )}
                        <button
                          className="fc-btn"
                          type="button"
                          disabled={
                            issues.length > 0 ||
                            !dirty ||
                            saving ||
                            reloading ||
                            !canWrite
                          }
                          onClick={savePlan}
                        >
                          <Icon name="save" />
                          {!dirty
                            ? "方案已保存"
                            : saving
                              ? "保存中…"
                              : "保存方案"}
                        </button>
                        <button
                          className="fc-btn ghost"
                          type="button"
                          disabled={saving || reloading}
                          onClick={() => void resetPlan()}
                        >
                          <Icon name="reset" />
                          {reloading ? "读取中…" : "重置"}
                        </button>
                      </div>
                      {running ? (
                        <div
                          className="fc-config-progress"
                          role="progressbar"
                          aria-label="模拟进度"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(progress)}
                        >
                          <i style={{ width: `${progress}%` }} />
                        </div>
                      ) : null}
                      <div className="fc-config-footnote">
                        在浏览器本地计算 · 参数更改后点击运行
                      </div>
                    </footer>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
          <ResultPanel
            result={result}
            config={config}
            running={running}
            progress={progress}
            currency={currency}
            columnStorageKey={columnStorageKey}
            nominalStorageKey={nominalStorageKey}
          />
        </div>
        <footer className="fc-footer">
          <span>
            <Icon name="lock" size={10} />
            方案只保存在此设备，按账本独立存储
          </span>
          <span>模拟用于规划参考，实际市场与税务结果可能不同</span>
        </footer>
      </div>
    </div>
  );
}
