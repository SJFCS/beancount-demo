import React from "react";
import type { PaymentsController } from "./use-payments";
import { FilterGroup } from "./column-filter";
import { RangeSlider } from "./range-slider";

const amountRanges = [
  {
    key: "expenseAmountRange",
    visibilityKey: "expenseAmount",
    kind: "expense",
    label: "支出金额",
  },
  {
    key: "incomeAmountRange",
    visibilityKey: "incomeAmount",
    kind: "income",
    label: "收入金额",
  },
] as const;

export function AmountFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const { columnFilters: filters, updateColumnFilters: update } = c;
  return (
    <FilterGroup
      label="金额"
      excluded={filters.excluded.includes("amount")}
      onExcludeChange={(excluded) =>
        c.setColumnFilterExcluded("amount", excluded)
      }
    >
      {amountRanges.map(({ key, visibilityKey, kind, label }) => {
        const amounts = c.rows
          .map((row) => Number(row.amount))
          .filter(
            (amount) =>
              Number.isFinite(amount) &&
              (kind === "expense" ? amount < 0 : amount >= 0),
          )
          .map(Math.abs);
        const min = amounts.reduce(
          (bound, amount) => Math.min(bound, amount),
          amounts[0] ?? 0,
        );
        const max = amounts.reduce(
          (bound, amount) => Math.max(bound, amount),
          amounts[0] ?? 0,
        );
        const range = filters[key] ?? [min, max];
        return (
          <RangeSlider
            key={key}
            label={label}
            kind={kind}
            enabled={!filters.excluded.includes(visibilityKey)}
            onEnabledChange={(enabled) =>
              c.setColumnFilterExcluded(visibilityKey, !enabled)
            }
            min={Math.min(min, range[0])}
            max={Math.max(max, range[1])}
            value={range}
            step={0.01}
            formatValue={(amount) => `¥${amount.toFixed(2)}`}
            editableValues
            emptyLabel={
              amounts.length ? undefined : `暂无${label.slice(0, 2)}记录`
            }
            onChange={(value) =>
              update({
                [key]: value[0] <= min && value[1] >= max ? null : value,
              })
            }
          />
        );
      })}
      <p className="pm-muted">
        点击区间数字可输入金额，按回车或移开焦点后生效。关闭开关可排除整类金额，重新开启保留原范围。
      </p>
    </FilterGroup>
  );
}
