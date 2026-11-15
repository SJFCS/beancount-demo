import { useState } from "react";
import { BarChart } from "../charts";
import { formatMoney } from "../format";
import type { Report } from "../types";
import { Empty, Panel } from "./ui";

export function CashFlowView({
  report,
  currency,
}: {
  report: Report;
  currency: string;
}) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const rows = report.cashFlows.table;
  const chart = report.cashFlows.chart[period];
  const external = rows
    .filter((row) => !row.isDividend)
    .reduce((sum, row) => sum + row.amount, 0);
  const dividends = rows
    .filter((row) => row.isDividend)
    .reduce((sum, row) => sum + row.amount, 0);
  const investmentNames = new Map(
    report.investments.map((item) => [item.id, item.name]),
  );
  return (
    <div className="pf-stack">
      <Panel
        title="现金流"
        description="买入为负、卖出和分红为正；若配置了现金账户，以现金账户的记账金额为准。"
        action={
          <div className="pf-segment" role="group" aria-label="现金流期间">
            <button
              type="button"
              aria-pressed={period === "monthly"}
              onClick={() => setPeriod("monthly")}
            >
              月度
            </button>
            <button
              type="button"
              aria-pressed={period === "yearly"}
              onClick={() => setPeriod("yearly")}
            >
              年度
            </button>
          </div>
        }
      >
        <div
          className="pf-kpis"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          <article className="pf-kpi" data-tone="teal">
            <span>外部现金流净额</span>
            <strong>{formatMoney(external, currency)}</strong>
            <small>剔除分红后的买入、卖出与费用</small>
          </article>
          <article className="pf-kpi" data-tone="amber">
            <span>分红现金流</span>
            <strong>{formatMoney(dividends, currency)}</strong>
            <small>含现金分红与再投资分红</small>
          </article>
          <article className="pf-kpi" data-tone="teal">
            <span>记录笔数</span>
            <strong>{rows.length}</strong>
            <small>区间内外部资金流</small>
          </article>
        </div>
        <div className="pf-grid-2">
          <div>
            <div className="pf-meta-row">
              <b>外部现金流</b>
            </div>
            <BarChart
              data={chart.map((row) => ({
                label: row.date,
                value: row.external,
              }))}
              format={(value) => formatMoney(value, currency, true)}
              height={250}
            />
          </div>
          <div>
            <div className="pf-meta-row">
              <b>分红现金流</b>
            </div>
            <BarChart
              data={chart.map((row) => ({
                label: row.date,
                value: row.dividend,
              }))}
              format={(value) => formatMoney(value, currency, true)}
              height={250}
            />
          </div>
        </div>
      </Panel>
      <Panel title="现金流水" flush>
        {rows.length === 0 ? (
          <Empty title="区间内没有现金流">
            检查投资账户的资产账户和现金账户配置。
          </Empty>
        ) : (
          <div style={{ padding: 12 }}>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>类型</th>
                    <th>投资</th>
                    <th>账户</th>
                    <th>描述</th>
                    <th className="number">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.date}-${row.account}-${index}`}>
                      <td>{row.date}</td>
                      <td>
                        <span
                          className={`pf-tag${row.isDividend ? " dividend" : ""}`}
                        >
                          {row.isDividend ? "分红" : row.source}
                        </span>
                      </td>
                      <td>{investmentNames.get(row.investmentId) ?? "—"}</td>
                      <td>
                        <code>{row.account}</code>
                      </td>
                      <td>{row.transaction || "—"}</td>
                      <td
                        className={`number ${row.amount >= 0 ? "pf-profit" : "pf-loss"}`}
                      >
                        {formatMoney(row.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
