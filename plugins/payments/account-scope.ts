import type {
  Row,
  CounterpartyKind,
  CounterpartyAccount,
  CounterpartyDescriptionMatch,
  PaymentAccount,
} from "./types";
export const fundingAccountRoots = ["Assets", "Liabilities"] as const;
export function counterpartyKind(
  row: Pick<Row, "category" | "direction" | "amount">,
): CounterpartyKind {
  if (/转账/u.test(row.category))
    return Number(row.amount) > 0 ? "transfer-income" : "transfer-expense";
  return row.direction === "收入"
    ? "income"
    : row.direction === "支出"
      ? "expense"
      : "movement";
}
export function accountRoots(kind: CounterpartyKind | "payment"): string[] {
  if (kind === "income" || kind === "transfer-income") return ["Income"];
  if (kind === "expense") return ["Expenses"];
  return [...fundingAccountRoots];
}
export function matchValue(value: string) {
  return value.replace(/^\uFEFF/u, "").trim();
}
const descriptionAliasGroups = [["闲鱼", "咸鱼", "閒魚"]] as const;
function normalizeDescriptionAliases(value: string) {
  let normalized = value;
  for (const [canonical, ...aliases] of descriptionAliasGroups) {
    for (const alias of aliases)
      normalized = normalized.split(alias).join(canonical);
  }
  return normalized;
}
export function ruleMatches(
  rule: CounterpartyAccount,
  row: Pick<Row, "payee" | "description" | "category" | "direction" | "amount">,
) {
  if (rule.kind !== counterpartyKind(row)) return false;
  if (!rule.pattern?.trim() && !rule.description) return false;
  if (rule.pattern?.trim()) {
    const payee = matchValue(row.payee);
    const payeeMatches =
      (rule.match ?? "exact") === "exact"
        ? rule.pattern === payee
        : new RegExp(rule.pattern, "u").test(payee);
    if (!payeeMatches) return false;
  }
  return descriptionMatches(rule.description, row.description);
}
export function descriptionMatches(
  condition: CounterpartyDescriptionMatch | undefined,
  value: string,
) {
  if (!condition) return true;
  const description = matchValue(value);
  const pattern = condition.pattern.trim();
  if (condition.match === "contains")
    return (
      description.includes(pattern) ||
      normalizeDescriptionAliases(description).includes(
        normalizeDescriptionAliases(pattern),
      )
    );
  try {
    return new RegExp(pattern, "u").test(description);
  } catch {
    return false;
  }
}
export function readDescriptionCondition(
  value: unknown,
): CounterpartyDescriptionMatch | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("商品说明匹配规则无效");
  const condition = value as Partial<CounterpartyDescriptionMatch>;
  if (
    !["contains", "regex"].includes(String(condition.match)) ||
    typeof condition.pattern !== "string" ||
    !condition.pattern.trim() ||
    condition.pattern.length > 200 ||
    /[\u0000-\u001f]/u.test(condition.pattern)
  )
    throw new Error("商品说明匹配规则无效");
  const pattern = condition.pattern.trim();
  if (condition.match === "regex") {
    try {
      new RegExp(pattern, "u");
    } catch {
      throw new Error("商品说明正则表达式无效，请检查后重试");
    }
  }
  return {
    match: condition.match as CounterpartyDescriptionMatch["match"],
    pattern,
  };
}
export function counterpartyRuleKey(
  rule: Pick<CounterpartyAccount, "kind" | "match" | "pattern" | "description">,
) {
  return JSON.stringify([
    rule.kind,
    rule.pattern?.trim() ? (rule.match ?? "exact") : "",
    rule.pattern ?? "",
    rule.description?.match ?? "",
    rule.description?.pattern.trim() ?? "",
  ]);
}
export function paymentRuleKey(
  rule: Pick<PaymentAccount, "payment" | "match" | "description">,
) {
  return JSON.stringify([
    rule.match ?? "exact",
    rule.payment,
    rule.description?.match ?? "",
    rule.description?.pattern.trim() ?? "",
  ]);
}
export function mappingRuleId(
  type: "payment" | "counterparty",
  rule: PaymentAccount | CounterpartyAccount,
) {
  return JSON.stringify([
    type,
    rule.provider,
    type === "payment"
      ? paymentRuleKey(rule as PaymentAccount)
      : counterpartyRuleKey(rule as CounterpartyAccount),
  ]);
}
export function compareRulePriority(
  first: { priority?: number },
  second: { priority?: number },
) {
  return (
    (first.priority ?? Number.MAX_SAFE_INTEGER) -
    (second.priority ?? Number.MAX_SAFE_INTEGER)
  );
}
export function validateRulePriority(priority: unknown) {
  if (priority !== undefined && !Number.isSafeInteger(priority))
    throw new Error("账户关联规则优先级无效");
}
export function sortCounterpartyRules<
  T extends Pick<
    CounterpartyAccount,
    "match" | "pattern" | "description" | "priority"
  >,
>(rules: T[]) {
  const priority = (rule: T) => {
    const hasPayee = !!rule.pattern?.trim();
    const hasDescription = !!rule.description;
    if (hasPayee && hasDescription)
      return Number((rule.match ?? "exact") === "regex");
    if (!hasPayee && hasDescription) return 2;
    if (hasPayee) return 3 + Number((rule.match ?? "exact") === "regex");
    return 5;
  };
  return [...rules].sort(
    (first, second) =>
      compareRulePriority(first, second) || priority(first) - priority(second),
  );
}
export function sortPaymentRules<
  T extends Pick<PaymentAccount, "match" | "description" | "priority">,
>(rules: T[]) {
  return [...rules].sort(
    (first, second) =>
      compareRulePriority(first, second) ||
      Number(!first.description) - Number(!second.description) ||
      Number(first.match === "regex") - Number(second.match === "regex"),
  );
}
export function validatePattern(
  match: unknown,
  pattern: unknown,
): asserts pattern is string {
  if (
    !["exact", "regex"].includes(String(match)) ||
    typeof pattern !== "string" ||
    !pattern.trim() ||
    pattern.length > 200 ||
    /[\u0000-\u001f]/u.test(pattern)
  )
    throw new Error("交易对方匹配规则无效");
  if (match === "regex") {
    try {
      new RegExp(pattern, "u");
    } catch {
      throw new Error("正则表达式无效，请检查后重试");
    }
  }
}

export function readCounterpartyRuleConditions(
  match: unknown,
  pattern: unknown,
  description: unknown,
): Pick<CounterpartyAccount, "match" | "pattern" | "description"> {
  let conditions: Pick<
    CounterpartyAccount,
    "match" | "pattern" | "description"
  > = {};
  if (pattern !== undefined) {
    validatePattern(match, pattern);
    conditions = {
      match: match as CounterpartyAccount["match"],
      pattern,
    };
  } else if (match !== undefined) {
    throw new Error("交易对方匹配方式缺少匹配内容");
  }
  const descriptionMatch = readDescriptionCondition(description);
  if (!conditions.pattern && !descriptionMatch)
    throw new Error("交易对方关联规则需至少包含交易对方或商品说明");
  return {
    ...conditions,
    ...(descriptionMatch ? { description: descriptionMatch } : {}),
  };
}
