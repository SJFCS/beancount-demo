import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { LOCAL_CONFIG_STYLES } from "./styles";

type Props = {
  ledgerId: string;
  canWrite: boolean;
  api: {
    fetchLocal(path: string, init?: RequestInit): Promise<Response>;
  };
};

type NavigationGroup =
  | "root"
  | "primary"
  | "reports"
  | "plugins"
  | "import"
  | "footer";
type NavigationPosition = "first" | "last" | number;
type DropEdge = "before" | "after";
type DropTarget = { id: string; edge: DropEdge };

type PluginNavigation = {
  quickMenu: boolean;
  group: NavigationGroup;
  position: NavigationPosition;
  registered: boolean;
};

type PluginItem = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  configured: boolean;
  enabled: boolean;
  settings: Record<string, unknown>;
  navigation: PluginNavigation;
};

type ConfigView = {
  revision: string;
  source: string;
  configPath: string;
  exists: boolean;
  valid: boolean;
  error: string | null;
  plugins: PluginItem[];
};

type Tab = "plugins" | "yaml";

const ENDPOINT = "/api-gateway/local/plugins/local_config/api";
const LOCAL_CONFIG_ID = "local_config";
const GROUPS: Array<{ value: NavigationGroup; label: string }> = [
  { value: "root", label: "根级导航" },
  { value: "primary", label: "主菜单" },
  { value: "reports", label: "报表" },
  { value: "plugins", label: "插件分组" },
  { value: "import", label: "导入" },
  { value: "footer", label: "页脚" },
];
const SETTING_SELECT_OPTIONS: Record<
  string,
  ReadonlyArray<{ value: string; label: string }>
> = {
  generation_mode: [
    { value: "all", label: "全部生成" },
    { value: "through_today", label: "只生成截止今天" },
    { value: "pending", label: "全部生成，未来标记 !" },
  ],
};

function isMapping(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneSettings<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function updateAtPath(
  value: unknown,
  [head, ...tail]: readonly string[],
  next: unknown,
): unknown {
  if (!head) return next;
  const mapping = isMapping(value) ? value : {};
  return {
    ...mapping,
    [head]: updateAtPath(mapping[head], tail, next),
  };
}

function labelFor(key: string): string {
  return key
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/gu, (character) => character.toUpperCase());
}

function positionSelectValue(position: NavigationPosition): string {
  return typeof position === "number" ? "number" : position;
}

function findTextMatches(source: string, query: string): number[] {
  const value = query.trim();
  if (!value) return [];
  const pattern = new RegExp(
    value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"),
    "giu",
  );
  return [...source.matchAll(pattern)].map((match) => match.index);
}

async function requestView(
  api: Props["api"],
  ledgerId: string,
  signal?: AbortSignal,
): Promise<ConfigView> {
  const response = await api.fetchLocal(
    `${ENDPOINT}?ledgerId=${encodeURIComponent(ledgerId)}`,
    { signal },
  );
  const payload = (await response.json()) as ConfigView & { error?: string };
  if (!response.ok) throw new Error(payload.error || "读取插件配置失败");
  return payload;
}

export default function LocalConfigPlugin({ ledgerId, canWrite, api }: Props) {
  const [view, setView] = useState<ConfigView | null>(null);
  const [source, setSource] = useState("");
  const [tab, setTab] = useState<Tab>("plugins");
  const [selectedId, setSelectedId] = useState("");
  const [settingsDraft, setSettingsDraft] = useState<Record<string, unknown>>(
    {},
  );
  const [enabledDraft, setEnabledDraft] = useState(false);
  const [navigationDraft, setNavigationDraft] =
    useState<PluginNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [yamlSearch, setYamlSearch] = useState("");
  const [yamlSearchIndex, setYamlSearchIndex] = useState(-1);
  const [draggedPluginId, setDraggedPluginId] = useState("");
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchComposingRef = useRef(false);
  const gutterRef = useRef<HTMLDivElement>(null);

  function adopt(next: ConfigView, preferredId?: string) {
    setView(next);
    setSource(next.source);
    const targetId =
      preferredId ??
      (next.plugins.some((plugin) => plugin.id === selectedId)
        ? selectedId
        : (next.plugins[0]?.id ?? ""));
    setSelectedId(targetId);
    const selected = next.plugins.find((plugin) => plugin.id === targetId);
    setSettingsDraft(cloneSettings(selected?.settings ?? {}));
    setEnabledDraft(selected?.enabled ?? false);
    setNavigationDraft(selected ? cloneSettings(selected.navigation) : null);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setNotice("");
    void requestView(api, ledgerId, controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) adopt(next);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [api, ledgerId]);

  useEffect(() => {
    if (tab !== "yaml") return;
    const interceptFind = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", interceptFind, true);
    return () => window.removeEventListener("keydown", interceptFind, true);
  }, [tab]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const dirty = view !== null && source !== view.source;
  const selectedPlugin = view?.plugins.find(
    (plugin) => plugin.id === selectedId,
  );
  const detailDirty =
    selectedPlugin !== undefined &&
    navigationDraft !== null &&
    (enabledDraft !== selectedPlugin.enabled ||
      JSON.stringify(settingsDraft) !==
        JSON.stringify(selectedPlugin.settings) ||
      navigationDraft.registered !== selectedPlugin.navigation.registered ||
      navigationDraft.quickMenu !== selectedPlugin.navigation.quickMenu ||
      navigationDraft.group !== selectedPlugin.navigation.group ||
      navigationDraft.position !== selectedPlugin.navigation.position);
  const lineCount = Math.max(1, source.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_value, index) =>
    String(index + 1),
  );
  const enabledCount =
    view?.plugins.filter((plugin) => plugin.enabled).length ?? 0;
  const quickMenuCount =
    view?.plugins.filter((plugin) => plugin.navigation.quickMenu).length ?? 0;
  const availableCount =
    view?.plugins.filter((plugin) => plugin.available).length ?? 0;
  const yamlSearchMatches = findTextMatches(source, yamlSearch);
  const activeYamlSearchIndex =
    yamlSearchMatches.length === 0
      ? -1
      : yamlSearchIndex >= 0 && yamlSearchIndex < yamlSearchMatches.length
        ? yamlSearchIndex
        : 0;

  function revealYamlMatch(index: number, query = yamlSearch) {
    const matches = findTextMatches(source, query);
    if (matches.length === 0) {
      setYamlSearchIndex(-1);
      return;
    }
    const normalized =
      ((index % matches.length) + matches.length) % matches.length;
    const start = matches[normalized]!;
    setYamlSearchIndex(normalized);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.setSelectionRange(start, start + query.trim().length);
      const line = source.slice(0, start).split("\n").length;
      const lineHeight =
        Number.parseFloat(getComputedStyle(textarea).lineHeight) || 22;
      textarea.scrollTop = Math.max(0, (line - 2) * lineHeight);
      syncGutter();
    });
  }

  function updateYamlSearch(query: string) {
    setYamlSearch(query);
    const matches = findTextMatches(source, query);
    setYamlSearchIndex(matches.length > 0 ? 0 : -1);
    if (matches.length > 0 && textareaRef.current) {
      revealYamlMatch(0, query);
    }
  }

  function selectPlugin(plugin: PluginItem) {
    if (detailDirty) return;
    setSelectedId(plugin.id);
    setSettingsDraft(cloneSettings(plugin.settings));
    setEnabledDraft(plugin.enabled);
    setNavigationDraft(cloneSettings(plugin.navigation));
    setError("");
    setNotice("");
  }

  async function postView(
    action: string,
    body: Record<string, unknown>,
    preferredId?: string,
  ): Promise<ConfigView> {
    if (action !== "save" && view !== null && source !== view.source) {
      throw new Error("请先保存或放弃完整 YAML 中的修改");
    }
    if (action === "save" && detailDirty) {
      throw new Error("请先保存或放弃当前插件的设置修改");
    }
    const response = await api.fetchLocal(`${ENDPOINT}/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ledgerId, ...body }),
    });
    const payload = (await response.json()) as ConfigView & { error?: string };
    if (!response.ok) throw new Error(payload.error || "保存插件配置失败");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("beancount:local-plugin-catalog-changed"));
    }
    adopt(payload, preferredId);
    return payload;
  }

  async function savePlugin(
    plugin: PluginItem,
    patch: {
      enabled?: boolean;
      settings?: Record<string, unknown>;
      navigation?: PluginNavigation;
    },
    message = "插件设置已保存",
  ) {
    if (!view || !canWrite || busy || dirty) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body: Record<string, unknown> = {
        revision: view.revision,
        pluginId: plugin.id,
        enabled: patch.enabled ?? plugin.enabled,
        settings: patch.settings ?? plugin.settings,
      };
      if (patch.navigation) {
        body.navigation = {
          quickMenu: patch.navigation.quickMenu,
          group: patch.navigation.group,
          position: patch.navigation.position,
        };
      }
      await postView("plugin", body, plugin.id);
      setNotice(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function saveSelected() {
    if (!selectedPlugin || !navigationDraft || dirty) return;
    const navigationChanged =
      navigationDraft.registered !== selectedPlugin.navigation.registered ||
      navigationDraft.quickMenu !== selectedPlugin.navigation.quickMenu ||
      navigationDraft.group !== selectedPlugin.navigation.group ||
      navigationDraft.position !== selectedPlugin.navigation.position;
    await savePlugin(selectedPlugin, {
      enabled: enabledDraft,
      settings: settingsDraft,
      ...(navigationChanged ? { navigation: navigationDraft } : {}),
    });
  }

  async function saveRaw() {
    if (!view || !canWrite || busy || detailDirty || !dirty) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await postView("save", {
        revision: view.revision,
        source,
      });
      setNotice("完整 YAML 已保存");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const next = await requestView(api, ledgerId);
      adopt(next, selectedId);
      setNotice("已重新读取 benacount-local.yaml");
      if (tab === "yaml") textareaRef.current?.focus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function movePlugin(
    dragged: PluginItem,
    target: PluginItem,
    edge: DropEdge,
  ) {
    if (
      !view ||
      !canWrite ||
      busy ||
      dirty ||
      detailDirty ||
      !dragged.configured ||
      !target.configured ||
      dragged.id === target.id
    ) {
      return;
    }
    const group = view.plugins.filter((candidate) => candidate.configured);
    const ordered = group.map((candidate) => candidate.id);
    const sourceIndex = ordered.indexOf(dragged.id);
    if (sourceIndex < 0 || !ordered.includes(target.id)) return;
    ordered.splice(sourceIndex, 1);
    const targetIndex = ordered.indexOf(target.id) + (edge === "after" ? 1 : 0);
    ordered.splice(targetIndex, 0, dragged.id);
    if (ordered.every((id, index) => id === group[index]?.id)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await postView(
        "reorder",
        {
          revision: view.revision,
          group: "all",
          pluginIds: ordered,
        },
        selectedId,
      );
      setNotice("插件顺序已更新");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  function setSetting(path: string[], value: unknown) {
    setSettingsDraft(
      (current) =>
        updateAtPath(current, path, value) as Record<string, unknown>,
    );
    setNotice("");
  }

  function renderSettings(
    mapping: Record<string, unknown>,
    base: string[] = [],
  ): ReactNode {
    const entries = Object.entries(mapping);
    if (entries.length === 0) {
      return (
        <p className="lc-empty-settings">
          此插件没有额外的非布尔设置，可直接保存基础项。
        </p>
      );
    }
    return (
      <div className="lc-setting-grid">
        {entries.map(([key, value]) => {
          const path = [...base, key];
          if (isMapping(value)) {
            return (
              <fieldset className="lc-setting-section" key={path.join(".")}>
                <legend>{labelFor(key)}</legend>
                {renderSettings(value, path)}
              </fieldset>
            );
          }
          const fieldId = `lc-setting-${path.join("-").replaceAll(".", "-")}`;
          if (typeof value === "boolean") {
            return (
              <label className="lc-field-row" htmlFor={fieldId} key={fieldId}>
                <span>
                  <strong>{labelFor(key)}</strong>
                  <small>{key}</small>
                </span>
                <span className="lc-switch">
                  <input
                    id={fieldId}
                    type="checkbox"
                    checked={value}
                    disabled={!canWrite || dirty}
                    onChange={(event) =>
                      setSetting(path, event.currentTarget.checked)
                    }
                  />
                  <i aria-hidden="true" />
                </span>
              </label>
            );
          }
          if (typeof value === "number") {
            return (
              <label className="lc-field-row" htmlFor={fieldId} key={fieldId}>
                <span>
                  <strong>{labelFor(key)}</strong>
                  <small>{key}</small>
                </span>
                <input
                  id={fieldId}
                  className="lc-field-input is-number"
                  type="number"
                  value={value}
                  disabled={!canWrite || dirty}
                  onChange={(event) =>
                    setSetting(path, Number(event.currentTarget.value))
                  }
                />
              </label>
            );
          }
          if (value === null) {
            return (
              <label className="lc-field-row" htmlFor={fieldId} key={fieldId}>
                <span>
                  <strong>{labelFor(key)}</strong>
                  <small>{key} · 空值</small>
                </span>
                <input
                  id={fieldId}
                  className="lc-field-input"
                  value=""
                  disabled={!canWrite || dirty}
                  placeholder="null"
                  onChange={(event) =>
                    setSetting(path, event.currentTarget.value.trim() || null)
                  }
                />
              </label>
            );
          }
          if (typeof value === "string") {
            const options = SETTING_SELECT_OPTIONS[key];
            if (options) {
              const hasCurrentValue = options.some(
                (option) => option.value === value,
              );
              return (
                <label className="lc-field-row" htmlFor={fieldId} key={fieldId}>
                  <span>
                    <strong>{labelFor(key)}</strong>
                    <small>{key}</small>
                  </span>
                  <select
                    id={fieldId}
                    className="lc-field-input"
                    value={value}
                    disabled={!canWrite || dirty}
                    onChange={(event) =>
                      setSetting(path, event.currentTarget.value)
                    }
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {!hasCurrentValue ? (
                      <option value={value}>{value}（自定义）</option>
                    ) : null}
                  </select>
                </label>
              );
            }
            return (
              <label className="lc-field-row" htmlFor={fieldId} key={fieldId}>
                <span>
                  <strong>{labelFor(key)}</strong>
                  <small>{key}</small>
                </span>
                <input
                  id={fieldId}
                  className="lc-field-input"
                  value={value}
                  disabled={!canWrite || dirty}
                  onChange={(event) =>
                    setSetting(path, event.currentTarget.value)
                  }
                />
              </label>
            );
          }
          return (
            <div className="lc-field-row" key={fieldId}>
              <span>
                <strong>{labelFor(key)}</strong>
                <small>{key}</small>
              </span>
              <code>{JSON.stringify(value)}</code>
            </div>
          );
        })}
      </div>
    );
  }

  function insertIndent(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (tab === "plugins") void saveSelected();
      else void saveRaw();
      return;
    }
    if (event.key !== "Tab" || !canWrite) return;
    event.preventDefault();
    const element = event.currentTarget;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    setSource(`${source.slice(0, start)}  ${source.slice(end)}`);
    requestAnimationFrame(() => {
      element.selectionStart = start + 2;
      element.selectionEnd = start + 2;
    });
  }

  function syncGutter() {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  return (
    <section className="lc-shell">
      <style>{LOCAL_CONFIG_STYLES}</style>
      <div className="lc-page">
        <header className="lc-hero">
          <div>
            <span className="lc-eyebrow">Ledger / Plugin registry</span>
            <h1 className="lc-title">
              插件<em>配置</em>
            </h1>
            <p className="lc-lede">
              用图形界面管理插件启停、导航注册和显示顺序，也可以进入单个插件编辑它所属的
              YAML 段落。完整配置文件编辑器仍然保留。
            </p>
          </div>
          <div className="lc-file-badge">
            <span>配置文件</span>
            <code>{view?.configPath ?? "benacount-local.yaml"}</code>
          </div>
        </header>

        {error ? (
          <div className="lc-message is-error" role="alert">
            <strong>操作未完成</strong>
            <span>{error}</span>
          </div>
        ) : null}
        {view?.error ? (
          <div className="lc-message is-warning" role="alert">
            <strong>当前 YAML 有误</strong>
            <span>{view.error}</span>
          </div>
        ) : null}
        {dirty && tab === "plugins" ? (
          <div className="lc-message is-warning" role="alert">
            <strong>完整 YAML 尚未保存</strong>
            <span>
              请先保存或放弃完整 YAML 中的修改，再使用图形化配置，以免覆盖草稿。
            </span>
          </div>
        ) : null}
        {detailDirty ? (
          <div className="lc-message is-warning" role="alert">
            <strong>插件设置尚未保存</strong>
            <span>
              请先保存当前插件设置，或使用“放弃修改并重新读取”，再切换插件或保存完整
              YAML。
            </span>
          </div>
        ) : null}
        {notice ? (
          <div
            className="lc-message is-success lc-toast"
            role="status"
            aria-atomic="true"
          >
            <strong>已同步</strong>
            <span>{notice}</span>
          </div>
        ) : null}

        <div className="lc-tabs" role="tablist" aria-label="插件配置视图">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "plugins"}
            onClick={() => setTab("plugins")}
          >
            图形化配置
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "yaml"}
            onClick={() => setTab("yaml")}
          >
            完整 YAML
            {dirty ? <i aria-label="有未保存修改" /> : null}
          </button>
          <span />
          <button
            className="lc-button"
            type="button"
            disabled={busy}
            onClick={() => void reload()}
          >
            {dirty || detailDirty ? "放弃修改并重新读取" : "重新读取"}
          </button>
          <button
            className="lc-button is-primary"
            type="button"
            disabled={
              !canWrite ||
              busy ||
              (tab === "plugins"
                ? !selectedPlugin || dirty
                : detailDirty || !dirty)
            }
            onClick={() =>
              tab === "plugins" ? void saveSelected() : void saveRaw()
            }
          >
            {busy ? "保存中…" : tab === "plugins" ? "保存此插件" : "保存 YAML"}
          </button>
        </div>

        {loading || !view ? (
          <div className="lc-loading">正在读取插件配置…</div>
        ) : tab === "yaml" ? (
          <section className="lc-editor-card" aria-label="完整 YAML 编辑器">
            <div className="lc-toolbar">
              <span className="lc-state" data-dirty={dirty}>
                {dirty ? "有未保存修改" : canWrite ? "已同步" : "只读"}
              </span>
              <span className="lc-toolbar-spacer" />
              <div className="lc-search" role="search">
                <input
                  ref={searchInputRef}
                  aria-label="在完整 YAML 中搜索"
                  value={yamlSearch}
                  placeholder="搜索 YAML"
                  onCompositionStart={() => {
                    searchComposingRef.current = true;
                  }}
                  onCompositionEnd={(event) => {
                    searchComposingRef.current = false;
                    updateYamlSearch(event.currentTarget.value);
                  }}
                  onChange={(event) => {
                    const query = event.currentTarget.value;
                    if (searchComposingRef.current) {
                      setYamlSearch(query);
                      setYamlSearchIndex(-1);
                      return;
                    }
                    updateYamlSearch(query);
                  }}
                  onKeyDown={(event) => {
                    if (
                      searchComposingRef.current ||
                      event.nativeEvent.isComposing
                    ) {
                      return;
                    }
                    if (event.key === "Enter") {
                      event.preventDefault();
                      revealYamlMatch(
                        activeYamlSearchIndex + (event.shiftKey ? -1 : 1),
                      );
                    } else if (event.key === "Escape") {
                      updateYamlSearch("");
                      textareaRef.current?.focus();
                    }
                  }}
                />
                <span className="lc-search-count" aria-live="polite">
                  {yamlSearch.trim()
                    ? `${yamlSearchMatches.length > 0 ? activeYamlSearchIndex + 1 : 0}/${yamlSearchMatches.length}`
                    : "0/0"}
                </span>
                <button
                  type="button"
                  aria-label="上一个匹配项"
                  disabled={yamlSearchMatches.length === 0}
                  onClick={() => revealYamlMatch(activeYamlSearchIndex - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="下一个匹配项"
                  disabled={yamlSearchMatches.length === 0}
                  onClick={() => revealYamlMatch(activeYamlSearchIndex + 1)}
                >
                  ↓
                </button>
                {yamlSearch ? (
                  <button
                    type="button"
                    aria-label="清除搜索"
                    onClick={() => {
                      updateYamlSearch("");
                      textareaRef.current?.focus();
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <span className="lc-toolbar-note">
                注释、空行和人工排版会原样保留
              </span>
            </div>
            <div className="lc-editor">
              <div ref={gutterRef} className="lc-lines" aria-hidden="true">
                <div className="lc-lines-inner">
                  {lineNumbers.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
              <textarea
                ref={textareaRef}
                className="lc-editor-input"
                aria-label="benacount-local.yaml 内容"
                value={source}
                readOnly={!canWrite}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                onChange={(event) => {
                  setSource(event.currentTarget.value);
                  setError("");
                  setNotice("");
                }}
                onKeyDown={insertIndent}
                onScroll={syncGutter}
              />
            </div>
          </section>
        ) : (
          <>
            <div className="lc-summary">
              <span>
                <strong>{availableCount}</strong> 已安装
              </span>
              <span>
                <strong>{enabledCount}</strong> 已启用
              </span>
              <span>
                <strong>{quickMenuCount}</strong> 已加入快捷菜单
              </span>
            </div>
            <div className="lc-management">
              <section className="lc-plugin-list" aria-label="插件列表">
                <header>
                  <div>
                    <span>Registry</span>
                    <h2>所属插件</h2>
                  </div>
                  <small>点击插件编辑所属段落</small>
                </header>
                <div className="lc-plugin-scroll">
                  {view.plugins.map((plugin) => {
                    const draggable =
                      canWrite &&
                      !busy &&
                      !dirty &&
                      !detailDirty &&
                      plugin.configured;
                    const draggedPlugin = view.plugins.find(
                      (candidate) => candidate.id === draggedPluginId,
                    );
                    const dropAllowed =
                      draggedPlugin !== undefined &&
                      !dirty &&
                      !detailDirty &&
                      draggedPlugin.id !== plugin.id &&
                      draggedPlugin.configured &&
                      plugin.configured;
                    const activeDropEdge =
                      dropAllowed && dropTarget?.id === plugin.id
                        ? dropTarget.edge
                        : null;
                    const dropEdgeAt = (event: {
                      clientY: number;
                      currentTarget: HTMLElement;
                    }): DropEdge => {
                      const bounds =
                        event.currentTarget.getBoundingClientRect();
                      const pointerY = Number.isFinite(event.clientY)
                        ? event.clientY
                        : 0;
                      return pointerY > bounds.top + bounds.height / 2
                        ? "after"
                        : "before";
                    };
                    return (
                      <article
                        className="lc-plugin-item"
                        data-selected={selectedId === plugin.id}
                        data-draggable={draggable}
                        data-dragging={draggedPluginId === plugin.id}
                        data-drop-target={activeDropEdge !== null}
                        data-drop-position={activeDropEdge}
                        key={plugin.id}
                        draggable={draggable}
                        onDragStart={(event) => {
                          setDraggedPluginId(plugin.id);
                          setDropTarget(null);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", plugin.id);
                        }}
                        onDragEnd={() => {
                          setDraggedPluginId("");
                          setDropTarget(null);
                        }}
                        onDragOver={(event) => {
                          if (!dropAllowed) return;
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          setDropTarget({
                            id: plugin.id,
                            edge: dropEdgeAt(event),
                          });
                        }}
                        onDrop={(event) => {
                          if (!draggedPlugin) return;
                          event.preventDefault();
                          const edge = dropEdgeAt(event);
                          setDraggedPluginId("");
                          setDropTarget(null);
                          void movePlugin(draggedPlugin, plugin, edge);
                        }}
                      >
                        <div className="lc-plugin-row">
                          <button
                            className="lc-plugin-select"
                            type="button"
                            aria-label={`编辑 ${plugin.name}`}
                            disabled={busy || detailDirty}
                            onClick={() => selectPlugin(plugin)}
                          >
                            <span className="lc-plugin-mark">
                              {plugin.name.slice(0, 1)}
                            </span>
                            <span className="lc-plugin-copy">
                              <strong>{plugin.name}</strong>
                              <small>
                                {plugin.id}
                                {!plugin.available ? " · 未安装" : ""}
                              </small>
                            </span>
                          </button>
                          <span className="lc-plugin-statuses">
                            <button
                              className="lc-status-toggle"
                              type="button"
                              aria-pressed={plugin.enabled}
                              aria-label={`切换 ${plugin.name} 启用状态`}
                              data-on={plugin.enabled}
                              disabled={
                                !canWrite || busy || dirty || detailDirty
                              }
                              onClick={() =>
                                void savePlugin(plugin, {
                                  enabled: !plugin.enabled,
                                })
                              }
                            >
                              {plugin.enabled ? "已启用" : "已关闭"}
                            </button>
                            <button
                              className="lc-status-toggle"
                              type="button"
                              aria-pressed={plugin.navigation.quickMenu}
                              aria-label={`切换 ${plugin.name} 快捷菜单`}
                              data-on={plugin.navigation.quickMenu}
                              disabled={
                                !canWrite ||
                                busy ||
                                dirty ||
                                detailDirty ||
                                !plugin.available ||
                                !plugin.navigation.registered
                              }
                              onClick={() =>
                                void savePlugin(plugin, {
                                  navigation: {
                                    ...plugin.navigation,
                                    quickMenu: !plugin.navigation.quickMenu,
                                  },
                                })
                              }
                            >
                              {!plugin.navigation.registered
                                ? "未注册侧边栏"
                                : plugin.navigation.quickMenu
                                  ? "已加入快捷菜单"
                                  : "未加入快捷菜单"}
                            </button>
                          </span>
                        </div>
                        <div className="lc-plugin-footer">
                          <span>
                            {dirty
                              ? "先保存或放弃完整 YAML 草稿"
                              : detailDirty
                                ? "先保存当前插件设置"
                                : plugin.configured
                                  ? "拖动卡片调整插件顺序"
                                  : "写入 plugins 配置后可排序"}
                          </span>
                          {!plugin.available ? <em>清单未安装</em> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section
                className="lc-plugin-detail"
                aria-label={
                  selectedPlugin
                    ? `${selectedPlugin.name} 详细设置`
                    : "插件详细设置"
                }
                aria-live="polite"
              >
                {selectedPlugin && navigationDraft ? (
                  <>
                    <header className="lc-detail-head">
                      <div>
                        <span>
                          {selectedPlugin.available
                            ? selectedPlugin.id
                            : `${selectedPlugin.id} · 未安装`}
                        </span>
                        <h2>{selectedPlugin.name}</h2>
                        <p>{selectedPlugin.description}</p>
                      </div>
                      <div className="lc-detail-state">
                        <button
                          className="lc-status-toggle"
                          type="button"
                          aria-pressed={enabledDraft}
                          aria-label={`切换 ${selectedPlugin.name} 启用状态`}
                          data-on={enabledDraft}
                          disabled={!canWrite || dirty}
                          onClick={() => setEnabledDraft((current) => !current)}
                        >
                          {enabledDraft ? "已启用" : "已关闭"}
                        </button>
                        <button
                          className="lc-status-toggle"
                          type="button"
                          aria-pressed={navigationDraft.quickMenu}
                          aria-label={`切换 ${selectedPlugin.name} 快捷菜单`}
                          data-on={navigationDraft.quickMenu}
                          disabled={
                            !canWrite ||
                            dirty ||
                            !selectedPlugin.available ||
                            !navigationDraft.registered
                          }
                          onClick={() =>
                            setNavigationDraft({
                              ...navigationDraft,
                              quickMenu: !navigationDraft.quickMenu,
                            })
                          }
                        >
                          {!navigationDraft.registered
                            ? "未注册侧边栏"
                            : navigationDraft.quickMenu
                              ? "已加入快捷菜单"
                              : "未加入快捷菜单"}
                        </button>
                      </div>
                    </header>

                    <div className="lc-detail-basics">
                      <label className="lc-field-row">
                        <span>
                          <strong>导航分组</strong>
                          <small>group</small>
                        </span>
                        <select
                          className="lc-field-input"
                          value={
                            navigationDraft.registered
                              ? navigationDraft.group
                              : ""
                          }
                          disabled={
                            !canWrite ||
                            dirty ||
                            !selectedPlugin.available ||
                            selectedPlugin.id === LOCAL_CONFIG_ID
                          }
                          onChange={(event) =>
                            setNavigationDraft({
                              ...navigationDraft,
                              group: event.currentTarget
                                .value as NavigationGroup,
                              registered: true,
                            })
                          }
                        >
                          {!navigationDraft.registered ? (
                            <option value="" disabled>
                              未注册侧边栏
                            </option>
                          ) : null}
                          {GROUPS.map((group) => (
                            <option key={group.value} value={group.value}>
                              {group.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="lc-field-row">
                        <span>
                          <strong>导航顺序</strong>
                          <small>position</small>
                        </span>
                        <span className="lc-position-control">
                          <select
                            className="lc-field-input"
                            value={positionSelectValue(
                              navigationDraft.position,
                            )}
                            disabled={
                              !canWrite ||
                              dirty ||
                              !selectedPlugin.available ||
                              selectedPlugin.id === LOCAL_CONFIG_ID
                            }
                            onChange={(event) => {
                              const value = event.currentTarget.value;
                              setNavigationDraft({
                                ...navigationDraft,
                                position:
                                  value === "first" || value === "last"
                                    ? value
                                    : 0,
                                registered: true,
                              });
                            }}
                          >
                            <option value="first">首位</option>
                            <option value="last">末位</option>
                            <option value="number">指定序号</option>
                          </select>
                          {typeof navigationDraft.position === "number" ? (
                            <input
                              className="lc-field-input is-number"
                              type="number"
                              min="0"
                              value={navigationDraft.position}
                              disabled={
                                !canWrite ||
                                dirty ||
                                selectedPlugin.id === LOCAL_CONFIG_ID
                              }
                              onChange={(event) =>
                                setNavigationDraft({
                                  ...navigationDraft,
                                  position: Math.max(
                                    0,
                                    Number(event.currentTarget.value),
                                  ),
                                })
                              }
                            />
                          ) : null}
                        </span>
                      </label>
                    </div>

                    <section className="lc-detail-settings">
                      <header>
                        <div>
                          <span>YAML section</span>
                          <h3>所属段落</h3>
                        </div>
                        <code>plugins.{selectedPlugin.id}</code>
                      </header>
                      {renderSettings(settingsDraft)}
                    </section>
                  </>
                ) : (
                  <div className="lc-detail-empty">选择一个插件开始配置</div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
