import { useEffect, useState } from "react";
import { useSearchMenu } from "@plugins/shared/frontend/use-search-menu";
import {
  matcherFromText,
  matcherCatalogMatches,
  matcherKindLabel,
  matcherStatement,
  matcherText,
  metaValueText,
  selectedExactValues,
  setRecordEntry,
  setSelectedExactValues,
} from "./model";
import type { CatalogValue, MetaValue, TagPair, TextMatcher } from "./types";

export function PickerIcon({
  kind,
}: {
  kind:
    | "tag"
    | "user"
    | "account"
    | "meta"
    | "text"
    | "search"
    | "calendar"
    | "filter"
    | "plus";
}) {
  if (kind === "plus")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M10 4.5v11M4.5 10h11" />
      </svg>
    );
  if (kind === "tag")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M3 8.5V4h4.5L16 12.5 12.5 16 3 8.5Z" />
        <circle cx="6.5" cy="6.5" r=".8" />
      </svg>
    );
  if (kind === "user")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="10" cy="6.5" r="3" />
        <path d="M4.5 16c.6-3 2.4-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      </svg>
    );
  if (kind === "account")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="m3.5 8 6.5-4 6.5 4v1.5h-13V8Z" />
        <path d="M5.5 9.5v5M8.5 9.5v5M11.5 9.5v5M14.5 9.5v5M4 16.5h12" />
      </svg>
    );
  if (kind === "meta")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M7 4H4v3M13 4h3v3M7 16H4v-3M13 16h3v-3" />
        <circle cx="10" cy="10" r="1.4" />
      </svg>
    );
  if (kind === "search")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="9" cy="9" r="6" />
        <path d="m13.5 13.5 3 3" />
      </svg>
    );
  if (kind === "calendar")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <rect x="3.5" y="5" width="13" height="11.5" rx="2" />
        <path d="M6.5 3.5v3M13.5 3.5v3M3.5 8.5h13" />
      </svg>
    );
  if (kind === "filter")
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M3.5 5h13l-5 5.3V16L8.5 14v-3.7L3.5 5Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 5.5h12M4 10h8M4 14.5h10" />
    </svg>
  );
}

type PickerOption = {
  id: string;
  label: string;
  count: number;
};
export type PickerGroup = {
  id: string;
  label: string;
  icon: "tag" | "user" | "meta" | "text";
  options: PickerOption[];
  allOption?: PickerOption;
};

export function FacetedPicker({
  label,
  title,
  groups,
  selected,
  disabled,
  onToggle,
  onSelectMany,
  onAddSearch,
  addSearchLabel = "添加搜索值",
}: {
  label: string;
  title: string;
  groups: PickerGroup[];
  selected: Set<string>;
  disabled: boolean;
  onToggle(id: string, checked: boolean): void;
  onSelectMany?(ids: string[], checked: boolean): void;
  onAddSearch?(value: string): void;
  addSearchLabel?: string;
}) {
  const menu = useSearchMenu({
    minWidth: 400,
    maxWidth: 520,
    maxHeight: 470,
  });
  const availableGroups = groups.filter((group) => group.options.length > 0);
  const [activeGroup, setActiveGroup] = useState("");
  const group = availableGroups.find((item) => item.id === activeGroup);
  const query = menu.query.trim().toLocaleLowerCase();
  const searchGroups = query
    ? availableGroups
        .map((item) => {
          const keyMatches = item.label.toLocaleLowerCase().includes(query);
          const allValuesMatch = item.allOption?.label
            .toLocaleLowerCase()
            .includes(query);
          return {
            ...item,
            options:
              keyMatches || allValuesMatch
                ? item.options
                : item.options.filter((option) =>
                    option.label.toLocaleLowerCase().includes(query),
                  ),
          };
        })
        .filter((item) => item.options.length > 0)
    : group
      ? [group]
      : [];
  const browseGroups = !query && availableGroups.length > 1 && !group;
  const searchPlaceholder = onAddSearch
    ? "搜索已有标签，或输入正则…"
    : availableGroups.length
      ? availableGroups.length > 1
        ? "搜索键或值…"
        : `搜索${availableGroups[0]?.label ?? title}…`
      : "搜索账本内容…";
  const addSearchValue = () => {
    const value = menu.query.trim();
    if (!value || !onAddSearch) return;
    onAddSearch(value);
    menu.setQuery("");
    menu.setOpen(false);
  };
  const visibleGroups = browseGroups ? availableGroups : searchGroups;
  const visibleIds = [
    ...new Set(
      visibleGroups.flatMap((item) => [
        ...(item.allOption ? [item.allOption.id] : []),
        ...item.options.map((option) => option.id),
      ]),
    ),
  ];
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  return (
    <div className="pm-search-select" ref={menu.root}>
      <button
        type="button"
        className="fmp-picker-trigger"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={menu.open}
        onClick={() => {
          if (menu.open) {
            menu.setOpen(false);
            return;
          }
          setActiveGroup(
            availableGroups.length > 1 ? "" : (availableGroups[0]?.id ?? ""),
          );
          menu.setQuery("");
          menu.setOpen(true);
        }}
      >
        <PickerIcon kind={groups[0]?.icon ?? "filter"} />
        {label}
        {selected.size ? (
          <span className="fmp-count">{selected.size}</span>
        ) : null}
      </button>
      {menu.open ? (
        <div
          className="pm-search-select-menu fmp-picker-menu"
          popover="manual"
          role="dialog"
          aria-label={title}
          style={menu.position}
        >
          <div className="fmp-picker-search">
            <label>
              <PickerIcon kind="search" />
              <input
                data-menu-initial-focus
                type="search"
                value={menu.query}
                placeholder={searchPlaceholder}
                aria-label={`搜索${title}`}
                onChange={(event) => menu.setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key !== "Enter" ||
                    !onAddSearch ||
                    event.nativeEvent.isComposing
                  )
                    return;
                  event.preventDefault();
                  addSearchValue();
                }}
              />
            </label>
            {menu.query.trim() && onAddSearch ? (
              <button
                type="button"
                className="fmp-picker-add-search"
                onClick={addSearchValue}
              >
                <PickerIcon kind="plus" />
                <span>{addSearchLabel}</span>
                <code>{menu.query.trim()}</code>
              </button>
            ) : null}
          </div>
          {browseGroups ? (
            <div className="fmp-facet-list" role="list" aria-label="选项分类">
              {availableGroups.map((item) => (
                <button
                  type="button"
                  role="listitem"
                  className="fmp-facet-list-item"
                  key={item.id}
                  onClick={() => setActiveGroup(item.id)}
                >
                  <span className="fmp-facet-list-icon">
                    <PickerIcon kind={item.icon} />
                  </span>
                  <span className="fmp-facet-list-copy">
                    <strong>{item.label}</strong>
                    <small>
                      {item.options.length} 个值
                      {item.options.some((option) => selected.has(option.id)) ||
                      (item.allOption && selected.has(item.allOption.id))
                        ? ` · 已选 ${
                            item.options.filter((option) =>
                              selected.has(option.id),
                            ).length +
                            (item.allOption && selected.has(item.allOption.id)
                              ? 1
                              : 0)
                          }`
                        : ""}
                    </small>
                  </span>
                  <span className="fmp-facet-list-chevron" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <>
              {!query && group && availableGroups.length > 1 ? (
                <div className="fmp-facet-breadcrumb">
                  <button type="button" onClick={() => setActiveGroup("")}>
                    <span aria-hidden="true">‹</span>
                    全部键
                  </button>
                  <span>
                    <PickerIcon kind={group.icon} />
                    <strong>{group.label}</strong>
                  </span>
                  <small>{group.options.length} 个值</small>
                </div>
              ) : null}
              {!query && group?.allOption ? (
                <label className="fmp-picker-option is-all-values">
                  <input
                    type="checkbox"
                    checked={selected.has(group.allOption.id)}
                    onChange={(event) =>
                      onToggle(group.allOption!.id, event.target.checked)
                    }
                  />
                  <span>{group.allOption.label}</span>
                  <small>{group.allOption.count}</small>
                </label>
              ) : null}
              <div className="fmp-picker-options">
                {searchGroups.map((item) => (
                  <div key={item.id}>
                    {query ? (
                      <>
                        <div className="fmp-picker-group-title">
                          {item.label}
                        </div>
                        {item.allOption ? (
                          <label className="fmp-picker-option is-all-values">
                            <input
                              type="checkbox"
                              checked={selected.has(item.allOption.id)}
                              onChange={(event) =>
                                onToggle(
                                  item.allOption!.id,
                                  event.target.checked,
                                )
                              }
                            />
                            <span>{item.allOption.label}</span>
                            <small>{item.allOption.count}</small>
                          </label>
                        ) : null}
                      </>
                    ) : null}
                    {item.options.map((option) => (
                      <label className="fmp-picker-option" key={option.id}>
                        <input
                          type="checkbox"
                          checked={selected.has(option.id)}
                          onChange={(event) =>
                            onToggle(option.id, event.target.checked)
                          }
                        />
                        <span>{option.label}</span>
                        <small>{option.count}</small>
                      </label>
                    ))}
                  </div>
                ))}
                {searchGroups.length === 0 ? (
                  <div className="fmp-picker-empty">
                    {query
                      ? "没有匹配项"
                      : "当前数据视图没有可选项。可以切换数据视图，或在下方手动填写。"}
                  </div>
                ) : null}
              </div>
            </>
          )}
          <div className="fmp-picker-footer">
            <span>{selected.size ? `已选 ${selected.size} 项` : title}</span>
            {onSelectMany && visibleIds.length ? (
              <button
                type="button"
                className="fmp-picker-select-all"
                onClick={() => onSelectMany(visibleIds, !allVisibleSelected)}
              >
                {allVisibleSelected
                  ? "取消全选"
                  : `全选${menu.query.trim() ? "结果" : ""}`}
              </button>
            ) : null}
            <button type="button" onClick={() => menu.setOpen(false)}>
              关闭
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MatcherField({
  label,
  placeholder,
  hint,
  value,
  disabled,
  onChange,
  pickerLabel,
  pickerTitle,
  groups,
  catalog,
  anchored = true,
}: {
  label: string;
  placeholder: string;
  hint: string;
  value: TextMatcher | undefined;
  disabled: boolean;
  onChange(value: TextMatcher | undefined): void;
  pickerLabel: string;
  pickerTitle: string;
  groups: PickerGroup[];
  catalog: CatalogValue[];
  anchored?: boolean;
}) {
  const selected = selectedExactValues(value, catalog, anchored);
  const matchPreview = matcherCatalogMatches(value, catalog);
  return (
    <div className="fmp-matcher-picker">
      <div className="fmp-matcher-toolbar">
        <div className="fmp-matcher-type">
          <span className="fmp-matcher-name">{label}</span>
          <span
            className={`fmp-pattern-kind${
              matcherKindLabel(value) === "通配符" ? " is-wildcard" : ""
            }`}
          >
            {matcherKindLabel(value)}
          </span>
        </div>
        <FacetedPicker
          label={pickerLabel}
          title={pickerTitle}
          groups={groups}
          selected={selected}
          disabled={disabled}
          onToggle={(id, checked) => {
            const next = new Set(selected);
            if (checked) next.add(id);
            else next.delete(id);
            onChange(setSelectedExactValues(value, catalog, next, anchored));
          }}
        />
      </div>
      <MatcherTextarea
        label={label}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
      />
      <MatcherReadout
        statement={matcherStatement(label, value)}
        matches={matchPreview.matches}
        error={matchPreview.error}
      />
      <div className="fmp-hint">{hint}</div>
    </div>
  );
}

export function MatcherReadout({
  statement,
  matches,
  error,
}: {
  statement: string;
  matches: CatalogValue[];
  error: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandable = matches.length > 1;
  const visible = expanded ? matches : matches.slice(0, 1);
  useEffect(() => setExpanded(false), [statement, matches.length]);
  const statementLines = statement
    .replace(/\s*；\s*/gu, "\n")
    .replace(/\s+(且|或)\s+/gu, "\n$1 ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <div className="fmp-matcher-readout">
      <div className="fmp-match-statement">
        <span>匹配语句</span>
        <div className="fmp-match-statement-lines">
          {statementLines.map((line, lineIndex) => (
            <code key={`${lineIndex}-${line}`}>
              {line.split(/(且|或|起始|排除)/gu).map((part, partIndex) => {
                const tokenClass =
                  part === "且"
                    ? " is-and"
                    : part === "或"
                      ? " is-or"
                      : part === "起始"
                        ? " is-start"
                        : part === "排除"
                          ? " is-exclude"
                          : "";
                return tokenClass ? (
                  <span
                    className={`fmp-logic-token${tokenClass}`}
                    key={partIndex}
                  >
                    {part}
                  </span>
                ) : (
                  <span key={partIndex}>{part}</span>
                );
              })}
            </code>
          ))}
        </div>
      </div>
      <div
        className={`fmp-match-content${expandable ? " is-expandable" : ""}${expanded ? " is-expanded" : ""}`}
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? expanded : undefined}
        onClick={() => {
          if (expandable) setExpanded((current) => !current);
        }}
        onKeyDown={(event) => {
          if (!expandable) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((current) => !current);
          }
        }}
      >
        <span>账本匹配内容</span>
        {error ? (
          <em>{error}</em>
        ) : matches.length ? (
          <div className="fmp-match-values">
            {visible.map((item) => (
              <span className="fmp-match-value" key={item.value}>
                {item.value}
                <small>{item.count}</small>
              </span>
            ))}
          </div>
        ) : (
          <em>暂无匹配的已观察值</em>
        )}
        {!error && matches.length ? (
          <small className="fmp-match-toggle">
            {expandable
              ? expanded
                ? "收起"
                : `共 ${matches.length} 项 · 展开全部`
              : `共 ${matches.length} 项`}
          </small>
        ) : null}
      </div>
    </div>
  );
}

export function MatcherTextarea({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: TextMatcher | undefined;
  placeholder: string;
  disabled: boolean;
  onChange(value: TextMatcher | undefined): void;
}) {
  const [draft, setDraft] = useState(matcherText(value));
  useEffect(() => setDraft(matcherText(value)), [value]);
  return (
    <textarea
      className="fmp-textarea"
      aria-label={label}
      rows={2}
      value={draft}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onChange(matcherFromText(draft))}
    />
  );
}

export function KeyValueRows({
  value,
  label,
  disabled,
  keyPlaceholder,
  valuePlaceholder,
  keyHint,
  valueHint,
  showKey = true,
  newKey = "",
  addLabel = "＋ 添加键值",
  onChange,
}: {
  value: TagPair[];
  label: string;
  disabled: boolean;
  keyPlaceholder?: string;
  valuePlaceholder: string;
  keyHint?: string;
  valueHint: string;
  showKey?: boolean;
  newKey?: string;
  addLabel?: string;
  onChange(value: TagPair[]): void;
}) {
  function update(index: number, patch: Partial<TagPair>) {
    onChange(
      value.map((pair, itemIndex) =>
        itemIndex === index ? { ...pair, ...patch } : pair,
      ),
    );
  }
  return (
    <div className={`fmp-kv${showKey ? "" : " is-value-only"}`}>
      <div className="fmp-kv-head" aria-hidden="true">
        <span>关系</span>
        {showKey ? <span>{keyHint}</span> : null}
        <span>{valueHint}</span>
        <span />
      </div>
      {value.map((pair, index) => (
        <div
          className={`fmp-kv-row${pair.exclude ? " is-excluded" : ""}`}
          key={index}
        >
          <div className="fmp-kv-logic">
            <button
              type="button"
              className="fmp-kv-join"
              disabled={disabled || index === 0}
              aria-label={
                index === 0
                  ? `${label}首项`
                  : `${label}第 ${index + 1} 项与上一项使用且或或`
              }
              title={index === 0 ? "首项无需连接符" : "点击切换 AND / OR"}
              onClick={() =>
                update(index, { join: pair.join === "or" ? "and" : "or" })
              }
            >
              {index === 0 ? "起始" : pair.join === "or" ? "OR" : "AND"}
            </button>
            <button
              type="button"
              className={`fmp-kv-exclude${pair.exclude ? " is-active" : ""}`}
              aria-pressed={pair.exclude === true}
              disabled={disabled}
              onClick={() => update(index, { exclude: !pair.exclude })}
            >
              {pair.exclude ? "排除" : "正向"}
            </button>
          </div>
          {showKey ? (
            <input
              className="fmp-input"
              aria-label={`${label}第 ${index + 1} 项键`}
              value={pair.key}
              disabled={disabled}
              placeholder={keyPlaceholder}
              onChange={(event) => update(index, { key: event.target.value })}
            />
          ) : null}
          <input
            className="fmp-input"
            aria-label={`${label}第 ${index + 1} 项值`}
            value={pair.value}
            disabled={disabled}
            placeholder={valuePlaceholder}
            onChange={(event) => update(index, { value: event.target.value })}
          />
          <button
            type="button"
            className="fmp-remove"
            disabled={disabled}
            aria-label={`移除${label}第 ${index + 1} 项`}
            onClick={() =>
              onChange(value.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            移除
          </button>
        </div>
      ))}
      <button
        type="button"
        className="fmp-add"
        disabled={disabled}
        onClick={() =>
          onChange([...value, { key: newKey, value: "", join: "and" }])
        }
      >
        {addLabel}
      </button>
    </div>
  );
}

export function MetaRows({
  title,
  value,
  label,
  disabled,
  keyPlaceholder,
  valuePlaceholder,
  onChange,
}: {
  title: string;
  value: Record<string, MetaValue>;
  label: string;
  disabled: boolean;
  keyPlaceholder: string;
  valuePlaceholder: string;
  onChange(value: Record<string, MetaValue>): void;
}) {
  const entries = Object.entries(value);
  const [draftVisible, setDraftVisible] = useState(entries.length === 0);
  const [draftKey, setDraftKey] = useState("");
  const [draftValue, setDraftValue] = useState("");
  useEffect(() => {
    if (entries.length > 0) setDraftVisible(false);
  }, [entries.length]);
  const openDraft = () => {
    setDraftKey("");
    setDraftValue("");
    setDraftVisible(true);
  };
  const commitDraft = () => {
    const key = draftKey.trim();
    if (!key || draftValue === "") return;
    onChange({ ...value, [key]: draftValue });
    setDraftKey("");
    setDraftValue("");
    setDraftVisible(false);
  };
  return (
    <div className="fmp-meta-list">
      <div className="fmp-matcher-toolbar">
        <div className="fmp-matcher-type">
          <span className="fmp-matcher-name">{title}</span>
        </div>
        <div className="fmp-matcher-actions">
          <button
            type="button"
            className="fmp-picker-trigger fmp-meta-add-trigger"
            disabled={disabled}
            onClick={openDraft}
          >
            <PickerIcon kind="plus" />
            新增字段
          </button>
        </div>
      </div>
      {draftVisible ? (
        <div className="fmp-meta-row is-draft">
          <input
            className="fmp-input"
            aria-label="新元数据键"
            value={draftKey}
            disabled={disabled}
            placeholder={keyPlaceholder}
            onChange={(event) => setDraftKey(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
          <input
            className="fmp-input"
            aria-label="新元数据值"
            value={draftValue}
            disabled={disabled}
            placeholder={valuePlaceholder}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
          <button
            type="button"
            className="fmp-remove"
            disabled={disabled}
            onClick={() => setDraftVisible(false)}
          >
            移除
          </button>
        </div>
      ) : null}
      {entries.length ? (
        <div className="fmp-meta-fields">
          {entries.map(([key, item]) => (
            <div className="fmp-meta-row" key={key}>
              <input
                className="fmp-input"
                aria-label={`${label}元数据键`}
                defaultValue={key}
                disabled={disabled}
                placeholder={keyPlaceholder}
                onBlur={(event) => {
                  const next = event.target.value.trim();
                  if (next && next !== key)
                    onChange(setRecordEntry(value, key, next, item));
                }}
              />
              <input
                className="fmp-input"
                aria-label={`${label}${key}`}
                value={metaValueText(item)}
                disabled={disabled}
                placeholder={valuePlaceholder}
                onChange={(event) =>
                  onChange(setRecordEntry(value, key, key, event.target.value))
                }
              />
              <button
                type="button"
                className="fmp-remove"
                disabled={disabled}
                onClick={() =>
                  onChange(
                    Object.fromEntries(
                      Object.entries(value).filter(
                        ([itemKey]) => itemKey !== key,
                      ),
                    ),
                  )
                }
              >
                移除
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
