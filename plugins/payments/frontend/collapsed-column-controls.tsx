import React, { useMemo } from "react";
import { paymentMethodField } from "../metadata";
import { AmountFilter } from "./amount-filter";
import { ColumnFilter, FilterChoices, FilterGroup } from "./column-filter";
import { DateFilter } from "./date-filter";
import { paymentMethodLabel } from "./display";
import { SearchableMultiSelect } from "./searchable-select";
import {
  cycleCollapsedSort,
  hasAmountFilter,
  reviewOptions,
  selectionOptions,
  statementValueOptions,
  type CollapsedSortKey,
} from "./transaction-filters";
import type { PaymentsController } from "./use-payments";

const sortLabels: Record<Exclude<CollapsedSortKey, "bill">, string> = {
  counterparty: "交易对方",
  counterpartyAccount: "分类账户",
  payment: paymentMethodField,
  paymentAccount: "资金账户",
};

export function CollapsedSelectionFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const filters = c.columnFilters;
  return (
    <ColumnFilter
      title="选中状态"
      count={filters.selection.length}
      onClear={() =>
        c.updateColumnFilters({
          selection: [],
          excluded: filters.excluded.filter((key) => key !== "selection"),
        })
      }
    >
      <FilterChoices
        label="选中状态"
        options={selectionOptions}
        values={filters.selection}
        onChange={(selection) => c.updateColumnFilters({ selection })}
        excluded={filters.excluded.includes("selection")}
        onExcludeChange={(excluded) =>
          c.setColumnFilterExcluded("selection", excluded)
        }
      />
    </ColumnFilter>
  );
}

export function CollapsedReviewFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const filters = c.columnFilters;
  return (
    <ColumnFilter
      title="审核提示"
      count={filters.review.length}
      onClear={() =>
        c.updateColumnFilters({
          review: [],
          excluded: filters.excluded.filter((key) => key !== "review"),
        })
      }
    >
      <FilterChoices
        label="审核提示"
        options={reviewOptions}
        values={filters.review}
        onChange={(review) => c.updateColumnFilters({ review })}
        excluded={filters.excluded.includes("review")}
        onExcludeChange={(excluded) =>
          c.setColumnFilterExcluded("review", excluded)
        }
      />
    </ColumnFilter>
  );
}

export function CollapsedSortButton({
  controller: c,
  field,
}: {
  controller: PaymentsController;
  field: Exclude<CollapsedSortKey, "bill">;
}) {
  const label = sortLabels[field];
  const sort = c.columnFilters.collapsedSort;
  const active = sort.key === field;
  const direction = active ? sort.direction : undefined;
  const next = cycleCollapsedSort(sort, field);
  const title = active
    ? `${label}${direction === "asc" ? "升序" : "降序"}；点击${
        next.key === "bill" ? "恢复账单顺序" : "切换为降序"
      }`
    : `按${label}升序排序`;
  return (
    <button
      type="button"
      className="pm-collapsed-sort"
      data-active={active}
      aria-label={title}
      title={title}
      aria-pressed={active}
      onClick={() =>
        c.updateColumnFilters({
          collapsedSort: cycleCollapsedSort(sort, field),
        })
      }
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {direction === "desc" ? (
          <path d="M8 3v10m-3-4 3 4 3-4" />
        ) : direction === "asc" ? (
          <path d="M8 13V3M5 7l3-4 3 4" />
        ) : (
          <>
            <path d="M5 5.5 8 2.5l3 3M5 10.5l3 3 3-3" />
            <path d="M8 2.5v11" opacity=".45" />
          </>
        )}
      </svg>
    </button>
  );
}

function sortedOptions(
  values: string[],
  label: (value: string) => string = (value) => value || "（空）",
) {
  return [...new Set(values)]
    .sort((left, right) =>
      label(left).localeCompare(label(right), "zh-CN", {
        numeric: true,
        sensitivity: "base",
      }),
    )
    .map((value) => ({ value, label: label(value) }));
}

export function CollapsedCounterpartyFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const values = c.columnFilters.counterparty;
  const options = useMemo(
    () => sortedOptions(c.rows.map((row) => row.payee)),
    [c.rows],
  );
  return (
    <ColumnFilter
      title="交易对方"
      count={values.length}
      onClear={() =>
        c.updateColumnFilters({
          counterparty: [],
          counterpartyKind: "all",
          excluded: c.columnFilters.excluded.filter(
            (key) => key !== "counterparty",
          ),
        })
      }
    >
      <FilterGroup
        label="交易对方"
        excluded={c.columnFilters.excluded.includes("counterparty")}
        onExcludeChange={(excluded) =>
          c.setColumnFilterExcluded("counterparty", excluded)
        }
      >
        <SearchableMultiSelect
          label="交易对方筛选"
          searchLabel="搜索交易对方"
          values={values}
          placeholder="选择交易对方"
          compact
          inlineMenu
          options={options}
          onChange={(counterparty) =>
            c.updateColumnFilters({
              counterparty,
              counterpartyKind: "all",
            })
          }
        />
      </FilterGroup>
    </ColumnFilter>
  );
}

export function CollapsedPaymentFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const values = c.columnFilters.payment;
  const options = useMemo(
    () =>
      sortedOptions(
        c.rows.map((row) => row.payment),
        paymentMethodLabel,
      ),
    [c.rows],
  );
  return (
    <ColumnFilter
      title={paymentMethodField}
      count={values.length}
      onClear={() =>
        c.updateColumnFilters({
          payment: [],
          excluded: c.columnFilters.excluded.filter((key) => key !== "payment"),
        })
      }
    >
      <FilterGroup
        label={paymentMethodField}
        excluded={c.columnFilters.excluded.includes("payment")}
        onExcludeChange={(excluded) =>
          c.setColumnFilterExcluded("payment", excluded)
        }
      >
        <SearchableMultiSelect
          label="收付款方式筛选"
          searchLabel="搜索收付款方式"
          values={values}
          placeholder="选择收付款方式"
          compact
          inlineMenu
          options={options}
          onChange={(payment) => c.updateColumnFilters({ payment })}
        />
      </FilterGroup>
    </ColumnFilter>
  );
}

export function CollapsedAmountDateFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const filters = c.columnFilters;
  const dateActive = !!(filters.dateFrom || filters.dateTo);
  const amountActive = hasAmountFilter(filters);
  return (
    <ColumnFilter
      title="金额 / 日期"
      count={Number(dateActive) + Number(amountActive)}
      onClear={() =>
        c.updateColumnFilters({
          dateFrom: "",
          dateTo: "",
          expenseAmountRange: null,
          incomeAmountRange: null,
          excluded: filters.excluded.filter(
            (key) =>
              !["date", "amount", "expenseAmount", "incomeAmount"].includes(
                key,
              ),
          ),
        })
      }
    >
      <DateFilter controller={c} />
      <AmountFilter controller={c} />
    </ColumnFilter>
  );
}

export function CollapsedStatusCategoryFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const filters = c.columnFilters;
  const options = useMemo(
    () => sortedOptions(c.rows.map((row) => row.category)),
    [c.rows],
  );
  return (
    <ColumnFilter
      title="状态 / 分类"
      count={filters.status.length + filters.category.length}
      onClear={() =>
        c.updateColumnFilters({
          status: [],
          category: [],
          excluded: filters.excluded.filter(
            (key) => key !== "status" && key !== "category",
          ),
        })
      }
    >
      <FilterChoices
        label="交易状态"
        options={statementValueOptions(c.rows, "status")}
        values={filters.status}
        onChange={(status) => c.updateColumnFilters({ status })}
        excluded={filters.excluded.includes("status")}
        onExcludeChange={(excluded) =>
          c.setColumnFilterExcluded("status", excluded)
        }
      />
      <FilterGroup
        label="交易分类"
        excluded={filters.excluded.includes("category")}
        onExcludeChange={(excluded) =>
          c.setColumnFilterExcluded("category", excluded)
        }
      >
        <SearchableMultiSelect
          label="交易分类筛选"
          searchLabel="搜索交易分类"
          values={filters.category}
          placeholder="选择交易分类"
          compact
          inlineMenu
          options={options}
          onChange={(category) => c.updateColumnFilters({ category })}
        />
      </FilterGroup>
    </ColumnFilter>
  );
}
