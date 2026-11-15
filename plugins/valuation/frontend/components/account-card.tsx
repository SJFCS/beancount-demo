import React from "react";
import { formatMoney, formatNumber, pnlClass, signedMoney } from "../format";
import type { AccountReport } from "../types";

export function AccountCard({ account }: { account: AccountReport }) {
  return (
    <article className="ve-account">
      <div className="ve-account-head">
        <div>
          <div className="ve-account-name">{account.account}</div>
          <div className="ve-account-sub">
            {account.currency} · 报价 {account.quote}
          </div>
        </div>
        <div className="ve-badges">
          {account.autoMapped ? (
            <span className="ve-badge">自动映射</span>
          ) : null}
          {account.autoOpened ? (
            <span className="ve-badge">自动开户</span>
          ) : null}
          {!account.enabled ? (
            <span className="ve-badge is-muted">已停用</span>
          ) : null}
        </div>
      </div>
      <div className="ve-facts">
        <div className="ve-fact">
          <span>当前份额</span>
          <strong>{formatNumber(account.units, 4)}</strong>
          <small>{account.currency}</small>
        </div>
        <div className="ve-fact">
          <span>最新虚拟价格</span>
          <strong>{formatNumber(account.lastPrice, 6)}</strong>
          <small>{account.lastPriceDate ?? "尚无估值点"}</small>
        </div>
        <div className="ve-fact">
          <span>市场价值</span>
          <strong>{formatMoney(account.marketValue, account.quote)}</strong>
          <small>份额 × 虚拟价格</small>
        </div>
        <div className="ve-fact">
          <span>成本基础</span>
          <strong>{formatMoney(account.costBasis, account.quote)}</strong>
          <small>按买入价格累计</small>
        </div>
        <div className="ve-fact">
          <span>未实现盈亏</span>
          <strong className={pnlClass(account.unrealizedPnl)}>
            {signedMoney(account.unrealizedPnl, account.quote)}
          </strong>
          <small>市场价值 − 成本基础</small>
        </div>
        <div className="ve-fact">
          <span>已实现盈亏</span>
          <strong className={pnlClass(account.realizedPnl)}>
            {signedMoney(account.realizedPnl, account.quote)}
          </strong>
          <small>{account.pnlAccount}</small>
        </div>
      </div>
      {account.warnings.length > 0 ? (
        <div className="ve-inline-warning">
          {account.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}
      {account.samples.length > 0 ? (
        <div className="ve-samples">
          <div className="ve-section-label">估值点</div>
          <div className="ve-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>声明价值</th>
                  <th>份额</th>
                  <th>推导价格</th>
                  <th>市场价值</th>
                </tr>
              </thead>
              <tbody>
                {account.samples.map((sample) => (
                  <tr key={`${sample.date}-${sample.declaredValue.number}`}>
                    <td>{sample.date}</td>
                    <td>
                      {formatMoney(
                        sample.declaredValue.number,
                        sample.declaredValue.currency,
                      )}
                      {sample.conversionRate ? (
                        <small className="ve-conversion">
                          按 {sample.conversionDate} 的{" "}
                          {formatNumber(sample.conversionRate, 8)} 换算
                        </small>
                      ) : null}
                    </td>
                    <td>{formatNumber(sample.units, 4)}</td>
                    <td>{formatNumber(sample.price, 8)}</td>
                    <td>
                      {formatMoney(
                        sample.marketValue,
                        sample.marketValueCurrency ??
                          sample.declaredValue.currency,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="ve-empty-line">
          还没有 `custom "valuation"` 估值点。写入例如 `custom "valuation"
          Assets:CoolFund:Total 900 USD` 后刷新。
        </div>
      )}
    </article>
  );
}
