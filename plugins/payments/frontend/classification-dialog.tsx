import React, {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useEscapeDismiss } from "@plugins/shared/frontend/use-escape-dismiss";
import type { ClassificationProgress } from "./types";
import type { PaymentsController } from "./use-payments";
import { AccountLinkingEntry } from "./account-linking-entry";

export function ClassificationDialog({
  controller,
}: {
  controller: PaymentsController;
}) {
  const accountPanel = useSyncExternalStore(
    controller.accountPanelState.subscribe,
    controller.accountPanelState.getSnapshot,
    controller.accountPanelState.getSnapshot,
  );
  const savedProgress = useSyncExternalStore(
    controller.classificationState.subscribe,
    controller.classificationState.getSnapshot,
    controller.classificationState.getSnapshot,
  );
  const display = useSyncExternalStore(
    controller.classificationDisplay.subscribe,
    controller.classificationDisplay.getSnapshot,
    controller.classificationDisplay.getSnapshot,
  );
  if (!savedProgress) return null;
  const progress =
    savedProgress.phase === "ready"
      ? {
          ...savedProgress,
          total: controller.classificationCandidateCount,
          skipped:
            controller.selected.length -
            controller.classificationCandidateCount,
          batches: Math.ceil(
            controller.classificationCandidateCount / savedProgress.batchSize,
          ),
        }
      : savedProgress;
  if (display?.minimized)
    return (
      <ClassificationMini
        progress={progress}
        onExpand={() => controller.setClassificationMinimized(false)}
      />
    );
  return (
    <ClassificationDialogContent
      progress={progress}
      controller={controller}
      accountPanelOpen={!!accountPanel}
      onClose={controller.closeClassificationProgress}
      onRetry={controller.prepareClassification}
      onMinimize={() => controller.setClassificationMinimized(true)}
    />
  );
}

function ClassificationMini({
  progress,
  onExpand,
}: {
  progress: ClassificationProgress;
  onExpand(): void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const running =
    progress.phase === "classifying" || progress.phase === "saving";
  useEffect(() => {
    ref.current?.showPopover();
  }, []);
  return (
    <div
      ref={ref}
      popover="manual"
      className="pm-classification-mini"
      role="region"
      aria-label="AI 分类悬浮进度"
    >
      <button type="button" onClick={onExpand} aria-label="展开 AI 分类进度">
        <span className="pm-classification-mini-heading">
          {running && (
            <span className="pm-classification-spinner" aria-hidden="true" />
          )}
          <strong>
            {running
              ? "AI 分类进行中"
              : progress.phase === "failed"
                ? "AI 分类已暂停"
                : "AI 分类已完成"}
          </strong>
          <span aria-hidden="true">↗</span>
        </span>
        <span className="pm-classification-mini-count" role="status">
          已处理 {progress.processed} / {progress.total} 笔 · 第{" "}
          {progress.batch} / {progress.batches} 批
        </span>
        <progress
          aria-label="AI 分类处理进度"
          max={Math.max(1, progress.total)}
          value={progress.processed}
        />
        <small>
          成功 {progress.succeeded} · 无有效分类 / 失败 {progress.failed}
        </small>
      </button>
    </div>
  );
}

function ClassificationDialogContent({
  progress,
  controller,
  accountPanelOpen,
  onClose,
  onRetry,
  onMinimize,
}: {
  progress: ClassificationProgress;
  controller: PaymentsController;
  accountPanelOpen: boolean;
  onClose(): void;
  onRetry(): void;
  onMinimize(): void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef(true);
  const pointerStartedInside = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const failuresId = useId();
  const [showFailures, setShowFailures] = useState(false);
  const running =
    progress.phase === "classifying" || progress.phase === "saving";
  const preparing = progress.phase === "ready";
  const cannotClose = running || !!controller.busy || accountPanelOpen;
  const dismiss = preparing ? onClose : onMinimize;
  const remaining = progress.total - progress.processed;
  const incomplete = progress.failed > 0 || remaining > 0;
  const retryable =
    remaining > 0 ||
    progress.failures.some((failure) => !failure.fallbackAccount);
  useEscapeDismiss(dialogRef, true, () => {
    if (!cannotClose) dismiss();
  });
  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.showPopover();
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      if (
        restoreFocus.current &&
        opener instanceof HTMLElement &&
        opener.isConnected
      )
        opener.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (preparing || accountPanelOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handlePointerDown = (event: PointerEvent) => {
      pointerStartedInside.current = event.composedPath().includes(dialog);
    };
    const handleClick = (event: MouseEvent) => {
      const startedInside = pointerStartedInside.current;
      pointerStartedInside.current = false;
      if (startedInside || event.composedPath().includes(dialog)) return;
      restoreFocus.current = false;
      onMinimize();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [preparing, accountPanelOpen, onMinimize]);
  return (
    <dialog
      ref={dialogRef}
      open
      popover="manual"
      tabIndex={-1}
      className="pm-classification-dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-state={
        preparing
          ? "ready"
          : running
            ? "running"
            : incomplete
              ? "warning"
              : "success"
      }
      onCancel={(event) => {
        event.preventDefault();
        if (!cannotClose) dismiss();
      }}
      onClose={dismiss}
    >
      <header className="pm-classification-header">
        <div>
          <span className="pm-classification-eyebrow">AI CLASSIFICATION</span>
          <h2 id={titleId}>
            {preparing ? "账户设置与 AI 分类" : "AI 分类进度"}
          </h2>
        </div>
        <div className="pm-classification-window-actions">
          {!preparing && (
            <button
              type="button"
              aria-label="缩小 AI 分类进度"
              title={running ? "缩小，后台继续分类" : "缩小，保留分类结果"}
              disabled={accountPanelOpen}
              onClick={onMinimize}
            >
              −
            </button>
          )}
          <button
            type="button"
            aria-label="关闭 AI 分类进度"
            title={preparing ? "关闭" : "收起，保留分类进度"}
            disabled={cannotClose}
            onClick={dismiss}
          >
            ×
          </button>
        </div>
      </header>
      <div className="pm-classification-body">
        <p id={descriptionId}>
          本次已选 {progress.total + progress.skipped} 笔 · 需分类{" "}
          {progress.total} 笔
          {progress.skipped > 0 && (
            <span> · 跳过 {progress.skipped} 笔已有分类或 AI 分析</span>
          )}
        </p>
        {preparing ? (
          <>
            <AccountLinkingEntry controller={controller} compact />
            <section
              className="pm-classification-plan"
              aria-label="AI 调用计划"
              aria-live="polite"
            >
              <span className="pm-section-label">确认后才使用 AI</span>
              <strong>
                {progress.total
                  ? `剩余 ${progress.total} 笔需要 AI 分类`
                  : progress.skipped
                    ? "账户已设置，无需调用 AI"
                    : "尚未勾选交易，可先手动关联账户"}
              </strong>
              <p>
                {progress.total
                  ? `每批最多 ${progress.batchSize} 笔，共 ${progress.batches} 批。手动绑定后数量会自动更新。`
                  : progress.skipped
                    ? "已选交易均已有具体分类或 AI 分析，不会重复发送。"
                    : "如需 AI 分类，可在背景交易列表勾选交易，待分类数量会自动更新。"}
              </p>
            </section>
            {controller.selectedMissingFundingCount > 0 && (
              <p className="pm-classification-funding-note">
                {controller.selectedMissingFundingCount}{" "}
                笔缺少收付款资金账户，请通过「收/付款方式」手动关联，AI
                不会设置资金账户。
              </p>
            )}
          </>
        ) : (
          <>
            <div
              className="pm-classification-status"
              role="status"
              aria-live="polite"
            >
              <strong>
                {running && (
                  <span
                    className="pm-classification-spinner"
                    aria-hidden="true"
                  />
                )}
                {running
                  ? progress.phase === "saving"
                    ? "正在保存本批结果"
                    : "正在识别交易分类"
                  : progress.phase === "failed"
                    ? "本批处理失败，分类已暂停"
                    : progress.total === 0
                      ? "无需重复调用 AI"
                      : incomplete
                        ? "分类完成，部分交易未获得有效分类"
                        : "分类完成，结果已保存"}
              </strong>
              {progress.batches > 0 && (
                <span>
                  第 {progress.batch} / {progress.batches} 批
                </span>
              )}
            </div>
            <progress
              aria-label="AI 分类处理进度"
              max={Math.max(1, progress.total)}
              value={progress.processed}
            />
            <div className="pm-classification-progress-caption">
              <span>
                已处理 {progress.processed} / {progress.total} 笔
              </span>
              <span>每批最多 {progress.batchSize} 笔</span>
            </div>
            <dl className="pm-classification-results" aria-label="分类结果">
              <div data-result="success">
                <dt>成功并保存</dt>
                <dd>
                  {progress.succeeded}
                  <small>笔</small>
                  <button
                    type="button"
                    className="pm-classification-details-toggle pm-classification-view"
                    aria-label="一键查看有效分类成功交易"
                    disabled={!progress.succeeded}
                    onClick={() => controller.showClassificationRows("success")}
                  >
                    一键查看
                  </button>
                </dd>
              </div>
              <div data-result="failure">
                <dt>失败 / 无有效分类</dt>
                <dd>
                  {progress.failed}
                  <small>笔</small>
                  <button
                    type="button"
                    className="pm-classification-details-toggle pm-classification-view"
                    aria-label="一键查看失败与无有效分类交易"
                    disabled={!progress.failed}
                    onClick={() => controller.showClassificationRows("failed")}
                  >
                    一键查看
                  </button>
                  {progress.failures.length > 0 && (
                    <button
                      type="button"
                      className="pm-classification-details-toggle"
                      aria-expanded={showFailures}
                      aria-controls={failuresId}
                      onClick={() => setShowFailures((current) => !current)}
                    >
                      {showFailures ? "收起明细" : "查看明细"}
                    </button>
                  )}
                </dd>
              </div>
              <div>
                <dt>未处理</dt>
                <dd>
                  {remaining}
                  <small>笔</small>
                  <button
                    type="button"
                    className="pm-classification-details-toggle pm-classification-view"
                    aria-label="一键查看尚未处理交易"
                    disabled={!remaining}
                    onClick={() => controller.showClassificationRows("pending")}
                  >
                    一键查看
                  </button>
                </dd>
              </div>
            </dl>
            {showFailures && progress.failures.length > 0 && (
              <section
                id={failuresId}
                className="pm-classification-failures"
                aria-label="失败与无有效分类明细"
              >
                <strong>未成功分类 · {progress.failures.length} 笔</strong>
                <p>
                  无有效分类的交易归入“其他”，仍保留在本组供核对；账户不可用或保存失败会单独注明。
                </p>
                <ol>
                  {progress.failures.map((failure) => (
                    <li
                      key={failure.id}
                      aria-label={`第 ${failure.line} 行分类未成功`}
                    >
                      <strong>
                        第 {failure.line} 行 ·{" "}
                        {failure.description ||
                          failure.payee ||
                          "未注明交易内容"}
                      </strong>
                      <div className="pm-classification-failure-meta">
                        <span>
                          {failure.date} · {failure.payee || "交易对方未注明"}
                        </span>
                        <b>{failure.amount} CNY</b>
                      </div>
                      <p className="pm-classification-failure-reason">
                        {failure.reason}
                      </p>
                      <dl>
                        <div>
                          <dt>处理结果</dt>
                          <dd>
                            {failure.fallbackAccount
                              ? `已保存到 ${failure.fallbackAccount}`
                              : "未完成分配，请核对保存结果"}
                          </dd>
                        </div>
                        <div>
                          <dt>执行前分类账户</dt>
                          <dd>{failure.targetAccount || "未设置"}</dd>
                        </div>
                        {failure.suggestedAccount && (
                          <div>
                            <dt>AI 返回账户</dt>
                            <dd>{failure.suggestedAccount}</dd>
                          </div>
                        )}
                        {failure.reasoning && (
                          <div>
                            <dt>AI 说明</dt>
                            <dd>{failure.reasoning}</dd>
                          </div>
                        )}
                      </dl>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {progress.error && (
              <div className="pm-classification-error">
                <p role="alert">{progress.error}</p>
                <span>
                  已停止后续批次；此前成功结果已保存，重试只处理尚未分类的交易。
                </span>
              </div>
            )}
          </>
        )}
        <p className="pm-classification-note">
          仅设置分类账户，不修改收付款资金账户，也不会直接入账。
          无有效分类时归入“其他”，并保留 AI 分析供核对。
          {preparing
            ? "点击「开始 AI 分类」后才调用 AI，已有具体分类不会覆盖。"
            : running
              ? "任务在后台继续执行，每批自动保存；缩小或刷新页面不会中断。"
              : "请核对分类后再确认入账。"}
        </p>
      </div>
      <footer className="pm-classification-footer">
        {preparing ? (
          <>
            <button type="button" disabled={cannotClose} onClick={onClose}>
              暂不执行
            </button>
            <button
              type="button"
              className="pm-primary"
              disabled={
                !controller.editable || !progress.total || accountPanelOpen
              }
              onClick={() => void controller.classify()}
            >
              开始 AI 分类
            </button>
          </>
        ) : (
          <>
            {!running && retryable && (
              <button type="button" onClick={onRetry}>
                重试未完成分类
              </button>
            )}
            <button
              type="button"
              className="pm-primary"
              disabled={running}
              onClick={onClose}
            >
              {running ? "处理中…" : "完成"}
            </button>
          </>
        )}
      </footer>
    </dialog>
  );
}
