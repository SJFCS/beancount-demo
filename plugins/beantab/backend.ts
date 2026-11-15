import { createHash } from "node:crypto";
import path from "node:path";
import BigNumber from "bignumber.js";
import {
  collectSourceFiles,
  parseLedgerFiles,
  splitIntoBlocks,
  readLocalPluginConfig,
} from "@beancount/plugin";
import type {
  PluginRepository as LocalLedgerRepositoryAdapter,
  LocalPluginBackend,
} from "@beancount/plugin";

type BalanceMode = "regular" | "padded" | "valuation";
type BalanceCell = {
  id: string;
  date: string;
  account: string;
  currency: string;
  amount: string;
  mode: BalanceMode;
  file: string;
  line: number;
};
type SourceCell = BalanceCell & {
  start: number;
  end: number;
  removeStart: number;
  removeEnd: number;
  blockEnd: number;
  amountCount: number;
};
type CellChange = {
  id?: string;
  date: string;
  account: string;
  currency: string;
  amount: string | null;
  mode: BalanceMode;
};

const MODE_ALIASES: Record<string, BalanceMode> = {
  regular: "regular",
  "!": "regular",
  padded: "padded",
  "~": "padded",
  valuation: "valuation",
  V: "valuation",
};
const ACCOUNT =
  /^(?:Assets|Liabilities|Equity|Income|Expenses)(?::[A-Za-z0-9\u0080-\uFFFF][A-Za-z0-9_\-\u0080-\uFFFF]*)+$/u;
const ACCOUNT_PREFIX =
  /^(?:Assets|Liabilities|Equity|Income|Expenses)(?::[A-Za-z0-9\u0080-\uFFFF][A-Za-z0-9_\-\u0080-\uFFFF]*)*$/u;
const CURRENCY = /^[A-Za-z][A-Za-z0-9'._-]{0,22}$/u;
const NUMBER = /^[+-]?\d+(?:\.\d+)?$/u;
const CONFIG_FILE = "plugins/beantab/config.json";
const CONFIG_VERSION = 1;
const MAX_CONFIG_FILTERS = 100;

type BeanTabConfig = {
  version: 1;
  filters: string[] | null;
  closed?: boolean;
  empty?: boolean;
  asserted?: boolean;
  groupAccounts?: boolean;
};

type BeanTabConfigResult = {
  config: BeanTabConfig | null;
  error: string | null;
};

type SavedBeanTabConfig = {
  success: true;
  path: string;
  config: BeanTabConfig;
  configRevision: string;
  configExists: true;
};

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function configMapping(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("配置必须是 JSON 对象");
  return value as Record<string, unknown>;
}

function configStrings(
  value: unknown,
  label: string,
  pattern?: RegExp,
): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_CONFIG_FILTERS)
    throw new Error(`${label} 必须是最多 ${MAX_CONFIG_FILTERS} 项的数组`);
  return value.map((item, index) => {
    if (typeof item !== "string")
      throw new Error(`${label}[${index}] 必须是字符串`);
    const result = item.trim();
    if (!result || result.length > 500)
      throw new Error(`${label}[${index}] 长度必须在 1 到 500 之间`);
    if (pattern && !pattern.test(result))
      throw new Error(`${label}[${index}] 格式不正确：${result}`);
    return result;
  });
}

function configBoolean(
  input: Record<string, unknown>,
  key: string,
  label: string,
): boolean | undefined {
  if (!Object.hasOwn(input, key)) return undefined;
  if (typeof input[key] !== "boolean") throw new Error(`${label} 必须是布尔值`);
  return input[key] as boolean;
}

function parseBeanTabConfig(value: unknown): BeanTabConfig {
  const input = configMapping(value);
  if (input.version !== undefined && input.version !== CONFIG_VERSION)
    throw new Error(`不支持的配置版本：${String(input.version)}`);
  const hasSelectors = ["accounts", "account_prefixes", "account_filters"].some(
    (key) => Object.hasOwn(input, key),
  );
  let filters: string[] | null = null;
  if (hasSelectors) {
    const accounts = configStrings(input.accounts, "accounts", ACCOUNT);
    const prefixes = configStrings(
      input.account_prefixes,
      "account_prefixes",
      ACCOUNT_PREFIX,
    );
    const regexFilters = configStrings(
      input.account_filters,
      "account_filters",
    );
    for (const [index, filter] of regexFilters.entries()) {
      try {
        new RegExp(filter, "iu");
      } catch (cause) {
        throw new Error(
          `account_filters[${index}] 不是有效的正则表达式：${
            cause instanceof Error ? cause.message : String(cause)
          }`,
        );
      }
    }
    filters = [
      ...new Set([
        ...accounts.map((account) => `^${escapeRegex(account)}$`),
        ...prefixes.map((prefix) => `^${escapeRegex(prefix)}(?::|$)`),
        ...regexFilters,
      ]),
    ];
    if (filters.length > MAX_CONFIG_FILTERS)
      throw new Error(`账户筛选最多 ${MAX_CONFIG_FILTERS} 项`);
  }
  return {
    version: CONFIG_VERSION,
    filters,
    closed: configBoolean(input, "show_closed", "show_closed"),
    empty: configBoolean(input, "show_empty", "show_empty"),
    asserted: configBoolean(input, "asserted_only", "asserted_only"),
    groupAccounts: configBoolean(input, "group_accounts", "group_accounts"),
  };
}

function beanTabConfigDocument(config: BeanTabConfig): string {
  const document: Record<string, unknown> = { version: CONFIG_VERSION };
  if (config.filters !== null) document.account_filters = config.filters;
  if (config.closed !== undefined) document.show_closed = config.closed;
  if (config.empty !== undefined) document.show_empty = config.empty;
  if (config.asserted !== undefined) document.asserted_only = config.asserted;
  if (config.groupAccounts !== undefined)
    document.group_accounts = config.groupAccounts;
  return `${JSON.stringify(document, null, 2)}\n`;
}

function readBeanTabConfig(files: Record<string, string>): BeanTabConfigResult {
  const source = files[CONFIG_FILE];
  if (source === undefined) return { config: null, error: null };
  try {
    return {
      config: parseBeanTabConfig(JSON.parse(source) as unknown),
      error: null,
    };
  } catch (cause) {
    return {
      config: null,
      error: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

function dayBefore(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function decodeHeaderToken(token: string): string {
  if (token.length < 2 || !token.startsWith('"') || !token.endsWith('"')) {
    return token;
  }
  try {
    return JSON.parse(token) as string;
  } catch {
    // Multiline directive strings are split across lines before this scanner runs.
    return token;
  }
}

function sourceCells(
  files: Record<string, string>,
  paths: string[],
): SourceCell[] {
  const cells: SourceCell[] = [];
  const paddedAccounts = new Set<string>();
  for (const file of paths) {
    for (const line of files[file].split(/\r?\n/u)) {
      const pad = /^(\d{4}-\d{2}-\d{2})\s+pad\s+(\S+)\s+/u.exec(line);
      if (!pad || !validDate(pad[1])) continue;
      const next = new Date(`${pad[1]}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      paddedAccounts.add(`${next.toISOString().slice(0, 10)}\0${pad[2]}`);
    }
  }
  for (const file of paths) {
    for (const block of splitIntoBlocks(files[file])) {
      const line = block.text.split("\n")[0].replace(/\r$/u, "");
      const tokens = [...line.matchAll(/"(?:\\.|[^"\\])*"|[^\s;]+|;.*$/gu)];
      const values = tokens.map((token) => decodeHeaderToken(token[0]));
      if (!validDate(values[0] ?? "")) continue;
      let account: string;
      let mode: BalanceMode;
      let amountIndexes: number[];
      if (values[1] === "balance" && ACCOUNT.test(values[2] ?? "")) {
        account = values[2];
        const storedMode = /\n\s+beantab-mode:\s*"([^"]+)"/u.exec(
          block.text,
        )?.[1];
        mode =
          storedMode && Object.hasOwn(MODE_ALIASES, storedMode)
            ? MODE_ALIASES[storedMode]
            : paddedAccounts.has(`${values[0]}\0${account}`)
              ? "padded"
              : "regular";
        amountIndexes = [3];
      } else if (
        values[1] === "custom" &&
        ["balance-ext", "valuation"].includes(values[2])
      ) {
        const accountIndex = values.findIndex(
          (value, index) => index >= 3 && ACCOUNT.test(value),
        );
        if (accountIndex < 0 || values[3] === "config") continue;
        account = values[accountIndex];
        mode =
          values[2] === "valuation"
            ? "valuation"
            : Object.hasOwn(MODE_ALIASES, values[3])
              ? MODE_ALIASES[values[3]]
              : "regular";
        amountIndexes = values.flatMap((value, index) =>
          index > accountIndex &&
          NUMBER.test(value) &&
          CURRENCY.test(values[index + 1] ?? "")
            ? [index]
            : [],
        );
      } else continue;
      for (const amountIndex of amountIndexes) {
        if (
          !NUMBER.test(values[amountIndex] ?? "") ||
          !CURRENCY.test(values[amountIndex + 1] ?? "")
        )
          continue;
        const currency = values[amountIndex + 1];
        const token = tokens[amountIndex];
        const currencyToken = tokens[amountIndex + 1];
        cells.push({
          id: digest(JSON.stringify([file, block.startLine, currency])),
          date: values[0],
          account,
          currency,
          amount: values[amountIndex],
          mode,
          file,
          line: block.startLine + 1,
          start: token.index!,
          end: token.index! + token[0].length,
          removeStart: token.index!,
          removeEnd: currencyToken.index! + currencyToken[0].length,
          blockEnd: block.endLine,
          amountCount: amountIndexes.length,
        });
      }
    }
  }
  return cells;
}

async function loadState(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  const config = await readLocalPluginConfig(repository, ledgerId);
  const plugins = config.plugins as Record<string, unknown> | undefined;
  const settings = plugins?.beantab as Record<string, unknown> | undefined;
  if (!settings || settings.enabled !== true)
    throw new Error("The BeanTab plugin is disabled");
  const files = await repository.readFileMap(ledgerId);
  const ledger = repository.getLedger(ledgerId);
  const paths = collectSourceFiles(files, ledger.entryPoint);
  return {
    files,
    paths,
    settings,
    cells: sourceCells(files, paths),
    revision: digest(
      JSON.stringify([config, paths.map((file) => [file, files[file]])]),
    ),
  };
}

async function readLocalBeanTab(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
) {
  const state = await loadState(repository, ledgerId);
  const config = readBeanTabConfig(state.files);
  const snapshot = await parseLedgerFiles(
    state.files,
    repository.getLedger(ledgerId).entryPoint,
  );
  const accounts = new Map<
    string,
    {
      account: string;
      currencies: string[];
      openedAt: string;
      closedAt: string | null;
    }
  >();
  const transactions: Array<{
    date: string;
    payee: string;
    narration: string;
    padding: boolean;
    postings: Array<{ account: string; currency: string; amount: string }>;
  }> = [];
  for (const directive of snapshot.directives) {
    if (directive.type === "open")
      accounts.set(directive.account, {
        account: directive.account,
        currencies: directive.currencies,
        openedAt: directive.date,
        closedAt: null,
      });
    if (directive.type === "close") {
      const account = accounts.get(directive.account);
      if (account) account.closedAt = directive.date;
    }
    if (directive.type === "transaction")
      transactions.push({
        date: directive.date,
        payee: directive.payee ?? "",
        narration: directive.narration ?? "",
        padding: directive.flag === "P",
        postings: directive.postings.flatMap((posting) =>
          posting.units
            ? [
                {
                  account: posting.account,
                  currency: posting.units.currency,
                  amount: posting.units.number,
                },
              ]
            : [],
        ),
      });
  }
  const amounts = new Map<string, BigNumber>();
  for (const transaction of transactions)
    for (const posting of transaction.postings) {
      const key = `${posting.account}\0${posting.currency}`;
      amounts.set(
        key,
        (amounts.get(key) ?? new BigNumber(0)).plus(posting.amount),
      );
    }
  return {
    revision: state.revision,
    config: config.config,
    configPath: CONFIG_FILE,
    configExists: state.files[CONFIG_FILE] !== undefined,
    configRevision: digest(state.files[CONFIG_FILE] ?? ""),
    configError: config.error,
    cells: state.cells.map(
      ({ id, date, account, currency, amount, mode, file, line }) => ({
        id,
        date,
        account,
        currency,
        amount,
        mode,
        file,
        line,
      }),
    ),
    accounts: [...accounts.values()],
    transactions,
    balances: [...amounts].map(([key, amount]) => {
      const [account, currency] = key.split("\0");
      return { account, currency, amount: amount.toFixed() };
    }),
  };
}

async function saveBeanTabConfig(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  body: Record<string, unknown>,
): Promise<SavedBeanTabConfig> {
  const state = await loadState(repository, ledgerId);
  const source = state.files[CONFIG_FILE];
  const revision = typeof body.revision === "string" ? body.revision : "";
  if (revision !== digest(source ?? ""))
    throw new Error("默认视图配置已变化，请重新加载后再保存。");
  let config: BeanTabConfig;
  try {
    config = parseBeanTabConfig(body.config);
  } catch (cause) {
    throw new Error(
      `默认视图配置无效：${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
  }
  const document = beanTabConfigDocument(config);
  await repository.writeFile(
    ledgerId,
    CONFIG_FILE,
    document,
    source === undefined ? undefined : digest(source),
  );
  return {
    success: true,
    path: CONFIG_FILE,
    config,
    configRevision: digest(document),
    configExists: true,
  };
}

function relativeOutput(
  settings: Record<string, unknown>,
  date: string,
): string {
  const output = settings.output_dir;
  if (
    typeof output !== "string" ||
    !output.trim() ||
    output.includes("\\") ||
    path.posix.isAbsolute(output) ||
    /^[A-Za-z]:/u.test(output) ||
    output.split("/").includes("..")
  ) {
    throw new Error("BeanTab output_dir must stay inside the ledger");
  }
  if (settings.filename !== "{date}.bean")
    throw new Error("BeanTab filename must be '{date}.bean'");
  return path.posix.join(output, `${date}.bean`);
}

async function saveLocalBeanTab(
  repository: LocalLedgerRepositoryAdapter,
  ledgerId: string,
  input: { revision: string; differenceAccount: string; changes: CellChange[] },
) {
  const state = await loadState(repository, ledgerId);
  if (state.revision !== input.revision)
    throw new Error(
      "Ledger changed since it was loaded. Reload before saving; your edits are still available.",
    );
  if (
    !Array.isArray(input.changes) ||
    !input.changes.length ||
    input.changes.length > 2000
  )
    throw new Error("Provide between 1 and 2000 cell changes");
  const sources = new Map(state.cells.map((cell) => [cell.id, cell]));
  const touched = new Set<string>();
  const updates = new Map<
    string,
    Array<{ cell: SourceCell; amount: string | null }>
  >();
  const additions: CellChange[] = [];
  for (const change of input.changes) {
    if (
      !validDate(change.date) ||
      change.date === "0001-01-01" ||
      !ACCOUNT.test(change.account) ||
      !CURRENCY.test(change.currency) ||
      !Object.values(MODE_ALIASES).includes(change.mode) ||
      (change.amount !== null &&
        (typeof change.amount !== "string" ||
          change.amount.length > 100 ||
          !NUMBER.test(change.amount)))
    ) {
      throw new Error("Invalid balance cell");
    }
    const key = JSON.stringify([change.date, change.account, change.currency]);
    if (touched.has(key)) throw new Error("Duplicate balance cell change");
    touched.add(key);
    if (change.id) {
      const cell = sources.get(change.id);
      if (
        !cell ||
        cell.date !== change.date ||
        cell.account !== change.account ||
        cell.currency !== change.currency
      )
        throw new Error("Balance source no longer matches this cell");
      const changes = updates.get(cell.file) ?? [];
      if (cell.mode !== change.mode && change.amount !== null) {
        if (cell.amountCount > 1)
          throw new Error(
            "Change balance type for a multi-currency directive in the source file",
          );
        if (
          change.mode.includes("padded") &&
          (!ACCOUNT.test(input.differenceAccount) ||
            input.differenceAccount === change.account)
        )
          throw new Error("Choose a different valid padding account");
        changes.push({ cell, amount: null });
        additions.push(change);
      } else changes.push({ cell, amount: change.amount });
      updates.set(cell.file, changes);
    } else {
      if (
        state.cells.some(
          (cell) =>
            cell.date === change.date &&
            cell.account === change.account &&
            cell.currency === change.currency,
        )
      )
        throw new Error(
          "This balance cell already exists. Reload before saving.",
        );
      if (change.amount === null) continue;
      if (
        change.mode.includes("padded") &&
        (!ACCOUNT.test(input.differenceAccount) ||
          input.differenceAccount === change.account)
      )
        throw new Error("Choose a different valid padding account");
      additions.push(change);
    }
  }
  const contents = new Map<string, string>();
  for (const [file, changes] of updates) {
    const lines = state.files[file].split("\n");
    const byLine = new Map<number, typeof changes>();
    for (const change of changes) {
      const entries = byLine.get(change.cell.line - 1) ?? [];
      entries.push(change);
      byLine.set(change.cell.line - 1, entries);
    }
    for (const [line, entries] of byLine) {
      if (
        entries.filter((entry) => entry.amount === null).length ===
        entries[0].cell.amountCount
      ) {
        for (let index = line; index < entries[0].cell.blockEnd; index += 1)
          lines[index] = "";
      } else
        for (const entry of entries.sort(
          (left, right) => right.cell.start - left.cell.start,
        )) {
          lines[line] =
            entry.amount === null
              ? lines[line].slice(0, entry.cell.removeStart) +
                lines[line].slice(entry.cell.removeEnd)
              : lines[line].slice(0, entry.cell.start) +
                entry.amount +
                lines[line].slice(entry.cell.end);
        }
    }
    contents.set(file, lines.join("\n"));
  }
  const dates = new Set(additions.map((change) => change.date));
  for (const date of dates) {
    const output = relativeOutput(state.settings, date);
    const lines: string[] = [];
    const padded = new Set<string>();
    const dateChanges = additions.filter((change) => change.date === date);
    for (const change of dateChanges) {
      if (change.mode.includes("padded") && !padded.has(change.account)) {
        const pad = `${dayBefore(date)} pad ${change.account} ${input.differenceAccount}`;
        if (
          !state.paths.some((file) =>
            state.files[file]
              .split(/\r?\n/u)
              .some((line) => line.trim() === pad),
          )
        )
          lines.push(pad, "  beantab: TRUE");
        padded.add(change.account);
      }
      lines.push(
        change.mode === "valuation"
          ? `${date} custom "valuation" ${change.account} ${change.amount} ${change.currency}`
          : `${date} balance ${change.account} ${change.amount} ${change.currency}`,
      );
      if (change.mode !== "valuation")
        lines.push(`  beantab-mode: "${change.mode}"`);
    }
    const current =
      contents.get(output) ??
      state.files[output] ??
      "; Generated by the BeanTab local plugin.\n";
    contents.set(output, `${current.trimEnd()}\n\n${lines.join("\n")}\n`);
  }
  for (const [file, content] of contents) {
    const lines = content.split("\n");
    for (let line = 0; line < lines.length - 1; line += 1) {
      const pad = /^(\d{4}-\d{2}-\d{2}) pad (\S+) \S+$/u.exec(lines[line]);
      if (!pad || lines[line + 1].trim() !== "beantab: TRUE") continue;
      const next = new Date(`${pad[1]}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      const balancePrefix = `${next.toISOString().slice(0, 10)} balance ${pad[2]} `;
      const retained = sourceCells({ [file]: lines.join("\n") }, [file]).some(
        (cell) =>
          cell.date === next.toISOString().slice(0, 10) &&
          cell.account === pad[2] &&
          cell.mode.includes("padded"),
      );
      if (
        !lines.some((entry) => entry.startsWith(balancePrefix)) ||
        !retained
      ) {
        lines[line] = "";
        lines[line + 1] = "";
      }
    }
    contents.set(file, lines.join("\n"));
  }
  await repository.writeFiles(
    ledgerId,
    [...contents].map(([file, content]) => ({
      path: file,
      content,
      expectedSha:
        state.files[file] === undefined ? undefined : digest(state.files[file]),
    })),
  );
  return { success: true, paths: [...contents.keys()] };
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body }) {
    if (method === "POST" && action === "config")
      return saveBeanTabConfig(repository, ledgerId, body);
    if (action) throw new Error("Unknown BeanTab operation");
    if (method === "GET") return readLocalBeanTab(repository, ledgerId);
    return saveLocalBeanTab(repository, ledgerId, {
      revision: typeof body.revision === "string" ? body.revision : "",
      differenceAccount:
        typeof body.differenceAccount === "string"
          ? body.differenceAccount
          : "",
      changes: Array.isArray(body.changes)
        ? (body.changes as CellChange[])
        : [],
    });
  },
};
export default backend;
