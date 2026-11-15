import React, { useId, useState } from "react";

export function ColumnFilter({
  title,
  count,
  onClear,
  children,
  className = "",
}: {
  title: string;
  count: number;
  onClear: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  return (
    <>
      <button
        className={`pm-filter-trigger${count ? " pm-filter-active" : ""}`}
        aria-label={`筛选${title}`}
        title={`筛选${title}`}
        aria-expanded={open}
        popoverTarget={id}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition({
            top: Math.max(
              12,
              Math.min(rect.bottom + 8, window.innerHeight - 584),
            ),
            left: Math.max(12, Math.min(rect.left, window.innerWidth - 336)),
          });
        }}
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 5h16M7 12h10M10 19h4" />
        </svg>
        {count > 0 && <span className="pm-filter-count">{count}</span>}
      </button>
      <div
        id={id}
        popover="auto"
        className={`pm-filter-popover ${className}`.trim()}
        style={position}
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <div className="pm-filter-title">
          <strong>{title}</strong>
          <span className="pm-muted">即时筛选</span>
        </div>
        {children}
        <div className="pm-filter-footer">
          <button disabled={!count} onClick={onClear}>
            清除此列
          </button>
          <button
            className="pm-primary"
            popoverTarget={id}
            popoverTargetAction="hide"
          >
            完成
          </button>
        </div>
      </div>
    </>
  );
}

export function FilterGroup({
  label,
  excluded,
  onExcludeChange,
  children,
}: {
  label: string;
  excluded: boolean;
  onExcludeChange: (excluded: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      className="pm-filter-group"
      data-excluded={excluded}
      aria-label={label}
    >
      <div className="pm-filter-group-header">
        <strong>{label}</strong>
        <div
          className="pm-filter-polarity"
          role="group"
          aria-label={`${label}匹配方式`}
        >
          <button
            type="button"
            aria-label={`${label}：包含`}
            aria-pressed={!excluded}
            onClick={() => onExcludeChange(false)}
          >
            包含
          </button>
          <button
            type="button"
            aria-label={`${label}：排除`}
            aria-pressed={excluded}
            className="pm-exclude-toggle"
            onClick={() => onExcludeChange(true)}
          >
            排除
          </button>
        </div>
      </div>
      {children}
    </fieldset>
  );
}

export function FilterChoices({
  label,
  description,
  options,
  values,
  onChange,
  excluded,
  onExcludeChange,
}: {
  label: string;
  description?: string;
  options: readonly (readonly [string, string])[];
  values: string[];
  onChange: (values: string[]) => void;
  excluded: boolean;
  onExcludeChange: (excluded: boolean) => void;
}) {
  return (
    <FilterGroup
      label={label}
      excluded={excluded}
      onExcludeChange={onExcludeChange}
    >
      {description && <p className="pm-filter-description">{description}</p>}
      <div className="pm-filter-choices">
        {options.map(([value, title]) => (
          <label key={value}>
            <input
              type="checkbox"
              aria-label={`筛选${label}：${title}`}
              checked={values.includes(value)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...values, value]
                    : values.filter((item) => item !== value),
                )
              }
            />
            {title}
          </label>
        ))}
      </div>
    </FilterGroup>
  );
}
