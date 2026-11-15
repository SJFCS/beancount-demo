import React, { useMemo } from "react";
import type { PaymentsController } from "./use-payments";
import { ColumnFilter, FilterGroup } from "./column-filter";
import { SearchableMultiSelect } from "./searchable-select";
import {
  accountFilterFields,
  unassignedAccountFilter,
  type AccountFilterKey,
} from "./transaction-filters";

export function accountFilterLabel(key: AccountFilterKey) {
  return accountFilterFields.find(([field]) => field === key)?.[1] ?? "账户";
}

function accountOptions(
  rows: PaymentsController["rows"],
  key: AccountFilterKey,
) {
  const field =
    key === "counterpartyAccount" ? "targetAccount" : "sourceAccount";
  const accounts = [...new Set(rows.map((row) => row[field]))].filter(Boolean);
  return [
    ...(rows.some((row) => !row[field])
      ? [{ value: unassignedAccountFilter, label: "未绑定" }]
      : []),
    ...accounts
      .sort((left, right) =>
        left.localeCompare(right, "zh-CN", {
          numeric: true,
          sensitivity: "base",
        }),
      )
      .map((account) => ({ value: account, label: account })),
  ];
}

export function AccountFilterField({
  controller: c,
  field,
}: {
  controller: PaymentsController;
  field: AccountFilterKey;
}) {
  const label = accountFilterLabel(field);
  const options = useMemo(() => accountOptions(c.rows, field), [c.rows, field]);
  return (
    <FilterGroup
      label={label}
      excluded={c.columnFilters.excluded.includes(field)}
      onExcludeChange={(excluded) => c.setColumnFilterExcluded(field, excluded)}
    >
      <SearchableMultiSelect
        label={`${label}筛选`}
        searchLabel={`搜索${label}`}
        values={c.columnFilters[field]}
        placeholder={`选择${label}`}
        compact
        inlineMenu
        options={options}
        onChange={(values) => c.updateColumnFilters({ [field]: values })}
      />
    </FilterGroup>
  );
}

export function AccountFilterTrigger({
  controller: c,
  field,
}: {
  controller: PaymentsController;
  field: AccountFilterKey;
}) {
  const label = accountFilterLabel(field);
  return (
    <ColumnFilter
      title={label}
      count={c.columnFilters[field].length}
      onClear={() =>
        c.updateColumnFilters({
          [field]: [],
          excluded: c.columnFilters.excluded.filter((key) => key !== field),
        })
      }
    >
      <AccountFilterField controller={c} field={field} />
    </ColumnFilter>
  );
}
