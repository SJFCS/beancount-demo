import BigNumber from "bignumber.js";
import {
  parseLedgerFiles,
  collectSourceFiles,
  splitIntoBlocks,
} from "@beancount/plugin";
import type { PluginRepository } from "@beancount/plugin";
import type { Account, Batch, Existing } from "../types";
import { CONFIG_PATH } from "../types";
import { draftPath, hash } from "./utils";
import { readPaymentConfig } from "./mappings";

function importedOrders(content: string | undefined, batchId: string) {
  const orders = new Map<number, Pick<Existing, "provider" | "orderId">>();
  if (!content) return orders;
  try {
    const batch = JSON.parse(content) as Batch | null;
    if (
      batch?.id !== batchId ||
      !["wechat", "alipay"].includes(batch.provider) ||
      !Array.isArray(batch.rows)
    )
      return orders;
    for (const row of batch.rows)
      if (row && Number.isInteger(row.line) && typeof row.orderId === "string")
        orders.set(row.line, {
          provider: batch.provider,
          orderId: row.orderId,
        });
  } catch {
    return orders;
  }
  return orders;
}

export async function validateChange(
  ctx: Context,
  proposed: Record<string, string>,
) {
  const before = await parseLedgerFiles(ctx.files, ctx.entry);
  const after = await parseLedgerFiles(proposed, ctx.entry);
  const counts = new Map<string, number>();
  const keyOf = (error: (typeof before.errors)[number]) =>
    JSON.stringify([error.severity, error.message]);
  for (const error of before.errors)
    counts.set(keyOf(error), (counts.get(keyOf(error)) ?? 0) + 1);
  const added = after.errors.filter((error) => {
    const key = keyOf(error),
      count = counts.get(key) ?? 0;
    counts.set(key, count - 1);
    return count <= 0;
  });
  if (added.length)
    throw new Error(
      `操作会产生账本错误：${added
        .slice(0, 3)
        .map((error) => error.message)
        .join("；")}`,
    );
}
export async function context(repository: PluginRepository, ledgerId: string) {
  const files = await repository.readFileMap(ledgerId);
  const paymentConfig = readPaymentConfig(files[CONFIG_PATH]);
  const configRevision = hash(files[CONFIG_PATH] ?? "");
  const entry = repository.getLedger(ledgerId).entryPoint;
  const paths = collectSourceFiles(files, entry);
  const snapshot = await parseLedgerFiles(files, entry);
  const accounts = new Map<string, Account>();
  for (const d of snapshot.directives) {
    if (d.type === "open")
      accounts.set(d.account, {
        name: d.account,
        date: d.date,
        currencies: d.currencies,
      });
    if (d.type === "close") {
      const a = accounts.get(d.account);
      if (a) a.closed = d.date;
    }
  }
  // Read source blocks to retain transaction IDs and the original source location.
  const existing: Existing[] = [];
  const ordersByBatch = new Map<string, ReturnType<typeof importedOrders>>();
  for (const file of Object.keys(files).filter((file) =>
    /\.bean$/iu.test(file),
  ))
    for (const block of splitIntoBlocks(files[file])) {
      const header =
        /^(\d{4}-\d{2}-\d{2})\s+[*!]\s+((?:"(?:\\.|[^"\\])*"\s*){1,2})/u.exec(
          block.text,
        );
      if (!header) continue;
      const strings = [...header[2].matchAll(/"(?:\\.|[^"\\])*"/gu)].map(
        (m) => JSON.parse(m[0]) as string,
      );
      const postings = [
        ...block.text.matchAll(
          /^\s+((?:Assets|Liabilities|Expenses|Income|Equity):[^\s]+)\s+([+-]?[\d,]+(?:\.\d+)?)\s+([A-Z][A-Z0-9._-]*)/gmu,
        ),
      ].map((m) => ({
        account: m[1],
        amount: new BigNumber(m[2].replace(/,/gu, "")).toFixed(),
        currency: m[3],
      }));
      const meta = (key: string) => {
        const match = new RegExp(
          `^\\s+${key}:\\s*("(?:\\\\.|[^"\\\\])*")`,
          "mu",
        ).exec(block.text);
        return match ? (JSON.parse(match[1]) as string) : undefined;
      };
      const importBatch = meta("import-batch");
      const importLine =
        Number(/^\s+import-line:\s*(\d+)\s*$/mu.exec(block.text)?.[1]) ||
        undefined;
      if (
        importBatch &&
        importLine &&
        /^[a-f0-9]{64}$/u.test(importBatch) &&
        !ordersByBatch.has(importBatch)
      )
        ordersByBatch.set(
          importBatch,
          importedOrders(files[draftPath(importBatch)], importBatch),
        );
      const imported =
        importBatch && importLine
          ? ordersByBatch.get(importBatch)?.get(importLine)
          : undefined;
      existing.push({
        date: header[1],
        payee: strings.length > 1 ? strings[0] : "",
        description: strings.at(-1) ?? "",
        postings,
        label: `${file}:${block.startLine + 1}`,
        orderId: meta("payment-order-id") ?? imported?.orderId,
        provider: meta("payment-provider") ?? imported?.provider,
        file,
        importBatch,
        importLine,
      });
    }
  return {
    repository,
    ledgerId,
    files,
    entry,
    paths,
    accounts: [...accounts.values()],
    existing: existing.filter((item) => paths.includes(item.file)),
    imported: existing.filter((item) => item.importBatch && item.importLine),
    paymentConfig,
    configRevision,
  };
}
export type Context = Awaited<ReturnType<typeof context>>;
