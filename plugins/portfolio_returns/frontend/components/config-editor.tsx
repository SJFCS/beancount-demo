import {
  createGroup,
  createInvestment,
  investmentFromSuggestion,
  splitAccounts,
  validateConfig,
} from "../config";
import type {
  Catalog,
  DateRangePreset,
  PortfolioConfig,
  PortfolioInvestment,
} from "../types";
import { Empty, Panel } from "./ui";

const RANGES: DateRangePreset[] = [
  "3M",
  "6M",
  "YTD",
  "1Y",
  "2Y",
  "3Y",
  "5Y",
  "10Y",
  "MAX",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  list,
  error,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  placeholder?: string;
  list?: string;
  error?: string;
}) {
  return (
    <label className="pf-input">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        list={list}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function InvestmentEditor({
  investment,
  index,
  config,
  issues,
  update,
  setConfig,
  remove,
}: {
  investment: PortfolioInvestment;
  index: number;
  config: PortfolioConfig;
  issues: Map<string, string>;
  update(value: PortfolioInvestment): void;
  setConfig(value: PortfolioConfig): void;
  remove(): void;
}) {
  const path = `investments.${index}`;
  return (
    <article className="pf-edit-card">
      <div className="pf-edit-card-head">
        <strong>{investment.name || `投资 ${index + 1}`}</strong>
        <label className="pf-check">
          <input
            type="checkbox"
            checked={investment.enabled}
            onChange={(event) =>
              update({ ...investment, enabled: event.target.checked })
            }
          />
          启用
        </label>
        <button type="button" className="pf-btn small danger" onClick={remove}>
          删除
        </button>
      </div>
      <div className="pf-grid-2">
        <Field
          label="显示名称"
          value={investment.name}
          onChange={(name) => update({ ...investment, name })}
          error={issues.get(`${path}.name`)}
        />
        <Field
          label="商品代码"
          value={investment.commodity}
          onChange={(commodity) =>
            update({ ...investment, commodity: commodity.toUpperCase() })
          }
          placeholder="例如 VOO / FUND005827"
          list="pf-commodities"
          error={issues.get(`${path}.commodity`)}
        />
        <Field
          label="资产账户"
          value={investment.assetAccount}
          onChange={(assetAccount) => update({ ...investment, assetAccount })}
          placeholder="Assets:Brokerage:VOO"
          list="pf-accounts"
          error={issues.get(`${path}.assetAccount`)}
        />
        <Field
          label="现金账户（逗号分隔）"
          value={investment.cashAccounts.join(", ")}
          onChange={(value) =>
            update({ ...investment, cashAccounts: splitAccounts(value) })
          }
          placeholder="Assets:Brokerage:Cash"
          list="pf-accounts"
          error={issues.get(`${path}.accounts`)}
        />
        <Field
          label="分红账户（逗号分隔）"
          value={investment.dividendAccounts.join(", ")}
          onChange={(value) =>
            update({
              ...investment,
              dividendAccounts: splitAccounts(value),
            })
          }
          placeholder="Income:Brokerage:VOO:Dividend"
          list="pf-accounts"
        />
        <div className="pf-input">
          <span>所属分组</span>
          <div className="pf-check-row">
            {config.groups.length === 0 ? (
              <small style={{ color: "var(--pf-muted)" }}>尚未创建分组</small>
            ) : (
              config.groups.map((group) => (
                <label className="pf-check" key={group.id}>
                  <input
                    type="checkbox"
                    checked={group.investmentIds.includes(investment.id)}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setConfig({
                        ...config,
                        groups: config.groups.map((item) =>
                          item.id === group.id
                            ? {
                                ...item,
                                investmentIds: enabled
                                  ? [
                                      ...new Set([
                                        ...item.investmentIds,
                                        investment.id,
                                      ]),
                                    ]
                                  : item.investmentIds.filter(
                                      (id) => id !== investment.id,
                                    ),
                              }
                            : item,
                        ),
                      });
                    }}
                  />
                  {group.name}
                </label>
              ))
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ConfigEditor({
  config,
  setConfig,
  catalog,
  configPath,
  configText,
  exists,
  canWrite,
  saving,
  dirty,
  onSave,
  onReset,
}: {
  config: PortfolioConfig;
  setConfig(value: PortfolioConfig): void;
  catalog: Catalog;
  configPath: string;
  configText: string;
  exists: boolean;
  canWrite: boolean;
  saving: boolean;
  dirty: boolean;
  onSave(): void;
  onReset(): void;
}) {
  const issues = validateConfig(config);
  const issueMap = new Map(issues.map((item) => [item.path, item.message]));
  const configured = new Set(
    config.investments.map((item) => `${item.assetAccount}\0${item.commodity}`),
  );
  const suggestions = catalog.suggestions.filter(
    (item) => !configured.has(`${item.assetAccount}\0${item.commodity}`),
  );
  const updateInvestment = (index: number, value: PortfolioInvestment) => {
    setConfig({
      ...config,
      investments: config.investments.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    });
  };
  const addGroup = () =>
    setConfig({
      ...config,
      groups: [...config.groups, createGroup(config)],
    });
  return (
    <div className="pf-config-grid">
      <div>
        <Panel
          title="插件配置"
          description={`保存到 ${configPath}。不会写入 Beancount custom 指令。`}
          action={
            <div className="pf-actions">
              <button
                type="button"
                className="pf-btn ghost"
                disabled={!dirty || saving}
                onClick={onReset}
              >
                撤销修改
              </button>
              <button
                type="button"
                className="pf-btn primary"
                disabled={!canWrite || saving || !dirty || issues.length > 0}
                onClick={onSave}
              >
                {saving ? "保存中…" : "保存配置"}
              </button>
            </div>
          }
          flush
        >
          <div style={{ padding: 14 }}>
            <section className="pf-form-section">
              <div className="pf-form-head">
                <div>
                  <h3>基础设置</h3>
                  <p>基础货币用于新账户的默认报价与建议市值。</p>
                </div>
              </div>
              <div className="pf-grid-3">
                <label className="pf-input">
                  基础货币
                  <select
                    value={config.baseCurrency}
                    onChange={(event) =>
                      setConfig({
                        ...config,
                        baseCurrency: event.target.value,
                      })
                    }
                  >
                    {[
                      ...new Set([config.baseCurrency, ...catalog.currencies]),
                    ].map((currency) => (
                      <option value={currency} key={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pf-input">
                  默认区间
                  <select
                    value={config.display.defaultRange}
                    onChange={(event) =>
                      setConfig({
                        ...config,
                        display: {
                          ...config.display,
                          defaultRange: event.target.value as DateRangePreset,
                        },
                      })
                    }
                  >
                    {RANGES.map((range) => (
                      <option value={range} key={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pf-input">
                  盈亏配色
                  <select
                    value={config.display.pnlColorScheme}
                    onChange={(event) =>
                      setConfig({
                        ...config,
                        display: {
                          ...config.display,
                          pnlColorScheme:
                            event.target.value === "red-green"
                              ? "red-green"
                              : "green-red",
                        },
                      })
                    }
                  >
                    <option value="green-red">绿涨红跌</option>
                    <option value="red-green">红涨绿跌</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="pf-form-section">
              <div className="pf-form-head">
                <div>
                  <h3>投资账户</h3>
                  <p>
                    一个账户中的一种商品算一个投资。现金账户用于识别外部资金流，
                    分红账户用于识别分红。
                  </p>
                </div>
                <button
                  type="button"
                  className="pf-btn small"
                  onClick={() =>
                    setConfig({
                      ...config,
                      investments: [
                        ...config.investments,
                        createInvestment(config),
                      ],
                    })
                  }
                >
                  新增账户
                </button>
              </div>
              {config.investments.length === 0 ? (
                <Empty title="尚未配置投资账户">
                  在下方扫描结果中一键添加，或手动新增账户。
                </Empty>
              ) : (
                <div className="pf-card-list">
                  {config.investments.map((investment, index) => (
                    <InvestmentEditor
                      key={investment.id}
                      investment={investment}
                      index={index}
                      config={config}
                      issues={issueMap}
                      update={(value) => updateInvestment(index, value)}
                      setConfig={setConfig}
                      remove={() =>
                        setConfig({
                          ...config,
                          investments: config.investments.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                          groups: config.groups.map((group) => ({
                            ...group,
                            investmentIds: group.investmentIds.filter(
                              (id) => id !== investment.id,
                            ),
                          })),
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="pf-form-section">
              <div className="pf-form-head">
                <div>
                  <h3>投资分组</h3>
                  <p>分组会合并计算收益，适合把同一券商或多个基金合并观察。</p>
                </div>
                <button
                  type="button"
                  className="pf-btn small"
                  onClick={addGroup}
                >
                  新增分组
                </button>
              </div>
              {config.groups.length === 0 ? (
                <Empty title="尚未创建分组" />
              ) : (
                <div className="pf-card-list">
                  {config.groups.map((group, index) => (
                    <article className="pf-edit-card" key={group.id}>
                      <div className="pf-edit-card-head">
                        <strong>{group.name}</strong>
                        <button
                          type="button"
                          className="pf-btn small danger"
                          onClick={() =>
                            setConfig({
                              ...config,
                              groups: config.groups.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            })
                          }
                        >
                          删除
                        </button>
                      </div>
                      <Field
                        label="分组名称"
                        value={group.name}
                        onChange={(name) =>
                          setConfig({
                            ...config,
                            groups: config.groups.map((item) =>
                              item.id === group.id ? { ...item, name } : item,
                            ),
                          })
                        }
                        error={issueMap.get(`groups.${index}.name`)}
                      />
                      <div className="pf-check-row" style={{ marginTop: 9 }}>
                        {config.investments.map((investment) => (
                          <label className="pf-check" key={investment.id}>
                            <input
                              type="checkbox"
                              checked={group.investmentIds.includes(
                                investment.id,
                              )}
                              onChange={(event) =>
                                setConfig({
                                  ...config,
                                  groups: config.groups.map((item) =>
                                    item.id === group.id
                                      ? {
                                          ...item,
                                          investmentIds: event.target.checked
                                            ? [
                                                ...item.investmentIds,
                                                investment.id,
                                              ]
                                            : item.investmentIds.filter(
                                                (id) => id !== investment.id,
                                              ),
                                        }
                                      : item,
                                  ),
                                })
                              }
                            />
                            {investment.name}
                          </label>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {suggestions.length > 0 ? (
              <section className="pf-form-section">
                <div className="pf-form-head">
                  <div>
                    <h3>从账本扫描到的持仓</h3>
                    <p>
                      自动识别资产账户、可能对应的现金账户和分红账户；添加后仍可编辑。
                    </p>
                  </div>
                </div>
                {suggestions.map((suggestion) => (
                  <div
                    className="pf-suggestion"
                    key={`${suggestion.assetAccount}-${suggestion.commodity}`}
                  >
                    <div>
                      <strong>
                        {suggestion.name} · {suggestion.commodity}
                      </strong>
                      <small>
                        {suggestion.assetAccount}
                        {suggestion.cashAccounts.length > 0
                          ? ` · 现金 ${suggestion.cashAccounts.join(", ")}`
                          : ""}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="pf-btn small"
                      onClick={() =>
                        setConfig({
                          ...config,
                          investments: [
                            ...config.investments,
                            investmentFromSuggestion(suggestion, config),
                          ],
                        })
                      }
                    >
                      添加
                    </button>
                  </div>
                ))}
              </section>
            ) : null}
          </div>
        </Panel>
      </div>

      <div className="pf-stack">
        <Panel title="配置状态">
          <div className="pf-meta-row" style={{ marginBottom: 0 }}>
            <span>
              文件 <b>{exists ? "已存在" : "待创建"}</b>
            </span>
            <span>
              状态 <b>{dirty ? "有未保存修改" : "已同步"}</b>
            </span>
          </div>
          <div className="pf-issue-list">
            {!canWrite ? (
              <div className="pf-warning">当前账本为只读，无法保存配置。</div>
            ) : null}
            {issues.map((issue) => (
              <div className="pf-issue" key={`${issue.path}-${issue.message}`}>
                <strong>{issue.path || "配置"}</strong>
                {issue.message}
              </div>
            ))}
            {issues.length === 0 && canWrite ? (
              <div
                className="pf-warning"
                style={{
                  background: "var(--pf-teal-soft)",
                  borderColor: "rgba(31,111,92,.24)",
                  color: "var(--pf-teal-deep)",
                }}
              >
                配置校验通过，可以保存。
              </div>
            ) : null}
          </div>
        </Panel>
        <Panel title="JSON 预览" description={`${configPath} · 只读预览`}>
          <pre className="pf-config-code">
            {JSON.stringify(config, null, 2)}
          </pre>
          {configText ? (
            <details style={{ marginTop: 9 }}>
              <summary
                style={{
                  color: "var(--pf-muted)",
                  fontSize: 9,
                  cursor: "pointer",
                }}
              >
                查看已保存文件
              </summary>
              <pre className="pf-config-code" style={{ marginTop: 7 }}>
                {configText}
              </pre>
            </details>
          ) : null}
        </Panel>
        <Panel title="配置说明">
          <div
            className="pf-guide"
            style={{ gridTemplateColumns: "1fr", marginTop: 0 }}
          >
            <article>
              <h3>现金账户</h3>
              <p>
                买入时现金减少、卖出与分红时现金增加。留空时会使用同一交易中的其他资产或负债账户作为外部现金流。
              </p>
            </article>
            <article>
              <h3>分红账户</h3>
              <p>
                通常配置为 <code>Income:...:Dividend</code>
                。分红交易会自动从外部现金流中单独归类。
              </p>
            </article>
            <article>
              <h3>多币种</h3>
              <p>
                商品价格、成本货币和现金流都会按交易/估值日期的账本价格换算到上方工具栏选择的目标货币。
              </p>
            </article>
          </div>
        </Panel>
      </div>
      <datalist id="pf-accounts">
        {catalog.accounts.map((item) => (
          <option value={item.account} key={item.account} />
        ))}
      </datalist>
      <datalist id="pf-commodities">
        {catalog.commodities.map((item) => (
          <option value={item.commodity} key={item.commodity}>
            {item.name}
          </option>
        ))}
      </datalist>
    </div>
  );
}
