import type { LocalPluginBackend } from "@beancount/plugin";
import type { Batch } from "./types";
import { CONFIG_PATH } from "./types";
import { folders, draftPath } from "./backend/utils";
import { context } from "./backend/context";
import {
  loadBatch,
  applyEdits,
  present,
  restoreBatch,
  setLock,
  setImportStatus,
  revision,
  deleteDraft,
} from "./backend/batches";
import { matchRefunds } from "./backend/refunds";
import {
  createAccount,
  deleteMappingGroup,
  linkAccount,
  reorderMappings,
} from "./backend/accounts";
import { importStatement } from "./backend/import";
import { commitBatch } from "./backend/commit";
import {
  startClassification,
  classificationStatus,
  resumeClassification,
} from "./backend/classification";
const backend: LocalPluginBackend = {
  async handle(request) {
    const { repository, ledgerId, body, action, method, settings } = request;
    const dirs = folders(settings);
    if (method === "GET") {
      const ctx = await context(repository, ledgerId);
      if (typeof body.id === "string")
        throw new Error("使用 open 操作打开批次");
      const all = await repository.listFiles(ledgerId);
      const batches = [];
      for (const file of all.filter((f) =>
        /^plugins\/payments\/drafts\/[a-f0-9]{64}\.json$/u.test(f),
      )) {
        const stored = JSON.parse(
          (await repository.readFile(ledgerId, file)).content,
        ) as Batch;
        const batch = restoreBatch(stored, ctx);
        batches.push({
          id: batch.id,
          filename: batch.filename,
          provider: batch.provider,
          createdAt: batch.createdAt,
          count: batch.rows.length,
          committedCount: batch.rows.filter((row) => row.committedAt).length,
          notImportedCount: batch.rows.filter(
            (row) => row.notImported && !row.committedAt,
          ).length,
          locked: batch.locked,
          committedAt: batch.committedAt,
          outputPath: batch.outputPath,
          sourcePath: batch.sourcePath,
          revision: revision(stored),
          classification: batch.classification,
        });
      }
      return {
        ...dirs,
        accounts: ctx.accounts,
        paymentAccounts: ctx.paymentConfig.paymentAccounts,
        counterpartyAccounts: ctx.paymentConfig.counterpartyAccounts ?? [],
        configRevision: ctx.configRevision,
        configPath: CONFIG_PATH,
        files: all.filter(
          (f) =>
            f.startsWith(`${dirs.input}/`) && /\.(xlsx|csv|tsv)$/iu.test(f),
        ),
        batches: batches.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      };
    }
    if (action === "open") {
      const batch = JSON.parse(
        (await repository.readFile(ledgerId, draftPath(String(body.id))))
          .content,
      ) as Batch;
      resumeClassification(request, batch);
      return present(batch, await context(repository, ledgerId));
    }
    if (action === "start-classification") return startClassification(request);
    if (action === "classification-status")
      return classificationStatus(request);
    if (action === "set-lock") return setLock(request);
    if (action === "set-import-status") return setImportStatus(request);
    if (action === "delete-draft") return deleteDraft(request);
    if (action === "create-account") return createAccount(request);
    if (action === "link-account" || action === "link-counterparty")
      return linkAccount(request);
    if (action === "delete-mapping-group") return deleteMappingGroup(request);
    if (action === "reorder-mappings") return reorderMappings(request);
    if (action === "import") return importStatement(request);
    if (action !== "save" && action !== "commit")
      throw new Error("未知导入操作");
    const { batch, file, ctx } = await loadBatch(request);
    applyEdits(batch, body.rows);
    batch.rows = matchRefunds(batch).rows;
    if (action === "save") {
      await repository.writeFile(
        ledgerId,
        file.path,
        JSON.stringify(batch, null, 2) + "\n",
        file.sha256,
        { commitMessage: `Save payment draft ${batch.filename}` },
      );
      return present(batch, ctx);
    }
    return commitBatch(request, batch, file, ctx);
  },
};
export default backend;
