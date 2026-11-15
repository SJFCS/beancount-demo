import { useState, type DragEvent } from "react";
import { EnableToggle } from "./enable-toggle";
import { RuleNameEditor } from "./inline-name-editor";
import { FacetedPicker, MetaRows, type PickerGroup } from "./picker";
import { PresetExpressionEditor } from "./preset-expression-editor";
import { TimeRangeField } from "./time-range-field";
import {
  presetExpressionReferences,
  presetExpressionText,
  rulePresetExpression,
} from "./model";
import type {
  Filter,
  Rule,
  RuleDropPosition,
  RuleResult,
  SelectionCatalog,
} from "./types";

function dropPositionAt(event: DragEvent<HTMLElement>): RuleDropPosition {
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
}

function ActionListField({
  title,
  ariaLabel,
  value,
  disabled,
  placeholder,
  hint,
  prefix = "",
  removed = false,
  pickerLabel,
  pickerTitle,
  groups,
  showPicker = true,
  bulkSelect = false,
  onChange,
}: {
  title: string;
  ariaLabel: string;
  value: string[];
  disabled: boolean;
  placeholder: string;
  hint: string;
  prefix?: string;
  removed?: boolean;
  pickerLabel: string;
  pickerTitle: string;
  groups: PickerGroup[];
  showPicker?: boolean;
  bulkSelect?: boolean;
  onChange(value: string[]): void;
}) {
  const [input, setInput] = useState("");
  const normalize = (item: string) => {
    const trimmed = item.trim();
    return prefix === "#" ? trimmed.replace(/^#+/u, "") : trimmed;
  };
  const commit = (raw: string) => {
    const incoming = raw
      .split(/[\s,，]+/u)
      .map(normalize)
      .filter(Boolean);
    if (incoming.length === 0) return;
    onChange([...new Set([...value, ...incoming])]);
    setInput("");
  };
  const removeValue = (item: string) => {
    onChange(value.filter((current) => current !== item));
  };

  return (
    <div className="fmp-field is-six">
      <div className="fmp-matcher-toolbar">
        <div className="fmp-matcher-type">
          <span className="fmp-matcher-name">{title}</span>
        </div>
        {showPicker ? (
          <div className="fmp-matcher-actions">
            <FacetedPicker
              label={pickerLabel}
              title={pickerTitle}
              groups={groups}
              selected={new Set(value)}
              disabled={disabled}
              onToggle={(item, checked) => {
                const next = new Set(value);
                if (checked) next.add(item);
                else next.delete(item);
                onChange([...next]);
              }}
              onSelectMany={
                bulkSelect
                  ? (items, checked) => {
                      const next = new Set(value);
                      for (const item of items) {
                        if (checked) next.add(item);
                        else next.delete(item);
                      }
                      onChange([...next]);
                    }
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>
      <div className="fmp-picker-line">
        <input
          className="fmp-input"
          aria-label={ariaLabel}
          value={input}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " " ||
              event.key === "," ||
              event.key === "，"
            ) {
              event.preventDefault();
              commit(input);
            } else if (
              event.key === "Backspace" &&
              input === "" &&
              value.length > 0
            ) {
              removeValue(value.at(-1) as string);
            }
          }}
          onBlur={() => commit(input)}
        />
      </div>
      {value.length ? (
        <div className="fmp-tags">
          {value.map((item) => (
            <span
              className={`fmp-tag${removed ? " is-removed" : ""}`}
              key={item}
            >
              <span className="fmp-tag-text" title={`${prefix}${item}`}>
                {prefix}
                {item}
              </span>
              <button
                type="button"
                aria-label={`取消 ${title} ${item}`}
                disabled={disabled}
                onClick={() => removeValue(item)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="fmp-hint">{hint}</div>
    </div>
  );
}

export function RuleEditor({
  rule,
  index,
  disabled,
  presets,
  availablePresetNames,
  catalog,
  complete,
  result,
  dragging,
  dragActive,
  dragEnabled,
  dragHint,
  dropPosition,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMove,
}: {
  rule: Rule;
  index: number;
  disabled: boolean;
  presets: Record<string, Filter>;
  availablePresetNames: string[];
  catalog: SelectionCatalog;
  complete: boolean;
  result?: RuleResult;
  dragging: boolean;
  dragActive: boolean;
  dragEnabled: boolean;
  dragHint: string;
  dropPosition: RuleDropPosition | null;
  onChange(patch: Partial<Rule>): void;
  onRemove(): void;
  onDragStart(): void;
  onDragOver(position: RuleDropPosition): void;
  onDrop(position: RuleDropPosition): void;
  onDragEnd(): void;
  onMove(offset: number): void;
}) {
  const [expanded, setExpanded] = useState(false);
  const presetNames = [...availablePresetNames].sort();
  const presetExpression = rulePresetExpression(rule);
  const presetReferences = presetExpression
    ? presetExpressionReferences(presetExpression)
    : [];
  const missingPreset = presetReferences.find(
    (name) => !Object.hasOwn(presets, name),
  );
  const outOfScopePreset = presetReferences.find(
    (name) =>
      Object.hasOwn(presets, name) && !availablePresetNames.includes(name),
  );
  const tagGroups: PickerGroup[] = [
    {
      id: "tags",
      label: "已有标签",
      icon: "tag",
      options: catalog.tags.map((tag) => ({
        id: tag.value,
        label: `#${tag.value}`,
        count: tag.count,
      })),
    },
  ];
  const metaKeyGroups: PickerGroup[] = [
    {
      id: "metadata",
      label: "已有元数据",
      icon: "meta",
      options: catalog.metadata.map((item) => ({
        id: item.key,
        label: item.key,
        count: item.count,
      })),
    },
  ];
  const actionSummary = [
    rule.setPayee?.trim() ? `收款人 ${rule.setPayee.trim()}` : "",
    rule.setNarration?.trim() ? `摘要 ${rule.setNarration.trim()}` : "",
    rule.addTags.length
      ? `添加标签 ${rule.addTags.map((tag) => `#${tag}`).join(" ")}`
      : "",
    rule.removeTags.length
      ? `移除标签 ${rule.removeTags.map((tag) => `#${tag}`).join(" ")}`
      : "",
    Object.keys(rule.addMeta).length
      ? `写入元数据 ${Object.keys(rule.addMeta).join("、")}`
      : "",
    rule.removeMeta.length ? `移除元数据 ${rule.removeMeta.join("、")}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const selectorText = presetExpression
    ? `preset: ${presetExpressionText(presetExpression)}`
    : rule.time?.trim()
      ? `时间范围: ${rule.time.trim()}`
      : "尚未选择匹配范围";
  const summaryParts = [
    selectorText,
    ...(presetExpression ? [rule.time?.trim() || "全部时间"] : []),
    actionSummary || "尚未设置动作",
  ];
  return (
    <article
      className={`fmp-rule${rule.enabled ? "" : " is-disabled"}${expanded ? " is-expanded" : ""}${dragging ? " is-dragging" : ""}${dropPosition ? ` is-drop-${dropPosition}` : ""}`}
      onDragOver={(event) => {
        if (!dragEnabled || !dragActive || dragging) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const position = dropPositionAt(event);
        if (position !== dropPosition) onDragOver(position);
      }}
      onDrop={(event) => {
        if (!dragEnabled || !dragActive || dragging) return;
        event.preventDefault();
        onDrop(dropPositionAt(event));
      }}
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
        <button
          type="button"
          className="fmp-rule-drag"
          draggable={dragEnabled}
          disabled={!dragEnabled}
          aria-label={`拖动排序：${rule.name?.trim() || `规则 ${index + 1}`}`}
          aria-keyshortcuts="ArrowUp ArrowDown"
          title={dragHint}
          onDragStart={(event) => {
            if (!dragEnabled) {
              event.preventDefault();
              return;
            }
            event.stopPropagation();
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", rule.id);
            const card = event.currentTarget.closest("article");
            if (card instanceof HTMLElement)
              event.dataTransfer.setDragImage(card, 22, 18);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          onKeyDown={(event) => {
            if (!dragEnabled) return;
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              event.stopPropagation();
              onMove(event.key === "ArrowUp" ? -1 : 1);
            }
          }}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="5" cy="4" r="1.2" />
            <circle cx="11" cy="4" r="1.2" />
            <circle cx="5" cy="8" r="1.2" />
            <circle cx="11" cy="8" r="1.2" />
            <circle cx="5" cy="12" r="1.2" />
            <circle cx="11" cy="12" r="1.2" />
          </svg>
        </button>
        <div className="fmp-rule-index">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="fmp-rule-title">
          <RuleNameEditor
            name={rule.name}
            placeholder="未命名规则"
            ariaLabel={`规则 ${index + 1} 名称`}
            disabled={disabled}
            onChange={(name) => onChange({ name })}
          />
          <small title={summaryParts.join(" · ")}>
            {summaryParts.join(" · ")}
          </small>
        </div>
        <div className="fmp-rule-head-actions">
          <span
            className={`fmp-status ${
              !rule.enabled
                ? "is-off"
                : !complete
                  ? "is-warn"
                  : result?.matched
                    ? "is-hit"
                    : "is-zero"
            }`}
          >
            {!rule.enabled
              ? "已暂停"
              : !complete
                ? "待完成"
                : result?.matched
                  ? `${result.matched} 笔命中`
                  : "暂无命中"}
          </span>
          <EnableToggle
            checked={rule.enabled}
            disabled={disabled}
            ariaLabel="映射规则"
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
              <b>01</b> 匹配与范围
            </span>
            <small>引用 Preset，多个默认任一命中；留空后只按时间匹配</small>
          </div>
          <div className="fmp-form-grid">
            <PresetExpressionEditor
              value={presetExpression}
              presetNames={presetNames}
              scopeLabel="Mapping Preset"
              className="is-six"
              disabled={disabled}
              onChange={(presetExpr) => {
                const firstPreset = presetExpr
                  ? presetExpressionReferences(presetExpr)[0]
                  : undefined;
                onChange({
                  preset: undefined,
                  presetExpr,
                  ...(firstPreset && /^新映射规则 \d+$/u.test(rule.name ?? "")
                    ? { name: `${firstPreset} 映射` }
                    : {}),
                });
              }}
            />
            <div className="fmp-field is-six">
              <label className="fmp-label">
                时间范围
                {presetExpression ? "" : "（只按时间匹配时必填）"}
              </label>
              <TimeRangeField
                value={rule.time}
                disabled={disabled}
                onChange={(time) => onChange({ time })}
              />
              {result ? (
                <div className="fmp-hint">
                  {presetExpression
                    ? `应用时间范围后命中 ${result.matched} 笔。`
                    : `当前时间范围内共有 ${result.matched} 笔交易，将全部应用本规则。`}
                </div>
              ) : null}
            </div>
            {missingPreset ? (
              <div className="fmp-message is-warning" role="status">
                引用的 preset {missingPreset} 已不存在，请重新选择。
              </div>
            ) : outOfScopePreset ? (
              <div className="fmp-message is-warning" role="status">
                引用的 preset {outOfScopePreset} 属于 Query Presets；请将它移到
                Mapping Presets 或重新选择。
              </div>
            ) : null}
          </div>
          <div className="fmp-rule-section-head">
            <span>
              <b>02</b> 修改内容
            </span>
            <small>添加或移除标签、元数据，并可替换收款人、摘要</small>
          </div>
          <div className="fmp-form-grid">
            <div className="fmp-field is-six">
              <label className="fmp-label">修改收款人</label>
              <input
                className="fmp-input"
                aria-label="修改收款人"
                value={rule.setPayee ?? ""}
                disabled={disabled}
                placeholder="输入收款人名称"
                onChange={(event) =>
                  onChange({ setPayee: event.target.value || undefined })
                }
              />
              <div className="fmp-hint">
                仅修改运行时
                payee。原交易只有摘要时会新增收款人，摘要保持不变；不回写源文件。
              </div>
            </div>
            <div className="fmp-field is-six">
              <label className="fmp-label">修改摘要</label>
              <input
                className="fmp-input"
                aria-label="修改摘要"
                value={rule.setNarration ?? ""}
                disabled={disabled}
                placeholder="输入摘要内容"
                onChange={(event) =>
                  onChange({ setNarration: event.target.value || undefined })
                }
              />
              <div className="fmp-hint">
                仅修改运行时 narration；收款人和其他字段保持不变，不回写源文件。
              </div>
            </div>
            <ActionListField
              title="追加标签"
              ariaLabel="追加标签"
              value={rule.addTags}
              disabled={disabled}
              placeholder="输入标签，按 Enter 添加"
              hint="可用逗号、中文逗号、空格或 Enter 分隔多个标签，也可直接粘贴 travel, trip。"
              prefix="#"
              pickerLabel="标签"
              pickerTitle="从账本选择要追加的标签"
              groups={tagGroups}
              showPicker={false}
              onChange={(addTags) => onChange({ addTags })}
            />
            <ActionListField
              title="移除标签"
              ariaLabel="移除标签"
              value={rule.removeTags}
              disabled={disabled}
              placeholder="输入要移除的标签"
              hint="只移除交易上已存在的标签；不存在的标签会被忽略。"
              prefix="#"
              removed
              pickerLabel="标签"
              pickerTitle="从账本选择要移除的标签"
              groups={tagGroups}
              bulkSelect
              onChange={(removeTags) => onChange({ removeTags })}
            />
            <div className="fmp-field is-six">
              <MetaRows
                title="修改元数据"
                value={rule.addMeta}
                label="添加"
                disabled={disabled}
                keyPlaceholder="输入元数据键"
                valuePlaceholder="输入元数据值"
                onChange={(addMeta) => onChange({ addMeta })}
              />
              <div className="fmp-hint">
                周期可留空，页面会按命中日期自动估算。
              </div>
            </div>
            <ActionListField
              title="移除元数据"
              ariaLabel="移除元数据"
              value={rule.removeMeta}
              disabled={disabled}
              placeholder="输入元数据键，例如 old-tag"
              hint="只删除交易元数据中的键和值；filename、lineno 等保留键不能移除。"
              pickerLabel="元数据"
              pickerTitle="从账本选择要移除的元数据键"
              groups={metaKeyGroups}
              bulkSelect
              onChange={(removeMeta) => onChange({ removeMeta })}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
