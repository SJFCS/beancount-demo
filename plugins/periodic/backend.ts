import { createHash } from "node:crypto";
import {
  applyPeriodicGenerationMode,
  analyzePeriodicDirectives,
  LOCAL_PLUGIN_CONFIG_PATH,
  parseLedgerFiles,
  parsePeriodicGenerationMode,
  periodicAutoOpenedAccounts,
  periodicDisabledRuleKeysFromFiles,
  PERIODIC_DISABLED_RULES_KEY,
  PERIODIC_GENERATION_MODE_KEY,
  readLocalPluginConfig,
  stripFavaPlugins,
  updateLocalPluginFlag,
  updateLocalPluginSetting,
} from "@beancount/plugin";
import type {
  LocalPluginBackend,
  PeriodicAnalysis,
  PeriodicGenerationMode,
  PeriodicIssue,
  PeriodicPlan,
  PeriodicRule,
  PluginRepository as LocalLedgerRepositoryAdapter,
} from "@beancount/plugin";

type Mapping = Record<string, unknown>;
type Summary = {
  transactions: number;
  rules: number;
  periods: number;
  transactionsWithRules: number;
};
type RuleView = PeriodicRule & { enabled: boolean };
type View = {
  revision: string;
  mode: PeriodicGenerationMode;
  rules: RuleView[];
  plan: PeriodicPlan;
  next: PeriodicPlan["rows"][number] | null;
  issues: PeriodicIssue[];
  autoOpened: string[];
  ledgerError: string | null;
  summary: Summary;
};

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function todayIso(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function record(value: unknown, label: string): Mapping {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label}必须是对象`);
  }
  return value as Mapping;
}

async function loadState(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  const pluginConfig = await readLocalPluginConfig(repository, ledgerId);
  const settings = record(
    record(pluginConfig.plugins ?? {}, "plugins").periodic ?? {},
    "plugins.periodic",
  );
  if (settings.enabled !== true) throw new Error("摊销与折旧插件尚未启用");
  const files = await repository.readFileMap(ledgerId);
  const configSource = files[LOCAL_PLUGIN_CONFIG_PATH];
  return {
    files,
    entryPoint: repository.getLedger(ledgerId).entryPoint,
    mode: parsePeriodicGenerationMode(settings[PERIODIC_GENERATION_MODE_KEY]),
    revision: hash(configSource ?? ""),
    disabledRuleKeys: periodicDisabledRuleKeysFromFiles(files),
  };
}

function emptyAnalysis(): PeriodicAnalysis {
  return analyzePeriodicDirectives([]);
}

async function readView(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
): Promise<View> {
  const state = await loadState(repository, ledgerId);
  const today = todayIso();
  let analysis = emptyAnalysis();
  let plan = applyPeriodicGenerationMode(
    analysis.plan,
    state.mode,
    today,
    state.disabledRuleKeys,
  );
  let next: PeriodicPlan["rows"][number] | null = null;
  let ledgerError: string | null = null;
  let transactions = 0;
  let transactionsWithRules = 0;

  try {
    // Read the raw stream: the runtime periodic plugin removes rule metadata
    // from its materialized output, while this page must still show the rules.
    const stripped = stripFavaPlugins(
      state.files,
      state.entryPoint,
    ).strippedFiles;
    const snapshot = await parseLedgerFiles(stripped, state.entryPoint, {
      applyTsPlugins: false,
    });
    analysis = analyzePeriodicDirectives(snapshot.directives);
    plan = applyPeriodicGenerationMode(
      analysis.plan,
      state.mode,
      today,
      state.disabledRuleKeys,
    );
    next =
      applyPeriodicGenerationMode(
        analysis.plan,
        "all",
        today,
        state.disabledRuleKeys,
      ).rows.find((row) => row.date > today) ?? null;
    transactions = snapshot.directives.filter(
      (directive) => directive.type === "transaction",
    ).length;
    transactionsWithRules = new Set(
      analysis.rules.map((rule) => rule.transactionIndex),
    ).size;
    const firstError = snapshot.errors.find(
      (error) => error.severity === "error",
    );
    ledgerError = firstError?.message ?? null;
  } catch (cause) {
    ledgerError = cause instanceof Error ? cause.message : String(cause);
  }

  return {
    revision: state.revision,
    mode: state.mode,
    rules: analysis.rules.map((rule) => ({
      ...rule,
      enabled: !state.disabledRuleKeys.has(rule.ruleKey),
    })),
    plan,
    next,
    issues: analysis.issues,
    autoOpened: periodicAutoOpenedAccounts(
      analysis.rules,
      state.disabledRuleKeys,
    ),
    ledgerError,
    summary: {
      transactions,
      rules: analysis.rules.length,
      periods: plan.rows.length,
      transactionsWithRules,
    },
  };
}

async function saveMode(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
  revision: string,
): Promise<View> {
  const mode =
    value === "all" || value === "pending" || value === "through_today"
      ? value
      : null;
  if (mode === null) throw new Error("未知的摊销与折旧生成策略");
  const state = await loadState(repository, ledgerId);
  if (state.revision !== revision) {
    throw new Error("本地插件配置已变化，请重新读取后再修改生成策略");
  }
  const source = state.files[LOCAL_PLUGIN_CONFIG_PATH];
  if (source === undefined) throw new Error("本地插件配置文件不存在");
  const next = updateLocalPluginSetting(
    source,
    "periodic",
    PERIODIC_GENERATION_MODE_KEY,
    mode,
  );
  if (next !== source) {
    await repository.writeFile(
      ledgerId,
      LOCAL_PLUGIN_CONFIG_PATH,
      next,
      hash(source),
    );
  }
  return readView(repository, ledgerId);
}

async function saveRule(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  ruleKey: unknown,
  enabled: unknown,
  revision: string,
): Promise<View> {
  if (typeof ruleKey !== "string" || !/^[a-z0-9-]{1,64}$/u.test(ruleKey)) {
    throw new Error("无法识别要修改的摊销与折旧规则");
  }
  if (typeof enabled !== "boolean") {
    throw new Error("规则开关状态必须是布尔值");
  }
  const state = await loadState(repository, ledgerId);
  if (state.revision !== revision) {
    throw new Error("本地插件配置已变化，请重新读取后再修改规则");
  }
  const source = state.files[LOCAL_PLUGIN_CONFIG_PATH];
  if (source === undefined) throw new Error("本地插件配置文件不存在");
  const next = updateLocalPluginFlag(
    source,
    "periodic",
    PERIODIC_DISABLED_RULES_KEY,
    ruleKey,
    !enabled,
  );
  if (next !== source) {
    await repository.writeFile(
      ledgerId,
      LOCAL_PLUGIN_CONFIG_PATH,
      next,
      hash(source),
    );
  }
  return readView(repository, ledgerId);
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body }) {
    if (method === "GET" && !action) return readView(repository, ledgerId);
    if (method === "POST" && action === "mode") {
      return saveMode(
        repository,
        ledgerId,
        body.mode,
        typeof body.revision === "string" ? body.revision : "",
      );
    }
    if (method === "POST" && action === "rule") {
      return saveRule(
        repository,
        ledgerId,
        body.ruleKey,
        body.enabled,
        typeof body.revision === "string" ? body.revision : "",
      );
    }
    throw new Error(
      "摊销与折旧规则现在直接来自账本元数据，不再保存 JSON 或生成 Bean。",
    );
  },
};

export default backend;
