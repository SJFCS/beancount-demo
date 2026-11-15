import { LineChart, pairedSeries } from "../charts";
import {
  formatMoney,
  formatPercent,
  formatSigned,
  toneForValue,
} from "../format";
import type { Report } from "../types";
import { Empty, Kpi, Panel } from "./ui";

export function PortfolioView({
  report,
  currency,
  scheme,
  selection,
  setSelection,
}: {
  report: Report;
  currency: string;
  scheme: "green-red" | "red-green";
  selection: string[];
  setSelection(value: string[]): void;
}) {
  const summary = report.summary;
  const values = report.series.values;
  const valueSeries = pairedSeries(values, [
    { key: "market", name: "市值", color: "var(--pf-teal)" },
    {
      key: "cost",
      name: "成本",
      color: "var(--pf-amber)",
      dashed: true,
      step: true,
    },
  ]);
  const performance = pairedSeries(report.series.performance, [
    { key: "value", name: "总盈亏", color: "var(--pf-teal)" },
  ]);
  const areaColors =
    scheme === "green-red"
      ? { positiveColor: "var(--pf-green)", negativeColor: "var(--pf-red)" }
      : { positiveColor: "var(--pf-red)", negativeColor: "var(--pf-green)" };
  const profitColor = scheme === "green-red" ? "绿色" : "红色";
  const lossColor = scheme === "green-red" ? "红色" : "绿色";
  const groupAllocation = report.groups.filter(
    (item) => item.marketValue > 1e-12,
  );
  const investmentAllocation = report.investments.filter(
    (item) => item.marketValue > 1e-12,
  );
  const allocationTotal = investmentAllocation.reduce(
    (total, item) => total + Math.max(item.marketValue, 0),
    0,
  );
  const allInvestmentTotal = investmentAllocation.reduce(
    (total, item) => total + Math.max(item.marketValue, 0),
    0,
  );
  const showingAllInvestments = selection.length === 0;
  const allocationRows = [
    ...groupAllocation.map((item) => ({ item, kind: "group" as const })),
    ...investmentAllocation.map((item) => ({
      item,
      kind: "investment" as const,
    })),
  ];
  const pnlTone: "profit" | "loss" | "teal" =
    summary.totalPnl === 0
      ? "teal"
      : toneForValue(summary.totalPnl, scheme) === "profit"
        ? "profit"
        : "loss";
  const signedTone = (value: number): "profit" | "loss" | "teal" => {
    const tone = toneForValue(value, scheme);
    return tone === "neutral" ? "teal" : tone;
  };

  if (values.length === 0) {
    return (
      <Panel title="组合表现" description="账本中还没有可计算的持仓或价格。">
        <Empty title="暂无组合数据">
          在“配置”中新增投资账户，或先点击“扫描账本”从现有持仓生成建议。
        </Empty>
      </Panel>
    );
  }

  return (
    <>
      <div className="pf-kpis">
        <Kpi
          label="当前市值"
          value={formatMoney(summary.marketValue, currency)}
          detail={`成本 ${formatMoney(summary.costValue, currency)}`}
          tone="teal"
        />
        <Kpi
          label="期间总盈亏"
          value={formatSigned(summary.totalPnl, (value) =>
            formatMoney(value, currency),
          )}
          detail={`已实现 ${formatMoney(summary.realizedPnl, currency)}`}
          tone={pnlTone}
        />
        <Kpi
          label="时间加权收益"
          value={formatPercent(summary.twr)}
          detail="TWR，排除现金流影响"
          tone={signedTone(summary.twr)}
        />
        <Kpi
          label="XIRR"
          value={formatPercent(summary.xirr)}
          detail="年化，按实际现金流日期计算"
          tone={signedTone(summary.xirr)}
        />
        <Kpi
          label="最大回撤"
          value={formatPercent(summary.mdd)}
          detail={`年化波动 ${formatPercent(summary.volatility)}`}
          tone="amber"
        />
        <Kpi
          label="累计投入"
          value={formatMoney(summary.cashInvested, currency)}
          detail={`${summary.flowCount} 笔外部现金流`}
          tone="teal"
        />
      </div>

      <div className="pf-layout">
        <div className="pf-stack">
          <Panel
            title="组合净值"
            description={`市值与成本线之间的区域按盈亏着色：成本线上方为${profitColor}，下方为${lossColor}。`}
          >
            <LineChart
              series={valueSeries}
              format={(value) => formatMoney(value, currency, true)}
              height={330}
              area={{
                baselineSeries: 1,
                baselineStep: true,
                ...areaColors,
              }}
            />
          </Panel>
          <Panel
            title="累计盈亏"
            description={`以零线为分割：零线以上为${profitColor}，以下为${lossColor}，包含分红与费用。`}
          >
            <LineChart
              series={performance}
              format={(value) => formatMoney(value, currency, true)}
              height={285}
              area={areaColors}
            />
          </Panel>
        </div>
        <div className="pf-stack">
          <Panel
            title="资产配置"
            description="同时显示分组汇总和全部单项配置；点击条目筛选到对应投资。"
          >
            {allocationRows.length > 0 ? (
              <div className="pf-allocation">
                <button
                  type="button"
                  className="pf-allocation-row pf-allocation-all"
                  aria-pressed={showingAllInvestments}
                  title="显示全部启用的投资账户"
                  onClick={() => setSelection([])}
                >
                  <span className="pf-allocation-label">
                    <span className="pf-allocation-name">
                      <span>全部启用的投资账户</span>
                    </span>
                    <b>
                      {formatMoney(allInvestmentTotal, currency, true)} ·{" "}
                      {report.investments.length} 项
                    </b>
                  </span>
                  <span className="pf-allocation-track">
                    <i style={{ width: "100%" }} />
                  </span>
                </button>
                {allocationRows.map(({ item, kind }) => {
                  const weight =
                    allocationTotal > 0
                      ? Math.max(item.marketValue, 0) / allocationTotal
                      : 0;
                  const active =
                    selection.length === 1 && selection[0] === item.id;
                  return (
                    <button
                      type="button"
                      className={`pf-allocation-row${
                        kind === "group" ? " pf-allocation-group" : ""
                      }`}
                      key={`${kind}-${item.id}`}
                      aria-pressed={active}
                      title={
                        active
                          ? "取消筛选，显示全部投资"
                          : `筛选到 ${item.name}`
                      }
                      onClick={() => setSelection(active ? [] : [item.id])}
                    >
                      <span className="pf-allocation-label">
                        <span className="pf-allocation-name" title={item.name}>
                          <span>{item.name}</span>
                          {kind === "group" ? (
                            <i className="pf-allocation-badge">分组</i>
                          ) : null}
                        </span>
                        <b>
                          {formatMoney(item.marketValue, currency, true)} ·{" "}
                          {formatPercent(weight, 1)}
                        </b>
                      </span>
                      <span className="pf-allocation-track">
                        <i
                          style={{
                            width: `${Math.max(1, weight * 100)}%`,
                          }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <Empty title="暂无持仓" />
            )}
          </Panel>
          <Panel title="持有份额">
            {summary.units.length > 0 ? (
              <div className="pf-table-wrap">
                <table className="pf-table">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th className="number">份额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.units.map((unit) => (
                      <tr key={unit.commodity}>
                        <td>
                          <code>{unit.commodity}</code>
                        </td>
                        <td className="number">
                          {new Intl.NumberFormat(undefined, {
                            maximumFractionDigits: 6,
                          }).format(unit.units)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="已无持仓" />
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
