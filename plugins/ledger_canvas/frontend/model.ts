import type {
  CatalogValue,
  ConditionKey,
  Config,
  Filter,
  Join,
  MetaValue,
  MetaPair,
  PresetDataView,
  PresetExpression,
  QueryRule,
  Rule,
  RuleDropPosition,
  StructuredFilter,
  TagPair,
  TextMatcher,
} from "./types";
import {
  compileTextPattern,
  patternKind,
  patternToRegexSource,
} from "../pattern";

const PRESET_NAME = /^[\p{L}\p{N}][\p{L}\p{N}._-]{0,63}$/u;

export function isValidPresetName(name: string): boolean {
  return PRESET_NAME.test(name);
}

export function presetNameError(name: string): string | null {
  if (!name.trim()) return "预设名不能为空。";
  if (isValidPresetName(name.trim())) return null;
  return "预设名需以中文、字母或数字开头，只能包含中文、字母、数字、点、下划线和短横线，最多 64 个字符。";
}

function queryWithEditorShape(query: QueryRule): QueryRule {
  const columns = query.columns ?? [];
  const groupByColumns = query.groupByColumns ?? [];
  const mode = query.mode ?? "recurring";
  if (mode !== "recurring") return { ...query, mode, columns, groupByColumns };

  const groupColumn =
    query.groupBy === "meta"
      ? {
          id: "group-meta",
          label: query.groupMetaKey || "元数据",
          source: "meta" as const,
          metaKey: query.groupMetaKey,
        }
      : query.groupBy === "narration"
        ? {
            id: "group-narration",
            label: "摘要",
            source: "narration" as const,
          }
        : {
            id: "group-payee",
            label: "收款人",
            source: "payee" as const,
          };
  return {
    ...query,
    mode: "table",
    columns: [groupColumn],
    groupByColumns: [groupColumn.id],
  };
}

export function cloneConfig(config: Config): Config {
  const clone = JSON.parse(JSON.stringify(config)) as Config;
  const presetScopes = Object.fromEntries(
    Object.keys(clone.presets).map((name) => [
      name,
      clone.presetScopes?.[name] === "query" ? "query" : "mapping",
    ]),
  ) as Config["presetScopes"];
  const defaultDisabledRuleIds = clone.rules
    .filter((rule) => !rule.enabled)
    .map((rule) => rule.id);
  const presetViews = Object.fromEntries(
    Object.keys(clone.presets).map((name) => {
      const stored = clone.presetViews?.[name];
      const view: PresetDataView = stored ?? {
        mode: presetScopes[name] === "query" ? "mapped" : "raw",
        disabledRuleIds: defaultDisabledRuleIds,
      };
      return [
        name,
        {
          mode: view.mode === "mapped" ? "mapped" : "raw",
          disabledRuleIds: [...new Set(view.disabledRuleIds ?? [])],
        },
      ];
    }),
  ) as Config["presetViews"];
  return {
    ...clone,
    presetScopes,
    presetViews,
    queries: (clone.queries ?? []).map((query) =>
      queryWithEditorShape({
        ...query,
        groupBy: query.groupBy ?? "payee",
        period: query.period ?? "auto",
      }),
    ),
    rules: clone.rules.map((rule) => ({
      ...rule,
      addTags: rule.addTags ?? [],
      removeTags: rule.removeTags ?? [],
      addMeta: rule.addMeta ?? {},
      removeMeta: rule.removeMeta ?? [],
    })),
  };
}

export function presetDefinitionsDirty(draft: Config, saved: Config): boolean {
  return (
    JSON.stringify(draft.presets) !== JSON.stringify(saved.presets) ||
    JSON.stringify(draft.presetScopes) !== JSON.stringify(saved.presetScopes)
  );
}

export function presetViewsDirty(draft: Config, saved: Config): boolean {
  return (
    JSON.stringify(draft.presetViews) !== JSON.stringify(saved.presetViews)
  );
}

export function presetReferenceCount(
  config: Pick<Config, "rules" | "queries">,
  name: string,
): number {
  return (
    config.rules.filter((rule) => rulePresetReferences(rule).includes(name))
      .length +
    config.queries.filter((query) =>
      queryPresetReferences(query).includes(name),
    ).length
  );
}

export function deletedPresetReferenceCount(
  draft: Pick<Config, "rules" | "queries">,
  saved: Pick<Config, "rules" | "queries">,
  name: string,
): number {
  const draftRuleIds = new Set(draft.rules.map((rule) => rule.id));
  const draftQueryIds = new Set(draft.queries.map((query) => query.id));
  return (
    saved.rules.filter(
      (rule) =>
        !draftRuleIds.has(rule.id) && rulePresetReferences(rule).includes(name),
    ).length +
    saved.queries.filter(
      (query) =>
        !draftQueryIds.has(query.id) &&
        queryPresetReferences(query).includes(name),
    ).length
  );
}

export function removeRuleFromDraft(config: Config, id: string): Config {
  return {
    ...config,
    rules: config.rules.filter((rule) => rule.id !== id),
    presetViews: Object.fromEntries(
      Object.entries(config.presetViews).map(([name, view]) => [
        name,
        {
          ...view,
          disabledRuleIds: view.disabledRuleIds.filter(
            (ruleId) => ruleId !== id,
          ),
        },
      ]),
    ),
  };
}

export function removePresetFromDraft(config: Config, name: string): Config {
  const presets = { ...config.presets };
  delete presets[name];
  const presetScopes = { ...config.presetScopes };
  delete presetScopes[name];
  const presetViews = { ...config.presetViews };
  delete presetViews[name];
  return { ...config, presets, presetScopes, presetViews };
}

export function emptyRule(index: number): Rule {
  return {
    id: `rule-${Date.now().toString(36)}-${index}`,
    name: `新映射规则 ${index}`,
    enabled: true,
    addTags: [],
    removeTags: [],
    addMeta: {},
    removeMeta: [],
  };
}

export function emptyQuery(index: number): QueryRule {
  return {
    id: `query-${Date.now().toString(36)}-${index}`,
    name: `分组查询 ${index}`,
    enabled: true,
    groupBy: "payee",
    period: "auto",
    periodMetaKey: "recurring-period",
    mode: "table",
    columns: [{ id: "payee", label: "收款人", source: "payee" }],
    groupByColumns: ["payee"],
  };
}

export function matcherPatterns(value: TextMatcher | undefined): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value])
    .map((item) => item.trim())
    .filter(Boolean);
}

export function matcherText(value: TextMatcher | undefined): string {
  return matcherPatterns(value).join("\n");
}

export function matcherFromText(value: string): TextMatcher | undefined {
  const patterns = value
    .split(/\r?\n/u)
    .map((item) => item.trim())
    .filter(Boolean);
  if (patterns.length === 0) return undefined;
  return patterns.length === 1 ? patterns[0] : patterns;
}

export function matcherValue(patterns: string[]): TextMatcher | undefined {
  const unique = [
    ...new Set(patterns.map((item) => item.trim()).filter(Boolean)),
  ];
  if (unique.length === 0) return undefined;
  return unique.length === 1 ? unique[0] : unique;
}

export function matcherKindLabel(value: TextMatcher | undefined): string {
  const patterns = matcherPatterns(value);
  if (patterns.length === 0) return "未设置";
  const kinds = new Set(patterns.map(patternKind));
  if (kinds.size > 1) return "混合匹配";
  return kinds.has("wildcard") ? "通配符" : "正则";
}

export function matcherStatement(
  label: string,
  value: TextMatcher | undefined,
): string {
  const patterns = matcherPatterns(value);
  if (patterns.length === 0) return `${label}尚未设置匹配表达式`;
  const expressions = patterns.map((pattern) => {
    const kind = patternKind(pattern);
    return kind === "wildcard"
      ? `通配符 ${pattern.replace(/^(?:glob|wildcard):/iu, "")}`
      : `正则 /${pattern.replace(/^regex:/iu, "")}/`;
  });
  return `${label}${expressions.length > 1 ? "任一 " : ""}${expressions.join(" 或 ")}`;
}

export function matcherCatalogMatches(
  value: TextMatcher | undefined,
  values: CatalogValue[],
): { matches: CatalogValue[]; error: string | null } {
  const patterns = matcherPatterns(value);
  if (patterns.length === 0) return { matches: [], error: null };
  let expressions: RegExp[];
  try {
    expressions = patterns.map(compileTextPattern);
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
  return {
    matches: values.filter((item) =>
      expressions.some((expression) => expression.test(item.value)),
    ),
    error: null,
  };
}

export function tagPairsForFilter(filter: StructuredFilter): TagPair[] {
  return [
    ...(filter.tags ?? []).map((tag) => ({
      key: "*",
      value: valuePattern(tag),
    })),
    ...(filter.tagPairs ?? []),
  ];
}

export function metaPairsForFilter(filter: StructuredFilter): MetaPair[] {
  return [
    ...Object.entries(filter.meta ?? {}).map(([key, value]) => ({
      key,
      value,
    })),
    ...(filter.metaPairs ?? []),
  ];
}

export function pairValueText(value: MetaValue): string {
  return value === null ? "" : String(value);
}

export function tagPairMatchesValue(pair: TagPair, tag: string): boolean {
  const key = pair.key.trim();
  const expected = pair.value.trim();
  if (!key || !expected) return false;
  try {
    const value = compileTextPattern(expected);
    if (key === "*") return value.test(tag);
    const separator = tag.search(/[:=]/u);
    const tagKey = separator < 0 ? tag : tag.slice(0, separator);
    const pairValue = separator < 0 ? tag : tag.slice(separator + 1);
    return compileTextPattern(key).test(tagKey) && value.test(pairValue);
  } catch {
    return false;
  }
}

export function tagPairStatement(pair: TagPair): string {
  if (pair.key.trim() === "*") return `任一标签值匹配 ${pair.value}`;
  if (pair.value.trim() === "*") return `标签键匹配 ${pair.key}`;
  return `标签键 ${pair.key} 与值 ${pair.value} 同时匹配`;
}

export function metaPairStatement(pair: MetaPair): string {
  const value = pairValueText(pair.value);
  if (pair.key.trim() === "*") return `任一用户元数据值匹配 ${value}`;
  return `元数据 ${pair.key} = ${value}`;
}

export function pairLogicStatement(
  index: number,
  join: Join | undefined,
  exclude: boolean | undefined,
  statement: string,
): string {
  const connector = index === 0 ? "起始" : join === "or" ? "或" : "且";
  return `${connector}${exclude ? "排除" : ""} · ${statement}`;
}

export function metaPairMatchesValue(
  pair: MetaPair,
  key: string,
  value: string,
): boolean {
  const expectedKey = pair.key.trim();
  const expectedValue = pairValueText(pair.value).trim();
  if (!expectedKey || !expectedValue) return false;
  try {
    const keyMatches =
      expectedKey === "*" || compileTextPattern(expectedKey).test(key);
    if (!keyMatches) return false;
    return typeof pair.value === "string"
      ? compileTextPattern(expectedValue).test(value)
      : expectedValue === value;
  } catch {
    return false;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function valuePattern(value: string, anchored = true): string {
  const escaped = escapeRegex(value);
  return anchored ? `^${escaped}$` : escaped;
}

function exactValuePatterns(
  values: CatalogValue[],
  anchored = true,
): Map<string, string> {
  return new Map(
    values.map((item) => [valuePattern(item.value, anchored), item.value]),
  );
}

export function selectedExactValues(
  matcher: TextMatcher | undefined,
  values: CatalogValue[],
  anchored = true,
): Set<string> {
  const byPattern = exactValuePatterns(values, anchored);
  return new Set(
    matcherPatterns(matcher)
      .map((pattern) => byPattern.get(pattern))
      .filter((value): value is string => value !== undefined),
  );
}

export function setSelectedExactValues(
  matcher: TextMatcher | undefined,
  values: CatalogValue[],
  selected: Set<string>,
  anchored = true,
): TextMatcher | undefined {
  const managedPatterns = new Set(
    values.map((item) => valuePattern(item.value, anchored)),
  );
  const custom = matcherPatterns(matcher).filter(
    (pattern) => !managedPatterns.has(pattern),
  );
  return matcherValue([
    ...custom,
    ...[...selected].map((value) => valuePattern(value, anchored)),
  ]);
}

export function displayFilter(filter: Filter): string {
  if (typeof filter === "string")
    return filter.trim()
      ? `DSL: ${filter.trim().replace(/\s+/gu, " ")}`
      : "尚未填写 DSL";
  const details: Partial<Record<ConditionKey, string>> = {
    account: `账户 ${matcherPatterns(filter.account).join("、")}`,
    payee: `收款人 ${matcherPatterns(filter.payee).join("、")}`,
    narration: `摘要 ${matcherPatterns(filter.narration).join("、")}`,
    tags: `标签 ${(filter.tags?.length ?? 0) + (filter.tagPairs?.length ?? 0)} 条`,
    any: `任意文本 ${matcherPatterns(filter.any).join("、")}`,
    meta: `元数据 ${metaPairsForFilter(filter).length} 条`,
  };
  return (
    activeFilterConditions(filter)
      .map((key, index) => {
        const connector =
          index === 0
            ? ""
            : conditionJoin(filter, key) === "or"
              ? " 或 "
              : " 且 ";
        return `${connector}${conditionExcluded(filter, key) ? "非 " : ""}${details[key]}`;
      })
      .join("") || "尚未设置预设条件"
  );
}

function hasMatcher(value: TextMatcher | undefined): boolean {
  return matcherPatterns(value).length > 0;
}

export function hasFilterCondition(filter: Filter | undefined): boolean {
  if (filter === undefined) return false;
  if (typeof filter === "string") return filter.trim().length > 0;
  return (
    hasMatcher(filter.account) ||
    hasMatcher(filter.payee) ||
    hasMatcher(filter.narration) ||
    hasMatcher(filter.any) ||
    (filter.tags?.length ?? 0) > 0 ||
    (filter.tagPairs?.length ?? 0) > 0 ||
    Object.keys(filter.meta ?? {}).length > 0 ||
    (filter.metaPairs?.length ?? 0) > 0
  );
}

export const FILTER_CONDITION_ORDER: ConditionKey[] = [
  "account",
  "payee",
  "narration",
  "tags",
  "meta",
  "any",
];

export function activeFilterConditions(
  filter: StructuredFilter,
): ConditionKey[] {
  return FILTER_CONDITION_ORDER.filter((key) => {
    if (key === "tags")
      return Boolean(filter.tags?.length || filter.tagPairs?.length);
    if (key === "meta")
      return Boolean(
        Object.keys(filter.meta ?? {}).length || filter.metaPairs?.length,
      );
    return matcherPatterns(filter[key] as TextMatcher | undefined).length > 0;
  });
}

export function conditionJoin(
  filter: StructuredFilter,
  key: ConditionKey,
): Join {
  return (
    filter.conditionLogic?.[key]?.join ??
    (filter.matchMode === "any" ? "or" : "and")
  );
}

export function conditionExcluded(
  filter: StructuredFilter,
  key: ConditionKey,
): boolean {
  return filter.conditionLogic?.[key]?.exclude === true;
}

export function conditionFormula(filter: StructuredFilter): string {
  const labels: Record<ConditionKey, string> = {
    account: "账户",
    payee: "收款人",
    narration: "摘要",
    tags: "标签",
    any: "任意文本",
    meta: "元数据",
  };
  const active = activeFilterConditions(filter);
  return active
    .map((key, index) => {
      const connector =
        index === 0
          ? ""
          : conditionJoin(filter, key) === "or"
            ? " OR "
            : " AND ";
      return `${connector}${conditionExcluded(filter, key) ? "NOT " : ""}${labels[key]}`;
    })
    .join("");
}

export function ruleHasEffect(rule: Rule): boolean {
  return (
    rule.addTags.length > 0 ||
    rule.removeTags.length > 0 ||
    Object.keys(rule.addMeta).length > 0 ||
    rule.removeMeta.length > 0 ||
    Boolean(rule.setPayee?.trim()) ||
    Boolean(rule.setNarration?.trim())
  );
}

export function reorderRules(
  rules: Rule[],
  sourceId: string,
  targetId: string,
  position: RuleDropPosition,
): Rule[] {
  if (sourceId === targetId) return rules;
  const source = rules.find((rule) => rule.id === sourceId);
  if (!source) return rules;
  const remaining = rules.filter((rule) => rule.id !== sourceId);
  const targetIndex = remaining.findIndex((rule) => rule.id === targetId);
  if (targetIndex < 0) return rules;
  const next = [...remaining];
  next.splice(position === "before" ? targetIndex : targetIndex + 1, 0, source);
  return next;
}

export function moveRuleBy(rules: Rule[], id: string, offset: number): Rule[] {
  const sourceIndex = rules.findIndex((rule) => rule.id === id);
  if (sourceIndex < 0) return rules;
  const targetIndex = Math.max(
    0,
    Math.min(rules.length - 1, sourceIndex + offset),
  );
  if (sourceIndex === targetIndex) return rules;
  const next = [...rules];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function rulePresetExpression(rule: Rule): PresetExpression | undefined {
  if (rule.presetExpr) return rule.presetExpr;
  return rule.preset ? { preset: rule.preset } : undefined;
}

export function presetExpressionReferences(
  expression: PresetExpression,
): string[] {
  if ("preset" in expression) return [expression.preset];
  const children = "all" in expression ? expression.all : expression.any;
  return children.flatMap(presetExpressionReferences);
}

export function rulePresetReferences(rule: Rule): string[] {
  const expression = rulePresetExpression(rule);
  return expression ? presetExpressionReferences(expression) : [];
}

export function queryPresetExpression(
  query: QueryRule,
): PresetExpression | undefined {
  if (query.presetExpr) return query.presetExpr;
  return query.preset ? { preset: query.preset } : undefined;
}

export function queryPresetReferences(query: QueryRule): string[] {
  const expression = queryPresetExpression(query);
  return expression ? presetExpressionReferences(expression) : [];
}

function renamePresetExpression(
  expression: PresetExpression,
  oldName: string,
  nextName: string,
): PresetExpression {
  if ("preset" in expression)
    return expression.preset === oldName ? { preset: nextName } : expression;
  if ("all" in expression)
    return {
      all: expression.all.map((child) =>
        renamePresetExpression(child, oldName, nextName),
      ),
    };
  return {
    any: expression.any.map((child) =>
      renamePresetExpression(child, oldName, nextName),
    ),
  };
}

export function renamePresetInRule(
  rule: Rule,
  oldName: string,
  nextName: string,
): Rule {
  return {
    ...rule,
    preset: rule.preset === oldName ? nextName : rule.preset,
    ...(rule.presetExpr
      ? {
          presetExpr: renamePresetExpression(
            rule.presetExpr,
            oldName,
            nextName,
          ),
        }
      : {}),
  };
}

export function renamePresetInQuery(
  query: QueryRule,
  oldName: string,
  nextName: string,
): QueryRule {
  return {
    ...query,
    preset: query.preset === oldName ? nextName : query.preset,
    ...(query.presetExpr
      ? {
          presetExpr: renamePresetExpression(
            query.presetExpr,
            oldName,
            nextName,
          ),
        }
      : {}),
  };
}

export function presetExpressionText(expression: PresetExpression): string {
  if ("preset" in expression) return expression.preset;
  if ("all" in expression) {
    return expression.all
      .map((child) => {
        const text = presetExpressionText(child);
        return "all" in child || "any" in child ? `(${text})` : text;
      })
      .join(" 且 ");
  }
  return expression.any
    .map((child) => {
      const text = presetExpressionText(child);
      return "all" in child || "any" in child ? `(${text})` : text;
    })
    .join(" 或 ");
}

export function ruleHasCondition(
  rule: Rule,
  presets: Record<string, Filter>,
): boolean {
  const expression = rulePresetExpression(rule);
  if (expression) {
    const references = presetExpressionReferences(expression);
    return (
      references.length > 0 &&
      references.every(
        (name) =>
          Object.hasOwn(presets, name) && hasFilterCondition(presets[name]),
      )
    );
  }
  return Boolean(rule.time?.trim());
}

export function queryHasCondition(
  query: QueryRule,
  presets: Record<string, Filter>,
): boolean {
  const expression = queryPresetExpression(query);
  if (expression) {
    const references = presetExpressionReferences(expression);
    return (
      references.length > 0 &&
      references.every(
        (name) =>
          Object.hasOwn(presets, name) && hasFilterCondition(presets[name]),
      )
    );
  }
  return Boolean(query.time?.trim());
}

export function ruleConditionSummary(
  rule: Rule,
  presets: Record<string, Filter>,
): string {
  const expression = rulePresetExpression(rule);
  if (!expression)
    return rule.time?.trim()
      ? `时间范围 · ${rule.time.trim()}`
      : "尚未选择 preset 或时间范围";
  const references = presetExpressionReferences(expression);
  const missing = references.find((name) => !Object.hasOwn(presets, name));
  if (missing) return `preset ${missing} 不存在`;
  return `preset: ${presetExpressionText(expression)}`;
}

export function filterPatternError(filter: Filter): string | null {
  if (typeof filter === "string") return null;
  for (const pair of filter.tagPairs ?? []) {
    if (!pair.key.trim() || !pair.value.trim())
      return "标签键值条件的键和值都不能为空";
  }
  for (const pair of filter.metaPairs ?? []) {
    if (!pair.key.trim()) return "元数据键值条件的键不能为空";
  }
  const patterns = [
    ...matcherPatterns(filter.account),
    ...matcherPatterns(filter.payee),
    ...matcherPatterns(filter.narration),
    ...matcherPatterns(filter.any),
    ...(filter.tagPairs ?? []).flatMap((pair) => [pair.key, pair.value]),
    ...Object.values(filter.meta ?? {}).filter(
      (value): value is string => typeof value === "string",
    ),
    ...(filter.metaPairs ?? []).flatMap((pair) => [
      pair.key,
      ...(typeof pair.value === "string" ? [pair.value] : []),
    ]),
  ];
  for (const pattern of patterns) {
    try {
      compileTextPattern(pattern);
    } catch {
      return `无效匹配表达式：${pattern}`;
    }
  }
  return null;
}

export function metaValueText(value: MetaValue): string {
  return value === null ? "" : String(value);
}

export function setRecordEntry(
  record: Record<string, MetaValue>,
  oldKey: string,
  nextKey: string,
  value: MetaValue,
): Record<string, MetaValue> {
  return Object.fromEntries(
    Object.entries(record).map(([key, item]) =>
      key === oldKey ? [nextKey, value] : [key, item],
    ),
  );
}

function quoteDsl(value: string): string {
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("'")) return `'${value}'`;
  throw new Error("表达式同时包含单引号和双引号，无法无损转换为 Fava DSL。");
}

function dslPattern(value: string): string {
  return quoteDsl(patternToRegexSource(value));
}

function exactTagFromPattern(value: string): string | null {
  const pattern = value.trim();
  if (!pattern.startsWith("^") || !pattern.endsWith("$")) return null;
  const inner = pattern.slice(1, -1);
  if (/[.*+?[\]{}()|]/u.test(inner.replace(/\\([.*+?[\]{}()|\\])/gu, "")))
    return null;
  const unescaped = inner.replace(/\\([.*+?^${}()|[\]\\])/gu, "$1");
  return /^[A-Za-z0-9][A-Za-z0-9_./-]{0,127}$/u.test(unescaped)
    ? unescaped
    : null;
}

function groupDsl(parts: string[], separator: "or" | "and"): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `(${parts.join(separator === "or" ? ", " : " ")})`;
}

export function generatedDsl(filter: StructuredFilter): string {
  type DslPart = {
    text: string;
    join?: Join;
    exclude?: boolean;
  };
  const combineTerms = (parts: DslPart[], fallback: Join): string => {
    const applyExclusion = (part: DslPart) =>
      part.exclude ? `-(${part.text})` : part.text;
    let combined = applyExclusion(parts[0]);
    for (const part of parts.slice(1)) {
      const next = applyExclusion(part);
      combined = `(${combined}${(part.join ?? fallback) === "or" ? ", " : " "}${next})`;
    }
    return combined;
  };
  const topFallback: Join = filter.matchMode === "any" ? "or" : "and";
  const conditions: Array<{
    key: ConditionKey;
    text: string;
    dslPart: DslPart;
  }> = [];
  const account = matcherPatterns(filter.account);
  if (account.length)
    conditions.push({
      key: "account",
      text: groupDsl(
        account.map((pattern) => `any(account:${dslPattern(pattern)})`),
        "or",
      ),
      dslPart: {
        text: groupDsl(
          account.map((pattern) => `any(account:${dslPattern(pattern)})`),
          "or",
        ),
        join: filter.conditionLogic?.account?.join,
        exclude: filter.conditionLogic?.account?.exclude,
      },
    });
  const payee = matcherPatterns(filter.payee);
  if (payee.length) {
    const text = groupDsl(
      payee.map((pattern) => `payee:${dslPattern(pattern)}`),
      "or",
    );
    conditions.push({
      key: "payee",
      text,
      dslPart: {
        text,
        join: filter.conditionLogic?.payee?.join,
        exclude: filter.conditionLogic?.payee?.exclude,
      },
    });
  }
  const narration = matcherPatterns(filter.narration);
  if (narration.length) {
    const text = groupDsl(
      narration.map((pattern) => `narration:${dslPattern(pattern)}`),
      "or",
    );
    conditions.push({
      key: "narration",
      text,
      dslPart: {
        text,
        join: filter.conditionLogic?.narration?.join,
        exclude: filter.conditionLogic?.narration?.exclude,
      },
    });
  }
  const tagParts: DslPart[] = [];
  const legacyTagJoin: Join = filter.tagMode === "any" ? "or" : "and";
  for (const tag of filter.tags ?? []) {
    tagParts.push({ text: `#${tag}`, join: legacyTagJoin });
  }
  for (const pair of filter.tagPairs ?? []) {
    if (pair.key.trim() !== "*")
      throw new Error(
        "标签键/值条件无法无损转换为 Fava DSL；请保留结构化模式，或改用简单标签。",
      );
    const tag = exactTagFromPattern(pair.value);
    if (!tag)
      throw new Error(
        "通配符或正则标签条件无法无损转换为 Fava DSL；请改用精确标签。",
      );
    tagParts.push({
      text: `#${tag}`,
      join: pair.join,
      exclude: pair.exclude,
    });
  }
  if (tagParts.length) {
    const text = combineTerms(tagParts, legacyTagJoin);
    conditions.push({
      key: "tags",
      text,
      dslPart: {
        text,
        join: filter.conditionLogic?.tags?.join,
        exclude: filter.conditionLogic?.tags?.exclude,
      },
    });
  }
  const metaParts: DslPart[] = [];
  const legacyMetaJoin: Join = filter.metaMode === "any" ? "or" : "and";
  for (const [key, value] of Object.entries(filter.meta ?? {})) {
    metaParts.push({
      text: `${key}:${
        typeof value === "string" ? dslPattern(value) : quoteDsl(String(value))
      }`,
      join: legacyMetaJoin,
    });
  }
  for (const pair of filter.metaPairs ?? []) {
    if (pair.key.trim() === "*" || patternKind(pair.key) !== "regex")
      throw new Error(
        "通配符元数据键无法无损转换为 Fava DSL；请填写明确且无通配符的键。",
      );
    metaParts.push({
      text: `${pair.key}:${
        typeof pair.value === "string"
          ? dslPattern(pair.value)
          : quoteDsl(String(pair.value))
      }`,
      join: pair.join,
      exclude: pair.exclude,
    });
  }
  if (metaParts.length) {
    const text = combineTerms(metaParts, legacyMetaJoin);
    conditions.push({
      key: "meta",
      text,
      dslPart: {
        text,
        join: filter.conditionLogic?.meta?.join,
        exclude: filter.conditionLogic?.meta?.exclude,
      },
    });
  }
  const any = matcherPatterns(filter.any);
  if (any.length) {
    const text = groupDsl(
      any.map(
        (pattern) =>
          `(payee:${dslPattern(pattern)}, narration:${dslPattern(pattern)})`,
      ),
      "or",
    );
    conditions.push({
      key: "any",
      text,
      dslPart: {
        text,
        join: filter.conditionLogic?.any?.join,
        exclude: filter.conditionLogic?.any?.exclude,
      },
    });
  }
  if (conditions.length === 0)
    throw new Error("预设还没有结构化条件，无法生成 DSL。");
  return formatFilterDsl(
    combineTerms(
      conditions.map(({ dslPart }) => dslPart),
      topFallback,
    ),
  );
}

type FormatToken = {
  type:
    | "atom"
    | "string"
    | "lparen"
    | "rparen"
    | "comma"
    | "colon"
    | "minus"
    | "operator";
  raw: string;
};

function formatTokens(source: string): FormatToken[] {
  const tokens: FormatToken[] = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    if (/\s/u.test(character)) {
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      const quote = character;
      let end = index + 1;
      while (end < source.length) {
        if (source[end] === "\\") {
          end += 2;
          continue;
        }
        if (source[end] === quote) {
          end += 1;
          break;
        }
        end += 1;
      }
      tokens.push({ type: "string", raw: source.slice(index, end) });
      index = end;
      continue;
    }
    if (character === "(") {
      tokens.push({ type: "lparen", raw: character });
      index += 1;
      continue;
    }
    if (character === ")") {
      tokens.push({ type: "rparen", raw: character });
      index += 1;
      continue;
    }
    if (character === ",") {
      tokens.push({ type: "comma", raw: character });
      index += 1;
      continue;
    }
    if (character === ":") {
      tokens.push({ type: "colon", raw: character });
      index += 1;
      continue;
    }
    if (character === "-") {
      tokens.push({ type: "minus", raw: character });
      index += 1;
      continue;
    }
    if (character === "=") {
      tokens.push({ type: "operator", raw: character });
      index += 1;
      continue;
    }
    if (character === ">" || character === "<") {
      const raw =
        source[index + 1] === "=" ? source.slice(index, index + 2) : character;
      tokens.push({ type: "operator", raw });
      index += raw.length;
      continue;
    }
    let end = index + 1;
    while (
      end < source.length &&
      !/\s/u.test(source[end]) &&
      !['"', "'", "(", ")", ",", ":", "-", "=", ">", "<"].includes(source[end])
    )
      end += 1;
    tokens.push({ type: "atom", raw: source.slice(index, end) });
    index = end;
  }
  return tokens;
}

/**
 * Pretty-print Fava's advanced-filter grammar without evaluating or rewriting
 * pattern contents. Whitespace is insignificant in the grammar, so the result
 * is equivalent to the source while grouping and AND terms become scannable.
 */
export function formatFilterDsl(source: string): string {
  const tokens = formatTokens(source.trim());
  if (tokens.length === 0) return "";
  let result = "";
  let depth = 0;
  let previous: FormatToken | undefined;
  const indent = () => "  ".repeat(depth);
  const lineStart = () => {
    if (!result.endsWith("\n")) result += "\n";
    result += indent();
  };
  const trimEnd = () => {
    result = result.replace(/[ \t]+$/u, "");
  };
  const startsPrimary = (token: FormatToken) =>
    token.type === "atom" ||
    token.type === "string" ||
    token.type === "lparen" ||
    token.type === "minus";
  const endsPrimary = (token: FormatToken | undefined) =>
    token?.type === "atom" ||
    token?.type === "string" ||
    token?.type === "rparen";
  for (const token of tokens) {
    if (token.type === "rparen") {
      trimEnd();
      depth = Math.max(0, depth - 1);
      lineStart();
      result += ")";
      previous = token;
      continue;
    }
    if (token.type === "comma") {
      trimEnd();
      result += ",";
      lineStart();
      previous = token;
      continue;
    }
    if (token.type === "lparen") {
      const attached =
        previous?.type === "atom" &&
        (previous.raw === "any" || previous.raw === "all");
      if (!attached && result && !result.endsWith("\n"))
        result +=
          previous?.type === "colon" || previous?.type === "minus" ? "" : " ";
      result += "(";
      depth += 1;
      lineStart();
      previous = token;
      continue;
    }
    if (token.type === "colon") {
      trimEnd();
      result += ":";
      previous = token;
      continue;
    }
    if (token.type === "minus") {
      if (
        result &&
        !result.endsWith("\n") &&
        previous?.type !== "colon" &&
        previous?.type !== "lparen"
      )
        result += " ";
      result += "-";
      previous = token;
      continue;
    }
    if (token.type === "operator") {
      trimEnd();
      if (!result.endsWith("\n")) result += " ";
      result += token.raw;
      result += " ";
      previous = token;
      continue;
    }
    if (
      startsPrimary(token) &&
      endsPrimary(previous) &&
      previous?.type !== "colon"
    )
      lineStart();
    else if (
      result &&
      !result.endsWith("\n") &&
      !result.endsWith(" ") &&
      previous?.type !== "colon" &&
      previous?.type !== "lparen" &&
      previous?.type !== "minus"
    )
      result += " ";
    result += token.raw;
    previous = token;
  }
  return result
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

type DslToken = {
  type:
    | "tag"
    | "string"
    | "key"
    | "colon"
    | "comma"
    | "lparen"
    | "rparen"
    | "minus"
    | "any"
    | "all"
    | "unsupported";
  value: string;
};

type DslNode =
  | { kind: "tag"; value: string }
  | { kind: "field"; key: string; value: string }
  | { kind: "string"; value: string }
  | { kind: "and" | "or"; left: DslNode; right: DslNode }
  | { kind: "not"; child: DslNode }
  | { kind: "any" | "all"; child: DslNode }
  | { kind: "unsupported" };

function lexDsl(source: string): DslToken[] {
  const tokens: DslToken[] = [];
  let position = 0;
  while (position < source.length) {
    const rest = source.slice(position);
    const whitespace = /^\s+/u.exec(rest);
    if (whitespace) {
      position += whitespace[0].length;
      continue;
    }
    const tag = /^#[A-Za-z0-9_./-]+/u.exec(rest);
    if (tag) {
      tokens.push({ type: "tag", value: tag[0].slice(1) });
      position += tag[0].length;
      continue;
    }
    const any = /^any\(/u.exec(rest);
    if (any) {
      tokens.push({ type: "any", value: "any" });
      position += any[0].length;
      continue;
    }
    const all = /^all\(/u.exec(rest);
    if (all) {
      tokens.push({ type: "all", value: "all" });
      position += all[0].length;
      continue;
    }
    const key = /^[a-z][a-zA-Z0-9_-]+(?=\s*:)/u.exec(rest);
    if (key) {
      tokens.push({ type: "key", value: key[0] });
      position += key[0].length;
      continue;
    }
    const quoted = /^"([^"]*)"|^'([^']*)'/u.exec(rest);
    if (quoted) {
      tokens.push({
        type: "string",
        value: quoted[1] ?? quoted[2] ?? "",
      });
      position += quoted[0].length;
      continue;
    }
    const bare = /^[A-Za-z0-9_\p{L}][A-Za-z0-9_\p{L}-]*/u.exec(rest);
    if (bare) {
      tokens.push({ type: "string", value: bare[0] });
      position += bare[0].length;
      continue;
    }
    const symbol = rest[0];
    if (symbol === ":") tokens.push({ type: "colon", value: symbol });
    else if (symbol === ",") tokens.push({ type: "comma", value: symbol });
    else if (symbol === "(") tokens.push({ type: "lparen", value: symbol });
    else if (symbol === ")") tokens.push({ type: "rparen", value: symbol });
    else if (symbol === "-") tokens.push({ type: "minus", value: symbol });
    else tokens.push({ type: "unsupported", value: symbol });
    position += 1;
  }
  return tokens;
}

class DslReader {
  private position = 0;
  public constructor(private readonly tokens: DslToken[]) {}

  public parse(): DslNode {
    const node = this.parseOr();
    if (this.position !== this.tokens.length)
      throw new Error("DSL 末尾还有无法结构化的内容。");
    return node;
  }

  private peek(): DslToken | undefined {
    return this.tokens[this.position];
  }

  private next(): DslToken {
    const token = this.tokens[this.position];
    if (!token) throw new Error("DSL 不完整。");
    this.position += 1;
    return token;
  }

  private parseOr(): DslNode {
    let node = this.parseAnd();
    while (this.peek()?.type === "comma") {
      this.next();
      node = { kind: "or", left: node, right: this.parseAnd() };
    }
    return node;
  }

  private startsExpression(): boolean {
    return ["tag", "string", "key", "lparen", "any", "all", "minus"].includes(
      this.peek()?.type ?? "",
    );
  }

  private parseAnd(): DslNode {
    let node = this.parsePrimary();
    while (this.startsExpression())
      node = { kind: "and", left: node, right: this.parsePrimary() };
    return node;
  }

  private parsePrimary(): DslNode {
    const token = this.next();
    if (token.type === "lparen") {
      const node = this.parseOr();
      if (this.next().type !== "rparen") throw new Error("DSL 括号没有闭合。");
      return node;
    }
    if (token.type === "any" || token.type === "all") {
      const child = this.parseOr();
      if (this.next().type !== "rparen") throw new Error("DSL 括号没有闭合。");
      return { kind: token.type, child };
    }
    if (token.type === "tag") return { kind: "tag", value: token.value };
    if (token.type === "string") return { kind: "string", value: token.value };
    if (token.type === "key") {
      if (this.next().type !== "colon")
        throw new Error("结构化转换目前只支持 key:value 条件。");
      const value = this.next();
      if (value.type !== "string" && value.type !== "tag")
        throw new Error("DSL 条件值无法结构化。");
      return {
        kind: "field",
        key: token.value,
        value: value.type === "tag" ? `#${value.value}` : value.value,
      };
    }
    if (token.type === "minus")
      return { kind: "not", child: this.parsePrimary() };
    throw new Error("此 DSL 包含金额或未知条件，不能无损结构化。");
  }
}

function mergeAnd(
  left: StructuredFilter,
  right: StructuredFilter,
): StructuredFilter | null {
  for (const key of ["account", "payee", "narration", "any"] as const) {
    if (left[key] && right[key]) return null;
  }
  return setRightJoin(
    {
      ...left,
      ...right,
      ...(left.tags || right.tags
        ? { tags: [...new Set([...(left.tags ?? []), ...(right.tags ?? [])])] }
        : {}),
      ...(left.meta || right.meta
        ? { meta: { ...(left.meta ?? {}), ...(right.meta ?? {}) } }
        : {}),
    },
    right,
    "and",
  );
}

function simpleNodeFilter(node: DslNode): StructuredFilter | null {
  if (node.kind === "tag") return { tags: [node.value] };
  if (node.kind === "field") {
    if (node.key === "account") return { account: node.value };
    if (node.key === "payee") return { payee: node.value };
    if (node.key === "narration") return { narration: node.value };
    if (node.key === "any") return { any: node.value };
    return { meta: { [node.key]: node.value } };
  }
  return null;
}

type LogicalLeaf = {
  value: string;
  join?: Join;
  exclude?: boolean;
};

function flattenTagExpression(
  node: DslNode,
  join?: Join,
): LogicalLeaf[] | null {
  if (node.kind === "tag") return [{ value: node.value, join }];
  if (node.kind === "not" && node.child.kind === "tag")
    return [{ value: node.child.value, join, exclude: true }];
  if (node.kind !== "and" && node.kind !== "or") return null;
  const left = flattenTagExpression(node.left, join);
  const right = flattenTagExpression(node.right, node.kind);
  return left && right ? [...left, ...right] : null;
}

function flattenMetaExpression(
  node: DslNode,
  join?: Join,
): LogicalLeaf[] | null {
  const isMetaField = (
    item: DslNode,
  ): item is Extract<DslNode, { kind: "field" }> =>
    item.kind === "field" &&
    !["account", "payee", "narration", "any"].includes(item.key);
  if (isMetaField(node))
    return [{ value: `${node.key}\u0000${node.value}`, join }];
  if (node.kind === "not" && isMetaField(node.child))
    return [
      {
        value: `${node.child.key}\u0000${node.child.value}`,
        join,
        exclude: true,
      },
    ];
  if (node.kind !== "and" && node.kind !== "or") return null;
  const left = flattenMetaExpression(node.left, join);
  const right = flattenMetaExpression(node.right, node.kind);
  return left && right ? [...left, ...right] : null;
}

function tagExpressionToStructured(node: DslNode): StructuredFilter | null {
  if (node.kind !== "and" && node.kind !== "or" && node.kind !== "not")
    return null;
  const leaves = flattenTagExpression(node);
  if (!leaves) return null;
  return {
    tagPairs: leaves.map((leaf, index) => ({
      key: "*",
      value: valuePattern(leaf.value),
      ...(index === 0 || leaf.join === undefined ? {} : { join: leaf.join }),
      ...(leaf.exclude ? { exclude: true } : {}),
    })),
  };
}

function metaExpressionToStructured(node: DslNode): StructuredFilter | null {
  if (node.kind !== "and" && node.kind !== "or" && node.kind !== "not")
    return null;
  const leaves = flattenMetaExpression(node);
  if (!leaves) return null;
  return {
    metaPairs: leaves.map((leaf, index) => {
      const separator = leaf.value.indexOf("\u0000");
      return {
        key: leaf.value.slice(0, separator),
        value: leaf.value.slice(separator + 1),
        ...(index === 0 || leaf.join === undefined ? {} : { join: leaf.join }),
        ...(leaf.exclude ? { exclude: true } : {}),
      };
    }),
  };
}

function activeConditionGroups(filter: StructuredFilter): string[] {
  const groups: string[] = [];
  if (matcherPatterns(filter.account).length) groups.push("account");
  if (matcherPatterns(filter.payee).length) groups.push("payee");
  if (matcherPatterns(filter.narration).length) groups.push("narration");
  if (matcherPatterns(filter.any).length) groups.push("any");
  if (filter.tags?.length || filter.tagPairs?.length) groups.push("tags");
  if (Object.keys(filter.meta ?? {}).length || filter.metaPairs?.length)
    groups.push("meta");
  return groups;
}

function setRightJoin(
  left: StructuredFilter,
  right: StructuredFilter,
  join: Join,
): StructuredFilter {
  const rightGroups = activeConditionGroups(right) as ConditionKey[];
  const first = rightGroups[0];
  return {
    ...left,
    ...right,
    conditionLogic: {
      ...left.conditionLogic,
      ...right.conditionLogic,
      ...(first
        ? {
            [first]: {
              ...left.conditionLogic?.[first],
              ...right.conditionLogic?.[first],
              join,
            },
          }
        : {}),
    },
  };
}

function excludeSingleCondition(
  filter: StructuredFilter,
): StructuredFilter | null {
  const groups = activeConditionGroups(filter) as ConditionKey[];
  if (groups.length !== 1) return null;
  const key = groups[0];
  return {
    ...filter,
    conditionLogic: {
      ...filter.conditionLogic,
      [key]: {
        ...filter.conditionLogic?.[key],
        exclude: true,
      },
    },
  };
}

function combineOr(left: DslNode, right: DslNode): StructuredFilter | null {
  if (left.kind === "tag" && right.kind === "tag")
    return {
      tags: [...new Set([left.value, right.value])],
      tagMode: "any",
    };
  if (left.kind === "field" && right.kind === "field") {
    if (left.key === right.key) {
      if (
        left.key === "account" ||
        left.key === "payee" ||
        left.key === "narration" ||
        left.key === "any"
      )
        return { [left.key]: [left.value, right.value] };
      return null;
    }
  }
  const leftFilter = nodeToStructured(left);
  const rightFilter = nodeToStructured(right);
  if (leftFilter && rightFilter) {
    const leftGroups = activeConditionGroups(leftFilter);
    const rightGroups = activeConditionGroups(rightFilter);
    if (
      leftGroups.length === 1 &&
      rightGroups.length === 1 &&
      leftGroups[0] === "meta" &&
      rightGroups[0] === "meta"
    )
      return {
        ...leftFilter,
        ...rightFilter,
        meta: {
          ...(leftFilter.meta ?? {}),
          ...(rightFilter.meta ?? {}),
        },
        metaMode: "any",
      };
    if (
      leftGroups.length === 1 &&
      rightGroups.length === 1 &&
      leftGroups[0] !== rightGroups[0]
    )
      return setRightJoin(leftFilter, rightFilter, "or");
  }
  return null;
}

function nodeToStructured(node: DslNode): StructuredFilter | null {
  const simple = simpleNodeFilter(node);
  if (simple) return simple;
  const tagExpression = tagExpressionToStructured(node);
  if (tagExpression) return tagExpression;
  const metaExpression = metaExpressionToStructured(node);
  if (metaExpression) return metaExpression;
  if (node.kind === "and") {
    const left = nodeToStructured(node.left);
    const right = nodeToStructured(node.right);
    return left && right ? mergeAnd(left, right) : null;
  }
  if (node.kind === "or") {
    const direct = combineOr(node.left, node.right);
    if (direct) return direct;
    const left = nodeToStructured(node.left);
    const right = nodeToStructured(node.right);
    if (!left || !right) return null;
    const leftTagOnly =
      left.tags?.length &&
      Object.keys(left).every((key) => key === "tags" || key === "tagMode");
    const rightTagOnly =
      right.tags?.length &&
      Object.keys(right).every((key) => key === "tags" || key === "tagMode");
    if (leftTagOnly && rightTagOnly)
      return {
        tags: [...new Set([...(left.tags ?? []), ...(right.tags ?? [])])],
        tagMode: "any",
      };
    const leftKeys = Object.keys(left).filter(
      (key) => key !== "tags" && key !== "tagMode",
    );
    const rightKeys = Object.keys(right).filter(
      (key) => key !== "tags" && key !== "tagMode",
    );
    if (
      leftKeys.length === 1 &&
      rightKeys.length === 1 &&
      leftKeys[0] === rightKeys[0] &&
      ["account", "payee", "narration", "any"].includes(leftKeys[0])
    ) {
      const key = leftKeys[0] as "account" | "payee" | "narration" | "any";
      return {
        [key]: matcherValue([
          ...matcherPatterns(left[key]),
          ...matcherPatterns(right[key]),
        ]),
      };
    }
    return null;
  }
  if (node.kind === "not") {
    const child = nodeToStructured(node.child);
    return child ? excludeSingleCondition(child) : null;
  }
  if (node.kind === "any") {
    if (node.child.kind === "field" && node.child.key === "account")
      return { account: node.child.value };
    return null;
  }
  return null;
}

export function parseGeneratedDsl(source: string): StructuredFilter {
  const trimmed = source.trim();
  if (!trimmed) throw new Error("DSL 为空，没有可转换的条件。");
  const node = new DslReader(lexDsl(trimmed)).parse();
  const filter = nodeToStructured(node);
  if (!filter || !hasFilterCondition(filter))
    throw new Error(
      "此 DSL 含金额、嵌套组合或复杂跨字段条件，结构化编辑器无法无损表达。原文已保留。",
    );
  return filter;
}
