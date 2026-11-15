import { createHash } from "node:crypto";
import {
  analyzeValuation,
  parseLedgerFiles,
  parseValuationConfig,
  readValuationConfig,
  stripFavaPlugins,
  valuationConfigDocument,
  VALUATION_CONFIG_FILE,
} from "@beancount/plugin";
import type {
  LocalPluginBackend,
  ValuationAnalysis,
  ValuationConfig,
} from "@beancount/plugin";

export type PublicAnalysis = Omit<ValuationAnalysis, "directives">;

export type View = {
  revision: string;
  config: ValuationConfig;
  configText: string;
  configPath: string;
  exists: boolean;
  analysis: PublicAnalysis;
  configError: string | null;
  ledgerError: string | null;
  ledgerErrors: Array<{
    message: string;
    file: string | null;
    line: number | null;
    severity: string;
  }>;
};

const EMPTY_CONFIG = parseValuationConfig({});
const EMPTY_ANALYSIS: PublicAnalysis = {
  errors: [],
  accounts: [],
  totals: [],
  generated: {
    prices: 0,
    opens: 0,
    commodities: 0,
  },
};

export function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function publicAnalysis(analysis: ValuationAnalysis): PublicAnalysis {
  const { directives: _directives, ...report } = analysis;
  return report;
}

export async function readView(
  repository: Parameters<LocalPluginBackend["handle"]>[0]["repository"],
  ledgerId: string,
  settings: Record<string, unknown>,
): Promise<View> {
  if (settings.enabled !== true) throw new Error("估值插件尚未启用");
  const files = await repository.readFileMap(ledgerId);
  const ledger = repository.getLedger(ledgerId);
  const configSource = files[VALUATION_CONFIG_FILE];
  let config = EMPTY_CONFIG;
  let configError: string | null = null;
  try {
    config = readValuationConfig(files);
  } catch (cause) {
    configError = cause instanceof Error ? cause.message : String(cause);
  }

  let analysis = EMPTY_ANALYSIS;
  let ledgerError: string | null = null;
  let ledgerErrors: View["ledgerErrors"] = [];
  try {
    // Validate the same stream the runtime sees. The raw parse below feeds
    // analyzeValuation, so any balance checks it reports are not meaningful
    // for this page.
    const applied = await parseLedgerFiles(files, ledger.entryPoint, {
      applyTsPlugins: true,
    });
    ledgerError =
      applied.errors.find((error) => error.severity === "error")?.message ??
      null;
    ledgerErrors = applied.errors.slice(0, 12).map((error) => ({
      message: error.message,
      file: error.file,
      line: error.line,
      severity: error.severity,
    }));
  } catch (cause) {
    ledgerError = cause instanceof Error ? cause.message : String(cause);
  }

  try {
    const stripped = stripFavaPlugins(files, ledger.entryPoint).strippedFiles;
    const snapshot = await parseLedgerFiles(stripped, ledger.entryPoint, {
      applyTsPlugins: false,
      includeSourceDetails: true,
    });
    analysis = publicAnalysis(
      analyzeValuation(snapshot.directives, config, {
        fallbackQuote: snapshot.options.operating_currencies?.[0] ?? "USD",
      }),
    );
  } catch (cause) {
    ledgerError ??= cause instanceof Error ? cause.message : String(cause);
  }

  return {
    revision: hash(configSource ?? ""),
    config,
    configText: configSource ?? valuationConfigDocument(config),
    configPath: VALUATION_CONFIG_FILE,
    exists: configSource !== undefined,
    analysis,
    configError,
    ledgerError,
    ledgerErrors,
  };
}
