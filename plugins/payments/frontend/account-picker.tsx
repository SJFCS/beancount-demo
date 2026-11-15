import React, { useMemo, type ComponentProps } from "react";
import type { Account } from "../types";
import type { SelectOption } from "./searchable-select";
import {
  AccountBrowserSelect as SharedAccountBrowserSelect,
  type AccountRootOption,
} from "@plugins/shared/frontend/account-browser-select";

export const accountRoots: Record<string, AccountRootOption> = {
  Income: { value: "Income", label: "收入", color: "#15803d" },
  Expenses: { value: "Expenses", label: "支出", color: "#dc2626" },
  Liabilities: { value: "Liabilities", label: "负债", color: "#b7791f" },
  Assets: { value: "Assets", label: "资产", color: "#2563eb" },
  Equity: { value: "Equity", label: "权益", color: "#7c3aed" },
};
export const accountRootValues = Object.keys(accountRoots);

export function eligibleAccountNames(accounts: Account[], roots: string[]) {
  return accounts
    .filter(
      (account) =>
        roots.includes(account.name.split(":")[0]) &&
        !account.closed &&
        (!account.currencies.length || account.currencies.includes("CNY")),
    )
    .map((account) => account.name)
    .sort((a, b) => a.localeCompare(b));
}

export function accountHierarchyOptions(
  accountNames: string[],
  roots: string[],
): SelectOption[] {
  const values = new Set(roots);
  for (const accountName of accountNames) {
    if (!roots.includes(accountName.split(":")[0])) continue;
    const parts = accountName.split(":");
    for (let length = 1; length <= parts.length; length++)
      values.add(parts.slice(0, length).join(":"));
  }
  return [...values]
    .sort(
      (a, b) => a.split(":").length - b.split(":").length || a.localeCompare(b),
    )
    .map((value) => ({ value, label: value }));
}

export function accountParentOptions(accounts: Account[], roots: string[]) {
  return accountHierarchyOptions(eligibleAccountNames(accounts, roots), roots);
}

function rootOptions(rootValues: readonly string[]) {
  const included = new Set(rootValues);
  return [
    ...Object.values(accountRoots).filter((root) => included.has(root.value)),
    ...rootValues
      .filter((value) => !Object.hasOwn(accountRoots, value))
      .map((value) => ({ value, label: value })),
  ];
}

type AccountBrowserSelectProps = Omit<
  ComponentProps<typeof SharedAccountBrowserSelect>,
  "roots"
> & {
  roots?: readonly string[];
};

export function AccountBrowserSelect({
  roots,
  options,
  ...props
}: AccountBrowserSelectProps) {
  const browserRoots = useMemo(
    () =>
      rootOptions(
        roots ??
          options
            .filter((option) => !option.value.includes(":"))
            .map((option) => option.value),
      ),
    [roots, options],
  );
  return (
    <SharedAccountBrowserSelect
      {...props}
      roots={browserRoots}
      options={options}
    />
  );
}

export { createdAccountName } from "@plugins/shared/frontend/account-browser-select";
