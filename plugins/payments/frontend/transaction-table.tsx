import React, { useEffect, useRef, useState } from "react";
import type { PaymentsController } from "./use-payments";
import { fundingAccountRoots } from "../account-scope";
import { flow, paymentMethodLabel, refundColor } from "./display";
import type { Row } from "../types";
import {
  requiresStatusReview,
  statusReviewWarning,
  transactionWarnings,
} from "../review";
import { RefundDrawer } from "./refund-drawer";
import { OriginalTransaction } from "./original-transaction";
import { AccountValue, TransactionColumns } from "./transaction-layout";
import { CollapsedTransactionHeader } from "./collapsed-transaction-header";
import {
  AccountBrowserSelect,
  accountHierarchyOptions,
  accountRootValues,
  createdAccountName,
} from "./account-picker";

type ReviewDisplayPreferences = {
  expanded: boolean;
  showCollapsedFunding: boolean;
};

function displayPreferencesKey(ledgerId: string) {
  return `payments-review-display:${ledgerId}`;
}

function readDisplayPreferences(ledgerId: string): ReviewDisplayPreferences {
  try {
    const saved = JSON.parse(
      localStorage.getItem(displayPreferencesKey(ledgerId)) ?? "null",
    ) as Partial<ReviewDisplayPreferences> | null;
    return {
      expanded: saved?.expanded === true,
      showCollapsedFunding: saved?.showCollapsedFunding !== false,
    };
  } catch {
    return { expanded: false, showCollapsedFunding: true };
  }
}

function writeDisplayPreferences(
  ledgerId: string,
  preferences: ReviewDisplayPreferences,
) {
  try {
    localStorage.setItem(
      displayPreferencesKey(ledgerId),
      JSON.stringify(preferences),
    );
  } catch {}
}

export function TransactionTable({
  controller: c,
  ledgerId,
  overview,
}: {
  controller: PaymentsController;
  ledgerId: string;
  overview?: React.ReactNode;
}) {
  const {
    pageGroups,
    filtered,
    editable,
    edit,
    accounts,
    createAccount,
    openAccountPanel,
    openCounterpartyPanel,
    openDescriptionPanel,
    setImportStatus,
  } = c;
  const fundingNames = accounts.map((account) => account.name);
  const fundingOptions = accountHierarchyOptions(
    fundingNames,
    accountRootValues,
  );
  const categoryNames = accounts.map((account) => account.name);
  const categoryOptions = accountHierarchyOptions(categoryNames, [
    ...new Set(categoryNames.map((name) => name.split(":")[0])),
  ]);
  const [displayPreferences, setDisplayPreferences] =
    useState<ReviewDisplayPreferences>(() => readDisplayPreferences(ledgerId));
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const { expanded: expandByDefault, showCollapsedFunding } =
    displayPreferences;
  const displayedRows = pageGroups.flatMap((group) => group.rows);
  const displayedRowIdsKey = displayedRows.map((row) => row.id).join("\u0000");
  const allRowsCollapsed =
    displayedRows.length > 0 &&
    displayedRows.every((row) => !expandedRowIds.has(row.id));
  useEffect(() => {
    if (!expandByDefault) return;
    setExpandedRowIds((current) => {
      const next = new Set(current);
      let changed = false;
      for (const id of displayedRowIdsKey.split("\u0000")) {
        if (!id || next.has(id)) continue;
        next.add(id);
        changed = true;
      }
      return changed ? next : current;
    });
  }, [displayedRowIdsKey, expandByDefault]);
  useEffect(() => {
    function finishPointer(event: PointerEvent) {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start) return;
      suppressClick.current =
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4;
      if (suppressClick.current)
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 0);
    }
    function cancelPointer() {
      pointerStart.current = null;
      suppressClick.current = false;
    }
    window.addEventListener("pointerup", finishPointer);
    window.addEventListener("pointercancel", cancelPointer);
    return () => {
      window.removeEventListener("pointerup", finishPointer);
      window.removeEventListener("pointercancel", cancelPointer);
    };
  }, []);
  function updateDisplayPreferences(update: Partial<ReviewDisplayPreferences>) {
    setDisplayPreferences((current) => {
      const next = { ...current, ...update };
      writeDisplayPreferences(ledgerId, next);
      return next;
    });
  }
  function toggleRowDetails(rowId: string) {
    setExpandedRowIds((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }
  function toggleRowFromClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    rowId: string,
  ) {
    if (!(event.target instanceof Element)) return;
    if (
      event.target.closest(
        "button,input,select,textarea,a,label,summary,dialog,[popover],[role=button],[role=combobox],[role=dialog],[role=listbox],[role=menu],[contenteditable=true],.pm-account-control,.pm-search-select,.pm-amount-control",
      )
    )
      return;
    toggleRowDetails(rowId);
  }
  function toggleAllRowDetails() {
    const visibleIds = displayedRows.map((row) => row.id);
    const expand = allRowsCollapsed;
    updateDisplayPreferences({ expanded: expand });
    setExpandedRowIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((id) => {
        if (expand) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }
  function renderRow(row: Row) {
    const movement = flow(row);
    const methodLabel = movement.incoming ? "收款方式" : "支付方式";
    const rowEditable = editable && !row.locked && !row.committedAt;
    const importBlocked = !!row.notImported || !!row.locked;
    const funding = row.sourceAccount || "待选资金账户";
    const category = row.targetAccount || "待选分类账户";
    const description = row.description.trim() || row.payee || "未注明交易内容";
    const statusLabel = row.status || "状态未注明";
    const amountLabel = `${Number(row.amount) > 0 && !row.amount.startsWith("+") ? "+" : ""}${row.amount}`;
    const fullRefund = c.refundKinds.get(row.id) === "full";
    const rowCollapsed = !expandedRowIds.has(row.id);
    const needsStatusReview = requiresStatusReview(row);
    const otherWarnings = transactionWarnings(row).filter(
      (warning) => warning !== statusReviewWarning,
    );
    function renderTradeTags(collapsed: boolean) {
      return (
        <>
          <span
            className={`pm-trade-status${collapsed ? " pm-collapsed-status" : ""}`}
            data-review={needsStatusReview}
            title={
              needsStatusReview ? "此交易状态需要人工核对" : "原始交易状态"
            }
          >
            {statusLabel}
          </span>
          {row.category.trim() && (
            <span className="pm-trade-category" title={row.category}>
              {row.category}
            </span>
          )}
          {row.direction && row.direction !== movement.label && (
            <span
              className="pm-original-direction"
              title="原始账单中的收/支标记"
            >
              收/支：{row.direction}
            </span>
          )}
        </>
      );
    }
    const rowClassName = `pm-${movement.kind}${row.duplicates.length ? " pm-duplicate" : ""}${row.notImported ? " pm-row-not-imported" : ""}${rowCollapsed ? " pm-row-collapsed" : ""}`;
    const selectionCheckbox = (
      <input
        className="pm-row-checkbox"
        type="checkbox"
        aria-label={`选择第 ${row.line} 行`}
        disabled={!rowEditable}
        checked={row.selected && !row.notImported}
        onChange={(e) => edit(row.id, { selected: e.target.checked })}
      />
    );
    const collapseToggle = (
      <button
        type="button"
        className="pm-row-collapse-toggle"
        aria-label={`${rowCollapsed ? "展开" : "折叠"}第 ${row.line} 行交易详情`}
        title={rowCollapsed ? "展开交易详情" : "折叠交易详情"}
        aria-expanded={!rowCollapsed}
        onClick={() => toggleRowDetails(row.id)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
    );
    const categoryAccountControl = (
      <div
        className="pm-account-control pm-account-control-link"
        data-missing={!row.targetAccount}
      >
        {row.notImported && !row.committedAt ? (
          <AccountValue account={category} />
        ) : (
          <AccountBrowserSelect
            label={`第 ${row.line} 行分类账户`}
            searchLabel={`搜索第 ${row.line} 行分类账户`}
            value={row.targetAccount}
            valueDisplay={<AccountValue account={row.targetAccount} />}
            appearance="link"
            disabled={!rowEditable}
            options={categoryOptions}
            selectableValues={categoryNames}
            placeholder="请选择分类账户"
            allowEmpty
            createDate={row.date}
            onCreateAccount={
              row.payee
                ? (parent, leaf, date) =>
                    createAccount(createdAccountName(parent, leaf), date)
                : undefined
            }
            onChange={(value) =>
              edit(row.id, {
                targetAccount: value,
                confidence: undefined,
                reasoning: undefined,
                aiFallback: undefined,
              })
            }
          />
        )}
      </div>
    );
    const fundingAccountControl = (
      <div
        className="pm-account-control pm-account-control-link"
        data-missing={!row.sourceAccount}
      >
        {row.notImported && !row.committedAt ? (
          <AccountValue account={funding} />
        ) : (
          <AccountBrowserSelect
            label={`第 ${row.line} 行资金账户`}
            searchLabel={`搜索第 ${row.line} 行资金账户`}
            value={row.sourceAccount}
            valueDisplay={<AccountValue account={row.sourceAccount} />}
            appearance="link"
            relevantRoots={fundingAccountRoots}
            disabled={!rowEditable}
            options={fundingOptions}
            selectableValues={fundingNames}
            placeholder="请选择实际资金账户"
            allowEmpty
            createDate={row.date}
            onCreateAccount={(parent, leaf, date) =>
              createAccount(createdAccountName(parent, leaf), date)
            }
            onChange={(value) => edit(row.id, { sourceAccount: value })}
          />
        )}
      </div>
    );
    if (rowCollapsed) {
      return (
        <tr
          key={row.id}
          className={rowClassName}
          data-selected={row.selected && !row.notImported}
          data-collapsed="true"
          onClick={(event) => toggleRowFromClick(event, row.id)}
        >
          <td
            className="pm-row-collapsed-cell"
            colSpan={3}
            aria-label={`第 ${row.line} 行交易标题`}
          >
            <div
              className={`pm-collapsed-row${showCollapsedFunding ? " pm-collapsed-row-with-payment" : ""}`}
            >
              <button
                type="button"
                className="pm-collapsed-expand-action"
                aria-label={`展开第 ${row.line} 行交易详情`}
                aria-expanded="false"
                title="展开交易详情"
                onClick={() => toggleRowDetails(row.id)}
              />
              {selectionCheckbox}
              <div
                className="pm-collapsed-amount"
                aria-label={`第 ${row.line} 行金额`}
                title="审核金额（CNY）；正数流入，负数流出"
              >
                <span className="pm-collapsed-amount-line">
                  <span>{amountLabel}</span>
                  <small aria-hidden="true">CNY</small>
                </span>
                <time className="pm-collapsed-date" dateTime={row.date}>
                  {row.date}
                </time>
              </div>
              <div
                className="pm-collapsed-tags"
                role="group"
                aria-label={`第 ${row.line} 行状态与类型`}
              >
                {renderTradeTags(true)}
              </div>
              <div
                className="pm-collapsed-pair pm-collapsed-counterparty"
                role="group"
                aria-label={`第 ${row.line} 行折叠交易对方与分类账户`}
              >
                <span className="pm-collapsed-pair-line">
                  <small>交易对方</small>
                  {row.payee ? (
                    <button
                      type="button"
                      className="pm-collapsed-party-button"
                      aria-label={`第 ${row.line} 行交易对方：${row.payee}`}
                      title={`${row.payee}\n点击关联分类账户`}
                      disabled={!rowEditable}
                      onClick={() => openCounterpartyPanel(row)}
                    >
                      <strong>{row.payee}</strong>
                      <span aria-hidden="true">↗</span>
                    </button>
                  ) : (
                    <strong>（无交易对方）</strong>
                  )}
                </span>
                <span className="pm-collapsed-pair-line">
                  <small>分类账户</small>
                  {categoryAccountControl}
                </span>
              </div>
              {showCollapsedFunding && (
                <div
                  className="pm-collapsed-pair pm-collapsed-payment"
                  role="group"
                  aria-label={`第 ${row.line} 行折叠${methodLabel}与资金账户`}
                >
                  <span className="pm-collapsed-pair-line">
                    <small>{methodLabel}</small>
                    <button
                      type="button"
                      className="pm-collapsed-party-button"
                      aria-label={`第 ${row.line} 行${methodLabel}：${paymentMethodLabel(row.payment)}`}
                      title={`${paymentMethodLabel(row.payment)}\n点击关联资金账户`}
                      disabled={!rowEditable}
                      onClick={() =>
                        openAccountPanel(row.payment, row.sourceAccount, row.id)
                      }
                    >
                      <strong>{paymentMethodLabel(row.payment)}</strong>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </span>
                  <span className="pm-collapsed-pair-line">
                    <small>资金账户</small>
                    {fundingAccountControl}
                  </span>
                </div>
              )}
              <OriginalTransaction
                row={row}
                title={description}
                canLink={rowEditable && !!row.description.trim()}
                onLink={() => openDescriptionPanel(row)}
              />
            </div>
          </td>
        </tr>
      );
    }
    return (
      <tr
        key={row.id}
        className={rowClassName}
        data-selected={row.selected && !row.notImported}
        data-collapsed="false"
        onClick={(event) => toggleRowFromClick(event, row.id)}
      >
        <td className="pm-row-state">
          {selectionCheckbox}
          <span className="pm-row-index">#{row.line}</span>
          {row.committedAt ? (
            <span className="pm-row-lock-state">已入账 · 锁定</span>
          ) : (
            <div className="pm-row-actions">
              <button
                type="button"
                className="pm-row-action pm-row-import-action"
                data-active={importBlocked}
                aria-label={
                  importBlocked
                    ? `允许第 ${row.line} 行导入`
                    : `标记第 ${row.line} 行不导入`
                }
                title={
                  importBlocked
                    ? "移除不导入标记并解锁，之后可勾选入账"
                    : "取消勾选并锁定该交易，不再计入待审核"
                }
                disabled={!editable}
                onClick={() => void setImportStatus(!importBlocked, [row.id])}
              >
                {importBlocked ? "可导入" : "不导入"}
              </button>
            </div>
          )}
        </td>
        <td
          className="pm-row-mapping"
          aria-label={`第 ${row.line} 行交易与账户`}
          colSpan={rowCollapsed ? 2 : undefined}
        >
          <div className="pm-trade-heading">
            <div className="pm-trade-summary">
              {collapseToggle}
              <OriginalTransaction
                row={row}
                title={description}
                canLink={rowEditable && !!row.description.trim()}
                onLink={() => openDescriptionPanel(row)}
              />
            </div>
            {!rowCollapsed && (
              <div className="pm-amount-control">
                <span className="pm-amount-line">
                  {Number(row.amount) > 0 && !row.amount.startsWith("+") && (
                    <span className="pm-amount-sign" aria-hidden="true">
                      +
                    </span>
                  )}
                  <input
                    type="text"
                    aria-label={`第 ${row.line} 行金额`}
                    title="审核金额（CNY）；正数流入，负数流出"
                    inputMode="decimal"
                    style={
                      {
                        "--pm-amount-width": `${Math.max(4, row.amount.length)}ch`,
                      } as React.CSSProperties
                    }
                    disabled={!rowEditable}
                    value={row.amount}
                    onChange={(e) => edit(row.id, { amount: e.target.value })}
                  />
                  <span className="pm-currency" aria-hidden="true">
                    CNY
                  </span>
                </span>
                <time className="pm-amount-date" dateTime={row.date}>
                  {row.date}
                </time>
              </div>
            )}
          </div>
          {!rowCollapsed && (
            <>
              <div
                className="pm-trade-facts"
                role="group"
                aria-label={`第 ${row.line} 行状态与类型`}
              >
                {renderTradeTags(false)}
              </div>
              <div className="pm-mapping-grid">
                <div
                  className="pm-mapping-pair"
                  role="group"
                  aria-label={`第 ${row.line} 行商家与分类账户`}
                >
                  <div className="pm-mapping-source pm-mapping-merchant">
                    <span className="pm-mapping-label">交易对方</span>
                    <div className="pm-payee-title">
                      {row.payee ? (
                        <button
                          className="pm-payment pm-payee-button"
                          aria-label={`第 ${row.line} 行交易对方：${row.payee}`}
                          title={row.payee}
                          disabled={!rowEditable}
                          onClick={() => openCounterpartyPanel(row)}
                        >
                          <strong>{row.payee}</strong>
                          <span aria-hidden="true">↗</span>
                        </button>
                      ) : (
                        <strong>（无交易对方）</strong>
                      )}
                    </div>
                  </div>
                  <div className="pm-mapping-target pm-mapping-category">
                    {categoryAccountControl}
                  </div>
                </div>
                <div className="pm-account-connector">
                  <span
                    className="pm-account-direction"
                    role="img"
                    aria-label={`${movement.label}：${movement.incoming ? category : funding} → ${movement.incoming ? funding : category}`}
                    data-flow={movement.kind}
                    data-direction={movement.incoming ? "down" : "up"}
                  >
                    <svg
                      width="16"
                      height="22"
                      viewBox="0 0 16 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path
                        d={
                          movement.incoming
                            ? "M8 3v18m-5-5 5 5 5-5"
                            : "M8 21V3M3 8l5-5 5 5"
                        }
                      />
                    </svg>
                  </span>
                </div>
                <div
                  className="pm-mapping-pair"
                  role="group"
                  aria-label={`第 ${row.line} 行${methodLabel}与资金账户`}
                >
                  <div className="pm-mapping-source pm-mapping-payment">
                    <span className="pm-mapping-label">{methodLabel}</span>
                    <button
                      className="pm-payment-method"
                      aria-label={`第 ${row.line} 行${methodLabel}：${paymentMethodLabel(row.payment)}`}
                      disabled={!rowEditable}
                      onClick={() =>
                        openAccountPanel(row.payment, row.sourceAccount, row.id)
                      }
                    >
                      {paymentMethodLabel(row.payment)}
                      <span aria-hidden="true"> ↗</span>
                    </button>
                  </div>
                  <div className="pm-mapping-target pm-mapping-funding">
                    {fundingAccountControl}
                  </div>
                </div>
              </div>
            </>
          )}
        </td>
        {!rowCollapsed && (
          <td
            className="pm-row-review"
            aria-label={`第 ${row.line} 行提示与操作`}
          >
            {row.confidence !== undefined && (
              <p className="pm-ai">
                <strong>
                  AI{row.aiFallback ? " 兜底" : ""}{" "}
                  {Math.round(row.confidence * 100)}%
                </strong>
                <span>{row.reasoning || "建议已保存"}</span>
              </p>
            )}
            {row.refund && (
              <div
                className="pm-refund"
                style={
                  {
                    "--pm-refund": refundColor(row.refund.groupId),
                  } as React.CSSProperties
                }
              >
                <strong>
                  {fullRefund ? "全额退款配对" : "退款不完全匹配"} · #
                  {Math.min(row.line, ...row.refund.relatedLines)}
                </strong>
                <p>
                  对应第 {row.refund.relatedLines.join("、")} 行 ·{" "}
                  {row.refund.basis}
                </p>
                <p>
                  {fullRefund
                    ? "本组默认不选，可人工调整。"
                    : "本组默认不选，需核对原支出与退款的实际净额。"}
                </p>
              </div>
            )}
            {row.duplicates.length > 0 && (
              <div
                className="pm-review-alert"
                role="group"
                aria-label={`第 ${row.line} 行疑似重复核对`}
              >
                <strong>疑似重复</strong>
                {row.duplicates.map((d) => (
                  <p key={d}>{d}</p>
                ))}
                <label>
                  <input
                    type="checkbox"
                    disabled={!rowEditable}
                    checked={row.duplicateReviewed}
                    onChange={(e) =>
                      edit(row.id, {
                        duplicateReviewed: e.target.checked,
                      })
                    }
                  />
                  已核对
                </label>
              </div>
            )}
            {needsStatusReview && (
              <div
                className="pm-review-alert"
                role="group"
                aria-label={`第 ${row.line} 行交易状态核对`}
              >
                <strong>{statusReviewWarning}</strong>
                <label>
                  <input
                    type="checkbox"
                    disabled={!rowEditable}
                    checked={!!row.statusReviewed}
                    onChange={(event) =>
                      edit(row.id, { statusReviewed: event.target.checked })
                    }
                  />
                  已核对
                </label>
              </div>
            )}
            {otherWarnings.length > 0 && (
              <details className="pm-row-notices" open>
                <summary
                  aria-label={`第 ${row.line} 行核对提示（${otherWarnings.length} 条）`}
                >
                  核对提示 <span>{otherWarnings.length}</span>
                </summary>
                {otherWarnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </details>
            )}
          </td>
        )}
      </tr>
    );
  }
  return (
    <section className="pm-queue-card" aria-label="交易审核">
      <div className="pm-queue-heading">
        <div>
          <span className="pm-section-label">REVIEW QUEUE</span>
          <strong>交易审核</strong>
          <small>逐笔确认账户与分类；退款卡片可展开核对</small>
        </div>
      </div>
      {overview}
      <div className="pm-table-tools">
        <div className="pm-table-tools-copy">
          <span
            className="pm-queue-pill"
            title="符合当前筛选条件的交易数量，不含额外展示的退款关联交易"
          >
            当前显示 {c.filtered.length} 笔
          </span>
          {c.relatedCount > 0 && (
            <span
              className="pm-queue-pill"
              title="为保留退款核对上下文而额外展示，不计入当前筛选的命中数量"
            >
              另有 {c.relatedCount} 笔关联交易
            </span>
          )}
          <span className="pm-queue-pill">
            全局已选中 {c.selected.length} 笔
          </span>
          <span className="pm-muted">
            表头筛选可叠加
            {c.hasColumnFilters ? " · 已启用" : ""}
          </span>
          <button
            type="button"
            className="pm-collapse-all"
            disabled={!displayedRows.length}
            title={
              allRowsCollapsed
                ? "展开当前显示的全部交易详情"
                : "折叠当前显示的全部交易详情"
            }
            onClick={toggleAllRowDetails}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d={allRowsCollapsed ? "m3 6 5 5 5-5" : "m3 10 5-5 5 5"} />
            </svg>
            {allRowsCollapsed ? "全部展开" : "全部折叠"}
          </button>
          <label
            className="pm-collapsed-funding-toggle"
            title="在折叠行显示收付款方式和对应资金账户"
          >
            <input
              type="checkbox"
              role="switch"
              checked={showCollapsedFunding}
              onChange={(event) =>
                updateDisplayPreferences({
                  showCollapsedFunding: event.target.checked,
                })
              }
            />
            <span>显示收付款账户</span>
          </label>
        </div>
      </div>
      {c.hasColumnFilters && (
        <div className="pm-filter-chips" aria-label="已启用的表头筛选">
          {c.filterLabels.map(({ key, label, excluded }) => (
            <span key={key} className="pm-filter-chip" data-excluded={excluded}>
              <button
                className={`pm-filter-chip-toggle ${excluded ? "pm-filter-exclude" : "pm-filter-include"}`}
                title="点击切换包含 / 排除"
                aria-label={`${label}：切换为${excluded ? "包含" : "排除"}`}
                onClick={() => c.setColumnFilterExcluded(key, !excluded)}
              >
                <strong>{excluded ? "排除" : "包含"}</strong> · {label}
              </button>
              <button
                className="pm-filter-chip-remove"
                aria-label={`删除筛选：${label}`}
                title="删除此筛选"
                onClick={() => c.clearColumnFilter(key)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m4.5 4.5 7 7m0-7-7 7" />
                </svg>
              </button>
            </span>
          ))}
          <button
            className="pm-filter-clear-all"
            onClick={c.clearColumnFilters}
          >
            清除表头筛选
          </button>
        </div>
      )}
      <div className="pm-scroll">
        <table
          className="pm-review-table"
          aria-label="支付账单交易审核"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            pointerStart.current = {
              x: event.clientX,
              y: event.clientY,
            };
          }}
          onClickCapture={(event) => {
            if (!suppressClick.current) return;
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <TransactionColumns />
          <CollapsedTransactionHeader
            controller={c}
            showCollapsedFunding={showCollapsedFunding}
          />
          <tbody>
            {pageGroups.map((group) =>
              group.paired ? (
                <RefundDrawer
                  key={group.id}
                  group={group}
                  renderRow={renderRow}
                  collapsedHeader={
                    <CollapsedTransactionHeader
                      controller={c}
                      showCollapsedFunding={showCollapsedFunding}
                      interactive={false}
                    />
                  }
                />
              ) : (
                renderRow(group.rows[0])
              ),
            )}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="pm-empty-state">没有符合条件的交易。</p>
        )}
      </div>
    </section>
  );
}
