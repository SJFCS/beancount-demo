import { useState, type ReactNode } from "react";
import type {
  PresetScope,
  QueryRule,
  QueryRuleResult,
  Rule,
  RuleResult,
} from "./types";
import { timeRangeWithDays } from "./date-range";
import { accountRoot, classifyFlow, type FlowKind } from "./flow";
import { presetExpressionText, rulePresetExpression } from "./model";
import { QueryPreviewBlock } from "./query-preview";

type MatchExample = RuleResult["examples"][number];
type PreviewPosting = NonNullable<MatchExample["postings"]>[number];

function amountSummary(
  postings: PreviewPosting[],
  kind: FlowKind,
): Array<{ amount: string; currency: string }> {
  const preferred =
    kind === "payment"
      ? new Set(["expenses"])
      : kind === "receipt"
        ? new Set(["income"])
        : new Set(["assets", "liabilities"]);
  const withAmount = postings.flatMap((posting) => {
    const value = Math.abs(Number(posting.amount));
    return Number.isFinite(value) && value > 0 ? [{ ...posting, value }] : [];
  });
  const preferredPostings = withAmount.filter((posting) =>
    preferred.has(accountRoot(posting.account)),
  );
  const candidates = preferredPostings.length ? preferredPostings : withAmount;
  const byCurrency = new Map<string, { amount: string; value: number }>();
  for (const posting of candidates) {
    const current = byCurrency.get(posting.currency);
    if (!current || posting.value > current.value)
      byCurrency.set(posting.currency, {
        amount: posting.amount.replace(/^[+-]/u, ""),
        value: posting.value,
      });
  }
  return [...byCurrency.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, item]) => ({ amount: item.amount, currency }));
}

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const values = new Set(right);
  return left.every((item) => values.has(item));
}

function changedMetaKeys(example: MatchExample): string[] {
  return [
    ...new Set([
      ...Object.keys(example.originalMeta),
      ...Object.keys(example.meta),
    ]),
  ]
    .filter((key) => example.originalMeta[key] !== example.meta[key])
    .sort((left, right) => left.localeCompare(right));
}

function allMetaKeys(example: MatchExample): string[] {
  return [
    ...new Set([
      ...Object.keys(example.originalMeta),
      ...Object.keys(example.meta),
    ]),
  ].sort((left, right) => left.localeCompare(right));
}

function changedFields(example: MatchExample): string[] {
  const fields: string[] = [];
  if (example.payee !== example.originalPayee) fields.push("收款人");
  if (example.narration !== (example.originalNarration ?? example.narration))
    fields.push("摘要");
  if (!sameMembers(example.tags, example.originalTags)) fields.push("标签");
  if (changedMetaKeys(example).length) fields.push("元数据");
  if (
    !sameMembers(example.originalAccounts ?? example.accounts, example.accounts)
  )
    fields.push("账户");
  return fields;
}

function changedFieldCount(example: MatchExample): number {
  return (
    (example.payee !== example.originalPayee ? 1 : 0) +
    (example.narration !== (example.originalNarration ?? example.narration)
      ? 1
      : 0) +
    (sameMembers(example.tags, example.originalTags) ? 0 : 1) +
    changedMetaKeys(example).length +
    (sameMembers(example.originalAccounts ?? example.accounts, example.accounts)
      ? 0
      : 1)
  );
}

function DiffRow({
  label,
  before,
  after,
  changed,
}: {
  label: ReactNode;
  before: ReactNode;
  after: ReactNode;
  changed: boolean;
}) {
  return (
    <div className={`fmp-diff-row${changed ? " is-changed" : ""}`} role="row">
      <div className="fmp-diff-field" role="rowheader">
        <span>{label}</span>
        {changed ? <em>差异</em> : null}
      </div>
      <div
        className={`fmp-diff-cell${changed ? " is-removed" : ""}`}
        role="cell"
      >
        {before}
      </div>
      <div className={`fmp-diff-cell${changed ? " is-added" : ""}`} role="cell">
        {after}
      </div>
    </div>
  );
}

function Tags({
  tags,
  original,
  updated,
  side,
  onlyDifferences,
}: {
  tags: string[];
  original: Set<string>;
  updated: Set<string>;
  side: "before" | "after";
  onlyDifferences: boolean;
}) {
  const visible = onlyDifferences
    ? tags.filter((tag) =>
        side === "before" ? !updated.has(tag) : !original.has(tag),
      )
    : tags;
  if (visible.length === 0) return <span className="fmp-diff-empty">—</span>;
  return (
    <span className="fmp-diff-tags">
      {visible.map((tag) => (
        <span
          className={`fmp-diff-tag${
            !original.has(tag)
              ? " is-added"
              : !updated.has(tag)
                ? " is-removed"
                : ""
          }`}
          key={tag}
        >
          #{tag}
        </span>
      ))}
    </span>
  );
}

function Accounts({
  accounts,
  other,
  side,
  onlyDifferences,
}: {
  accounts: string[];
  other: Set<string>;
  side: "before" | "after";
  onlyDifferences: boolean;
}) {
  const visible = onlyDifferences
    ? accounts.filter((account) => !other.has(account))
    : accounts;
  if (visible.length === 0) return <span className="fmp-diff-empty">—</span>;
  return (
    <span className="fmp-diff-accounts">
      {visible.map((account) => (
        <span
          className={`fmp-diff-account${
            !other.has(account)
              ? side === "before"
                ? " is-removed"
                : " is-added"
              : ""
          }`}
          key={account}
        >
          {account}
        </span>
      ))}
    </span>
  );
}

function TransactionDiff({
  example,
  onlyDifferences,
}: {
  example: MatchExample;
  onlyDifferences: boolean;
}) {
  const originalTags = new Set(example.originalTags);
  const updatedTags = new Set(example.tags);
  const originalAccounts = example.originalAccounts ?? example.accounts;
  const updatedAccounts = example.accounts;
  const originalAccountSet = new Set(originalAccounts);
  const updatedAccountSet = new Set(updatedAccounts);
  const flow = classifyFlow(originalAccounts);
  const postings = example.postings ?? [];
  const amounts = amountSummary(postings, flow.kind);
  const amountBreakdown = postings
    .map(
      (posting) => `${posting.account}  ${posting.amount} ${posting.currency}`,
    )
    .join("\n");
  const tagsChanged = !sameMembers(example.tags, example.originalTags);
  const accountsChanged = !sameMembers(originalAccounts, updatedAccounts);
  const payeeChanged = example.payee !== example.originalPayee;
  const originalNarration = example.originalNarration ?? example.narration;
  const narrationChanged = example.narration !== originalNarration;
  const metaKeys = onlyDifferences
    ? changedMetaKeys(example)
    : allMetaKeys(example);
  const changes = changedFields(example);
  const count = changedFieldCount(example);
  const hasRows =
    !onlyDifferences ||
    payeeChanged ||
    narrationChanged ||
    tagsChanged ||
    metaKeys.length > 0 ||
    accountsChanged;

  return (
    <article className={`fmp-diff-record is-${flow.kind}`}>
      <header className="fmp-diff-record-head">
        <div>
          <div className="fmp-diff-record-meta">
            <time>{example.date}</time>
            <span className={`fmp-flow-badge is-${flow.kind}`}>
              {flow.label}
            </span>
            <div
              className={`fmp-diff-amounts${amounts.length ? "" : " is-empty"}`}
              title={amountBreakdown || "交易未提供金额"}
            >
              {amounts.length ? (
                amounts.map((item) => (
                  <span className="fmp-diff-amount" key={item.currency}>
                    <strong>{item.amount}</strong>
                    <small>{item.currency}</small>
                  </span>
                ))
              ) : (
                <span>金额未提供</span>
              )}
            </div>
          </div>
          <strong>{originalNarration || "（无摘要）"}</strong>
          <span>{changes.length ? changes.join(" · ") : "没有字段变化"}</span>
        </div>
        <span className={count ? "fmp-diff-count" : "fmp-diff-count is-zero"}>
          {count ? `${count} 处差异` : "无差异"}
        </span>
      </header>
      {hasRows ? (
        <div className="fmp-diff-table" role="table" aria-label="交易差异">
          <div className="fmp-diff-head" role="row">
            <span role="columnheader">字段</span>
            <span role="columnheader">原来</span>
            <span role="columnheader">添加后</span>
          </div>
          {!onlyDifferences || payeeChanged ? (
            <DiffRow
              label="收款人"
              before={
                example.originalPayee || (
                  <span className="fmp-diff-empty">（无收款人）</span>
                )
              }
              after={
                example.payee || (
                  <span className="fmp-diff-empty">（无收款人）</span>
                )
              }
              changed={payeeChanged}
            />
          ) : null}
          {!onlyDifferences || narrationChanged ? (
            <DiffRow
              label="摘要"
              before={
                originalNarration || (
                  <span className="fmp-diff-empty">（无摘要）</span>
                )
              }
              after={
                example.narration || (
                  <span className="fmp-diff-empty">（无摘要）</span>
                )
              }
              changed={narrationChanged}
            />
          ) : null}
          {!onlyDifferences || tagsChanged ? (
            <DiffRow
              label="标签"
              before={
                <Tags
                  tags={example.originalTags}
                  original={originalTags}
                  updated={updatedTags}
                  side="before"
                  onlyDifferences={onlyDifferences}
                />
              }
              after={
                <Tags
                  tags={example.tags}
                  original={originalTags}
                  updated={updatedTags}
                  side="after"
                  onlyDifferences={onlyDifferences}
                />
              }
              changed={tagsChanged}
            />
          ) : null}
          {metaKeys.map((key) => {
            const before = example.originalMeta[key];
            const after = example.meta[key];
            const changed = before !== after;
            return (
              <DiffRow
                key={key}
                label={
                  <>
                    元数据 <code>{key}</code>
                  </>
                }
                before={
                  before === undefined ? (
                    <span className="fmp-diff-empty">—</span>
                  ) : (
                    before || <span className="fmp-diff-empty">（空）</span>
                  )
                }
                after={
                  after === undefined ? (
                    <span className="fmp-diff-empty">（已移除）</span>
                  ) : (
                    after || <span className="fmp-diff-empty">（空）</span>
                  )
                }
                changed={changed}
              />
            );
          })}
          {!onlyDifferences || accountsChanged ? (
            <DiffRow
              label="账户"
              before={
                <Accounts
                  accounts={originalAccounts}
                  other={updatedAccountSet}
                  side="before"
                  onlyDifferences={onlyDifferences}
                />
              }
              after={
                <Accounts
                  accounts={updatedAccounts}
                  other={originalAccountSet}
                  side="after"
                  onlyDifferences={onlyDifferences}
                />
              }
              changed={accountsChanged}
            />
          ) : null}
        </div>
      ) : (
        <div className="fmp-diff-none">该交易没有可见差异。</div>
      )}
    </article>
  );
}

export function PreviewSection({
  activeTab,
  onTabChange,
  rules,
  results,
  queries = [],
  queryResults,
  pending = false,
}: {
  activeTab: PresetScope;
  onTabChange(tab: PresetScope): void;
  rules: Rule[];
  results: Map<string, RuleResult>;
  queries?: QueryRule[];
  queryResults: Map<string, QueryRuleResult>;
  pending?: boolean;
}) {
  const [ruleDiffModes, setRuleDiffModes] = useState<Record<string, boolean>>(
    {},
  );

  return (
    <section
      className="fmp-preview-section"
      aria-labelledby="fmp-preview-title"
    >
      <header className="fmp-preview-section-head">
        <div>
          <span
            className={`fmp-section-kicker${activeTab === "query" ? " is-query" : ""}`}
          >
            {activeTab === "mapping"
              ? "Field-level diff"
              : "Recurring & merchant rollup"}
          </span>
          <h2 id="fmp-preview-title">Preview</h2>
          <p>
            {activeTab === "mapping"
              ? "查看 Mapping Rules 执行前后的交易字段差异；Preset 命中数仍按原始交易计算。"
              : "查看 Query Rules 在映射后交易流上的分组、周期与年度估算。"}
          </p>
        </div>
        <div className="fmp-preview-tools">
          {pending ? (
            <span className="fmp-save-guard">正在更新预览…</span>
          ) : null}
        </div>
      </header>
      <div className="fmp-tabs" role="tablist" aria-label="预览类型">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "mapping"}
          className={`fmp-tab${activeTab === "mapping" ? " is-active" : ""}`}
          onClick={() => onTabChange("mapping")}
        >
          Mapping Preview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "query"}
          className={`fmp-tab is-query${activeTab === "query" ? " is-active" : ""}`}
          onClick={() => onTabChange("query")}
        >
          Query Preview
        </button>
      </div>
      {activeTab === "mapping" ? (
        <div
          className="fmp-preview-rule-list"
          role="tabpanel"
          aria-label="Mapping Preview"
        >
          {rules.length === 0 ? (
            <div className="fmp-empty">
              添加映射规则后，这里会显示运行时差异。
            </div>
          ) : (
            rules.map((rule, index) => {
              const result = results.get(rule.id);
              const examples = result?.examples ?? [];
              const onlyDifferences = ruleDiffModes[rule.id] ?? true;
              return (
                <details
                  className={`fmp-preview-rule${
                    rule.enabled ? "" : " is-disabled"
                  }`}
                  key={rule.id}
                >
                  <summary>
                    <span className="fmp-preview-rule-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="fmp-preview-rule-title">
                      <strong>
                        {rule.name || result?.ruleName || rule.id}
                      </strong>
                      <small>
                        {(() => {
                          const expression = rulePresetExpression(rule);
                          return expression
                            ? `preset: ${presetExpressionText(expression)}`
                            : `时间范围: ${timeRangeWithDays(rule.time)}`;
                        })()}{" "}
                        · {rule.enabled ? "已启用" : "已暂停"}
                      </small>
                    </span>
                    <span
                      className={`fmp-preview-rule-count${
                        result?.matched ? " is-hit" : ""
                      }`}
                    >
                      {result?.matched ?? 0} 笔
                    </span>
                    <div
                      className="fmp-preview-rule-tools"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div
                        className="fmp-preview-mode"
                        role="group"
                        aria-label={`${rule.name || result?.ruleName || rule.id} 预览字段`}
                      >
                        <button
                          type="button"
                          className={onlyDifferences ? "is-active" : ""}
                          aria-pressed={onlyDifferences}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setRuleDiffModes((current) => ({
                              ...current,
                              [rule.id]: true,
                            }));
                          }}
                        >
                          只看差异
                        </button>
                        <button
                          type="button"
                          className={!onlyDifferences ? "is-active" : ""}
                          aria-pressed={!onlyDifferences}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setRuleDiffModes((current) => ({
                              ...current,
                              [rule.id]: false,
                            }));
                          }}
                        >
                          全部字段
                        </button>
                      </div>
                    </div>
                  </summary>
                  <div className="fmp-preview-rule-body">
                    {examples.length ? (
                      <>
                        <div className="fmp-diff-list">
                          {examples.map((example) => (
                            <TransactionDiff
                              key={`${example.directiveIndex}-${example.date}-${example.originalPayee}`}
                              example={example}
                              onlyDifferences={onlyDifferences}
                            />
                          ))}
                        </div>
                        {result && result.matched > examples.length ? (
                          <div className="fmp-preview-more">
                            仅展示前 {examples.length} 笔，共 {result.matched}{" "}
                            笔命中。
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="fmp-preview-empty">
                        {rule.enabled
                          ? "当前时间范围内没有可预览的交易。"
                          : "规则已暂停，不会产生运行时变化。"}
                      </div>
                    )}
                  </div>
                </details>
              );
            })
          )}
        </div>
      ) : (
        <div
          className="fmp-query-preview-section"
          role="tabpanel"
          aria-label="Query Preview"
        >
          <QueryPreviewBlock queries={queries} results={queryResults} />
        </div>
      )}
    </section>
  );
}
