import {
  counterpartyRuleKey,
  descriptionMatches,
  paymentRuleKey,
  readCounterpartyRuleConditions,
  readDescriptionCondition,
  ruleMatches,
  sortCounterpartyRules,
  sortPaymentRules,
  validatePattern,
  validateRulePriority,
} from "../account-scope";
export { paymentRuleKey } from "../account-scope";
import type { PaymentConfig, Account, Batch, PaymentAccount } from "../types";
import type { Context } from "./context";
import { ACCOUNT, clean } from "./utils";
export function isPaymentProvider(value: unknown): value is string {
  return typeof value === "string" && /^[a-z][a-z0-9_-]{0,63}$/u.test(value);
}
export function isPaymentMethodValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    !/[\u0000-\u001f]/u.test(value) &&
    (value === "" || (!!clean(value) && value === clean(value)))
  );
}
export function paymentRuleMatches(
  rule: Pick<PaymentAccount, "payment" | "match" | "description">,
  payment: string,
  description: string,
) {
  const value = clean(payment);
  const paymentMatches =
    (rule.match ?? "exact") === "exact"
      ? rule.payment === value
      : new RegExp(rule.payment, "u").test(value);
  return paymentMatches && descriptionMatches(rule.description, description);
}
export function readPaymentConfig(content?: string): PaymentConfig {
  if (content === undefined) return { version: 1, paymentAccounts: [] };
  const config = JSON.parse(content) as PaymentConfig;
  const keys = new Set<string>();
  if (
    !config ||
    config.version !== 1 ||
    !Array.isArray(config.paymentAccounts) ||
    config.paymentAccounts.some((link) => {
      if (
        !link ||
        !isPaymentProvider(link.provider) ||
        !isPaymentMethodValue(link.payment) ||
        (link.match !== undefined &&
          !["exact", "regex"].includes(link.match)) ||
        typeof link.account !== "string" ||
        !ACCOUNT.test(link.account) ||
        !/^(Assets|Liabilities):/u.test(link.account)
      )
        return true;
      if (link.match === "regex") validatePattern("regex", link.payment);
      readDescriptionCondition(link.description);
      validateRulePriority(link.priority);
      const key = JSON.stringify([link.provider, paymentRuleKey(link)]);
      if (keys.has(key)) return true;
      keys.add(key);
      return false;
    })
  )
    throw new Error("缴费方式配置无效，请检查 plugins/payments/config.json");
  if (config.counterpartyAccounts !== undefined) {
    if (!Array.isArray(config.counterpartyAccounts))
      throw new Error("交易对方账户配置无效");
    const keys = new Set<string>();
    for (const rule of config.counterpartyAccounts) {
      if (
        !isPaymentProvider(rule.provider) ||
        ![
          "transfer-income",
          "transfer-expense",
          "income",
          "expense",
          "movement",
        ].includes(rule.kind) ||
        !ACCOUNT.test(rule.account)
      )
        throw new Error("交易对方账户配置无效");
      readCounterpartyRuleConditions(
        rule.match,
        rule.pattern,
        rule.description,
      );
      validateRulePriority(rule.priority);
      const key = JSON.stringify([rule.provider, counterpartyRuleKey(rule)]);
      if (keys.has(key)) throw new Error("交易对方账户规则重复");
      keys.add(key);
    }
  }
  return config;
}
export function accountAvailable(account: Account, date: string) {
  return (
    account.date <= date &&
    (!account.closed || account.closed > date) &&
    (!account.currencies.length || account.currencies.includes("CNY"))
  );
}
function paymentChannel(value: string) {
  // WeChat and Alipay append promotions to the underlying channel with "&".
  return clean(value).split(/[&＆]/u, 1)[0].trim();
}
export function findPaymentAccount(
  config: PaymentConfig,
  provider: Batch["provider"],
  payment: string,
  description: string,
) {
  const links = config.paymentAccounts.filter(
    (item) => item.provider === provider,
  );
  if (links.some((item) => item.priority !== undefined)) {
    const channel = paymentChannel(payment);
    return sortPaymentRules(links).find(
      (item) =>
        paymentRuleMatches(item, payment, description) ||
        (!!channel &&
          (item.match ?? "exact") === "exact" &&
          paymentChannel(item.payment) === channel &&
          descriptionMatches(item.description, description)),
    );
  }
  const exact = links.filter(
    (item) => (item.match ?? "exact") === "exact" && item.payment === payment,
  );
  const regex = links.filter(
    (item) =>
      item.match === "regex" && new RegExp(item.payment, "u").test(payment),
  );
  const channel = paymentChannel(payment);
  const channelMatches = channel
    ? links.filter(
        (item) =>
          (item.match ?? "exact") === "exact" &&
          paymentChannel(item.payment) === channel,
      )
    : [];
  const tiers = [
    exact.filter((item) => item.description),
    regex.filter((item) => item.description),
    channelMatches.filter((item) => item.description),
    exact.filter((item) => !item.description),
    regex.filter((item) => !item.description),
    channelMatches.filter((item) => !item.description),
  ].map((candidates) =>
    candidates.filter((item) =>
      descriptionMatches(item.description, description),
    ),
  );
  for (const candidates of tiers) {
    if (!candidates.length) continue;
    return new Set(candidates.map((item) => item.account)).size === 1
      ? candidates[0]
      : undefined;
  }
  return undefined;
}
export function applyPaymentAccounts(
  batch: Batch,
  ctx: Context,
  replace = false,
): Batch {
  if (batch.locked) return batch;
  const rules = sortCounterpartyRules(
    ctx.paymentConfig.counterpartyAccounts ?? [],
  );
  return {
    ...batch,
    rows: batch.rows.map((row) => {
      if (row.committedAt || row.locked) return row;

      const link = findPaymentAccount(
        ctx.paymentConfig,
        batch.provider,
        clean(row.payment),
        row.description,
      );
      const account = ctx.accounts.find((item) => item.name === link?.account);
      const rule = rules.find(
        (item) => item.provider === batch.provider && ruleMatches(item, row),
      );
      const target = ctx.accounts.find((item) => item.name === rule?.account);
      const targetAvailable = target && accountAvailable(target, row.date);
      const defaultTarget =
        !row.targetAccount ||
        ["Expenses:Other", "Income:Other"].includes(row.targetAccount);
      const next =
        targetAvailable &&
        (replace || (defaultTarget && row.confidence === undefined))
          ? { ...row, targetAccount: target.name }
          : row;
      if (
        (!replace && row.sourceAccount) ||
        !account ||
        !accountAvailable(account, row.date)
      )
        return next;
      return {
        ...next,
        sourceAccount: account.name,
        warnings: row.warnings.filter(
          (warning) => warning !== "请按支付方式选择实际资金账户",
        ),
      };
    }),
  };
}
