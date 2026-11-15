import React from "react";
import { FilterGroup } from "./column-filter";
import { RangeSlider } from "./range-slider";
import type { PaymentsController } from "./use-payments";

const dayMs = 86_400_000;
const dateDay = (date: string) => Date.parse(`${date}T00:00:00Z`) / dayMs;
const dayDate = (day: number) =>
  new Date(day * dayMs).toISOString().slice(0, 10);

export function DateFilter({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const { columnFilters: filters } = c;
  const days = c.rows.map((row) => dateDay(row.date)).filter(Number.isFinite);
  const min = days.reduce((bound, day) => Math.min(bound, day), days[0] ?? 0);
  const max = days.reduce((bound, day) => Math.max(bound, day), days[0] ?? 0);
  return (
    <FilterGroup
      label="日期"
      excluded={filters.excluded.includes("date")}
      onExcludeChange={(excluded) =>
        c.setColumnFilterExcluded("date", excluded)
      }
    >
      <RangeSlider
        label="交易日期"
        min={min}
        max={max}
        value={[
          filters.dateFrom ? dateDay(filters.dateFrom) : min,
          filters.dateTo ? dateDay(filters.dateTo) : max,
        ]}
        step={1}
        formatValue={dayDate}
        emptyLabel={days.length ? undefined : "暂无交易日期"}
        onChange={([lower, upper]) =>
          c.updateColumnFilters({
            dateFrom: lower === min && upper === max ? "" : dayDate(lower),
            dateTo: lower === min && upper === max ? "" : dayDate(upper),
          })
        }
      />
    </FilterGroup>
  );
}
