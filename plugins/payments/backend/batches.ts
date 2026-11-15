import { resolveSource } from "./source";
import BigNumber from "bignumber.js";
import type { PluginRequest } from "@beancount/plugin";
import type { Batch, Row } from "../types";
import type { Context } from "./context";
import { context } from "./context";
import { hash, draftPath } from "./utils";
import { matchRefunds } from "./refunds";
import { applyPaymentAccounts } from "./mappings";
import { findDuplicates } from "./duplicates";
import { restoreOriginalFields } from "./original-fields";
import { transactionWarnings } from "../review";
import { classificationRunning } from "../classification";
export function revision(batch: Batch) {
  return hash(JSON.stringify(batch));
}
export async function deleteDraft(request: PluginRequest) {
  const file = await request.repository.readFile(
    request.ledgerId,
    draftPath(String(request.body.id)),
  );
  const stored = JSON.parse(file.content) as Batch;
  if (classificationRunning(stored.classification))
    throw new Error("AI 分类正在后台执行，请完成后再删除草稿");
  if (revision(stored) !== request.body.revision)
    throw new Error("草稿已变化，请刷新后再删除");
  const batch = restoreBatch(
    stored,
    await context(request.repository, request.ledgerId),
  );
  if (stored.committedAt || batch.rows.some((row) => row.committedAt))
    throw new Error("已有入账记录，不能删除草稿");
  await request.repository.deleteFile(request.ledgerId, file.path, file.sha256);
  return { id: batch.id, deleted: true };
}
// Restore legacy partial imports from the identity written into each Bean transaction.
export function restoreBatch(stored: Batch, ctx: Context): Batch {
  const imported = new Map(
    ctx.imported
      .filter((item) => item.importBatch === stored.id)
      .map((item) => [item.importLine, item]),
  );
  const rows = stored.rows.map((storedRow) => {
    // Refresh derived warnings while preserving saved accounts and review decisions.
    const row = {
      ...storedRow,
      warnings: transactionWarnings(storedRow),
    };
    const written = imported.get(row.line);
    return written || row.committedAt
      ? {
          ...row,
          committedAt:
            row.committedAt ?? stored.committedAt ?? stored.createdAt,
          outputPath: written?.file ?? row.outputPath ?? stored.outputPath,
          locked: true,
          selected: false,
          notImported: false,
        }
      : row;
  });
  if (
    stored.committedAt &&
    !stored.lifecycleVersion &&
    !rows.some((row) => row.committedAt)
  )
    throw new Error("无法核对旧批次的入账标记，请检查原 Bean 文件后再继续");
  return {
    ...stored,
    rows,
    lifecycleVersion: 2,
    committedAt: rows.every((row) => row.committedAt)
      ? (stored.committedAt ?? rows[0]?.committedAt)
      : undefined,
  };
}
export async function loadBatch(request: PluginRequest, allowLocked = false) {
  const file = await request.repository.readFile(
    request.ledgerId,
    draftPath(String(request.body.id)),
  );
  const stored = JSON.parse(file.content) as Batch;
  if (classificationRunning(stored.classification))
    throw new Error("AI 分类正在后台执行，请完成后再修改审核草稿");
  if (revision(stored) !== request.body.revision)
    throw new Error("草稿已变化，请重新打开批次后再保存");
  const ctx = await context(request.repository, request.ledgerId);
  const batch = await restoreOriginalFields(
    await resolveSource(restoreBatch(stored, ctx), ctx),
    ctx,
  );
  if (batch.locked && !allowLocked) throw new Error("草稿已锁定，请先解锁");
  return { batch: matchRefunds(batch), file, ctx };
}
export function applyEdits(batch: Batch, value: unknown) {
  if (!Array.isArray(value) || value.length !== batch.rows.length)
    throw new Error("交易行数量不匹配");
  const byId = new Map(value.map((row: Row) => [row.id, row]));
  if (byId.size !== batch.rows.length) throw new Error("交易标识重复");
  batch.rows = batch.rows.map((row) => {
    const edit = byId.get(row.id);
    if (row.committedAt || row.locked) return row;
    if (
      !edit ||
      typeof edit.sourceAccount !== "string" ||
      typeof edit.targetAccount !== "string" ||
      typeof edit.amount !== "string" ||
      !/^-?\d+(?:\.\d{1,2})?$/u.test(edit.amount)
    )
      throw new Error("交易编辑格式无效");
    const selected = edit.selected === true;
    return {
      ...row,
      sourceAccount: edit.sourceAccount,
      targetAccount: edit.targetAccount,
      amount: new BigNumber(edit.amount).toFixed(2),
      selected,
      notImported: !selected && edit.notImported === true,
      duplicateReviewed: edit.duplicateReviewed === true,
      statusReviewed: edit.statusReviewed === true,
      duplicates: Array.isArray(edit.duplicates)
        ? edit.duplicates.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      confidence: Number.isFinite(edit.confidence)
        ? Math.max(0, Math.min(1, edit.confidence!))
        : undefined,
      reasoning:
        typeof edit.reasoning === "string"
          ? edit.reasoning.slice(0, 500)
          : undefined,
      aiFallback:
        edit.aiFallback === true &&
        Number.isFinite(edit.confidence) &&
        ["Expenses:Other", "Income:Other"].includes(edit.targetAccount)
          ? true
          : undefined,
    };
  });
}
export async function present(batch: Batch, ctx: Context) {
  const display = applyPaymentAccounts(
    matchRefunds(
      await restoreOriginalFields(
        await resolveSource(restoreBatch(batch, ctx), ctx),
        ctx,
      ),
    ),
    ctx,
  );
  return {
    batch: { ...display, rows: findDuplicates(display, ctx.existing) },
    revision: revision(batch),
    accounts: ctx.accounts,
    paymentAccounts: ctx.paymentConfig.paymentAccounts,
    counterpartyAccounts: ctx.paymentConfig.counterpartyAccounts ?? [],
    configRevision: ctx.configRevision,
  };
}

export async function setLock(request: PluginRequest) {
  const { batch, file, ctx } = await loadBatch(request, true);
  if (typeof request.body.locked !== "boolean") throw new Error("锁定状态无效");
  if (!batch.locked) applyEdits(batch, request.body.rows);
  if (request.body.rowIds === undefined) batch.locked = request.body.locked;
  else {
    const ids = request.body.rowIds;
    if (
      !Array.isArray(ids) ||
      !ids.length ||
      ids.some(
        (id) =>
          typeof id !== "string" || !batch.rows.some((row) => row.id === id),
      )
    )
      throw new Error("锁定交易标识无效");
    if (batch.locked) throw new Error("请先解锁草稿");
    if (batch.rows.some((row) => ids.includes(row.id) && row.committedAt))
      throw new Error("已入账交易保留入账锁定，不能再次导入");
    batch.rows = batch.rows.map((row) =>
      ids.includes(row.id)
        ? { ...row, locked: request.body.locked === true }
        : row,
    );
  }
  await request.repository.writeFile(
    request.ledgerId,
    file.path,
    JSON.stringify(batch, null, 2) + "\n",
    file.sha256,
  );
  return present(batch, ctx);
}

export async function setImportStatus(request: PluginRequest) {
  const { batch, file, ctx } = await loadBatch(request);
  const { notImported, rowIds } = request.body;
  if (typeof notImported !== "boolean") throw new Error("导入状态无效");
  if (
    !Array.isArray(rowIds) ||
    !rowIds.length ||
    rowIds.some(
      (id) =>
        typeof id !== "string" || !batch.rows.some((row) => row.id === id),
    )
  )
    throw new Error("交易标识无效");
  const ids = new Set(rowIds);
  if (batch.rows.some((row) => ids.has(row.id) && row.committedAt))
    throw new Error("已入账交易保留入账锁定，不能修改导入状态");
  applyEdits(batch, request.body.rows);
  batch.rows = batch.rows.map((row) =>
    ids.has(row.id)
      ? { ...row, selected: false, notImported, locked: notImported }
      : row,
  );
  await request.repository.writeFile(
    request.ledgerId,
    file.path,
    JSON.stringify(batch, null, 2) + "\n",
    file.sha256,
    { commitMessage: `Update payment import status ${batch.filename}` },
  );
  return present(batch, ctx);
}
