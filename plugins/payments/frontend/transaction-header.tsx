import React, { useEffect, useId, useRef, useState } from "react";
import type { FilterKey } from "./transaction-filters";
import type { PaymentsController } from "./use-payments";
import { ColumnFilter, FilterChoices } from "./column-filter";
import { TransactionMappingHeading } from "./transaction-layout";
import { TransactionSourceFilter } from "./transaction-source-filter";
import { SearchableMultiSelect } from "./searchable-select";
import {
  selectionOptions,
  reviewOptions,
  bulkRuleLabel,
  bulkRuleOptions,
  matchesBulkRule,
} from "./transaction-filters";
import type {
  BulkRuleCondition,
  BulkRuleMode,
  BulkSelectionChange,
} from "./transaction-filters";

const bulkRuleSelectOptions = (mode: BulkRuleMode) =>
  bulkRuleOptions
    .filter(
      ([condition]) =>
        condition !== (mode === "include" ? "selected" : "unselected"),
    )
    .map(([value, label]) => ({ value, label }));

type PendingBulkRule = {
  id: number;
  mode: BulkRuleMode;
  condition: BulkRuleCondition;
};

export function BulkSelectionActions({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const id = useId();
  const nextRuleId = useRef(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [ruleMode, setRuleMode] = useState<BulkRuleMode>("include");
  const [rules, setRules] = useState<PendingBulkRule[]>([]);
  const [status, setStatus] = useState("");
  const actionLabel = ruleMode === "include" ? "选中" : "取消选中";
  const editableRows = c.filtered.filter(
    (row) => !row.locked && !row.committedAt,
  );
  const summaries = rules.map((rule) => ({
    ...rule,
    label: bulkRuleLabel(rule.condition),
    rows: editableRows.filter((row) =>
      matchesBulkRule(row, rule.condition, c.refundKinds),
    ),
  }));
  const includedIds = new Set(
    summaries
      .filter((rule) => rule.mode === "include")
      .flatMap((rule) => rule.rows.map((row) => row.id)),
  );
  const excludedIds = new Set(
    summaries
      .filter((rule) => rule.mode === "exclude")
      .flatMap((rule) => rule.rows.map((row) => row.id)),
  );
  const targetSelection = new Map<string, boolean>();
  for (const row of editableRows) {
    if (excludedIds.has(row.id)) targetSelection.set(row.id, false);
    else if (includedIds.has(row.id)) targetSelection.set(row.id, true);
  }
  const includeCount = [...targetSelection.values()].filter(Boolean).length;
  const excludeCount = targetSelection.size - includeCount;
  useEffect(() => {
    if (!open) return;
    const popover = popoverRef.current;
    if (!popover) return;
    const rect = popover.getBoundingClientRect();
    const overflow = rect.bottom - (window.innerHeight - 12);
    if (overflow > 0)
      setPosition((current) => ({
        ...current,
        top: Math.max(12, current.top - overflow),
      }));
  }, [open, rules.length]);
  const selectedConditions = rules
    .filter((rule) => rule.mode === ruleMode)
    .map((rule) => rule.condition);
  const setSelectedConditions = (values: string[]) => {
    setRules((current) => {
      const existing = new Map(
        current
          .filter((rule) => rule.mode === ruleMode)
          .map((rule) => [rule.condition, rule.id]),
      );
      return [
        ...current.filter((rule) => rule.mode !== ruleMode),
        ...values.map((condition) => ({
          id:
            existing.get(condition as BulkRuleCondition) ??
            nextRuleId.current++,
          mode: ruleMode,
          condition: condition as BulkRuleCondition,
        })),
      ];
    });
    setStatus("");
  };
  const applyRules = () => {
    const includeChanges = new Set<string>();
    const excludeChanges = new Set<string>();
    const duplicateChanges = new Set<string>();
    const selectionChanges: BulkSelectionChange[] = [];
    for (const row of editableRows) {
      const selected = targetSelection.get(row.id);
      if (selected === undefined || selected === row.selected) continue;
      (selected ? includeChanges : excludeChanges).add(row.id);
      if (row.duplicates.length) duplicateChanges.add(row.id);
      selectionChanges.push({
        id: row.id,
        beforeSelected: row.selected,
        afterSelected: selected,
        beforeNotImported: !!row.notImported,
        afterNotImported: selected ? false : !!row.notImported,
        beforeDuplicateReviewed: row.duplicateReviewed,
        afterDuplicateReviewed: row.duplicates.length
          ? false
          : row.duplicateReviewed,
      });
    }
    if (includeChanges.size) c.editMany(includeChanges, { selected: true });
    if (excludeChanges.size) c.editMany(excludeChanges, { selected: false });
    if (duplicateChanges.size)
      c.editMany(duplicateChanges, { duplicateReviewed: false });
    c.recordBulkSelectionUndo(
      selectionChanges.length
        ? {
            changes: selectionChanges,
            label: summaries
              .map(
                ({ mode, condition }) =>
                  `${mode === "include" ? "选中" : "取消选中"} ${bulkRuleLabel(condition)}`,
              )
              .join("；"),
          }
        : null,
    );
    setStatus(
      targetSelection.size
        ? `已应用 ${rules.length} 条规则，选中 ${includeCount} 笔、取消选中 ${excludeCount} 笔。`
        : "规则已应用，没有匹配的未锁定、未入账交易。",
    );
    setRules([]);
  };
  return (
    <>
      <button
        className={`pm-bulk-trigger${open ? " pm-bulk-trigger-open" : ""}`}
        aria-label="批量修改当前显示交易的选中状态"
        aria-expanded={open}
        title="批量修改当前显示交易的选中状态"
        disabled={!c.editable}
        popoverTarget={id}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const width = Math.min(360, window.innerWidth - 24);
          setPosition({
            top: Math.max(
              12,
              Math.min(rect.bottom + 8, window.innerHeight - 230),
            ),
            left: Math.max(
              12,
              Math.min(rect.right - width, window.innerWidth - width - 12),
            ),
          });
        }}
      >
        批量选中
        <span aria-hidden="true">▾</span>
      </button>
      <div
        ref={popoverRef}
        id={id}
        popover="auto"
        className="pm-filter-popover pm-bulk-popover"
        style={position}
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <div className="pm-filter-title">
          <strong>批量选中</strong>
          <span className="pm-muted">只改选中状态</span>
        </div>
        <p className="pm-muted">
          作用于当前筛选结果中的 {editableRows.length}{" "}
          笔未锁定、未入账交易。不会改变筛选或显示范围。
        </p>
        <div className="pm-bulk-rule-builder">
          <div className="pm-bulk-rule-mode" role="group" aria-label="选中操作">
            <button
              className="pm-bulk-include"
              aria-label="选中操作：选中"
              aria-pressed={ruleMode === "include"}
              onClick={() => {
                setRuleMode("include");
                setStatus("");
              }}
            >
              选中
            </button>
            <button
              className="pm-bulk-exclude"
              aria-label="选中操作：取消选中"
              aria-pressed={ruleMode === "exclude"}
              onClick={() => {
                setRuleMode("exclude");
                setStatus("");
              }}
            >
              取消选中
            </button>
          </div>
        </div>
        <div className="pm-bulk-rule-types">
          <SearchableMultiSelect
            key={ruleMode}
            label={`${actionLabel}条件`}
            searchLabel="搜索交易类型"
            values={selectedConditions}
            options={bulkRuleSelectOptions(ruleMode)}
            placeholder="选择要匹配的交易类型"
            compact
            disabled={!c.editable}
            onChange={setSelectedConditions}
          />
          <p className="pm-muted pm-bulk-rule-hint">
            同组可多选，任一命中即可；冲突时“取消选中”优先。
          </p>
        </div>
        {!!summaries.length && (
          <div
            className="pm-bulk-rules"
            aria-label={`已添加 ${summaries.length} 条选中规则`}
          >
            {summaries.map((rule) => (
              <div key={rule.id} className="pm-bulk-rule" data-mode={rule.mode}>
                <strong>{rule.mode === "include" ? "选中" : "取消选中"}</strong>
                <span>{rule.label}</span>
                <small>{rule.rows.length}</small>
                <button
                  aria-label={`删除选中规则：${rule.mode === "include" ? "选中" : "取消选中"} ${rule.label}`}
                  title="删除此规则"
                  onClick={() =>
                    setRules((current) =>
                      current.filter((item) => item.id !== rule.id),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="pm-bulk-rule-apply">
          <span className="pm-muted" role="status">
            {status ||
              (summaries.length
                ? `将选中 ${includeCount} 笔、取消选中 ${excludeCount} 笔`
                : "选择条件后可统一应用")}
          </span>
          <button
            className="pm-primary"
            aria-label="应用选中规则"
            disabled={!c.editable || !summaries.length}
            onClick={applyRules}
          >
            应用规则
          </button>
        </div>
      </div>
    </>
  );
}

export function TransactionSearch({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  return (
    <label className="pm-table-search">
      <span className="pm-table-search-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        aria-label="搜索交易"
        placeholder="搜索交易对方、商品、单号或金额"
        value={c.search}
        onChange={(event) => c.setSearch(event.target.value)}
      />
    </label>
  );
}

export function TransactionHeader({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const {
    pageRows,
    editable,
    editMany,
    columnFilters: filters,
    updateColumnFilters: update,
  } = c;
  const polarity = (key: FilterKey) => ({
    excluded: filters.excluded.includes(key),
    onExcludeChange: (excluded: boolean) =>
      c.setColumnFilterExcluded(key, excluded),
  });
  return (
    <thead>
      <tr className="pm-header-fields">
        <th scope="col" className="pm-col-state">
          <div className="pm-column-heading">
            <div className="pm-selection-heading">
              <label>
                <input
                  type="checkbox"
                  aria-label={
                    c.pageSize === null
                      ? "选择或取消当前显示交易"
                      : "选择或取消当前页交易"
                  }
                  disabled={
                    !editable ||
                    !pageRows.some((row) => !row.locked && !row.committedAt)
                  }
                  checked={
                    pageRows.some((row) => !row.locked && !row.committedAt) &&
                    pageRows
                      .filter((row) => !row.locked && !row.committedAt)
                      .every((row) => row.selected)
                  }
                  onChange={(event) =>
                    editMany(new Set(pageRows.map((row) => row.id)), {
                      selected: event.target.checked,
                    })
                  }
                />
                <span className="pm-visually-hidden">选中</span>
              </label>
            </div>
            <ColumnFilter
              title="选中状态"
              count={filters.selection.length}
              onClear={() =>
                update({
                  selection: [],
                  excluded: filters.excluded.filter(
                    (key) => key !== "selection",
                  ),
                })
              }
            >
              <FilterChoices
                label="选中状态"
                {...polarity("selection")}
                options={selectionOptions}
                values={filters.selection}
                onChange={(selection) => update({ selection })}
              />
            </ColumnFilter>
          </div>
        </th>
        <th scope="col" className="pm-col-mapping">
          <TransactionMappingHeading
            sourceFilter={<TransactionSourceFilter controller={c} />}
          />
        </th>
        <th scope="col" className="pm-col-review">
          <div className="pm-column-heading">
            <span>提示 / 操作</span>
            <ColumnFilter
              title="审核提示"
              count={filters.review.length}
              onClear={() =>
                update({
                  review: [],
                  excluded: filters.excluded.filter((key) => key !== "review"),
                })
              }
            >
              <FilterChoices
                label="审核提示"
                {...polarity("review")}
                options={reviewOptions}
                values={filters.review}
                onChange={(review) => update({ review })}
              />
            </ColumnFilter>
            <TransactionSearch controller={c} />
          </div>
        </th>
      </tr>
    </thead>
  );
}
