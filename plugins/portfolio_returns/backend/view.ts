import { createHash } from "node:crypto";
import { parseLedgerFiles, stripFavaPlugins } from "@beancount/plugin";
import type { PluginRepository } from "@beancount/plugin";
import {
  CONFIG_FILE,
  defaultPortfolioConfig,
  parsePortfolioConfig,
  portfolioConfigDocument,
} from "./config";
import type { Catalog, PortfolioConfig } from "./config";
import { scanCatalog, todayIso } from "./engine";
import { buildReport } from "./report";
import type { Report, ReportOptions } from "./report";
import type { LedgerDirective } from "./types";

export type View = {
  revision: string;
  config: PortfolioConfig;
  configText: string;
  configPath: string;
  exists: boolean;
  catalog: Catalog;
  primaryCurrency: string;
  operatingCurrencies: string[];
  configError: string | null;
  ledgerError: string | null;
  ledgerErrors: Array<{
    message: string;
    file: string | null;
    line: number | null;
    severity: string;
  }>;
  today: string;
};

type LedgerState = {
  files: Record<string, string>;
  configSource: string | undefined;
  directives: LedgerDirective[];
  options: { operating_currencies?: string[] };
  ledgerError: string | null;
  ledgerErrors: View["ledgerErrors"];
};

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function readLedgerState(
  repository: PluginRepository,
  ledgerId: string,
): Promise<LedgerState> {
  const files = await repository.readFileMap(ledgerId);
  const ledger = repository.getLedger(ledgerId);
  const configSource = files[CONFIG_FILE];
  let directives: LedgerState["directives"] = [];
  let options: LedgerState["options"] = {
    operating_currencies: [],
  };
  let ledgerError: string | null = null;
  let ledgerErrors: View["ledgerErrors"] = [];
  try {
    const stripped = stripFavaPlugins(files, ledger.entryPoint).strippedFiles;
    const snapshot = await parseLedgerFiles(stripped, ledger.entryPoint, {
      applyTsPlugins: false,
    });
    directives = snapshot.directives as unknown as LedgerDirective[];
    options = snapshot.options as LedgerState["options"];
    const firstError = snapshot.errors.find(
      (error) => error.severity === "error",
    );
    ledgerError = firstError?.message ?? null;
    ledgerErrors = snapshot.errors.slice(0, 20).map((error) => ({
      message: error.message,
      file: error.file,
      line: error.line,
      severity: error.severity,
    }));
  } catch (cause) {
    ledgerError = cause instanceof Error ? cause.message : String(cause);
  }
  return {
    files,
    configSource,
    directives,
    options,
    ledgerError,
    ledgerErrors,
  };
}

function primaryCurrency(state: LedgerState): string {
  return state.options.operating_currencies?.[0] ?? "CNY";
}

function readConfig(state: LedgerState): {
  config: PortfolioConfig;
  configError: string | null;
} {
  const fallback = primaryCurrency(state);
  if (state.configSource === undefined)
    return {
      config: defaultPortfolioConfig(fallback),
      configError: null,
    };
  try {
    return {
      config: parsePortfolioConfig(JSON.parse(state.configSource), fallback),
      configError: null,
    };
  } catch (cause) {
    return {
      config: defaultPortfolioConfig(fallback),
      configError: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

export async function readView(
  repository: PluginRepository,
  ledgerId: string,
  settings: Record<string, unknown>,
): Promise<View> {
  if (settings.enabled !== true) throw new Error("投资组合收益插件尚未启用");
  const state = await readLedgerState(repository, ledgerId);
  const { config, configError } = readConfig(state);
  const catalog = scanCatalog(state.directives, config.baseCurrency);
  return {
    revision: hash(state.configSource ?? ""),
    config,
    configText: state.configSource ?? portfolioConfigDocument(config),
    configPath: CONFIG_FILE,
    exists: state.configSource !== undefined,
    catalog,
    primaryCurrency: primaryCurrency(state),
    operatingCurrencies: state.options.operating_currencies ?? [],
    configError,
    ledgerError: state.ledgerError,
    ledgerErrors: state.ledgerErrors,
    today: todayIso(),
  };
}

function date(value: unknown, label: string): string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/u.test(value) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
  )
    throw new Error(`${label}必须是有效日期`);
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 200)
    throw new Error(`${label}必须是最多 200 项的数组`);
  return value.map((item) => {
    if (typeof item !== "string" || item.length > 200)
      throw new Error(`${label}包含无效项`);
    return item;
  });
}

function reportOptions(body: Record<string, unknown>): ReportOptions {
  const startDate = date(body.startDate, "开始日期");
  const endDate = date(body.endDate, "结束日期");
  if (startDate > endDate) throw new Error("开始日期不能晚于结束日期");
  const currency =
    typeof body.currency === "string" ? body.currency.trim() : "";
  if (!/^[A-Z][A-Z0-9'._/-]{0,31}$/u.test(currency))
    throw new Error("目标货币格式不正确");
  const metric =
    body.metric === "twr" ||
    body.metric === "pnl" ||
    body.metric === "xirr" ||
    body.metric === "mdm" ||
    body.metric === "mdd" ||
    body.metric === "volatility"
      ? body.metric
      : "returns";
  return {
    startDate,
    endDate,
    currency,
    selection: stringArray(body.selection, "投资选择"),
    compareWith: stringArray(body.compareWith, "对比对象"),
    metric,
  };
}

export async function readReport(
  repository: PluginRepository,
  ledgerId: string,
  body: Record<string, unknown>,
): Promise<Report> {
  const state = await readLedgerState(repository, ledgerId);
  const { config, configError } = readConfig(state);
  if (configError) throw new Error(`插件配置无效：${configError}`);
  if (state.ledgerError && state.directives.length === 0)
    throw new Error(state.ledgerError);
  return buildReport(state.directives, config, reportOptions(body));
}

export async function saveConfig(
  repository: PluginRepository,
  ledgerId: string,
  body: Record<string, unknown>,
): Promise<View> {
  const state = await readLedgerState(repository, ledgerId);
  const revision = typeof body.revision === "string" ? body.revision : "";
  if (revision !== hash(state.configSource ?? ""))
    throw new Error("配置已变化，请重新读取后再保存");
  const config = parsePortfolioConfig(body.config, primaryCurrency(state));
  await repository.writeFile(
    ledgerId,
    CONFIG_FILE,
    portfolioConfigDocument(config),
    state.configSource === undefined ? undefined : hash(state.configSource),
  );
  const catalog = scanCatalog(state.directives, config.baseCurrency);
  return {
    revision: hash(portfolioConfigDocument(config)),
    config,
    configText: portfolioConfigDocument(config),
    configPath: CONFIG_FILE,
    exists: true,
    catalog,
    primaryCurrency: primaryCurrency(state),
    operatingCurrencies: state.options.operating_currencies ?? [],
    configError: null,
    ledgerError: state.ledgerError,
    ledgerErrors: state.ledgerErrors,
    today: todayIso(),
  };
}
