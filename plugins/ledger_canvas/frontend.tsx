import { useEffect, useMemo, useState } from "react";
import { EnableToggle } from "./frontend/enable-toggle";
import { PresetNameEditor } from "./frontend/inline-name-editor";
import { PresetEditor } from "./frontend/preset-editor";
import { PresetDataViewControl } from "./frontend/preset-data-view";
import { PresetPreviewPanel } from "./frontend/preset-preview";
import { QueryRuleEditor } from "./frontend/query-rule-editor";
import { RuleEditor } from "./frontend/rule-editor";
import { PreviewSection } from "./frontend/rule-preview";
import { STYLES } from "./frontend/styles";
import {
  cloneConfig,
  deletedPresetReferenceCount,
  displayFilter,
  emptyQuery,
  emptyRule,
  filterPatternError,
  hasFilterCondition,
  isValidPresetName,
  moveRuleBy,
  presetDefinitionsDirty,
  presetNameError,
  presetReferenceCount,
  presetViewsDirty,
  queryHasCondition,
  queryPresetReferences,
  removePresetFromDraft,
  removeRuleFromDraft,
  renamePresetInQuery,
  renamePresetInRule,
  reorderRules,
  ruleHasCondition,
  ruleHasEffect,
  rulePresetReferences,
} from "./frontend/model";
import type {
  CatalogPreview,
  Config,
  Filter,
  PresetDataView,
  PresetScope,
  PreviewView,
  Props,
  QueryRule,
  Rule,
  RuleDropPosition,
  RuleDropTarget,
  SelectionCatalog,
  View,
} from "./frontend/types";

type LivePreview = {
  key: string;
  config: Config;
  data: PreviewView;
};

type PreviewError = {
  key: string;
  message: string;
};

type CatalogPreviewSnapshot = {
  key: string;
  config: Config;
  data: CatalogPreview;
};

const EMPTY_SELECTION_CATALOG: SelectionCatalog = {
  accounts: [],
  payees: [],
  narrations: [],
  tags: [],
  metadata: [],
};

function presetDataView(config: Config, name: string): PresetDataView {
  return (
    config.presetViews[name] ?? {
      mode: config.presetScopes[name] === "query" ? "mapped" : "raw",
      disabledRuleIds: config.rules
        .filter((rule) => !rule.enabled)
        .map((rule) => rule.id),
    }
  );
}

function catalogSourceKey(config: Config, name: string): string {
  const view = presetDataView(config, name);
  if (view.mode === "raw") return "raw";
  const referencedPresets = new Set(
    config.rules.flatMap((rule) => rulePresetReferences(rule)),
  );
  return JSON.stringify({
    mode: "mapped",
    enabled: config.enabled,
    presets: Object.fromEntries(
      [...referencedPresets]
        .sort()
        .map((preset) => [preset, config.presets[preset]]),
    ),
    rules: config.rules,
    disabledRuleIds: [...view.disabledRuleIds].sort(),
  });
}

export default function LedgerCanvasPlugin({ ledgerId, canWrite, api }: Props) {
  const [view, setView] = useState<View | null>(null);
  const [draft, setDraft] = useState<Config | null>(null);
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [catalogPreview, setCatalogPreview] =
    useState<CatalogPreviewSnapshot | null>(null);
  const [previewError, setPreviewError] = useState<PreviewError | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingSection, setSavingSection] = useState<
    "presets" | "rules" | null
  >(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ruleSearch, setRuleSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);
  const [ruleDropTarget, setRuleDropTarget] = useState<RuleDropTarget | null>(
    null,
  );
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<PresetScope>("mapping");

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
    if (!response.ok) throw new Error(payload.error || "请求失败");
    return payload as T;
  }

  function applyView(value: View) {
    setView(value);
    setDraft(cloneConfig(value.config));
    setLivePreview(null);
    setCatalogPreview(null);
    setPreviewError(null);
    setDraggedRuleId(null);
    setRuleDropTarget(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    setView(null);
    setDraft(null);
    setLivePreview(null);
    setCatalogPreview(null);
    setPreviewError(null);
    setError("");
    setMessage("");
    void request<View>(
      `/api-gateway/local/plugins/ledger_canvas/api?ledgerId=${encodeURIComponent(ledgerId)}`,
      undefined,
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) applyView(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => controller.abort();
  }, [ledgerId, api]);

  const presetDefinitionDirty =
    draft !== null &&
    view !== null &&
    presetDefinitionsDirty(draft, view.config);
  const presetViewDirty =
    draft !== null && view !== null && presetViewsDirty(draft, view.config);
  const presetDirty = presetDefinitionDirty || presetViewDirty;
  const rulesDirty =
    draft !== null &&
    view !== null &&
    (draft.enabled !== view.config.enabled ||
      JSON.stringify(draft.rules) !== JSON.stringify(view.config.rules) ||
      JSON.stringify(draft.queries) !== JSON.stringify(view.config.queries));
  const dirty = presetDirty || rulesDirty;
  const { presetIssues, ruleIssues, queryIssues } = useMemo(() => {
    if (!draft) return { presetIssues: [], ruleIssues: [], queryIssues: [] };
    const presetIssues: string[] = [];
    const ruleIssues: string[] = [];
    const queryIssues: string[] = [];
    for (const [name, preset] of Object.entries(draft.presets)) {
      const nameError = presetNameError(name);
      if (nameError) {
        presetIssues.push(`预设名称“${name || "（空）"}”无效：${nameError}`);
        continue;
      }
      if (!hasFilterCondition(preset))
        presetIssues.push(`预设 ${name} 尚未设置匹配条件`);
      const patternError = filterPatternError(preset);
      if (patternError) presetIssues.push(`预设 ${name}：${patternError}`);
    }
    for (const rule of draft.rules) {
      const label = rule.name?.trim() || rule.id;
      const references = rulePresetReferences(rule);
      const missingPreset = references.find(
        (name) => !Object.hasOwn(draft.presets, name),
      );
      const incompletePreset = references.find(
        (name) =>
          Object.hasOwn(draft.presets, name) &&
          !hasFilterCondition(draft.presets[name]),
      );
      const outOfScopePreset = references.find(
        (name) =>
          Object.hasOwn(draft.presets, name) &&
          draft.presetScopes[name] === "query",
      );
      if (missingPreset) {
        ruleIssues.push(`规则 ${label} 引用了不存在的 preset`);
      } else if (incompletePreset) {
        ruleIssues.push(`规则 ${label} 引用的 preset 尚未完成`);
      } else if (outOfScopePreset) {
        ruleIssues.push(
          `规则 ${label} 引用的 preset ${outOfScopePreset} 属于 Query Presets`,
        );
      } else if (references.length === 0 && !rule.time?.trim()) {
        ruleIssues.push(`规则 ${label} 需要引用 preset 或设置时间范围`);
      }
      const duplicateTags = rule.addTags.filter((tag) =>
        rule.removeTags.includes(tag),
      );
      if (duplicateTags.length > 0) {
        ruleIssues.push(
          `规则 ${label} 不能同时添加和移除标签：${duplicateTags.join("、")}`,
        );
      }
      const duplicateMeta = Object.keys(rule.addMeta).filter((key) =>
        rule.removeMeta.includes(key),
      );
      if (duplicateMeta.length > 0) {
        ruleIssues.push(
          `规则 ${label} 不能同时写入和移除元数据：${duplicateMeta.join("、")}`,
        );
      }
      if (!ruleHasEffect(rule))
        ruleIssues.push(
          `规则 ${label} 尚未设置任何动作；添加/移除标签、添加/移除元数据、收款人、摘要任选一项即可`,
        );
    }
    for (const query of draft.queries) {
      const label = query.name?.trim() || query.id;
      const references = queryPresetReferences(query);
      const missingPreset = references.find(
        (name) => !Object.hasOwn(draft.presets, name),
      );
      const incompletePreset = references.find(
        (name) =>
          Object.hasOwn(draft.presets, name) &&
          !hasFilterCondition(draft.presets[name]),
      );
      const outOfScopePreset = references.find(
        (name) =>
          Object.hasOwn(draft.presets, name) &&
          draft.presetScopes[name] !== "query",
      );
      if (missingPreset) {
        queryIssues.push(`查询 ${label} 引用了不存在的 preset`);
      } else if (incompletePreset) {
        queryIssues.push(`查询 ${label} 引用的 preset 尚未完成`);
      } else if (outOfScopePreset) {
        queryIssues.push(
          `查询 ${label} 引用的 preset ${outOfScopePreset} 属于 Mapping Presets`,
        );
      } else if (references.length === 0 && !query.time?.trim()) {
        queryIssues.push(`查询 ${label} 需要引用 preset 或设置时间范围`);
      }
      if ((query.mode ?? "recurring") === "table") {
        const columns = query.columns ?? [];
        const ids = new Set<string>();
        if (columns.length === 0)
          queryIssues.push(`查询 ${label} 至少需要一个表头字段`);
        if (columns.length > 12)
          queryIssues.push(`查询 ${label} 最多支持 12 个表头字段`);
        for (const column of columns) {
          if (!column.id.trim()) {
            queryIssues.push(`查询 ${label} 存在缺少 ID 的表头字段`);
          } else if (ids.has(column.id)) {
            queryIssues.push(`查询 ${label} 存在重复的表头 ID`);
          }
          ids.add(column.id);
          if (!column.label.trim())
            queryIssues.push(`查询 ${label} 存在未命名的表头字段`);
          if (column.source === "meta" && !column.metaKey?.trim())
            queryIssues.push(
              `查询 ${label} 的元数据表头 ${column.label || column.id} 未填写元数据键`,
            );
          else if (
            column.source === "meta" &&
            !/^[A-Za-z0-9_-]{1,64}$/u.test(column.metaKey ?? "")
          )
            queryIssues.push(
              `查询 ${label} 的元数据键 ${column.metaKey} 只能包含字母、数字、下划线和短横线`,
            );
        }
        const groupedColumns = query.groupByColumns ?? [];
        if (new Set(groupedColumns).size !== groupedColumns.length)
          queryIssues.push(`查询 ${label} 的分组键不能重复`);
        const missingGroupColumn = groupedColumns.find((id) => !ids.has(id));
        if (missingGroupColumn)
          queryIssues.push(
            `查询 ${label} 引用了不存在的分组表头 ${missingGroupColumn}`,
          );
      } else if (query.groupBy === "meta" && !query.groupMetaKey?.trim()) {
        queryIssues.push(`查询 ${label} 需要使用元数据分组，但未填写分组键`);
      }
    }
    return { presetIssues, ruleIssues, queryIssues };
  }, [draft]);
  const fullPreviewBlocked =
    presetIssues.length > 0 || ruleIssues.length > 0 || queryIssues.length > 0;
  useEffect(() => {
    if (!draft || !view || !dirty || fullPreviewBlocked || view.configError) {
      setLivePreview(null);
      setPreviewError(null);
      return;
    }
    const controller = new AbortController();
    const requestConfig = draft;
    const requestKey = JSON.stringify(draft);
    const timer = window.setTimeout(() => {
      void request<PreviewView>(
        "/api-gateway/local/plugins/ledger_canvas/api/preview",
        { ledgerId, config: draft },
        controller.signal,
      )
        .then((value) => {
          if (controller.signal.aborted) return;
          setLivePreview({
            key: requestKey,
            config: requestConfig,
            data: value,
          });
          setPreviewError(null);
        })
        .catch((cause) => {
          if (controller.signal.aborted) return;
          setLivePreview(null);
          setPreviewError({
            key: requestKey,
            message: cause instanceof Error ? cause.message : String(cause),
          });
        });
    }, 420);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft, dirty, fullPreviewBlocked, ledgerId, view]);

  useEffect(() => {
    if (!draft || !view || !dirty || !fullPreviewBlocked || view.configError)
      return;
    const controller = new AbortController();
    const requestConfig = draft;
    const requestKey = JSON.stringify(draft);
    const timer = window.setTimeout(() => {
      void request<CatalogPreview>(
        "/api-gateway/local/plugins/ledger_canvas/api/preview-catalogs",
        { ledgerId, config: draft },
        controller.signal,
      )
        .then((value) => {
          if (controller.signal.aborted) return;
          setCatalogPreview({
            key: requestKey,
            config: requestConfig,
            data: value,
          });
        })
        .catch(() => {
          if (!controller.signal.aborted) setCatalogPreview(null);
        });
    }, 260);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft, dirty, fullPreviewBlocked, ledgerId, view]);

  const draftKey = draft === null ? "" : JSON.stringify(draft);
  const currentLivePreview =
    livePreview?.key === draftKey ? livePreview.data : null;
  const currentPreviewError =
    previewError?.key === draftKey ? previewError.message : "";
  const previewData: PreviewView | null = dirty
    ? (currentLivePreview ?? view)
    : view;
  const resultById = useMemo(
    () =>
      new Map(
        (previewData?.results ?? []).map((result) => [result.ruleId, result]),
      ),
    [previewData],
  );
  const queryResultById = useMemo(
    () =>
      new Map(
        (previewData?.queryResults ?? []).map((result) => [
          result.ruleId,
          result,
        ]),
      ),
    [previewData],
  );
  const presetNames = useMemo(
    () => Object.keys(draft?.presets ?? {}).sort(),
    [draft],
  );
  const mappingPresetNames = presetNames.filter(
    (name) => (draft?.presetScopes[name] ?? "mapping") === "mapping",
  );
  const queryPresetNames = presetNames.filter(
    (name) => draft?.presetScopes[name] === "query",
  );
  const visiblePresetNames =
    workspaceTab === "mapping" ? mappingPresetNames : queryPresetNames;
  const visibleRules = useMemo(() => {
    if (!draft) return [];
    const query = ruleSearch.trim().toLowerCase();
    if (!query) return draft.rules.map((rule, index) => ({ rule, index }));
    return draft.rules
      .map((rule, index) => ({ rule, index }))
      .filter(({ rule }) =>
        [
          rule.name,
          ...rulePresetReferences(rule),
          rule.setPayee,
          rule.setNarration,
          ...Object.keys(rule.addMeta),
          ...rule.removeMeta,
          ...rule.addTags,
          ...rule.removeTags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
  }, [draft, ruleSearch]);
  const visibleQueries = useMemo(() => {
    if (!draft) return [];
    const query = querySearch.trim().toLowerCase();
    if (!query)
      return draft.queries.map((item, index) => ({ query: item, index }));
    return draft.queries
      .map((item, index) => ({ query: item, index }))
      .filter(({ query: item }) =>
        [
          item.name,
          ...queryPresetReferences(item),
          item.groupMetaKey,
          item.periodMetaKey,
          ...(item.columns ?? []).flatMap((column) => [
            column.label,
            column.metaKey,
          ]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
  }, [draft, querySearch]);

  function updatePreset(name: string, value: Filter) {
    if (!isValidPresetName(name)) return;
    setDraft(
      (current) =>
        current && {
          ...current,
          presets: { ...current.presets, [name]: value },
        },
    );
  }

  function updatePresetView(name: string, patch: Partial<PresetDataView>) {
    setDraft(
      (current) =>
        current && {
          ...current,
          presetViews: {
            ...current.presetViews,
            [name]: {
              ...current.presetViews[name],
              ...patch,
            },
          },
        },
    );
  }

  function presetCatalogFor(name: string): {
    catalog: SelectionCatalog;
    pending: boolean;
  } {
    if (!draft) return { catalog: EMPTY_SELECTION_CATALOG, pending: true };
    const dataView = presetDataView(draft, name);
    if (dataView.mode === "raw") return { catalog, pending: false };

    const sourceKey = catalogSourceKey(draft, name);
    if (
      catalogPreview &&
      catalogSourceKey(catalogPreview.config, name) === sourceKey
    )
      return {
        catalog:
          catalogPreview.data.presetCatalogs[name] ?? EMPTY_SELECTION_CATALOG,
        pending: false,
      };
    if (livePreview && catalogSourceKey(livePreview.config, name) === sourceKey)
      return {
        catalog: livePreview.data.presetCatalogs[name] ?? catalog,
        pending: false,
      };
    if (view && catalogSourceKey(view.config, name) === sourceKey)
      return {
        catalog: view.presetCatalogs[name] ?? catalog,
        pending: false,
      };

    // Never leak raw catalog values into a mapped view. Keep the last mapped
    // snapshot visible while the debounced preview catches up.
    const lastMappedCatalog =
      (livePreview && presetDataView(livePreview.config, name).mode === "mapped"
        ? livePreview.data.presetCatalogs[name]
        : undefined) ??
      (view && presetDataView(view.config, name).mode === "mapped"
        ? view.presetCatalogs[name]
        : undefined);
    return {
      catalog: lastMappedCatalog ?? EMPTY_SELECTION_CATALOG,
      pending: true,
    };
  }

  function addPreset() {
    if (!draft) return;
    let suffix = presetNames.length + 1;
    let name = `preset-${suffix}`;
    while (Object.hasOwn(draft.presets, name)) {
      suffix += 1;
      name = `preset-${suffix}`;
    }
    setDraft({
      ...draft,
      presets: { ...draft.presets, [name]: {} },
      presetScopes: { ...draft.presetScopes, [name]: workspaceTab },
      presetViews: {
        ...draft.presetViews,
        [name]: {
          mode: workspaceTab === "query" ? "mapped" : "raw",
          disabledRuleIds: draft.rules
            .filter((rule) => !rule.enabled)
            .map((rule) => rule.id),
        },
      },
    });
    setExpandedPreset(name);
  }

  function removePreset(name: string) {
    if (!draft || !view) return;
    const referenceCount = presetReferenceCount(draft, name);
    if (referenceCount > 0) {
      setError(
        `预设 ${name} 仍被 ${referenceCount} 条映射或查询规则引用。请先修改引用并保存规则，再删除预设。`,
      );
      return;
    }
    const deletedReferences = deletedPresetReferenceCount(
      draft,
      view.config,
      name,
    );
    if (deletedReferences > 0) {
      setError(
        `预设 ${name} 仍被 ${deletedReferences} 条已删除但尚未保存的规则引用。请先保存 Rules，再删除预设。`,
      );
      return;
    }
    setDraft(removePresetFromDraft(draft, name));
    if (expandedPreset === name) setExpandedPreset(null);
  }

  function renamePreset(oldName: string, nextName: string) {
    if (!draft || !view) return false;
    const name = nextName.trim();
    const nameError = presetNameError(name);
    if (nameError) {
      setError(nameError);
      return false;
    }
    if (oldName === name) {
      setError("");
      return true;
    }
    if (Object.hasOwn(draft.presets, name)) {
      setError(`预设 ${name} 已存在。`);
      return false;
    }
    const deletedReferences = deletedPresetReferenceCount(
      draft,
      view.config,
      oldName,
    );
    if (deletedReferences > 0) {
      setError(
        `预设 ${oldName} 仍被 ${deletedReferences} 条已删除但尚未保存的规则引用。请先保存 Rules，再重命名预设。`,
      );
      return false;
    }
    const presets = Object.fromEntries(
      Object.entries(draft.presets).map(([key, value]) =>
        key === oldName ? [name, value] : [key, value],
      ),
    );
    const presetScopes = Object.fromEntries(
      Object.entries(draft.presetScopes).map(([key, value]) =>
        key === oldName ? [name, value] : [key, value],
      ),
    ) as Record<string, PresetScope>;
    const presetViews = Object.fromEntries(
      Object.entries(draft.presetViews).map(([key, value]) =>
        key === oldName ? [name, value] : [key, value],
      ),
    );
    setDraft({
      ...draft,
      presets,
      presetScopes,
      presetViews,
      rules: draft.rules.map((rule) => renamePresetInRule(rule, oldName, name)),
      queries: draft.queries.map((query) =>
        renamePresetInQuery(query, oldName, name),
      ),
    });
    setExpandedPreset(name);
    setError("");
    return true;
  }

  function movePreset(name: string) {
    if (!draft || !view) return;
    if (
      presetReferenceCount(draft, name) > 0 ||
      presetReferenceCount(view.config, name) > 0
    ) {
      setError(
        `预设 ${name} 仍被映射或查询规则引用。请先解除所有引用并保存规则，再切换 Preset 类型。`,
      );
      return;
    }
    const nextScope =
      draft.presetScopes[name] === "query" ? "mapping" : "query";
    setDraft({
      ...draft,
      presetScopes: { ...draft.presetScopes, [name]: nextScope },
    });
    setWorkspaceTab(nextScope);
    setExpandedPreset(name);
  }

  function updateRule(id: string, patch: Partial<Rule>) {
    setDraft(
      (current) =>
        current && {
          ...current,
          rules: current.rules.map((rule) =>
            rule.id === id ? { ...rule, ...patch } : rule,
          ),
        },
    );
  }

  function moveRule(id: string, offset: number) {
    setDraft(
      (current) =>
        current && {
          ...current,
          rules: moveRuleBy(current.rules, id, offset),
        },
    );
  }

  function updateRuleDropTarget(ruleId: string, position: RuleDropPosition) {
    setRuleDropTarget((current) =>
      current?.ruleId === ruleId && current.position === position
        ? current
        : { ruleId, position },
    );
  }

  function dropRule(targetId: string, position: RuleDropPosition) {
    if (!draggedRuleId) return;
    setDraft(
      (current) =>
        current && {
          ...current,
          rules: reorderRules(current.rules, draggedRuleId, targetId, position),
        },
    );
    setDraggedRuleId(null);
    setRuleDropTarget(null);
  }

  function endRuleDrag() {
    setDraggedRuleId(null);
    setRuleDropTarget(null);
  }

  function removeRule(id: string) {
    setDraft((current) => current && removeRuleFromDraft(current, id));
    setDraggedRuleId((current) => (current === id ? null : current));
    setRuleDropTarget((current) => (current?.ruleId === id ? null : current));
  }

  function addRule() {
    if (!draft) return;
    setDraft({
      ...draft,
      rules: [...draft.rules, emptyRule(draft.rules.length + 1)],
    });
    setRuleSearch("");
  }

  function updateQuery(id: string, patch: Partial<QueryRule>) {
    setDraft(
      (current) =>
        current && {
          ...current,
          queries: current.queries.map((query) =>
            query.id === id ? { ...query, ...patch } : query,
          ),
        },
    );
  }

  function removeQuery(id: string) {
    setDraft(
      (current) =>
        current && {
          ...current,
          queries: current.queries.filter((query) => query.id !== id),
        },
    );
  }

  function addQuery() {
    if (!draft) return;
    setDraft({
      ...draft,
      queries: [...draft.queries, emptyQuery(draft.queries.length + 1)],
    });
    setQuerySearch("");
  }

  async function reload() {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const value = await request<View>(
        `/api-gateway/local/plugins/ledger_canvas/api?ledgerId=${encodeURIComponent(ledgerId)}`,
      );
      applyView(value);
      setMessage("已重新读取账本、预设预览与映射配置。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function saveSection(section: "presets" | "rules") {
    if (!draft || !view || busy) return;
    setBusy(true);
    setSavingSection(section);
    setError("");
    setMessage("");
    try {
      const value = await request<View>(
        `/api-gateway/local/plugins/ledger_canvas/api/${
          section === "presets" ? "save-presets" : "save-rules"
        }`,
        { ledgerId, revision: view.revision, config: draft },
      );
      setView(value);
      setLivePreview(null);
      setCatalogPreview(null);
      setPreviewError(null);
      setDraft({
        ...cloneConfig(value.config),
        ...(section === "presets"
          ? {
              enabled: draft.enabled,
              rules: draft.rules,
              queries: draft.queries,
            }
          : { presets: draft.presets }),
      });
      setMessage(
        section === "presets"
          ? `预设已保存。${Object.keys(value.config.presets).length} 个预设可用于规则引用。`
          : `已保存 ${value.summary.rules} 条映射规则和 ${value.summary.queries} 条查询规则；映射命中 ${value.summary.matchedTransactions} 笔交易。`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
      setSavingSection(null);
    }
  }

  if (!draft || !view) {
    return (
      <section className="fmp-shell">
        <style>{STYLES}</style>
        <div className="fmp-page">
          {error ? (
            <div className="fmp-message is-error" role="alert">
              {error}
            </div>
          ) : (
            <p role="status" style={{ padding: 30, color: "var(--fmp-muted)" }}>
              正在读取交易、预设与映射配置…
            </p>
          )}
        </div>
      </section>
    );
  }

  const disabled = busy || !canWrite || view.configError !== null;
  const rulesCanDrag = !disabled && ruleSearch.trim() === "";
  const catalog = view.selectionCatalog;
  const summary = previewData?.summary ?? view.summary;

  return (
    <section className="fmp-shell">
      <style>{STYLES}</style>
      <div className="fmp-page">
        <header className="fmp-hero">
          <div>
            <div className="fmp-kicker">Map · Query · Visualize</div>
            <h1>
              Ledger <span>Canvas</span>
            </h1>
            <p className="fmp-subtitle">
              用 Preset 描述匹配条件：Mapping 负责在内存中改写运行时字段，Query
              负责按商户归纳周期与年度金额。Bean 文件保持原样。
            </p>
          </div>
          <div className="fmp-hero-actions">
            <div className="fmp-memory-badge">IN-MEMORY · 不回写交易</div>
            <button
              type="button"
              className="fmp-btn fmp-btn-ghost"
              disabled={busy}
              onClick={() => void reload()}
            >
              重新读取
            </button>
          </div>
        </header>

        <div className="fmp-stats">
          <div className="fmp-stat">
            <span>Transactions</span>
            <strong>{summary.transactions}</strong>
            <em>账本交易总数</em>
          </div>
          <div className="fmp-stat">
            <span>Mapped</span>
            <strong>{previewData?.summary.matchedTransactions ?? "—"}</strong>
            <em>至少命中一条映射规则</em>
          </div>
          <div className="fmp-stat">
            <span>Mapping Rules</span>
            <strong>
              {summary.enabledRules}/{summary.rules}
            </strong>
            <em>映射规则启用 / 全部</em>
          </div>
          <div className="fmp-stat">
            <span>Query Rules</span>
            <strong>
              {summary.enabledQueries}/{summary.queries}
            </strong>
            <em>周期查询启用 / 全部</em>
          </div>
          <div className="fmp-stat">
            <span>Presets</span>
            <strong>{summary.presets}</strong>
            <em>可复用匹配条件</em>
          </div>
        </div>

        {view.configError ? (
          <div className="fmp-message is-error" role="alert">
            <div>
              <strong>配置文件无法解析，运行时映射已安全跳过。</strong>
              <div>{view.configError}</div>
              {view.configSource || view.presetsSource ? (
                <details className="fmp-config-details">
                  <summary>查看配置文件原文</summary>
                  {view.configSource ? (
                    <>
                      <strong>config.json</strong>
                      <pre className="fmp-config-source">
                        {view.configSource}
                      </pre>
                    </>
                  ) : null}
                  {view.presetsSource ? (
                    <>
                      <strong>presets.json</strong>
                      <pre className="fmp-config-source">
                        {view.presetsSource}
                      </pre>
                    </>
                  ) : null}
                </details>
              ) : null}
            </div>
          </div>
        ) : null}
        {presetIssues.length ? (
          <div className="fmp-message is-warning" role="status">
            <div>
              <strong>Presets 还有 {presetIssues.length} 项需要完成。</strong>
              <div>{presetIssues.slice(0, 3).join("；")}</div>
              {presetIssues.length > 3
                ? `另有 ${presetIssues.length - 3} 项，请检查左侧预设。`
                : null}
            </div>
          </div>
        ) : null}
        {ruleIssues.length ? (
          <div className="fmp-message is-warning" role="status">
            <div>
              <strong>
                Mapping Rules 还有 {ruleIssues.length} 项需要完成。
              </strong>
              <div>{ruleIssues.slice(0, 3).join("；")}</div>
              {ruleIssues.length > 3
                ? `另有 ${ruleIssues.length - 3} 项，请检查标为“待完成”的规则。`
                : null}
            </div>
          </div>
        ) : null}
        {queryIssues.length ? (
          <div className="fmp-message is-warning" role="status">
            <div>
              <strong>
                Query Rules 还有 {queryIssues.length} 项需要完成。
              </strong>
              <div>{queryIssues.slice(0, 3).join("；")}</div>
              {queryIssues.length > 3
                ? `另有 ${queryIssues.length - 3} 项，请检查查询规则。`
                : null}
            </div>
          </div>
        ) : null}
        {currentPreviewError ? (
          <div className="fmp-message is-warning" role="status">
            <div>
              <strong>实时预览暂不可用，已保留当前编辑内容。</strong>
              <div>{currentPreviewError}</div>
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="fmp-message is-error" role="alert">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="fmp-message is-ok" role="status">
            {message}
          </div>
        ) : null}

        <div className="fmp-layout">
          <aside className="fmp-panel">
            <div className="fmp-panel-head">
              <div className="fmp-panel-heading">
                <span
                  className={`fmp-section-kicker${
                    workspaceTab === "query" ? " is-query" : ""
                  }`}
                >
                  {workspaceTab === "mapping"
                    ? "Before mapping"
                    : "After mapping"}
                </span>
                <div className="fmp-panel-title-line">
                  <h2>Presets</h2>
                  {presetDirty ? (
                    <span className="fmp-save-state">未保存</span>
                  ) : (
                    <span className="fmp-save-state is-saved">已保存</span>
                  )}
                </div>
                <p>
                  {workspaceTab === "mapping"
                    ? "Mapping Presets 默认预览原始交易，也可模拟任意 Mapping Rules 组合执行后的数据。"
                    : "Query Presets 默认预览全部映射后的数据，并可为每个 Preset 单独调整模拟状态。"}
                </p>
              </div>
              <div className="fmp-panel-head-actions">
                <button
                  type="button"
                  className="fmp-add"
                  disabled={disabled}
                  onClick={addPreset}
                >
                  ＋ 预设
                </button>
                <button
                  type="button"
                  className="fmp-btn fmp-btn-primary fmp-save-btn"
                  disabled={disabled || !presetDirty || presetIssues.length > 0}
                  onClick={() => void saveSection("presets")}
                  title={
                    presetIssues.length
                      ? presetIssues.join("\n")
                      : "只保存预设、数据视图和规则引用"
                  }
                >
                  {savingSection === "presets"
                    ? "保存中…"
                    : presetDirty
                      ? "保存预设"
                      : "预设已保存"}
                </button>
              </div>
            </div>
            <div className="fmp-tabs" role="tablist" aria-label="Preset 类型">
              <button
                type="button"
                role="tab"
                aria-selected={workspaceTab === "mapping"}
                className={`fmp-tab${workspaceTab === "mapping" ? " is-active" : ""}`}
                onClick={() => setWorkspaceTab("mapping")}
              >
                Mapping Presets
                <span className="fmp-tab-count">
                  {mappingPresetNames.length}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workspaceTab === "query"}
                className={`fmp-tab is-query${workspaceTab === "query" ? " is-active" : ""}`}
                onClick={() => setWorkspaceTab("query")}
              >
                Query Presets
                <span className="fmp-tab-count">{queryPresetNames.length}</span>
              </button>
            </div>
            <div
              className="fmp-preset-list"
              role="tabpanel"
              aria-label={
                workspaceTab === "mapping" ? "Mapping Presets" : "Query Presets"
              }
            >
              {visiblePresetNames.length === 0 ? (
                <div className="fmp-empty">
                  {workspaceTab === "mapping"
                    ? "暂无映射预设。添加后会显示在这里，也可在 Mapping Rules 中引用。"
                    : "暂无查询预设。添加后可在 Query Rules 中选择。"}
                </div>
              ) : (
                visiblePresetNames.map((name) => {
                  const filter = draft.presets[name];
                  const mappingReferences = draft.rules.filter((rule) =>
                    rulePresetReferences(rule).includes(name),
                  ).length;
                  const queryReferences = draft.queries.filter((query) =>
                    queryPresetReferences(query).includes(name),
                  ).length;
                  const references = mappingReferences + queryReferences;
                  const savedReferences = presetReferenceCount(
                    view.config,
                    name,
                  );
                  const referencesLocked =
                    references > 0 || savedReferences > 0;
                  const scope = draft.presetScopes[name] ?? "mapping";
                  const dataView = draft.presetViews[name] ?? {
                    mode: scope === "query" ? "mapped" : "raw",
                    disabledRuleIds: draft.rules
                      .filter((rule) => !rule.enabled)
                      .map((rule) => rule.id),
                  };
                  const targetScope = scope === "mapping" ? "query" : "mapping";
                  const presetPreview = previewData?.presetPreviews[name];
                  const presetCatalog = presetCatalogFor(name);
                  return (
                    <details
                      className="fmp-preset"
                      key={name}
                      open={expandedPreset === name}
                      onToggle={(event) => {
                        const open = event.currentTarget.open;
                        setExpandedPreset((current) =>
                          open ? name : current === name ? null : current,
                        );
                      }}
                    >
                      <summary>
                        <div>
                          <PresetNameEditor
                            name={name}
                            disabled={disabled}
                            onRename={(next) => renamePreset(name, next)}
                          />
                          <span className="fmp-preset-summary">
                            {displayFilter(filter)}
                          </span>
                        </div>
                        <span
                          className={`fmp-count${presetPreview?.matched ? " is-hit" : ""}`}
                          title="预设命中交易数"
                        >
                          {presetPreview?.matched ?? 0}
                        </span>
                        <span
                          className="fmp-count"
                          title={`映射引用 ${mappingReferences} · 查询引用 ${queryReferences}${
                            savedReferences === references
                              ? ""
                              : ` · 已保存引用 ${savedReferences}；保存 Rules 后更新`
                          }`}
                        >
                          {references}
                        </span>
                        <button
                          type="button"
                          className={`fmp-preset-move is-${scope}`}
                          disabled={disabled || referencesLocked}
                          title={
                            referencesLocked
                              ? `仍被已保存或当前草稿中的规则引用，保存 Rules 并解除引用后才能移至 ${targetScope === "mapping" ? "Mapping" : "Query"} Presets`
                              : `移至 ${targetScope === "mapping" ? "Mapping" : "Query"} Presets`
                          }
                          aria-label={
                            referencesLocked
                              ? `预设 ${name} 被引用，无法切换类型`
                              : `将预设 ${name} 移至 ${targetScope === "mapping" ? "Mapping" : "Query"} Presets`
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            movePreset(name);
                          }}
                        >
                          <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path d="M3 7h12m-3-3 3 3-3 3M17 13H5m3-3-3 3 3 3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="fmp-preset-delete"
                          disabled={disabled || referencesLocked}
                          title={
                            referencesLocked
                              ? `预设 ${name} 仍被规则引用。解除引用并保存 Rules 后才能删除`
                              : `删除预设 ${name}`
                          }
                          aria-label={
                            referencesLocked
                              ? `预设 ${name} 被引用，无法删除`
                              : `删除预设 ${name}`
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            removePreset(name);
                          }}
                        >
                          删除
                        </button>
                      </summary>
                      <div className="fmp-preset-body">
                        <PresetDataViewControl
                          view={dataView}
                          rules={draft.rules}
                          disabled={disabled}
                          onChange={(patch) => updatePresetView(name, patch)}
                        />
                        <PresetPreviewPanel
                          name={name}
                          preview={presetPreview}
                          mode={dataView.mode}
                        />
                        <div
                          className="fmp-form-grid"
                          style={{ marginTop: 11 }}
                        >
                          <PresetEditor
                            filter={filter}
                            disabled={disabled}
                            catalog={presetCatalog.catalog}
                            catalogMode={dataView.mode}
                            catalogPending={presetCatalog.pending}
                            onChange={(next) => updatePreset(name, next)}
                          />
                        </div>
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          </aside>

          <main className="fmp-panel">
            <div className="fmp-panel-head">
              <div className="fmp-panel-heading">
                <span
                  className={`fmp-section-kicker${
                    workspaceTab === "query" ? " is-query" : ""
                  }`}
                >
                  {workspaceTab === "mapping"
                    ? "Runtime mapping"
                    : "Recurring analytics"}
                </span>
                <div className="fmp-panel-title-line">
                  <h2>Rules</h2>
                  {rulesDirty ? (
                    <span className="fmp-save-state">未保存</span>
                  ) : (
                    <span className="fmp-save-state is-saved">已保存</span>
                  )}
                </div>
                <p>
                  {workspaceTab === "mapping"
                    ? "组合 Preset 与时间条件，在运行时改写标签、元数据、收款人或摘要。"
                    : "在映射之后匹配交易，按商户聚合周期与金额，并估算年度支出。"}
                </p>
              </div>
              <div className="fmp-panel-head-actions">
                <button
                  type="button"
                  className="fmp-add"
                  disabled={disabled}
                  onClick={workspaceTab === "mapping" ? addRule : addQuery}
                >
                  ＋ {workspaceTab === "mapping" ? "映射规则" : "查询规则"}
                </button>
                <button
                  type="button"
                  className="fmp-btn fmp-btn-primary fmp-save-btn"
                  disabled={
                    disabled ||
                    !rulesDirty ||
                    ruleIssues.length > 0 ||
                    queryIssues.length > 0 ||
                    presetDefinitionDirty
                  }
                  onClick={() => void saveSection("rules")}
                  title={
                    presetDefinitionDirty
                      ? "请先保存 Presets，避免规则引用到未保存的条件。"
                      : ruleIssues.length
                        ? ruleIssues.join("\n")
                        : queryIssues.length
                          ? queryIssues.join("\n")
                          : "保存映射规则、查询规则与全局启用状态"
                  }
                >
                  {savingSection === "rules"
                    ? "保存中…"
                    : rulesDirty
                      ? "保存全部规则"
                      : "规则已保存"}
                </button>
              </div>
            </div>
            <div className="fmp-tabs" role="tablist" aria-label="规则类型">
              <button
                type="button"
                role="tab"
                aria-selected={workspaceTab === "mapping"}
                className={`fmp-tab${workspaceTab === "mapping" ? " is-active" : ""}`}
                onClick={() => setWorkspaceTab("mapping")}
              >
                Mapping Rules
                <span className="fmp-tab-count">{draft.rules.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workspaceTab === "query"}
                className={`fmp-tab is-query${workspaceTab === "query" ? " is-active" : ""}`}
                onClick={() => setWorkspaceTab("query")}
              >
                Query Rules
                <span className="fmp-tab-count">{draft.queries.length}</span>
              </button>
            </div>
            {workspaceTab === "mapping" ? (
              <div role="tabpanel" aria-label="Mapping Rules">
                <div className="fmp-panel-tools">
                  <EnableToggle
                    checked={draft.enabled}
                    disabled={disabled}
                    ariaLabel="全局映射规则"
                    onChange={(enabled) => setDraft({ ...draft, enabled })}
                  />
                  <input
                    className="fmp-input"
                    aria-label="搜索规则"
                    value={ruleSearch}
                    placeholder="搜索规则、预设或动作"
                    onChange={(event) => setRuleSearch(event.target.value)}
                  />
                  {presetDefinitionDirty ? (
                    <span className="fmp-save-guard">先保存 Presets</span>
                  ) : currentLivePreview && dirty ? (
                    <span className="fmp-save-guard is-ready">预览已更新</span>
                  ) : null}
                  <span className="fmp-drag-hint">
                    {ruleSearch.trim()
                      ? "清空搜索后可拖动排序"
                      : "拖动左侧手柄排序，规则按从上到下执行"}
                  </span>
                </div>
                <div className="fmp-rules">
                  {visibleRules.length === 0 ? (
                    <div className="fmp-empty">
                      {draft.rules.length
                        ? "没有符合条件的映射规则。"
                        : "还没有映射规则。添加一条并选择 Preset，或只设置时间范围。"}
                    </div>
                  ) : (
                    visibleRules.map(({ rule, index }) => (
                      <RuleEditor
                        key={rule.id}
                        rule={rule}
                        index={index}
                        disabled={disabled}
                        presets={draft.presets}
                        availablePresetNames={mappingPresetNames}
                        catalog={catalog}
                        complete={
                          ruleHasCondition(rule, draft.presets) &&
                          rulePresetReferences(rule).every((name) =>
                            mappingPresetNames.includes(name),
                          )
                        }
                        result={resultById.get(rule.id)}
                        dragging={draggedRuleId === rule.id}
                        dragActive={draggedRuleId !== null}
                        dragEnabled={rulesCanDrag}
                        dragHint={
                          rulesCanDrag
                            ? "拖动排序；也可聚焦后按 ↑ / ↓"
                            : ruleSearch.trim()
                              ? "清空搜索后可拖动排序"
                              : "当前不可拖动排序"
                        }
                        dropPosition={
                          ruleDropTarget?.ruleId === rule.id
                            ? ruleDropTarget.position
                            : null
                        }
                        onChange={(patch) => updateRule(rule.id, patch)}
                        onRemove={() => removeRule(rule.id)}
                        onDragStart={() => {
                          setDraggedRuleId(rule.id);
                          setRuleDropTarget(null);
                        }}
                        onDragOver={(position) =>
                          updateRuleDropTarget(rule.id, position)
                        }
                        onDrop={(position) => dropRule(rule.id, position)}
                        onDragEnd={endRuleDrag}
                        onMove={(offset) => moveRule(rule.id, offset)}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div role="tabpanel" aria-label="Query Rules">
                <div className="fmp-panel-tools">
                  <EnableToggle
                    checked={draft.enabled}
                    disabled={disabled}
                    ariaLabel="全局查询规则"
                    onChange={(enabled) => setDraft({ ...draft, enabled })}
                  />
                  <input
                    className="fmp-input"
                    aria-label="搜索查询规则"
                    value={querySearch}
                    placeholder="搜索查询、Preset 或分组键"
                    onChange={(event) => setQuerySearch(event.target.value)}
                  />
                  {presetDefinitionDirty ? (
                    <span className="fmp-save-guard">先保存 Presets</span>
                  ) : currentLivePreview && dirty ? (
                    <span className="fmp-save-guard is-ready">预览已更新</span>
                  ) : null}
                  <span className="fmp-drag-hint">
                    查询在 Mapping Rules 之后运行
                  </span>
                </div>
                <div className="fmp-rules">
                  {visibleQueries.length === 0 ? (
                    <div className="fmp-empty">
                      {draft.queries.length
                        ? "没有符合条件的查询规则。"
                        : "还没有查询规则。引用 #recurring 或周期性元数据对应的 Preset 即可开始。"}
                    </div>
                  ) : (
                    visibleQueries.map(({ query, index }) => (
                      <QueryRuleEditor
                        key={query.id}
                        query={query}
                        index={index}
                        disabled={disabled}
                        presets={draft.presets}
                        availablePresetNames={queryPresetNames}
                        complete={
                          queryHasCondition(query, draft.presets) &&
                          queryPresetReferences(query).every((name) =>
                            queryPresetNames.includes(name),
                          )
                        }
                        result={queryResultById.get(query.id)}
                        onChange={(patch) => updateQuery(query.id, patch)}
                        onRemove={() => removeQuery(query.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        <PreviewSection
          activeTab={workspaceTab}
          onTabChange={setWorkspaceTab}
          rules={draft.rules}
          results={resultById}
          queries={draft.queries}
          queryResults={queryResultById}
          pending={dirty && !currentLivePreview && !currentPreviewError}
        />

        <div className="fmp-help">
          <article>
            <h3>分开保存</h3>
            <p>
              Mapping 与 Query 的预设都保存在{" "}
              <span className="fmp-code">presets.json</span>
              ，并按工作区分组；规则动作写入{" "}
              <span className="fmp-code">config.json</span>
              。修改预设后先保存预设，再保存规则引用与动作。
            </p>
          </article>
          <article>
            <h3>渐进式选择</h3>
            <p>
              账户使用分层浏览器；收款人、摘要、标签与 metadata
              使用带搜索、分类计数和复选的浮层。手写正则仍可逐行补充。
            </p>
          </article>
          <article>
            <h3>结构与 DSL</h3>
            <p>
              两种编辑方式只改变视图：切换时会转换当前条件；无法无损结构化的 DSL
              会提示并保留原文，不会再被空对象或空字符串覆盖。
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
