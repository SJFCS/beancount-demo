import path from "node:path";
import BigNumber from "bignumber.js";
import { collectSourceFiles } from "@beancount/plugin";
import type { PluginRequest } from "@beancount/plugin";
import type { Batch } from "../types";
import { requiresStatusReview } from "../review";
import { ACCOUNT, hash, quote, folders } from "./utils";
import type { Context } from "./context";
import { context, validateChange } from "./context";
import { findDuplicates } from "./duplicates";
import { present } from "./batches";
export async function commitBatch(
  request: PluginRequest,
  batch: Batch,
  file: { path: string; sha256: string },
  ctx: Context,
) {
  const { repository, ledgerId } = request;
  const dirs = folders(request.settings);
  const selected = findDuplicates(batch, ctx.existing).filter(
    (row) =>
      row.selected && !row.notImported && !row.locked && !row.committedAt,
  );
  if (!selected.length)
    throw new Error(
      batch.committedAt
        ? "该批次已经入账，请勿重复提交"
        : "请至少选择一笔未锁定的交易",
    );
  const source = await repository.readBinaryFile(ledgerId, batch.sourcePath);
  if (source.sha256 !== batch.sourceSha)
    throw new Error("原始账单已变化，禁止提交");
  for (const row of selected) {
    const reviewed = batch.rows.find((item) => item.id === row.id)!;
    if (requiresStatusReview(row) && !row.statusReviewed)
      throw new Error(`第 ${row.line} 行交易状态需人工确认，请先勾选已核对`);
    if (
      row.duplicates.length &&
      (!row.duplicateReviewed ||
        row.duplicates.some(
          (candidate) => !reviewed.duplicates.includes(candidate),
        ))
    )
      throw new Error(
        `第 ${row.line} 行存在重复候选，请取消选择或明确确认保留`,
      );
    if (new BigNumber(row.amount).isZero())
      throw new Error(`第 ${row.line} 行金额不能为零`);
    if (row.sourceAccount === row.targetAccount)
      throw new Error(`第 ${row.line} 行资金账户和分类账户不能相同`);
    if (!/^(Assets|Liabilities):/u.test(row.sourceAccount))
      throw new Error(`第 ${row.line} 行请选择资产或负债资金账户`);
    for (const name of [row.sourceAccount, row.targetAccount]) {
      const account = ctx.accounts.find((a) => a.name === name);
      if (
        !ACCOUNT.test(name) ||
        !account ||
        account.date > row.date ||
        (account.closed && account.closed <= row.date) ||
        (account.currencies.length && !account.currencies.includes("CNY"))
      )
        throw new Error(
          `第 ${row.line} 行账户 ${name || "（未选择）"} 未在交易日开放或不支持 CNY`,
        );
    }
  }
  const firstDate =
    batch.rows
      .map((row) => row.date)
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/u.test(date))
      .sort()[0] ?? batch.createdAt.slice(0, 10);
  const outputPath =
    batch.outputPath ??
    `${dirs.output}/${firstDate}-${batch.provider}-${batch.id.slice(0, 16)}.bean`;
  if (
    ctx.files[outputPath] !== undefined &&
    !ctx.imported.some(
      (item) => item.importBatch === batch.id && item.file === outputPath,
    )
  )
    throw new Error("输出文件已存在且不属于本批次，请检查后重试");
  const content =
    (ctx.files[outputPath] !== undefined
      ? ctx.files[outputPath] +
        (ctx.files[outputPath].endsWith("\n\n") ? "" : "\n\n")
      : `; 账单导入 · 原始文件 ${quote(batch.sourcePath)}\n\n`) +
    selected
      .map((row) =>
        [
          `${row.date} * ${quote(row.payee)} ${quote(row.description)}`,
          `  import-source: ${quote(batch.sourcePath)}`,
          `  import-line: ${row.line}`,
          `  import-batch: ${quote(batch.id)}`,
          `  ${row.sourceAccount}  ${row.amount} CNY`,
          `  ${row.targetAccount}  ${new BigNumber(row.amount).negated().toFixed(2)} CNY`,
          "",
        ].join("\n"),
      )
      .join("\n");
  const proposed = { ...ctx.files, [outputPath]: content };
  // Register an explicit include only if the ledger's existing glob does not already cover it.
  if (!collectSourceFiles(proposed, ctx.entry).includes(outputPath))
    proposed[ctx.entry] +=
      `\ninclude ${quote(path.posix.relative(path.posix.dirname(ctx.entry), outputPath))}\n`;
  await validateChange(ctx, proposed);
  const now = new Date().toISOString();
  const ids = new Set(selected.map((row) => row.id));
  batch.rows = batch.rows.map((row) =>
    ids.has(row.id)
      ? {
          ...row,
          committedAt: now,
          outputPath,
          selected: false,
          notImported: false,
          locked: true,
        }
      : row,
  );
  batch.lifecycleVersion = 2;
  batch.committedAt = batch.rows.every((row) => row.committedAt)
    ? now
    : undefined;
  batch.outputPath = outputPath;
  const changes = [
    {
      path: outputPath,
      content,
      expectedSha:
        ctx.files[outputPath] === undefined
          ? undefined
          : hash(ctx.files[outputPath]),
    },
    {
      path: file.path,
      content: JSON.stringify(batch, null, 2) + "\n",
      expectedSha: file.sha256,
    },
  ];
  if (proposed[ctx.entry] !== ctx.files[ctx.entry])
    changes.push({
      path: ctx.entry,
      content: proposed[ctx.entry],
      expectedSha: hash(ctx.files[ctx.entry]),
    });
  await repository.writeFiles(ledgerId, changes);
  return present(batch, await context(repository, ledgerId));
}
