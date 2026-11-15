import React, { useState } from "react";
import type { CounterpartyKind } from "../types";
import { counterpartyKind } from "../account-scope";
import { paymentMethodField } from "../metadata";
import { ColumnFilter, FilterChoices, FilterGroup } from "./column-filter";
import { AccountFilterField } from "./account-filter";
import { paymentMethodLabel } from "./display";
import { counterpartyScopeOptions } from "./mapping-editor-row";
import { SearchableMultiSelect } from "./searchable-select";
import {
  accountFilterFields,
  directionOptions,
  hasAmountFilter,
  statementValueOptions,
} from "./transaction-filters";
import { DateFilter } from "./date-filter";
import { AmountFilter } from "./amount-filter";
import type { FilterKey } from "./transaction-filters";
import type { PaymentsController } from "./use-payments";

const filterSections = [
  ["date", "日期"],
  ["amount", "金额"],
  ["direction", "收支"],
  ["status", "交易状态"],
] as const;

export function TransactionSourceFilter({
  controller: c,
  additionalOnly = false,
}: {
  controller: PaymentsController;
  additionalOnly?: boolean;
}) {
  const filters = c.columnFilters;
  const sections = additionalOnly
    ? filterSections.filter(([key]) => key === "direction")
    : filterSections;
  const [section, setSection] = useState<(typeof filterSections)[number][0]>(
    additionalOnly ? "direction" : "date",
  );
  const counts = {
    date: Number(!!(filters.dateFrom || filters.dateTo)),
    amount: Number(hasAmountFilter(filters)),
    direction:
      Number(!!filters.direction.length) +
      Number(!!filters.originalDirection.length),
    status: Number(!!filters.status.length),
  };
  const visibleCounts = additionalOnly
    ? { direction: counts.direction }
    : counts;
  const tradeCount =
    Number(!!filters.payment.length) +
    Number(!!filters.counterparty.length) +
    Number(!!filters.category.length);
  const accountCount =
    Number(!!filters.counterpartyAccount.length) +
    Number(!!filters.paymentAccount.length);
  const polarity = (key: FilterKey) => ({
    excluded: filters.excluded.includes(key),
    onExcludeChange: (excluded: boolean) =>
      c.setColumnFilterExcluded(key, excluded),
  });
  return (
    <ColumnFilter
      title={additionalOnly ? "更多筛选" : "原账单信息"}
      className="pm-source-filter-popover"
      count={
        additionalOnly
          ? counts.direction
          : Object.values(counts).reduce((total, count) => total + count, 0) +
            tradeCount +
            accountCount
      }
      onClear={() => {
        if (additionalOnly) {
          c.updateColumnFilters({
            direction: [],
            originalDirection: [],
            excluded: filters.excluded.filter(
              (key) => key !== "direction" && key !== "originalDirection",
            ),
          });
          return;
        }
        c.updateColumnFilters({
          dateFrom: "",
          dateTo: "",
          expenseAmountRange: null,
          incomeAmountRange: null,
          direction: [],
          originalDirection: [],
          payment: [],
          counterparty: [],
          category: [],
          counterpartyAccount: [],
          paymentAccount: [],
          status: [],
          excluded: filters.excluded.filter((key) =>
            ["selection", "review"].includes(key),
          ),
        });
      }}
    >
      <div
        className={`pm-source-filter-tabs${additionalOnly ? " pm-source-filter-tabs-single" : ""}`}
        role="group"
        aria-label="筛选分类"
      >
        {sections.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={section === key}
            onClick={() => setSection(key)}
          >
            {label}
            {visibleCounts[key] > 0 && <span>{visibleCounts[key]}</span>}
          </button>
        ))}
      </div>
      <div className="pm-source-filter-body">
        {!additionalOnly && (
          <>
            <div hidden={section !== "date"}>
              <DateFilter controller={c} />
            </div>
            <div hidden={section !== "amount"}>
              <AmountFilter controller={c} />
            </div>
          </>
        )}
        <div hidden={section !== "direction"}>
          <FilterChoices
            label="资金流向"
            description="按当前审核金额、账户和交易性质判断实际流入、流出或账户流转。"
            {...polarity("direction")}
            options={directionOptions}
            values={filters.direction}
            onChange={(direction) => c.updateColumnFilters({ direction })}
          />
          <FilterChoices
            label="收/支"
            description="账单文件中的原始收支标记，不随审核修改；例如退款可能标为“不计收支”，实际仍有资金流入。"
            {...polarity("originalDirection")}
            options={statementValueOptions(c.rows, "direction")}
            values={filters.originalDirection}
            onChange={(originalDirection) =>
              c.updateColumnFilters({ originalDirection })
            }
          />
        </div>
        {!additionalOnly && (
          <div hidden={section !== "status"}>
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
          </div>
        )}
        {!additionalOnly && (
          <>
            <div
              className="pm-source-filter-fixed-section"
              role="group"
              aria-label="交易信息"
            >
              <div className="pm-source-filter-section-heading">
                <strong>交易信息</strong>
                {tradeCount > 0 && <span>{tradeCount}</span>}
              </div>
              <FilterGroup
                label={paymentMethodField}
                excluded={filters.excluded.includes("payment")}
                onExcludeChange={(excluded) =>
                  c.setColumnFilterExcluded("payment", excluded)
                }
              >
                <SearchableMultiSelect
                  label="收付款方式筛选"
                  searchLabel="搜索收付款方式"
                  values={filters.payment}
                  placeholder="选择收付款方式"
                  compact
                  inlineMenu
                  options={[...new Set(c.rows.map((row) => row.payment))].map(
                    (payment) => ({
                      value: payment,
                      label: paymentMethodLabel(payment),
                    }),
                  )}
                  onChange={(values) => {
                    c.updateColumnFilters({ payment: values });
                  }}
                />
              </FilterGroup>
              <FilterGroup
                label="交易对方"
                excluded={filters.excluded.includes("counterparty")}
                onExcludeChange={(excluded) =>
                  c.setColumnFilterExcluded("counterparty", excluded)
                }
              >
                <SearchableMultiSelect
                  label="交易对方筛选"
                  searchLabel="搜索交易对方"
                  values={filters.counterparty}
                  placeholder="选择交易对方"
                  compact
                  inlineMenu
                  tagGroup={{
                    label: "交易对方类型",
                    value: filters.counterpartyKind,
                    options: counterpartyScopeOptions,
                    breakAfter: 3,
                    onChange(value) {
                      c.updateColumnFilters({
                        counterpartyKind: value as CounterpartyKind | "all",
                        counterparty: [],
                      });
                    },
                  }}
                  options={[
                    ...new Set(
                      c.rows
                        .filter(
                          (row) =>
                            filters.counterpartyKind === "all" ||
                            counterpartyKind(row) === filters.counterpartyKind,
                        )
                        .map((row) => row.payee),
                    ),
                  ]
                    .filter(Boolean)
                    .map((payee) => ({ value: payee, label: payee }))}
                  onChange={(values) => {
                    c.updateColumnFilters({ counterparty: values });
                  }}
                />
              </FilterGroup>
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
                  options={[...new Set(c.rows.map((row) => row.category))]
                    .sort((left, right) =>
                      left.localeCompare(right, "zh-CN", {
                        numeric: true,
                        sensitivity: "base",
                      }),
                    )
                    .map((category) => ({
                      value: category,
                      label: category || "（空）",
                    }))}
                  onChange={(category) => {
                    c.updateColumnFilters({ category });
                  }}
                />
              </FilterGroup>
            </div>
            <div
              className="pm-source-filter-fixed-section"
              role="group"
              aria-label="账户绑定"
            >
              <div className="pm-source-filter-section-heading">
                <strong>账户绑定</strong>
                {accountCount > 0 && <span>{accountCount}</span>}
              </div>
              {accountFilterFields.map(([key]) => (
                <AccountFilterField key={key} controller={c} field={key} />
              ))}
            </div>
          </>
        )}
      </div>
    </ColumnFilter>
  );
}
