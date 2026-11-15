import React, { useEffect, useMemo, useState } from "react";
import { CashFlowView } from "./frontend/components/cashflow-view";
import { ConfigEditor } from "./frontend/components/config-editor";
import { DividendsView } from "./frontend/components/dividends-view";
import { InvestmentsView } from "./frontend/components/investments-view";
import { PerformanceView } from "./frontend/components/performance-view";
import { PortfolioView } from "./frontend/components/portfolio-view";
import { ReturnsView } from "./frontend/components/returns-view";
import { Empty, Panel, Toolbar } from "./frontend/components/ui";
import { validateConfig } from "./frontend/config";
import { resolveRange } from "./frontend/range";
import { STYLES } from "./frontend/styles";
import type {
  DateRangePreset,
  MetricName,
  PortfolioConfig,
  Props,
  Report,
  Tab,
  View,
} from "./frontend/types";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "portfolio", label: "组合" },
  { id: "performance", label: "表现" },
  { id: "returns", label: "收益" },
  { id: "investments", label: "投资" },
  { id: "dividends", label: "分红" },
  { id: "cashflows", label: "现金流" },
  { id: "config", label: "配置" },
];

function cloneConfig(config: PortfolioConfig): PortfolioConfig {
  return JSON.parse(JSON.stringify(config)) as PortfolioConfig;
}

export default function PortfolioReturnsPlugin({
  ledgerId,
  primaryCurrency = "CNY",
  canWrite,
  api,
}: Props) {
  const [view, setView] = useState<View | null>(null);
  const [draft, setDraft] = useState<PortfolioConfig | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [tab, setTab] = useState<Tab>("portfolio");
  const [preset, setPreset] = useState<DateRangePreset>("1Y");
  const [currency, setCurrency] = useState(primaryCurrency);
  const [selection, setSelection] = useState<string[]>([]);
  const [compareWith, setCompareWith] = useState<string[]>([]);
  const [metric, setMetric] = useState<MetricName>("returns");
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");
  const [notice, setNotice] = useState("");

  const endpoint = `/api-gateway/local/plugins/portfolio_returns/api?ledgerId=${encodeURIComponent(
    ledgerId,
  )}`;
  const baseEndpoint = "/api-gateway/local/plugins/portfolio_returns/api";

  async function request<T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await api.fetchLocal(
      path,
      body === undefined
        ? { signal }
        : {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            signal,
          },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(payload.error || `请求失败（${response.status}）`);
    return payload as T;
  }

  function acceptView(value: View, resetRange = false) {
    setView(value);
    setDraft(cloneConfig(value.config));
    if (resetRange) setPreset(value.config.display.defaultRange);
    const supportedCurrencies = [
      value.config.baseCurrency,
      ...value.operatingCurrencies,
      value.primaryCurrency,
    ].filter(Boolean);
    if (!supportedCurrencies.includes(currency))
      setCurrency(value.primaryCurrency || value.config.baseCurrency || "CNY");
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setNotice("");
    void request<View>(endpoint, undefined, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) acceptView(value, true);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ledgerId, api]);

  const selectionKey = selection.join("\u0000");
  const compareKey = compareWith.join("\u0000");
  useEffect(() => {
    if (!view) return;
    const range = view.catalog.dateRange;
    if (!range) {
      setReport(null);
      setReportLoading(false);
      setReportError("");
      return;
    }
    const dates = resolveRange(preset, range.startDate, range.endDate);
    const controller = new AbortController();
    setReportLoading(true);
    setReportError("");
    void request<Report>(
      `${baseEndpoint}/report`,
      {
        ledgerId,
        startDate: dates.startDate,
        endDate: dates.endDate,
        currency,
        selection,
        compareWith,
        metric,
      },
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) setReport(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setReportError(
            cause instanceof Error ? cause.message : String(cause),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setReportLoading(false);
      });
    return () => controller.abort();
  }, [
    view,
    preset,
    currency,
    selectionKey,
    compareKey,
    metric,
    api,
    baseEndpoint,
  ]);

  const dirty =
    view !== null &&
    draft !== null &&
    (view.configError !== null ||
      JSON.stringify(draft) !== JSON.stringify(view.config));
  const issues = useMemo(
    () => (draft === null ? [] : validateConfig(draft)),
    [draft],
  );

  async function reload() {
    if (
      dirty &&
      !window.confirm("有未保存的配置修改，重新读取会丢弃这些修改。继续？")
    )
      return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const value = await request<View>(endpoint);
      acceptView(value, true);
      setNotice("已重新读取账本与插件配置。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!view || !draft || !canWrite || issues.length > 0) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const value = await request<View>(`${baseEndpoint}/save`, {
        ledgerId,
        revision: view.revision,
        config: draft,
      });
      acceptView(value, true);
      setNotice(`配置已保存到 ${value.configPath}，报表已按新配置重新计算。`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }

  function selectTab(next: Tab) {
    if (next === "performance" && metric !== "returns" && metric !== "twr")
      setMetric("returns");
    if (
      next === "returns" &&
      metric !== "xirr" &&
      metric !== "twr" &&
      metric !== "mdm" &&
      metric !== "pnl"
    )
      setMetric("xirr");
    setTab(next);
  }

  const toolbarCurrencies = [
    ...new Set([
      currency,
      ...(view?.operatingCurrencies ?? []),
      ...(view ? [view.config.baseCurrency, view.primaryCurrency] : []),
      primaryCurrency,
    ]),
  ].filter(Boolean);
  const configIssueCount = issues.length + (view?.configError ? 1 : 0);
  const ledgerIssueCount =
    (view?.ledgerErrors.length ?? 0) + (view?.ledgerError ? 1 : 0);

  function content() {
    if (loading && !view)
      return <div className="pf-progress">正在读取账本与插件配置…</div>;
    if (!view)
      return (
        <Panel title="投资组合收益">
          <Empty title="无法加载插件">请检查账本与插件启用状态。</Empty>
        </Panel>
      );
    if (tab === "config")
      return (
        <ConfigEditor
          config={draft ?? view.config}
          setConfig={setDraft}
          catalog={view.catalog}
          configPath={view.configPath}
          configText={view.configText}
          exists={view.exists}
          canWrite={canWrite}
          saving={saving}
          dirty={dirty}
          onSave={() => void save()}
          onReset={() => setDraft(cloneConfig(view.config))}
        />
      );
    if (!view.catalog.dateRange)
      return (
        <Panel title="投资组合收益">
          <Empty title="账本中还没有可计算的数据">
            添加交易或价格指令后，再刷新本页。
          </Empty>
        </Panel>
      );
    if (reportLoading && !report)
      return <div className="pf-progress">正在计算组合收益…</div>;
    if (!report)
      return (
        <Panel title="投资组合收益">
          <Empty title="报表暂不可用">
            {reportError || "请检查插件配置与账本数据。"}
          </Empty>
        </Panel>
      );
    const scheme = view.config.display.pnlColorScheme;
    switch (tab) {
      case "portfolio":
        return (
          <PortfolioView
            report={report}
            currency={currency}
            scheme={scheme}
            selection={selection}
            setSelection={setSelection}
          />
        );
      case "performance":
        return (
          <PerformanceView
            report={report}
            config={view.config}
            catalog={view.catalog}
            metric={metric}
            setMetric={setMetric}
            compareWith={compareWith}
            setCompareWith={setCompareWith}
            currency={currency}
          />
        );
      case "returns":
        return (
          <ReturnsView
            report={report}
            metric={metric}
            setMetric={setMetric}
            currency={currency}
            scheme={scheme}
          />
        );
      case "investments":
        return (
          <InvestmentsView
            report={report}
            currency={currency}
            scheme={scheme}
          />
        );
      case "dividends":
        return <DividendsView report={report} currency={currency} />;
      case "cashflows":
        return <CashFlowView report={report} currency={currency} />;
    }
  }

  return (
    <main className="pf-shell">
      <style>{STYLES}</style>
      <div className="pf-page">
        <header className="pf-hero">
          <div>
            <span className="pf-eyebrow">
              <i aria-hidden="true" />
              PORTFOLIO RETURNS
            </span>
            <h1>
              投资组合<span>收益</span>
            </h1>
            <p>
              用账本中的持仓、成本、价格与现金流计算市值、收益和分红。配置保存在
              <code>
                {" "}
                {view?.configPath ?? "plugins/portfolio_returns/config.json"}
              </code>
              ，不会写入 Beancount custom 指令。
            </p>
          </div>
          <div className="pf-hero-actions">
            <span className="pf-sync" data-busy={loading || reportLoading}>
              <i aria-hidden="true" />
              {loading ? "读取中…" : reportLoading ? "计算中…" : "本地账本"}
            </span>
            <div className="pf-actions">
              <button
                type="button"
                className="pf-btn ghost"
                disabled={loading || saving}
                onClick={() => void reload()}
              >
                {loading ? "读取中…" : "重新计算"}
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="pf-message error" role="alert">
            {error}
          </div>
        ) : null}
        {reportError && report ? (
          <div className="pf-message error" role="alert">
            {reportError}
          </div>
        ) : null}
        {notice ? (
          <div className="pf-message notice" role="status">
            {notice}
          </div>
        ) : null}
        {!canWrite ? (
          <div className="pf-message">
            当前账本为只读，可以查看报表，但不能保存插件配置。
          </div>
        ) : null}
        {view?.configError ? (
          <div className="pf-message error">
            已保存的插件配置无效：{view.configError}。请在“配置”页修正后保存。
          </div>
        ) : null}
        {ledgerIssueCount > 0 ? (
          <details className="pf-message">
            <summary>
              账本解析返回 {ledgerIssueCount} 条提示，报表可能不完整。
            </summary>
            <div className="pf-warning-list">
              {(view?.ledgerErrors ?? []).slice(0, 10).map((item, index) => (
                <div className="pf-warning" key={`${item.message}-${index}`}>
                  {item.file ? `${item.file}:${item.line ?? ""} ` : ""}
                  {item.message}
                </div>
              ))}
              {view?.ledgerErrors.length === 0 && view?.ledgerError ? (
                <div className="pf-warning">{view.ledgerError}</div>
              ) : null}
            </div>
          </details>
        ) : null}
        {report &&
        (report.warnings.length > 0 || report.missingPrices.length > 0) ? (
          <details className="pf-message">
            <summary>
              配置提示
              {report.missingPrices.length > 0
                ? ` · ${report.missingPrices.length} 个缺失报价`
                : ""}
            </summary>
            <div className="pf-warning-list">
              {report.warnings.slice(0, 8).map((warning) => (
                <div className="pf-warning" key={warning}>
                  {warning}
                </div>
              ))}
              {report.missingPrices.slice(0, 12).map((item) => (
                <div
                  className="pf-warning"
                  key={`${item.date}-${item.currency}-${item.target}`}
                >
                  {item.date} 缺少 {item.currency}/{item.target} 价格
                </div>
              ))}
            </div>
          </details>
        ) : null}
        {!view?.exists && view && !view.configError ? (
          <div className="pf-message notice">
            尚未创建插件配置。请在“配置”页添加投资账户并保存，配置文件会自动创建。
          </div>
        ) : null}

        <nav className="pf-tabs" role="tablist" aria-label="投资组合收益视图">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className="pf-tab"
              onClick={() => selectTab(item.id)}
            >
              {item.label}
              {item.id === "config" && configIssueCount > 0 ? (
                <span className="pf-tab-badge">{configIssueCount}</span>
              ) : null}
            </button>
          ))}
        </nav>

        {view && tab !== "config" ? (
          <Toolbar
            config={view.config}
            preset={preset}
            setPreset={setPreset}
            currency={currency}
            setCurrency={setCurrency}
            currencies={toolbarCurrencies}
            selection={selection}
            setSelection={setSelection}
          />
        ) : null}

        {content()}
      </div>
    </main>
  );
}
