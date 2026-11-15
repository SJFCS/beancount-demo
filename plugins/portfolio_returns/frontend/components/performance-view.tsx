import { CHART_COLORS, LineChart } from "../charts";
import type { ChartSeries } from "../charts";
import { formatPercent } from "../format";
import type { Catalog, MetricName, PortfolioConfig, Report } from "../types";
import { Empty, MetricSelect, Panel } from "./ui";

export function PerformanceView({
  report,
  config,
  catalog,
  metric,
  setMetric,
  compareWith,
  setCompareWith,
  currency,
}: {
  report: Report;
  config: PortfolioConfig;
  catalog: Catalog;
  metric: MetricName;
  setMetric(value: MetricName): void;
  compareWith: string[];
  setCompareWith(value: string[]): void;
  currency: string;
}) {
  const selected = new Set(compareWith);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompareWith([...next]);
  };
  const series: ChartSeries[] = report.compare.series.map((item, index) => ({
    name: item.name,
    points: item.data,
    color:
      item.kind === "portfolio"
        ? "var(--pf-teal)"
        : CHART_COLORS[(index + 1) % CHART_COLORS.length],
  }));
  return (
    <Panel
      title="相对表现"
      description="将组合与分组、账户或商品价格统一归零到共同起点，比较相对涨跌。"
      action={
        <MetricSelect
          value={metric}
          setValue={setMetric}
          options={[
            { value: "returns", label: "收益率" },
            { value: "twr", label: "TWR" },
          ]}
        />
      }
    >
      {series.length === 0 || report.series.values.length === 0 ? (
        <Empty title="暂无可比较的数据">
          先配置投资账户，再选择要对比的分组、账户或商品。
        </Empty>
      ) : (
        <>
          <div className="pf-meta-row">
            <span>
              共同起点 <b>{report.compare.commonDate ?? "—"}</b>
            </span>
            <span>
              目标货币 <b>{currency}</b>
            </span>
          </div>
          <LineChart series={series} format={formatPercent} height={420} />
        </>
      )}
      <div style={{ marginTop: 14 }}>
        <details className="pf-selection" open>
          <summary>对比对象 · {compareWith.length} 项</summary>
          <div
            className="pf-selection-menu"
            style={{ position: "static", width: "100%", maxWidth: "none" }}
          >
            {config.groups.length > 0 ? (
              <>
                <div className="pf-meta-row" style={{ margin: "5px 8px 2px" }}>
                  分组
                </div>
                {config.groups.map((group) => (
                  <label className="pf-check" key={group.id}>
                    <input
                      type="checkbox"
                      checked={selected.has(group.id)}
                      onChange={() => toggle(group.id)}
                    />
                    {group.name}
                    <small>分组</small>
                  </label>
                ))}
              </>
            ) : null}
            {config.investments.some((investment) => investment.enabled) ? (
              <>
                <div className="pf-meta-row" style={{ margin: "5px 8px 2px" }}>
                  投资账户
                </div>
                {config.investments
                  .filter((investment) => investment.enabled)
                  .map((investment) => (
                    <label className="pf-check" key={investment.id}>
                      <input
                        type="checkbox"
                        checked={selected.has(investment.id)}
                        onChange={() => toggle(investment.id)}
                      />
                      {investment.name}
                      <small>{investment.commodity}</small>
                    </label>
                  ))}
              </>
            ) : null}
            {catalog.currencies.filter((item) => item !== currency).length >
            0 ? (
              <>
                <div className="pf-meta-row" style={{ margin: "5px 8px 2px" }}>
                  商品 / 货币走势
                </div>
                {catalog.currencies
                  .filter((item) => item !== currency)
                  .slice(0, 80)
                  .map((item) => {
                    const id = `currency:${item}`;
                    return (
                      <label className="pf-check" key={id}>
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggle(id)}
                        />
                        {item} / {currency}
                        <small>价格</small>
                      </label>
                    );
                  })}
              </>
            ) : null}
          </div>
        </details>
      </div>
    </Panel>
  );
}
