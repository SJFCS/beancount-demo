import React from "react";
import type { Row } from "../types";
import {
  paymentMethodLabel,
  refundSummary,
  type TransactionGroup,
} from "./display";
import {
  TransactionColumns,
  TransactionMappingHeading,
} from "./transaction-layout";

export function RefundDrawer({
  group,
  renderRow,
  collapsedHeader,
}: {
  group: TransactionGroup;
  renderRow: (row: Row) => React.ReactNode;
  collapsedHeader?: React.ReactNode;
}) {
  const summaryRows = group.summaryRows ?? group.rows;
  const hiddenCompletedCount = summaryRows.length - group.rows.length;
  const purchases = summaryRows.filter((row) => Number(row.amount) < 0);
  const receipts = summaryRows.filter((row) => Number(row.amount) > 0);
  const full = group.refundKind === "full";
  const totals = refundSummary(summaryRows);
  const net = purchases.length && receipts.length ? totals.net : undefined;
  const netLabel =
    net === undefined
      ? "净额待核对"
      : net.startsWith("-")
        ? `净支出 ${net.slice(1)} CNY`
        : `净流入 ${net} CNY`;
  const unique = (values: string[]) =>
    [...new Set(values.filter(Boolean))].join(" / ");
  const lines = group.rows.map((row) => `#${row.line}`).join(" / ");
  const selected = group.rows.filter((row) => row.selected).length;
  const locked = group.rows.filter(
    (row) => row.locked || row.committedAt,
  ).length;
  const needsReview = group.rows.some(
    (row) => row.duplicates.length || row.warnings.length,
  );
  return (
    <tr className="pm-refund-group">
      <td colSpan={3}>
        <details
          className="pm-refund-drawer"
          data-refund-kind={group.refundKind}
          open={!full}
        >
          <summary>
            <span className="pm-refund-chevron" aria-hidden="true">
              ›
            </span>
            <span className="pm-refund-overview">
              <span className="pm-refund-heading">
                <strong>{full ? "全额退款配对" : "退款不完全匹配"}</strong>
                <span className="pm-muted">
                  {lines} · {group.rows.length} 笔交易
                  {hiddenCompletedCount > 0 &&
                    ` · 已隐藏 ${hiddenCompletedCount} 笔已完成`}
                </span>
                <span className="pm-muted">
                  已选 {selected} 笔{locked > 0 && ` · 已锁定 ${locked} 笔`}
                  {needsReview && " · 有待核对提示"}
                </span>
              </span>
              <span className="pm-refund-facts">
                <span>
                  <strong>退款 {totals.refunded ?? "待核对"} CNY</strong>
                  <small>
                    {purchases.length
                      ? `原支付 ${totals.paid ?? "待核对"} CNY`
                      : "未找到原支付"}
                  </small>
                  <small>
                    {full ? "支付与退款金额一致 · 净额 0.00 CNY" : netLabel}
                  </small>
                </span>
                <span className="pm-refund-party">
                  <strong>
                    {unique(group.rows.map((row) => row.description)) ||
                      unique(group.rows.map((row) => row.payee)) ||
                      "未注明交易内容"}
                  </strong>
                  <small>
                    {unique(group.rows.map((row) => row.payee)) ||
                      "（无交易对方）"}
                  </small>
                  <small>
                    {unique(
                      group.rows.map((row) => paymentMethodLabel(row.payment)),
                    )}
                  </small>
                </span>
                <span>
                  <small>
                    支付：
                    {unique(purchases.map((row) => row.time || row.date)) ||
                      "未找到原支付"}
                  </small>
                  <small>
                    退款：
                    {unique(receipts.map((row) => row.time || row.date)) ||
                      "未找到退款"}
                  </small>
                </span>
              </span>
            </span>
            <span className="pm-refund-action">
              <span className="pm-refund-expand">
                {group.rows.length === 2
                  ? "展开两笔交易"
                  : `展开 ${group.rows.length} 笔交易`}
              </span>
              <span className="pm-refund-collapse">收起交易</span>
            </span>
          </summary>
          <div className="pm-refund-content">
            <table
              className="pm-review-table"
              aria-label={`退款${full ? "配对" : "关联"} ${lines} 的交易明细`}
            >
              <TransactionColumns />
              {collapsedHeader ?? (
                <thead>
                  <tr className="pm-header-fields">
                    <th scope="col" className="pm-col-state">
                      选中
                    </th>
                    <th scope="col" className="pm-col-mapping">
                      <TransactionMappingHeading />
                    </th>
                    <th scope="col" className="pm-col-review">
                      提示 / 操作
                    </th>
                  </tr>
                </thead>
              )}
              <tbody>{group.rows.map(renderRow)}</tbody>
            </table>
          </div>
        </details>
      </td>
    </tr>
  );
}
