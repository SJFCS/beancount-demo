import { Fragment, useId, useState } from "react";
import { dateRangeWithDays, timeRangeWithDays } from "./date-range";
import { classifyFlow } from "./flow";
import { presetExpressionText, queryPresetExpression } from "./model";
import type {
  QueryAmount,
  QueryFrequency,
  QueryGroup,
  QueryOccurrence,
  QueryRule,
  QueryRuleResult,
  QueryTable,
  QueryTableRow,
} from "./types";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function frequencyLabel(frequency: QueryFrequency): string {
  const labels: Record<QueryFrequency, string> = {
    daily: "每日",
    weekly: "每周",
    biweekly: "每两周",
    monthly: "每月",
    bimonthly: "每两月",
    quarterly: "每季度",
    semiannual: "每半年",
    yearly: "每年",
    custom: "自定义间隔",
    unknown: "周期未知",
  };
  return labels[frequency];
}

function periodSourceLabel(
  group: Pick<QueryGroup, "periodSource" | "regularity">,
): string {
  if (group.periodSource === "fixed") return "固定周期";
  if (group.periodSource === "metadata") return "周期元数据";
  if (group.periodSource === "inferred")
    return group.regularity !== null && group.regularity < 0.5
      ? "日期推断 · 波动较大"
      : "日期推断";
  return "需要至少两次不同日期";
}

function amountText(group: QueryGroup): string {
  const annual = group.amounts.filter((amount) => amount.annual !== null);
  if (annual.length === 0) return "暂不能年化";
  return annual
    .map((amount) => `${formatNumber(amount.annual ?? 0)} ${amount.currency}`)
    .join("\n");
}

function groupIntervalText(
  group: Pick<QueryGroup, "intervalDays" | "frequency">,
): string {
  if (group.intervalDays === null) return frequencyLabel(group.frequency);
  return `约 ${formatNumber(group.intervalDays)} 天 · ${frequencyLabel(group.frequency)}`;
}

function amountLines(amounts: QueryAmount[], mode: "total" | "annual") {
  if (amounts.length === 0) return "—";
  return amounts
    .map((amount) => {
      const value = mode === "annual" ? amount.annual : amount.total;
      return value === null
        ? `${amount.currency} —`
        : `${formatNumber(value)} ${amount.currency}`;
    })
    .join("\n");
}

function tableAmountText(table: QueryTable | undefined): string {
  if (!table || table.rows.length === 0) return "—";
  const totals = new Map<string, number>();
  for (const row of table.rows) {
    for (const amount of row.amounts) {
      totals.set(
        amount.currency,
        (totals.get(amount.currency) ?? 0) + amount.total,
      );
    }
  }
  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amount]) => `${formatNumber(amount)} ${currency}`)
    .join("\n");
}

function groupAmountText(groups: QueryGroup[] | undefined): string {
  if (!groups || groups.length === 0) return "—";
  const totals = new Map<string, number>();
  for (const group of groups) {
    for (const amount of group.amounts) {
      totals.set(
        amount.currency,
        (totals.get(amount.currency) ?? 0) + amount.total,
      );
    }
  }
  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amount]) => `${formatNumber(amount)} ${currency}`)
    .join("\n");
}

function OccurrenceList({
  occurrences,
  matched,
  truncated,
}: {
  occurrences: QueryOccurrence[];
  matched: number;
  truncated: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const detailsId = useId();

  function toggleOccurrence(directiveIndex: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(directiveIndex)) next.delete(directiveIndex);
      else next.add(directiveIndex);
      return next;
    });
  }

  return (
    <>
      <div className="fmp-query-occurrence-head">
        交易记录
        <span>
          {occurrences.length}
          {truncated ? ` / ${matched}` : ""} 笔
        </span>
      </div>
      <div className="fmp-query-occurrences">
        {occurrences.map((occurrence) => {
          const flow = classifyFlow(occurrence.accounts);
          const isExpanded = expanded.has(occurrence.directiveIndex);
          const detailId = `${detailsId}-${occurrence.directiveIndex}`;
          const postings = occurrence.postings ?? [];
          const meta = Object.entries(occurrence.meta).sort(([left], [right]) =>
            left.localeCompare(right),
          );
          const title =
            occurrence.payee || occurrence.narration || "未分类交易";
          return (
            <div
              className={`fmp-query-occurrence is-${flow.kind}${isExpanded ? " is-expanded" : ""}`}
              key={occurrence.directiveIndex}
            >
              <button
                type="button"
                className="fmp-query-occurrence-toggle"
                aria-expanded={isExpanded}
                aria-controls={detailId}
                aria-label={`${isExpanded ? "收起" : "查看"} ${title} 交易详情`}
                onClick={() => toggleOccurrence(occurrence.directiveIndex)}
              >
                <time>{occurrence.date}</time>
                <span className="fmp-query-occurrence-copy">
                  <span className="fmp-query-occurrence-title">
                    <strong>{title}</strong>
                    <span className={`fmp-query-flow-badge is-${flow.kind}`}>
                      {flow.label}
                    </span>
                  </span>
                  {occurrence.payee && occurrence.narration ? (
                    <small>{occurrence.narration}</small>
                  ) : null}
                  {occurrence.tags.length ? (
                    <span className="fmp-query-tags">
                      {occurrence.tags.map((tag) => (
                        <em key={tag}>#{tag}</em>
                      ))}
                    </span>
                  ) : null}
                </span>
                <span className="fmp-query-occurrence-amount">
                  {occurrence.amounts.length ? (
                    occurrence.amounts.map((amount) => (
                      <span key={amount.currency}>
                        {formatNumber(amount.amount)}{" "}
                        <small>{amount.currency}</small>
                      </span>
                    ))
                  ) : (
                    <small>金额未知</small>
                  )}
                </span>
                <svg
                  className="fmp-query-occurrence-chevron"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="m3.5 6 4.5 4 4.5-4" />
                </svg>
              </button>
              {isExpanded ? (
                <div className="fmp-query-occurrence-detail" id={detailId}>
                  <div className="fmp-query-occurrence-detail-head">
                    <strong>交易详情</strong>
                    <small>交易 #{occurrence.directiveIndex}</small>
                  </div>
                  <div className="fmp-query-detail-table-wrap">
                    <table
                      className="fmp-query-detail-table"
                      aria-label="账户金额与单位成本"
                    >
                      <thead>
                        <tr>
                          <th scope="col">账户</th>
                          <th scope="col">金额</th>
                          <th scope="col">单位成本 / 报价</th>
                        </tr>
                      </thead>
                      <tbody>
                        {postings.length ? (
                          postings.map((posting, index) => (
                            <tr key={`${posting.account}-${index}`}>
                              <th scope="row">{posting.account}</th>
                              <td className="fmp-query-detail-posting-amount">
                                <strong>{posting.amount}</strong>{" "}
                                <small>{posting.currency}</small>
                              </td>
                              <td className="fmp-query-detail-quote">
                                {posting.cost ? (
                                  <span className="fmp-query-detail-quote-line">
                                    <em>成本</em>
                                    <span>
                                      1 {posting.currency} ={" "}
                                      <strong>{posting.cost.number}</strong>{" "}
                                      {posting.cost.currency}
                                    </span>
                                    {posting.cost.date || posting.cost.label ? (
                                      <small>
                                        {[
                                          posting.cost.date
                                            ? `取得 ${posting.cost.date}`
                                            : "",
                                          posting.cost.label
                                            ? `批次 ${posting.cost.label}`
                                            : "",
                                        ]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </small>
                                    ) : null}
                                  </span>
                                ) : null}
                                {posting.price ? (
                                  <span className="fmp-query-detail-quote-line">
                                    <em>报价</em>
                                    <span>
                                      1 {posting.currency} ={" "}
                                      <strong>{posting.price.number}</strong>{" "}
                                      {posting.price.currency}
                                    </span>
                                  </span>
                                ) : null}
                                {!posting.cost && !posting.price ? (
                                  <span className="fmp-query-detail-empty">
                                    未标注
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="fmp-query-detail-empty" colSpan={3}>
                              无账户金额信息
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="fmp-query-detail-section">
                    <span className="fmp-query-detail-label">元数据</span>
                    {meta.length ? (
                      <table
                        className="fmp-query-detail-meta-table"
                        aria-label="交易元数据"
                      >
                        <tbody>
                          {meta.map(([key, value]) => (
                            <tr key={key}>
                              <th scope="row">{key}</th>
                              <td>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span className="fmp-query-detail-empty">无元数据</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {truncated ? (
        <div className="fmp-query-more">
          为控制页面大小，仅展示前 {occurrences.length} 笔；分组统计使用全部{" "}
          {matched} 笔交易。
        </div>
      ) : null}
    </>
  );
}

function GroupDetails({ group }: { group: QueryGroup }) {
  return (
    <details className="fmp-query-group">
      <summary>
        <span className="fmp-query-group-main">
          <strong>{group.label}</strong>
          <small>
            {dateRangeWithDays(group.firstDate, group.lastDate)} ·{" "}
            {group.matched} 笔
          </small>
        </span>
        <span className="fmp-query-frequency">
          <b>{groupIntervalText(group)}</b>
          <small>{periodSourceLabel(group)}</small>
        </span>
        <span className="fmp-query-group-annual">
          <small>预计年度</small>
          <strong>{amountText(group)}</strong>
        </span>
      </summary>
      <div className="fmp-query-group-body">
        <div className="fmp-query-amounts">
          {group.amounts.map((amount) => (
            <div className="fmp-query-amount" key={amount.currency}>
              <span>{amount.currency}</span>
              <strong>
                年均{" "}
                {amount.annual === null ? "—" : formatNumber(amount.annual)}
              </strong>
              <small>
                单次约 {formatNumber(amount.average)} · 累计{" "}
                {formatNumber(amount.total)} · {amount.occurrences} 次
              </small>
            </div>
          ))}
          {group.amounts.length === 0 ? (
            <div className="fmp-query-note">命中交易没有可计算的金额。</div>
          ) : null}
        </div>
        {group.periodSource === "inferred" &&
        group.regularity !== null &&
        group.regularity < 0.5 ? (
          <div className="fmp-query-warning">
            日期间隔波动较大，年化金额仅作趋势参考。
          </div>
        ) : null}
        <OccurrenceList
          occurrences={group.occurrences}
          matched={group.matched}
          truncated={group.occurrencesTruncated}
        />
      </div>
    </details>
  );
}

function TableCell({
  row,
  columnId,
}: {
  row: QueryTableRow;
  columnId: string;
}) {
  const cell = row.cells[columnId];
  if (!cell || cell.values.length === 0)
    return <span className="fmp-query-table-empty">—</span>;
  const visible = cell.values.slice(0, 3);
  return (
    <span className="fmp-query-table-values" title={cell.values.join(" · ")}>
      {visible.map((value) => (
        <span key={value}>{value}</span>
      ))}
      {cell.total > visible.length ? (
        <span className="fmp-query-table-more">
          +{cell.total - visible.length}
        </span>
      ) : null}
    </span>
  );
}

function QueryTableResult({
  query,
  table,
}: {
  query: QueryRule;
  table: QueryTable;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const tableId = `fmp-query-table-${query.id}`;
  const columns = table.columns;
  const cycleEnabled = query.period !== "none";

  function toggleRow(key: string) {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (table.rows.length === 0) {
    return (
      <div className="fmp-preview-empty">
        当前查询范围没有命中交易。检查 Preset、时间范围或分组表头。
      </div>
    );
  }

  return (
    <div className="fmp-query-table-wrap">
      <table
        className="fmp-query-table"
        aria-label={`${query.name || query.id} 分组结果`}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={
                  table.groupByColumns.includes(column.id)
                    ? "is-group"
                    : undefined
                }
              >
                <span>{column.label}</span>
                {table.groupByColumns.includes(column.id) ? (
                  <small>分组</small>
                ) : null}
              </th>
            ))}
            <th scope="col">交易</th>
            <th scope="col">日期范围</th>
            <th scope="col">花费</th>
            {cycleEnabled ? (
              <>
                <th scope="col">周期</th>
                <th scope="col">预计年度</th>
              </>
            ) : null}
            <th scope="col">
              <span className="fmp-sr-only">交易明细</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => {
            const expanded = expandedRows.has(row.key);
            const detailId = `${tableId}-row-${rowIndex}`;
            return (
              <Fragment key={row.key}>
                <tr className={expanded ? "is-expanded" : undefined}>
                  {columns.map((column, columnIndex) =>
                    columnIndex === 0 ? (
                      <th scope="row" key={column.id}>
                        <TableCell row={row} columnId={column.id} />
                      </th>
                    ) : (
                      <td key={column.id}>
                        <TableCell row={row} columnId={column.id} />
                      </td>
                    ),
                  )}
                  <td className="fmp-query-table-count">{row.matched} 笔</td>
                  <td>{dateRangeWithDays(row.firstDate, row.lastDate)}</td>
                  <td className="fmp-query-table-amount">
                    {amountLines(row.amounts, "total")}
                  </td>
                  {cycleEnabled ? (
                    <>
                      <td className="fmp-query-table-cycle">
                        <strong>{groupIntervalText(row)}</strong>
                        <small>{periodSourceLabel(row)}</small>
                      </td>
                      <td className="fmp-query-table-amount">
                        {amountLines(row.amounts, "annual")}
                      </td>
                    </>
                  ) : null}
                  <td>
                    <button
                      type="button"
                      className="fmp-query-table-toggle"
                      aria-expanded={expanded}
                      aria-controls={detailId}
                      onClick={() => toggleRow(row.key)}
                    >
                      {expanded ? "收起" : "明细"}
                    </button>
                  </td>
                </tr>
                {expanded ? (
                  <tr className="fmp-query-table-detail" id={detailId}>
                    <td colSpan={columns.length + 4 + (cycleEnabled ? 2 : 0)}>
                      <OccurrenceList
                        occurrences={row.occurrences}
                        matched={row.matched}
                        truncated={row.occurrencesTruncated}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QueryPreviewCard({
  query,
  index,
  result,
}: {
  query: QueryRule;
  index: number;
  result?: QueryRuleResult;
}) {
  const [expanded, setExpanded] = useState(false);
  const expression = queryPresetExpression(query);
  const table = result?.table;
  const cycleEnabled = query.period !== "none";
  const annualTotals =
    result?.annualTotals
      .map((item) => `${formatNumber(item.amount)} ${item.currency}`)
      .join("\n") || "暂不能估算";
  const annualLabel =
    result && result.unannualizedGroups > 0
      ? `${annualTotals}\n（另有 ${result.unannualizedGroups} 组无法年化）`
      : annualTotals;
  const spendingLabel = table
    ? tableAmountText(table)
    : groupAmountText(result?.groups);
  const totalLabel = cycleEnabled ? annualLabel : spendingLabel;
  const groupCount = table ? table.rows.length : (result?.groups.length ?? 0);
  return (
    <article
      className={`fmp-query-preview-rule${query.enabled ? "" : " is-disabled"}${expanded ? " is-expanded" : ""}`}
    >
      <button
        type="button"
        className="fmp-query-preview-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="fmp-preview-rule-index">
          Q{String(index + 1).padStart(2, "0")}
        </span>
        <span className="fmp-preview-rule-title">
          <strong>{query.name || result?.ruleName || query.id}</strong>
          <small>
            {expression
              ? `preset: ${presetExpressionText(expression)}`
              : `时间范围: ${timeRangeWithDays(query.time)}`}{" "}
            · {table ? "分组查询" : "周期分析"} ·{" "}
            {query.enabled ? "已启用" : "已暂停"}
          </small>
        </span>
        <span className="fmp-query-preview-total">
          <span className="fmp-query-preview-metric">
            <small>{cycleEnabled ? "预计一年" : "交易合计"}</small>
            <strong>{totalLabel}</strong>
          </span>
          {cycleEnabled ? (
            <span className="fmp-query-preview-metric is-spending">
              <small>交易合计</small>
              <strong>{spendingLabel}</strong>
            </span>
          ) : null}
        </span>
        <span
          className={`fmp-preview-rule-count${
            result?.matched ? " is-hit" : ""
          }`}
        >
          {groupCount} 组{result?.matched ? ` · ${result.matched} 笔` : ""}
        </span>
      </button>
      {expanded ? (
        <div className="fmp-query-preview-body">
          {result?.matched ? (
            table ? (
              <QueryTableResult query={query} table={table} />
            ) : (
              <div className="fmp-query-groups">
                {result.groups.map((group) => (
                  <GroupDetails group={group} key={group.key} />
                ))}
              </div>
            )
          ) : (
            <div className="fmp-preview-empty">
              {query.enabled
                ? "当前查询范围没有命中交易。检查 Preset 或时间范围。"
                : "查询已暂停，不会计算查询结果。"}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function QueryPreviewBlock({
  queries,
  results,
}: {
  queries: QueryRule[];
  results: Map<string, QueryRuleResult>;
}) {
  if (queries.length === 0) {
    return (
      <div className="fmp-query-preview-empty">
        添加查询规则后，这里会按选择的表头分组，并按需推断周期与年度金额。
      </div>
    );
  }
  return (
    <div className="fmp-query-preview-list">
      {queries.map((query, index) => (
        <QueryPreviewCard
          query={query}
          index={index}
          result={results.get(query.id)}
          key={query.id}
        />
      ))}
    </div>
  );
}
