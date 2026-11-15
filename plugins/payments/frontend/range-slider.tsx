import React, { useEffect, useState } from "react";

function RangeValueInput({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange(value: number): void;
}) {
  const precision = step.toString().split(".")[1]?.length ?? 0;
  const formatted = value.toFixed(precision);
  const [draft, setDraft] = useState(formatted);
  useEffect(() => setDraft(formatted), [formatted]);
  function commit() {
    const amount = Number(draft);
    if (!draft.trim() || !Number.isFinite(amount)) {
      setDraft(formatted);
      return;
    }
    const next = Number(
      Math.min(max, Math.max(min, amount)).toFixed(precision),
    );
    setDraft(next.toFixed(precision));
    if (next !== value) onChange(next);
  }
  return (
    <label className="pm-range-number">
      <span aria-hidden="true">¥</span>
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={draft}
        style={{ width: `${Math.max(5, draft.length + 1)}ch` }}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape" && draft !== formatted) {
            event.preventDefault();
            event.stopPropagation();
            setDraft(formatted);
          }
        }}
      />
    </label>
  );
}

export function RangeSlider({
  label,
  min,
  max,
  value: [lower, upper],
  step,
  formatValue,
  editableValues = false,
  emptyLabel,
  kind,
  enabled = true,
  onEnabledChange,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  step: number;
  formatValue(value: number): string;
  editableValues?: boolean;
  emptyLabel?: string;
  kind?: "expense" | "income";
  enabled?: boolean;
  onEnabledChange?(enabled: boolean): void;
  onChange(value: [number, number]): void;
}) {
  const start = max > min ? ((lower - min) / (max - min)) * 100 : 0;
  const end = max > min ? ((upper - min) / (max - min)) * 100 : 100;
  const disabled = !enabled || !!emptyLabel || min === max;
  return (
    <div
      className="pm-range-control"
      role="group"
      aria-label={label}
      data-kind={kind}
      data-disabled={disabled}
      data-enabled={enabled}
    >
      <div className="pm-range-heading">
        {onEnabledChange ? (
          <button
            type="button"
            className="pm-range-toggle"
            role="switch"
            aria-label={`${label}显示开关`}
            aria-checked={enabled}
            title={`${enabled ? "排除" : "恢复显示"}${label}`}
            disabled={!!emptyLabel}
            onClick={() => onEnabledChange(!enabled)}
          >
            <span className="pm-range-switch" aria-hidden="true">
              <i />
            </span>
            <span>{label}</span>
          </button>
        ) : (
          <strong>{label}</strong>
        )}
        <span
          className="pm-range-selection"
          aria-label={`${label}已选区间`}
          title={emptyLabel || `${formatValue(lower)} 至 ${formatValue(upper)}`}
        >
          {editableValues && !emptyLabel ? (
            <>
              <RangeValueInput
                label={`${label}下限`}
                value={lower}
                min={min}
                max={upper}
                step={step}
                disabled={disabled}
                onChange={(value) => onChange([value, upper])}
              />
              <span>至</span>
              <RangeValueInput
                label={`${label}上限`}
                value={upper}
                min={lower}
                max={max}
                step={step}
                disabled={disabled}
                onChange={(value) => onChange([lower, value])}
              />
            </>
          ) : (
            emptyLabel || `${formatValue(lower)} 至 ${formatValue(upper)}`
          )}
        </span>
      </div>
      <div className="pm-range-slider">
        <div
          className="pm-range-track"
          style={{
            background: `linear-gradient(to right, var(--pm-range-muted) ${start}%, var(--pm-range-color) ${start}%, var(--pm-range-color) ${end}%, var(--pm-range-muted) ${end}%)`,
          }}
        />
        <input
          type="range"
          aria-label={`${label}下限滑条`}
          aria-valuetext={emptyLabel || formatValue(lower)}
          min={min}
          max={max}
          step={step}
          value={lower}
          disabled={disabled}
          style={{ zIndex: lower >= max ? 3 : 2 }}
          onChange={(event) =>
            onChange([Math.min(Number(event.target.value), upper), upper])
          }
        />
        <input
          type="range"
          aria-label={`${label}上限滑条`}
          aria-valuetext={emptyLabel || formatValue(upper)}
          min={min}
          max={max}
          step={step}
          value={upper}
          disabled={disabled}
          onChange={(event) =>
            onChange([lower, Math.max(Number(event.target.value), lower)])
          }
        />
      </div>
      {!emptyLabel && (
        <div className="pm-range-bounds" aria-hidden="true">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}
