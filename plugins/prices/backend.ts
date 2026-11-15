import { createHash } from "node:crypto";
import BigNumber from "bignumber.js";
import {
  collectSourceFiles,
  parseLedgerFiles,
  validateManagedPriceText,
  logger,
  readLocalPluginConfig,
} from "@beancount/plugin";
import type {
  PluginRepository as LocalLedgerRepositoryAdapter,
  LocalPluginBackend,
} from "@beancount/plugin";

type Mapping = Record<string, unknown>;
type PriceSource =
  | "yahoo"
  | "eastmoneyfund"
  | "exchangerate"
  | "ecbrates"
  | "coinbase"
  | "coincap"
  | "alphavantage"
  | "nasdaq"
  | "beancount"
  | "coinmarketcap"
  | "oanda"
  | "quandl"
  | "tsp";
type SourceFallback = { source: PriceSource; ticker: string };
type Instrument = {
  commodity: string;
  quote: string;
  source: PriceSource;
  ticker: string;
  file: string;
  enabled: boolean;
  security?: true;
  synthetic?: true;
  fallbacks?: SourceFallback[];
};
type Conversion = {
  from: string;
  to: string;
  rate: string;
  date: string;
  source: "exchangerate";
};
type Quote = Instrument & {
  date: string;
  amount: string;
  providerCurrency?: string;
  providerTicker?: string;
  providerSource?: PriceSource;
  conversion?: Conversion;
  inverted?: boolean;
};
type ExistingQuote = Pick<Quote, "date" | "commodity" | "quote" | "file">;
type Schedule = { enabled: boolean; time: string; timezone: string };
type Run = {
  errors: Array<{ commodity: string; message: string }>;
};
type StoredState = { scheduledDay?: string };
type StoredPrice = {
  date: string;
  amount: string;
  quote: string;
  source?: string;
  file: string;
};
type SavedConfig = { instruments: Instrument[]; schedule: Schedule };
type SourceDefinition = {
  id: PriceSource;
  name: string;
  provider: string;
  description: string;
  tickerHint: string;
  tickerExample: string;
  coverage: "fiat" | "crypto" | "stock" | "fund" | "feed" | "mixed";
  supports: { latest: boolean; historical: boolean; series: boolean };
  apiKeyEnv?: string;
};
type SourcePrice = {
  date: string;
  amount: BigNumber;
  currency: string;
  time?: string;
  providerSource?: PriceSource;
  providerTicker?: string;
};

const CONFIG_FILE = "plugins/prices/config.json";
const STATE_FILE = "plugins/prices/state.json";
const FETCH_CONCURRENCY = 3;
const SOURCE_DEFINITIONS: SourceDefinition[] = [
  {
    id: "yahoo",
    name: "Yahoo Finance",
    provider: "Yahoo",
    description:
      "股票、ETF、基金、加密货币和法币对。支持历史日期与日线序列；Yahoo 限流时会自动尝试 Nasdaq（美股）。",
    tickerHint: "AAPL、0700.HK、VOD.L、BTC-USD、USDCNY=X",
    tickerExample: "AAPL",
    coverage: "mixed",
    supports: { latest: true, historical: true, series: true },
  },
  {
    id: "eastmoneyfund",
    name: "天天基金",
    provider: "EastMoney",
    description:
      "中国公募基金单位净值，报价固定为 CNY。支持历史净值与净值序列。",
    tickerHint: "六位基金代码，例如 005827",
    tickerExample: "005827",
    coverage: "fund",
    supports: { latest: true, historical: true, series: true },
  },
  {
    id: "exchangerate",
    name: "Frankfurter / ECB 汇率",
    provider: "Frankfurter",
    description:
      "欧洲央行每日参考汇率，支持法币之间最新、历史日期和日期区间查询。",
    tickerHint: "基础货币代码，例如 USD；报价货币由右侧列决定",
    tickerExample: "USD",
    coverage: "fiat",
    supports: { latest: true, historical: true, series: true },
  },
  {
    id: "ecbrates",
    name: "ECB 官方汇率",
    provider: "European Central Bank",
    description:
      "直接读取 ECB Data Portal，支持 EUR 交叉汇率、历史日期和日期区间。",
    tickerHint: "BASE-QUOTE 或留空使用商品/报价货币，例如 USD-CNY",
    tickerExample: "USD-CNY",
    coverage: "fiat",
    supports: { latest: true, historical: true, series: true },
  },
  {
    id: "coinbase",
    name: "Coinbase",
    provider: "Coinbase",
    description: "常见加密货币现货价，支持历史日期；报价货币由来源返回。",
    tickerHint: "币种代码，例如 BTC；也可输入 BTC-USD",
    tickerExample: "BTC",
    coverage: "crypto",
    supports: { latest: true, historical: true, series: true },
  },
  {
    id: "coincap",
    name: "CoinCap",
    provider: "CoinCap",
    description:
      "CoinCap v3，报价固定 USD；需要环境变量 COINCAP_API_KEY，支持历史日期和日线序列。",
    tickerHint: "币种代码或 CoinCap slug，例如 BTC、bitcoin",
    tickerExample: "BTC",
    coverage: "crypto",
    supports: { latest: true, historical: true, series: true },
    apiKeyEnv: "COINCAP_API_KEY",
  },
  {
    id: "alphavantage",
    name: "Alpha Vantage",
    provider: "Alpha Vantage",
    description:
      "股票与外汇。需要环境变量 ALPHAVANTAGE_API_KEY；ticker 使用 price:SYMBOL:CCY 或 fx:FROM:TO。",
    tickerHint: "price:AAPL:USD 或 fx:USD:CNY",
    tickerExample: "price:AAPL:USD",
    coverage: "mixed",
    supports: { latest: true, historical: false, series: false },
    apiKeyEnv: "ALPHAVANTAGE_API_KEY",
  },
  {
    id: "nasdaq",
    name: "Nasdaq",
    provider: "Nasdaq",
    description:
      "美股与 ETF 的公开行情接口，报价 USD；Yahoo 429 时的可靠替代。",
    tickerHint: "美股代码，例如 AAPL、IBM",
    tickerExample: "AAPL",
    coverage: "stock",
    supports: { latest: true, historical: true, series: true },
  },
  {
    id: "beancount",
    name: "Beancount.io",
    provider: "Beancount.io",
    description:
      "读取 beancount.io/live-prices 的托管价格 feed；需要环境变量 BEANCOUNT_PRICES_COOKIE。",
    tickerHint: "feed 别名，例如 BTC-USD",
    tickerExample: "BTC-USD",
    coverage: "feed",
    supports: { latest: true, historical: true, series: true },
    apiKeyEnv: "BEANCOUNT_PRICES_COOKIE",
  },
  {
    id: "coinmarketcap",
    name: "CoinMarketCap",
    provider: "CoinMarketCap",
    description:
      "需要环境变量 COINMARKETCAP_API_KEY；当前插件保留接口但未启用抓取。",
    tickerHint: "SYMBOL-QUOTE，例如 BTC-USD",
    tickerExample: "BTC-USD",
    coverage: "crypto",
    supports: { latest: false, historical: false, series: false },
    apiKeyEnv: "COINMARKETCAP_API_KEY",
  },
  {
    id: "oanda",
    name: "OANDA",
    provider: "OANDA",
    description: "需要 OANDA_API_KEY；当前插件保留接口但未启用抓取。",
    tickerHint: "BASE-QUOTE，例如 EUR-USD",
    tickerExample: "EUR-USD",
    coverage: "fiat",
    supports: { latest: false, historical: false, series: false },
    apiKeyEnv: "OANDA_API_KEY",
  },
  {
    id: "quandl",
    name: "Quandl",
    provider: "Quandl",
    description: "需要 QUANDL_API_KEY；当前插件保留接口但未启用抓取。",
    tickerHint: "DATABASE:DATASET，例如 LBMA:GOLD",
    tickerExample: "LBMA:GOLD",
    coverage: "mixed",
    supports: { latest: false, historical: false, series: false },
    apiKeyEnv: "QUANDL_API_KEY",
  },
  {
    id: "tsp",
    name: "TSP",
    provider: "Thrift Savings Plan",
    description: "美国 TSP 基金价格，报价 USD；支持最新与历史日期。",
    tickerHint: "基金代码，例如 C、S、I",
    tickerExample: "C",
    coverage: "fund",
    supports: { latest: true, historical: true, series: true },
  },
];
const SOURCE_ALIASES: Record<string, PriceSource> = {
  ratesapi: "exchangerate",
  frankfurter: "exchangerate",
  ecb: "ecbrates",
  beanprice: "beancount",
  "beanprice.sources.yahoo": "yahoo",
  "beanprice.sources.eastmoneyfund": "eastmoneyfund",
  "beanprice.sources.exchangerate": "exchangerate",
  "beanprice.sources.ecbrates": "ecbrates",
  "beanprice.sources.coinbase": "coinbase",
  "beanprice.sources.coincap": "coincap",
  "beanprice.sources.alphavantage": "alphavantage",
  "beanprice.sources.coinmarketcap": "coinmarketcap",
  "beanprice.sources.oanda": "oanda",
  "beanprice.sources.quandl": "quandl",
  "beanprice.sources.tsp": "tsp",
};
const SOURCES: PriceSource[] = SOURCE_DEFINITIONS.map((item) => item.id);
const SYMBOL = /^[A-Z](?:[A-Z0-9'._-]{0,22}[A-Z0-9])?$/u;
const FIAT = new Set(Intl.supportedValuesOf("currency"));
const CRYPTO = new Set([
  "BTC",
  "ETH",
  "LTC",
  "BCH",
  "SOL",
  "DOGE",
  "ADA",
  "DOT",
  "XRP",
  "USDT",
  "USDC",
  "BNB",
  "AVAX",
]);

function record(value: unknown): Mapping {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a configuration object");
  return value as Mapping;
}

function maybeRecord(value: unknown): Mapping | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Mapping)
    : undefined;
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

function source(value: unknown): PriceSource {
  const raw = typeof value === "string" ? value.trim() : "";
  const resolved =
    SOURCE_ALIASES[raw] ??
    SOURCE_ALIASES[raw.replace(/^beanprice\.(?:sources\.)?/u, "")] ??
    (raw as PriceSource);
  if (!SOURCES.includes(resolved))
    throw new Error(`Unsupported price source: ${String(value)}`);
  return resolved;
}

function sourceDefinition(value: PriceSource): SourceDefinition {
  return (
    SOURCE_DEFINITIONS.find((item) => item.id === value) ??
    SOURCE_DEFINITIONS[0]
  );
}

function sourceApiKeyConfigured(
  definition: SourceDefinition,
): boolean | undefined {
  if (!definition.apiKeyEnv) return undefined;
  return Boolean(process.env[definition.apiKeyEnv]?.trim());
}

function schedule(value: unknown): Schedule {
  const input = record(value);
  if (
    typeof input.enabled !== "boolean" ||
    typeof input.time !== "string" ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(input.time) ||
    typeof input.timezone !== "string"
  )
    throw new Error(
      "Schedule requires enabled, HH:mm time and an IANA timezone",
    );
  new Intl.DateTimeFormat("en", { timeZone: input.timezone }).format();
  return { enabled: input.enabled, time: input.time, timezone: input.timezone };
}

function instrument(value: unknown): Instrument {
  const input = record(value);
  if (
    typeof input.commodity !== "string" ||
    !SYMBOL.test(input.commodity) ||
    typeof input.quote !== "string" ||
    !SYMBOL.test(input.quote) ||
    input.commodity === input.quote
  )
    throw new Error("Invalid commodity/currency pair");
  if (
    typeof input.ticker !== "string" ||
    !/^[A-Za-z0-9^=._:/%-]{1,160}$/u.test(input.ticker)
  )
    throw new Error("Invalid provider symbol");
  if (
    typeof input.file !== "string" ||
    !/^prices\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9][A-Za-z0-9'._-]*\.bean$/u.test(
      input.file,
    ) ||
    input.file.split("/").some((part) => part === "..")
  )
    throw new Error("Price output must be a .bean file inside prices/");
  if (typeof input.enabled !== "boolean")
    throw new Error("An instrument requires enabled");
  const fallbacks =
    input.fallbacks === undefined
      ? undefined
      : Array.isArray(input.fallbacks)
        ? input.fallbacks.map((fallback) => {
            const entry = record(fallback);
            if (
              typeof entry.ticker !== "string" ||
              !/^[A-Za-z0-9^=._:/%-]{1,160}$/u.test(entry.ticker)
            )
              throw new Error("Invalid fallback provider symbol");
            return { source: source(entry.source), ticker: entry.ticker };
          })
        : (() => {
            throw new Error("Fallbacks must be an array");
          })();
  return {
    commodity: input.commodity,
    quote: input.quote,
    source: source(input.source),
    ticker: input.ticker,
    file: input.file,
    enabled: input.enabled,
    ...(input.security === true ? { security: true as const } : {}),
    ...(input.synthetic === true ? { synthetic: true as const } : {}),
    ...(fallbacks?.length ? { fallbacks } : {}),
  };
}

function requestInstrument(value: unknown): Instrument {
  const input = record(value);
  if (
    typeof input.commodity !== "string" ||
    typeof input.quote !== "string" ||
    !input.commodity.trim() ||
    !input.quote.trim()
  )
    throw new Error("Instrument requires commodity and quote");
  const commodity = input.commodity.trim().toUpperCase();
  const quote = input.quote.trim().toUpperCase();
  const base = defaultInstrument(commodity, quote, input.security === true);
  const selectedSource =
    typeof input.source === "string" ? source(input.source) : base.source;
  const ticker =
    typeof input.ticker === "string"
      ? input.ticker
      : selectedSource === "beancount"
        ? `${commodity}-${quote}`
        : base.ticker;
  return instrument({
    ...base,
    commodity,
    quote,
    source: selectedSource,
    ticker,
    ...(typeof input.file === "string" ? { file: input.file } : {}),
    ...(typeof input.enabled === "boolean" ? { enabled: input.enabled } : {}),
    ...(input.fallbacks !== undefined ? { fallbacks: input.fallbacks } : {}),
  });
}

function requestConversion(value: unknown): Conversion | undefined {
  if (value === undefined) return undefined;
  const input = record(value);
  if (
    typeof input.from !== "string" ||
    !SYMBOL.test(input.from) ||
    typeof input.to !== "string" ||
    !SYMBOL.test(input.to) ||
    input.source !== "exchangerate" ||
    typeof input.date !== "string" ||
    !validDate(input.date)
  )
    throw new Error("Invalid currency conversion");
  return {
    from: input.from,
    to: input.to,
    rate: formatAmount(parsePositiveAmount(input.rate)),
    date: input.date,
    source: "exchangerate",
  };
}

function requestQuote(value: unknown): Quote {
  const input = record(value);
  const item = requestInstrument(input);
  if (typeof input.date !== "string" || !validDate(input.date))
    throw new Error("Price date must use YYYY-MM-DD");
  const providerCurrency =
    input.providerCurrency === undefined
      ? undefined
      : typeof input.providerCurrency === "string" &&
          /^[A-Za-z]{3,5}$/u.test(input.providerCurrency)
        ? input.providerCurrency
        : (() => {
            throw new Error("Invalid provider currency");
          })();
  const providerTicker =
    input.providerTicker === undefined
      ? undefined
      : typeof input.providerTicker === "string" &&
          /^[A-Za-z0-9^=._:/%-]{1,160}$/u.test(input.providerTicker)
        ? input.providerTicker
        : (() => {
            throw new Error("Invalid provider ticker");
          })();
  const providerSource =
    input.providerSource === undefined
      ? undefined
      : source(input.providerSource);
  const conversion = requestConversion(input.conversion);
  return {
    ...item,
    date: input.date,
    amount: formatAmount(parsePositiveAmount(input.amount)),
    ...(providerCurrency ? { providerCurrency } : {}),
    ...(providerTicker ? { providerTicker } : {}),
    ...(providerSource ? { providerSource } : {}),
    ...(conversion ? { conversion } : {}),
    ...(input.inverted === true ? { inverted: true } : {}),
  };
}

function requestRunErrors(value: unknown): Run["errors"] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 500)
    throw new Error("Expected up to 500 price errors");
  return value.map((raw) => {
    const input = record(raw);
    if (
      typeof input.commodity !== "string" ||
      !SYMBOL.test(input.commodity) ||
      typeof input.message !== "string" ||
      input.message.length > 4_000
    )
      throw new Error("Invalid price error");
    return { commodity: input.commodity, message: input.message };
  });
}

function parseConfig(value: unknown): SavedConfig {
  const input = record(value);
  if (!Array.isArray(input.instruments) || input.instruments.length > 500)
    throw new Error("Expected up to 500 instruments");
  const instruments = input.instruments.map(instrument);
  if (
    new Set(instruments.map((item) => `${item.commodity}/${item.quote}`))
      .size !== instruments.length
  )
    throw new Error("Duplicate commodity/currency pair");
  return { instruments, schedule: schedule(input.schedule) };
}

async function load(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  const config = await readLocalPluginConfig(repository, ledgerId);
  const settings = record(record(config.plugins ?? {}).prices ?? {});
  if (settings.enabled !== true)
    throw new Error("The prices plugin is disabled");
  const files = await repository.readFileMap(ledgerId);
  const entryPoint = repository.getLedger(ledgerId).entryPoint;
  const paths = collectSourceFiles(files, entryPoint);
  const saved =
    files[CONFIG_FILE] === undefined
      ? undefined
      : parseConfig(JSON.parse(files[CONFIG_FILE]));
  let storedState: StoredState = {};
  if (files[STATE_FILE] !== undefined) {
    try {
      const parsed = record(JSON.parse(files[STATE_FILE]));
      if (
        typeof parsed.scheduledDay === "string" &&
        validDate(parsed.scheduledDay)
      )
        storedState = { scheduledDay: parsed.scheduledDay };
    } catch {
      // A damaged schedule marker must not make the whole price page unusable.
    }
  }
  const revision = hash(
    JSON.stringify([
      config,
      Object.entries(files).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    ]),
  );
  return {
    files,
    entryPoint,
    paths,
    settings,
    saved,
    storedState,
    revision,
  };
}

function priceFilePath(
  commodity: string,
  quote: string,
  primaryQuote: string,
): string {
  return quote === primaryQuote
    ? `prices/${commodity}.bean`
    : `prices/${commodity}-to-${quote}.bean`;
}

function defaultInstrument(
  commodity: string,
  quote: string,
  heldAsSecurity = false,
  primaryQuote = quote,
): Instrument {
  const fund = /^(?:FUND|F)(\d{6})$/u.exec(commodity);
  const selectedSource = fund
    ? "eastmoneyfund"
    : !heldAsSecurity && FIAT.has(commodity)
      ? "exchangerate"
      : CRYPTO.has(commodity)
        ? "coinbase"
        : "yahoo";
  const instrumentQuote = fund ? "CNY" : quote;
  return {
    commodity,
    quote: instrumentQuote,
    source: selectedSource,
    ticker: fund?.[1] ?? commodity,
    file: priceFilePath(commodity, instrumentQuote, primaryQuote),
    enabled: true,
    ...(heldAsSecurity ? { security: true as const } : {}),
  };
}

type ParsedPriceSpec = { quote: string; sources: SourceFallback[] };

function parsePriceSpec(spec: string, defaultQuote: string): ParsedPriceSpec[] {
  const groups = new Map<string, SourceFallback[]>();
  for (const rawToken of spec.trim().split(/[;\s]+/u)) {
    if (!rawToken) continue;
    let quote: string | undefined;
    for (const rawSource of rawToken.split(",")) {
      if (!rawSource) continue;
      const match =
        /^(?:([A-Z][A-Z0-9'._-]*):)?([a-z][a-z0-9_.-]+)\/(.+)$/u.exec(
          rawSource,
        );
      if (!match)
        throw new Error(
          `Invalid beanprice source "${rawSource}"; expected [QUOTE:]source/ticker`,
        );
      quote = match[1] ?? quote ?? defaultQuote;
      if (!SYMBOL.test(quote))
        throw new Error(`Invalid quote currency in price metadata: ${quote}`);
      const ticker = match[3].trim();
      if (!/^[A-Za-z0-9^=._:/%-]{1,160}$/u.test(ticker))
        throw new Error(`Invalid provider symbol in price metadata: ${ticker}`);
      const list = groups.get(quote) ?? [];
      list.push({ source: source(match[2]), ticker });
      groups.set(quote, list);
    }
  }
  return [...groups].map(([quote, sources]) => ({ quote, sources }));
}

async function readPriceCatalog(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  const state = await load(repository, ledgerId);
  // Read authored directives only. Valuation and forecast plugins add
  // in-memory synthetic commodities/prices that have no provider ticker.
  const snapshot = await parseLedgerFiles(state.files, state.entryPoint, {
    applyTsPlugins: false,
  });
  const processed = await parseLedgerFiles(state.files, state.entryPoint, {
    applyTsPlugins: true,
  });
  const quote =
    typeof state.settings.quote === "string"
      ? state.settings.quote
      : (snapshot.options.operating_currencies[0] ?? "USD");
  if (!SYMBOL.test(quote)) throw new Error("Invalid default quote currency");
  const symbols = new Set<string>();
  const securities = new Set<string>();
  const synthetics = new Set<string>();
  const specs = new Map<string, string>();
  const warnings: Array<{ commodity: string; message: string }> = [];
  let latestDate: string | undefined;
  for (const directive of processed.directives) {
    if (directive.meta?.generated_by !== "valuation") continue;
    if (directive.type === "commodity" || directive.type === "price")
      synthetics.add(directive.currency);
  }
  for (const directive of snapshot.directives) {
    if (directive.type === "commodity") {
      symbols.add(directive.currency);
      if (typeof directive.meta?.price === "string")
        specs.set(directive.currency, directive.meta.price);
      if (directive.meta?.synthetic === true)
        synthetics.add(directive.currency);
    } else if (directive.type === "open") {
      directive.currencies.forEach((currency) => symbols.add(currency));
      if (directive.booking)
        directive.currencies.forEach((currency) => securities.add(currency));
    } else if (directive.type === "transaction") {
      for (const posting of directive.postings) {
        if (posting.units) symbols.add(posting.units.currency);
        if (posting.cost?.currency) {
          symbols.add(posting.cost.currency);
          if (posting.units) securities.add(posting.units.currency);
        }
        if (posting.price) symbols.add(posting.price.currency);
      }
    } else if (directive.type === "balance" || directive.type === "price") {
      symbols.add(directive.amount.currency);
      if (directive.type === "price") {
        symbols.add(directive.currency);
        if (latestDate === undefined || directive.date > latestDate)
          latestDate = directive.date;
      }
    }
  }
  const instruments = new Map<string, Instrument>();
  synthetics.forEach((commodity) => symbols.add(commodity));
  for (const commodity of [...symbols].sort()) {
    if (!SYMBOL.test(commodity) || commodity === quote) continue;
    const synthetic = synthetics.has(commodity);
    let item = defaultInstrument(
      commodity,
      quote,
      securities.has(commodity),
      quote,
    );
    if (synthetic)
      item = {
        ...item,
        enabled: false,
        synthetic: true,
      };
    const spec = specs.get(commodity);
    if (spec !== undefined && spec.trim() === "") continue;
    if (spec) {
      try {
        const parsed = parsePriceSpec(spec, item.quote);
        if (parsed.length > 1) {
          for (const entry of parsed) {
            const next = {
              ...item,
              quote: entry.quote,
              source: entry.sources[0].source,
              ticker: entry.sources[0].ticker,
              file: priceFilePath(commodity, entry.quote, quote),
              ...(entry.sources.length > 1
                ? { fallbacks: entry.sources.slice(1) }
                : {}),
            };
            try {
              instruments.set(`${commodity}/${next.quote}`, instrument(next));
            } catch (error) {
              warnings.push({
                commodity,
                message:
                  error instanceof Error
                    ? error.message
                    : "Invalid beanprice price metadata",
              });
            }
          }
          continue;
        }
        const [entry] = parsed;
        if (entry) {
          item = {
            ...item,
            quote: entry.quote,
            source: entry.sources[0].source,
            ticker: entry.sources[0].ticker,
            ...(entry.sources.length > 1
              ? { fallbacks: entry.sources.slice(1) }
              : {}),
          };
          item.file = priceFilePath(commodity, item.quote, quote);
        }
      } catch (error) {
        warnings.push({
          commodity,
          message:
            error instanceof Error
              ? error.message
              : "Invalid beanprice price metadata",
        });
      }
    }
    if (state.settings.source && state.settings.source !== "auto" && !spec)
      item.source = source(state.settings.source);
    try {
      instruments.set(`${commodity}/${item.quote}`, instrument(item));
    } catch (error) {
      warnings.push({
        commodity,
        message:
          error instanceof Error
            ? error.message
            : "Invalid beanprice price metadata",
      });
    }
  }
  for (const commodity of new Set(
    state.saved?.instruments.map((item) => item.commodity) ?? [],
  )) {
    for (const [key, item] of instruments)
      if (item.commodity === commodity) instruments.delete(key);
  }
  for (const item of state.saved?.instruments ?? [])
    instruments.set(
      `${item.commodity}/${item.quote}`,
      synthetics.has(item.commodity) ? { ...item, synthetic: true } : item,
    );
  return {
    revision: state.revision,
    instruments: [...instruments.values()],
    sources: SOURCES,
    sourceDetails: SOURCE_DEFINITIONS.map((definition) => ({
      ...definition,
      apiKeyConfigured: sourceApiKeyConfigured(definition),
    })),
    warnings,
    schedule:
      state.saved?.schedule ??
      schedule({
        enabled: state.settings.daily !== false,
        time: state.settings.time ?? "18:00",
        timezone: state.settings.timezone ?? "Asia/Shanghai",
      }),
    latestDate,
  };
}

function readStoredPriceHistory(
  files: Record<string, string>,
  commodity: string,
  quote: string,
): StoredPrice[] {
  const prices: StoredPrice[] = [];
  for (const [file, source] of Object.entries(files)) {
    if (!file.endsWith(".bean")) continue;
    let active: StoredPrice | undefined;
    for (const line of source.split(/\r?\n/u)) {
      const directive =
        /^(\d{4}-\d{2}-\d{2})[ \t]+price[ \t]+(\S+)[ \t]+(\S+)[ \t]+([A-Z][A-Z0-9'._-]*)[ \t]*(?:;.*)?$/u.exec(
          line,
        );
      if (directive) {
        active = undefined;
        if (directive[2] === commodity && directive[4] === quote) {
          active = {
            date: directive[1],
            amount: directive[3],
            quote: directive[4],
            file,
          };
          prices.push(active);
        }
        continue;
      }
      if (!active) continue;
      const metadata =
        /^[ \t]+price-source:[ \t]*(?:"([^"]+)"|'([^']+)'|([^\s;]+))/u.exec(
          line,
        );
      if (metadata) {
        active.source = metadata[1] ?? metadata[2] ?? metadata[3];
        continue;
      }
      if (line.trim() && !/^[ \t]/u.test(line) && !line.startsWith(";"))
        active = undefined;
    }
  }
  return prices.sort(
    (first, second) =>
      second.date.localeCompare(first.date) ||
      first.file.localeCompare(second.file) ||
      second.amount.localeCompare(first.amount),
  );
}

async function readLocalPrices(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  return readPriceCatalog(repository, ledgerId);
}

async function saveLocalPriceConfig(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  value: unknown,
  revision: string,
) {
  const state = await load(repository, ledgerId);
  if (state.revision !== revision)
    throw new Error("Ledger changed since it was read; reload before saving");
  const config = parseConfig(value);
  await repository.writeFiles(ledgerId, [
    {
      path: CONFIG_FILE,
      content: `${JSON.stringify(config, null, 2)}\n`,
      expectedSha:
        state.files[CONFIG_FILE] === undefined
          ? undefined
          : hash(state.files[CONFIG_FILE]),
    },
  ]);
  return readLocalPrices(repository, ledgerId);
}

async function requestText(
  url: string,
  accept: string,
  headers: Record<string, string> = {},
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      headers: {
        accept,
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        ...headers,
      },
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(`Price source returned HTTP ${response.status}`);
    if (!response.body) throw new Error("Empty price response");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 2_000_000) {
        await reader.cancel();
        throw new Error("Price response exceeds 2 MB");
      }
      chunks.push(chunk.value);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.concat(chunks),
    );
  } finally {
    clearTimeout(timer);
  }
}

async function requestJson(
  url: string,
  headers: Record<string, string> = {},
): Promise<Mapping> {
  return record(
    JSON.parse(await requestText(url, "application/json", headers)),
  );
}

async function requestJsonValue(
  url: string,
  headers: Record<string, string> = {},
): Promise<unknown> {
  return JSON.parse(await requestText(url, "application/json", headers));
}

function coinCapUrl(path: string): string {
  const apiKey = process.env.COINCAP_API_KEY?.trim();
  if (!apiKey)
    throw new Error(
      "CoinCap requires the COINCAP_API_KEY environment variable",
    );
  const url = new URL(`https://rest.coincap.io/v3/${path}`);
  url.searchParams.set("apiKey", apiKey);
  return url.toString();
}

function coinCapTimestamp(value: unknown): number {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return NaN;
  return timestamp > 1e12 ? timestamp : timestamp * 1000;
}

function beanCountHeaders(): Record<string, string> {
  const cookie = process.env.BEANCOUNT_PRICES_COOKIE?.trim();
  return cookie ? { cookie } : {};
}

function csvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/u, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/u, ""));
    rows.push(row);
  }
  return rows;
}

function providerTicker(item: Instrument): string {
  return item.ticker.replace(/^\^/u, "").trim();
}

function isInverted(item: Instrument): boolean {
  return item.ticker.startsWith("^");
}

function invertedBaseCurrency(item: Instrument): string | undefined {
  if (!isInverted(item)) return undefined;
  return /^([A-Z]{3})[A-Z]{3}(?:=X)?$/u.exec(
    providerTicker(item).toUpperCase(),
  )?.[1];
}

function currencyInfo(value: unknown): { currency: string; factor: number } {
  const currency = String(value ?? "").trim();
  if (!currency) throw new Error("Provider returned no quote currency");
  const minor: Record<string, [string, number]> = {
    GBp: ["GBP", 0.01],
    GBX: ["GBP", 0.01],
    ZAc: ["ZAR", 0.01],
    ILA: ["ILS", 0.01],
    ILa: ["ILS", 0.01],
  };
  const normalized = minor[currency] ?? [currency.toUpperCase(), 1];
  return { currency: normalized[0], factor: normalized[1] };
}

function parsePositiveAmount(amount: unknown): BigNumber {
  if (
    (typeof amount !== "number" &&
      typeof amount !== "string" &&
      !(amount instanceof BigNumber)) ||
    String(amount).length > 120
  )
    throw new Error("Provider returned no price");
  const number =
    amount instanceof BigNumber
      ? amount
      : new BigNumber(String(amount).replace(/[$,%\s]/gu, ""));
  if (
    !number.isFinite() ||
    !number.isPositive() ||
    number.isZero() ||
    number.decimalPlaces()! > 30
  )
    throw new Error("Provider returned an invalid positive price");
  return number;
}

function formatAmount(number: BigNumber): string {
  const absolute = number.abs();
  const places = absolute.lt(0.0001) ? 12 : absolute.gte(1000) ? 6 : 8;
  return number.decimalPlaces(places).toFixed();
}

async function fiatRate(
  from: string,
  to: string,
  date?: string,
): Promise<{ rate: BigNumber; date: string }> {
  if (from === to)
    return {
      rate: new BigNumber(1),
      date: date ?? new Date().toISOString().slice(0, 10),
    };
  if (!FIAT.has(from) || !FIAT.has(to))
    throw new Error(
      `Cannot convert ${from} to ${to}; both must be fiat currencies`,
    );
  const target = date && validDate(date) ? date : undefined;
  const url = target
    ? `https://api.frankfurter.dev/v1/${target}?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`
    : `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const body = await requestJson(url);
  const raw = record(body.rates)[to];
  const rate = parsePositiveAmount(raw);
  const rateDate = String(body.date ?? target ?? "");
  if (!validDate(rateDate))
    throw new Error("Exchange rate source returned an invalid date");
  return { rate, date: rateDate };
}

async function checkedQuote(
  item: Instrument,
  date: string,
  amount: unknown,
  currency: unknown,
  options: {
    allowConversion?: boolean;
    providerSource?: PriceSource;
    providerTicker?: string;
  } = {},
): Promise<Quote> {
  if (!validDate(date))
    throw new Error("Provider returned an invalid price date");
  const normalized = currencyInfo(currency);
  let number = parsePositiveAmount(amount).times(normalized.factor);
  const inverted = isInverted(item);
  let sourceCurrency = normalized.currency;
  if (inverted) {
    number = new BigNumber(1).dividedBy(number);
    sourceCurrency = invertedBaseCurrency(item) ?? normalized.currency;
  }
  let conversion: Conversion | undefined;
  if (sourceCurrency !== item.quote) {
    if (!options.allowConversion) {
      throw new Error(
        `Provider quotes in ${sourceCurrency}, requested ${item.quote}; select the provider currency or enable cross-currency conversion`,
      );
    }
    const converted = await fiatRate(sourceCurrency, item.quote, date);
    number = number.times(converted.rate);
    conversion = {
      from: sourceCurrency,
      to: item.quote,
      rate: formatAmount(converted.rate),
      date: converted.date,
      source: "exchangerate",
    };
  }
  return {
    ...item,
    date,
    amount: formatAmount(number),
    providerCurrency: normalized.currency,
    providerTicker: options.providerTicker ?? providerTicker(item),
    providerSource: options.providerSource ?? item.source,
    ...(conversion ? { conversion } : {}),
    ...(inverted ? { inverted: true } : {}),
  };
}

type HistoricalSeries = SourcePrice[];

function timestampDate(timestamp: number, offsetSeconds = 0): string {
  return new Date((timestamp + offsetSeconds) * 1000)
    .toISOString()
    .slice(0, 10);
}

function selectOnOrBefore(
  prices: HistoricalSeries,
  date: string,
): SourcePrice | undefined {
  return prices
    .filter((price) => validDate(price.date) && price.date <= date)
    .sort((first, second) => second.date.localeCompare(first.date))[0];
}

function yahooTicker(item: Instrument): string {
  const ticker = providerTicker(item);
  return !item.security && FIAT.has(item.commodity) && ticker === item.commodity
    ? `${item.commodity}${item.quote}=X`
    : ticker;
}

function isPlainUsTicker(ticker: string): boolean {
  return /^[A-Z][A-Z0-9.]{0,7}$/u.test(ticker);
}

async function fetchYahooSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const ticker = yahooTicker(item);
  const period1 = Math.floor(Date.parse(`${begin}T00:00:00Z`) / 1000);
  const period2 = Math.floor(
    (Date.parse(`${end}T00:00:00Z`) + 86_400_000) / 1000,
  );
  const body = await requestJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${period1}&period2=${period2}&interval=1d&crumb=x&lang=en-US&corsDomain=finance.yahoo.com&.tsrc=finance`,
    {
      accept: "application/json,text/plain,*/*",
      referer: "https://finance.yahoo.com/",
      origin: "https://finance.yahoo.com",
    },
  );
  const chart = record(body.chart);
  if (chart.error) {
    const error = record(chart.error);
    throw new Error(
      `Yahoo returned ${String(error.code ?? "an error")}: ${String(error.description ?? error.code ?? "no details")}`,
    );
  }
  const results = chart.result;
  if (!Array.isArray(results) || !results.length)
    throw new Error(
      "Yahoo returned no quote; verify the ticker and source availability",
    );
  const result = record(results[0]);
  const meta = record(result.meta);
  const currency = meta.currency;
  const offset = typeof meta.gmtoffset === "number" ? meta.gmtoffset : 0;
  const timestamps = result.timestamp;
  const quotes = record(result.indicators).quote;
  if (!Array.isArray(timestamps) || !Array.isArray(quotes))
    throw new Error("Yahoo returned no closing prices");
  const closes = record(quotes[0]).close;
  if (!Array.isArray(closes))
    throw new Error("Yahoo returned no closing prices");
  const series: HistoricalSeries = [];
  for (let index = 0; index < closes.length; index += 1) {
    if (closes[index] === null || closes[index] === undefined) continue;
    const timestamp = timestamps[index];
    if (typeof timestamp !== "number" || !Number.isFinite(timestamp))
      throw new Error("Yahoo returned an invalid market timestamp");
    series.push({
      date: timestampDate(timestamp, offset),
      time: new Date(timestamp * 1000).toISOString(),
      amount: parsePositiveAmount(closes[index]),
      currency: String(currency ?? ""),
      providerSource: "yahoo",
      providerTicker: ticker,
    });
  }
  if (series.length === 0 && typeof meta.regularMarketPrice === "number") {
    const timestamp =
      typeof meta.regularMarketTime === "number"
        ? meta.regularMarketTime
        : Date.now() / 1000;
    series.push({
      date: timestampDate(timestamp, offset),
      time: new Date(timestamp * 1000).toISOString(),
      amount: parsePositiveAmount(meta.regularMarketPrice),
      currency: String(currency ?? ""),
      providerSource: "yahoo",
      providerTicker: ticker,
    });
  }
  return series.sort((first, second) => first.date.localeCompare(second.date));
}

async function fetchYahoo(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  const ticker = yahooTicker(item);
  let series: HistoricalSeries;
  try {
    const end = date ?? new Date().toISOString().slice(0, 10);
    const begin = new Date(Date.parse(`${end}T00:00:00Z`) - 7 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    series = await fetchYahooSeries(item, begin, end);
  } catch (error) {
    if (isPlainUsTicker(ticker)) return fetchNasdaq(item, date);
    throw error;
  }
  const selected = date ? selectOnOrBefore(series, date) : series.at(-1);
  if (!selected)
    throw new Error(
      date
        ? `Yahoo returned no price on or before ${date}`
        : "Yahoo returned no closing price",
    );
  return selected;
}

async function fetchEastMoney(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  const ticker = providerTicker(item);
  if (!/^\d{6}$/u.test(ticker))
    throw new Error("EastMoney requires a six-digit fund code");
  const pageSize = date ? 100 : 1;
  for (let page = 1; page <= 10; page += 1) {
    const body = record(
      JSON.parse(
        await requestText(
          `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${ticker}&pageIndex=${page}&pageSize=${pageSize}`,
          "application/json",
          {
            referer: "https://fundf10.eastmoney.com/",
            origin: "https://fundf10.eastmoney.com",
          },
        ),
      ),
    );
    const entries = record(body.Data).LSJZList;
    if (Number(body.ErrCode) !== 0 || !Array.isArray(entries))
      throw new Error("EastMoney returned no fund NAV");
    const navs = entries
      .map((entry) => record(entry))
      .filter((nav) => nav.DWJZ !== undefined && nav.FSRQ !== undefined)
      .map((nav) => ({
        date: String(nav.FSRQ),
        amount: parsePositiveAmount(nav.DWJZ),
        currency: "CNY",
        providerSource: "eastmoneyfund" as const,
        providerTicker: ticker,
      }));
    const selected = date
      ? selectOnOrBefore(navs, date)
      : navs.sort((first, second) => second.date.localeCompare(first.date))[0];
    if (selected) return selected;
    if (!date || entries.length < pageSize) break;
  }
  if (!date) throw new Error("EastMoney returned no fund NAV");
  throw new Error(`EastMoney returned no NAV on or before ${date}`);
}

async function fetchFrankfurter(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  if (!FIAT.has(item.commodity) || !FIAT.has(item.quote))
    throw new Error("Exchange-rate source supports fiat currencies only");
  const url = date
    ? `https://api.frankfurter.dev/v1/${date}?base=${encodeURIComponent(item.commodity)}&symbols=${encodeURIComponent(item.quote)}`
    : `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(item.commodity)}&to=${encodeURIComponent(item.quote)}`;
  const body = await requestJson(url);
  return {
    date: String(body.date),
    amount: parsePositiveAmount(record(body.rates)[item.quote]),
    currency: item.quote,
    providerSource: "exchangerate",
    providerTicker: item.commodity,
  };
}

async function fetchFrankfurterSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  if (!FIAT.has(item.commodity) || !FIAT.has(item.quote))
    throw new Error("Exchange-rate source supports fiat currencies only");
  const body = await requestJson(
    `https://api.frankfurter.dev/v1/${begin}..${end}?base=${encodeURIComponent(item.commodity)}&symbols=${encodeURIComponent(item.quote)}`,
  );
  return Object.entries(record(body.rates)).map(([date, rates]) => ({
    date,
    amount: parsePositiveAmount(record(rates)[item.quote]),
    currency: item.quote,
    providerSource: "exchangerate" as const,
    providerTicker: item.commodity,
  }));
}

async function ecbRate(
  currency: string,
  date?: string,
): Promise<{ rate?: BigNumber; date?: string }> {
  if (currency === "EUR")
    return {
      rate: new BigNumber(1),
      date: date ?? new Date().toISOString().slice(0, 10),
    };
  if (!FIAT.has(currency))
    throw new Error(`ECB does not publish a rate for ${currency}`);
  const params = new URLSearchParams({
    format: "csvdata",
    lastNObservations: "1",
  });
  if (date) params.set("endPeriod", date);
  const text = await requestText(
    `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A?${params}`,
    "text/csv",
  );
  const rows = csvRows(text);
  if (rows.length < 2) return {};
  const header = rows[0].map((value) => value.trim());
  const row = rows[rows.length - 1];
  const value = row[header.indexOf("OBS_VALUE")];
  const period = row[header.indexOf("TIME_PERIOD")];
  if (!value || !period) return {};
  return { rate: parsePositiveAmount(value), date: period };
}

async function fetchEcb(item: Instrument, date?: string): Promise<SourcePrice> {
  const ticker = providerTicker(item);
  const [base, quote] = (
    ticker.includes("-") ? ticker.split("-", 2) : [item.commodity, item.quote]
  ).map((currency) => currency.toUpperCase());
  if (!base || !quote || base === quote)
    throw new Error("ECB source requires two different currencies");
  const baseRate = await ecbRate(base, date);
  const quoteRate = await ecbRate(quote, date);
  if (!baseRate.rate || !quoteRate.rate)
    throw new Error("ECB returned no exchange rate");
  if (base === "EUR") baseRate.date = quoteRate.date;
  if (quote === "EUR") quoteRate.date = baseRate.date;
  if (baseRate.date !== quoteRate.date)
    throw new Error("ECB returned rates for different dates");
  return {
    date: baseRate.date!,
    amount: quoteRate.rate.dividedBy(baseRate.rate),
    currency: quote,
    providerSource: "ecbrates",
    providerTicker: `${base}-${quote}`,
  };
}

async function ecbSeries(
  currency: string,
  begin: string,
  end: string,
): Promise<Map<string, BigNumber>> {
  if (currency === "EUR") return new Map();
  if (!FIAT.has(currency))
    throw new Error(`ECB does not publish a rate for ${currency}`);
  const params = new URLSearchParams({
    format: "csvdata",
    startPeriod: begin,
    endPeriod: end,
  });
  const text = await requestText(
    `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A?${params}`,
    "text/csv",
  );
  const rows = csvRows(text);
  if (rows.length < 2) return new Map();
  const header = rows[0].map((value) => value.trim());
  const valueIndex = header.indexOf("OBS_VALUE");
  const periodIndex = header.indexOf("TIME_PERIOD");
  return new Map(
    rows.slice(1).flatMap((row): Array<[string, BigNumber]> => {
      const value = row[valueIndex];
      const period = row[periodIndex];
      return value && period
        ? [[period, parsePositiveAmount(value)] as [string, BigNumber]]
        : [];
    }),
  );
}

async function fetchEcbSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const ticker = providerTicker(item);
  const [base, quote] = (
    ticker.includes("-") ? ticker.split("-", 2) : [item.commodity, item.quote]
  ).map((currency) => currency.toUpperCase());
  if (!base || !quote || base === quote)
    throw new Error("ECB source requires two different currencies");
  const [baseRates, quoteRates] = await Promise.all([
    ecbSeries(base, begin, end),
    ecbSeries(quote, begin, end),
  ]);
  const dates =
    base === "EUR"
      ? [...quoteRates.keys()]
      : quote === "EUR"
        ? [...baseRates.keys()]
        : [...baseRates.keys()].filter((date) => quoteRates.has(date));
  return dates.sort().flatMap((date): SourcePrice[] => {
    const baseRate = base === "EUR" ? new BigNumber(1) : baseRates.get(date);
    const quoteRate = quote === "EUR" ? new BigNumber(1) : quoteRates.get(date);
    return baseRate && quoteRate
      ? [
          {
            date,
            amount: quoteRate.dividedBy(baseRate),
            currency: quote,
            providerSource: "ecbrates",
            providerTicker: `${base}-${quote}`,
          },
        ]
      : [];
  });
}

async function fetchCoinbase(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  const ticker = providerTicker(item).toUpperCase();
  const pair = ticker.includes("-") ? ticker : `${ticker}-${item.quote}`;
  const [base] = pair.split("-", 1);
  const body = await requestJson(
    `https://api.coinbase.com/v2/prices/${encodeURIComponent(pair)}/spot${date ? `?date=${date}` : ""}`,
  );
  const data = record(body.data);
  if (String(data.base).toUpperCase() !== base)
    throw new Error("Coinbase returned an unexpected asset");
  return {
    date: date ?? new Date().toISOString().slice(0, 10),
    amount: parsePositiveAmount(data.amount),
    currency: String(data.currency),
    providerSource: "coinbase",
    providerTicker: pair,
  };
}

async function coinCapId(ticker: string): Promise<string> {
  const find = (assets: unknown[]) =>
    assets
      .map((asset) => record(asset))
      .find(
        (asset) => String(asset.symbol).toUpperCase() === ticker.toUpperCase(),
      );
  let found: Mapping | undefined;
  try {
    const search = await requestJson(
      coinCapUrl(`assets?search=${encodeURIComponent(ticker)}&limit=50`),
    );
    if (Array.isArray(search.data)) {
      found = find(search.data);
      if (!found)
        found = search.data
          .map((asset) => record(asset))
          .find(
            (asset) => String(asset.id).toLowerCase() === ticker.toLowerCase(),
          );
    }
  } catch {
    // Fall back to the full asset list on deployments without search support.
  }
  if (!found) {
    const list = await requestJson(coinCapUrl("assets?limit=2000"));
    if (!Array.isArray(list.data))
      throw new Error("CoinCap returned an invalid asset list");
    found = find(list.data);
  }
  if (!found) throw new Error(`CoinCap could not resolve ${ticker}`);
  return String(found.id);
}

async function fetchCoinCap(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  const id = await coinCapId(providerTicker(item));
  const priceDate = (row: Mapping, timestamp: number): string => {
    const iso = Date.parse(String(row.date ?? ""));
    const millis = Number.isFinite(iso) ? iso : coinCapTimestamp(timestamp);
    return Number.isFinite(millis)
      ? new Date(millis).toISOString().slice(0, 10)
      : "";
  };
  if (date) {
    const begin = new Date(Date.parse(`${date}T00:00:00Z`) - 7 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000)
      .toISOString()
      .slice(0, 10);
    const body = await requestJson(
      coinCapUrl(
        `assets/${encodeURIComponent(id)}/history?interval=d1&start=${Date.parse(`${begin}T00:00:00Z`)}&end=${Date.parse(`${end}T00:00:00Z`)}`,
      ),
    );
    const rows = Array.isArray(body.data) ? body.data : [];
    const prices = rows
      .map((raw) => {
        const row = record(raw);
        const timestamp = Number(row.time);
        return {
          date: priceDate(row, timestamp),
          amount: parsePositiveAmount(row.priceUsd),
          currency: "USD",
          time: Number.isFinite(coinCapTimestamp(timestamp))
            ? new Date(coinCapTimestamp(timestamp)).toISOString()
            : undefined,
          providerSource: "coincap" as const,
          providerTicker: id,
        };
      })
      .filter((price) => validDate(price.date));
    const selected = selectOnOrBefore(prices, date);
    if (!selected)
      throw new Error(`CoinCap returned no price on or before ${date}`);
    return selected;
  }
  const body = await requestJson(
    coinCapUrl(`assets/${encodeURIComponent(id)}`),
  );
  const data = record(body.data);
  const timestamp = coinCapTimestamp(body.timestamp);
  return {
    date: Number.isFinite(timestamp)
      ? new Date(timestamp).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    amount: parsePositiveAmount(data.priceUsd),
    currency: "USD",
    providerSource: "coincap",
    providerTicker: id,
  };
}

async function fetchAlphaVantage(item: Instrument): Promise<SourcePrice> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY?.trim();
  if (!apiKey)
    throw new Error(
      "Alpha Vantage requires the ALPHAVANTAGE_API_KEY environment variable",
    );
  const ticker = providerTicker(item);
  const priceSpec = /^price:([^:]+):([A-Z]{3})$/iu.exec(ticker);
  const fxSpec = /^fx:([A-Z]{3}):([A-Z]{3})$/iu.exec(ticker);
  let params: URLSearchParams;
  let currency: string;
  if (priceSpec) {
    params = new URLSearchParams({
      function: "GLOBAL_QUOTE",
      symbol: priceSpec[1],
      apikey: apiKey,
    });
    currency = priceSpec[2].toUpperCase();
  } else if (fxSpec) {
    params = new URLSearchParams({
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: fxSpec[1].toUpperCase(),
      to_currency: fxSpec[2].toUpperCase(),
      apikey: apiKey,
    });
    currency = fxSpec[2].toUpperCase();
  } else {
    throw new Error(
      "Alpha Vantage ticker must be price:SYMBOL:CCY or fx:FROM:TO",
    );
  }
  const body = await requestJson(`https://www.alphavantage.co/query?${params}`);
  if (body["Note"] || body["Information"])
    throw new Error("Alpha Vantage rate limit reached; retry later");
  if (body["Error Message"]) throw new Error(String(body["Error Message"]));
  if (priceSpec) {
    const quote = record(body["Global Quote"]);
    return {
      date: String(quote["07. latest trading day"]),
      amount: parsePositiveAmount(quote["05. price"]),
      currency,
      providerSource: "alphavantage",
      providerTicker: ticker,
    };
  }
  const fx = record(body["Realtime Currency Exchange Rate"]);
  return {
    date: String(fx["6. Last Refreshed"]).slice(0, 10),
    amount: parsePositiveAmount(fx["5. Exchange Rate"]),
    currency,
    providerSource: "alphavantage",
    providerTicker: ticker,
  };
}

function nasdaqDate(value: unknown): string {
  const text = String(value ?? "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/u.exec(text);
  if (iso && validDate(`${iso[1]}-${iso[2]}-${iso[3]}`))
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:$|[,\s])/u.exec(text);
  if (slash) {
    const date = `${slash[3]}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`;
    if (validDate(date)) return date;
  }
  const named =
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),\s*(\d{4})(?:$|[,\s])/iu.exec(
      text,
    );
  if (named) {
    const month = String(
      [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ].indexOf(named[1].slice(0, 3).toLowerCase()) + 1,
    ).padStart(2, "0");
    const date = `${named[3]}-${month}-${named[2].padStart(2, "0")}`;
    if (validDate(date)) return date;
  }
  return text;
}

async function fetchNasdaqSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const ticker = providerTicker(item).toUpperCase();
  if (!isPlainUsTicker(ticker) || ticker.includes("="))
    throw new Error("Nasdaq source supports US tickers only");
  let lastError: unknown;
  for (const assetclass of ["stocks", "etf"]) {
    let body: Mapping;
    try {
      body = await requestJson(
        `https://api.nasdaq.com/api/quote/${encodeURIComponent(ticker)}/historical?assetclass=${assetclass}&fromdate=${begin}&todate=${end}&limit=1000`,
        {
          accept: "application/json,text/plain,*/*",
          referer: "https://www.nasdaq.com/",
        },
      );
    } catch (error) {
      lastError = error;
      continue;
    }
    const data = maybeRecord(body.data);
    if (!data) continue;
    const table = maybeRecord(data.tradesTable) ?? {};
    const rows = Array.isArray(table.rows) ? table.rows : [];
    const prices = rows.flatMap((raw): SourcePrice[] => {
      const row = record(raw);
      const date = nasdaqDate(row.date);
      return validDate(date) && date >= begin && date <= end
        ? [
            {
              date,
              amount: parsePositiveAmount(row.close),
              currency: "USD",
              providerSource: "nasdaq",
              providerTicker: ticker,
            },
          ]
        : [];
    });
    if (prices.length)
      return prices.sort((first, second) =>
        first.date.localeCompare(second.date),
      );
  }
  if (lastError instanceof Error) throw lastError;
  return [];
}

async function fetchNasdaq(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  const ticker = providerTicker(item).toUpperCase();
  if (!isPlainUsTicker(ticker) || ticker.includes("="))
    throw new Error("Nasdaq source supports US tickers only");
  let lastError: unknown;
  for (const assetclass of ["stocks", "etf"]) {
    const historicalFrom = date
      ? new Date(Date.parse(`${date}T00:00:00Z`) - 7 * 86_400_000)
          .toISOString()
          .slice(0, 10)
      : "";
    let body: Mapping;
    try {
      body = await requestJson(
        date
          ? `https://api.nasdaq.com/api/quote/${encodeURIComponent(ticker)}/historical?assetclass=${assetclass}&fromdate=${historicalFrom}&todate=${date}&limit=20`
          : `https://api.nasdaq.com/api/quote/${encodeURIComponent(ticker)}/info?assetclass=${assetclass}`,
        {
          accept: "application/json,text/plain,*/*",
          referer: `https://www.nasdaq.com/market-activity/stocks/${ticker.toLowerCase()}`,
        },
      );
    } catch (error) {
      lastError = error;
      continue;
    }
    const data = maybeRecord(body.data);
    if (!data) continue;
    if (date) {
      const table = data.tradesTable;
      if (!table) continue;
      const rows = maybeRecord(table)?.rows;
      if (!Array.isArray(rows)) continue;
      const prices = rows.map((raw) => {
        const row = record(raw);
        return {
          date: nasdaqDate(row.date),
          amount: parsePositiveAmount(row.close),
          currency: "USD",
          providerSource: "nasdaq" as const,
          providerTicker: ticker,
        };
      });
      const selected = selectOnOrBefore(prices, date);
      if (selected) return selected;
      continue;
    }
    const primary = data.primaryData;
    if (!primary) continue;
    const recordData = maybeRecord(primary);
    if (!recordData) continue;
    if (!recordData.lastSalePrice) continue;
    return {
      date: nasdaqDate(recordData.lastTradeTimestamp),
      amount: parsePositiveAmount(recordData.lastSalePrice),
      currency:
        typeof recordData.currency === "string" && recordData.currency
          ? recordData.currency
          : "USD",
      providerSource: "nasdaq",
      providerTicker: ticker,
    };
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error(`Nasdaq returned no price for ${ticker}`);
}

async function fetchBeancount(
  item: Instrument,
  date?: string,
): Promise<SourcePrice> {
  const alias = providerTicker(item);
  if (!/^[A-Za-z0-9_-]{1,100}$/u.test(alias))
    throw new Error("Beancount source requires a feed alias, e.g. BTC-USD");
  const text = await requestText(
    `https://beancount.io/prices/${alias}`,
    "text/plain",
    beanCountHeaders(),
  );
  const validation = validateManagedPriceText(text);
  if (!validation.ok)
    throw new Error(`Invalid price feed: ${validation.reason}`);
  if (
    validation.feed.commodity !== item.commodity ||
    validation.feed.quote !== item.quote
  )
    throw new Error("Feed commodity/currency does not match the selected pair");
  const rows = text.split(/\r\n|\r|\n/u);
  const prices = validation.feed.prices
    .flatMap((entry): SourcePrice[] => {
      const line = rows[entry.line - 1] ?? "";
      const match =
        /^(\d{4}-\d{2}-\d{2})[ \t]+price[ \t]+(\S+)[ \t]+([^ \t;]+)[ \t]+(\S+)/u.exec(
          line.trim(),
        );
      if (!match) return [];
      return [
        {
          date: match[1],
          amount: parsePositiveAmount(match[3]),
          currency: match[4],
          providerSource: "beancount",
          providerTicker: alias,
        },
      ];
    })
    .filter((entry) => entry !== undefined);
  const selected = date
    ? selectOnOrBefore(prices, date)
    : prices.sort((first, second) => second.date.localeCompare(first.date))[0];
  if (!selected)
    throw new Error(
      date
        ? `Feed contains no price on or before ${date}`
        : "Feed contains no price",
    );
  return selected;
}

async function tspPrices(item: Instrument): Promise<HistoricalSeries> {
  const funds = [
    "LInco",
    "L2030",
    "L2035",
    "L2040",
    "L2045",
    "L2050",
    "L2055",
    "L2060",
    "L2065",
    "L2070",
    "L2075",
    "GFund",
    "FFund",
    "CFund",
    "SFund",
    "IFund",
  ];
  const aliases: Record<string, string> = {
    C: "CFund",
    F: "FFund",
    G: "GFund",
    I: "IFund",
    S: "SFund",
    "L Income": "LInco",
    "L-Income": "LInco",
  };
  const ticker = providerTicker(item);
  const index = funds.indexOf(aliases[ticker] ?? ticker);
  if (index < 0)
    throw new Error(`Invalid TSP fund name; use ${funds.join(", ")}`);
  const text = await requestText(
    "https://www.tsp.gov/data/fund-price-history.csv",
    "text/csv",
  );
  const rows = csvRows(text);
  if (!rows.length) throw new Error("TSP returned no fund prices");
  const header = rows[0].map((value) => value.trim());
  const dateIndex = header.indexOf("Date");
  if (dateIndex < 0) throw new Error("TSP returned an invalid price table");
  const names = [
    "L Income",
    "L 2030",
    "L 2035",
    "L 2040",
    "L 2045",
    "L 2050",
    "L 2055",
    "L 2060",
    "L 2065",
    "L 2070",
    "L 2075",
    "G Fund",
    "F Fund",
    "C Fund",
    "S Fund",
    "I Fund",
  ];
  const column = header.indexOf(names[index]);
  if (column < 0)
    throw new Error(`TSP price table is missing the ${names[index]} column`);
  const prices = rows.slice(1).flatMap((row): SourcePrice[] => {
    const date = String(row[dateIndex] ?? "").trim();
    const value = String(row[column] ?? "").trim();
    return validDate(date) && value
      ? [
          {
            date,
            amount: parsePositiveAmount(value),
            currency: "USD",
            providerSource: "tsp",
            providerTicker: providerTicker(item),
          },
        ]
      : [];
  });
  return prices;
}

async function fetchTsp(item: Instrument, date?: string): Promise<SourcePrice> {
  const prices = await tspPrices(item);
  const selected = date
    ? selectOnOrBefore(prices, date)
    : prices.sort((first, second) => second.date.localeCompare(first.date))[0];
  if (!selected) throw new Error("TSP returned no price");
  return selected;
}

async function fetchEastMoneySeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const ticker = providerTicker(item);
  if (!/^\d{6}$/u.test(ticker))
    throw new Error("EastMoney requires a six-digit fund code");
  const prices: HistoricalSeries = [];
  for (let page = 1; page <= 20; page += 1) {
    const body = record(
      JSON.parse(
        await requestText(
          `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${ticker}&pageIndex=${page}&pageSize=100`,
          "application/json",
          {
            referer: "https://fundf10.eastmoney.com/",
            origin: "https://fundf10.eastmoney.com",
          },
        ),
      ),
    );
    const entries = record(body.Data).LSJZList;
    if (Number(body.ErrCode) !== 0 || !Array.isArray(entries))
      throw new Error("EastMoney returned no fund NAV");
    const navs = entries
      .map((entry) => record(entry))
      .filter((nav) => nav.DWJZ !== undefined && nav.FSRQ !== undefined)
      .map((nav) => ({
        date: String(nav.FSRQ),
        amount: parsePositiveAmount(nav.DWJZ),
        currency: "CNY",
        providerSource: "eastmoneyfund" as const,
        providerTicker: ticker,
      }));
    prices.push(
      ...navs.filter((price) => price.date >= begin && price.date <= end),
    );
    const oldest = navs.at(-1)?.date;
    if (!oldest || oldest < begin || entries.length < 100) break;
  }
  return prices.sort((first, second) => first.date.localeCompare(second.date));
}

async function fetchCoinbaseSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const ticker = providerTicker(item).toUpperCase();
  const pair = ticker.includes("-") ? ticker : `${ticker}-${item.quote}`;
  const pairCurrency = pair.split("-").at(-1) ?? item.quote;
  const body = await requestJsonValue(
    `https://api.exchange.coinbase.com/products/${encodeURIComponent(pair)}/candles?start=${encodeURIComponent(`${begin}T00:00:00Z`)}&end=${encodeURIComponent(`${end}T23:59:59Z`)}&granularity=86400`,
    {
      accept: "application/json,text/plain,*/*",
      referer: "https://www.coinbase.com/",
    },
  );
  if (!Array.isArray(body))
    throw new Error("Coinbase returned an invalid candle series");
  return (body as unknown[])
    .flatMap((raw): SourcePrice[] => {
      if (!Array.isArray(raw) || raw.length < 5) return [];
      const timestamp = Number(raw[0]);
      return [
        {
          date: new Date(timestamp * 1000).toISOString().slice(0, 10),
          amount: parsePositiveAmount(raw[4]),
          currency: pairCurrency,
          providerSource: "coinbase",
          providerTicker: pair,
        },
      ];
    })
    .sort((first, second) => first.date.localeCompare(second.date));
}

async function fetchCoinCapSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const id = await coinCapId(providerTicker(item));
  const body = await requestJson(
    coinCapUrl(
      `assets/${encodeURIComponent(id)}/history?interval=d1&start=${Date.parse(`${begin}T00:00:00Z`)}&end=${Date.parse(`${end}T23:59:59Z`)}`,
    ),
  );
  const rows = Array.isArray(body.data) ? body.data : [];
  return rows
    .map((raw) => {
      const row = record(raw);
      const timestamp = Number(row.time);
      const iso = Date.parse(String(row.date ?? ""));
      const millis = Number.isFinite(iso) ? iso : coinCapTimestamp(timestamp);
      return {
        date: Number.isFinite(millis)
          ? new Date(millis).toISOString().slice(0, 10)
          : "",
        amount: parsePositiveAmount(row.priceUsd),
        currency: "USD",
        time: Number.isFinite(coinCapTimestamp(timestamp))
          ? new Date(coinCapTimestamp(timestamp)).toISOString()
          : undefined,
        providerSource: "coincap" as const,
        providerTicker: id,
      };
    })
    .filter((price) => validDate(price.date))
    .sort((first, second) => first.date.localeCompare(second.date));
}

async function fetchTspSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<HistoricalSeries> {
  const prices = await tspPrices(item);
  return prices
    .filter((price) => price.date >= begin && price.date <= end)
    .sort((first, second) => first.date.localeCompare(second.date));
}

async function fetchFromSource(
  item: Instrument,
  date?: string,
): Promise<Quote> {
  const definition = sourceDefinition(item.source);
  if (definition.apiKeyEnv && !process.env[definition.apiKeyEnv]?.trim())
    throw new Error(
      `${definition.name} requires the ${definition.apiKeyEnv} environment variable`,
    );
  if (!definition.supports.latest && !date)
    throw new Error(`${definition.name} does not support latest prices`);
  if (!definition.supports.historical && date)
    throw new Error(`${definition.name} does not support historical prices`);
  let price: SourcePrice;
  switch (item.source) {
    case "eastmoneyfund":
      price = await fetchEastMoney(item, date);
      break;
    case "exchangerate":
      price = await fetchFrankfurter(item, date);
      break;
    case "ecbrates":
      price = await fetchEcb(item, date);
      break;
    case "coinbase":
      price = await fetchCoinbase(item, date);
      break;
    case "coincap":
      price = await fetchCoinCap(item, date);
      break;
    case "alphavantage":
      price = await fetchAlphaVantage(item);
      break;
    case "nasdaq":
      price = await fetchNasdaq(item, date);
      break;
    case "beancount":
      price = await fetchBeancount(item, date);
      break;
    case "tsp":
      price = await fetchTsp(item, date);
      break;
    case "coinmarketcap":
    case "oanda":
    case "quandl":
      throw new Error(
        `${definition.name} is registered but not implemented; use yahoo, nasdaq, alphavantage or exchangerate`,
      );
    case "yahoo":
      try {
        price = await fetchYahoo(item, date);
      } catch (error) {
        if (!FIAT.has(item.commodity) || !FIAT.has(item.quote)) throw error;
        const direct = await fetchFrankfurter(item, date);
        price = isInverted(item)
          ? {
              ...direct,
              amount: new BigNumber(1).dividedBy(direct.amount),
              currency: item.quote,
            }
          : direct;
      }
      break;
    default:
      price = await fetchYahoo(item, date);
      break;
  }
  return checkedQuote(item, price.date, price.amount, price.currency, {
    allowConversion:
      item.source === "yahoo" ||
      item.source === "nasdaq" ||
      item.source === "alphavantage" ||
      item.source === "coincap",
    providerSource: price.providerSource ?? item.source,
    providerTicker: price.providerTicker ?? providerTicker(item),
  });
}

async function fetchPrice(item: Instrument, date?: string): Promise<Quote> {
  const candidates: Instrument[] = [
    { ...item, fallbacks: undefined },
    ...(item.fallbacks ?? []).map((fallback) => ({
      ...item,
      source: fallback.source,
      ticker: fallback.ticker,
      fallbacks: undefined,
    })),
  ];
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await fetchFromSource(candidate, date);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to fetch price");
}

async function fetchPriceSeriesFromSource(
  item: Instrument,
  begin: string,
  end: string,
): Promise<Quote[]> {
  if (!validDate(begin) || !validDate(end) || begin > end)
    throw new Error("Price series requires a valid date range");
  const definition = sourceDefinition(item.source);
  if (!definition.supports.series)
    throw new Error(`${definition.name} does not support price series`);
  if (definition.apiKeyEnv && !process.env[definition.apiKeyEnv]?.trim())
    throw new Error(
      `${definition.name} requires the ${definition.apiKeyEnv} environment variable`,
    );
  let prices: SourcePrice[] = [];
  if (item.source === "exchangerate") {
    prices = await fetchFrankfurterSeries(item, begin, end);
  } else if (item.source === "ecbrates") {
    prices = await fetchEcbSeries(item, begin, end);
  } else if (item.source === "eastmoneyfund") {
    prices = await fetchEastMoneySeries(item, begin, end);
  } else if (item.source === "coinbase") {
    prices = await fetchCoinbaseSeries(item, begin, end);
  } else if (item.source === "coincap") {
    prices = await fetchCoinCapSeries(item, begin, end);
  } else if (item.source === "tsp") {
    prices = await fetchTspSeries(item, begin, end);
  } else if (item.source === "yahoo") {
    prices = await fetchYahooSeries(item, begin, end);
  } else if (item.source === "nasdaq") {
    prices = await fetchNasdaqSeries(item, begin, end);
  } else if (item.source === "beancount") {
    const alias = providerTicker(item);
    if (!/^[A-Za-z0-9_-]{1,100}$/u.test(alias))
      throw new Error("Beancount source requires a feed alias, e.g. BTC-USD");
    const text = await requestText(
      `https://beancount.io/prices/${alias}`,
      "text/plain",
      beanCountHeaders(),
    );
    const validation = validateManagedPriceText(text);
    if (!validation.ok)
      throw new Error(`Invalid price feed: ${validation.reason}`);
    const rows = text.split(/\r\n|\r|\n/u);
    prices = validation.feed.prices
      .flatMap((entry): SourcePrice[] => {
        const match =
          /^(\d{4}-\d{2}-\d{2})[ \t]+price[ \t]+(\S+)[ \t]+([^ \t;]+)[ \t]+(\S+)/u.exec(
            (rows[entry.line - 1] ?? "").trim(),
          );
        return match
          ? [
              {
                date: match[1],
                amount: parsePositiveAmount(match[3]),
                currency: match[4],
                providerSource: "beancount",
                providerTicker: providerTicker(item),
              },
            ]
          : [];
      })
      .filter((entry) => entry !== undefined);
  } else {
    const dates: string[] = [];
    for (
      let time = Date.parse(`${begin}T00:00:00Z`);
      time <= Date.parse(`${end}T00:00:00Z`);
      time += 86_400_000
    )
      dates.push(new Date(time).toISOString().slice(0, 10));
    const quotes: Quote[] = [];
    for (const date of dates) {
      try {
        quotes.push(await fetchPrice(item, date));
      } catch {
        // Sparse series are normal for market prices.
      }
    }
    return quotes;
  }
  const quotes = await Promise.all(
    prices
      .filter((price) => price.date >= begin && price.date <= end)
      .sort((first, second) => first.date.localeCompare(second.date))
      .map((price) =>
        checkedQuote(item, price.date, price.amount, price.currency, {
          allowConversion:
            item.source === "yahoo" ||
            item.source === "nasdaq" ||
            item.source === "alphavantage" ||
            item.source === "coincap",
          providerSource: price.providerSource ?? item.source,
          providerTicker: price.providerTicker ?? providerTicker(item),
        }),
      ),
  );
  return quotes;
}

async function fetchPriceSeries(
  item: Instrument,
  begin: string,
  end: string,
): Promise<Quote[]> {
  if (!validDate(begin) || !validDate(end) || begin > end)
    throw new Error("Price series requires a valid date range");
  const candidates: Instrument[] = [
    { ...item, fallbacks: undefined },
    ...(item.fallbacks ?? []).map((fallback) => ({
      ...item,
      source: fallback.source,
      ticker: fallback.ticker,
      fallbacks: undefined,
    })),
  ];
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      const prices = await fetchPriceSeriesFromSource(candidate, begin, end);
      if (prices.length) return prices;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError instanceof Error) throw lastError;
  if (lastError !== undefined) throw new Error("Unable to fetch price series");
  return [];
}

async function writePriceRun(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  prices: Quote[],
  errors: Run["errors"],
  options: {
    write?: boolean;
    date?: string;
    scheduledDay?: string;
  } = {},
) {
  const state = await load(repository, ledgerId);
  const contents = new Map<string, string>();
  let skipped = 0;
  const existingPrices: ExistingQuote[] = [];
  const seen = new Set<string>();
  for (const file of Object.keys(state.files).filter(
    (path) => path.startsWith("prices/") && path.endsWith(".bean"),
  )) {
    for (const match of state.files[file].matchAll(
      /^(\d{4}-\d{2}-\d{2})[ \t]+price[ \t]+(\S+)[ \t]+[^\n]+?[ \t]+([A-Z][A-Z0-9'._-]*)[ \t]*(?:;[^\n]*)?$/gmu,
    ))
      seen.add(`${match[1]}/${match[2]}/${match[3]}`);
  }
  for (const price of prices) {
    const key = `${price.date}/${price.commodity}/${price.quote}`;
    if (seen.has(key)) {
      skipped += 1;
      existingPrices.push({
        date: price.date,
        commodity: price.commodity,
        quote: price.quote,
        file: price.file,
      });
      continue;
    }
    const existing =
      contents.get(price.file) ??
      state.files[price.file] ??
      "; Generated by the prices plugin.\n";
    const targetKeys = [
      ...existing.matchAll(
        /^(\d{4}-\d{2}-\d{2})[ \t]+price[ \t]+(\S+)[ \t]+\S+[ \t]+(\S+)/gmu,
      ),
    ].map((match) => `${match[1]}/${match[2]}/${match[3]}`);
    if (targetKeys.includes(key)) {
      skipped += 1;
      existingPrices.push({
        date: price.date,
        commodity: price.commodity,
        quote: price.quote,
        file: price.file,
      });
      continue;
    }
    contents.set(
      price.file,
      `${existing.trimEnd()}\n\n${price.date} price ${price.commodity} ${price.amount} ${price.quote}\n  price-source: "${price.providerSource ?? price.source}"\n`,
    );
    seen.add(key);
  }
  const written = options.write === false ? [] : [...contents.keys()];
  const latestDate =
    prices
      .map((price) => price.date)
      .sort((first, second) => second.localeCompare(first))[0] ?? undefined;
  if (options.write !== false && options.scheduledDay !== undefined) {
    const nextState: StoredState = {
      scheduledDay: options.scheduledDay,
    };
    contents.set(STATE_FILE, `${JSON.stringify(nextState, null, 2)}\n`);
  }
  if (options.write !== false && contents.size > 0) {
    await repository.writeFiles(
      ledgerId,
      [...contents].map(([file, content]) => ({
        path: file,
        content,
        expectedSha:
          state.files[file] === undefined ? undefined : hash(state.files[file]),
      })),
    );
  }
  return {
    prices,
    errors,
    written,
    skipped,
    existing: existingPrices,
    latestDate,
    date: options.date,
    fetchedAt: new Date().toISOString(),
  };
}

async function refreshLocalPrices(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  options: {
    instruments?: unknown;
    source?: unknown;
    write?: boolean;
    date?: string;
    scheduledDay?: string;
  } = {},
) {
  if (options.date !== undefined && !validDate(options.date))
    throw new Error("Price date must use YYYY-MM-DD");
  const catalog = await readPriceCatalog(repository, ledgerId);
  const requested =
    options.instruments === undefined
      ? catalog.instruments
      : parseConfig({
          instruments: options.instruments,
          schedule: catalog.schedule,
        }).instruments;
  const selected = requested
    .filter((item) => item.enabled)
    .map((item) =>
      options.source ? { ...item, source: source(options.source) } : item,
    );
  const quotes = new Array<Quote | undefined>(selected.length);
  const failures = new Array<Run["errors"][number] | undefined>(
    selected.length,
  );
  let cursor = 0;
  const worker = async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= selected.length) return;
      const item = selected[index];
      try {
        quotes[index] = await fetchPrice(item, options.date);
      } catch (error) {
        failures[index] = {
          commodity: item.commodity,
          message:
            error instanceof Error ? error.message : "Unable to fetch price",
        };
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(FETCH_CONCURRENCY, selected.length) }, () =>
      worker(),
    ),
  );
  const prices = quotes.filter((price): price is Quote => price !== undefined);
  const errors = failures.filter(
    (error): error is Run["errors"][number] => error !== undefined,
  );
  return writePriceRun(repository, ledgerId, prices, errors, options);
}

async function commitLocalPrices(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  options: {
    prices?: unknown;
    errors?: unknown;
    date?: string;
  } = {},
) {
  if (options.date !== undefined && !validDate(options.date))
    throw new Error("Price date must use YYYY-MM-DD");
  if (!Array.isArray(options.prices) || options.prices.length > 500)
    throw new Error("Expected up to 500 prefetched prices");
  const prices = options.prices.map(requestQuote);
  const errors = requestRunErrors(options.errors);
  return writePriceRun(repository, ledgerId, prices, errors, {
    write: true,
    date: options.date,
  });
}

async function runScheduledPrices(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  now = new Date(),
): Promise<void> {
  for (const ledger of [repository.getLedger(ledgerId)]) {
    try {
      await repository.exclusive(ledger.id, async () => {
        const config = await readLocalPluginConfig(repository, ledger.id);
        const settings = record(record(config.plugins ?? {}).prices ?? {});
        if (settings.enabled !== true) return;
        const state = await load(repository, ledger.id);
        const currentSchedule =
          state.saved?.schedule ??
          schedule({
            enabled: settings.daily !== false,
            time: settings.time ?? "18:00",
            timezone: settings.timezone ?? "Asia/Shanghai",
          });
        if (!currentSchedule.enabled) return;
        const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: currentSchedule.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).formatToParts(now);
        const part = (type: string) =>
          parts.find((item) => item.type === type)!.value;
        const day = `${part("year")}-${part("month")}-${part("day")}`;
        const time = `${part("hour")}:${part("minute")}`;
        if (
          time < currentSchedule.time ||
          state.storedState.scheduledDay === day
        )
          return;
        const result = await refreshLocalPrices(repository, ledger.id, {
          scheduledDay: day,
        });
        if (result.errors.length)
          logger.warn("Scheduled price refresh has provider errors", {
            ledgerId: ledger.id,
            failures: result.errors.length,
          });
      });
    } catch {
      logger.warn(
        "Scheduled price refresh failed; inspect the prices plugin configuration",
        { ledgerId: ledger.id },
      );
    }
  }
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body }) {
    if (method === "GET" && !action)
      return readLocalPrices(repository, ledgerId);
    if (method === "GET" && (action === "sources" || action === "capabilities"))
      return readPriceCatalog(repository, ledgerId).then((catalog) => ({
        sources: catalog.sourceDetails,
        warnings: catalog.warnings,
      }));
    if (method === "POST" && action === "refresh")
      return refreshLocalPrices(repository, ledgerId, {
        source: body.source,
        instruments: body.instruments,
        write: body.write !== false,
        date: typeof body.date === "string" ? body.date : undefined,
      });
    if (method === "POST" && action === "commit")
      return commitLocalPrices(repository, ledgerId, {
        prices: body.prices,
        errors: body.errors,
        date: typeof body.date === "string" ? body.date : undefined,
      });
    if (method === "POST" && action === "history") {
      const commodity =
        typeof body.commodity === "string"
          ? body.commodity.trim().toUpperCase()
          : "";
      const quote =
        typeof body.quote === "string" ? body.quote.trim().toUpperCase() : "";
      if (!SYMBOL.test(commodity) || !SYMBOL.test(quote))
        throw new Error("Price history requires a commodity and quote");
      const state = await load(repository, ledgerId);
      return {
        commodity,
        quote,
        prices: readStoredPriceHistory(state.files, commodity, quote),
      };
    }
    if (method === "POST" && (action === "quote" || action === "test")) {
      const item = requestInstrument(body.instrument ?? body);
      const date = typeof body.date === "string" ? body.date : undefined;
      if (date !== undefined && !validDate(date))
        throw new Error("Price date must use YYYY-MM-DD");
      return { price: await fetchPrice(item, date) };
    }
    if (method === "POST" && action === "series") {
      const item = requestInstrument(body.instrument ?? body);
      const from = typeof body.from === "string" ? body.from : "";
      const to = typeof body.to === "string" ? body.to : "";
      return { prices: await fetchPriceSeries(item, from, to) };
    }
    if (method === "POST" && !action)
      return saveLocalPriceConfig(
        repository,
        ledgerId,
        body,
        typeof body.revision === "string" ? body.revision : "",
      );
    throw new Error("Unknown prices operation");
  },
  async tick({ repository, ledgerId, now }) {
    await runScheduledPrices(repository, ledgerId, now);
  },
};
export default backend;
