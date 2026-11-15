import React from "react";
import { effectiveAccountFields } from "../config";
import type { AccountDraft, UpdateDraft } from "../types";
import { Field } from "./field";

export function AccountEditor({
  accounts,
  updateDraft,
  issues,
  primaryCurrency,
  knownAccounts,
}: {
  accounts: AccountDraft[];
  updateDraft: UpdateDraft;
  issues: Map<string, string>;
  primaryCurrency: string;
  knownAccounts: string[];
}) {
  const fieldIssue = (path: string) => issues.get(path);
  const effectiveQuote = primaryCurrency.trim() || "USD";

  function updateAccount(index: number, patch: Partial<AccountDraft>) {
    updateDraft((current) => ({
      ...current,
      accounts: current.accounts.map((row, position) =>
        position === index ? { ...row, ...patch } : row,
      ),
    }));
  }

  function addAccount() {
    updateDraft((current) => ({
      ...current,
      accounts: [
        ...current.accounts,
        {
          account: "",
          currency: "",
          pnlAccount: "",
          quote: "",
          enabled: true,
        },
      ],
    }));
  }

  function resetAccounts() {
    if (
      !window.confirm(
        "清空账户映射后，插件会按 Assets:<基金>:Total 自动推导合成商品与盈亏账户。继续？",
      )
    ) {
      return;
    }
    updateDraft((current) => ({ ...current, accounts: [] }));
  }

  return (
    <section className="ve-form-section">
      <div className="ve-form-head">
        <div>
          <h3>估值账户</h3>
          <p>
            留空 `currency` / `pnlAccount` 时按账户名自动推导；留空 `quote`
            时使用账本主货币 {effectiveQuote}。
          </p>
        </div>
        <div className="ve-actions">
          <button
            type="button"
            className="ve-button small"
            onClick={resetAccounts}
          >
            改为自动推导
          </button>
          <button
            type="button"
            className="ve-button small"
            onClick={addAccount}
          >
            添加账户
          </button>
        </div>
      </div>
      {accounts.length === 0 ? (
        <div className="ve-empty-line">
          当前没有显式账户映射，插件会从
          <code>Assets:&lt;基金&gt;:Total</code> 和 valuation 指令自动推导。
        </div>
      ) : (
        accounts.map((row, index) => {
          const effective = effectiveAccountFields(row, primaryCurrency);
          return (
            <div className="ve-card-row" key={`account-${index}`}>
              <div className="ve-card-row-head">
                <strong>账户 {index + 1}</strong>
                <div className="ve-inline">
                  <label className="ve-check">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(event) =>
                        updateAccount(index, {
                          enabled: event.target.checked,
                        })
                      }
                    />
                    启用
                  </label>
                  <button
                    type="button"
                    className="ve-button small danger"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        accounts: current.accounts.filter(
                          (_item, position) => position !== index,
                        ),
                      }))
                    }
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="ve-account-row">
                <Field
                  label="账本账户"
                  error={fieldIssue(`accounts.${index}.account`)}
                  hint="例如 Assets:Broker:CoolFund:Total"
                >
                  <input
                    list="valuation-known-accounts"
                    value={row.account}
                    placeholder="Assets:Broker:CoolFund:Total"
                    onChange={(event) =>
                      updateAccount(index, {
                        account: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field
                  label="合成商品"
                  error={fieldIssue(`accounts.${index}.currency`)}
                  hint={`自动：${effective.currency}`}
                >
                  <input
                    value={row.currency}
                    placeholder={effective.currency}
                    onChange={(event) =>
                      updateAccount(index, {
                        currency: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field
                  label="报价货币"
                  error={fieldIssue(`accounts.${index}.quote`)}
                  hint={`默认：${effectiveQuote}`}
                >
                  <input
                    value={row.quote}
                    placeholder={effectiveQuote}
                    onChange={(event) =>
                      updateAccount(index, {
                        quote: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field
                  label="盈亏账户"
                  error={fieldIssue(`accounts.${index}.pnlAccount`)}
                  hint={`自动：${effective.pnl}`}
                >
                  <input
                    value={row.pnlAccount}
                    placeholder={effective.pnl}
                    onChange={(event) =>
                      updateAccount(index, {
                        pnlAccount: event.target.value,
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          );
        })
      )}
      <datalist id="valuation-known-accounts">
        {knownAccounts.map((account) => (
          <option key={account} value={account} />
        ))}
      </datalist>
    </section>
  );
}
