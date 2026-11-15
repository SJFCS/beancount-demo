import type { Account, ClassificationFailure, Row, Suggestion } from "./types";

export function matchesAiResult(
  row: Row,
  kind: string,
  failureIds: ReadonlySet<string>,
) {
  const fallback =
    row.confidence !== undefined &&
    (row.aiFallback ||
      ["Expenses:Other", "Income:Other"].includes(row.targetAccount));
  const failed =
    !!fallback ||
    (failureIds.has(row.id) &&
      row.confidence === undefined &&
      (!row.targetAccount ||
        ["Expenses:Other", "Income:Other"].includes(row.targetAccount)));
  if (kind === "aiClassified") return row.confidence !== undefined && !fallback;
  if (kind === "aiUnclassified") return failed;
  if (kind === "aiUnprocessed")
    return (
      row.confidence === undefined &&
      !failed &&
      (!row.targetAccount ||
        ["Expenses:Other", "Income:Other"].includes(row.targetAccount))
    );
  return row.confidence !== undefined || failed;
}

export const classificationRunning = (
  progress: { phase: string } | undefined | null,
) => progress?.phase === "classifying" || progress?.phase === "saving";

export const needsClassification = (row: Row) =>
  row.selected &&
  !row.notImported &&
  !row.locked &&
  !row.committedAt &&
  row.confidence === undefined &&
  (!row.targetAccount ||
    ["Expenses:Other", "Income:Other"].includes(row.targetAccount));

export function classificationFailure(
  row: Row,
  reason: string,
  suggestion?: Suggestion,
): ClassificationFailure {
  return {
    id: row.id,
    line: row.line,
    date: row.date,
    payee: row.payee,
    description: row.description,
    amount: row.amount,
    targetAccount: row.targetAccount,
    reason,
    suggestedAccount: suggestion?.targetAccount,
    reasoning: suggestion?.reasoning ?? undefined,
  };
}

export function classificationResults(
  rows: Row[],
  accounts: Account[],
  suggestions: Suggestion[],
  requestError = "",
) {
  const patches = new Map<string, Partial<Row>>();
  const failures = new Map<string, ClassificationFailure>();
  const suggestionsByRow = new Map<string, Suggestion>();
  const available = (name: string, date: string) =>
    accounts.find(
      (account) =>
        account.name === name &&
        account.date <= date &&
        (!account.closed || account.closed > date) &&
        (!account.currencies.length || account.currencies.includes("CNY")),
    );
  for (const suggestion of suggestions) {
    const row = rows[suggestion.rowIndex];
    if (!row) continue;
    let reason = "";
    if (!suggestion.targetAccount) reason = "AI 未返回分类账户";
    else if (
      ["Expenses:Other", "Income:Other"].includes(suggestion.targetAccount)
    )
      reason = "AI 返回“其他”兜底账户，归入无有效分类";
    else if (!available(suggestion.targetAccount, row.date))
      reason = "AI 推荐的账户不在当前账本中或交易日不可用，未采用";
    else if (suggestion.targetAccount === row.sourceAccount)
      reason = "AI 推荐账户与资金账户相同，未采用";
    if (reason) {
      failures.set(row.id, classificationFailure(row, reason, suggestion));
      if (!suggestionsByRow.has(row.id))
        suggestionsByRow.set(row.id, suggestion);
    } else {
      suggestionsByRow.set(row.id, suggestion);
      patches.set(row.id, {
        targetAccount: suggestion.targetAccount,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning ?? "",
        aiFallback: undefined,
      });
    }
  }
  const succeededIds = [...patches.keys()];
  for (const row of rows) {
    if (patches.has(row.id)) continue;
    const suggestion = suggestionsByRow.get(row.id);
    const failure = requestError
      ? classificationFailure(row, `AI 请求失败：${requestError}`)
      : (failures.get(row.id) ??
        classificationFailure(row, "AI 未返回这笔交易的分类结果"));
    const fallbackName =
      suggestion &&
      ["Expenses:Other", "Income:Other"].includes(suggestion.targetAccount)
        ? suggestion.targetAccount
        : Number(row.amount) > 0
          ? "Income:Other"
          : "Expenses:Other";
    const fallback = available(fallbackName, row.date);
    if (fallback && fallback.name !== row.sourceAccount) {
      failure.fallbackAccount = fallback.name;
      patches.set(row.id, {
        targetAccount: fallback.name,
        confidence:
          suggestion && Number.isFinite(suggestion.confidence)
            ? suggestion.confidence
            : 0,
        reasoning: [
          `${failure.reason}；已归入 ${fallback.name}。`,
          suggestion?.targetAccount
            ? `AI 原建议：${suggestion.targetAccount}。`
            : "",
          suggestion?.reasoning
            ? `AI 分析：${suggestion.reasoning}`
            : "AI 未提供有效分类说明。",
        ]
          .filter(Boolean)
          .join(" "),
        aiFallback: true,
      });
    } else
      failure.reason += `；账本中没有交易日可用的 ${fallbackName}，请手动选择账户`;
    failures.set(row.id, failure);
  }
  return {
    patches,
    succeededIds,
    suggestionsByRow,
    failures: rows
      .filter((row) => !succeededIds.includes(row.id))
      .map((row) => failures.get(row.id)!),
  };
}
