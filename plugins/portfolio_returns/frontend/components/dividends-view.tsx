import { useState } from "react";
import { BarChart } from "../charts";
import { formatMoney } from "../format";
import type { Report } from "../types";
import { Empty, Panel } from "./ui";

export function DividendsView({
  report,
  currency,
}: {
  report: Report;
  currency: string;
}) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const data = report.dividends[period];
  const totals = data.keys.map((key) => ({
    ...key,
    total: data.rows.reduce((sum, row) => sum + Number(row[key.id] ?? 0), 0),
  }));
  const grandTotal = totals.reduce((sum, item) => sum + item.total, 0);
  const chart = data.rows.map((row) => ({
    label: String(row.date),
    value: data.keys.reduce((sum, key) => sum + Number(row[key.id] ?? 0), 0),
  }));
  return (
    <div className="pf-stack">
      <Panel
        title="分红收入"
        description="分红来自配置中指定的收入账户；再投资分红会同时计入分红与再投资现金流。"
        action={
          <div className="pf-segment" role="group" aria-label="分红期间">
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
        {data.rows.length === 0 ? (
          <Empty title="区间内没有分红">
            检查投资账户的分红账户配置是否正确。
          </Empty>
        ) : (
          <>
            <div
              className="pf-kpis"
              style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
            >
              <article className="pf-kpi" data-tone="amber">
                <span>分红总额</span>
                <strong>{formatMoney(grandTotal, currency)}</strong>
                <small>{data.rows.length} 个期间</small>
              </article>
              <article className="pf-kpi" data-tone="teal">
                <span>派息投资</span>
                <strong>
                  {totals.filter((item) => item.total > 0).length}
                </strong>
                <small>有分红记录的账户</small>
              </article>
              <article className="pf-kpi" data-tone="teal">
                <span>期间平均</span>
                <strong>
                  {formatMoney(
                    data.rows.length > 0 ? grandTotal / data.rows.length : 0,
                    currency,
                  )}
                </strong>
                <small>每{period === "monthly" ? "月" : "年"}</small>
              </article>
            </div>
            <BarChart
              data={chart}
              format={(value) => formatMoney(value, currency, true)}
              height={270}
            />
          </>
        )}
      </Panel>
      <Panel title="分红明细" flush>
        {data.rows.length === 0 ? (
          <Empty title="没有分红明细" />
        ) : (
          <div style={{ padding: 12 }}>
            <div className="pf-table-wrap">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>期间</th>
                    {data.keys.map((key) => (
                      <th className="number" key={key.id}>
                        {key.name}
                      </th>
                    ))}
                    <th className="number">合计</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => {
                    const total = data.keys.reduce(
                      (sum, key) => sum + Number(row[key.id] ?? 0),
                      0,
                    );
                    return (
                      <tr key={String(row.date)}>
                        <td>{String(row.date)}</td>
                        {data.keys.map((key) => (
                          <td className="number" key={key.id}>
                            {Number(row[key.id] ?? 0) === 0
                              ? "—"
                              : formatMoney(Number(row[key.id]), currency)}
                          </td>
                        ))}
                        <td className="number">
                          <strong>{formatMoney(total, currency)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
