import { createHash } from "node:crypto";
import {
  analyzeLedgerCanvasQueries,
  applyLedgerCanvasConfig,
  LEDGER_CANVAS_CONFIG_FILE,
  LEDGER_CANVAS_PRESETS_FILE,
  parseLedgerCanvasConfig,
  parseLedgerFiles,
  previewLedgerCanvasPreset,
  readLocalPluginConfig,
  readLedgerCanvasConfig,
  stripFavaPlugins,
} from "@beancount/plugin";
import type {
  LedgerCanvasAnalysis,
  LedgerCanvasConfig,
  LedgerCanvasPresetPreview,
  LedgerCanvasPresetExpression,
  LedgerCanvasQueryRuleResult,
  LocalPluginBackend,
  PluginRepository as LocalLedgerRepositoryAdapter,
} from "@beancount/plugin";

type Mapping = Record<string, unknown>;
type Directive = LedgerCanvasAnalysis["directives"][number];
type CatalogValue = { value: string; count: number };
type MetadataCatalog = {
  key: string;
  count: number;
  values: CatalogValue[];
};
type Summary = {
  transactions: number;
  matchedTransactions: number;
  rules: number;
  enabledRules: number;
  queries: number;
  enabledQueries: number;
  presets: number;
};
type View = {
  revision: string;
  config: LedgerCanvasConfig;
  configError: string | null;
  configSource: string | null;
  presetsSource: string | null;
  results: LedgerCanvasAnalysis["rules"];
  queryResults: LedgerCanvasQueryRuleResult[];
  presetPreviews: Record<string, LedgerCanvasPresetPreview>;
  presetCatalogs: Record<string, View["selectionCatalog"]>;
  selectionCatalog: {
    accounts: CatalogValue[];
    payees: CatalogValue[];
    narrations: CatalogValue[];
    tags: CatalogValue[];
    metadata: MetadataCatalog[];
  };
  summary: Summary;
};
type PreviewView = Pick<
  View,
  | "results"
  | "queryResults"
  | "presetPreviews"
  | "presetCatalogs"
  | "selectionCatalog"
  | "summary"
>;
type CatalogPreview = Pick<View, "presetCatalogs" | "selectionCatalog">;

const EMPTY_CONFIG: LedgerCanvasConfig = {
  version: 1,
  enabled: true,
  presets: {},
  presetScopes: {},
  presetViews: {},
  rules: [],
  queries: [],
};

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function record(value: unknown): Mapping {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a configuration object");
  return value as Mapping;
}

function localToday(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function metaText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const amount = value as { number?: unknown; currency?: unknown };
    if (amount.number !== undefined)
      return `${String(amount.number)} ${String(amount.currency ?? "")}`.trim();
  }
  return String(value);
}

function bump(map: Map<string, number>, value: string) {
  if (value) map.set(value, (map.get(value) ?? 0) + 1);
}

function catalogValues(map: Map<string, number>, limit = 500): CatalogValue[] {
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.value.localeCompare(right.value),
    )
    .slice(0, limit);
}

function selectionCatalog(directives: Directive[]): View["selectionCatalog"] {
  const accounts = new Map<string, number>();
  const payees = new Map<string, number>();
  const narrations = new Map<string, number>();
  const tags = new Map<string, number>();
  const metadata = new Map<string, Map<string, number>>();

  for (const directive of directives) {
    if ("tags" in directive && Array.isArray(directive.tags))
      for (const tag of new Set(directive.tags)) bump(tags, tag);

    for (const [key, raw] of Object.entries(directive.meta ?? {})) {
      const value = metaText(raw);
      if (value) {
        const values = metadata.get(key) ?? new Map<string, number>();
        bump(values, value);
        metadata.set(key, values);
      }
    }

    if (directive.type !== "transaction") continue;
    for (const account of new Set(
      directive.postings.map((posting) => posting.account),
    ))
      bump(accounts, account);
    bump(payees, directive.payee ?? "");
    bump(narrations, directive.narration ?? "");
  }

  return {
    accounts: catalogValues(accounts, 1000),
    payees: catalogValues(payees),
    narrations: catalogValues(narrations),
    tags: catalogValues(tags, tags.size),
    metadata: [...metadata.entries()]
      .filter(([, values]) => values.size > 0)
      .map(([key, values]) => ({
        key,
        count: [...values.values()].reduce((total, count) => total + count, 0),
        values: catalogValues(values, values.size),
      }))
      .sort(
        (left, right) =>
          right.count - left.count || left.key.localeCompare(right.key),
      ),
  };
}

function emptyAnalysis(config: LedgerCanvasConfig): LedgerCanvasAnalysis {
  return {
    directives: [],
    errors: [],
    rules: config.rules.map((rule) => ({
      ruleId: rule.id,
      ruleName: rule.name ?? rule.id,
      matched: 0,
      examples: [],
      days: null,
      label: null,
    })),
    matchedTransactions: 0,
  };
}

function catalogPreviewConfig(value: unknown, today: string): LedgerCanvasConfig {
  const input = record(value);
  const inputPresets = input.presets === undefined ? {} : record(input.presets);
  const incompleteFilter = {
    any: "__ledger_canvas_incomplete_preset__",
  } as const;
  const presets: LedgerCanvasConfig["presets"] = {};

  for (const [name, definition] of Object.entries(inputPresets)) {
    let fallback;
    try {
      fallback = parseLedgerCanvasConfig(
        { presets: { [name]: incompleteFilter } },
        { today },
      ).presets[name];
    } catch {
      continue;
    }
    try {
      presets[name] = parseLedgerCanvasConfig(
        { presets: { [name]: definition } },
        { today },
      ).presets[name];
    } catch {
      presets[name] = fallback;
    }
  }

  const inputScopes =
    input.presetScopes === undefined ? {} : record(input.presetScopes);
  const presetScopes = Object.fromEntries(
    Object.keys(presets).map((name) => [
      name,
      inputScopes[name] === "query" ? "query" : "mapping",
    ]),
  ) as LedgerCanvasConfig["presetScopes"];

  const rules: LedgerCanvasConfig["rules"] = [];
  const ruleIds = new Set<string>();
  const inputRules = Array.isArray(input.rules) ? input.rules : [];
  for (const rule of inputRules) {
    try {
      const parsed = parseLedgerCanvasConfig(
        {
          presets,
          presetScopes,
          rules: [rule],
          queries: [],
        },
        { today },
      ).rules[0];
      if (ruleIds.has(parsed.id)) continue;
      ruleIds.add(parsed.id);
      rules.push(parsed);
    } catch {
      // Incomplete rules do not participate in the authoring catalog.
    }
  }

  const inputViews =
    input.presetViews === undefined ? {} : record(input.presetViews);
  const presetViews = Object.fromEntries(
    Object.keys(presets).map((name) => {
      let view: Mapping = {};
      try {
        view = inputViews[name] === undefined ? {} : record(inputViews[name]);
      } catch {
        // Invalid saved views fall back to the preset scope default.
      }
      const disabledRuleIds = Array.isArray(view.disabledRuleIds)
        ? view.disabledRuleIds.filter(
            (id): id is string => typeof id === "string" && ruleIds.has(id),
          )
        : [];
      return [
        name,
        {
          mode: view.mode === "mapped" ? "mapped" : "raw",
          disabledRuleIds,
        },
      ];
    }),
  ) as LedgerCanvasConfig["presetViews"];

  return parseLedgerCanvasConfig(
    {
      version: 1,
      enabled: input.enabled !== false,
      presets,
      presetScopes,
      presetViews,
      rules,
      queries: [],
    },
    { today },
  );
}

function previewConfig(
  directives: Directive[],
  config: LedgerCanvasConfig,
  today: string,
): {
  analysis: LedgerCanvasAnalysis;
  catalog: View["selectionCatalog"];
  presetCatalogs: Record<string, View["selectionCatalog"]>;
  presetPreviews: Record<string, LedgerCanvasPresetPreview>;
  queryResults: LedgerCanvasQueryRuleResult[];
} {
  const analysis = applyLedgerCanvasConfig(directives, config, {
    today,
    maxExamples: Number.POSITIVE_INFINITY,
  });
  const rawCatalog = selectionCatalog(directives);
  const mappedCatalogCache = new Map<
    string,
    { directives: Directive[]; catalog: View["selectionCatalog"] }
  >();
  const presetCatalogs: Record<string, View["selectionCatalog"]> = {};
  const presetPreviews: Record<string, LedgerCanvasPresetPreview> = {};
  for (const [name, preset] of Object.entries(config.presets)) {
    const view = config.presetViews[name];
    let source: { directives: Directive[]; catalog: View["selectionCatalog"] };
    if (view === undefined || view.mode === "raw") {
      source = { directives, catalog: rawCatalog };
    } else {
      const disabledRuleIds = [...view.disabledRuleIds].sort();
      const cacheKey = JSON.stringify(disabledRuleIds);
      const cached = mappedCatalogCache.get(cacheKey);
      if (cached !== undefined) {
        source = cached;
      } else {
        const mappedDirectives =
          disabledRuleIds.length === 0 && config.enabled
            ? analysis.directives
            : applyLedgerCanvasConfig(directives, {
                ...config,
                enabled: true,
                rules: config.rules.map((rule) => ({
                  ...rule,
                  enabled: !disabledRuleIds.includes(rule.id),
                })),
                queries: [],
              }).directives;
        source = {
          directives: mappedDirectives,
          catalog: selectionCatalog(mappedDirectives),
        };
        mappedCatalogCache.set(cacheKey, source);
      }
    }
    presetCatalogs[name] = source.catalog;
    presetPreviews[name] = previewLedgerCanvasPreset(source.directives, preset);
  }
  return {
    analysis,
    catalog: rawCatalog,
    presetCatalogs,
    presetPreviews,
    queryResults: analyzeLedgerCanvasQueries(analysis.directives, config, {
      today,
    }),
  };
}

function persistedConfig(files: Record<string, string>): LedgerCanvasConfig {
  if (
    files[LEDGER_CANVAS_CONFIG_FILE] === undefined &&
    files[LEDGER_CANVAS_PRESETS_FILE] === undefined
  )
    return EMPTY_CONFIG;
  return readLedgerCanvasConfig(files);
}

function configDocument(config: LedgerCanvasConfig) {
  return `${JSON.stringify(
    {
      version: 1,
      enabled: config.enabled,
      presetViews: config.presetViews,
      rules: config.rules,
      queries: config.queries,
    },
    null,
    2,
  )}\n`;
}

function presetsDocument(config: LedgerCanvasConfig) {
  return `${JSON.stringify(
    {
      version: 1,
      presets: config.presets,
      presetScopes: config.presetScopes,
    },
    null,
    2,
  )}\n`;
}

function referencedPresetNames(config: LedgerCanvasConfig): Set<string> {
  const names = new Set<string>();
  const collect = (expression: LedgerCanvasPresetExpression | undefined) => {
    if (expression === undefined) return;
    if ("preset" in expression) {
      names.add(expression.preset);
      return;
    }
    for (const child of "all" in expression ? expression.all : expression.any)
      collect(child);
  };
  for (const item of [...config.rules, ...config.queries]) {
    if (item.preset) names.add(item.preset);
    collect(item.presetExpr);
  }
  return names;
}

function sectionWrite(
  files: Record<string, string>,
  path: string,
  content: string,
) {
  return {
    path,
    content,
    expectedSha: files[path] === undefined ? undefined : hash(files[path]),
  };
}

type RulePresetReference = {
  preset?: string;
  presetExpr?: unknown;
};

function itemPresetReferences(
  items: unknown,
): Map<string, RulePresetReference> {
  const references = new Map<string, RulePresetReference>();
  if (!Array.isArray(items)) return references;
  for (const item of items) {
    if (item === null || typeof item !== "object" || Array.isArray(item))
      continue;
    const rule = item as Mapping;
    if (typeof rule.id !== "string") continue;
    const preset =
      typeof rule.preset === "string" && rule.preset.trim()
        ? rule.preset
        : undefined;
    const presetExpr =
      rule.presetExpr &&
      typeof rule.presetExpr === "object" &&
      !Array.isArray(rule.presetExpr)
        ? rule.presetExpr
        : undefined;
    references.set(rule.id, { preset, presetExpr });
  }
  return references;
}

function presetReferences(value: unknown): {
  rules: Map<string, RulePresetReference>;
  queries: Map<string, RulePresetReference>;
} {
  const draft = record(value);
  return {
    rules: itemPresetReferences(draft.rules),
    queries: itemPresetReferences(draft.queries),
  };
}

async function loadFiles(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  const pluginConfig = await readLocalPluginConfig(repository, ledgerId);
  const settings = record(
    record(pluginConfig.plugins ?? {}).ledger_canvas ?? {},
  );
  if (settings.enabled !== true)
    throw new Error("The ledger_canvas plugin is disabled");
  const files = await repository.readFileMap(ledgerId);
  return {
    files,
    revision: hash(JSON.stringify(Object.entries(files).sort())),
  };
}

async function readLocalLedgerCanvas(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
): Promise<View> {
  const { files, revision } = await loadFiles(repository, ledgerId);
  const entryPoint = repository.getLedger(ledgerId).entryPoint;
  const configSource = files[LEDGER_CANVAS_CONFIG_FILE] ?? null;
  const presetsSource = files[LEDGER_CANVAS_PRESETS_FILE] ?? null;
  let config = EMPTY_CONFIG;
  let configError: string | null = null;
  if (configSource !== null || presetsSource !== null) {
    try {
      config = persistedConfig(files);
    } catch (error) {
      configError = error instanceof Error ? error.message : String(error);
    }
  }

  // Preview against the user-authored stream. Fava plugin lines are removed
  // without running any plugin, so this page can explain each mapping rule
  // instead of re-matching an already transformed directive stream.
  const rawFiles = stripFavaPlugins(files, entryPoint).strippedFiles;
  const snapshot = await parseLedgerFiles(rawFiles, entryPoint, {
    applyTsPlugins: false,
    repoPaths: await repository.listFiles(ledgerId),
  });
  let analysis = emptyAnalysis(config);
  let queryResults: LedgerCanvasQueryRuleResult[] = [];
  let presetPreviews: Record<string, LedgerCanvasPresetPreview> = {};
  let presetCatalogs: Record<string, View["selectionCatalog"]> = {};
  const catalog = selectionCatalog(snapshot.directives);
  if (configError === null) {
    try {
      const preview = previewConfig(snapshot.directives, config, localToday());
      analysis = preview.analysis;
      queryResults = preview.queryResults;
      presetPreviews = preview.presetPreviews;
      presetCatalogs = preview.presetCatalogs;
    } catch (error) {
      configError = error instanceof Error ? error.message : String(error);
    }
  }

  return {
    revision,
    config,
    configError,
    configSource,
    presetsSource,
    results: analysis.rules,
    queryResults,
    presetPreviews,
    presetCatalogs,
    selectionCatalog: catalog,
    summary: {
      transactions: snapshot.directives.filter(
        (directive) => directive.type === "transaction",
      ).length,
      matchedTransactions: analysis.matchedTransactions,
      rules: config.rules.length,
      enabledRules: config.rules.filter((rule) => rule.enabled).length,
      queries: config.queries.length,
      enabledQueries: config.queries.filter((query) => query.enabled).length,
      presets: Object.keys(config.presets).length,
    },
  };
}

async function previewLocalLedgerCanvas(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
): Promise<PreviewView> {
  const { files } = await loadFiles(repository, ledgerId);
  const entryPoint = repository.getLedger(ledgerId).entryPoint;
  const config = parseLedgerCanvasConfig(value, { today: localToday() });
  const rawFiles = stripFavaPlugins(files, entryPoint).strippedFiles;
  const snapshot = await parseLedgerFiles(rawFiles, entryPoint, {
    applyTsPlugins: false,
    repoPaths: await repository.listFiles(ledgerId),
  });
  const preview = previewConfig(snapshot.directives, config, localToday());
  return {
    results: preview.analysis.rules,
    queryResults: preview.queryResults,
    presetPreviews: preview.presetPreviews,
    presetCatalogs: preview.presetCatalogs,
    selectionCatalog: preview.catalog,
    summary: {
      transactions: snapshot.directives.filter(
        (directive) => directive.type === "transaction",
      ).length,
      matchedTransactions: preview.analysis.matchedTransactions,
      rules: config.rules.length,
      enabledRules: config.rules.filter((rule) => rule.enabled).length,
      queries: config.queries.length,
      enabledQueries: config.queries.filter((query) => query.enabled).length,
      presets: Object.keys(config.presets).length,
    },
  };
}

async function previewLocalLedgerCanvasCatalogs(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
): Promise<CatalogPreview> {
  const { files } = await loadFiles(repository, ledgerId);
  const entryPoint = repository.getLedger(ledgerId).entryPoint;
  const config = catalogPreviewConfig(value, localToday());
  const rawFiles = stripFavaPlugins(files, entryPoint).strippedFiles;
  const snapshot = await parseLedgerFiles(rawFiles, entryPoint, {
    applyTsPlugins: false,
    repoPaths: await repository.listFiles(ledgerId),
  });
  const preview = previewConfig(snapshot.directives, config, localToday());
  return {
    presetCatalogs: preview.presetCatalogs,
    selectionCatalog: preview.catalog,
  };
}

async function saveLocalLedgerCanvasPresets(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
  revision: string,
): Promise<View> {
  const state = await loadFiles(repository, ledgerId);
  if (state.revision !== revision)
    throw new Error("Ledger changed since it was read; reload before saving");
  const current = persistedConfig(state.files);
  const draft = record(value);
  const draftPresets = record(draft.presets);
  // Existing rules may still reference presets that this save is about to
  // replace. Merge them only for validation, then persist the draft names.
  const parsedPresets = parseLedgerCanvasConfig(
    {
      version: 1,
      enabled: true,
      presets: { ...current.presets, ...draftPresets },
      presetScopes: {
        ...current.presetScopes,
        ...(draft.presetScopes &&
        typeof draft.presetScopes === "object" &&
        !Array.isArray(draft.presetScopes)
          ? draft.presetScopes
          : {}),
      },
      presetViews: draft.presetViews,
      rules: current.rules,
      queries: current.queries,
    },
    { today: localToday() },
  );
  const names = Object.keys(draftPresets);
  const presets = Object.fromEntries(
    names.flatMap((name) =>
      parsedPresets.presets[name] === undefined
        ? []
        : [[name, parsedPresets.presets[name]]],
    ),
  );
  const presetScopes = Object.fromEntries(
    names.flatMap((name) =>
      parsedPresets.presetScopes[name] === undefined
        ? []
        : [[name, parsedPresets.presetScopes[name]]],
    ),
  ) as LedgerCanvasConfig["presetScopes"];
  const presetViews = Object.fromEntries(
    names.flatMap((name) =>
      parsedPresets.presetViews[name] === undefined
        ? []
        : [[name, parsedPresets.presetViews[name]]],
    ),
  );
  const referencedPresets = referencedPresetNames(current);
  for (const [name, scope] of Object.entries(presetScopes)) {
    if (
      referencedPresets.has(name) &&
      current.presetScopes[name] !== undefined &&
      current.presetScopes[name] !== scope
    )
      throw new Error(
        `Preset '${name}' is referenced by rules and cannot change scope`,
      );
  }
  const references = presetReferences(value);
  const rules = current.rules.map((rule) => {
    const reference = references.rules.get(rule.id);
    if (reference === undefined) return rule;
    return {
      ...rule,
      preset: reference.preset,
      presetExpr: reference.presetExpr,
    };
  });
  const queries = current.queries.map((query) => {
    const reference = references.queries.get(query.id);
    if (reference === undefined) return query;
    return {
      ...query,
      preset: reference.preset,
      presetExpr: reference.presetExpr,
    };
  });
  const config = parseLedgerCanvasConfig(
    {
      version: 1,
      enabled: current.enabled,
      presets,
      presetScopes,
      presetViews,
      rules,
      queries,
    },
    { today: localToday() },
  );
  await repository.writeFiles(ledgerId, [
    sectionWrite(state.files, LEDGER_CANVAS_PRESETS_FILE, presetsDocument(config)),
    sectionWrite(state.files, LEDGER_CANVAS_CONFIG_FILE, configDocument(config)),
  ]);
  return readLocalLedgerCanvas(repository, ledgerId);
}

async function saveLocalLedgerCanvasRules(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
  revision: string,
): Promise<View> {
  const state = await loadFiles(repository, ledgerId);
  if (state.revision !== revision)
    throw new Error("Ledger changed since it was read; reload before saving");
  const current = persistedConfig(state.files);
  const draft = record(value);
  const config = parseLedgerCanvasConfig(
    {
      version: 1,
      enabled: draft.enabled,
      presets: current.presets,
      presetScopes: current.presetScopes,
      presetViews: draft.presetViews,
      rules: draft.rules,
      queries: draft.queries,
    },
    { today: localToday() },
  );
  await repository.writeFiles(ledgerId, [
    sectionWrite(state.files, LEDGER_CANVAS_CONFIG_FILE, configDocument(config)),
    sectionWrite(state.files, LEDGER_CANVAS_PRESETS_FILE, presetsDocument(config)),
  ]);
  return readLocalLedgerCanvas(repository, ledgerId);
}

async function saveLocalLedgerCanvas(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
  revision: string,
): Promise<View> {
  const state = await loadFiles(repository, ledgerId);
  if (state.revision !== revision)
    throw new Error("Ledger changed since it was read; reload before saving");
  const config = parseLedgerCanvasConfig(value, { today: localToday() });
  await repository.writeFiles(ledgerId, [
    sectionWrite(state.files, LEDGER_CANVAS_CONFIG_FILE, configDocument(config)),
    sectionWrite(state.files, LEDGER_CANVAS_PRESETS_FILE, presetsDocument(config)),
  ]);
  return readLocalLedgerCanvas(repository, ledgerId);
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body }) {
    if (method === "GET" && !action)
      return readLocalLedgerCanvas(repository, ledgerId);
    if (method === "POST" && action === "preview")
      return previewLocalLedgerCanvas(repository, ledgerId, body.config);
    if (method === "POST" && action === "preview-catalogs")
      return previewLocalLedgerCanvasCatalogs(repository, ledgerId, body.config);
    if (method === "POST" && action === "save-presets")
      return saveLocalLedgerCanvasPresets(
        repository,
        ledgerId,
        body.config,
        typeof body.revision === "string" ? body.revision : "",
      );
    if (method === "POST" && action === "save-rules")
      return saveLocalLedgerCanvasRules(
        repository,
        ledgerId,
        body.config,
        typeof body.revision === "string" ? body.revision : "",
      );
    if (method === "POST" && !action)
      return saveLocalLedgerCanvas(
        repository,
        ledgerId,
        body.config,
        typeof body.revision === "string" ? body.revision : "",
      );
    throw new Error("Unknown ledger_canvas operation");
  },
};

export default backend;
