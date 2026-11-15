import path from "node:path";
import { readStatementTable } from "@beancount/plugin";
import type { PluginRequest } from "@beancount/plugin";
import type { Batch } from "../types";
import { hash, draftPath, folders } from "./utils";
import { context } from "./context";
import { parseRows } from "./parser";
import { matchRefunds } from "./refunds";
import { applyPaymentAccounts } from "./mappings";
import { findDuplicates } from "./duplicates";
import { present } from "./batches";
import { attachOriginalFields } from "./original-fields";
import { classificationRunning } from "../classification";
export async function importStatement(request: PluginRequest) {
  const { repository, ledgerId, body, settings } = request;
  const dirs = folders(settings);
  let bytes: Buffer, filename: string, sourcePath: string;
  const all = await repository.listFiles(ledgerId);
  if (typeof body.path === "string") {
    sourcePath = body.path;
    if (
      !sourcePath.startsWith(`${dirs.input}/`) ||
      !all.includes(sourcePath) ||
      !/\.(xlsx|csv|tsv)$/iu.test(sourcePath)
    )
      throw new Error("只能读取 import_data 目录中的账单");
    bytes = (await repository.readBinaryFile(ledgerId, sourcePath)).content;
    filename = path.posix.basename(sourcePath);
  } else {
    filename = typeof body.filename === "string" ? body.filename : "";
    if (
      !filename ||
      filename !== path.posix.basename(filename) ||
      /[\\\u0000-\u001f]/u.test(filename) ||
      !/\.(xlsx|csv|tsv)$/iu.test(filename)
    )
      throw new Error("上传文件名无效");
    if (
      typeof body.base64 !== "string" ||
      body.base64.length > 28_000_000 ||
      !/^[A-Za-z0-9+/]*={0,2}$/u.test(body.base64)
    )
      throw new Error("上传文件过大或编码无效");
    bytes = Buffer.from(body.base64, "base64");
    sourcePath = "";
  }
  const id = hash(bytes),
    file = draftPath(id);
  const existing = all.includes(file)
    ? await repository.readFile(ledgerId, file)
    : undefined;
  const stored = existing ? (JSON.parse(existing.content) as Batch) : undefined;
  if (stored && classificationRunning(stored.classification)) {
    if (body.provider !== undefined && body.provider !== stored.provider)
      throw new Error("账单来源与当前审核批次不符");
    return present(stored, await context(repository, ledgerId));
  }
  const table = await readStatementTable(bytes, filename);
  const ctx = await context(repository, ledgerId);
  const parsed = parseRows(table, id, ctx.accounts);
  if (body.provider !== undefined && body.provider !== parsed.provider)
    throw new Error(
      `账单来源不符，请使用${parsed.provider === "wechat" ? "微信" : "支付宝"}账单上传入口`,
    );
  if (
    !sourcePath &&
    stored &&
    all.includes(stored.sourcePath) &&
    (await repository.readBinaryFile(ledgerId, stored.sourcePath)).sha256 === id
  )
    sourcePath = stored.sourcePath;
  if (!sourcePath) {
    sourcePath = `${dirs.input}/${parsed.provider === "wechat" ? "WeChatPay" : "AliPay"}/${id.slice(0, 12)}-${filename}`;
    // Never replace a different file that happens to occupy the archive name.
    if (
      all.includes(sourcePath) &&
      (await repository.readBinaryFile(ledgerId, sourcePath)).sha256 !== id
    )
      sourcePath = `${dirs.input}/${parsed.provider === "wechat" ? "WeChatPay" : "AliPay"}/${id}-${filename}`;
  }
  const batch: Batch = {
    id,
    ...parsed,
    filename,
    sourcePath,
    sourceSha: id,
    createdAt: new Date().toISOString(),
    refundVersion: 1,
    lifecycleVersion: 2,
  };
  const restored = stored
    ? attachOriginalFields(
        { ...stored, sourcePath, sourceSha: id },
        parsed.rows,
      )
    : batch;
  if (!stored) {
    restored.rows = applyPaymentAccounts(
      matchRefunds(restored),
      ctx,
      true,
    ).rows;
    restored.rows = findDuplicates(restored, ctx.existing).map((row) => ({
      ...row,
      selected: row.selected && !row.duplicates.length,
    }));
  }
  const changes: Array<{
    path: string;
    content: string | Buffer;
    expectedSha?: string;
  }> = [
    {
      path: file,
      content: JSON.stringify(restored, null, 2) + "\n",
      ...(existing ? { expectedSha: existing.sha256 } : {}),
    },
  ];
  if (!all.includes(sourcePath))
    changes.push({ path: sourcePath, content: bytes });
  else if (
    (await repository.readBinaryFile(ledgerId, sourcePath)).sha256 !== id
  )
    throw new Error("原始文件已变化，请重试");
  await repository.writeFiles(ledgerId, changes);
  return present(restored, ctx);
}
