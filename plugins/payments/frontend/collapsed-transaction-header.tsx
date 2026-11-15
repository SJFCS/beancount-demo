import React from "react";
import type { PaymentsController } from "./use-payments";
import { AccountFilterTrigger } from "./account-filter";
import {
  CollapsedAmountDateFilter,
  CollapsedCounterpartyFilter,
  CollapsedPaymentFilter,
  CollapsedReviewFilter,
  CollapsedSelectionFilter,
  CollapsedSortButton,
  CollapsedStatusCategoryFilter,
} from "./collapsed-column-controls";
import { TransactionSearch } from "./transaction-header";
import { TransactionSourceFilter } from "./transaction-source-filter";

export function CollapsedTransactionHeader({
  controller,
  showCollapsedFunding,
  interactive = true,
}: {
  controller: PaymentsController;
  showCollapsedFunding: boolean;
  interactive?: boolean;
}) {
  const selectableRows = controller.pageRows.filter(
    (row) => !row.locked && !row.committedAt,
  );
  return (
    <thead>
      <tr className="pm-collapsed-header">
        <th colSpan={3}>
          <div
            className={`pm-collapsed-row pm-collapsed-header-row${
              showCollapsedFunding
                ? " pm-collapsed-row-with-payment pm-collapsed-header-row-with-payment"
                : ""
            }`}
          >
            <div className="pm-collapsed-select-all">
              {interactive ? (
                <>
                  <label>
                    <input
                      type="checkbox"
                      className="pm-row-checkbox"
                      aria-label={
                        controller.pageSize === null
                          ? "选择或取消当前显示交易"
                          : "选择或取消当前页交易"
                      }
                      disabled={!controller.editable || !selectableRows.length}
                      checked={
                        !!selectableRows.length &&
                        selectableRows.every((row) => row.selected)
                      }
                      onChange={(event) =>
                        controller.editMany(
                          new Set(controller.pageRows.map((row) => row.id)),
                          { selected: event.target.checked },
                        )
                      }
                    />
                    <span className="pm-visually-hidden">选中</span>
                  </label>
                  <CollapsedSelectionFilter controller={controller} />
                </>
              ) : (
                <span className="pm-visually-hidden">选中</span>
              )}
            </div>
            <div className="pm-collapsed-header-field">
              <span>金额 / 日期</span>
              {interactive && (
                <CollapsedAmountDateFilter controller={controller} />
              )}
            </div>
            <div className="pm-collapsed-header-field">
              <span>状态 / 分类</span>
              {interactive && (
                <CollapsedStatusCategoryFilter controller={controller} />
              )}
            </div>
            <div className="pm-collapsed-header-account">
              <div className="pm-collapsed-header-line">
                <span>交易对方</span>
                {interactive && (
                  <div
                    className="pm-collapsed-header-actions"
                    role="group"
                    aria-label="交易对方排序与筛选"
                  >
                    <CollapsedSortButton
                      controller={controller}
                      field="counterparty"
                    />
                    <CollapsedCounterpartyFilter controller={controller} />
                  </div>
                )}
              </div>
              <div className="pm-collapsed-header-line">
                <span>分类账户</span>
                {interactive && (
                  <div
                    className="pm-collapsed-header-actions"
                    role="group"
                    aria-label="分类账户排序与筛选"
                  >
                    <CollapsedSortButton
                      controller={controller}
                      field="counterpartyAccount"
                    />
                    <AccountFilterTrigger
                      controller={controller}
                      field="counterpartyAccount"
                    />
                  </div>
                )}
              </div>
            </div>
            {showCollapsedFunding && (
              <div className="pm-collapsed-header-account">
                <div className="pm-collapsed-header-line">
                  <span>收付款方式</span>
                  {interactive && (
                    <div
                      className="pm-collapsed-header-actions"
                      role="group"
                      aria-label="收付款方式排序与筛选"
                    >
                      <CollapsedSortButton
                        controller={controller}
                        field="payment"
                      />
                      <CollapsedPaymentFilter controller={controller} />
                    </div>
                  )}
                </div>
                <div className="pm-collapsed-header-line">
                  <span>资金账户</span>
                  {interactive && (
                    <div
                      className="pm-collapsed-header-actions"
                      role="group"
                      aria-label="资金账户排序与筛选"
                    >
                      <CollapsedSortButton
                        controller={controller}
                        field="paymentAccount"
                      />
                      <AccountFilterTrigger
                        controller={controller}
                        field="paymentAccount"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="pm-collapsed-header-tools">
              <span className="pm-collapsed-header-label">交易内容</span>
              {interactive && (
                <>
                  <TransactionSourceFilter
                    controller={controller}
                    additionalOnly
                  />
                  <span className="pm-collapsed-header-label">审核提示</span>
                  <CollapsedReviewFilter controller={controller} />
                  <TransactionSearch controller={controller} />
                </>
              )}
            </div>
          </div>
        </th>
      </tr>
    </thead>
  );
}
