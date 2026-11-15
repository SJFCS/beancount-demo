import React, { useEffect, useMemo, useState } from "react";
import { normalizeConfig, validateConfig } from "./frontend/config";
import { ConfigEditor } from "./frontend/components/config-editor";
import { Overview } from "./frontend/components/overview";
import { styles } from "./frontend/styles";
import type { ConfigDraft, Props, UpdateDraft, View } from "./frontend/types";

export default function ValuationPlugin({
  ledgerId,
  primaryCurrency = "USD",
  canWrite,
  api,
}: Props) {
  const [view, setView] = useState<View | null>(null);
  const [draft, setDraft] = useState<ConfigDraft | null>(null);
  const [tab, setTab] = useState<"overview" | "config">("overview");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const endpoint = `/api-gateway/local/plugins/valuation/api?ledgerId=${encodeURIComponent(
    ledgerId,
  )}`;

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
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "请求失败");
    }
    return payload as T;
  }

  function acceptView(value: View) {
    setView(value);
    setDraft(normalizeConfig(value.config));
  }

  async function load(signal?: AbortSignal) {
    const value = await request<View>(endpoint, undefined, signal);
    acceptView(value);
    return value;
  }

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    setNotice("");
    setTab("overview");
    void load(controller.signal)
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [ledgerId, api]);

  const normalizedSaved = useMemo(
    () => (view === null ? null : normalizeConfig(view.config)),
    [view],
  );
  const configDirty =
    draft !== null &&
    normalizedSaved !== null &&
    JSON.stringify(draft) !== JSON.stringify(normalizedSaved);
  const issues = useMemo(
    () => (draft === null ? [] : validateConfig(draft, primaryCurrency)),
    [draft, primaryCurrency],
  );
  const issueMap = useMemo(
    () => new Map(issues.map((issue) => [issue.path, issue.message])),
    [issues],
  );

  async function reload() {
    if (
      configDirty &&
      !window.confirm("有未保存的配置修改，重新读取会丢弃这些修改。继续？")
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await load();
      setNotice("已重新读取账本与配置");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!view || !draft || !canWrite || issues.length > 0) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const value = await request<View>(`${endpoint.split("?")[0]}/save`, {
        ledgerId,
        revision: view.revision,
        config: draft,
      });
      acceptView(value);
      setNotice("配置已保存，估值已重新计算");
      setTab("overview");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }

  const updateDraft: UpdateDraft = (change) => {
    setDraft((current) => (current === null ? current : change(current)));
  };

  const accounts = view?.analysis.accounts ?? [];
  const generated = view?.analysis.generated;
  const ledgerIssueCount = view
    ? view.ledgerErrors.length > 0
      ? view.ledgerErrors.length
      : view.ledgerError
        ? 1
        : 0
    : 0;
  const issueCount =
    (view?.analysis.errors.length ?? 0) +
    ledgerIssueCount +
    (view?.configError ? 1 : 0);
  const knownAccounts = [
    ...new Set([
      ...accounts.map((account) => account.account),
      ...(draft?.accounts.map((account) => account.account) ?? []),
    ]),
  ].filter(Boolean);
  const stats = useMemo<Array<[string, string]>>(
    () => [
      ["账户", String(accounts.length)],
      ["虚拟价格", String(generated?.prices ?? 0)],
    ],
    [accounts.length, generated],
  );

  return (
    <main className="ve-page">
      <style>{styles}</style>

      <header className="ve-header">
        <div className="ve-title">
          <h1>估值</h1>
          <p>
            读取 <code>custom "valuation"</code>，在内存中生成虚拟份额、价格和
            盈亏。配置全部在界面中完成，不直接编辑 JSON。
          </p>
        </div>
        <div className="ve-actions">
          <button
            type="button"
            className="ve-button"
            disabled={busy}
            onClick={() => void reload()}
          >
            {busy ? "读取中…" : "重新计算"}
          </button>
          {tab === "config" ? (
            <button
              type="button"
              className="ve-button primary"
              disabled={
                !draft ||
                saving ||
                !canWrite ||
                !configDirty ||
                issues.length > 0
              }
              onClick={() => void save()}
            >
              {saving ? "保存中…" : "保存配置"}
            </button>
          ) : null}
        </div>
      </header>

      {error ? <div className="ve-alert error">{error}</div> : null}
      {notice ? <div className="ve-alert notice">{notice}</div> : null}

      <div className="ve-tabs" role="tablist" aria-label="估值插件视图">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          className={`ve-tab${tab === "overview" ? " is-active" : ""}`}
          onClick={() => setTab("overview")}
        >
          概览
          {issueCount > 0 ? (
            <span className="ve-tab-badge">{issueCount}</span>
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "config"}
          className={`ve-tab${tab === "config" ? " is-active" : ""}`}
          onClick={() => setTab("config")}
        >
          配置
          {issues.length > 0 ? (
            <span className="ve-tab-badge">{issues.length}</span>
          ) : null}
        </button>
      </div>

      {tab === "overview" ? (
        <Overview view={view} stats={stats} issueCount={issueCount} />
      ) : (
        <ConfigEditor
          draft={draft}
          issues={issueMap}
          primaryCurrency={primaryCurrency}
          knownAccounts={knownAccounts}
          canWrite={canWrite}
          saving={saving}
          configDirty={configDirty}
          configPath={view?.configPath ?? "plugins/valuation/config.json"}
          exists={view?.exists ?? false}
          onSave={() => void save()}
          onReset={() => setDraft(normalizedSaved)}
          updateDraft={updateDraft}
        />
      )}
    </main>
  );
}
