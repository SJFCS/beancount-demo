import { readStatementTable } from "@beancount/plugin";
import type { Batch, Row } from "../types";
import type { Context } from "./context";
import { parseRows } from "./parser";

export function attachOriginalFields(batch: Batch, originals: Row[]): Batch {
  const byId = new Map(originals.map((row) => [row.id, row.originalFields]));
  return {
    ...batch,
    rows: batch.rows.map((row) => {
      const originalFields = row.originalFields ?? byId.get(row.id);
      if (!originalFields) throw new Error("原始账单行无法对应，请检查原文件");
      return { ...row, originalFields };
    }),
  };
}

export async function restoreOriginalFields(batch: Batch, ctx: Context) {
  if (batch.rows.every((row) => row.originalFields)) return batch;
  const source = await ctx.repository.readBinaryFile(
    ctx.ledgerId,
    batch.sourcePath,
  );
  if (source.sha256 !== batch.sourceSha)
    throw new Error("原始账单已变化，无法读取原始交易信息");
  const table = await readStatementTable(source.content, batch.filename);
  return attachOriginalFields(
    batch,
    parseRows(table, batch.id, ctx.accounts).rows,
  );
}
