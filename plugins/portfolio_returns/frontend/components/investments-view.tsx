import { formatMoney, formatPercent, formatSigned } from "../format";
import type { Report } from "../types";
import { Empty, Panel } from "./ui";

function tone(value: number, scheme: "green-red" | "red-green") {
  if (Math.abs(value) < 1e-12) return "";
  const positive = value > 0;
  if (scheme === "red-green") return positive ? "pf-loss" : "pf-profit";
  return positive ? "pf-profit" : "pf-loss";
}

function InvestmentTable({
  rows,
  total,
  currency,
  scheme,
}: {
  rows: Report["investments"];
  total?: Report["totals"]["investments"];
  currency: string;
  scheme: "green-red" | "red-green";
}) {
  if (rows.length === 0) return <Empty title="暂无投资账户" />;
  return (
    <div className="pf-table-wrap">
      <table className="pf-table">
        <thead>
          <tr>
            <th>投资</th>
            <th className="number">份额</th>
            <th className="number">成本</th>
            <th className="number">市值</th>
            <th className="number">总盈亏</th>
            <th className="number">已实现</th>
            <th className="number">未实现</th>
            <th className="number">XIRR</th>
            <th className="number">MDM</th>
            <th className="number">TWR</th>
            <th className="number">MDD</th>
            <th className="number">年化波动率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <div className="pf-mono" style={{ marginTop: 2 }}>
                  {item.units
                    .map(
                      (unit) =>
                        `${new Intl.NumberFormat(undefined, {
                          maximumFractionDigits: 6,
                        }).format(unit.units)} ${unit.commodity}`,
                    )
                    .join(" · ") || "—"}
                </div>
              </td>
              <td className="number">
                {item.units
                  .map((unit) =>
                    new Intl.NumberFormat(undefined, {
                      maximumFractionDigits: 6,
                    }).format(unit.units),
                  )
                  .join(" / ") || "—"}
              </td>
              <td className="number">
                {formatMoney(item.costValue, currency)}
              </td>
              <td className="number">
                {formatMoney(item.marketValue, currency)}
              </td>
              <td className={`number ${tone(item.totalPnl, scheme)}`}>
                {formatSigned(item.totalPnl, (value) =>
                  formatMoney(value, currency),
                )}
              </td>
              <td className={`number ${tone(item.realizedPnl, scheme)}`}>
                {formatMoney(item.realizedPnl, currency)}
              </td>
              <td className={`number ${tone(item.unrealizedPnl, scheme)}`}>
                {formatMoney(item.unrealizedPnl, currency)}
              </td>
              <td className={`number ${tone(item.xirr, scheme)}`}>
                {formatPercent(item.xirr)}
              </td>
              <td className={`number ${tone(item.mdm, scheme)}`}>
                {formatPercent(item.mdm)}
              </td>
              <td className={`number ${tone(item.twr, scheme)}`}>
                {formatPercent(item.twr)}
              </td>
              <td className="number pf-loss">{formatPercent(item.mdd)}</td>
              <td className="number">{formatPercent(item.volatility)}</td>
            </tr>
          ))}
        </tbody>
        {total ? (
          <tfoot>
            <tr>
              <td colSpan={2}>
                <strong>{total.name}</strong>
                <div className="pf-mono" style={{ marginTop: 2 }}>
                  全部启用的投资账户 · {total.flowCount} 笔外部现金流
                </div>
              </td>
              <td className="number">
                {formatMoney(total.costValue, currency)}
              </td>
              <td className="number">
                {formatMoney(total.marketValue, currency)}
              </td>
              <td className={`number ${tone(total.totalPnl, scheme)}`}>
                {formatSigned(total.totalPnl, (value) =>
                  formatMoney(value, currency),
                )}
              </td>
              <td className={`number ${tone(total.realizedPnl, scheme)}`}>
                {formatMoney(total.realizedPnl, currency)}
              </td>
              <td className={`number ${tone(total.unrealizedPnl, scheme)}`}>
                {formatMoney(total.unrealizedPnl, currency)}
              </td>
              <td className={`number ${tone(total.xirr, scheme)}`}>
                {formatPercent(total.xirr)}
              </td>
              <td className={`number ${tone(total.mdm, scheme)}`}>
                {formatPercent(total.mdm)}
              </td>
              <td className={`number ${tone(total.twr, scheme)}`}>
                {formatPercent(total.twr)}
              </td>
              <td className="number pf-loss">{formatPercent(total.mdd)}</td>
              <td className="number">{formatPercent(total.volatility)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

export function InvestmentsView({
  report,
  currency,
  scheme,
}: {
  report: Report;
  currency: string;
  scheme: "green-red" | "red-green";
}) {
  return (
    <div className="pf-stack">
      <Panel
        title="投资账户"
        description="收益率使用所选区间；总盈亏为区间内市值变化减去累计净投入变化。"
        flush
      >
        <div style={{ padding: 12 }}>
          <InvestmentTable
            rows={report.investments}
            total={report.totals.investments}
            currency={currency}
            scheme={scheme}
          />
        </div>
      </Panel>
      <Panel
        title="投资分组"
        description="分组统计按组内启用账户合并计算，不会重复计入同一笔现金流。"
        flush
      >
        <div style={{ padding: 12 }}>
          {report.groups.length === 0 ? (
            <Empty title="尚未创建分组">
              在配置页把多个投资账户归入同一分组后，这里会显示合并收益。
            </Empty>
          ) : (
            <InvestmentTable
              rows={report.groups}
              currency={currency}
              scheme={scheme}
            />
          )}
        </div>
      </Panel>
    </div>
  );
}
