import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Mode = "regular" | "padded" | "valuation";
type Cell = {
  id: string;
  date: string;
  account: string;
  currency: string;
  amount: string;
  mode: Mode;
  file: string;
  line: number;
};
type Posting = { account: string; currency: string; amount: string };
type Transaction = {
  date: string;
  payee: string;
  narration: string;
  padding: boolean;
  postings: Posting[];
};
type ConfigDefaults = {
  version: 1;
  filters: string[] | null;
  closed?: boolean;
  empty?: boolean;
  asserted?: boolean;
  groupAccounts?: boolean;
};
type Data = {
  revision: string;
  config: ConfigDefaults | null;
  configPath: string;
  configExists: boolean;
  configRevision: string;
  configError: string | null;
  cells: Cell[];
  accounts: Array<{
    account: string;
    currencies: string[];
    openedAt: string;
    closedAt: string | null;
  }>;
  transactions: Transaction[];
  balances: Posting[];
};
type Row = { account: string; currency: string; closedAt: string | null };
type Props = {
  ledgerId: string;
  primaryCurrency: string;
  canWrite: boolean;
  settings: Record<string, unknown>;
  api: { fetchLocal(path: string, init?: RequestInit): Promise<Response> };
};
type View = {
  date: string;
  filters: string[];
  dates: string[];
  hiddenDates: string[];
  deltas: boolean;
  closed: boolean;
  empty: boolean;
  asserted: boolean;
  descending: boolean;
  groupAccounts: boolean;
  decimals: number;
  mode: Mode;
};
type Decimal = { coefficient: bigint; scale: number };

const MODES: Record<string, Mode> = {
  "!": "regular",
  "~": "padded",
  V: "valuation",
};
const SYMBOLS: Record<Mode, string> = {
  regular: "!",
  padded: "~",
  valuation: "V",
};
const MODE_LABELS: Record<Mode, string> = {
  regular: "普通断言",
  padded: "补差断言",
  valuation: "估值",
};
const DEFAULT_DIFFERENCE_ACCOUNT = "Equity:BadDebts";
const VIEW_URL_VERSION = 2;
const CATEGORIES = [
  "Assets",
  "Liabilities",
  "Expenses",
  "Income",
  "Equity",
  "Padding",
];
const COLORS: Record<string, string> = {
  Assets: "#73a9ed",
  Liabilities: "#68b9ac",
  Expenses: "#c7c95a",
  Income: "#82ba77",
  Equity: "#ad8bd5",
  Padding: "#af69cd",
};
const CATEGORY_LABELS: Record<string, string> = {
  Assets: "资产",
  Liabilities: "负债",
  Expenses: "支出",
  Income: "收入",
  Equity: "权益",
  Padding: "平衡",
};

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initialDifferenceAccount(settings: Record<string, unknown>) {
  const configured =
    typeof settings.pad_account === "string" ? settings.pad_account.trim() : "";
  return configured.startsWith("Equity:")
    ? configured
    : DEFAULT_DIFFERENCE_ACCOUNT;
}

function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

function decimal(value: string): Decimal | null {
  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/u.exec(
    value.replaceAll(",", "").trim(),
  );
  if (!match || value.length > 100) return null;
  return {
    coefficient:
      BigInt(`${match[2]}${match[3] ?? ""}`) * (match[1] === "-" ? -1n : 1n),
    scale: (match[3] ?? "").length,
  };
}

function decimalText(value: Decimal): string {
  const digits = (
    value.coefficient < 0n ? -value.coefficient : value.coefficient
  )
    .toString()
    .padStart(value.scale + 1, "0");
  const whole = value.scale ? digits.slice(0, -value.scale) : digits;
  const fraction = value.scale
    ? digits.slice(-value.scale).replace(/0+$/u, "")
    : "";
  return `${value.coefficient < 0n ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

function add(left: string, right: string): string {
  const first = decimal(left),
    second = decimal(right);
  if (!first || !second) return left;
  const scale = Math.max(first.scale, second.scale);
  return decimalText({
    coefficient:
      first.coefficient * 10n ** BigInt(scale - first.scale) +
      second.coefficient * 10n ** BigInt(scale - second.scale),
    scale,
  });
}

function subtract(left: string, right: string): string {
  const second = decimal(right);
  return second
    ? add(left, decimalText({ ...second, coefficient: -second.coefficient }))
    : left;
}

function formatted(amount: string, places: number): string {
  const parsed = decimal(amount);
  if (!parsed) return amount;
  const negative = parsed.coefficient < 0n;
  let magnitude = negative ? -parsed.coefficient : parsed.coefficient;
  if (parsed.scale > places) {
    const divisor = 10n ** BigInt(parsed.scale - places);
    magnitude = (magnitude + divisor / 2n) / divisor;
  } else magnitude *= 10n ** BigInt(places - parsed.scale);
  const digits = magnitude.toString().padStart(places + 1, "0");
  const whole = (places ? digits.slice(0, -places) : digits).replace(
    /\B(?=(\d{3})+(?!\d))/gu,
    ",",
  );
  return `${negative && magnitude !== 0n ? "-" : ""}${whole}${places ? `.${digits.slice(-places)}` : ""}`;
}

function parseInput(
  raw: string,
  fallback: Mode,
): { amount: string | null; mode: Mode } | null {
  const value = raw.replaceAll(",", "").trim();
  if (!value) return { amount: null, mode: fallback };
  const match = /^([+-]?\d+(?:\.\d+)?)\s*(~|!|V)?$/iu.exec(value);
  if (!match || !decimal(match[1])) return null;
  return {
    amount: decimalText(decimal(match[1])!),
    mode: match[2] ? MODES[match[2].toUpperCase()] : fallback,
  };
}

function key(account: string, currency: string, date = "") {
  return JSON.stringify([account, currency, date]);
}

function accountParts(account: string) {
  const parts = account.split(":");
  return {
    leaf: parts.at(-1) ?? account,
    parent: parts.slice(0, -1).join(":"),
  };
}

function initialView(settings: Record<string, unknown>): {
  view: View;
  fromUrl: boolean;
} {
  const defaults: View = {
    date: today(),
    filters:
      typeof settings.account_prefixes === "string"
        ? settings.account_prefixes
            .split(",")
            .map((prefix) => `^${prefix.trim()}(?::|$)`)
        : ["^Assets:", "^Liabilities:"],
    dates: [],
    hiddenDates: [],
    deltas: false,
    closed: false,
    empty: false,
    asserted: false,
    descending: false,
    groupAccounts: true,
    decimals: 2,
    mode: "padded",
  };
  try {
    const raw = new URLSearchParams(window.location.search).get("bt");
    if (!raw) return { view: defaults, fromUrl: false };
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object")
      return { view: defaults, fromUrl: false };
    for (const field of [
      "deltas",
      "closed",
      "asserted",
      "descending",
      "groupAccounts",
    ] as const)
      if (typeof value[field] === "boolean") defaults[field] = value[field];
    if (value.version === VIEW_URL_VERSION && typeof value.empty === "boolean")
      defaults.empty = value.empty;
    if (
      Array.isArray(value.filters) &&
      value.filters.every((item: unknown) => typeof item === "string")
    )
      defaults.filters = value.filters.slice(0, 20);
    if (Array.isArray(value.dates)) {
      defaults.dates = value.dates
        .filter((item: unknown) => typeof item === "string" && validDate(item))
        .slice(0, 30);
      if (!validDate(value.date ?? "") && defaults.dates.length) {
        defaults.date = defaults.dates.at(-1)!;
        defaults.dates = defaults.dates.filter(
          (date) => date !== defaults.date,
        );
      }
    }
    if (typeof value.date === "string" && validDate(value.date))
      defaults.date = value.date;
    if (Array.isArray(value.hiddenDates))
      defaults.hiddenDates = value.hiddenDates
        .filter((item: unknown) => typeof item === "string" && validDate(item))
        .slice(0, 100);
    if ([0, 2, 4, 6, 8].includes(value.decimals))
      defaults.decimals = value.decimals;
    if (Object.hasOwn(SYMBOLS, value.mode)) defaults.mode = value.mode;
    return { view: defaults, fromUrl: true };
  } catch {}
  return { view: defaults, fromUrl: false };
}

function Icon({
  name,
}: {
  name:
    | "settings"
    | "help"
    | "save"
    | "revert"
    | "sort"
    | "close"
    | "calendar"
    | "plus"
    | "refresh"
    | "chevron";
}) {
  const paths = {
    settings: (
      <>
        <path d="m9 3 1-2h4l1 2 2 1 2-.2 2 3-1 2v2l1 2-2 3-2-.2-2 1-1 2h-4l-1-2-2-1-2 .2-2-3 1-2V9L3 7l2-3 2 .2Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.1" />
      </>
    ),
    save: (
      <>
        <path d="M4 3h13l4 4v14H3V3Zm3 0v6h9V3M7 21v-8h10v8" />
      </>
    ),
    revert: (
      <>
        <path d="M4 9a8 8 0 1 1 0 7M4 3v6h6m2-2v5l3 2" />
      </>
    ),
    sort: (
      <>
        <path d="M7 4v16m-4-4 4 4 4-4M17 20V4m-4 4 4-4 4 4" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    refresh: (
      <>
        <path d="M20 6v5h-5M4 18v-5h5" />
        <path d="M18.5 9a7 7 0 0 0-11.7-2.3L4 11m16 2-2.8 4.3A7 7 0 0 1 5.5 15" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
  };
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function BeanTab({
  ledgerId,
  primaryCurrency,
  canWrite,
  settings,
  api,
}: Props) {
  const initialViewState = useRef(initialView(settings));
  const initialUrlView = useRef(initialViewState.current.fromUrl);
  const appliedConfig = useRef<string | null>(null);
  const [view, setView] = useState(initialViewState.current.view);
  const [data, setData] = useState<Data | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [rowModes, setRowModes] = useState<Record<string, Mode>>({});
  const [filterInput, setFilterInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [options, setOptions] = useState(false);
  const [help, setHelp] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [differenceAccount, setDifferenceAccount] = useState(() =>
    initialDifferenceAccount(settings),
  );
  const filtersReady =
    data === null
      ? !loading
      : !data.config ||
        initialUrlView.current ||
        appliedConfig.current !== null;
  const [selectedDelta, setSelectedDelta] = useState<{
    account: string;
    currency: string;
    from: string;
    to: string;
  } | null>(null);
  const [inspectorPosition, setInspectorPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const table = useRef<HTMLTableElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const dateMenu = useRef<HTMLDetailsElement>(null);
  const inspector = useRef<HTMLElement>(null);
  const ledgerPath = `/ledger/${ledgerId.split("/").map(encodeURIComponent).join("/")}`;
  const differenceAccounts = useMemo(
    () =>
      [
        ...new Set([
          differenceAccount,
          ...(data?.accounts ?? [])
            .map(({ account }) => account)
            .filter((account) => account.startsWith("Equity:")),
        ]),
      ].sort((left, right) => left.localeCompare(right, "en")),
    [data, differenceAccount],
  );
  const accountJournalHref = (account: string, time?: string) => {
    const search = new URLSearchParams({ account });
    if (time) search.set("time", time);
    return `${ledgerPath}/account/${encodeURIComponent(account)}?${search}`;
  };

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const menu = dateMenu.current;
      if (
        menu?.open &&
        event.target instanceof Node &&
        !menu.contains(event.target)
      )
        menu.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = dateMenu.current;
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    table.current?.querySelector<HTMLInputElement>("input:focus")?.select();
  }, [focusedCell]);

  useEffect(() => {
    if (!selectedDelta) return;
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        inspector.current?.contains(event.target)
      )
        return;
      setSelectedDelta(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedDelta(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedDelta]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "bt",
      JSON.stringify({ ...view, version: VIEW_URL_VERSION }),
    );
    window.history.replaceState(window.history.state, "", url);
  }, [view]);
  useLayoutEffect(() => {
    const config = data?.config;
    if (!config || initialUrlView.current) return;
    const signature = JSON.stringify(config);
    if (appliedConfig.current === signature) return;
    appliedConfig.current = signature;
    setView((current) => ({
      ...current,
      ...(config.filters ? { filters: config.filters } : {}),
      ...(typeof config.closed === "boolean" ? { closed: config.closed } : {}),
      ...(typeof config.empty === "boolean" ? { empty: config.empty } : {}),
      ...(typeof config.asserted === "boolean"
        ? { asserted: config.asserted }
        : {}),
      ...(typeof config.groupAccounts === "boolean"
        ? { groupAccounts: config.groupAccounts }
        : {}),
    }));
  }, [data?.config]);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    void api
      .fetchLocal(
        `/api-gateway/local/plugins/beantab/api?ledgerId=${encodeURIComponent(ledgerId)}`,
        { signal: controller.signal },
      )
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "无法加载余额");
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : "无法加载余额");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, ledgerId, refresh]);
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (Object.keys(drafts).length) event.preventDefault();
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [drafts]);

  const cells = useMemo(
    () =>
      new Map(
        (data?.cells ?? []).map((cell) => [
          key(cell.account, cell.currency, cell.date),
          cell,
        ]),
      ),
    [data],
  );
  const dateWarnings = useMemo(() => {
    const warnings = new Set<string>();
    for (const cell of data?.cells ?? []) {
      const fileDate = /(?:^|\/)(\d{4}-\d{2}-\d{2})\.bean$/u.exec(
        cell.file,
      )?.[1];
      if (fileDate && validDate(fileDate) && fileDate !== cell.date)
        warnings.add(
          `${cell.file} 中余额的日期为 ${cell.date}，与文件名 ${fileDate} 不一致。历史记录以余额指令的日期为准。`,
        );
    }
    return [...warnings];
  }, [data]);
  const availableDates = useMemo(() => {
    const history = [
      ...new Set(data?.cells.map((cell) => cell.date) ?? []),
    ].sort((left, right) => right.localeCompare(left));
    return [
      ...new Set([
        ...history,
        ...view.dates,
        view.date,
        ...Object.keys(drafts).map(
          (identity) => JSON.parse(identity)[2] as string,
        ),
      ]),
    ].sort((left, right) => right.localeCompare(left));
  }, [data, drafts, view.date, view.dates]);
  const dates = availableDates.filter(
    (date) => !view.hiddenDates.includes(date),
  );
  const dateKey = dates.join("|");
  useLayoutEffect(() => {
    const container = grid.current;
    const tableElement = table.current;
    if (!container || !tableElement) return;

    const showLatestDates = () => {
      container.scrollLeft = 0;
    };
    showLatestDates();
    if (typeof ResizeObserver !== "function") return;

    // ResizeObserver runs before paint; deferring this would expose a stale scroll position.
    const observer = new ResizeObserver(showLatestDates);
    observer.observe(container);
    observer.observe(tableElement);
    return () => observer.disconnect();
  }, [dateKey, view.deltas]);
  const rowData = useMemo(() => {
    const pairs = new Map<string, Row>();
    const accounts = new Map(
      (data?.accounts ?? []).map((account) => [account.account, account]),
    );
    const include = (account: string, currency: string) =>
      pairs.set(key(account, currency), {
        account,
        currency,
        closedAt: accounts.get(account)?.closedAt ?? null,
      });
    data?.cells.forEach((cell) => include(cell.account, cell.currency));
    data?.transactions.forEach((transaction) =>
      transaction.postings.forEach((posting) =>
        include(posting.account, posting.currency),
      ),
    );
    data?.accounts.forEach((account) => {
      if (account.currencies.length) {
        account.currencies.forEach((currency) =>
          include(account.account, currency),
        );
      } else if (
        ![...pairs.values()].some((row) => row.account === account.account)
      ) {
        include(account.account, primaryCurrency);
      }
    });
    const liveFilter = filterInput.trim();
    const activeFilters = liveFilter
      ? [...view.filters, liveFilter]
      : view.filters;
    let regexes: RegExp[];
    try {
      regexes = activeFilters.map((filter) => new RegExp(filter, "iu"));
    } catch {
      return {
        rows: [] as Row[],
        hidden: pairs.size,
        filterError: "正则表达式无效，请修改或删除筛选条件。",
      };
    }
    const rows = [...pairs.values()]
      .filter(
        (row) =>
          (!regexes.length ||
            regexes.some((regex) => regex.test(row.account))) &&
          (view.closed || !row.closedAt) &&
          (!view.asserted ||
            data?.cells.some(
              (cell) =>
                cell.account === row.account && cell.currency === row.currency,
            )) &&
          (view.empty ||
            data?.cells.some(
              (cell) =>
                cell.account === row.account && cell.currency === row.currency,
            ) ||
            data?.balances.some(
              (balance) =>
                balance.account === row.account &&
                balance.currency === row.currency &&
                balance.amount !== "0",
            )),
      )
      .sort(
        (left, right) =>
          (left.account.localeCompare(right.account) ||
            left.currency.localeCompare(right.currency)) *
          (view.descending ? -1 : 1),
      );
    return { rows, hidden: pairs.size - rows.length, filterError: null };
  }, [
    data,
    primaryCurrency,
    filterInput,
    view.filters,
    view.closed,
    view.empty,
    view.asserted,
    view.descending,
  ]);
  const balances = useMemo(() => {
    const result = new Map<string, string>();
    for (const date of dates)
      for (const transaction of data?.transactions ?? []) {
        if (transaction.date >= date) continue;
        for (const posting of transaction.postings) {
          const identity = key(posting.account, posting.currency, date);
          result.set(
            identity,
            add(result.get(identity) ?? "0", posting.amount),
          );
        }
      }
    return result;
  }, [data, dates]);
  const paddingAmounts = useMemo(() => {
    const result = new Map<string, string>();
    const history = [...(data?.cells ?? [])].sort((left, right) =>
      left.date.localeCompare(right.date),
    );
    for (const transaction of data?.transactions ?? []) {
      if (!transaction.padding) continue;
      const account = transaction.postings[0]?.account;
      for (const posting of transaction.postings) {
        if (posting.account !== account) continue;
        const assertion = history.find(
          (cell) =>
            cell.account === account &&
            cell.currency === posting.currency &&
            cell.date > transaction.date,
        );
        if (!assertion) continue;
        const identity = key(
          assertion.account,
          assertion.currency,
          assertion.date,
        );
        result.set(identity, add(result.get(identity) ?? "0", posting.amount));
      }
    }
    return result;
  }, [data]);
  const changes = useMemo(
    () =>
      Object.entries(drafts)
        .map(([identity, raw]) => {
          const [account, currency, date] = JSON.parse(identity) as string[],
            original = cells.get(identity),
            fallbackMode =
              original?.mode ?? rowModes[key(account, currency)] ?? view.mode;
          const value = parseInput(raw, fallbackMode);
          return { identity, original, value, account, currency, date };
        })
        .filter(
          (change) =>
            !change.value ||
            change.value.amount !== (change.original?.amount ?? null) ||
            change.value.mode !== (change.original?.mode ?? view.mode),
        ),
    [drafts, cells, rowModes, view.mode],
  );
  const invalid = changes.some((change) => !change.value);
  const edit = (identity: string, value: string) => {
    setDrafts((current) => ({ ...current, [identity]: value }));
    setNotice(null);
  };
  const save = async () => {
    if (!data || !changes.length || invalid || !canWrite) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/beantab/api",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: data.revision,
            differenceAccount,
            changes: changes.map((change) => ({
              id: change.original?.id,
              account: change.account,
              currency: change.currency,
              date: change.date,
              ...change.value,
            })),
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.error || "无法保存余额");
      setDrafts({});
      setNotice(
        `已将 ${changes.length} 个单元格保存到 ${payload.paths.join("、")}`,
      );
      setRefresh((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "无法保存余额");
    } finally {
      setSaving(false);
    }
  };
  const saveConfig = async () => {
    if (!data || !canWrite) return;
    setSavingConfig(true);
    setError(null);
    setNotice(null);
    const liveFilter = filterInput.trim();
    const filters = [
      ...new Set([...view.filters, ...(liveFilter ? [liveFilter] : [])]),
    ];
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/beantab/api/config",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: data.configRevision,
            config: {
              version: 1,
              account_filters: filters,
              show_closed: view.closed,
              show_empty: view.empty,
              asserted_only: view.asserted,
              group_accounts: view.groupAccounts,
            },
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.error || "无法保存默认视图配置");
      setFilterInput("");
      setView((current) => ({ ...current, filters }));
      appliedConfig.current = JSON.stringify(payload.config);
      setData((current) =>
        current
          ? {
              ...current,
              config: payload.config,
              configRevision: payload.configRevision,
              configExists: true,
              configError: null,
            }
          : current,
      );
      setNotice(`默认账户视图已保存到 ${payload.path}`);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "无法保存默认视图配置",
      );
    } finally {
      setSavingConfig(false);
    }
  };
  const addFilter = () => {
    const filter = filterInput.trim();
    if (!filter) return;
    setView((current) => ({
      ...current,
      filters: [...new Set([...current.filters, filter])],
    }));
    setFilterInput("");
  };
  const addDate = () => {
    if (!validDate(dateInput)) return;
    setView((current) => ({
      ...current,
      dates: [...new Set([...current.dates, dateInput])],
      hiddenDates: current.hiddenDates.filter((date) => date !== dateInput),
    }));
    setDateInput("");
  };
  const deltaItems = selectedDelta
    ? (data?.transactions ?? []).filter(
        (transaction) =>
          transaction.date >= selectedDelta.from &&
          transaction.date < selectedDelta.to &&
          transaction.postings.some(
            (posting) =>
              posting.account === selectedDelta.account &&
              posting.currency === selectedDelta.currency,
          ),
      )
    : [];
  function openDelta(
    event: React.MouseEvent<HTMLButtonElement>,
    row: Row,
    from: string,
    to: string,
  ) {
    const edge = 8;
    const gap = 12;
    const width = Math.min(480, Math.max(0, window.innerWidth - edge * 2));
    const height = Math.min(430, window.innerHeight * 0.58);
    const left = Math.min(
      Math.max(edge, event.clientX + gap),
      Math.max(edge, window.innerWidth - width - edge),
    );
    const below = event.clientY + gap;
    const top = Math.min(
      Math.max(
        edge,
        below + height > window.innerHeight - edge
          ? event.clientY - height - gap
          : below,
      ),
      Math.max(edge, window.innerHeight - height - edge),
    );
    setInspectorPosition({ left, top });
    setSelectedDelta({ ...row, from, to });
  }
  function delta(row: Row, from: string, to: string) {
    const totals = new Map<string, string>();
    for (const transaction of data?.transactions ?? []) {
      if (transaction.date < from || transaction.date >= to) continue;
      const own = transaction.postings.filter(
        (posting) =>
          posting.account === row.account && posting.currency === row.currency,
      );
      for (const posting of own) {
        const counterpart = transaction.padding
          ? "Padding"
          : (transaction.postings
              .find(
                (other) =>
                  other.account !== row.account &&
                  ["Expenses", "Income"].includes(other.account.split(":")[0]),
              )
              ?.account.split(":")[0] ??
            transaction.postings
              .find((other) => other.account !== row.account)
              ?.account.split(":")[0] ??
            "Equity");
        totals.set(
          counterpart,
          add(totals.get(counterpart) ?? "0", posting.amount),
        );
      }
    }
    const entries = [...totals].filter(([, amount]) => amount !== "0"),
      max = Math.max(
        1,
        ...entries.map(([, amount]) => Math.abs(Number(amount))),
      );
    return (
      <button
        type="button"
        className="bt-delta"
        tabIndex={view.deltas ? undefined : -1}
        aria-label={`查看 ${row.account} ${row.currency} 从 ${from} 到 ${to} 的交易`}
        onClick={(event) => openDelta(event, row, from, to)}
      >
        {entries.length ? (
          entries.map(([category, amount]) => (
            <span
              key={category}
              title={`${CATEGORY_LABELS[category] ?? category}：${formatted(amount, view.decimals)} ${row.currency}`}
              style={{
                background: COLORS[category] ?? COLORS.Equity,
                flexGrow: Math.abs(Number(amount)) / max + 0.3,
              }}
            >
              {formatted(amount, 0)}
            </span>
          ))
        ) : (
          <span className="bt-no-change">—</span>
        )}
      </button>
    );
  }
  const displayedRows = useMemo(() => {
    const currencies = new Map<string, string[]>();
    for (const row of rowData.rows)
      currencies.set(row.account, [
        ...(currencies.get(row.account) ?? []),
        row.currency,
      ]);
    const seen = new Set<string>();
    return rowData.rows.map((row, rowIndex) => {
      const first = !seen.has(row.account);
      seen.add(row.account);
      return {
        row,
        rowIndex,
        accountSpan: first ? currencies.get(row.account)!.length : null,
        currencies: first ? currencies.get(row.account)! : [],
      };
    });
  }, [rowData.rows]);

  return (
    <section className="beantab-page" aria-label="BeanTab 余额对账表">
      <style>{`
      .beantab-page .bt-account-currencies{overflow:hidden;color:var(--bt-blue);font:9.5px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:650;letter-spacing:.035em;text-overflow:ellipsis}
      .beantab-page{width:100%;max-width:100%;min-width:0;min-height:0;flex:1;display:flex;flex-direction:column;gap:16px;color:var(--foreground,#20231f);font:inherit;--bt-surface:var(--background,#fff);--bt-card:var(--card,#fff);--bt-line:var(--border,#ddd);--bt-muted:var(--muted-foreground,#777);--bt-subtle:color-mix(in srgb,var(--muted,#f2f3ef) 52%,var(--bt-card));--bt-row-alt:color-mix(in srgb,var(--muted,#f2f3ef) 42%,var(--bt-card));--bt-row-hover:color-mix(in srgb,var(--primary,#2b7e00) 6%,var(--bt-card));--bt-green:var(--gain,#327b45);--bt-red:var(--loss,var(--destructive,#c54));--bt-blue:var(--chart-7,#5e86c4);--bt-account-width:clamp(150px,22cqi,260px);--bt-mode-width:56px;--bt-currency-width:clamp(104px,11cqi,120px);container-name:beantab;container-type:inline-size}
      .beantab-page *{box-sizing:border-box}.beantab-page button,.beantab-page input,.beantab-page select{font:inherit;color:inherit}.beantab-page button{cursor:pointer}.beantab-page button:disabled{cursor:default;opacity:.45}.beantab-page a{color:inherit}
      .bt-title{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:2px 2px 0}.bt-heading{display:flex;min-width:0;flex-direction:column;gap:4px}.bt-eyebrow{display:flex;align-items:center;gap:7px;color:var(--bt-muted);font-size:10px;font-weight:650;letter-spacing:.1em;text-transform:uppercase}.bt-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:var(--primary,#2b7e00);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary,#2b7e00) 13%,transparent)}.bt-title-row{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.bt-title h1{margin:0;font-size:26px;line-height:1.15;font-weight:700;letter-spacing:-.025em}.bt-description{color:var(--bt-muted);font-size:12.5px;line-height:1.4}.bt-summary{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.bt-summary>span{display:inline-flex;align-items:center;gap:5px;min-height:30px;padding:5px 9px;border:1px solid var(--bt-line);border-radius:7px;background:var(--bt-card);color:var(--bt-muted);font-size:11px;line-height:1;white-space:nowrap;box-shadow:0 1px 2px #00000008}.bt-summary strong{color:var(--foreground,#20231f);font-size:12px;font-variant-numeric:tabular-nums}.bt-summary-state{font-weight:600}.bt-summary-dot{width:6px;height:6px;border-radius:50%;background:var(--bt-green)}.bt-summary-state-pending{color:color-mix(in srgb,var(--chart-3,#a36a10) 88%,var(--foreground,#20231f))}.bt-summary-state-pending .bt-summary-dot{background:var(--chart-3,#a36a10)}
      .bt-workspace{display:flex;flex:1;min-width:0;min-height:0;flex-direction:column;gap:12px}.bt-toolbar{display:grid;grid-template-columns:minmax(280px,1.55fr) minmax(230px,1fr) auto;align-items:start;gap:12px;padding:14px;border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card);box-shadow:0 1px 2px #00000008,0 8px 24px #14201807}.bt-filter,.bt-dates{min-width:0}.bt-label{display:block;margin:0 0 6px 1px;color:var(--bt-muted);font-size:11px;font-weight:650;line-height:1.2}.bt-chips{display:flex;align-items:center;gap:6px;min-height:42px;flex-wrap:wrap;padding:6px 8px;border:1px solid var(--bt-line);border-radius:8px;background:var(--bt-surface);transition:border-color .15s ease,box-shadow .15s ease}.bt-chips:focus-within{border-color:var(--ring,#739ee8);outline:0;box-shadow:0 0 0 3px color-mix(in srgb,var(--ring,#739ee8) 16%,transparent)}.bt-chip{display:inline-flex;align-items:center;gap:3px;padding:4px 5px 4px 7px;border:1px solid color-mix(in srgb,var(--primary,#2b7e00) 18%,var(--bt-line));border-radius:6px;background:color-mix(in srgb,var(--primary,#2b7e00) 8%,var(--bt-card));font:10.5px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}.bt-chip button{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;padding:0;border:0;border-radius:4px;background:none;color:var(--bt-muted)}.bt-chip button:hover{background:color-mix(in srgb,var(--foreground,#20231f) 8%,transparent);color:var(--foreground,#20231f)}.bt-chip svg{width:12px;height:12px}.bt-chips input{flex:1;width:150px;min-width:120px;min-height:26px;padding:0 2px;border:0;outline:0;background:none;font-size:12.5px}.bt-chips input::placeholder{color:var(--bt-muted);opacity:.78}.bt-hint{display:block;margin:5px 0 0 1px;color:var(--bt-muted);font-size:10.5px;line-height:1.45}.bt-tools{display:flex;align-self:start;align-items:center;gap:6px;margin:19px 0 0}.bt-tool-button,.bt-delta-toggle{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:42px;padding:0 12px;border:1px solid var(--bt-line);border-radius:8px;background:var(--bt-surface);font-size:11.5px!important;font-weight:600;white-space:nowrap;transition:background .15s ease,border-color .15s ease,color .15s ease}.bt-tool-button:hover,.bt-tool-button[aria-expanded=true],.bt-delta-toggle:hover,.bt-delta-toggle-active{border-color:color-mix(in srgb,var(--primary,#2b7e00) 28%,var(--bt-line));background:color-mix(in srgb,var(--primary,#2b7e00) 8%,var(--bt-card));color:var(--primary,#2b7e00)}.bt-delta-toggle{cursor:pointer}.bt-delta-toggle input{width:14px;height:14px;margin:0;accent-color:var(--primary,#2b7e00)}.bt-delta-label-short{display:none}.bt-tool-button svg{width:16px;height:16px}.bt-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;border-radius:6px;background:none}.bt-icon:hover,.bt-icon[aria-expanded=true]{background:var(--muted,#eee)}.bt-icon svg{width:16px;height:16px}
      .bt-options,.bt-help{padding:14px;border:1px solid var(--bt-line);border-radius:10px;background:var(--bt-subtle);font-size:12px}.bt-options{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.bt-options label{display:flex;align-items:center;gap:7px;min-height:34px;padding:6px 9px;border:1px solid color-mix(in srgb,var(--bt-line) 75%,transparent);border-radius:7px;background:var(--bt-card);font-size:11.5px;font-weight:550}.bt-options input[type=checkbox],.bt-date-list input[type=checkbox]{accent-color:var(--primary,#2b7e00)}.bt-options input:not([type=checkbox]),.bt-options select{max-width:240px;padding:5px 7px;border:1px solid var(--bt-line);border-radius:5px;background:var(--bt-surface);font-size:12px}.bt-help{display:grid;gap:7px;line-height:1.65}.bt-help p{margin:0}.bt-help code{padding:1px 5px;border:1px solid var(--bt-line);border-radius:4px;background:var(--bt-card);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .bt-status{display:flex;align-items:center;gap:8px;margin:0;padding:10px 12px;border:1px solid var(--bt-line);border-radius:8px;background:var(--bt-subtle);font-size:12px;line-height:1.45}.bt-status .bt-icon{margin-left:auto;flex:0 0 28px;width:28px;height:28px}.bt-error{border-color:color-mix(in srgb,var(--bt-red) 28%,var(--bt-line));background:color-mix(in srgb,var(--bt-red) 8%,var(--bt-card));color:var(--bt-red)}.bt-success{border-color:color-mix(in srgb,var(--bt-green) 30%,var(--bt-line));background:color-mix(in srgb,var(--bt-green) 9%,var(--bt-card));color:var(--bt-green)}.bt-warning-status{border-color:color-mix(in srgb,var(--chart-3,#a36a10) 32%,var(--bt-line));background:color-mix(in srgb,var(--chart-3,#a36a10) 9%,var(--bt-card))}.bt-readonly{color:var(--bt-muted)}
      .bt-grid-wrap{position:relative;width:100%;max-width:100%;min-width:0;min-height:220px;flex:1;isolation:isolate;overflow:auto;overflow-anchor:none;overscroll-behavior:contain;scrollbar-color:color-mix(in srgb,var(--bt-muted) 42%,transparent) var(--bt-surface);scrollbar-width:thin;border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card);box-shadow:0 1px 2px #00000008}.bt-grid{border-collapse:separate;border-spacing:0;width:100%;min-width:100%;table-layout:fixed;font-size:13px;--bt-expand:.28s cubic-bezier(.22,.8,.28,1);transition:min-width var(--bt-expand)}.bt-grid th,.bt-grid td{height:54px;padding:0;border-bottom:1px solid var(--bt-line);background:var(--bt-card);white-space:nowrap}.bt-grid th{position:sticky;top:0;z-index:5;height:54px;text-align:left;background:var(--bt-surface);box-shadow:inset 0 -1px var(--bt-line);font-size:11px;font-weight:650}.bt-grid tbody tr:nth-child(even) td{background:var(--bt-row-alt)}.bt-grid tbody tr:hover td{background:var(--bt-row-hover)}.bt-grid tr:last-child td{border-bottom:0}
      .bt-grid .bt-account{position:sticky;left:0;z-index:2;width:var(--bt-account-width);padding:0 14px}.bt-grid th.bt-account{z-index:8}.bt-account a{display:flex;align-items:center;gap:10px;min-width:0;height:100%;text-decoration:none}.bt-account a:hover .bt-account-leaf{text-decoration:underline;text-underline-offset:2px}.bt-account-dot{display:block;flex:0 0 8px;width:8px;height:8px;border-radius:3px;background:var(--bt-blue);box-shadow:0 0 0 3px color-mix(in srgb,currentColor 8%,transparent)}.bt-account-copy{display:flex;min-width:0;flex:1;flex-direction:column;justify-content:center;gap:1px}.bt-account-leaf{overflow:hidden;color:var(--foreground,#20231f);font-size:13px;font-weight:650;line-height:1.35;text-overflow:ellipsis}.bt-account-parent{overflow:hidden;color:var(--bt-muted);font-size:10.5px;line-height:1.35;text-overflow:ellipsis}.bt-grid .bt-mode{position:sticky;left:var(--bt-account-width);z-index:2;width:var(--bt-mode-width);text-align:center;color:var(--bt-muted);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}.bt-grid .bt-mode select{width:100%;height:53px;padding:0 5px;border:0;border-radius:5px;outline:0;background:transparent;color:inherit;font:inherit;text-align:center;cursor:pointer;appearance:none;-webkit-appearance:none}.bt-grid .bt-mode select:hover,.bt-grid .bt-mode select:focus-visible{background:var(--bt-row-hover);color:var(--bt-blue)}.bt-grid .bt-mode select[data-overridden=true]{color:var(--bt-blue);font-weight:750}.bt-grid .bt-currency{position:sticky;left:calc(var(--bt-account-width) + var(--bt-mode-width));z-index:2;width:var(--bt-currency-width);overflow:hidden;padding:0 9px;border-right:1px solid var(--bt-line);color:var(--bt-blue);font-size:10.5px;font-weight:700;letter-spacing:.035em;text-overflow:ellipsis;box-shadow:4px 0 8px -7px #0009}.bt-grid th.bt-mode,.bt-grid th.bt-currency{z-index:8}
      .bt-grid th.bt-account button{display:flex;align-items:center;gap:7px;padding:0;border:0;background:none;font-size:11px;font-weight:650}.bt-grid th.bt-account button svg{width:14px;height:14px;color:var(--bt-muted)}.bt-date-head{padding:0 12px!important;text-align:right!important;font-variant-numeric:tabular-nums}.bt-date-head span{display:block;margin:0 0 2px;color:var(--bt-muted);font-size:8.5px;font-weight:650;letter-spacing:.075em;line-height:1;text-transform:uppercase}.bt-date-head strong{display:block;color:var(--foreground,#20231f);font-size:11px;font-weight:650;line-height:1.25}.bt-delta-column{transition:width var(--bt-expand)}.bt-delta-head,.bt-delta-cell{overflow:hidden;transition:opacity var(--bt-expand)}.bt-grid[data-deltas=false] .bt-delta-head,.bt-grid[data-deltas=false] .bt-delta-cell{opacity:0;pointer-events:none}.bt-delta-head>div{width:180px;padding:0 8px}.bt-delta-head{padding:0!important;text-align:center!important;font-size:9px!important;line-height:1.25}.bt-delta-head span{display:block;margin-bottom:2px;color:var(--bt-muted);font-size:8px;letter-spacing:.07em;text-transform:uppercase}.bt-delta-head strong{font-size:9px;font-weight:550;color:var(--bt-muted)}
      .bt-grid td.bt-value{position:relative}.bt-value input{width:100%;height:53px;padding:0 22px 0 13px;border:0;outline:0;background:transparent;text-align:right;font:13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums;letter-spacing:-.015em;color:var(--foreground,#222)}.bt-value input::placeholder{color:var(--bt-muted);font-weight:400;opacity:.55}.bt-value input:focus{outline:0;background:color-mix(in srgb,var(--ring,#739ee8) 7%,var(--bt-card));box-shadow:inset 0 0 0 2px var(--ring,#739ee8);color:var(--foreground,#222)}.bt-value.bt-assertion input{color:var(--bt-green);font-weight:700}.bt-value.bt-zero input:not(:focus){color:var(--bt-muted);opacity:.62}.bt-value.bt-edited{background:color-mix(in srgb,var(--chart-3,#b88425) 16%,var(--bt-card))!important}.bt-value.bt-invalid{box-shadow:inset 0 -2px var(--bt-red)}.bt-warning{position:absolute;left:8px;top:20px;z-index:1;color:var(--chart-3,#b88425);font-size:10px;pointer-events:none}.bt-value.bt-mismatch input{padding-left:23px}.bt-cell-mode{position:absolute;right:7px;top:18px;padding:2px 3px;border-radius:3px;background:color-mix(in srgb,var(--bt-card) 76%,transparent);color:var(--bt-muted);font:9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none}.bt-delta{display:flex;align-items:center;gap:2px;width:100%;height:53px;padding:8px;border:0;background:none;opacity:.9}.bt-delta span{border-radius:3px;min-width:22px;overflow:hidden;padding:4px 2px;color:#193127;font-size:9px;text-align:center}.bt-delta .bt-no-change{width:100%;background:none;color:var(--bt-muted)}.bt-delta:hover{background:var(--bt-row-hover);opacity:1}.bt-value.bt-with-difference{height:70px}.bt-with-difference input{height:44px}.bt-difference{display:block;overflow:hidden;padding:0 12px 7px;text-overflow:ellipsis;color:var(--bt-muted);font:10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:right;font-variant-numeric:tabular-nums}.bt-difference[data-sign=positive]{color:var(--bt-green)}.bt-difference[data-sign=negative]{color:var(--bt-red)}.bt-value.bt-with-difference .bt-cell-mode{top:14px}
      .bt-empty{padding:32px 20px!important;text-align:center;color:var(--bt-muted);white-space:normal!important}.bt-empty button{margin-top:12px}
      .bt-footer{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:14px;min-height:54px;padding:8px 10px 8px 12px;border:1px solid var(--bt-line);border-radius:10px;background:var(--bt-card);box-shadow:0 1px 2px #00000008;color:var(--bt-muted);font-size:11.5px}.bt-footer-left{display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-width:0}.bt-legend{display:flex;gap:4px;flex-wrap:wrap}.bt-legend span{padding:3px 6px;border-radius:4px;color:#18231d;font-size:9px;font-weight:600}.bt-count{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.bt-count strong{color:var(--foreground,#20231f);font-variant-numeric:tabular-nums}.bt-footer-left>strong{padding:4px 7px;border-radius:5px;background:color-mix(in srgb,var(--chart-3,#a36a10) 12%,var(--bt-card));color:color-mix(in srgb,var(--chart-3,#a36a10) 88%,var(--foreground,#20231f));font-weight:650}.bt-actions{display:flex;align-items:center;gap:8px;margin-left:auto}.bt-save-state{white-space:nowrap;font-size:10.5px}.bt-save-pending{color:color-mix(in srgb,var(--chart-3,#a36a10) 88%,var(--foreground,#20231f));font-weight:600}.bt-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:7px 12px;border:1px solid var(--bt-line);border-radius:7px;background:var(--bt-surface);font-size:11.5px!important;font-weight:650;letter-spacing:.02em;white-space:nowrap;transition:background .15s ease,border-color .15s ease,transform .1s ease}.bt-button:hover:not(:disabled){border-color:color-mix(in srgb,var(--foreground,#20231f) 22%,var(--bt-line));background:var(--muted,#eee)}.bt-button:active:not(:disabled){transform:translateY(1px)}.bt-button svg{width:14px;height:14px}.bt-button.bt-primary{border-color:transparent;background:var(--primary,#32624c);color:var(--primary-foreground,#fff);box-shadow:0 1px 2px color-mix(in srgb,var(--primary,#32624c) 30%,transparent)}.bt-button.bt-primary:hover:not(:disabled){background:color-mix(in srgb,var(--primary,#32624c) 88%,#000)}
      .bt-date-menu{position:relative}.bt-date-menu summary{display:flex;align-items:center;justify-content:space-between;gap:10px;height:42px;padding:0 11px;border:1px solid var(--bt-line);border-radius:8px;background:var(--bt-surface);font-size:12px;font-weight:550;list-style:none;cursor:pointer}.bt-date-menu summary::-webkit-details-marker{display:none}.bt-date-menu summary:hover{border-color:color-mix(in srgb,var(--primary,#2b7e00) 30%,var(--bt-line))}.bt-date-menu[open] summary{border-color:var(--ring,#739ee8);box-shadow:0 0 0 3px color-mix(in srgb,var(--ring,#739ee8) 13%,transparent)}.bt-date-summary-copy{display:flex;align-items:center;gap:8px;min-width:0}.bt-date-summary-copy svg{width:15px;height:15px;color:var(--bt-muted)}.bt-date-menu summary>svg{width:14px;height:14px;color:var(--bt-muted);transition:transform .15s ease}.bt-date-menu[open] summary>svg{transform:rotate(180deg)}.bt-date-menu-panel{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:40;padding:12px;border:1px solid var(--bt-line);border-radius:10px;background:var(--popover,var(--bt-card));box-shadow:0 18px 48px #0002,0 2px 8px #00000014}.bt-date-menu-actions{display:flex;gap:6px}.bt-date-menu-actions button{min-height:30px;padding:4px 8px;border:1px solid var(--bt-line);border-radius:6px;background:var(--bt-card);font-size:10.5px;font-weight:600}.bt-date-menu-actions button:hover{background:var(--muted,#eee)}.bt-date-list{display:grid;gap:2px;max-height:240px;margin:9px 0;overflow:auto}.bt-date-list label{display:flex;align-items:center;gap:9px;padding:7px 8px;border-radius:6px;font-size:11.5px}.bt-date-list label:hover{background:var(--muted,#eee)}.bt-date-list input{width:14px;height:14px}.bt-date-add{display:flex;align-items:center;gap:6px;padding-top:10px;border-top:1px solid var(--bt-line)}.bt-date-add input{flex:1;min-width:0;height:32px;padding:5px 8px;border:1px solid var(--bt-line);border-radius:6px;background:var(--bt-surface);font:11.5px ui-monospace,SFMono-Regular,Menlo,monospace}.bt-date-add .bt-icon{flex:0 0 32px;width:32px;height:32px}
      .bt-inspector{position:fixed;z-index:30;display:flex;flex-direction:column;width:min(480px,calc(100vw - 16px));max-height:min(58dvh,430px);padding:14px;border:1px solid var(--bt-line);border-radius:12px;background:var(--popover,var(--bt-card));box-shadow:0 24px 64px #0003,0 2px 8px #00000018;font-size:12px}.bt-inspector header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:10px;border-bottom:1px solid var(--bt-line)}.bt-inspector h2{margin:0;font-size:13px;line-height:1.45;font-weight:650;white-space:normal}.bt-inspector a{color:var(--bt-blue);font-size:11.5px;font-weight:600;text-decoration:none}.bt-inspector a:hover{text-decoration:underline}.bt-inspector-list{flex:1;min-height:0;max-height:none;margin:4px 0 10px;overflow:auto}.bt-inspector article{padding:10px 0;border-bottom:1px solid var(--bt-line);line-height:1.45}.bt-inspector article:last-child{border-bottom:0}.bt-inspector article strong{font-size:11.5px}.bt-inspector ul{margin:5px 0 0;padding-left:18px;font:10.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}.bt-inspector p{color:var(--bt-muted)}
      .bt-grid-wrap::-webkit-scrollbar{width:10px;height:10px}.bt-grid-wrap::-webkit-scrollbar-track{background:var(--bt-surface)}.bt-grid-wrap::-webkit-scrollbar-thumb{border:2px solid var(--bt-surface);border-radius:8px;background:color-mix(in srgb,var(--bt-muted) 44%,transparent)}.bt-grid-wrap::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb,var(--bt-muted) 62%,transparent)}
      .beantab-page .bt-delta-toggle input[type=checkbox],.beantab-page .bt-options input[type=checkbox],.beantab-page .bt-date-list input[type=checkbox]{display:inline-grid;place-content:center;flex:0 0 15px;width:15px;height:15px;margin:0;padding:0;border:1px solid color-mix(in srgb,var(--bt-muted) 52%,var(--bt-line));border-radius:4px;background:var(--bt-card);color:var(--primary-foreground,#fff);cursor:pointer;appearance:none;-webkit-appearance:none;transition:background .12s ease,border-color .12s ease,box-shadow .12s ease}
      .beantab-page .bt-delta-toggle input[type=checkbox]::before,.beantab-page .bt-options input[type=checkbox]::before,.beantab-page .bt-date-list input[type=checkbox]::before{content:"";width:7px;height:4px;border:solid currentColor;border-width:0 0 2px 2px;transform:rotate(-45deg) scale(0);transition:transform .12s ease}
      .beantab-page .bt-delta-toggle input[type=checkbox]:hover:not(:disabled),.beantab-page .bt-options input[type=checkbox]:hover:not(:disabled),.beantab-page .bt-date-list input[type=checkbox]:hover:not(:disabled){border-color:var(--primary,#2b7e00)}
      .beantab-page .bt-delta-toggle input[type=checkbox]:checked,.beantab-page .bt-options input[type=checkbox]:checked,.beantab-page .bt-date-list input[type=checkbox]:checked{border-color:var(--primary,#2b7e00);background:var(--primary,#2b7e00)}
      .beantab-page .bt-delta-toggle input[type=checkbox]:checked::before,.beantab-page .bt-options input[type=checkbox]:checked::before,.beantab-page .bt-date-list input[type=checkbox]:checked::before{transform:rotate(-45deg) scale(1)}
      .beantab-page .bt-delta-toggle input[type=checkbox]:focus-visible,.beantab-page .bt-options input[type=checkbox]:focus-visible,.beantab-page .bt-date-list input[type=checkbox]:focus-visible{outline:2px solid var(--ring,#739ee8);outline-offset:2px}
      .beantab-page .bt-delta-toggle input[type=checkbox]:disabled,.beantab-page .bt-date-list input[type=checkbox]:disabled{background:var(--bt-subtle);opacity:.55}
      @container beantab (max-width:1000px){.bt-toolbar{grid-template-columns:minmax(0,1fr) auto}.bt-filter{grid-column:1/-1}.bt-dates{grid-column:1}.bt-tools{grid-column:2}.bt-description{display:none}}
      @container beantab (max-width:760px){.bt-workspace{--bt-account-width:clamp(145px,26cqi,195px);--bt-mode-width:52px;--bt-currency-width:110px}.bt-page-head,.bt-title{align-items:flex-start}.bt-toolbar{grid-template-columns:minmax(0,1fr) auto}.bt-dates{grid-column:1}.bt-tools{grid-column:2;align-self:start;justify-content:flex-end}.bt-summary{width:100%}.bt-summary>span{flex:1;justify-content:center}.bt-footer{align-items:stretch;flex-direction:column;gap:8px}.bt-actions{width:100%;justify-content:flex-end}.bt-save-state{margin-right:auto}.bt-grid-wrap{min-height:260px}}
      @container beantab (max-width:560px){.bt-workspace{--bt-account-width:clamp(135px,28cqi,165px);--bt-mode-width:48px;--bt-currency-width:108px}.bt-hint{display:none}.bt-title h1{font-size:23px}.bt-toolbar{padding:11px}.bt-tool-button{width:42px;padding:0}.bt-tool-button span{display:none}.bt-delta-toggle{height:42px;padding:0 9px}.bt-delta-label-full{display:none}.bt-delta-label-short{display:inline}.bt-summary>span{min-width:0;padding:5px 7px;font-size:10px}.bt-footer-left{gap:8px}.bt-actions{margin-left:0}.bt-actions .bt-button{flex:1}.bt-save-state{display:none}.bt-date-menu-panel{right:auto;width:min(340px,calc(100cqw - 24px))}.bt-inspector{max-height:68dvh;padding:12px}.bt-grid{font-size:12px}.bt-grid th,.bt-grid td{height:52px}.bt-account-leaf{font-size:12px}.bt-account-parent{font-size:10px}.bt-grid .bt-currency{padding:0 7px;font-size:10px;letter-spacing:.02em}.bt-value input{height:51px;padding:0 20px 0 10px;font-size:12px}.bt-value.bt-with-difference{height:66px}.bt-with-difference input{height:40px}}
      @media(prefers-reduced-motion:reduce){.beantab-page *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
    `}</style>
      <header className="bt-title">
        <div className="bt-heading">
          <span className="bt-eyebrow">
            <span className="bt-eyebrow-dot" aria-hidden="true" />
            对账工作区
          </span>
          <div className="bt-title-row">
            <h1>BeanTab</h1>
            <span className="bt-description">核对账单余额与账本记录。</span>
          </div>
        </div>
        <div className="bt-summary" aria-label="工作区概览">
          <span>
            <strong>{data?.accounts.length ?? 0}</strong> 个账户
          </span>
          <span>
            <strong>{dates.length}</strong> 个日期
          </span>
          <span
            className={
              changes.length
                ? "bt-summary-state bt-summary-state-pending"
                : "bt-summary-state"
            }
          >
            <span className="bt-summary-dot" aria-hidden="true" />
            {changes.length
              ? `${changes.length} 项未保存`
              : canWrite
                ? "可编辑"
                : "只读"}
          </span>
        </div>
      </header>
      <div className="bt-workspace">
        <div className="bt-toolbar">
          <div className="bt-filter">
            <label className="bt-label" htmlFor="bt-account-filter">
              账户筛选
            </label>
            <div className="bt-chips">
              {filtersReady &&
                view.filters.map((filter) => (
                  <span className="bt-chip" key={filter}>
                    {filter}
                    <button
                      type="button"
                      aria-label={`移除筛选条件 ${filter}`}
                      onClick={() =>
                        setView((current) => ({
                          ...current,
                          filters: current.filters.filter(
                            (item) => item !== filter,
                          ),
                        }))
                      }
                    >
                      <Icon name="close" />
                    </button>
                  </span>
                ))}
              <input
                id="bt-account-filter"
                value={filterInput}
                placeholder="输入正则表达式即时筛选（例如 ^Assets:.*）"
                onChange={(event) => setFilterInput(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addFilter();
                  }
                }}
              />
            </div>
            <span className="bt-hint">
              输入时立即筛选账户 · 输入条件与固定条件之间为或关系 · 按 Enter
              固定为筛选条件
            </span>
          </div>
          <div className="bt-dates">
            <span className="bt-label" id="bt-dates-label">
              日期
            </span>
            <details className="bt-date-menu" ref={dateMenu}>
              <summary aria-labelledby="bt-dates-label bt-dates-summary">
                <span className="bt-date-summary-copy">
                  <Icon name="calendar" />
                  <span id="bt-dates-summary">
                    {dates.length === availableDates.length
                      ? `全部日期（${dates.length}）`
                      : `${dates.length} / ${availableDates.length} 个日期`}
                  </span>
                </span>
                <Icon name="chevron" />
              </summary>
              <div className="bt-date-menu-panel">
                <div className="bt-date-menu-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setView((current) => ({ ...current, hiddenDates: [] }))
                    }
                  >
                    选择全部
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setView((current) => ({
                        ...current,
                        hiddenDates: availableDates.filter(
                          (date) =>
                            !Object.keys(drafts).some(
                              (identity) => JSON.parse(identity)[2] === date,
                            ),
                        ),
                      }))
                    }
                  >
                    清空日期
                  </button>
                </div>
                <div
                  className="bt-date-list"
                  role="group"
                  aria-label="可见日期"
                >
                  {availableDates.map((date) => (
                    <label key={date}>
                      <input
                        type="checkbox"
                        checked={dates.includes(date)}
                        disabled={Object.keys(drafts).some(
                          (identity) => JSON.parse(identity)[2] === date,
                        )}
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          setView((current) => ({
                            ...current,
                            hiddenDates: checked
                              ? current.hiddenDates.filter(
                                  (item) => item !== date,
                                )
                              : [...new Set([...current.hiddenDates, date])],
                          }));
                        }}
                      />
                      {date}
                    </label>
                  ))}
                </div>
                <div className="bt-date-add">
                  <input
                    id="bt-add-date"
                    aria-label="待添加日期"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={dateInput}
                    onChange={(event) =>
                      setDateInput(event.currentTarget.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addDate();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="bt-icon"
                    aria-label="添加日期"
                    onClick={addDate}
                    disabled={!validDate(dateInput)}
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              </div>
            </details>
            <span className="bt-hint">
              默认显示全部日期。在日期列表中取消勾选即可隐藏相应列。
            </span>
          </div>
          <div className="bt-tools" aria-label="BeanTab 工具">
            <label
              className={`bt-delta-toggle ${view.deltas ? "bt-delta-toggle-active" : ""}`}
              title="在相邻日期之间显示区间流水"
            >
              <input
                type="checkbox"
                aria-label="显示区间流水"
                checked={view.deltas}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setView((current) => ({ ...current, deltas: checked }));
                }}
              />
              <span className="bt-delta-label-full">显示区间流水</span>
              <span className="bt-delta-label-short" aria-hidden="true">
                流水
              </span>
            </label>
            <button
              type="button"
              className="bt-tool-button"
              title={
                canWrite
                  ? "将当前账户筛选和显示开关保存到 plugins/beantab/config.json"
                  : "需要写入权限"
              }
              aria-label="保存默认视图"
              onClick={saveConfig}
              disabled={!canWrite || savingConfig || !data}
            >
              <Icon name="save" />
              <span>{savingConfig ? "保存中…" : "保存默认"}</span>
            </button>
            <button
              type="button"
              className="bt-tool-button"
              title="帮助"
              aria-label="BeanTab 帮助"
              aria-expanded={help}
              onClick={() => setHelp((current) => !current)}
            >
              <Icon name="help" />
              <span>帮助</span>
            </button>
            <button
              type="button"
              className="bt-tool-button"
              title="设置"
              aria-label="BeanTab 设置"
              aria-expanded={options}
              onClick={() => setOptions((current) => !current)}
            >
              <Icon name="settings" />
              <span>视图</span>
            </button>
          </div>
        </div>
        {help && (
          <div className="bt-help">
            <p>
              点击日期单元格即可编辑余额。在上方添加日期可以创建新列。支持从电子表格粘贴制表符分隔的数据，并使用
              Enter 键或方向键移动。
            </p>
            <p>
              余额后缀：<code>!</code> 普通断言，<code>~</code> 补差断言，
              <code>V</code>{" "}
              估值。清空已保存的单元格会删除对应断言；点击“撤销”会放弃未保存的修改。
            </p>
            <p>
              类型列的下拉框只决定该账户和币种新单元格的写入类型；已有断言保留自己的历史类型，输入金额时显式添加后缀始终优先。
            </p>
            <p>
              绿色数值表示已保存的断言，浅色数值表示该日期期初的账本余额。警告图标表示存在差异。启用“显示区间流水”后，可查看相邻日期之间的交易，并点击差额查看分录。
            </p>
            <p>
              启用“合并多币种账户”后，同一账户只显示一次账户名称，各币种余额仍分行编辑和对账。
            </p>
            <p>
              点击“保存默认”会把当前账户筛选和显示开关写入{" "}
              <code>plugins/beantab/config.json</code>。带 <code>bt</code>{" "}
              参数的链接优先于该文件中的默认值。
            </p>
          </div>
        )}
        {options && (
          <div className="bt-options">
            {(
              [
                ["closed", "已关闭账户"],
                ["empty", "空账户"],
                ["asserted", "仅显示有断言的账户"],
                ["groupAccounts", "合并多币种账户"],
              ] as const
            ).map(([field, label]) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={view[field]}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setView((current) => ({
                      ...current,
                      [field]: checked,
                    }));
                  }}
                />
                {label}
              </label>
            ))}
            <label>
              小数位
              <select
                value={view.decimals}
                onChange={(event) => {
                  const decimals = Number(event.currentTarget.value);
                  setView((current) => ({
                    ...current,
                    decimals,
                  }));
                }}
              >
                {[0, 2, 4, 6, 8].map((count) => (
                  <option key={count}>{count}</option>
                ))}
              </select>
            </label>
            <label>
              新单元格
              <select
                value={view.mode}
                onChange={(event) => {
                  const mode = event.currentTarget.value as Mode;
                  setView((current) => ({
                    ...current,
                    mode,
                  }));
                }}
              >
                {Object.entries(SYMBOLS).map(([mode, symbol]) => (
                  <option key={mode} value={mode}>
                    {symbol} {MODE_LABELS[mode as Mode]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              平衡账户
              <select
                aria-label="平衡账户"
                value={differenceAccount}
                onChange={(event) =>
                  setDifferenceAccount(event.currentTarget.value)
                }
              >
                {differenceAccounts.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {dateWarnings.map((warning) => (
          <p
            key={warning}
            className="bt-status bt-warning-status"
            role="status"
          >
            {warning}
          </p>
        ))}
        {data?.configError && (
          <p className="bt-status bt-warning-status" role="alert">
            BeanTab JSON 配置无效：{data.configError}。已回退到 YAML
            和页面默认值。
          </p>
        )}
        {(error || rowData.filterError || invalid) && (
          <p className="bt-status bt-error" role="alert">
            {error ||
              rowData.filterError ||
              "部分已编辑单元格无效。请输入金额，可在后面添加 !、~ 或 V。"}
            {error && (
              <button
                type="button"
                className="bt-icon"
                aria-label="重新加载余额"
                onClick={() => setRefresh((current) => current + 1)}
              >
                <Icon name="refresh" />
              </button>
            )}
          </p>
        )}
        {notice && (
          <p className="bt-status bt-success" role="status">
            {notice}
          </p>
        )}
        {!canWrite && (
          <p className="bt-status bt-readonly">
            只读 · 需要写入权限才能编辑余额。
          </p>
        )}
        <div
          className="bt-grid-wrap"
          ref={grid}
          role="region"
          aria-label="可滚动的余额日期"
          tabIndex={0}
          aria-busy={loading}
        >
          <table
            className="bt-grid"
            ref={table}
            data-deltas={view.deltas}
            aria-label="BeanTab 账户与日期余额"
            style={{
              minWidth: `calc(var(--bt-account-width) + var(--bt-mode-width) + var(--bt-currency-width) + ${Math.max(dates.length, 1) * 168 + (view.deltas ? Math.max(0, dates.length - 1) * 180 : 0)}px)`,
            }}
          >
            <colgroup>
              <col style={{ width: "var(--bt-account-width)" }} />
              <col style={{ width: "var(--bt-mode-width)" }} />
              <col style={{ width: "var(--bt-currency-width)" }} />
              {dates.flatMap((date, index) => [
                ...(index > 0
                  ? [
                      <col
                        key={`${date}-delta`}
                        className="bt-delta-column"
                        style={{ width: view.deltas ? 180 : 0 }}
                      />,
                    ]
                  : []),
                <col key={date} style={{ width: "auto" }} />,
              ])}
            </colgroup>
            <thead>
              <tr>
                <th className="bt-account" scope="col">
                  <button
                    type="button"
                    onClick={() =>
                      setView((current) => ({
                        ...current,
                        descending: !current.descending,
                      }))
                    }
                  >
                    账户 <Icon name="sort" />
                  </button>
                </th>
                <th className="bt-mode" scope="col" title="写入类型">
                  写入
                </th>
                <th className="bt-currency" scope="col">
                  币种
                </th>
                {dates.flatMap((date, index) => [
                  ...(index > 0
                    ? [
                        <th
                          className="bt-delta-head"
                          key={`${date}-delta`}
                          scope="col"
                          aria-hidden={!view.deltas}
                        >
                          <div>
                            <span>区间流水</span>
                            <strong>
                              {date} → {dates[index - 1]}
                            </strong>
                          </div>
                        </th>,
                      ]
                    : []),
                  <th
                    className="bt-date-head"
                    key={date}
                    scope="col"
                    title={`${date} 期初余额`}
                  >
                    <span>余额</span>
                    <strong>{date}</strong>
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr>
                  <td
                    className="bt-empty"
                    colSpan={3 + dates.length + Math.max(0, dates.length - 1)}
                  >
                    正在加载账户、断言和交易…
                  </td>
                </tr>
              ) : !dates.length || !rowData.rows.length ? (
                <tr>
                  <td
                    className="bt-empty"
                    colSpan={3 + dates.length + Math.max(0, dates.length - 1)}
                  >
                    {dates.length
                      ? "当前设置下没有匹配的账户。"
                      : "请从日期下拉菜单中选择日期，以显示余额列。"}
                    <br />
                    <button
                      type="button"
                      className="bt-button"
                      onClick={() =>
                        setView((current) => ({
                          ...current,
                          filters: [],
                          asserted: false,
                          empty: true,
                          closed: true,
                        }))
                      }
                    >
                      显示全部账户
                    </button>
                  </td>
                </tr>
              ) : (
                rowData.rows.map((row, rowIndex) => {
                  const { accountSpan, currencies } = displayedRows[rowIndex]!;
                  const rowIdentity = key(row.account, row.currency);
                  const savedRowMode =
                    [...(data?.cells ?? [])]
                      .filter(
                        (cell) =>
                          cell.account === row.account &&
                          cell.currency === row.currency,
                      )
                      .sort((left, right) =>
                        right.date.localeCompare(left.date),
                      )[0]?.mode ?? view.mode;
                  const rowMode = rowModes[rowIdentity] ?? savedRowMode;
                  const { leaf, parent } = accountParts(row.account);
                  return (
                    <tr key={key(row.account, row.currency)}>
                      {(!view.groupAccounts || accountSpan) && (
                        <td
                          className="bt-account"
                          rowSpan={
                            view.groupAccounts
                              ? (accountSpan ?? undefined)
                              : undefined
                          }
                        >
                          <a
                            href={accountJournalHref(row.account)}
                            title={row.account}
                          >
                            <span
                              className="bt-account-dot"
                              style={{
                                background: COLORS[row.account.split(":")[0]],
                              }}
                            />
                            <span className="bt-account-copy">
                              <span className="bt-account-leaf">{leaf}</span>
                              {parent && (
                                <span className="bt-account-parent">
                                  {parent}
                                </span>
                              )}
                              {view.groupAccounts && currencies.length > 1 && (
                                <span className="bt-account-currencies">
                                  {currencies.join(" · ")}
                                </span>
                              )}
                            </span>
                          </a>
                        </td>
                      )}
                      <td
                        className="bt-mode"
                        title={`${MODE_LABELS[rowMode]}（${SYMBOLS[rowMode]}）`}
                      >
                        <select
                          value={rowMode}
                          aria-label={`${row.account} ${row.currency} 新单元格类型`}
                          data-overridden={rowModes[rowIdentity] !== undefined}
                          onChange={(event) => {
                            const mode = event.currentTarget.value as Mode;
                            setRowModes((current) => ({
                              ...current,
                              [rowIdentity]: mode,
                            }));
                          }}
                        >
                          {Object.entries(SYMBOLS).map(([mode, symbol]) => (
                            <option key={mode} value={mode}>
                              {symbol}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="bt-currency" title={row.currency}>
                        {row.currency}
                      </td>
                      {dates.flatMap((date, columnIndex) => {
                        const identity = key(row.account, row.currency, date),
                          original = cells.get(identity),
                          raw = drafts[identity];
                        const parsed =
                            raw === undefined
                              ? null
                              : parseInput(
                                  raw,
                                  original?.mode ??
                                    rowModes[rowIdentity] ??
                                    view.mode,
                                ),
                          edited = changes.some(
                            (change) => change.identity === identity,
                          ),
                          computed = balances.get(identity) ?? "0";
                        const beforeReconciliation = subtract(
                          computed,
                          paddingAmounts.get(identity) ?? "0",
                        );
                        const draftDifference =
                          edited &&
                          parsed?.amount !== null &&
                          parsed?.amount !== undefined &&
                          parsed.mode !== "valuation"
                            ? subtract(parsed.amount, beforeReconciliation)
                            : null;
                        const savedDifference =
                          original && original.mode !== "valuation"
                            ? subtract(original.amount, beforeReconciliation)
                            : null;
                        const difference = edited
                          ? draftDifference
                          : savedDifference;
                        const mismatch =
                          original &&
                          original.mode !== "valuation" &&
                          subtract(original.amount, computed) !== "0";
                        const isZero =
                          !original && decimal(computed)?.coefficient === 0n;
                        const title = original
                          ? `${original.file}:${original.line} · ${MODE_LABELS[original.mode]}${mismatch ? ` · 账本余额 ${computed}，差额 ${subtract(original.amount, computed)}` : ""}`
                          : `${date} 期初账本余额：${computed} ${row.currency}`;
                        const cell = (
                          <td
                            key={date}
                            className={`bt-value ${original ? "bt-assertion" : ""} ${edited ? "bt-edited" : ""} ${raw !== undefined && !parsed ? "bt-invalid" : ""} ${mismatch ? "bt-mismatch" : ""} ${difference !== null ? "bt-with-difference" : ""} ${isZero ? "bt-zero" : ""}`}
                            title={title}
                          >
                            {mismatch && <span className="bt-warning">ⓘ</span>}
                            <input
                              data-row={rowIndex}
                              data-column={columnIndex}
                              aria-label={`${row.account} ${row.currency} ${date} 余额`}
                              aria-invalid={
                                (raw !== undefined && !parsed) || undefined
                              }
                              inputMode="decimal"
                              value={
                                raw ??
                                (focusedCell === identity
                                  ? (original?.amount ?? computed)
                                  : formatted(
                                      original?.amount ?? computed,
                                      view.decimals,
                                    ))
                              }
                              placeholder={
                                computed === "0"
                                  ? ""
                                  : formatted(computed, view.decimals)
                              }
                              disabled={!canWrite || saving || loading}
                              onFocus={() => {
                                setFocusedCell(identity);
                              }}
                              onBlur={() => setFocusedCell(null)}
                              onChange={(event) =>
                                edit(identity, event.currentTarget.value)
                              }
                              onPaste={(event) => {
                                const text =
                                  event.clipboardData.getData("text");
                                if (
                                  !text.includes("\t") &&
                                  !text.includes("\n")
                                )
                                  return;
                                event.preventDefault();
                                const pasted: Record<string, string> = {};
                                text
                                  .trimEnd()
                                  .split(/\r?\n/u)
                                  .forEach((line, rowOffset) =>
                                    line
                                      .split("\t")
                                      .forEach((value, columnOffset) => {
                                        const target =
                                            rowData.rows[rowIndex + rowOffset],
                                          targetDate =
                                            dates[columnIndex + columnOffset];
                                        if (target && targetDate)
                                          pasted[
                                            key(
                                              target.account,
                                              target.currency,
                                              targetDate,
                                            )
                                          ] = value;
                                      }),
                                  );
                                setDrafts((current) => ({
                                  ...current,
                                  ...pasted,
                                }));
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                  setDrafts((current) => {
                                    const next = { ...current };
                                    delete next[identity];
                                    return next;
                                  });
                                  return;
                                }
                                if (
                                  !(
                                    ["Enter", "ArrowUp", "ArrowDown"].includes(
                                      event.key,
                                    ) ||
                                    (event.altKey &&
                                      ["ArrowLeft", "ArrowRight"].includes(
                                        event.key,
                                      ))
                                  )
                                )
                                  return;
                                event.preventDefault();
                                const nextRow =
                                    rowIndex +
                                    (event.key === "ArrowUp" ||
                                    (event.key === "Enter" && event.shiftKey)
                                      ? -1
                                      : event.key === "ArrowDown" ||
                                          event.key === "Enter"
                                        ? 1
                                        : 0),
                                  nextColumn =
                                    columnIndex +
                                    (event.key === "ArrowLeft"
                                      ? -1
                                      : event.key === "ArrowRight"
                                        ? 1
                                        : 0);
                                table.current
                                  ?.querySelector<HTMLInputElement>(
                                    `input[data-row="${nextRow}"][data-column="${nextColumn}"]`,
                                  )
                                  ?.focus();
                              }}
                            />
                            {difference !== null && (
                              <span
                                className="bt-difference"
                                aria-label={`${edited ? "未保存差额" : "对账差额"}：${row.account} ${row.currency}，${date}`}
                                title={`${edited ? "录入金额" : "账单金额"} ${edited ? parsed!.amount : original!.amount} − 对账前余额 ${beforeReconciliation} ${row.currency}`}
                                data-sign={
                                  difference === "0"
                                    ? "zero"
                                    : difference.startsWith("-")
                                      ? "negative"
                                      : "positive"
                                }
                              >
                                Δ{" "}
                                {difference !== "0" &&
                                !difference.startsWith("-")
                                  ? "+"
                                  : ""}
                                {difference} {row.currency}
                              </span>
                            )}
                            {(original || parsed?.amount) && (
                              <span className="bt-cell-mode">
                                {
                                  SYMBOLS[
                                    parsed?.mode ?? original?.mode ?? view.mode
                                  ]
                                }
                              </span>
                            )}
                          </td>
                        );
                        return [
                          ...(columnIndex > 0
                            ? [
                                <td
                                  key={`${date}-delta`}
                                  className="bt-delta-cell"
                                  aria-hidden={!view.deltas}
                                >
                                  {delta(row, date, dates[columnIndex - 1])}
                                </td>,
                              ]
                            : []),
                          cell,
                        ];
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <footer className="bt-footer">
          <div className="bt-footer-left">
            {view.deltas && (
              <div className="bt-legend">
                {CATEGORIES.map((category) => (
                  <span key={category} style={{ background: COLORS[category] }}>
                    {CATEGORY_LABELS[category] ?? category}
                  </span>
                ))}
              </div>
            )}
            <span className="bt-count">
              <strong>{rowData.rows.length}</strong> 行
              <span aria-hidden="true">·</span>
              <strong>{rowData.hidden}</strong> 行隐藏
              <span aria-hidden="true">·</span>
              <strong>{dates.length}</strong> 个日期
            </span>
            {changes.length > 0 && <strong>{changes.length} 项未保存</strong>}
          </div>
          <div className="bt-actions">
            <span
              className={`bt-save-state ${changes.length ? "bt-save-pending" : ""}`}
            >
              {changes.length ? `${changes.length} 项未保存` : "所有修改已保存"}
            </span>
            <button
              type="button"
              className="bt-button"
              disabled={!changes.length || saving}
              onClick={() => {
                setDrafts({});
                setError(null);
                setNotice(null);
              }}
            >
              <Icon name="revert" />
              撤销
            </button>
            <button
              type="button"
              className="bt-button bt-primary"
              disabled={
                !changes.length ||
                invalid ||
                !canWrite ||
                saving ||
                loading ||
                settings.enabled !== true
              }
              onClick={() => void save()}
            >
              <Icon name="save" />
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </footer>
        {selectedDelta && (
          <section
            ref={inspector}
            className="bt-inspector"
            aria-label="日期区间内的交易"
            style={inspectorPosition ?? undefined}
          >
            <header>
              <h2>
                {selectedDelta.account} · {selectedDelta.currency} ·{" "}
                {selectedDelta.from} → {selectedDelta.to}
              </h2>
              <button
                type="button"
                className="bt-icon"
                aria-label="关闭交易详情"
                onClick={() => setSelectedDelta(null)}
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="bt-inspector-list">
              {deltaItems.length ? (
                deltaItems.map((transaction, index) => (
                  <article key={index}>
                    <strong>
                      {transaction.date} — {transaction.payee}{" "}
                      {transaction.narration}
                    </strong>
                    <ul>
                      {transaction.postings.map((posting, postingIndex) => (
                        <li key={postingIndex}>
                          {posting.account}:{" "}
                          {formatted(posting.amount, view.decimals)}{" "}
                          {posting.currency}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))
              ) : (
                <p>此区间内没有交易。</p>
              )}
            </div>
            <a
              href={accountJournalHref(
                selectedDelta.account,
                `${selectedDelta.from} to ${selectedDelta.to}`,
              )}
            >
              打开账户流水 ↗
            </a>
          </section>
        )}
      </div>
    </section>
  );
}
