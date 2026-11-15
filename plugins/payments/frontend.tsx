import React, { useRef } from "react";
import type { Props } from "./frontend/types";
import { usePayments } from "./frontend/use-payments";
import { AccountDialog } from "./frontend/account-dialog";
import { ClassificationDialog } from "./frontend/classification-dialog";
import { TransactionTable } from "./frontend/transaction-table";
import { BulkSelectionActions } from "./frontend/transaction-header";
import { Pagination } from "./frontend/pagination";
import { styles } from "./frontend/styles";
import { providerName } from "./frontend/display";
import { StatementList } from "./frontend/statement-list";
import { MappingManager } from "./frontend/mapping-manager";
import { FloatingReviewDock } from "./frontend/floating-review-dock";
import {
  RefundTypeFilter,
  WarningTypeFilter,
  AiTypeFilter,
} from "./frontend/warning-type-filter";
import { reviewWarnings } from "./review";
export default function PaymentsPlugin(props: Props) {
  const { canWrite } = props;
  const workspaceRef = useRef<HTMLElement>(null);
  const commitButtonRef = useRef<HTMLButtonElement>(null);
  const controller = usePayments(props);
  const committedCount = controller.rows.filter(
    (row) => row.committedAt,
  ).length;
  const hasCommitted = !!controller.batch?.committedAt || committedCount > 0;
  const {
    catalog,
    batch,
    rows,
    reviewRows,
    busy,
    error,
    notice,
    dirty,
    filter,
    setFilter,
    excludeCompleted,
    setExcludeCompleted,
    warningTypes,
    setWarningTypes,
    setSearch,
    clearColumnFilters,
    setPage,
    bulkSelectionUndo,
    undoBulkSelection,
    confirmCommit,
    setConfirmCommit,
    editable,
    open,
    importExisting,
    upload,
    deleteDraft,
    save,
    selected,
    clearSelectedTransactions,
    showSelectedTransactions,
    notImportedCount,
    pendingCount,
    missing,
    unmappedCount,
    pendingReviewCount,
    markSelectedNotImported,
    showPendingReview,
    showMissingSelectedAccounts,
    reviewPendingTransactions,
    prepareClassification,
    setLock,
  } = controller;
  const showFilter = (value: string) => {
    setFilter(value);
    setPage(0);
  };
  const reviewedCount = committedCount + notImportedCount;
  const committedPercent = rows.length
    ? (committedCount / rows.length) * 100
    : 0;
  const notImportedPercent = rows.length
    ? (notImportedCount / rows.length) * 100
    : 0;
  const pendingPercent = rows.length ? (pendingCount / rows.length) * 100 : 0;
  const reviewComplete = !!batch && pendingCount === 0;
  const currentStep = !batch ? 1 : reviewComplete ? 3 : 2;
  const activeFilterLabel =
    {
      all: "全部交易",
      selected: "已选中",
      aiSuccess: "AI 有效分类成功",
      aiFailed: "AI 无有效分类 / 归入其他",
      aiPending: "AI 尚未处理",
      aiResults: "全部 AI 结果",
      aiClassified: "AI 已设置账户",
      aiUnclassified: "AI 无法分类 / 失败（含其他）",
      aiUnprocessed: "尚未 AI 分类",
      pending: "待审核",
      committed: "已入账",
      notImported: "不导入",
      duplicates: "重复候选",
      unmapped: "待补账户",
      selectedUnmapped: "本次入账待补账户",
      reviewRequired: "待核对确认",
      allRefunds: "全部退款匹配",
      fullRefunds: "退款配对",
      refunds: "退款不完全匹配",
      locked: "已锁定",
      warnings: warningTypes.length
        ? `核对提示：${warningTypes.map((type) => reviewWarnings[type].label).join("、")}`
        : "核对提示",
      neutral: "不计收支",
    }[filter] ?? "全部交易";
  const resetView = () => {
    setFilter("all");
    setExcludeCompleted(true);
    setWarningTypes([]);
    setSearch("");
    clearColumnFilters();
    setPage(0);
  };
  return (
    <section className="payments-plugin" data-reviewing={!!batch}>
      <style>{styles}</style>
      <header className="pm-page-head">
        <div className="pm-page-copy">
          <span className="pm-eyebrow">PAYMENTS WORKSPACE</span>
          <h1>账单导入</h1>
          <p>
            先把账单变成可核对的草稿，再集中处理账户、分类与重复项，
            最后确认写入账本。
          </p>
        </div>
        <ol className="pm-workflow" aria-label="账单处理流程">
          <li data-state={currentStep === 1 ? "active" : "done"}>
            <span>01</span>
            <div>
              <strong>导入</strong>
              <small>支付宝 CSV / 微信 XLSX</small>
            </div>
          </li>
          <li
            data-state={
              currentStep === 2 ? "active" : currentStep > 2 ? "done" : "idle"
            }
          >
            <span>02</span>
            <div>
              <strong>审核</strong>
              <small>账户、分类与重复项</small>
            </div>
          </li>
          <li data-state={reviewComplete ? "done" : "idle"}>
            <span>03</span>
            <div>
              <strong>入账</strong>
              <small>确认后写入 Bean</small>
            </div>
          </li>
        </ol>
        <span className="pm-local-badge">
          <i aria-hidden="true" />
          本地草稿 · 不会自动记账
        </span>
      </header>
      {!canWrite && (
        <p className="pm-readonly" role="status">
          当前账本为只读，可查看批次，不能导入或修改。
        </p>
      )}
      {error && (
        <div className="pm-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="pm-notice" role="status">
          {notice}
        </div>
      )}
      {busy && (
        <div className="pm-activity" role="status" aria-live="polite">
          <span className="pm-activity-dot" aria-hidden="true" />
          {busy}
        </div>
      )}
      <AccountDialog controller={controller} />
      {batch && <ClassificationDialog controller={controller} />}
      {catalog && (
        <StatementList
          catalog={catalog}
          canWrite={canWrite}
          busy={busy}
          open={open}
          importExisting={importExisting}
          deleteDraft={deleteDraft}
          upload={upload}
          activeBatchId={batch?.id}
        />
      )}
      <MappingManager controller={controller} canWrite={canWrite} />
      {batch && (
        <>
          <article className="pm-review-workspace" ref={workspaceRef}>
            <header className="pm-workspace-head">
              <div className="pm-batch-identity">
                <span
                  className="pm-batch-provider"
                  data-provider={batch.provider}
                  aria-hidden="true"
                >
                  {batch.provider === "alipay"
                    ? "支"
                    : batch.provider === "wechat"
                      ? "微"
                      : "账"}
                </span>
                <div>
                  <span className="pm-batch-kicker">
                    当前审核批次 · {providerName(batch.provider)}
                  </span>
                  <h2>{batch.filename}</h2>
                  <div className="pm-batch-meta">
                    <span>
                      <b>原始账单</b>
                      <span title={batch.sourcePath}>{batch.sourcePath}</span>
                    </span>
                    {batch.outputPath && (
                      <span>
                        <b>Bean 输出</b>
                        <span title={batch.outputPath}>{batch.outputPath}</span>
                      </span>
                    )}
                    <span>
                      <b>记录范围</b>
                      {rows.length} 笔
                    </span>
                  </div>
                </div>
              </div>
              <div className="pm-batch-utility-actions">
                <span
                  className="pm-save-state"
                  data-state={
                    batch.locked ? "locked" : dirty ? "dirty" : "saved"
                  }
                >
                  <i aria-hidden="true" />
                  {batch.locked
                    ? "草稿已锁定"
                    : dirty
                      ? "有未保存修改"
                      : "草稿已保存"}
                </span>
                <button
                  className="pm-quiet-button"
                  disabled={!canWrite || !!busy}
                  onClick={() => void setLock(!batch.locked)}
                >
                  {batch.locked ? "解锁草稿" : "锁定草稿"}
                </button>
                <span
                  className="pm-delete-control"
                  title={
                    hasCommitted ? "已有入账记录，不能删除草稿" : undefined
                  }
                >
                  <button
                    className="pm-quiet-button pm-danger"
                    disabled={!canWrite || !!busy || hasCommitted}
                    onClick={() =>
                      void deleteDraft({
                        ...batch,
                        revision: controller.detail!.revision,
                      })
                    }
                  >
                    删除当前草稿
                  </button>
                </span>
              </div>
            </header>
            <TransactionTable
              controller={controller}
              ledgerId={props.ledgerId}
              overview={
                <div className="pm-filter-board" aria-label="筛选显示">
                  <div className="pm-filter-board-head">
                    <div>
                      <span className="pm-section-label">审核视图</span>
                      <strong>只改变显示范围，不改变勾选状态</strong>
                    </div>
                    <button className="pm-text-button" onClick={resetView}>
                      重置视图
                    </button>
                  </div>
                  <div className="pm-filter-groups">
                    <div
                      className="pm-filter-cluster"
                      role="group"
                      aria-label="主流程"
                      data-review-group="main"
                    >
                      <span className="pm-filter-cluster-label">主流程</span>
                      <div className="pm-stats">
                        <button
                          className="pm-stat"
                          aria-pressed={filter === "all"}
                          title="只筛选显示全部交易，不改变选中状态"
                          onClick={() => showFilter("all")}
                        >
                          <strong>{rows.length}</strong> 交易
                        </button>
                        <button
                          className="pm-stat"
                          aria-pressed={filter === "selected"}
                          title="只筛选显示已选中交易，不改变选中状态"
                          onClick={() => showFilter("selected")}
                        >
                          <strong>{selected.length}</strong> 已选中
                        </button>
                        <button
                          className="pm-stat"
                          aria-pressed={filter === "pending"}
                          title="只筛选显示仍需审核的交易，不改变选中状态"
                          onClick={() => showFilter("pending")}
                        >
                          <strong>{pendingCount}</strong> 待审核
                        </button>
                      </div>
                    </div>
                    <div
                      className="pm-filter-cluster"
                      role="group"
                      aria-label="重点核对"
                      data-review-group="focus"
                    >
                      <span className="pm-filter-cluster-label">重点核对</span>
                      <div className="pm-stats">
                        <button
                          className="pm-stat"
                          aria-pressed={filter === "unmapped"}
                          title="统计并筛选全批次缺少资金或分类账户的交易，不受是否勾选影响"
                          onClick={() => showFilter("unmapped")}
                        >
                          <strong>{unmappedCount}</strong> 待选账户
                        </button>
                        <RefundTypeFilter
                          key={`refunds-${batch.id}`}
                          controller={controller}
                        />
                        <button
                          className="pm-stat"
                          aria-pressed={filter === "neutral"}
                          title="只筛选显示原账单标记为不计收支的交易，不改变选中状态"
                          onClick={() => showFilter("neutral")}
                        >
                          <strong>
                            {
                              reviewRows.filter(
                                (row) => row.direction === "不计收支",
                              ).length
                            }
                          </strong>{" "}
                          不计收支
                        </button>
                        <WarningTypeFilter
                          key={`warnings-${batch.id}`}
                          controller={controller}
                        />
                        <AiTypeFilter
                          key={`ai-${batch.id}`}
                          controller={controller}
                        />
                      </div>
                    </div>
                    <div
                      className="pm-filter-cluster"
                      role="group"
                      aria-label="已完成"
                      data-review-group="complete"
                    >
                      <div className="pm-filter-cluster-heading">
                        <span className="pm-filter-cluster-label">已完成</span>
                        <label
                          className="pm-completed-toggle"
                          title={
                            filter === "committed" || filter === "notImported"
                              ? "查看已完成时临时关闭，切回其他面板恢复上次设置"
                              : "排除已入账和不导入的交易，同时更新重点核对数量与交易列表"
                          }
                        >
                          <input
                            type="checkbox"
                            role="switch"
                            checked={excludeCompleted}
                            onChange={(event) =>
                              setExcludeCompleted(event.target.checked)
                            }
                          />
                          <span>排除已完成</span>
                        </label>
                      </div>
                      <div className="pm-stats">
                        <button
                          className="pm-stat pm-stat-posted"
                          aria-pressed={filter === "committed"}
                          title="只筛选显示已入账交易，不改变选中状态"
                          onClick={() => showFilter("committed")}
                        >
                          <strong>{committedCount}</strong> 已入账
                        </button>
                        <button
                          className="pm-stat"
                          aria-pressed={filter === "notImported"}
                          title="只筛选显示已标记为不导入的交易，不改变选中状态"
                          onClick={() => showFilter("notImported")}
                        >
                          <strong>{notImportedCount}</strong> 不导入
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="pm-view-switcher-note">
                    当前筛选：{activeFilterLabel} · 只改变显示范围
                  </span>
                </div>
              }
            />
            <Pagination controller={controller} />
          </article>
          <FloatingReviewDock anchorRef={workspaceRef}>
            {confirmCommit && (
              <div
                className="pm-confirm pm-commit-confirm"
                role="region"
                aria-label="入账确认"
              >
                <div>
                  <span className="pm-eyebrow">FINAL CHECK</span>
                  <h3>将 {selected.length} 笔交易写入账本</h3>
                  <p>
                    输出到 {catalog?.output}
                    /，并纳入当前账本。请最后确认资金账户、退款、重复候选及 AI
                    分类。
                  </p>
                </div>
                <div className="pm-confirm-facts">
                  <span>
                    <strong>{selected.length}</strong>
                    待写入
                  </span>
                  <span>
                    <strong>{missing}</strong>
                    缺少账户
                  </span>
                  <span>
                    <strong>{pendingReviewCount}</strong>
                    待核对确认
                  </span>
                </div>
                <div className="pm-bar">
                  <button
                    className="pm-primary"
                    autoFocus
                    disabled={!editable}
                    onClick={() => void save(true)}
                  >
                    确认写入 Bean
                  </button>
                  <button
                    onClick={() => {
                      setConfirmCommit(false);
                      commitButtonRef.current?.focus();
                    }}
                  >
                    返回审核
                  </button>
                </div>
              </div>
            )}
            <div className="pm-dock-summary">
              <div className="pm-dock-heading">
                <span className="pm-section-label">本次入账</span>
                <details
                  className="pm-review-guide"
                  onKeyDown={(event) => {
                    if (event.key !== "Escape") return;
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector("summary")?.focus();
                  }}
                >
                  <summary aria-label="审核规则与提示" title="审核规则与提示">
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <circle cx="10" cy="10" r="7.5" />
                      <path d="M8 7.5a2 2 0 0 1 4 0c0 1.5-2 1.5-2 3" />
                      <path d="M10 13.5h.01" />
                    </svg>
                  </summary>
                  <div className="pm-review-guide-body">
                    <strong>审核规则与提示</strong>
                    <p>
                      已入账记录保留锁定；不导入会锁定交易，点击「可导入」清除标记并解锁。
                    </p>
                    <p>
                      关闭 /
                      失败、退款相关及不计收支的交易默认不选。已关联的原支出与退款合并为分组，展开可逐笔审核；全额匹配显示灰色卡片，不完全匹配显示橙色提醒，并列出支付、退款与净差额。搜索或筛选命中其中一笔时保留整个关联组，分页不会拆组。部分退款需核对实际净额后处理。银行卡、余额宝、组合支付需选择实际资金账户。不计收支交易可编辑正负金额（资金流入为正）。AI
                      建议只作参考。
                    </p>
                    <div className="pm-legend" aria-label="交易颜色说明">
                      <span data-tone="expense">● 支出</span>
                      <span data-tone="income">● 收入</span>
                      <span data-tone="transfer">● 账户流转</span>
                      <span data-tone="refund">● 全额退款配对</span>
                    </div>
                    {batch.ignored > 0 && (
                      <p className="pm-muted">
                        已跳过 {batch.ignored} 行空白或说明行。
                      </p>
                    )}
                    <p className="pm-muted">
                      AI 使用账本现有配置，按每批 50 笔自动分批处理；已保存的 AI
                      结果和手动具体分类会直接复用。
                    </p>
                  </div>
                </details>
              </div>
              <div className="pm-dock-selection">
                <strong>{selected.length} 笔已勾选</strong>
                <div className="pm-dock-selection-actions">
                  <button
                    type="button"
                    aria-label="查看勾选项目"
                    aria-pressed={filter === "selected"}
                    title="查看本批次全部待入账的勾选项目，清除其他筛选"
                    disabled={!selected.length}
                    onClick={() => {
                      showSelectedTransactions();
                      workspaceRef.current
                        ?.querySelector(".pm-queue-card")
                        ?.scrollIntoView?.({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  >
                    查看
                  </button>
                  <button
                    type="button"
                    aria-label="清空所有勾选"
                    title="清空本批次所有待入账项目的勾选，不受当前筛选影响；可撤销"
                    disabled={!editable || !selected.length}
                    onClick={clearSelectedTransactions}
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>
            <div className="pm-progress-block pm-dock-progress">
              <div className="pm-progress-heading">
                <span className="pm-section-label">本批次进度</span>
                <strong>
                  已处理 {reviewedCount} / {rows.length} 笔
                </strong>
              </div>
              <div
                className="pm-progress-track"
                role="img"
                aria-label={`${rows.length} 笔交易中 ${reviewedCount} 笔已处理，${pendingCount} 笔待审核`}
              >
                <span
                  className="pm-progress-committed"
                  style={{ width: `${committedPercent}%` }}
                />
                <span
                  className="pm-progress-skipped"
                  style={{ width: `${notImportedPercent}%` }}
                />
                <span
                  className="pm-progress-pending"
                  style={{ width: `${pendingPercent}%` }}
                />
              </div>
              <p className="pm-progress-caption">
                <span>
                  <i className="is-committed" aria-hidden="true" />
                  {committedCount} 已入账
                </span>
                <span>
                  <i className="is-skipped" aria-hidden="true" />
                  {notImportedCount} 不导入
                </span>
                <span>
                  <i className="is-pending" aria-hidden="true" />
                  {pendingCount} 待审核
                </span>
              </p>
            </div>
            <div className="pm-dock-actions">
              {bulkSelectionUndo && (
                <div
                  className="pm-selection-undo"
                  role="status"
                  aria-label={`已批量修改 ${bulkSelectionUndo.changes.length} 笔的选中状态`}
                  title={bulkSelectionUndo.label}
                >
                  <span>
                    已批量修改{" "}
                    <strong>{bulkSelectionUndo.changes.length}</strong>{" "}
                    笔的选中状态
                  </span>
                  <button disabled={!editable} onClick={undoBulkSelection}>
                    撤销
                  </button>
                </div>
              )}
              <div className="pm-bar pm-review-actions">
                <button
                  className="pm-draft-save"
                  data-saved={!dirty}
                  disabled={!editable || !dirty}
                  aria-busy={busy === "保存草稿…"}
                  title={dirty ? "保存当前审核修改" : "没有未保存的修改"}
                  onClick={() => void save()}
                >
                  {busy === "保存草稿…"
                    ? "保存中…"
                    : dirty
                      ? "保存审核草稿"
                      : "已保存审核草稿"}
                </button>
                <button
                  className="pm-account-settings"
                  aria-haspopup="dialog"
                  disabled={!canWrite || !!busy || !!batch.locked}
                  title="手动统一关联账户，或确认后为已勾选的待分类交易使用 AI"
                  onClick={(event) => {
                    event.currentTarget.focus({ preventScroll: true });
                    prepareClassification();
                  }}
                >
                  账户设置与 AI 分类
                </button>
                <BulkSelectionActions controller={controller} />
                <button
                  className="pm-not-import-button"
                  disabled={!editable || !selected.length}
                  onClick={() => void markSelectedNotImported()}
                >
                  标记不导入 {selected.length} 笔
                </button>
                <button
                  className="pm-primary pm-commit-primary"
                  ref={commitButtonRef}
                  disabled={
                    !editable ||
                    !selected.length ||
                    !!missing ||
                    !!pendingReviewCount
                  }
                  onClick={() => setConfirmCommit(true)}
                >
                  确认入账 {selected.length} 笔
                </button>
              </div>
              {(!!missing || !!pendingReviewCount) && (
                <div className="pm-review-notices">
                  {!!missing && (
                    <span
                      className="pm-warning pm-warning-review"
                      role="group"
                      aria-label="账户待补齐"
                    >
                      <span>请补齐 {missing} 笔账户</span>
                      <button
                        className="pm-review-button pm-review-view"
                        aria-pressed={filter === "selectedUnmapped"}
                        title="清除其他筛选，查看本次已选中、未锁定且未入账的缺账户交易"
                        onClick={showMissingSelectedAccounts}
                      >
                        一键查看
                      </button>
                    </span>
                  )}
                  {!!pendingReviewCount && (
                    <span
                      className="pm-warning pm-warning-review"
                      role="group"
                      aria-label="待核对确认"
                    >
                      <span>{pendingReviewCount} 笔待核对确认</span>
                      <button
                        className="pm-review-button pm-review-view"
                        aria-pressed={filter === "reviewRequired"}
                        title="清除其他筛选，查看全部已选中且待核对确认的交易"
                        onClick={showPendingReview}
                      >
                        一键查看
                      </button>
                      <button
                        className="pm-review-button"
                        disabled={!editable}
                        title="将全部已选中、未锁定且未入账交易的待确认项标记为已核对"
                        onClick={reviewPendingTransactions}
                      >
                        一键核对
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </FloatingReviewDock>
        </>
      )}
    </section>
  );
}
