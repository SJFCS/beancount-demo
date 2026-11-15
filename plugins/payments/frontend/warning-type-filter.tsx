import React, { useId } from "react";
import { useSearchMenu } from "@plugins/shared/frontend/use-search-menu";
import {
  hasReviewWarnings,
  matchesReviewWarning,
  reviewWarnings,
  type ReviewWarningType,
} from "../review";
import { matchesReview } from "./transaction-filters";
import type { PaymentsController } from "./use-payments";
import { matchesAiResult } from "../classification";

function ReviewTypeMenu({
  label,
  total,
  active,
  allSelected,
  onAll,
  summary,
  children,
}: {
  label: string;
  total: number;
  active: boolean;
  allSelected: boolean;
  onAll(): void;
  summary: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const menu = useSearchMenu({
    minWidth: 320,
    maxWidth: 360,
    maxHeight: 440,
    triggerSelector: ".pm-warning-filter-trigger",
    menuSelector: ".pm-warning-filter-menu",
  });
  function close() {
    menu.setOpen(false);
    menu.root.current
      ?.querySelector<HTMLButtonElement>(".pm-warning-filter-trigger")
      ?.focus({ preventScroll: true });
  }
  return (
    <div className="pm-warning-filter" ref={menu.root}>
      <button
        className="pm-stat pm-warning-filter-trigger"
        type="button"
        aria-pressed={active}
        aria-expanded={menu.open}
        aria-haspopup="dialog"
        aria-controls={menu.open ? id : undefined}
        title={`展开${label}类型，按类型筛选`}
        onClick={() => menu.setOpen((current) => !current)}
      >
        <strong>{total}</strong>{" "}
        <span>
          {label}
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </button>
      {menu.open && (
        <div
          id={id}
          className="pm-warning-filter-menu"
          role="dialog"
          aria-label={`${label}类型`}
          popover="manual"
          style={menu.position}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            close();
          }}
        >
          <header>
            <strong>{label}类型</strong>
            <span>
              {label === "核对提示"
                ? "可多选 · 任一类型匹配"
                : label === "AI 分类"
                  ? "按 AI 结果筛选"
                  : "按匹配结果筛选"}
            </span>
          </header>
          <div className="pm-warning-filter-options">
            <button
              type="button"
              data-menu-initial-focus
              aria-pressed={allSelected}
              onClick={onAll}
            >
              <span>
                {label === "AI 分类"
                  ? "全部 AI 结果"
                  : `全部${label === "核对提示" ? "提示" : "退款"}`}
              </span>{" "}
              <small>{total}</small>
            </button>
            {children}
          </div>
          <footer>
            <span>{summary}</span>
            <button type="button" onClick={close}>
              完成
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

export function WarningTypeFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const active = c.filter === "warnings";
  const values = active ? c.warningTypes : [];
  return (
    <ReviewTypeMenu
      label="核对提示"
      total={c.reviewRows.filter(hasReviewWarnings).length}
      active={active}
      allSelected={active && !values.length}
      onAll={() => c.filterWarnings([])}
      summary={
        values.length
          ? `已选 ${values.length} 类 · 任一匹配`
          : "可多选 · 各类数量可能重叠"
      }
    >
      {(
        Object.entries(reviewWarnings) as Array<
          [ReviewWarningType, (typeof reviewWarnings)[ReviewWarningType]]
        >
      ).map(([type, definition]) => {
        const count = c.reviewRows.filter((row) =>
          matchesReviewWarning(row, type),
        ).length;
        const selected = values.includes(type);
        const disabled = !count && !selected;
        return (
          <label
            key={type}
            title={definition.message}
            data-disabled={disabled}
            data-selected={selected}
          >
            <input
              type="checkbox"
              aria-label={`筛选核对提示类型：${definition.label}`}
              disabled={disabled}
              checked={selected}
              onChange={(event) =>
                c.filterWarnings(
                  event.target.checked
                    ? [...values, type]
                    : values.filter((value) => value !== type),
                )
              }
            />
            <span>{definition.label}</span> <small>{count}</small>
          </label>
        );
      })}
    </ReviewTypeMenu>
  );
}

export function AiTypeFilter({
  controller,
}: {
  controller: PaymentsController;
}) {
  const choose = (value: string) => controller.setFilter(value);
  return (
    <ReviewTypeMenu
      label="AI 分类"
      total={
        controller.reviewRows.filter((row) =>
          matchesAiResult(row, "aiResults", controller.aiFailureIds),
        ).length
      }
      active={[
        "aiResults",
        "aiClassified",
        "aiUnclassified",
        "aiUnprocessed",
      ].includes(controller.filter)}
      allSelected={controller.filter === "aiResults"}
      onAll={() => choose("aiResults")}
      summary="按 AI 结果筛选 · 不改变勾选状态"
    >
      {(
        [
          ["aiClassified", "AI 已设置账户"],
          ["aiUnclassified", "无法分类 / 失败（含其他）"],
          ["aiUnprocessed", "尚未 AI 分类"],
        ] as const
      ).map(([value, label]) => {
        const count = controller.reviewRows.filter((row) =>
          matchesAiResult(row, value, controller.aiFailureIds),
        ).length;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={controller.filter === value}
            disabled={!count}
            onClick={() => choose(value)}
          >
            <span>{label}</span>
            <small>{count}</small>
          </button>
        );
      })}
    </ReviewTypeMenu>
  );
}

export function RefundTypeFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const active = ["allRefunds", "fullRefunds", "refunds"].includes(c.filter);
  const choose = (value: string) => {
    c.setFilter(value);
    c.setPage(0);
  };
  return (
    <ReviewTypeMenu
      label="退款匹配"
      total={
        c.reviewRows.filter((row) =>
          matchesReview(row, "allRefunds", c.refundKinds),
        ).length
      }
      active={active}
      allSelected={c.filter === "allRefunds"}
      onAll={() => choose("allRefunds")}
      summary="按匹配结果筛选 · 保留关联交易"
    >
      {(
        [
          ["fullRefunds", "全额退款匹配"],
          ["refunds", "退款不完全匹配"],
        ] as const
      ).map(([value, label]) => {
        const count = c.reviewRows.filter((row) =>
          matchesReview(row, value, c.refundKinds),
        ).length;
        return (
          <button
            type="button"
            key={value}
            disabled={!count}
            aria-pressed={c.filter === value}
            onClick={() => choose(value)}
          >
            <span>{label}</span> <small>{count}</small>
          </button>
        );
      })}
    </ReviewTypeMenu>
  );
}
