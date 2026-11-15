import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DateRangePreset, MetricName, PortfolioConfig } from "../types";
import { formatMoney, formatPercent, toneForValue } from "../format";

export function Panel({
  title,
  description,
  action,
  children,
  flush = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="pf-panel">
      <header className="pf-panel-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </header>
      <div className={`pf-panel-body${flush ? " flush" : ""}`}>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  detail,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "profit" | "loss" | "teal" | "amber";
}) {
  return (
    <article className="pf-kpi" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="pf-empty">
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

const RANGES: DateRangePreset[] = [
  "3M",
  "6M",
  "YTD",
  "1Y",
  "2Y",
  "3Y",
  "5Y",
  "10Y",
  "MAX",
];

export function Toolbar({
  config,
  preset,
  setPreset,
  currency,
  setCurrency,
  currencies,
  selection,
  setSelection,
}: {
  config: PortfolioConfig;
  preset: DateRangePreset;
  setPreset(value: DateRangePreset): void;
  currency: string;
  setCurrency(value: string): void;
  currencies: string[];
  selection: string[];
  setSelection(value: string[]): void;
}) {
  const [selectionOpen, setSelectionOpen] = useState(false);
  const selectionRef = useRef<HTMLDetailsElement>(null);
  const selected = new Set(selection);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelection([...next]);
  };
  useEffect(() => {
    if (!selectionOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        selectionRef.current?.contains(event.target)
      )
        return;
      setSelectionOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectionOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectionOpen]);
  const selectionLabel =
    selection.length === 0 ? "全部投资" : `${selection.length} 个筛选条件`;
  return (
    <div className="pf-toolbar">
      <label className="pf-field">
        区间
        <select
          value={preset}
          onChange={(event) => setPreset(event.target.value as DateRangePreset)}
        >
          {RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>
      <label className="pf-field">
        货币
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        >
          {[...new Set([currency, ...currencies])].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <details
        ref={selectionRef}
        className="pf-selection"
        open={selectionOpen}
        onToggle={(event) => {
          const next = event.currentTarget.open;
          if (next !== selectionOpen) setSelectionOpen(next);
        }}
      >
        <summary
          onClick={(event) => {
            event.preventDefault();
            setSelectionOpen((open) => !open);
          }}
        >
          筛选 · {selectionLabel}
        </summary>
        <div className="pf-selection-menu">
          <label className="pf-check">
            <input
              type="checkbox"
              checked={selection.length === 0}
              onChange={() => setSelection([])}
            />
            全部启用的投资账户
          </label>
          {config.groups.map((group) => (
            <label className="pf-check" key={group.id}>
              <input
                type="checkbox"
                checked={selected.has(group.id)}
                onChange={() => toggle(group.id)}
              />
              {group.name}
              <small>分组</small>
            </label>
          ))}
          {config.investments
            .filter((investment) => investment.enabled)
            .map((investment) => (
              <label className="pf-check" key={investment.id}>
                <input
                  type="checkbox"
                  checked={selected.has(investment.id)}
                  onChange={() => toggle(investment.id)}
                />
                {investment.name}
                <small>{investment.commodity}</small>
              </label>
            ))}
        </div>
      </details>
    </div>
  );
}

export function MetricSelect({
  value,
  setValue,
  options,
}: {
  value: MetricName;
  setValue(value: MetricName): void;
  options: Array<{ value: MetricName; label: string }>;
}) {
  return (
    <div className="pf-segment" role="group" aria-label="指标">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => setValue(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function metricText(
  metric: MetricName,
  value: number,
  currency: string,
): string {
  return metric === "pnl" ? formatMoney(value, currency) : formatPercent(value);
}

export function metricTone(
  metric: MetricName,
  value: number,
  scheme: "green-red" | "red-green",
): "profit" | "loss" | "neutral" {
  if (metric === "mdd" || metric === "volatility") return "neutral";
  return toneForValue(value, scheme);
}
