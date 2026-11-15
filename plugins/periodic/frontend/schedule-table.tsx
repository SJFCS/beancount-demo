import { useMemo, useState } from "react";
import { Icon, PanelHeading } from "./components";
import { KIND_LABELS, formatMoney, isFuture, rowsForCurrency } from "./model";
import type { ScheduleRow } from "./types";

const PAGE_SIZE = 72;

export function ScheduleTable({
  rows,
  currency,
}: {
  rows: ScheduleRow[];
  currency: string;
}) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const filtered = useMemo(
    () => rowsForCurrency(rows, currency),
    [rows, currency],
  );
  const visible = filtered.slice(0, limit);
  return (
    <section className="pr-panel pr-schedule-panel">
      <PanelHeading
        eyebrow="In-memory entries"
        title="分期明细"
        description="每一行对应当前全局生成策略下物化的内存分录；账本文件不会被写入。"
        actions={
          <span className="pr-table-count">
            {filtered.length} 期 · {currency}
          </span>
        }
      />
      {filtered.length === 0 ? (
        <div className="pr-empty pr-empty-compact">
          <Icon name="ledger" size={24} />
          <p>当前币种还没有可计算的分期。</p>
        </div>
      ) : (
        <>
          <div className="pr-table-scroll">
            <table>
              <caption className="pr-sr-only">
                摊销与折旧分期明细，币种 {currency}
              </caption>
              <thead>
                <tr>
                  <th scope="col">日期</th>
                  <th scope="col">规则</th>
                  <th scope="col">期次</th>
                  <th scope="col">来源账户</th>
                  <th scope="col">目标账户</th>
                  <th scope="col" className="is-number">
                    本期金额
                  </th>
                  <th scope="col" className="is-number">
                    期末余额
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <span className="pr-date">
                        {row.date}
                        {row.pending ? (
                          <i className="is-pending">未入账</i>
                        ) : isFuture(row.date) ? (
                          <i>计划</i>
                        ) : null}
                      </span>
                    </td>
                    <td>
                      <span className="pr-rule-cell">
                        <b>{row.ruleName}</b>
                        <small data-kind={row.kind}>
                          {KIND_LABELS[row.kind]}
                        </small>
                      </span>
                    </td>
                    <td>
                      {row.period}/{row.periodCount}
                    </td>
                    <td>
                      <code>{row.sourceAccount}</code>
                    </td>
                    <td>
                      <code>{row.expenseAccount}</code>
                    </td>
                    <td className="is-number is-strong">
                      {formatMoney(row.amount, row.currency)}
                    </td>
                    <td className="is-number">
                      {formatMoney(row.closingBalance, row.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visible.length < filtered.length ? (
            <div className="pr-load-more">
              <button
                type="button"
                className="pr-btn is-ghost"
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
              >
                再显示 {Math.min(PAGE_SIZE, filtered.length - visible.length)}{" "}
                期
              </button>
              <span>
                已显示 {visible.length} / {filtered.length}
              </span>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
