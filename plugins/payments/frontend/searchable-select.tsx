import React, { useMemo } from "react";
import { useSearchMenu } from "@plugins/shared/frontend/use-search-menu";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectTagOption = SelectOption & {
  color?: string;
};

export type SelectTagGroup = {
  label: string;
  value: string;
  options: readonly SelectTagOption[];
  breakAfter?: number;
  disabled?: boolean;
  onChange(value: string): void;
};

function SelectChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`pm-search-select-chevron${open ? " is-open" : ""}`}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m3.5 6 4.5 4.5L12.5 6" />
    </svg>
  );
}

export function SearchableSelect({
  label,
  searchLabel,
  value,
  options,
  placeholder = "请选择",
  disabled,
  onChange,
}: {
  label: string;
  searchLabel: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange(value: string): void;
}) {
  const menu = useSearchMenu();
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = menu.query.trim().toLocaleLowerCase();
    return needle
      ? options.filter((option) =>
          `${option.label} ${option.value}`
            .toLocaleLowerCase()
            .includes(needle),
        )
      : options;
  }, [menu.query, options]);
  function choose(option: SelectOption) {
    onChange(option.value);
    menu.setQuery("");
    menu.setOpen(false);
  }
  return (
    <div className="pm-search-select" ref={menu.root}>
      <div
        className={`pm-search-select-trigger${disabled ? " is-disabled" : ""}`}
        onClick={() => {
          if (disabled) return;
          menu.setOpen((current) => !current);
          menu.placeMenu();
          menu.setQuery("");
        }}
      >
        <input
          type="text"
          readOnly
          aria-label={label}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={menu.open}
          disabled={disabled}
          placeholder={value === "" && selected ? selected.label : placeholder}
          value={value === "" ? "" : (selected?.label ?? "")}
          onChange={(event) => {
            const option = options.find(
              (item) =>
                item.value === event.target.value ||
                item.label === event.target.value,
            );
            if (option) choose(option);
          }}
          onKeyDown={(event) => {
            if (
              event.key === "ArrowDown" ||
              event.key === "ArrowUp" ||
              event.key === "Enter"
            ) {
              event.preventDefault();
              menu.placeMenu();
              menu.setOpen(true);
            }
          }}
        />
        <SelectChevron open={menu.open} />
      </div>
      {menu.open && (
        <div
          className="pm-search-select-menu"
          popover="manual"
          role="listbox"
          aria-label={label}
          style={menu.position}
        >
          <input
            data-menu-initial-focus
            type="search"
            aria-label={searchLabel}
            placeholder="输入关键字搜索"
            value={menu.query}
            onChange={(event) => {
              menu.setQuery(event.target.value);
              menu.setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                menu.setActive((current) =>
                  Math.min(current + 1, Math.max(filtered.length - 1, 0)),
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                menu.setActive((current) => Math.max(current - 1, 0));
              } else if (event.key === "Enter" && filtered[menu.active]) {
                event.preventDefault();
                choose(filtered[menu.active]);
              } else if (event.key === "Escape") {
                event.preventDefault();
                menu.setOpen(false);
              }
            }}
          />
          <div className="pm-search-select-options">
            {filtered.map((option, index) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={index === menu.active ? "is-active" : undefined}
                key={option.value}
                onMouseEnter={() => menu.setActive(index)}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {option.value === value && <span aria-hidden="true">✓</span>}
              </button>
            ))}
            {!filtered.length && <p>没有匹配项</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchableMultiSelect({
  label,
  searchLabel,
  values,
  options,
  placeholder,
  tagGroup,
  compact = false,
  inlineMenu = false,
  disabled,
  onChange,
}: {
  label: string;
  searchLabel: string;
  values: string[];
  options: SelectOption[];
  placeholder: string;
  tagGroup?: SelectTagGroup;
  compact?: boolean;
  inlineMenu?: boolean;
  disabled?: boolean;
  onChange(values: string[]): void;
}) {
  const menu = useSearchMenu({ inline: inlineMenu });
  const filtered = useMemo(() => {
    const needle = menu.query.trim().toLocaleLowerCase();
    return needle
      ? options.filter((option) =>
          `${option.label} ${option.value}`
            .toLocaleLowerCase()
            .includes(needle),
        )
      : options;
  }, [menu.query, options]);
  const selected = new Set(values);
  const selectedLabels = values.map(
    (value) => options.find((option) => option.value === value)?.label ?? value,
  );
  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((option) => selected.has(option.value));
  const tagRows = tagGroup
    ? tagGroup.breakAfter
      ? [
          tagGroup.options.slice(0, tagGroup.breakAfter),
          tagGroup.options.slice(tagGroup.breakAfter),
        ]
      : [tagGroup.options]
    : [];
  function toggleFiltered() {
    const visible = new Set(filtered.map((option) => option.value));
    onChange(
      allFilteredSelected
        ? values.filter((value) => !visible.has(value))
        : [...new Set([...values, ...visible])],
    );
  }
  return (
    <div
      className={`pm-search-select pm-search-multi${compact ? " is-compact" : ""}${values.length ? " has-selection" : ""}`}
      ref={menu.root}
      onKeyDown={(event) => {
        if (inlineMenu && menu.open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          menu.setOpen(false);
          event.currentTarget
            .querySelector<HTMLButtonElement>("button")
            ?.focus({ preventScroll: true });
        }
      }}
    >
      <button
        type="button"
        className="pm-search-select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={menu.open}
        disabled={disabled}
        onClick={() => {
          if (!menu.open) {
            menu.setQuery("");
            menu.setActive(0);
            menu.placeMenu();
          }
          menu.setOpen((current) => !current);
        }}
      >
        <span>
          {values.length
            ? compact
              ? selectedLabels.join("、")
              : `已选 ${values.length} 项`
            : placeholder}
        </span>
        <SelectChevron open={menu.open} />
      </button>
      {compact && !!values.length && (
        <button
          type="button"
          className="pm-multi-compact-clear"
          aria-label={`清空${label}`}
          title="清空已选"
          disabled={disabled}
          onClick={() => onChange([])}
        >
          ×
        </button>
      )}
      {!compact && !!values.length && (
        <div className="pm-multi-chips" aria-label={`${label}已选项`}>
          {values.map((value) => (
            <span key={value}>
              {options.find((option) => option.value === value)?.label ?? value}
              <button
                type="button"
                aria-label={`移除${options.find((option) => option.value === value)?.label ?? value}`}
                disabled={disabled}
                onClick={() =>
                  onChange(values.filter((item) => item !== value))
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {menu.open && (
        <div
          className={`pm-search-select-menu${inlineMenu ? " pm-search-select-menu-inline" : ""}`}
          popover={inlineMenu ? undefined : "manual"}
          role="listbox"
          aria-label={label}
          style={inlineMenu ? undefined : menu.position}
        >
          {tagGroup && (
            <div className="pm-search-select-tag-group">
              <div role="group" aria-label={tagGroup.label}>
                {tagRows.map((row, rowIndex) => (
                  <div className="pm-search-select-tag-row" key={rowIndex}>
                    {row.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        aria-pressed={tagGroup.value === option.value}
                        disabled={disabled || tagGroup.disabled}
                        style={
                          {
                            "--pm-select-tag-color": option.color ?? "#7c3aed",
                          } as React.CSSProperties
                        }
                        onClick={() => {
                          tagGroup.onChange(option.value);
                          menu.setActive(0);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <input
            data-menu-initial-focus
            type="search"
            aria-label={searchLabel}
            placeholder="输入关键字搜索"
            value={menu.query}
            onChange={(event) => menu.setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") menu.setOpen(false);
            }}
          />
          <div className="pm-search-select-options">
            {filtered.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  disabled={disabled}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...values, option.value]
                        : values.filter((item) => item !== option.value),
                    )
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
            {!filtered.length && <p>没有匹配项</p>}
          </div>
          <div className="pm-search-select-footer">
            <span>{filtered.length} 项</span>
            <button
              type="button"
              disabled={disabled || !filtered.length}
              onClick={toggleFiltered}
            >
              {allFilteredSelected ? "取消全选" : "全选"}
            </button>
            <button
              type="button"
              disabled={disabled || !values.length}
              onClick={() => onChange([])}
            >
              清空已选
            </button>
            <button type="button" onClick={() => menu.setOpen(false)}>
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
