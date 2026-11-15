import React from "react";
import { formatMoney, pnlClass, signedMoney } from "../format";
import type { View } from "../types";
import { AccountCard } from "./account-card";

export function Overview({
  view,
  stats,
  issueCount,
}: {
  view: View | null;
  stats: Array<[string, string]>;
  issueCount: number;
}) {
  const totals = view?.analysis.totals ?? [];
  const accounts = view?.analysis.accounts ?? [];
  const ledgerErrorInList =
    view?.ledgerErrors.some((item) => item.message === view.ledgerError) ??
    false;

  return (
    <>
      {issueCount > 0 ? (
        <div className="ve-alert error">
          发现 {issueCount} 个配置或账本问题，详情见页面底部。
        </div>
      ) : null}

      <section className="ve-summary">
        {totals.length > 0 ? (
          totals.map((total) => (
            <div className="ve-summary-card" key={total.quote}>
              <span>{total.quote} 合计</span>
              <strong>{formatMoney(total.marketValue, total.quote)}</strong>
              <small>
                成本 {formatMoney(total.costBasis, total.quote)} · 未实现{" "}
                <b className={pnlClass(total.unrealizedPnl)}>
                  {signedMoney(total.unrealizedPnl, total.quote)}
                </b>
              </small>
            </div>
          ))
        ) : (
          <div className="ve-summary-card">
            <span>估值合计</span>
            <strong>—</strong>
            <small>添加估值账户后显示</small>
          </div>
        )}
      </section>

      <section className="ve-grid" aria-label="运行时统计">
        {stats.map(([label, value]) => (
          <div className="ve-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="ve-section">
        <div className="ve-section-head">
          <h2>估值账户</h2>
          <small>
            虚拟商品价格由“声明总市值 ÷ 当前份额”推导；外汇按 price 指令换算
          </small>
        </div>
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountCard key={account.account} account={account} />
          ))
        ) : (
          <div className="ve-empty">
            还没有识别到估值账户。在账本中写入
            <br />
            <code>
              2024-02-10 custom "valuation" Assets:CoolFund:Total 900 USD
            </code>
            <br />
            然后刷新；或先打开“配置”添加账户映射。
          </div>
        )}
      </section>

      {view &&
      (view.configError ||
        view.ledgerError ||
        view.analysis.errors.length > 0 ||
        view.ledgerErrors.length > 0) ? (
        <section className="ve-section">
          <div className="ve-section-head">
            <h2>问题</h2>
            <small>配置、解析和插件诊断</small>
          </div>
          <div className="ve-errors">
            {view.configError ? (
              <div className="ve-error">{view.configError}</div>
            ) : null}
            {view.ledgerError && !ledgerErrorInList ? (
              <div className="ve-error">{view.ledgerError}</div>
            ) : null}
            {view.analysis.errors.map((item, index) => (
              <div
                className="ve-error"
                key={`analysis-${item.file}-${item.line}-${index}`}
              >
                {item.message}
                {item.file ? (
                  <small>
                    {item.file}
                    {item.line ? `:${item.line}` : ""}
                  </small>
                ) : null}
              </div>
            ))}
            {view.ledgerErrors.map((item, index) => (
              <div
                className="ve-error"
                key={`ledger-${item.file}-${item.line}-${index}`}
              >
                {item.message}
                <small>
                  {item.severity}
                  {item.file ? ` · ${item.file}` : ""}
                  {item.line ? `:${item.line}` : ""}
                </small>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
