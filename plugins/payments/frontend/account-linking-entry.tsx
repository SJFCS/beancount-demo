import React, { useId } from "react";
import type { PaymentsController } from "./use-payments";

export function AccountLinkingEntry({
  controller,
  compact = false,
}: {
  controller: PaymentsController;
  compact?: boolean;
}) {
  const titleId = useId();
  return (
    <section
      className={`pm-linking-entry${compact ? " pm-linking-entry-compact" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="pm-linking-entry-copy">
        <span className="pm-section-label">ACCOUNT LINKING</span>
        <strong id={titleId}>统一关联账户</strong>
        <small>
          {compact
            ? "先手动绑定同类交易，已设置的具体分类会自动跳过，减少 AI 用量。"
            : "选择一种关联维度，复用同一套校验、账户选择和保存逻辑。"}
        </small>
      </div>
      <div className="pm-linking-entry-actions">
        <button
          type="button"
          aria-label="按收付款方式关联账户"
          disabled={!controller.editable}
          onClick={() => controller.openAccountLinking("payment")}
        >
          <span>收/付款方式</span>
          <small>多选渠道 → 资金账户</small>
          <b>开始关联</b>
        </button>
        <button
          type="button"
          aria-label="按交易对方关联账户"
          disabled={!controller.editable}
          onClick={() => controller.openAccountLinking("counterparty")}
        >
          <span>交易对方</span>
          <small>多选商户 → 分类账户</small>
          <b>开始关联</b>
        </button>
        <button
          type="button"
          aria-label="按交易内容关联账户"
          disabled={!controller.editable}
          onClick={() => controller.openAccountLinking("description")}
        >
          <span>交易内容</span>
          <small>商品说明 → 账户，可限制范围</small>
          <b>开始关联</b>
        </button>
      </div>
    </section>
  );
}
