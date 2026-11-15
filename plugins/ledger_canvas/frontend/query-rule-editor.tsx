import { useState } from "react";
import { EnableToggle } from "./enable-toggle";
import { RuleNameEditor } from "./inline-name-editor";
import {
  presetExpressionReferences,
  presetExpressionText,
  queryPresetExpression,
} from "./model";
import { PresetExpressionEditor } from "./preset-expression-editor";
import { TimeRangeField } from "./time-range-field";
import type {
  Filter,
  QueryColumn,
  QueryColumnSource,
  QueryPeriod,
  QueryRule,
  QueryRuleResult,
} from "./types";

const PERIOD_OPTIONS: Array<{ value: QueryPeriod; label: string }> = [
  { value: "none", label: "不计算周期（只看分组汇总）" },
  { value: "auto", label: "自动推断（读取周期元数据或日期间隔）" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "quarterly", label: "每季度" },
  { value: "semiannual", label: "每半年" },
  { value: "yearly", label: "每年" },
];

const COLUMN_SOURCE_OPTIONS: Array<{
  value: QueryColumnSource;
  label: string;
}> = [
  { value: "meta", label: "元数据" },
  { value: "date", label: "交易日期" },
  { value: "payee", label: "收款人" },
  { value: "narration", label: "摘要" },
];

function nextColumnId(columns: QueryColumn[]): string {
  let index = columns.length + 1;
  while (columns.some((column) => column.id === `column-${index}`)) index += 1;
  return `column-${index}`;
}

export function QueryRuleEditor({
  query,
  index,
  disabled,
  presets,
  availablePresetNames,
  complete,
  result,
  onChange,
  onRemove,
}: {
  query: QueryRule;
  index: number;
  disabled: boolean;
  presets: Record<string, Filter>;
  availablePresetNames: string[];
  complete: boolean;
  result?: QueryRuleResult;
  onChange(patch: Partial<QueryRule>): void;
  onRemove(): void;
}) {
  const [expanded, setExpanded] = useState(false);
  const columns = query.columns ?? [];
  const groupByColumns = query.groupByColumns ?? [];
  const presetNames = [...availablePresetNames].sort();
  const expression = queryPresetExpression(query);
  const references = expression ? presetExpressionReferences(expression) : [];
  const missingPreset = references.find(
    (name) => !Object.hasOwn(presets, name),
  );
  const outOfScopePreset = references.find(
    (name) =>
      Object.hasOwn(presets, name) && !availablePresetNames.includes(name),
  );
  const selection = expression
    ? `preset: ${presetExpressionText(expression)}`
    : query.time?.trim()
      ? `时间范围: ${query.time.trim()}`
      : "尚未设置查询范围";
  const annual =
    result?.annualTotals
      .map((item) => `${formatNumber(item.amount)} ${item.currency}`)
      .join("\n") || "暂无可估算金额";
  const annualNote =
    result && result.unannualizedGroups > 0
      ? `${annual}\n（另 ${result.unannualizedGroups} 组无法年化）`
      : annual;
  const resultGroupCount =
    result?.table?.rows.length ?? result?.groups.length ?? 0;
  const tableGroupLabel = groupByColumns.length
    ? groupByColumns
        .map((id) => columns.find((column) => column.id === id)?.label || id)
        .join(" + ")
    : "全量汇总";

  function updateColumns(nextColumns: QueryColumn[]) {
    const validIds = new Set(nextColumns.map((column) => column.id));
    onChange({
      columns: nextColumns,
      groupByColumns: groupByColumns.filter((id) => validIds.has(id)),
    });
  }

  function updateColumn(id: string, patch: Partial<QueryColumn>) {
    updateColumns(
      columns.map((column) =>
        column.id === id ? { ...column, ...patch } : column,
      ),
    );
  }

  function addColumn() {
    updateColumns([
      ...columns,
      {
        id: nextColumnId(columns),
        label: `元数据 ${columns.length + 1}`,
        source: "meta",
        metaKey: "",
      },
    ]);
  }

  function removeColumn(id: string) {
    updateColumns(columns.filter((column) => column.id !== id));
  }

  function moveColumn(id: string, offset: number) {
    const index = columns.findIndex((column) => column.id === id);
    const target = Math.max(0, Math.min(columns.length - 1, index + offset));
    if (index < 0 || target === index) return;
    const next = [...columns];
    const [column] = next.splice(index, 1);
    next.splice(target, 0, column);
    updateColumns(next);
  }

  function toggleGroupColumn(id: string) {
    onChange({
      groupByColumns: groupByColumns.includes(id)
        ? groupByColumns.filter((columnId) => columnId !== id)
        : [...groupByColumns, id],
    });
  }

  return (
    <article
      className={`fmp-rule fmp-query-rule${query.enabled ? "" : " is-disabled"}${expanded ? " is-expanded" : ""}`}
    >
      <div
        className="fmp-rule-head is-clickable"
        onClick={(event) => {
          if (
            (event.target as HTMLElement).closest(
              "button, input, label, select, textarea, a",
            )
          )
            return;
          setExpanded((current) => !current);
        }}
      >
        <div className="fmp-rule-index fmp-query-index">Q{index + 1}</div>
        <div className="fmp-rule-title">
          <RuleNameEditor
            name={query.name}
            placeholder="未命名查询"
            ariaLabel={`查询 ${index + 1} 名称`}
            disabled={disabled}
            onChange={(name) => onChange({ name })}
          />
          <small
            className="fmp-query-rule-summary"
            title={`${selection} · 分组：${tableGroupLabel} · ${
              query.period === "none" ? "不计算周期" : annualNote
            }`}
          >
            {selection} · 分组：{tableGroupLabel} ·{" "}
            {query.period === "none" ? "不计算周期" : annualNote}
          </small>
        </div>
        <div className="fmp-rule-head-actions">
          <span
            className={`fmp-status ${
              !query.enabled
                ? "is-off"
                : !complete
                  ? "is-warn"
                  : result?.matched
                    ? "is-hit"
                    : "is-zero"
            }`}
          >
            {!query.enabled
              ? "已暂停"
              : !complete
                ? "待完成"
                : result?.matched
                  ? `${resultGroupCount} 组 · ${result.matched} 笔`
                  : "暂无命中"}
          </span>
          <EnableToggle
            checked={query.enabled}
            disabled={disabled}
            ariaLabel="查询规则"
            onChange={(enabled) => onChange({ enabled })}
          />
          <button
            type="button"
            className="fmp-btn fmp-btn-danger"
            disabled={disabled}
            onClick={onRemove}
          >
            删除
          </button>
        </div>
      </div>
      {expanded ? (
        <div className="fmp-rule-body">
          <div className="fmp-rule-section-head">
            <span>
              <b>01</b> 查询范围
            </span>
            <small>复用 Preset 匹配标签、元数据、账户、商户或摘要</small>
          </div>
          <div className="fmp-form-grid">
            <PresetExpressionEditor
              value={expression}
              presetNames={presetNames}
              scopeLabel="Query Preset"
              className="is-six"
              disabled={disabled}
              onChange={(presetExpr) => {
                const firstPreset = presetExpr
                  ? presetExpressionReferences(presetExpr)[0]
                  : undefined;
                onChange({
                  preset: undefined,
                  presetExpr,
                  ...(firstPreset &&
                  /^(?:周期查询|分组查询) \d+$/u.test(query.name ?? "")
                    ? { name: `${firstPreset} 查询` }
                    : {}),
                });
              }}
            />
            <div className="fmp-field is-six">
              <label className="fmp-label">
                时间范围
                {expression ? "" : "（只按时间查询时必填）"}
              </label>
              <TimeRangeField
                value={query.time}
                disabled={disabled}
                onChange={(time) => onChange({ time })}
              />
              {result ? (
                <div className="fmp-hint">
                  当前命中 {result.matched} 笔交易，生成 {resultGroupCount}{" "}
                  个分组结果
                  {query.period === "none"
                    ? "。"
                    : `，预计年度金额：${annualNote}。`}
                </div>
              ) : null}
            </div>
            {missingPreset ? (
              <div className="fmp-message is-warning" role="status">
                引用的 preset {missingPreset} 已不存在，请重新选择。
              </div>
            ) : outOfScopePreset ? (
              <div className="fmp-message is-warning" role="status">
                引用的 preset {outOfScopePreset} 属于 Mapping
                Presets；请将它移到 Query Presets 或重新选择。
              </div>
            ) : null}
          </div>

          <div className="fmp-rule-section-head">
            <span>
              <b>02</b> 表头与分组
            </span>
            <small>每个元数据键可映射成表头；勾选的分组键决定每一行</small>
          </div>
          <div className="fmp-query-column-list">
            <div className="fmp-query-column-head" aria-hidden="true">
              <span>顺序</span>
              <span>表头名称</span>
              <span>字段来源</span>
              <span>元数据键</span>
              <span>分组</span>
              <span>操作</span>
            </div>
            {columns.map((column, columnIndex) => (
              <div className="fmp-query-column" key={column.id}>
                <span className="fmp-query-column-index">
                  {String(columnIndex + 1).padStart(2, "0")}
                </span>
                <label className="fmp-query-column-field">
                  <span>表头名称</span>
                  <input
                    className="fmp-input"
                    aria-label={`表头 ${columnIndex + 1} 名称`}
                    value={column.label}
                    disabled={disabled}
                    onChange={(event) =>
                      updateColumn(column.id, {
                        label: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="fmp-query-column-field">
                  <span>字段来源</span>
                  <select
                    className="fmp-input fmp-select-native"
                    aria-label={`表头 ${columnIndex + 1} 字段来源`}
                    value={column.source}
                    disabled={disabled}
                    onChange={(event) => {
                      const source = event.target.value as QueryColumnSource;
                      updateColumn(column.id, {
                        source,
                        ...(source === "meta"
                          ? { metaKey: column.metaKey ?? "" }
                          : { metaKey: undefined }),
                      });
                    }}
                  >
                    {COLUMN_SOURCE_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fmp-query-column-field">
                  <span>元数据键</span>
                  <input
                    className="fmp-input"
                    aria-label={`表头 ${columnIndex + 1} 元数据键`}
                    value={column.metaKey ?? ""}
                    disabled={disabled || column.source !== "meta"}
                    placeholder="例如 location"
                    onChange={(event) =>
                      updateColumn(column.id, {
                        metaKey: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="fmp-query-column-group">
                  <input
                    type="checkbox"
                    checked={groupByColumns.includes(column.id)}
                    disabled={disabled}
                    onChange={() => toggleGroupColumn(column.id)}
                  />
                  <span>作为分组键</span>
                </label>
                <div className="fmp-query-column-actions">
                  <button
                    type="button"
                    className="fmp-icon-btn"
                    aria-label={`上移表头 ${column.label || columnIndex + 1}`}
                    disabled={disabled || columnIndex === 0}
                    onClick={() => moveColumn(column.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="fmp-icon-btn"
                    aria-label={`下移表头 ${column.label || columnIndex + 1}`}
                    disabled={disabled || columnIndex === columns.length - 1}
                    onClick={() => moveColumn(column.id, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="fmp-remove"
                    disabled={disabled}
                    onClick={() => removeColumn(column.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="fmp-add fmp-query-column-add"
              disabled={disabled || columns.length >= 12}
              onClick={addColumn}
            >
              + 添加表头
            </button>
          </div>
          <div className="fmp-query-group-summary">
            <strong>当前分组：{tableGroupLabel}</strong>
            <span>
              每行会汇总交易数量、日期范围和花费；展开行可查看逐笔交易。
              不选择分组键时只生成一行全量汇总。
            </span>
          </div>

          <div className="fmp-rule-section-head">
            <span>
              <b>03</b> 周期估算
            </span>
            <small>对每个分组分别推断间隔并计算年度金额，不需要另建查询</small>
          </div>
          <div className="fmp-form-grid">
            <div className="fmp-field is-six">
              <label className="fmp-label">周期计算</label>
              <select
                className="fmp-input fmp-select-native"
                value={query.period}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    period: event.target.value as QueryPeriod,
                  })
                }
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="fmp-hint">
                自动模式优先读取周期元数据，没有时按分组内交易日期的中位间隔推断。
              </div>
            </div>
            <div className="fmp-field is-six">
              <label className="fmp-label">周期元数据键</label>
              <input
                className="fmp-input"
                value={query.periodMetaKey ?? ""}
                disabled={disabled || query.period !== "auto"}
                placeholder="例如 recurring-period"
                onChange={(event) =>
                  onChange({
                    periodMetaKey: event.target.value || undefined,
                  })
                }
              />
              <div className="fmp-hint">
                {query.period === "none"
                  ? "当前只做分组汇总，不显示周期和年度金额。"
                  : query.period === "auto"
                    ? "可填写 weekly、monthly、quarterly 等值；留空则只根据日期推断。"
                    : "固定周期已覆盖自动推断。"}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
  }).format(value);
}
