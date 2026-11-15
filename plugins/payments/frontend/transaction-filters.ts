import type { CounterpartyKind, Row } from "../types";
import { counterpartyKind } from "../account-scope";
import { paymentMethodField } from "../metadata";
import { hasReviewWarnings, needsAccountMapping } from "../review";
import {
  flow,
  paymentMethodLabel,
  type RefundMatchKind,
  type TransactionGroup,
} from "./display";
import { counterpartyKindLabels } from "./mapping-editor-row";

export const unassignedAccountFilter = "__pm_unassigned_account__";

export type AccountFilterKey = "counterpartyAccount" | "paymentAccount";
export type CollapsedSortKey =
  | "bill"
  | "counterparty"
  | "payment"
  | AccountFilterKey;
export type CollapsedSort = {
  key: CollapsedSortKey;
  direction: "asc" | "desc";
};

export const accountFilterFields = [
  ["counterpartyAccount", "分类账户"],
  ["paymentAccount", "资金账户"],
] as const;

export type FilterKey =
  | "selection"
  | "date"
  | "amount"
  | "expenseAmount"
  | "incomeAmount"
  | "payment"
  | "counterparty"
  | "category"
  | "counterpartyAccount"
  | "paymentAccount"
  | "status"
  | "direction"
  | "originalDirection"
  | "review";

export type ColumnFilters = {
  excluded: FilterKey[];
  selection: string[];
  dateFrom: string;
  dateTo: string;
  expenseAmountRange: [number, number] | null;
  incomeAmountRange: [number, number] | null;
  payment: string[];
  counterparty: string[];
  category: string[];
  counterpartyKind: CounterpartyKind | "all";
  counterpartyAccount: string[];
  paymentAccount: string[];
  collapsedSort: CollapsedSort;
  status: string[];
  direction: string[];
  originalDirection: string[];
  review: string[];
};
export const emptyColumnFilters: ColumnFilters = {
  excluded: [],
  selection: [],
  dateFrom: "",
  dateTo: "",
  expenseAmountRange: null,
  incomeAmountRange: null,
  payment: [],
  counterparty: [],
  category: [],
  counterpartyKind: "expense",
  counterpartyAccount: [],
  paymentAccount: [],
  collapsedSort: { key: "bill", direction: "asc" },
  status: [],
  direction: [],
  originalDirection: [],
  review: [],
};
export const directionOptions = [
  ["expense", "支出"],
  ["income", "收入"],
  ["transfer", "账户流转"],
] as const;
export function statementValueOptions(
  rows: Row[],
  field: "status" | "direction",
) {
  return [...new Set(rows.map((row) => row[field]))].map(
    (value): [string, string] => [value, value || "（空）"],
  );
}
export const selectionOptions = [
  ["selected", "已选中"],
  ["unselected", "未选中"],
  ["notImported", "不导入"],
] as const;
export const reviewOptions = [
  ["duplicates", "疑似重复"],
  ["refunds", "退款不完全匹配"],
  ["fullRefunds", "全额退款匹配"],
  ["warnings", "有核对提示"],
  ["clear", "无重复或警告"],
] as const;

export type BulkRuleCondition =
  | "all"
  | "selected"
  | "unselected"
  | "duplicates"
  | "refunds"
  | "fullRefunds"
  | "warnings"
  | "clear"
  | "unmapped";

export type BulkRuleMode = "include" | "exclude";

export type BulkSelectionChange = {
  id: string;
  beforeSelected: boolean;
  afterSelected: boolean;
  beforeNotImported: boolean;
  afterNotImported: boolean;
  beforeDuplicateReviewed: boolean;
  afterDuplicateReviewed: boolean;
};

export type BulkSelectionUndo = {
  label: string;
  changes: BulkSelectionChange[];
};

export const bulkRuleOptions = [
  ["all", "当前显示的全部交易"],
  ["selected", "已选中交易"],
  ["unselected", "未选中交易"],
  ["duplicates", "重复候选"],
  ["fullRefunds", "全额退款匹配"],
  ["refunds", "退款不完全匹配"],
  ["warnings", "有核对提示"],
  ["clear", "无重复或警告"],
  ["unmapped", "账户未齐全"],
] as const;

export function matchesReview(
  row: Row,
  review: string,
  refundKinds?: ReadonlyMap<string, RefundMatchKind>,
): boolean {
  if (review === "allRefunds")
    return (
      matchesReview(row, "refunds", refundKinds) ||
      matchesReview(row, "fullRefunds", refundKinds)
    );
  const refundKind =
    refundKinds?.get(row.id) ??
    (row.refund?.kind === "full"
      ? "full"
      : row.refund
        ? "incomplete"
        : undefined);
  return review === "duplicates"
    ? row.duplicates.length > 0
    : review === "refunds"
      ? refundKind === "incomplete" ||
        (!row.refund && /退款|退还/u.test(`${row.category} ${row.status}`))
      : review === "fullRefunds"
        ? refundKind === "full"
        : review === "warnings"
          ? hasReviewWarnings(row)
          : !hasReviewWarnings(row);
}

export function matchesBulkRule(
  row: Row,
  condition: BulkRuleCondition,
  refundKinds?: ReadonlyMap<string, RefundMatchKind>,
) {
  return condition === "all"
    ? true
    : condition === "selected"
      ? row.selected
      : condition === "unselected"
        ? !row.selected
        : condition === "unmapped"
          ? needsAccountMapping(row)
          : matchesReview(row, condition, refundKinds);
}

export function bulkRuleLabel(condition: BulkRuleCondition) {
  return (
    bulkRuleOptions.find(([value]) => value === condition)?.[1] ?? condition
  );
}

export function withoutColumnFilter(
  filters: ColumnFilters,
  key: FilterKey,
): ColumnFilters {
  const cleared: Record<FilterKey, Partial<ColumnFilters>> = {
    selection: { selection: [] },
    date: { dateFrom: "", dateTo: "" },
    amount: {
      expenseAmountRange: null,
      incomeAmountRange: null,
    },
    expenseAmount: {},
    incomeAmount: {},
    payment: { payment: [] },
    counterparty: { counterparty: [] },
    category: { category: [] },
    counterpartyAccount: { counterpartyAccount: [] },
    paymentAccount: { paymentAccount: [] },
    status: { status: [] },
    direction: { direction: [] },
    originalDirection: { originalDirection: [] },
    review: { review: [] },
  };
  return {
    ...filters,
    ...cleared[key],
    excluded: filters.excluded.filter((value) => value !== key),
  };
}

export function hasAmountFilter(filters: ColumnFilters) {
  return !!(
    filters.expenseAmountRange ||
    filters.incomeAmountRange ||
    filters.excluded.includes("expenseAmount") ||
    filters.excluded.includes("incomeAmount")
  );
}

export function matchesColumnFilters(
  row: Row,
  filters: ColumnFilters,
  refundKinds?: ReadonlyMap<string, RefundMatchKind>,
) {
  const matches = (key: FilterKey, active: boolean, result: boolean) =>
    !active || (filters.excluded.includes(key) ? !result : result);
  const amount = Number(row.amount);
  const range =
    amount < 0 ? filters.expenseAmountRange : filters.incomeAmountRange;
  const amountVisible = !filters.excluded.includes(
    amount < 0 ? "expenseAmount" : "incomeAmount",
  );
  const amountMatches = matches(
    "amount",
    !!range,
    Number.isFinite(amount) &&
      !!range &&
      Math.abs(amount) >= range[0] &&
      Math.abs(amount) <= range[1],
  );
  return (
    matches(
      "selection",
      !!filters.selection.length,
      filters.selection.includes(
        row.notImported
          ? "notImported"
          : row.selected
            ? "selected"
            : "unselected",
      ),
    ) &&
    matches(
      "date",
      !!(filters.dateFrom || filters.dateTo),
      (!filters.dateFrom || row.date >= filters.dateFrom) &&
        (!filters.dateTo || row.date <= filters.dateTo),
    ) &&
    amountVisible &&
    amountMatches &&
    matches(
      "payment",
      !!filters.payment.length,
      filters.payment.includes(row.payment),
    ) &&
    matches(
      "counterparty",
      !!filters.counterparty.length,
      (filters.counterpartyKind === "all" ||
        counterpartyKind(row) === filters.counterpartyKind) &&
        filters.counterparty.includes(row.payee),
    ) &&
    matches(
      "category",
      !!filters.category.length,
      filters.category.includes(row.category),
    ) &&
    matches(
      "counterpartyAccount",
      !!filters.counterpartyAccount.length,
      matchesAccountFilter(filters.counterpartyAccount, row.targetAccount),
    ) &&
    matches(
      "paymentAccount",
      !!filters.paymentAccount.length,
      matchesAccountFilter(filters.paymentAccount, row.sourceAccount),
    ) &&
    matches(
      "status",
      !!filters.status.length,
      filters.status.includes(row.status),
    ) &&
    matches(
      "direction",
      !!filters.direction.length,
      filters.direction.includes(flow(row).kind),
    ) &&
    matches(
      "originalDirection",
      !!filters.originalDirection.length,
      filters.originalDirection.includes(row.direction),
    ) &&
    matches(
      "review",
      !!filters.review.length,
      filters.review.some((review) => matchesReview(row, review, refundKinds)),
    )
  );
}

export function columnFilterLabels(filters: ColumnFilters) {
  const labels: { key: FilterKey; label: string; excluded: boolean }[] = [];
  const add = (key: FilterKey, label: string) =>
    labels.push({ key, label, excluded: filters.excluded.includes(key) });
  const selected = (
    options: readonly (readonly [string, string])[],
    values: string[],
  ) =>
    options
      .filter(([value]) => values.includes(value))
      .map(([, label]) => label)
      .join("、");
  if (filters.selection.length)
    add("selection", selected(selectionOptions, filters.selection));
  if (filters.dateFrom || filters.dateTo)
    add("date", `${filters.dateFrom || "最早"} 至 ${filters.dateTo || "至今"}`);
  if (filters.expenseAmountRange || filters.incomeAmountRange)
    add(
      "amount",
      [
        filters.expenseAmountRange &&
          `支出金额：${filters.expenseAmountRange.map((amount) => amount.toFixed(2)).join(" 至 ")}`,
        filters.incomeAmountRange &&
          `收入金额：${filters.incomeAmountRange.map((amount) => amount.toFixed(2)).join(" 至 ")}`,
      ]
        .filter(Boolean)
        .join("；"),
    );
  if (filters.excluded.includes("expenseAmount"))
    add("expenseAmount", "支出金额");
  if (filters.excluded.includes("incomeAmount"))
    add("incomeAmount", "收入金额");
  if (filters.payment.length)
    add(
      "payment",
      `${paymentMethodField}：${filters.payment.map(paymentMethodLabel).join("、")}`,
    );
  if (filters.counterparty.length)
    add(
      "counterparty",
      `交易对方${filters.counterpartyKind === "all" ? "" : `（${counterpartyKindLabels[filters.counterpartyKind]}）`}：${filters.counterparty.join("、")}`,
    );
  if (filters.category.length)
    add(
      "category",
      `交易分类：${filters.category.map((value) => value || "（空）").join("、")}`,
    );
  if (filters.counterpartyAccount.length)
    add(
      "counterpartyAccount",
      `分类账户：${formatAccountFilterValues(filters.counterpartyAccount)}`,
    );
  if (filters.paymentAccount.length)
    add(
      "paymentAccount",
      `资金账户：${formatAccountFilterValues(filters.paymentAccount)}`,
    );
  if (filters.status.length)
    add(
      "status",
      `交易状态：${filters.status.map((value) => value || "（空）").join("、")}`,
    );
  if (filters.direction.length)
    add("direction", `流向：${selected(directionOptions, filters.direction)}`);
  if (filters.originalDirection.length)
    add(
      "originalDirection",
      `收/支：${filters.originalDirection.map((value) => value || "（空）").join("、")}`,
    );
  if (filters.review.length)
    add("review", selected(reviewOptions, filters.review));
  return labels;
}

export function matchesAccountFilter(values: string[], account: string) {
  return values.some((value) =>
    value === unassignedAccountFilter ? !account : value === account,
  );
}

export function formatAccountFilterValues(values: string[]) {
  return values
    .map((value) => (value === unassignedAccountFilter ? "未绑定" : value))
    .join("、");
}

export function cycleCollapsedSort(
  current: CollapsedSort,
  key: Exclude<CollapsedSortKey, "bill">,
): CollapsedSort {
  if (current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return { key: "bill", direction: "asc" };
}

function groupSortValue(
  group: TransactionGroup,
  key: Exclude<CollapsedSortKey, "bill">,
) {
  const row = group.rows[0];
  return (
    key === "counterparty"
      ? row.payee
      : key === "payment"
        ? paymentMethodLabel(row.payment)
        : key === "counterpartyAccount"
          ? row.targetAccount
          : row.sourceAccount
  ).trim();
}

export function sortTransactionGroups(
  groups: TransactionGroup[],
  sort: CollapsedSort,
) {
  if (sort.key === "bill") return groups;
  const compare = (left: TransactionGroup, right: TransactionGroup) => {
    const leftValue = groupSortValue(left, sort.key);
    const rightValue = groupSortValue(right, sort.key);
    const valueOrder = leftValue.localeCompare(rightValue, "zh-CN", {
      numeric: true,
      sensitivity: "base",
    });
    if (valueOrder) return sort.direction === "asc" ? valueOrder : -valueOrder;
    return left.rows[0].line - right.rows[0].line;
  };
  return [...groups].sort(compare);
}
