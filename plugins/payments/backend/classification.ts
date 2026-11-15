import { randomUUID } from "node:crypto";
import type { PluginRequest } from "@beancount/plugin";
import type { Batch, ClassificationProgress, Suggestion } from "../types";
import {
  classificationFailure,
  classificationResults,
  classificationRunning,
  needsClassification,
} from "../classification";
import { applyEdits, loadBatch, present } from "./batches";
import { context } from "./context";
import { draftPath } from "./utils";

export function resumeClassification(request: PluginRequest, batch: Batch) {
  if (!classificationRunning(batch.classification) || !request.ai) return;
  request.tasks.start(batch.id, () => runClassification(request, batch.id));
}

async function runClassification(request: PluginRequest, id: string) {
  const { repository, ledgerId, ai } = request;
  if (!ai) return;
  const read = async () => {
    const file = await repository.readFile(ledgerId, draftPath(id));
    return { file, batch: JSON.parse(file.content) as Batch };
  };
  while (true) {
    const snapshot = await repository.exclusive(ledgerId, read);
    const progress = snapshot.batch.classification;
    if (!progress || !classificationRunning(progress)) return;
    const ids = progress.candidateIds.slice(
      progress.processed,
      progress.processed + progress.batchSize,
    );
    const rowsById = new Map(snapshot.batch.rows.map((row) => [row.id, row]));
    const chunk = ids.map((rowId) => rowsById.get(rowId)!);
    if (chunk.some((row) => !row || !needsClassification(row))) {
      await repository.exclusive(ledgerId, async () => {
        const { file, batch } = await read();
        if (batch.classification?.jobId !== progress.jobId) return;
        batch.classification = {
          ...progress,
          phase: "failed",
          error: "交易已变化，分类已暂停；请核对后重试未完成分类。",
        };
        await repository.writeFile(
          ledgerId,
          file.path,
          JSON.stringify(batch, null, 2) + "\n",
          file.sha256,
        );
      });
      return;
    }
    const accounts = await repository.exclusive(
      ledgerId,
      async () => (await context(repository, ledgerId)).accounts,
    );
    let suggestions: Suggestion[] = [];
    let requestError = "";
    try {
      suggestions = await ai.categorizeTransactions(
        chunk.map((row, rowIndex) => ({
          rowIndex,
          date: row.date,
          payee: row.payee,
          description: `${row.description}；${row.category}；${row.direction}；支付方式：${row.payment}`,
          amount: Number(row.amount),
        })),
        accounts
          .filter((account) => !account.closed)
          .map((account) => account.name),
      );
    } catch (cause) {
      requestError = cause instanceof Error ? cause.message : String(cause);
    }
    const result = classificationResults(
      chunk,
      accounts,
      suggestions,
      requestError,
    );
    try {
      await repository.exclusive(ledgerId, async () => {
        const { file, batch } = await read();
        if (batch.classification?.jobId !== progress.jobId)
          throw new Error("分类任务已变化");
        if (file.sha256 !== snapshot.file.sha256)
          throw new Error("审核草稿已变化，请重新核对");
        applyEdits(
          batch,
          batch.rows.map((row) => ({ ...row, ...result.patches.get(row.id) })),
        );
        const processed = progress.processed + chunk.length;
        batch.classification = {
          ...progress,
          phase: requestError
            ? "failed"
            : processed === progress.total
              ? "complete"
              : "classifying",
          processed,
          succeeded: progress.succeeded + result.succeededIds.length,
          succeededIds: [...progress.succeededIds, ...result.succeededIds],
          failed: progress.failed + result.failures.length,
          failures: [...progress.failures, ...result.failures],
          batch:
            processed === progress.total || requestError
              ? progress.batch
              : progress.batch + 1,
          error: requestError,
        };
        await repository.writeFile(
          ledgerId,
          file.path,
          JSON.stringify(batch, null, 2) + "\n",
          file.sha256,
          { commitMessage: `Save payment AI classification ${batch.filename}` },
        );
      });
    } catch (cause) {
      await repository.exclusive(ledgerId, async () => {
        const { file, batch } = await read();
        if (batch.classification?.jobId !== progress.jobId) return;
        const error = cause instanceof Error ? cause.message : String(cause);
        batch.classification = {
          ...progress,
          phase: "failed",
          processed: progress.processed + chunk.length,
          failed: progress.failed + chunk.length,
          error,
          failures: [
            ...progress.failures,
            ...chunk.map((row) =>
              classificationFailure(
                row,
                `本批分类结果保存失败：${error}`,
                result.suggestionsByRow.get(row.id),
              ),
            ),
          ],
        };
        await repository.writeFile(
          ledgerId,
          file.path,
          JSON.stringify(batch, null, 2) + "\n",
          file.sha256,
        );
      });
      return;
    }
    if (requestError || progress.processed + chunk.length >= progress.total)
      return;
  }
}

export async function startClassification(request: PluginRequest) {
  const storedFile = await request.repository.readFile(
    request.ledgerId,
    draftPath(String(request.body.id)),
  );
  const stored = JSON.parse(storedFile.content) as Batch;
  if (classificationRunning(stored.classification)) {
    resumeClassification(request, stored);
    return present(stored, await context(request.repository, request.ledgerId));
  }
  if (!request.ai) throw new Error("AI 分类服务不可用");
  const { batch, file, ctx } = await loadBatch(request);
  applyEdits(batch, request.body.rows);
  const selected = batch.rows.filter(
    (row) =>
      row.selected && !row.locked && !row.committedAt && !row.notImported,
  );
  const candidates = selected.filter(needsClassification);
  const progress: ClassificationProgress = {
    jobId: randomUUID(),
    phase: candidates.length ? "classifying" : "complete",
    total: candidates.length,
    skipped: selected.length - candidates.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    failures: [],
    succeededIds: [],
    candidateIds: candidates.map((row) => row.id),
    batch: candidates.length ? 1 : 0,
    batches: Math.ceil(candidates.length / 50),
    batchSize: 50,
    error: "",
  };
  batch.classification = progress;
  await request.repository.writeFile(
    request.ledgerId,
    file.path,
    JSON.stringify(batch, null, 2) + "\n",
    file.sha256,
  );
  resumeClassification(request, batch);
  return present(batch, ctx);
}

export async function classificationStatus(request: PluginRequest) {
  const file = await request.repository.readFile(
    request.ledgerId,
    draftPath(String(request.body.id)),
  );
  const batch = JSON.parse(file.content) as Batch;
  resumeClassification(request, batch);
  return {
    progress: batch.classification ?? null,
    detail:
      request.body.processed !== batch.classification?.processed ||
      !classificationRunning(batch.classification)
        ? await present(
            batch,
            await context(request.repository, request.ledgerId),
          )
        : undefined,
  };
}
