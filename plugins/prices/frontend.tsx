import React, { useEffect, useState } from "react";

type Instrument = {
  commodity: string;
  quote: string;
  source: string;
  ticker: string;
  file: string;
  enabled: boolean;
  security?: true;
  synthetic?: true;
  fallbacks?: Array<{ source: string; ticker: string }>;
};
type SourceDetail = {
  id: string;
  name: string;
  provider: string;
  description: string;
  tickerHint: string;
  tickerExample: string;
  coverage: string;
  supports: { latest: boolean; historical: boolean; series: boolean };
  apiKeyEnv?: string;
  apiKeyConfigured?: boolean;
};
type Conversion = {
  from: string;
  to: string;
  rate: string;
  date: string;
  source: string;
};
type Run = {
  errors: Array<{ commodity: string; message: string }>;
};
type Catalog = {
  revision: string;
  instruments: Instrument[];
  schedule: { enabled: boolean; time: string; timezone: string };
  latestDate?: string;
  sourceDetails?: SourceDetail[];
  warnings?: Array<{ commodity: string; message: string }>;
};
type Price = Instrument & {
  date: string;
  amount: string;
  providerCurrency?: string;
  providerSource?: string;
  conversion?: Conversion;
  inverted?: boolean;
};
type Result = {
  prices: Price[];
  written: string[];
  skipped: number;
  existing: Array<
    Pick<Instrument, "commodity" | "quote" | "file"> & { date: string }
  >;
  latestDate?: string;
  date?: string;
  errors: Run["errors"];
};
type Progress = {
  total: number;
  done: number;
  active: Array<{ index: number; commodity: string }>;
  label: string;
};
type StoredPrice = {
  date: string;
  amount: string;
  quote: string;
  source?: string;
  file: string;
};
type StoredPriceHistory = {
  commodity: string;
  quote: string;
  prices: StoredPrice[];
};
type Props = {
  ledgerId: string;
  primaryCurrency: string;
  canWrite: boolean;
  api: { fetchLocal(path: string, init?: RequestInit): Promise<Response> };
};

const FALLBACK_SOURCES = [
  ["yahoo", "Yahoo Finance"],
  ["eastmoneyfund", "天天基金"],
  ["exchangerate", "Frankfurter / ECB 汇率"],
  ["ecbrates", "ECB 官方汇率"],
  ["coinbase", "Coinbase"],
  ["coincap", "CoinCap"],
  ["alphavantage", "Alpha Vantage"],
  ["nasdaq", "Nasdaq"],
  ["beancount", "Beancount.io"],
  ["tsp", "TSP"],
];
const FETCH_CONCURRENCY = 3;

function defaultPriceFile(
  commodity: string,
  quote: string,
  primaryCurrency: string,
): string {
  const normalizedCommodity = commodity.trim().toUpperCase();
  const normalizedQuote = quote.trim().toUpperCase();
  if (!normalizedCommodity || !normalizedQuote) return "prices/";
  return normalizedQuote === primaryCurrency.trim().toUpperCase()
    ? `prices/${normalizedCommodity}.bean`
    : `prices/${normalizedCommodity}-to-${normalizedQuote}.bean`;
}

export default function PricesPlugin({
  ledgerId,
  primaryCurrency,
  canWrite,
  api,
}: Props) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [resultPendingWrite, setResultPendingWrite] = useState(false);
  const [resultWriting, setResultWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [queryDate, setQueryDate] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<
    Catalog["schedule"] | null
  >(null);
  const [historyTarget, setHistoryTarget] = useState<{
    commodity: string;
    quote: string;
  } | null>(null);
  const [history, setHistory] = useState<StoredPriceHistory | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

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

  useEffect(() => {
    const controller = new AbortController();
    setCatalog(null);
    setResult(null);
    setResultPendingWrite(false);
    setResultWriting(false);
    setRowBusy(null);
    setRefreshing(false);
    setProgress(null);
    setError("");
    setMessage("");
    setQueryDate("");
    setScheduleOpen(false);
    setScheduleDraft(null);
    setHistoryTarget(null);
    setHistory(null);
    setHistoryError("");
    setHistoryLoading(false);
    void request<Catalog>(
      `/api-gateway/local/plugins/prices/api?ledgerId=${encodeURIComponent(ledgerId)}`,
      undefined,
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) setCatalog(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => controller.abort();
  }, [ledgerId, api]);

  useEffect(() => {
    if (!scheduleOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || busy) return;
      setScheduleOpen(false);
      setScheduleDraft(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [scheduleOpen, busy]);

  useEffect(() => {
    if (!historyTarget) return;
    const controller = new AbortController();
    setHistory(null);
    setHistoryError("");
    setHistoryLoading(true);
    void request<StoredPriceHistory>(
      "/api-gateway/local/plugins/prices/api/history",
      {
        ledgerId,
        commodity: historyTarget.commodity,
        quote: historyTarget.quote,
      },
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) setHistory(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setHistoryError(
            cause instanceof Error ? cause.message : String(cause),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, [historyTarget, ledgerId, api]);

  useEffect(() => {
    if (!historyTarget) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setHistoryTarget(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [historyTarget]);

  function change(index: number, patch: Partial<Instrument>) {
    setCatalog(
      (current) =>
        current && {
          ...current,
          instruments: current.instruments.map((item, position) =>
            position === index ? { ...item, ...patch } : item,
          ),
        },
    );
  }

  async function refreshLocalCatalog() {
    if (!catalog || busy) return;
    setBusy(true);
    setRefreshing(true);
    setError("");
    setMessage("");
    try {
      const value = await request<Catalog>(
        `/api-gateway/local/plugins/prices/api?ledgerId=${encodeURIComponent(ledgerId)}`,
      );
      setCatalog(value);
      setResult(null);
      setResultPendingWrite(false);
      setMessage(
        `已从本地账本刷新商品列表，共识别 ${value.instruments.length} 组价格对。`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }

  async function syncCommittedCatalogMetadata() {
    const current = await request<Catalog>(
      `/api-gateway/local/plugins/prices/api?ledgerId=${encodeURIComponent(ledgerId)}`,
    );
    setCatalog(
      (previous) =>
        previous && {
          ...previous,
          revision: current.revision,
          latestDate: current.latestDate,
        },
    );
  }

  async function act(
    action: "save" | "preview" | "write",
    nextCatalog?: Catalog,
  ): Promise<boolean> {
    const source = nextCatalog ?? catalog;
    if (!source || busy) return false;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (action === "save") {
        const value = await request<Catalog>(
          "/api-gateway/local/plugins/prices/api",
          {
            ledgerId,
            ...source,
          },
        );
        setCatalog(value);
        setMessage(
          "配置已保存：商品与货币对清单、自动抓取时间和时区均已写入；价格记录需点击“抓取并写入”。",
        );
        return true;
      } else {
        const selected = source.instruments.filter((item) => item.enabled);
        if (selected.length === 0) {
          setMessage("没有启用的商品或货币对，请至少开启一项后再抓取。");
          return false;
        }
        const total = selected.length;
        const quotes = new Array<Price | undefined>(total);
        const errors: Run["errors"] = [];
        const active = new Map<number, string>();
        let next = 0;
        let completed = 0;
        const snapshotProgress = (label: string): Progress => ({
          total,
          done: completed,
          active: [...active].map(([index, commodity]) => ({
            index,
            commodity,
          })),
          label,
        });
        setProgress(snapshotProgress("准备抓取…"));
        const worker = async () => {
          for (;;) {
            const index = next;
            next += 1;
            if (index >= total) return;
            const item = selected[index];
            active.set(index, item.commodity);
            setProgress(snapshotProgress("正在抓取"));
            try {
              const response = await request<{ price: Price }>(
                "/api-gateway/local/plugins/prices/api/quote",
                {
                  ledgerId,
                  instrument: item,
                  date: queryDate || undefined,
                },
              );
              quotes[index] = response.price;
            } catch (cause) {
              errors.push({
                commodity: item.commodity,
                message: cause instanceof Error ? cause.message : String(cause),
              });
            } finally {
              active.delete(index);
              completed += 1;
              setProgress(snapshotProgress("正在抓取"));
            }
          }
        };
        await Promise.all(
          Array.from({ length: Math.min(FETCH_CONCURRENCY, total) }, () =>
            worker(),
          ),
        );
        const prices = quotes.filter(
          (price): price is Price => price !== undefined,
        );
        const value =
          action === "write"
            ? await (async () => {
                setProgress({
                  total,
                  done: total,
                  active: [],
                  label: "正在写入账本…",
                });
                return request<Result>(
                  "/api-gateway/local/plugins/prices/api/commit",
                  {
                    ledgerId,
                    prices,
                    errors,
                    date: queryDate || undefined,
                  },
                );
              })()
            : {
                prices,
                written: [],
                skipped: 0,
                existing: [],
                latestDate: prices
                  .map((price) => price.date)
                  .sort((first, second) => second.localeCompare(first))[0],
                date: queryDate || undefined,
                errors,
              };
        setResult(value);
        setResultPendingWrite(action === "preview" && prices.length > 0);
        if (action === "write") {
          await syncCommittedCatalogMetadata();
        }
        if (action === "preview") {
          setMessage(
            `查询完成：${prices.length} 条成功，${errors.length} 个失败。请确认价格与写入路径。`,
          );
        } else if (value.written.length === 0 && value.skipped > 0) {
          setMessage(
            `没有新增价格。来源最新日期是 ${value.latestDate ?? "未知"}，` +
              `该日期已有相同商品和报价货币的记录，已跳过 ${value.skipped} 条。` +
              "价格按来源交易/净值日期记录，不会把旧行情改写成今天。",
          );
        } else {
          setMessage(
            `已写入 ${value.written.length} 个文件` +
              (value.latestDate ? `，来源最新日期是 ${value.latestDate}` : "") +
              `，跳过 ${value.skipped} 条已有价格。`,
          );
        }
        return true;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return false;
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }

  async function writeResult() {
    if (!result || !resultPendingWrite || busy || !canWrite) return;
    setBusy(true);
    setResultWriting(true);
    setError("");
    setMessage("");
    try {
      const value = await request<Result>(
        "/api-gateway/local/plugins/prices/api/commit",
        {
          ledgerId,
          prices: result.prices,
          errors: result.errors,
          date: result.date,
        },
      );
      setResult(value);
      setResultPendingWrite(false);
      await syncCommittedCatalogMetadata();
      const failedNote =
        value.errors.length > 0
          ? ` ${value.errors.length} 个查询失败项未写入。`
          : "";
      if (value.written.length === 0 && value.skipped > 0) {
        setMessage(
          `本次查询没有新增价格。来源最新日期是 ${value.latestDate ?? "未知"}，` +
            `该日期已有相同商品和报价货币的记录，已跳过 ${value.skipped} 条。` +
            "价格按来源交易/净值日期记录，不会把旧行情改写成今天。" +
            failedNote,
        );
      } else if (value.written.length === 0) {
        setMessage(`本次查询结果没有可写入的价格。${failedNote}`);
      } else {
        setMessage(
          `已将本次查询结果写入 ${value.written.length} 个文件` +
            (value.latestDate ? `，来源最新日期是 ${value.latestDate}` : "") +
            `，跳过 ${value.skipped} 条已有价格。${failedNote}`,
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setResultWriting(false);
      setBusy(false);
    }
  }

  async function fetchOne(index: number, item: Instrument) {
    if (busy) return;
    setBusy(true);
    setRowBusy(index);
    setError("");
    setMessage("");
    try {
      const response = await request<{ price: Price }>(
        "/api-gateway/local/plugins/prices/api/quote",
        {
          ledgerId,
          instrument: item,
          date: queryDate || undefined,
        },
      );
      setResult({
        prices: [response.price],
        written: [],
        skipped: 0,
        existing: [],
        latestDate: response.price.date,
        date: queryDate || undefined,
        errors: [],
      });
      setResultPendingWrite(true);
      setMessage(
        `已抓取 ${response.price.commodity}：` +
          `${response.price.date} ${response.price.amount} ${response.price.quote}。` +
          "可点击本次结果旁的“写入账本”提交；已有价格会自动跳过。",
      );
    } catch (cause) {
      setError(
        `${item.commodity}: ${
          cause instanceof Error ? cause.message : String(cause)
        }`,
      );
    } finally {
      setRowBusy(null);
      setBusy(false);
    }
  }

  function openPriceHistory(item: Instrument) {
    if (!item.commodity || !item.quote) return;
    setHistoryTarget({
      commodity: item.commodity,
      quote: item.quote,
    });
  }

  function openScheduleDialog() {
    if (!catalog || busy) return;
    setError("");
    setScheduleDraft({ ...catalog.schedule });
    setScheduleOpen(true);
  }

  function closeScheduleDialog() {
    if (busy) return;
    setScheduleOpen(false);
    setScheduleDraft(null);
  }

  async function saveSchedule() {
    if (!catalog || !scheduleDraft) return;
    const saved = await act("save", {
      ...catalog,
      schedule: scheduleDraft,
    });
    if (saved) closeScheduleDialog();
  }

  const enabledCount =
    catalog?.instruments.filter((item) => item.enabled).length ?? 0;
  const latestSourceDate = result?.latestDate ?? catalog?.latestDate;
  const progressPercent = progress
    ? Math.round((progress.done / Math.max(progress.total, 1)) * 100)
    : 0;
  const activeProgress = progress?.active[0];
  const sourceOptions =
    catalog?.sourceDetails?.map(
      (item) =>
        [
          item.id,
          item.supports.latest || item.supports.series
            ? item.name
            : `${item.name}（未启用）`,
        ] as const,
    ) ?? FALLBACK_SOURCES;
  const sourceDetails = new Map(
    (catalog?.sourceDetails ?? []).map((item) => [item.id, item]),
  );
  const visibleInstruments =
    catalog?.instruments
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) =>
          !filter ||
          `${item.commodity} ${item.quote}`
            .toLowerCase()
            .includes(filter.toLowerCase()),
      ) ?? [];
  return (
    <section className="prices-plugin" aria-label="价格与汇率插件">
      <style>{`
        .prices-plugin{
          --pp-ink:#18251f;--pp-muted:#6d7971;--pp-faint:#929d95;
          --pp-paper:#f2f1e9;--pp-surface:#fffefa;--pp-soft:#f7f6ef;
          --pp-line:#dce0d6;--pp-line-strong:#c9d0c4;
          --pp-green:#1d674b;--pp-green-dark:#15533c;--pp-green-soft:#e7f0e9;
          --pp-success-surface:#f3f8f4;--pp-success-line:#c9dccd;--pp-success-text:#285441;
          --pp-gold:#ad762c;--pp-rose:#ac4f3e;--pp-rose-soft:#faeae6;
          width:100%;min-width:0;min-height:100%;padding:16px 28px 24px;
          color:var(--pp-ink);
          font-family:"Avenir Next","Noto Sans SC","PingFang SC",sans-serif;
          background:transparent;
        }
        .prices-plugin *{box-sizing:border-box}
        .prices-plugin .pp-shell{width:min(1420px,100%);margin:0 auto}
        .prices-plugin .pp-eyebrow,.prices-plugin .pp-kicker{
          display:flex;align-items:center;gap:8px;color:var(--pp-green);
          font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
        }
        .prices-plugin .pp-eyebrow-dot{
          width:7px;height:7px;border-radius:50%;background:var(--pp-green);
          box-shadow:0 0 0 4px rgba(29,103,75,.11);
        }
        .prices-plugin h1{
          display:flex;align-items:baseline;gap:10px;margin:7px 0 4px;
          font-family:"Iowan Old Style","Songti SC",Georgia,serif;
          font-size:clamp(28px,2.7vw,36px);font-weight:500;line-height:1;letter-spacing:-.035em;
        }
        .prices-plugin h1 small{
          font-family:"Avenir Next","Noto Sans SC","PingFang SC",sans-serif;
          font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--pp-muted);
        }
        .prices-plugin p{margin:0;font-size:13px;line-height:1.75}
        .prices-plugin .pp-panel{
          border:1px solid var(--pp-line);border-radius:16px;background:rgba(255,254,250,.93);
          box-shadow:0 10px 30px rgba(36,50,42,.04);
          animation:pp-rise .5s cubic-bezier(.2,.75,.25,1) both;
        }
        .prices-plugin .pp-pairs-panel{animation-delay:.04s}
        .prices-plugin .pp-command-panel{margin-top:18px;animation-delay:.08s}
        .prices-plugin .pp-panel-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding:16px 20px 13px}
        .prices-plugin .pp-panel-title h2{margin:3px 0 2px;font-family:"Iowan Old Style","Songti SC",Georgia,serif;font-size:22px;font-weight:500;letter-spacing:-.02em}
        .prices-plugin .pp-panel-title>p{color:var(--pp-muted);font-size:12px}
        .prices-plugin .pp-title-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .prices-plugin .pp-panel-intro{min-width:0;max-width:840px}
        .prices-plugin .pp-kicker-note{padding-left:10px;border-left:1px solid var(--pp-line-strong);color:var(--pp-faint);font-size:9px;font-weight:650;letter-spacing:.12em}
        .prices-plugin .pp-intro-copy{max-width:820px;color:var(--pp-muted);font-size:11px;line-height:1.55}
        .prices-plugin .pp-config-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:0 12px 12px}
        .prices-plugin .pp-config-footer button{min-height:32px;padding:0 11px;border-radius:9px;font-size:10px}
        .prices-plugin .pp-config-save{background:var(--pp-soft)}
        .prices-plugin .pp-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .prices-plugin .pp-search{position:relative;display:block;min-width:248px}
        .prices-plugin .pp-search svg{position:absolute;top:50%;left:12px;width:15px;height:15px;color:var(--pp-faint);transform:translateY(-50%);pointer-events:none}
        .prices-plugin .pp-search input:not([type=checkbox]){padding-right:12px;padding-left:40px}
        .prices-plugin .pp-count{display:inline-flex;align-items:center;height:36px;padding:0 11px;border:1px solid var(--pp-line);border-radius:10px;background:var(--pp-soft);color:var(--pp-muted);font-size:11px;font-weight:600;white-space:nowrap}
        .prices-plugin input,.prices-plugin select,.prices-plugin button{font:inherit;color:inherit}
        .prices-plugin input:not([type=checkbox]),.prices-plugin select{
          width:100%;height:38px;padding:0 11px;border:1px solid var(--pp-line-strong);border-radius:10px;
          outline:none;background:var(--pp-surface);font-size:12px;
          transition:border-color .18s,box-shadow .18s,background .18s;
        }
        .prices-plugin input:not([type=checkbox]):hover,.prices-plugin select:hover{border-color:#aeb9b0}
        .prices-plugin input:not([type=checkbox]):focus,.prices-plugin select:focus{
          border-color:var(--pp-green);background:var(--pp-surface);
          box-shadow:0 0 0 3px rgba(29,103,75,.11);
        }
        .prices-plugin input:disabled,.prices-plugin select:disabled{opacity:.58;cursor:not-allowed;background:var(--pp-soft)}
        .prices-plugin button{
          display:inline-flex;align-items:center;justify-content:center;gap:7px;
          min-height:38px;padding:0 14px;border:1px solid var(--pp-line-strong);border-radius:10px;
          background:var(--pp-surface);font-size:12px;font-weight:650;cursor:pointer;
          transition:transform .16s,border-color .16s,background .16s,box-shadow .16s;
        }
        .prices-plugin button:hover:not(:disabled){border-color:#aeb9b0;background:var(--pp-surface);box-shadow:0 5px 14px rgba(31,47,38,.07);transform:translateY(-1px)}
        .prices-plugin button:active:not(:disabled){transform:translateY(0)}
        .prices-plugin button:focus-visible{outline:3px solid rgba(29,103,75,.2);outline-offset:2px}
        .prices-plugin button:disabled{opacity:.5;cursor:not-allowed}
        .prices-plugin .pp-add{background:var(--pp-ink);border-color:var(--pp-ink);color:#fff}
        .prices-plugin .pp-add:hover:not(:disabled){border-color:var(--pp-green-dark);background:var(--pp-green-dark)}
        .prices-plugin .pp-sync-local{background:var(--pp-soft);white-space:nowrap}
        .prices-plugin .pp-sync-local svg{flex:0 0 15px;width:15px;height:15px}
        .prices-plugin .pp-sync-local.is-busy svg{animation:pp-spin .7s linear infinite}
        .prices-plugin .pp-table-scroll{overflow:auto;margin:0 10px 10px;border:1px solid var(--pp-line);border-radius:12px;background:var(--pp-surface)}
        .prices-plugin table{width:100%;min-width:1140px;border-collapse:collapse;font-size:12px}
        .prices-plugin th{
          position:sticky;top:0;z-index:1;padding:11px 12px;border-bottom:1px solid var(--pp-line);
          background:var(--pp-soft);color:var(--pp-muted);font-size:9px;font-weight:750;
          letter-spacing:.075em;text-align:left;text-transform:uppercase;white-space:nowrap;
        }
        .prices-plugin td{padding:9px 10px;border-bottom:1px solid var(--pp-line);text-align:left;vertical-align:middle}
        .prices-plugin tbody tr:last-child td{border-bottom:0}
        .prices-plugin tbody tr{transition:background .16s}
        .prices-plugin tbody tr:hover{background:color-mix(in srgb,var(--pp-green-soft) 45%,transparent)}
        .prices-plugin tbody tr.is-disabled{background:var(--pp-soft)}
        .prices-plugin tbody tr.is-disabled td:not(:first-child){opacity:.67}
        .prices-plugin .pp-col-toggle{width:86px}
        .prices-plugin .pp-toggle-summary{display:inline-flex;align-items:baseline;gap:5px;white-space:nowrap}
        .prices-plugin .pp-toggle-summary strong{color:var(--pp-ink);font-size:10px;font-weight:500;font-variant-numeric:tabular-nums}
        .prices-plugin .pp-toggle-summary i{font-style:normal;font-weight:600}
        .prices-plugin .pp-col-pair{width:190px}
        .prices-plugin .pp-col-quote{width:125px}
        .prices-plugin .pp-col-source{width:205px}
        .prices-plugin .pp-col-ticker{width:180px}
        .prices-plugin .pp-col-file{width:260px}
        .prices-plugin .pp-col-remove{width:190px;text-align:right}
        .prices-plugin .pp-pair-field{display:flex;align-items:center;gap:6px}
        .prices-plugin .pp-pair-field input{min-width:0;flex:1}
        .prices-plugin .pp-synthetic-badge{
          flex:0 0 auto;padding:3px 7px;border:1px solid #dbc79a;border-radius:999px;
          background:#f7efd9;color:#8a5e1e;font-size:9px;font-weight:750;white-space:nowrap;
        }
        .prices-plugin .pp-switch{position:relative;display:inline-flex;cursor:pointer}
        .prices-plugin .pp-switch input{position:absolute;width:1px;height:1px;opacity:0}
        .prices-plugin .pp-switch-track{
          position:relative;display:block;width:32px;height:18px;border-radius:999px;
          background:var(--pp-line-strong);transition:background .18s,box-shadow .18s;
        }
        .prices-plugin .pp-switch-track::after{
          content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
          background:#fff;box-shadow:0 1px 4px rgba(20,34,26,.22);transition:transform .18s;
        }
        .prices-plugin .pp-switch input:checked+.pp-switch-track{background:var(--pp-green)}
        .prices-plugin .pp-switch input:checked+.pp-switch-track::after{transform:translateX(14px)}
        .prices-plugin .pp-switch input:focus-visible+.pp-switch-track{box-shadow:0 0 0 3px rgba(29,103,75,.16)}
        .prices-plugin .pp-switch input:disabled+.pp-switch-track{opacity:.45;cursor:not-allowed}
        .prices-plugin .pp-remove{
          min-height:32px;padding:0 10px;border-color:transparent;background:transparent;
          color:var(--pp-muted);font-size:11px;
        }
        .prices-plugin .pp-remove:hover:not(:disabled){border-color:#efd6cf;background:var(--pp-rose-soft);color:var(--pp-rose)}
        .prices-plugin .pp-row-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex-wrap:wrap}
        .prices-plugin .pp-row-fetch{
          min-height:32px;padding:0 10px;border-color:#c9dccd;background:var(--pp-green-soft);
          color:var(--pp-green);font-size:11px;white-space:nowrap;
        }
        .prices-plugin .pp-row-fetch:hover:not(:disabled){border-color:#a9c9b2;background:#deecdf}
        .prices-plugin .pp-row-fetch.is-busy::before{
          content:"";width:10px;height:10px;border:2px solid #b9cfc0;border-top-color:var(--pp-green);
          border-radius:50%;animation:pp-spin .7s linear infinite;
        }
        .prices-plugin .pp-row-history{
          min-height:32px;padding:0 10px;border-color:var(--pp-line);background:var(--pp-soft);
          color:var(--pp-muted);font-size:11px;white-space:nowrap;
        }
        .prices-plugin .pp-row-history:hover:not(:disabled){color:var(--pp-ink);border-color:var(--pp-line-strong)}
        .prices-plugin .pp-empty{
          display:flex;align-items:center;justify-content:center;min-height:150px;
          color:var(--pp-muted);font-size:12px;text-align:center;
        }
        .prices-plugin .pp-command-head{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 20px 13px}
        .prices-plugin .pp-command-head h2{margin:3px 0 0;font-family:"Iowan Old Style","Songti SC",Georgia,serif;font-size:22px;font-weight:500}
        .prices-plugin .pp-command-head p{margin-top:5px;color:var(--pp-muted);font-size:11px}
        .prices-plugin .pp-command-side{display:grid;justify-items:end;gap:8px}
        .prices-plugin .pp-date-field{display:flex;align-items:center;gap:7px;color:var(--pp-muted);font-size:10px;font-weight:650}
        .prices-plugin .pp-date-field input{height:30px;padding:0 8px;border-radius:8px;font-size:10px}
        .prices-plugin .pp-command-meta{display:flex;align-items:baseline;gap:7px;color:var(--pp-muted);font-size:10px}
        .prices-plugin .pp-command-meta strong{color:var(--pp-ink);font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
        .prices-plugin .pp-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;justify-content:flex-end}
        .prices-plugin .pp-schedule-toggle{padding-left:10px}
        .prices-plugin .pp-schedule-toggle small{color:var(--pp-muted);font-size:10px;font-weight:600}
        .prices-plugin .pp-schedule-dot{width:6px;height:6px;border-radius:50%;background:#b8c0ba}
        .prices-plugin .pp-schedule-toggle.is-on .pp-schedule-dot{background:var(--pp-green);box-shadow:0 0 0 3px rgba(29,103,75,.1)}
        .prices-plugin .pp-modal-backdrop{
          position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;
          background:rgba(20,31,25,.3);backdrop-filter:blur(3px);animation:pp-fade .16s ease both;
        }
        .prices-plugin .pp-schedule-dialog{
          width:min(480px,100%);overflow:hidden;border:1px solid var(--pp-line-strong);
          border-radius:16px;background:var(--pp-surface);box-shadow:0 24px 80px rgba(20,34,26,.24);
          animation:pp-dialog-in .2s cubic-bezier(.2,.75,.25,1) both;
        }
        .prices-plugin .pp-history-dialog{
          width:min(820px,100%);max-height:min(78dvh,720px);display:flex;flex-direction:column;
          overflow:hidden;border:1px solid var(--pp-line-strong);border-radius:16px;
          background:var(--pp-surface);color:var(--pp-ink);box-shadow:0 24px 80px rgba(20,34,26,.24);
          animation:pp-dialog-in .2s cubic-bezier(.2,.75,.25,1) both;
        }
        .prices-plugin .pp-history-body{display:grid;gap:11px;min-height:0;padding:16px 20px 8px}
        .prices-plugin .pp-history-meta{display:flex;align-items:baseline;justify-content:space-between;gap:12px;color:var(--pp-muted);font-size:10px;font-weight:650}
        .prices-plugin .pp-history-meta strong{color:var(--pp-ink);font-size:12px;font-variant-numeric:tabular-nums}
        .prices-plugin .pp-history-table-scroll{min-height:0;overflow:auto;border:1px solid var(--pp-line);border-radius:12px;background:var(--pp-surface)}
        .prices-plugin .pp-history-table{min-width:0;font-size:12px}
        .prices-plugin .pp-history-table td{font-variant-numeric:tabular-nums}
        .prices-plugin .pp-history-amount{font-family:"SFMono-Regular","JetBrains Mono",monospace;font-weight:650;white-space:nowrap}
        .prices-plugin .pp-history-file{max-width:260px;overflow:hidden;color:var(--pp-muted);font-family:"SFMono-Regular","JetBrains Mono",monospace;font-size:10px;text-overflow:ellipsis;white-space:nowrap}
        .prices-plugin .pp-history-status{display:grid;place-items:center;min-height:160px;padding:24px;border:1px dashed var(--pp-line-strong);border-radius:12px;color:var(--pp-muted);font-size:11px;text-align:center}
        .prices-plugin .pp-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px 14px;border-bottom:1px solid var(--pp-line)}
        .prices-plugin .pp-dialog-head h2{margin:3px 0 0;font-family:"Iowan Old Style","Songti SC",Georgia,serif;font-size:22px;font-weight:500;letter-spacing:-.02em}
        .prices-plugin .pp-dialog-close{flex:0 0 30px;width:30px;height:30px;min-height:30px;padding:0;border-radius:50%;border-color:transparent;background:var(--pp-soft);color:var(--pp-muted)}
        .prices-plugin .pp-dialog-close svg{width:14px;height:14px}
        .prices-plugin .pp-dialog-body{display:grid;gap:15px;padding:17px 20px 18px}
        .prices-plugin .pp-schedule-enable{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:32px;font-size:11px;font-weight:650}
        .prices-plugin .pp-dialog-fields{display:grid;grid-template-columns:1fr 1.45fr;gap:12px}
        .prices-plugin .pp-schedule-field{display:grid;gap:4px}
        .prices-plugin .pp-schedule-field>span{color:var(--pp-muted);font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
        .prices-plugin .pp-schedule-field input{height:32px;padding:0 9px;border-radius:8px;font-size:11px}
        .prices-plugin .pp-dialog-note{color:var(--pp-faint);font-size:10px;line-height:1.6}
        .prices-plugin .pp-dialog-actions{display:flex;justify-content:flex-end;gap:9px;padding:0 20px 18px}
        .prices-plugin .pp-primary{
          border-color:var(--pp-green);background:linear-gradient(135deg,var(--pp-green),var(--pp-green-dark));
          color:#fff;box-shadow:0 8px 20px rgba(29,103,75,.18);
        }
        .prices-plugin .pp-primary:hover:not(:disabled){border-color:var(--pp-green-dark);background:linear-gradient(135deg,#227458,var(--pp-green-dark));box-shadow:0 10px 24px rgba(29,103,75,.25)}
        .prices-plugin .pp-busy{display:inline-flex;align-items:center;gap:7px;color:var(--pp-muted);font-size:11px}
        .prices-plugin .pp-busy::before{content:"";width:12px;height:12px;border:2px solid var(--pp-line-strong);border-top-color:var(--pp-green);border-radius:50%;animation:pp-spin .7s linear infinite}
        .prices-plugin .pp-command-body{padding:0 20px 18px}
        .prices-plugin .pp-progress-card{
          display:grid;gap:8px;margin-bottom:14px;padding:13px 15px;
          border:1px solid var(--pp-success-line);border-radius:12px;background:var(--pp-success-surface);
        }
        .prices-plugin .pp-progress-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
        .prices-plugin .pp-progress-head span{color:var(--pp-success-text);font-size:11px;font-weight:700}
        .prices-plugin .pp-progress-head strong{color:var(--pp-green);font-size:11px;font-variant-numeric:tabular-nums}
        .prices-plugin .pp-progress-detail{color:var(--pp-muted);font-size:10px;font-weight:600}
        .prices-plugin .pp-progress-track{height:7px;overflow:hidden;border-radius:999px;background:var(--pp-line)}
        .prices-plugin .pp-progress-track i{
          display:block;height:100%;border-radius:inherit;
          background:linear-gradient(90deg,#3f8c6c,var(--pp-green));
          transition:width .22s ease;
        }
        .prices-plugin .pp-message{
          display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;padding:12px 14px;
          border:1px solid var(--pp-success-line);border-radius:12px;background:var(--pp-green-soft);
          color:var(--pp-success-text);font-size:11px;line-height:1.65;
        }
        .prices-plugin .pp-message::before{content:"✓";flex:0 0 auto;font-weight:800}
        .prices-plugin .pp-alert{
          display:flex;align-items:flex-start;gap:10px;padding:13px 15px;border:1px solid #efd0c7;
          border-radius:13px;background:var(--pp-rose-soft);color:var(--pp-rose);font-size:11px;line-height:1.65;
        }
        .prices-plugin .pp-alert::before{content:"!";display:grid;flex:0 0 auto;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--pp-rose);color:#fff;font-size:10px;font-weight:800}
        .prices-plugin .pp-error-list{display:grid;gap:7px;margin-top:12px}
        .prices-plugin .pp-result{margin-top:16px;overflow:hidden;border:1px solid var(--pp-line);border-radius:13px;background:var(--pp-surface);color:var(--pp-ink)}
        .prices-plugin .pp-result-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 13px;border-bottom:1px solid var(--pp-line);background:var(--pp-soft);color:var(--pp-muted);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
        .prices-plugin .pp-result-head-meta{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
        .prices-plugin .pp-result-write{
          min-height:28px;padding:0 11px;border-color:var(--pp-green);background:var(--pp-green);
          color:#fff;font-size:10px;letter-spacing:.02em;text-transform:none;
        }
        .prices-plugin .pp-result-write:hover:not(:disabled){border-color:var(--pp-green-dark);background:var(--pp-green-dark);box-shadow:0 4px 10px rgba(29,103,75,.16)}
        .prices-plugin .pp-result-list{display:grid}
        .prices-plugin .pp-result-row{
          display:grid;grid-template-columns:88px 130px minmax(80px,.65fr) 110px minmax(180px,1.4fr);
          align-items:center;gap:12px;padding:11px 13px;border-bottom:1px solid var(--pp-line);font-size:11px;
        }
        .prices-plugin .pp-result-row:last-child{border-bottom:0}
        .prices-plugin .pp-result-date{color:var(--pp-muted);font-variant-numeric:tabular-nums}
        .prices-plugin .pp-result-pair{font-weight:700}
        .prices-plugin .pp-result-pair i{margin:0 5px;color:var(--pp-faint);font-style:normal}
        .prices-plugin .pp-result-amount{font-family:"SFMono-Regular","JetBrains Mono",monospace;font-size:12px;font-variant-numeric:tabular-nums}
        .prices-plugin .pp-conversion{color:var(--pp-faint);font-family:inherit;font-size:9px;font-style:normal;white-space:nowrap}
        .prices-plugin .pp-source-tag{justify-self:start;padding:3px 7px;border-radius:999px;background:var(--pp-green-soft);color:var(--pp-green);font-size:9px;font-weight:700}
        .prices-plugin .pp-result-file{overflow:hidden;color:var(--pp-muted);font-family:"SFMono-Regular","JetBrains Mono",monospace;font-size:10px;text-overflow:ellipsis;white-space:nowrap}
        .prices-plugin .pp-result-empty{padding:28px;color:var(--pp-muted);font-size:11px;text-align:center}
        .prices-plugin .pp-guide{margin-top:12px;border:1px solid var(--pp-line);border-radius:14px;background:rgba(255,254,250,.72);animation:pp-rise .5s .2s cubic-bezier(.2,.75,.25,1) both}
        .prices-plugin .pp-guide-head{padding:13px 18px 0}
        .prices-plugin .pp-guide-head h2{margin:3px 0 0;font-family:"Iowan Old Style","Songti SC",Georgia,serif;font-size:18px;font-weight:500;letter-spacing:-.01em}
        .prices-plugin .pp-guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;padding:0 18px 16px}
        .prices-plugin .pp-guide-grid article{padding-top:11px;border-top:1px solid var(--pp-line)}
        .prices-plugin .pp-guide-grid h3{margin:0 0 6px;font-size:11px;font-weight:750}
        .prices-plugin .pp-guide-grid p{color:var(--pp-muted);font-size:10px;line-height:1.7}
        .prices-plugin code{padding:1px 4px;border-radius:4px;background:var(--pp-soft);color:var(--pp-ink);font-family:"SFMono-Regular","JetBrains Mono",monospace;font-size:.94em}
        .prices-plugin .pp-loading{display:flex;align-items:center;gap:12px;padding:22px;border:1px solid var(--pp-line);border-radius:16px;background:var(--pp-surface);color:var(--pp-muted);font-size:12px}
        .prices-plugin .pp-loading::before{content:"";width:16px;height:16px;border:2px solid var(--pp-line-strong);border-top-color:var(--pp-green);border-radius:50%;animation:pp-spin .7s linear infinite}
        @keyframes pp-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pp-spin{to{transform:rotate(360deg)}}
        @keyframes pp-fade{from{opacity:0}to{opacity:1}}
        @keyframes pp-dialog-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media(max-width:1120px){
          .prices-plugin .pp-pairs-panel .pp-panel-head{display:grid;align-items:start}
          .prices-plugin .pp-pairs-panel .pp-toolbar{justify-content:flex-start}
        }
        @media(max-width:1040px){
          .prices-plugin{padding:24px}
          .prices-plugin .pp-command-head{display:grid;align-items:start}
          .prices-plugin .pp-command-side{justify-items:start}
          .prices-plugin .pp-actions{justify-content:flex-start}
          .prices-plugin .pp-guide-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:720px){
          .prices-plugin{padding:18px}
          .prices-plugin h1{gap:9px}
          .prices-plugin h1 small{font-size:11px}
          .prices-plugin .pp-panel{border-radius:16px}
          .prices-plugin .pp-panel-head,.prices-plugin .pp-command-head{display:grid;align-items:start;padding:18px 16px 15px}
          .prices-plugin .pp-toolbar{display:grid;grid-template-columns:1fr auto;width:100%}
          .prices-plugin .pp-search{min-width:0}
          .prices-plugin .pp-count{display:none}
          .prices-plugin .pp-add{grid-column:1/-1}
          .prices-plugin .pp-dialog-fields{grid-template-columns:1fr}
          .prices-plugin .pp-modal-backdrop{padding:14px}
          .prices-plugin .pp-table-scroll{margin:0 10px 10px;overflow:visible;border:0;background:transparent}
          .prices-plugin table,.prices-plugin tbody{display:block;min-width:0}
          .prices-plugin thead{display:none}
          .prices-plugin tbody{display:grid;gap:10px}
          .prices-plugin tr{display:grid;overflow:hidden;border:1px solid var(--pp-line);border-radius:12px;background:var(--pp-surface)}
          .prices-plugin td{display:grid;grid-template-columns:112px minmax(0,1fr);align-items:center;gap:12px;padding:9px 12px;border-bottom:1px solid var(--pp-line)}
          .prices-plugin td::before{content:attr(data-label);color:var(--pp-faint);font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
          .prices-plugin td:last-child{border-bottom:0}
          .prices-plugin tbody tr.is-disabled td:not(:first-child){opacity:1}
          .prices-plugin .pp-col-toggle,.prices-plugin .pp-col-pair,.prices-plugin .pp-col-quote,.prices-plugin .pp-col-source,.prices-plugin .pp-col-ticker,.prices-plugin .pp-col-file,.prices-plugin .pp-col-remove{width:auto;text-align:left}
          .prices-plugin .pp-switch{justify-self:start}
          .prices-plugin .pp-remove{justify-self:start}
          .prices-plugin .pp-row-actions{justify-content:flex-start}
          .prices-plugin .pp-command-head{gap:14px}
          .prices-plugin .pp-command-side{width:100%}
          .prices-plugin .pp-actions{display:grid;grid-template-columns:1fr 1fr;justify-content:stretch}
          .prices-plugin .pp-actions .pp-primary{grid-column:1/-1}
          .prices-plugin .pp-actions button{width:100%}
          .prices-plugin .pp-command-body{padding:0 16px 18px}
          .prices-plugin .pp-history-dialog{max-height:calc(100dvh - 28px)}
          .prices-plugin .pp-history-body{padding:14px 14px 4px}
          .prices-plugin .pp-result-head{align-items:flex-start;flex-wrap:wrap}
          .prices-plugin .pp-result-head-meta{width:100%;justify-content:space-between}
          .prices-plugin .pp-result-row{grid-template-columns:1fr auto;gap:5px 12px}
          .prices-plugin .pp-result-date{grid-column:1/-1;font-size:9px}
          .prices-plugin .pp-result-pair{font-size:12px}
          .prices-plugin .pp-result-amount{justify-self:end}
          .prices-plugin .pp-source-tag{grid-column:1}
          .prices-plugin .pp-result-file{grid-column:1/-1}
          .prices-plugin .pp-guide-grid{grid-template-columns:1fr;gap:14px}
        }
        @media(prefers-reduced-motion:reduce){
          .prices-plugin *{scroll-behavior:auto!important;animation:none!important;transition:none!important}
        }
        html.dark .prices-plugin{
          --pp-ink:#e6e4da;--pp-muted:#a3a89e;--pp-faint:#82887e;
          --pp-paper:#20241e;--pp-surface:#252922;--pp-soft:#2b2f28;
          --pp-line:#3a3f36;--pp-line-strong:#4b5145;
          --pp-green:#55b28a;--pp-green-dark:#3f916c;--pp-green-soft:#20302a;
          --pp-success-surface:#20302a;--pp-success-line:#35533f;--pp-success-text:#9fcfb4;
          --pp-gold:#d2a55c;--pp-rose:#df8a74;--pp-rose-soft:#342220;
        }
        @media(prefers-color-scheme:dark){
          html:not(.light) .prices-plugin{
            --pp-ink:#e6e4da;--pp-muted:#a3a89e;--pp-faint:#82887e;
            --pp-paper:#20241e;--pp-surface:#252922;--pp-soft:#2b2f28;
            --pp-line:#3a3f36;--pp-line-strong:#4b5145;
            --pp-green:#55b28a;--pp-green-dark:#3f916c;--pp-green-soft:#20302a;
            --pp-success-surface:#20302a;--pp-success-line:#35533f;--pp-success-text:#9fcfb4;
            --pp-gold:#d2a55c;--pp-rose:#df8a74;--pp-rose-soft:#342220;
          }
        }
        html.dark .prices-plugin .pp-panel{background:rgba(37,41,34,.93)}
        html.dark .prices-plugin .pp-guide{background:rgba(37,41,34,.72)}
        html.dark .prices-plugin input:not([type=checkbox]),html.dark .prices-plugin select{background:#20241e}
        html.dark .prices-plugin input:not([type=checkbox]):hover,html.dark .prices-plugin select:hover,html.dark .prices-plugin button:hover:not(:disabled){border-color:#59635a}
        html.dark .prices-plugin input:not([type=checkbox]):focus,html.dark .prices-plugin select:focus,html.dark .prices-plugin button:hover:not(:disabled){background:#2b2f28}
        html.dark .prices-plugin .pp-add{color:#20241e}
        html.dark .prices-plugin tbody tr:hover{background:rgba(85,178,138,.1)}
        html.dark .prices-plugin tbody tr.is-disabled{background:rgba(43,47,40,.6)}
        html.dark .prices-plugin .pp-synthetic-badge{border-color:#6b562f;background:#332b19;color:#d2a55c}
        html.dark .prices-plugin .pp-switch-track{background:#4b5145}
        html.dark .prices-plugin .pp-switch-track::after{background:#e6e4da;box-shadow:0 1px 4px rgba(0,0,0,.5)}
        html.dark .prices-plugin .pp-remove:hover:not(:disabled){border-color:#5f3a31}
        html.dark .prices-plugin .pp-row-fetch{border-color:#35533f}
        html.dark .prices-plugin .pp-row-fetch:hover:not(:disabled){border-color:#47795b;background:#26382c}
        html.dark .prices-plugin .pp-row-fetch.is-busy::before{border-color:#41624d}
        html.dark .prices-plugin .pp-schedule-dot{background:#5a645c}
        html.dark .prices-plugin .pp-alert{border-color:#5f3a31}
        html.dark .prices-plugin .pp-primary:hover:not(:disabled){background:linear-gradient(135deg,#2f8a65,var(--pp-green-dark))}
        html.dark .prices-plugin .pp-result-write{color:#20241e}
        html.dark .prices-plugin .pp-result-write:hover:not(:disabled){border-color:var(--pp-green-dark);background:var(--pp-green-dark);color:#20241e}
      `}</style>
      <div className="pp-shell">
        {error && (
          <div className="pp-alert" role="alert">
            {error}
          </div>
        )}
        {catalog?.warnings && catalog.warnings.length > 0 && (
          <div className="pp-error-list" role="status">
            {catalog.warnings.map((warning, index) => (
              <div className="pp-alert" key={`${warning.commodity}-${index}`}>
                {warning.commodity}: {warning.message}（已使用默认识别结果）
              </div>
            ))}
          </div>
        )}
        {!catalog && !error && (
          <div className="pp-loading" role="status">
            正在识别账本中的商品与货币…
          </div>
        )}

        {catalog && (
          <>
            <section className="pp-panel pp-pairs-panel">
              <div className="pp-panel-head">
                <div className="pp-panel-intro">
                  <div className="pp-title-line">
                    <span className="pp-kicker">
                      <span className="pp-eyebrow-dot" />
                      01 / Price pairs
                      <span className="pp-kicker-note">
                        Automated market data
                      </span>
                    </span>
                  </div>
                  <h1>
                    Prices <small>价格与汇率</small>
                  </h1>
                  <p className="pp-intro-copy">
                    识别账本中的商品与货币，从可靠来源抓取报价，并按交易日写入
                    Beancount。基金使用净值日期，汇率与股票使用来源提供的市场日期。
                  </p>
                </div>
                <div className="pp-toolbar">
                  <label className="pp-search">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m16.5 16.5 4 4" />
                    </svg>
                    <input
                      aria-label="搜索商品"
                      placeholder="搜索商品 / 货币"
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                    />
                  </label>
                  <button
                    className={`pp-sync-local${refreshing ? " is-busy" : ""}`}
                    title="重新读取本地账本；未保存的表格修改会被替换"
                    disabled={busy}
                    aria-busy={refreshing}
                    onClick={() => void refreshLocalCatalog()}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 7v5h-5" />
                      <path d="M4 17v-5h5" />
                      <path d="M6.1 9a7 7 0 0 1 11.6-2L20 9" />
                      <path d="M17.9 15a7 7 0 0 1-11.6 2L4 15" />
                    </svg>
                    {refreshing ? "正在获取…" : "从本地账本获取商品"}
                  </button>
                  <button
                    className="pp-add"
                    disabled={busy || !canWrite}
                    onClick={() =>
                      setCatalog({
                        ...catalog,
                        instruments: [
                          ...catalog.instruments,
                          {
                            commodity: "",
                            quote: primaryCurrency || "USD",
                            source: "yahoo",
                            ticker: "",
                            file: "prices/",
                            enabled: true,
                          },
                        ],
                      })
                    }
                  >
                    <span aria-hidden="true">＋</span>
                    添加商品 / 货币对
                  </button>
                </div>
              </div>
              <div className="pp-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="pp-col-toggle">
                        <span className="pp-toggle-summary">
                          启用
                          <strong>
                            {enabledCount} / {catalog.instruments.length}
                          </strong>
                          <i>组</i>
                        </span>
                      </th>
                      <th className="pp-col-pair">商品 / 基础货币</th>
                      <th className="pp-col-quote">报价货币</th>
                      <th className="pp-col-source">来源</th>
                      <th className="pp-col-ticker">来源代码 / feed 别名</th>
                      <th className="pp-col-file">输出文件</th>
                      <th className="pp-col-remove" aria-label="操作" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleInstruments.map(({ item, index }) => (
                      <tr
                        key={index}
                        className={item.enabled ? "" : "is-disabled"}
                      >
                        <td data-label="状态">
                          <label className="pp-switch">
                            <input
                              type="checkbox"
                              aria-label={`启用 ${item.commodity}`}
                              checked={item.enabled}
                              disabled={busy || !canWrite}
                              onChange={(event) =>
                                change(index, {
                                  enabled: event.target.checked,
                                })
                              }
                            />
                            <span className="pp-switch-track" />
                          </label>
                        </td>
                        <td data-label="商品 / 基础货币">
                          <span className="pp-pair-field">
                            <input
                              aria-label={`商品 ${index + 1}`}
                              value={item.commodity}
                              disabled={busy || !canWrite}
                              title={
                                item.synthetic
                                  ? "估值等插件生成的合成商品，默认关闭"
                                  : undefined
                              }
                              onChange={(event) => {
                                const commodity =
                                  event.target.value.toUpperCase();
                                const currentDefaultFile = defaultPriceFile(
                                  item.commodity,
                                  item.quote,
                                  primaryCurrency,
                                );
                                change(index, {
                                  commodity,
                                  ticker: commodity,
                                  file:
                                    item.file === currentDefaultFile
                                      ? defaultPriceFile(
                                          commodity,
                                          item.quote,
                                          primaryCurrency,
                                        )
                                      : item.file,
                                  synthetic: undefined,
                                });
                              }}
                            />
                            {item.synthetic && (
                              <span
                                className="pp-synthetic-badge"
                                title="估值等插件生成的合成商品，默认关闭"
                              >
                                合成
                              </span>
                            )}
                          </span>
                        </td>
                        <td data-label="报价货币">
                          <input
                            aria-label={`报价货币 ${index + 1}`}
                            value={item.quote}
                            disabled={busy || !canWrite}
                            onChange={(event) => {
                              const quote = event.target.value.toUpperCase();
                              const currentDefaultFile = defaultPriceFile(
                                item.commodity,
                                item.quote,
                                primaryCurrency,
                              );
                              change(index, {
                                quote,
                                file:
                                  item.file === currentDefaultFile
                                    ? defaultPriceFile(
                                        item.commodity,
                                        quote,
                                        primaryCurrency,
                                      )
                                    : item.file,
                              });
                            }}
                          />
                        </td>
                        <td data-label="来源">
                          <select
                            aria-label={`来源 ${index + 1}`}
                            value={item.source}
                            disabled={busy || !canWrite}
                            title={
                              sourceDetails.get(item.source)?.description ??
                              "选择价格来源"
                            }
                            onChange={(event) =>
                              change(index, {
                                source: event.target.value,
                                fallbacks: undefined,
                                ticker:
                                  event.target.value === "beancount"
                                    ? `${item.commodity}-${item.quote}`
                                    : item.ticker,
                              })
                            }
                          >
                            {sourceOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td data-label="来源代码 / feed 别名">
                          <input
                            aria-label={`来源代码 ${index + 1}`}
                            value={item.ticker}
                            disabled={busy || !canWrite}
                            title={
                              sourceDetails.get(item.source)?.tickerHint ??
                              "来源代码或 feed 别名"
                            }
                            placeholder={
                              sourceDetails.get(item.source)?.tickerExample
                            }
                            onChange={(event) =>
                              change(index, { ticker: event.target.value })
                            }
                          />
                        </td>
                        <td data-label="输出文件">
                          <input
                            aria-label={`输出文件 ${index + 1}`}
                            value={item.file}
                            disabled={busy || !canWrite}
                            onChange={(event) =>
                              change(index, { file: event.target.value })
                            }
                          />
                        </td>
                        <td className="pp-col-remove" data-label="操作">
                          <div className="pp-row-actions">
                            <button
                              className="pp-row-history"
                              aria-label={`查看 ${item.commodity} / ${item.quote} 的全部价格`}
                              disabled={busy || !item.commodity || !item.quote}
                              onClick={() => openPriceHistory(item)}
                            >
                              价格
                            </button>
                            <button
                              className={`pp-row-fetch${rowBusy === index ? " is-busy" : ""}`}
                              aria-label={`抓取 ${item.commodity}`}
                              aria-busy={rowBusy === index}
                              title="只抓取这一行并展示结果，之后可点击“写入账本”"
                              disabled={busy}
                              onClick={() => void fetchOne(index, item)}
                            >
                              {rowBusy === index ? "抓取中…" : "抓取"}
                            </button>
                            <button
                              className="pp-remove"
                              aria-label={`移除 ${item.commodity}`}
                              disabled={busy || !canWrite}
                              onClick={() =>
                                setCatalog({
                                  ...catalog,
                                  instruments: catalog.instruments.filter(
                                    (_, position) => position !== index,
                                  ),
                                })
                              }
                            >
                              移除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleInstruments.length === 0 && (
                  <div className="pp-empty">
                    没有匹配的价格对，换个关键词或添加一组新配置。
                  </div>
                )}
              </div>
              <div className="pp-config-footer">
                <button
                  className={`pp-schedule-toggle${catalog.schedule.enabled ? " is-on" : ""}`}
                  aria-haspopup="dialog"
                  aria-controls="pp-schedule-dialog"
                  disabled={busy || !canWrite}
                  onClick={openScheduleDialog}
                >
                  <span className="pp-schedule-dot" aria-hidden="true" />
                  自动抓取
                  <small>
                    {catalog.schedule.enabled
                      ? catalog.schedule.time
                      : "已关闭"}
                  </small>
                </button>
                <button
                  className="pp-config-save"
                  onClick={() => void act("save")}
                  disabled={busy || !canWrite}
                >
                  保存配置
                </button>
              </div>
            </section>

            <section className="pp-panel pp-command-panel">
              <div className="pp-command-head">
                <div className="pp-panel-title">
                  <span className="pp-kicker">02 / Execute</span>
                  <h2>运行价格任务</h2>
                  <p>先查询确认，再写入账本；所有写入都经过仓库版本检查。</p>
                </div>
                <div className="pp-command-side">
                  <label className="pp-date-field">
                    <span>查询日期</span>
                    <input
                      type="date"
                      aria-label="查询日期，留空表示最新"
                      value={queryDate}
                      disabled={busy}
                      onChange={(event) => setQueryDate(event.target.value)}
                    />
                  </label>
                  <div className="pp-command-meta">
                    <span>来源最新日期</span>
                    <strong>{latestSourceDate ?? "等待同步"}</strong>
                  </div>
                  <div className="pp-actions">
                    <button onClick={() => void act("preview")} disabled={busy}>
                      查询价格
                    </button>
                    <button
                      className="pp-primary"
                      onClick={() => void act("write")}
                      disabled={busy || !canWrite}
                    >
                      {busy && rowBusy === null
                        ? progress
                          ? `处理中 ${progress.done}/${progress.total}`
                          : "正在处理…"
                        : "抓取并写入"}
                    </button>
                    {busy && !progress && rowBusy === null && (
                      <span className="pp-busy" role="status">
                        请稍候
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pp-command-body">
                {progress && (
                  <div
                    className="pp-progress-card"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="pp-progress-head">
                      <span>{progress.label}</span>
                      <strong>
                        {progress.done} / {progress.total}
                      </strong>
                    </div>
                    <div
                      className="pp-progress-track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={progress.total}
                      aria-valuenow={progress.done}
                    >
                      <i style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="pp-progress-detail">
                      {activeProgress
                        ? `正在抓取 ${progress.active
                            .map((item) => item.commodity)
                            .join("、")} · ${progress.active.length} 路并发`
                        : progress.done === progress.total
                          ? "抓取完成，正在整理结果…"
                          : "正在准备下一项…"}
                    </span>
                  </div>
                )}
                {message && (
                  <div className="pp-message" role="status" aria-live="polite">
                    {message}
                  </div>
                )}
                {result && (
                  <>
                    <div className="pp-result">
                      <div className="pp-result-head">
                        <span>本次查询结果</span>
                        <div className="pp-result-head-meta">
                          <span>
                            {result.prices.length} 条报价 · 跳过{" "}
                            {result.skipped} 条
                          </span>
                          {resultPendingWrite && (
                            <button
                              className="pp-result-write"
                              title={
                                canWrite
                                  ? "直接写入本次已查询到的价格，不重新请求来源"
                                  : "当前账本为只读"
                              }
                              disabled={busy || !canWrite}
                              aria-busy={resultWriting}
                              onClick={() => void writeResult()}
                            >
                              {resultWriting ? "正在写入…" : "写入账本"}
                            </button>
                          )}
                        </div>
                      </div>
                      {result.prices.length ? (
                        <div className="pp-result-list">
                          {result.prices.map((price, index) => (
                            <div
                              className="pp-result-row"
                              key={`${price.date}-${price.commodity}-${price.quote}-${index}`}
                            >
                              <span className="pp-result-date">
                                {price.date}
                              </span>
                              <span className="pp-result-pair">
                                {price.commodity}
                                <i>→</i>
                                {price.quote}
                              </span>
                              <span className="pp-result-amount">
                                {price.amount}
                                {price.conversion && (
                                  <i className="pp-conversion">
                                    {" "}
                                    · 1 {price.conversion.from} ={" "}
                                    {price.conversion.rate}{" "}
                                    {price.conversion.to}
                                  </i>
                                )}
                              </span>
                              <span className="pp-source-tag">
                                {price.providerSource ?? price.source}
                              </span>
                              <span
                                className="pp-result-file"
                                title={price.file}
                              >
                                {price.file}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pp-result-empty">本次没有返回报价</div>
                      )}
                    </div>
                    {result.errors.length > 0 && (
                      <div className="pp-error-list">
                        {result.errors.map((item, index) => (
                          <div className="pp-alert" key={index}>
                            {item.commodity}: {item.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="pp-guide" aria-labelledby="pp-guide-title">
              <div className="pp-guide-head">
                <span className="pp-kicker">Reference</span>
                <h2 id="pp-guide-title">来源与商品配置说明</h2>
              </div>
              <div className="pp-guide-grid">
                <article>
                  <h3>数据来源</h3>
                  <p>
                    天天基金输入六位基金代码（如 005827）。Yahoo
                    输入市场代码（如 AAPL、0700.HK）；Nasdaq 可作为美股备用源；
                    Coinbase / CoinCap 输入币种；Frankfurter 与 ECB
                    支持法币汇率；Beancount.io 输入 feed 别名。Yahoo 报价为 GBp
                    等最小单位时会自动换算成标准货币。CoinCap 需要{" "}
                    <code>COINCAP_API_KEY</code>，Beancount.io 需要{" "}
                    <code>BEANCOUNT_PRICES_COOKIE</code>。
                  </p>
                </article>
                <article>
                  <h3>文件路径</h3>
                  <p>
                    商品默认写入 <code>prices/AAPL.bean</code>；主货币报价写入{" "}
                    <code>prices/USD.bean</code>，非主货币报价写入{" "}
                    <code>prices/USD-to-GBP.bean</code>，也可使用{" "}
                    <code>prices/funds/FUND005827.bean</code>{" "}
                    等分类路径。已有日期和货币对的价格会跳过。
                  </p>
                </article>
                <article>
                  <h3>元数据优先级</h3>
                  <p>
                    支持 <code>price: "USD:yahoo/AAPL"</code> 或{" "}
                    <code>price: "CNY:eastmoneyfund/005827"</code>
                    。也支持逗号分隔的备用来源和 <code>^</code>{" "}
                    反向报价。页面保存的配置优先于账本元数据；新识别的商品会自动添加。
                  </p>
                </article>
                <article>
                  <h3>查询接口</h3>
                  <p>
                    页面可指定查询日期；API 额外支持 <code>/api/quote</code>{" "}
                    单笔查询、<code>/api/series</code> 日期区间序列和{" "}
                    <code>/api/capabilities</code>{" "}
                    来源能力列表。历史/序列能力取决于来源。
                  </p>
                </article>
              </div>
            </section>
          </>
        )}
        {historyTarget && (
          <div
            className="pp-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setHistoryTarget(null);
            }}
          >
            <section
              className="pp-history-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pp-history-dialog-title"
            >
              <div className="pp-dialog-head">
                <div>
                  <span className="pp-kicker">Stored prices</span>
                  <h2 id="pp-history-dialog-title">
                    {historyTarget.commodity} / {historyTarget.quote} 全部价格
                  </h2>
                </div>
                <button
                  className="pp-dialog-close"
                  aria-label="关闭价格记录"
                  autoFocus
                  onClick={() => setHistoryTarget(null)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              <div className="pp-history-body">
                <div className="pp-history-meta">
                  <span>账本中已写入的全部价格</span>
                  <strong>{history?.prices.length ?? 0} 条</strong>
                </div>
                {historyLoading ? (
                  <div className="pp-history-status" role="status">
                    正在读取价格记录…
                  </div>
                ) : historyError ? (
                  <div className="pp-alert" role="alert">
                    {historyError}
                  </div>
                ) : history && history.prices.length > 0 ? (
                  <div className="pp-history-table-scroll">
                    <table
                      className="pp-history-table"
                      aria-label={`${historyTarget.commodity} 对 ${historyTarget.quote} 的全部价格`}
                    >
                      <thead>
                        <tr>
                          <th scope="col">日期</th>
                          <th scope="col">价格</th>
                          <th scope="col">来源</th>
                          <th scope="col">文件</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.prices.map((price, index) => (
                          <tr
                            key={`${price.date}-${price.file}-${price.amount}-${index}`}
                          >
                            <td data-label="日期">{price.date}</td>
                            <td data-label="价格" className="pp-history-amount">
                              {price.amount} {price.quote}
                            </td>
                            <td data-label="来源">{price.source ?? "—"}</td>
                            <td data-label="文件" className="pp-history-file">
                              {price.file}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="pp-history-status">
                    账本里还没有这个价格对的历史记录。
                  </div>
                )}
              </div>
              <div className="pp-dialog-actions">
                <button onClick={() => setHistoryTarget(null)}>关闭</button>
              </div>
            </section>
          </div>
        )}
        {scheduleOpen && scheduleDraft && catalog && (
          <div
            className="pp-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeScheduleDialog();
            }}
          >
            <section
              className="pp-schedule-dialog"
              id="pp-schedule-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pp-schedule-dialog-title"
            >
              <div className="pp-dialog-head">
                <div>
                  <span className="pp-kicker">Automation / Daily</span>
                  <h2 id="pp-schedule-dialog-title">自动抓取设置</h2>
                </div>
                <button
                  className="pp-dialog-close"
                  aria-label="关闭自动抓取设置"
                  disabled={busy}
                  autoFocus
                  onClick={closeScheduleDialog}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              <div className="pp-dialog-body">
                <label className="pp-schedule-enable">
                  <span>启用每日自动抓取</span>
                  <span className="pp-switch">
                    <input
                      type="checkbox"
                      aria-label="启用自动抓取"
                      checked={scheduleDraft.enabled}
                      disabled={busy || !canWrite}
                      onChange={(event) =>
                        setScheduleDraft({
                          ...scheduleDraft,
                          enabled: event.target.checked,
                        })
                      }
                    />
                    <span className="pp-switch-track" />
                  </span>
                </label>
                <div className="pp-dialog-fields">
                  <label className="pp-schedule-field">
                    <span>每日时间</span>
                    <input
                      type="time"
                      value={scheduleDraft.time}
                      disabled={busy || !canWrite}
                      onChange={(event) =>
                        setScheduleDraft({
                          ...scheduleDraft,
                          time: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="pp-schedule-field">
                    <span>时区</span>
                    <input
                      aria-label="调度时区"
                      value={scheduleDraft.timezone}
                      disabled={busy || !canWrite}
                      onChange={(event) =>
                        setScheduleDraft({
                          ...scheduleDraft,
                          timezone: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <p className="pp-dialog-note">
                  保存后生效；执行时使用已保存的商品与货币对清单。错过的任务会在本地服务启动后补跑一次。
                </p>
                {error && (
                  <div className="pp-alert" role="alert">
                    {error}
                  </div>
                )}
              </div>
              <div className="pp-dialog-actions">
                <button disabled={busy} onClick={closeScheduleDialog}>
                  取消
                </button>
                <button
                  className="pp-primary"
                  disabled={busy || !canWrite}
                  onClick={() => void saveSchedule()}
                >
                  {busy ? "正在保存…" : "保存配置"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
