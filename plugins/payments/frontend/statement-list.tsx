import React from "react";
import type { Batch } from "../types";
import type { Catalog } from "./types";
import { providerName } from "./display";
import { UploadCards } from "./upload-cards";

type Draft = Catalog["batches"][number];

type StatementEntry = {
  key: string;
  path: string;
  filename: string;
  provider: Batch["provider"] | "";
  draft?: Draft;
  missingSource?: boolean;
};

function filenameOf(path: string) {
  return path.split("/").at(-1) ?? path;
}

function reportedProvider(path: string): Batch["provider"] | "" {
  if (/\/alipay\//iu.test(path) || /支付宝/u.test(path)) return "alipay";
  if (/\/wechatpay\//iu.test(path) || /微信/u.test(path)) return "wechat";
  return "";
}

function matchesDraft(path: string, draft: Draft) {
  if (draft.sourcePath === path) return true;
  const filename = filenameOf(path);
  if (filenameOf(draft.sourcePath) === filename) return true;
  // Uploaded statements are archived with the beginning of their SHA-256.
  return (
    filename.startsWith(`${draft.id.slice(0, 12)}-`) ||
    filename.startsWith(`${draft.id}-`)
  );
}

function statementEntries(catalog: Catalog): StatementEntry[] {
  const matched = new Set<string>();
  const files = catalog.files.map((path) => {
    const draft = catalog.batches.find(
      (candidate) =>
        !matched.has(candidate.id) && matchesDraft(path, candidate),
    );
    if (draft) matched.add(draft.id);
    return {
      key: `file:${path}`,
      path,
      filename: filenameOf(path),
      provider: draft?.provider ?? reportedProvider(path),
      draft,
    };
  });
  const draftsWithoutSource = catalog.batches
    .filter((draft) => !matched.has(draft.id))
    .map((draft) => ({
      key: `draft:${draft.id}`,
      path: draft.sourcePath,
      filename: draft.filename,
      provider: draft.provider,
      draft,
      missingSource: true,
    }));
  return [...files, ...draftsWithoutSource];
}

function draftStatus(draft: Draft) {
  const committed = draft.committedCount ?? 0;
  const notImported = draft.notImportedCount ?? 0;
  const pending = draft.count - committed - notImported;
  if (pending === 0) {
    if (committed === draft.count)
      return { label: "已全部入账", tone: "posted" };
    if (committed === 0) return { label: "已全部标记不导入", tone: "posted" };
    return { label: "已全部处理", tone: "posted" };
  }
  if (committed > 0) return { label: "部分入账", tone: "partial" };
  if (draft.locked) return { label: "草稿已锁定", tone: "locked" };
  return { label: "待审核", tone: "pending" };
}

export function StatementList({
  catalog,
  canWrite,
  busy,
  open,
  importExisting,
  deleteDraft,
  upload,
  activeBatchId,
}: {
  catalog: Catalog;
  canWrite: boolean;
  busy: string;
  open: (id: string) => Promise<void>;
  importExisting: (path: string) => Promise<void>;
  deleteDraft: (draft: Draft) => Promise<void>;
  upload: (file: File, provider: Batch["provider"]) => Promise<void>;
  activeBatchId?: string;
}) {
  const entries = statementEntries(catalog);
  return (
    <section
      className="pm-card pm-statements-card"
      aria-labelledby="pm-statements-title"
    >
      <div className="pm-statements-head">
        <div>
          <div className="pm-statements-title">
            <span className="pm-eyebrow">STATEMENT LIBRARY</span>
            <h2 id="pm-statements-title">账单库</h2>
            <span className="pm-statement-count">
              {catalog.files.length} 个文件
            </span>
          </div>
          <p className="pm-muted">
            选择已有账单继续处理，或导入新账单。导入只会生成审核草稿，不会直接记账。
          </p>
        </div>
        <div className="pm-upload-actions">
          <span className="pm-section-label">导入新账单</span>
          <UploadCards disabled={!canWrite || !!busy} upload={upload} />
        </div>
      </div>
      {entries.length ? (
        <div className="pm-statement-list" aria-label="账单文件与草稿状态">
          {entries.map((entry) => {
            const draft = entry.draft;
            const committed = draft?.committedCount ?? 0;
            const notImported = draft?.notImportedCount ?? 0;
            const pending = draft ? draft.count - committed - notImported : 0;
            const status = draft ? draftStatus(draft) : undefined;
            const hasCommitted = !!draft?.committedAt || committed > 0;
            return (
              <article
                className={`pm-statement${draft?.id === activeBatchId ? " is-active" : ""}`}
                key={entry.key}
                aria-label={`${entry.filename} 账单状态`}
              >
                <span
                  className="pm-statement-provider"
                  data-provider={entry.provider || undefined}
                  aria-hidden="true"
                >
                  {entry.provider === "alipay"
                    ? "支"
                    : entry.provider === "wechat"
                      ? "微"
                      : "账"}
                </span>
                <div className="pm-statement-main">
                  <div className="pm-statement-heading">
                    <strong className="pm-statement-name" title={entry.path}>
                      {entry.filename}
                    </strong>
                    {status && (
                      <span
                        className="pm-statement-status"
                        data-tone={status.tone}
                      >
                        {status.label}
                      </span>
                    )}
                    {entry.missingSource && (
                      <span className="pm-statement-status" data-tone="missing">
                        原文件缺失
                      </span>
                    )}
                  </div>
                  <p className="pm-statement-path" title={entry.path}>
                    {entry.provider ? `${providerName(entry.provider)} · ` : ""}
                    {entry.path}
                  </p>
                  {draft ? (
                    <div
                      className="pm-statement-counts"
                      aria-label={`${entry.filename} 草稿统计`}
                    >
                      <span>
                        草稿 <b>{draft.count}</b> 笔
                      </span>
                      <span>
                        已入账 <b>{committed}</b> 笔
                      </span>
                      <span>
                        不导入 <b>{notImported}</b> 笔
                      </span>
                      <span>
                        待审核 <b>{pending}</b> 笔
                      </span>
                      {draft.locked && draftStatus(draft).tone !== "locked" && (
                        <span>草稿已锁定</span>
                      )}
                    </div>
                  ) : (
                    <p className="pm-statement-empty">
                      尚未生成草稿。导入后才能逐笔核对账户、分类和重复候选。
                    </p>
                  )}
                </div>
                <div className="pm-statement-actions">
                  {draft ? (
                    <>
                      <button
                        className="pm-statement-primary"
                        disabled={!!busy || !!entry.missingSource}
                        title={
                          entry.missingSource
                            ? "原始账单文件缺失，暂时无法继续审核"
                            : undefined
                        }
                        onClick={() => void open(draft.id)}
                      >
                        {status?.tone === "posted" && committed > 0
                          ? "查看记录"
                          : status?.tone === "posted"
                            ? "查看草稿"
                            : "继续审核"}
                      </button>
                      <span
                        className="pm-delete-control"
                        title={
                          hasCommitted
                            ? "已有入账记录，不能删除草稿"
                            : undefined
                        }
                      >
                        <button
                          className="pm-statement-delete pm-danger"
                          aria-label={`删除草稿：${draft.filename}`}
                          disabled={!canWrite || !!busy || hasCommitted}
                          onClick={() => void deleteDraft(draft)}
                        >
                          删除草稿
                        </button>
                      </span>
                    </>
                  ) : (
                    <button
                      className="pm-statement-primary"
                      disabled={!canWrite || !!busy}
                      onClick={() => void importExisting(entry.path)}
                    >
                      导入账单
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="pm-statements-empty">
          账单文件夹中暂无账单，可从右上角导入支付宝或微信账单。
        </p>
      )}
      <p className="pm-statements-footer">
        <span>读取：{catalog.input}/</span>
        <span>写入：{catalog.output}/</span>
      </p>
    </section>
  );
}
