import path from "node:path";
import type { Batch } from "../types";
import type { Context } from "./context";
// Only the original bytes can repair a moved source path; names alone are insufficient.
export async function resolveSource(
  batch: Batch,
  ctx: Context,
): Promise<Batch> {
  const all = await ctx.repository.listFiles(ctx.ledgerId);
  if (all.includes(batch.sourcePath)) return batch;
  const root = batch.sourcePath.split("/")[0] + "/";
  const candidates = all.filter(
    (file) => file.startsWith(root) && /\.(xlsx|csv|tsv)$/iu.test(file),
  );
  candidates.sort(
    (a, b) =>
      Number(path.posix.basename(b) === batch.filename) -
      Number(path.posix.basename(a) === batch.filename),
  );
  for (const file of candidates) {
    const source = await ctx.repository.readBinaryFile(ctx.ledgerId, file);
    if (source.sha256 === batch.sourceSha)
      return { ...batch, sourcePath: file };
  }
  throw new Error("原始账单文件未找到，请将原文件放回账单文件夹后重试");
}
