import type { AccountDraft, ConfigDraft, Issue } from "./types";

export const ACCOUNT =
  /^(?:Assets|Liabilities|Equity|Income|Expenses)(?::[A-Za-z0-9\u0080-\uFFFF][A-Za-z0-9_\-\u0080-\uFFFF]*)+$/u;
export const CURRENCY = /^[A-Z][A-Z0-9'._-]{0,30}$/u;

function recordValue(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function boolValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeConfig(value: unknown): ConfigDraft {
  const root = recordValue(value);
  const rawAccounts = root.accounts;
  const accountItems: unknown[] = Array.isArray(rawAccounts)
    ? rawAccounts
    : Object.entries(recordValue(rawAccounts)).map(([account, item]) =>
        typeof item === "string"
          ? { account, currency: item }
          : { ...recordValue(item), account },
      );
  const accounts = accountItems.map((item) => {
    if (typeof item === "string") {
      return {
        account: item.trim(),
        currency: "",
        pnlAccount: "",
        quote: "",
        enabled: true,
      };
    }
    const body = recordValue(item);
    return {
      account: stringValue(body.account),
      currency: stringValue(body.currency),
      pnlAccount: stringValue(body.pnlAccount ?? body.pnl_account),
      quote: stringValue(body.quote),
      enabled: boolValue(body.enabled, true),
    };
  });

  return {
    version: 1,
    accounts,
  };
}

export function autoSyntheticCurrency(account: string, quote: string): string {
  const parts = account.split(":");
  const descriptor =
    parts.length >= 3 ? parts[parts.length - 2] : parts[parts.length - 1];
  const base = descriptor
    .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
    .replace(/[^A-Za-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .toUpperCase()
    .slice(0, 22);
  return `${base || "FUND"}_${quote}`;
}

export function autoPnlAccount(account: string): string {
  const parts = account.split(":");
  if (parts[0] === "Assets" || parts[0] === "Liabilities") {
    const name = parts.slice(1, -1).join(":") || "Valuation";
    return `Income:${name}:PnL`;
  }
  return `Equity:Valuation:PnL`;
}

export function effectiveAccountFields(
  row: AccountDraft,
  primaryCurrency: string,
): { quote: string; currency: string; pnl: string } {
  const quote = row.quote.trim() || primaryCurrency.trim() || "USD";
  return {
    quote,
    currency:
      row.currency.trim() ||
      autoSyntheticCurrency(row.account || "Fund", quote),
    pnl:
      row.pnlAccount.trim() ||
      autoPnlAccount(row.account || "Assets:Fund:Total"),
  };
}

export function validateConfig(
  config: ConfigDraft,
  primaryCurrency: string,
): Issue[] {
  const issues: Issue[] = [];
  const accounts = new Map<string, number>();
  const currencies = new Map<string, number>();
  config.accounts.forEach((row, index) => {
    const account = row.account.trim();
    const effective = effectiveAccountFields(row, primaryCurrency);
    const pnl = effective.pnl;
    if (account === "") {
      issues.push({
        path: `accounts.${index}.account`,
        message: "账户不能为空",
      });
    } else if (!ACCOUNT.test(account)) {
      issues.push({
        path: `accounts.${index}.account`,
        message: "账户名不合法",
      });
    } else if (accounts.has(account)) {
      issues.push({
        path: `accounts.${index}.account`,
        message: `与第 ${accounts.get(account)! + 1} 行重复`,
      });
    } else {
      accounts.set(account, index);
    }
    if (!CURRENCY.test(effective.quote)) {
      issues.push({
        path: `accounts.${index}.quote`,
        message: "报价货币不合法",
      });
    }
    if (!CURRENCY.test(effective.currency)) {
      issues.push({
        path: `accounts.${index}.currency`,
        message: "合成商品名不合法",
      });
    } else if (row.enabled) {
      const owner = currencies.get(effective.currency);
      if (owner !== undefined) {
        issues.push({
          path: `accounts.${index}.currency`,
          message: `与第 ${owner + 1} 行使用同一个合成商品`,
        });
      } else {
        currencies.set(effective.currency, index);
      }
    }
    if (!ACCOUNT.test(pnl)) {
      issues.push({
        path: `accounts.${index}.pnlAccount`,
        message: "盈亏账户不合法",
      });
    }
  });

  return issues;
}
