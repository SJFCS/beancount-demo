import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useEscapeDismiss } from "@plugins/shared/frontend/use-escape-dismiss";
import type { PaymentsController } from "./use-payments";
import type { AccountPanel } from "./types";
import type { CounterpartyDescriptionMatch, CounterpartyKind } from "../types";
import { buildAccountLinkingIndex } from "./account-linking-index";
import { paymentMethodLabel, providerName } from "./display";
import {
  counterpartyKindLabels,
  counterpartyScopeOptions,
} from "./mapping-editor-row";
import {
  accountRoots,
  counterpartyKind,
  descriptionMatches,
  fundingAccountRoots,
  matchValue,
  readDescriptionCondition,
  validatePattern,
} from "../account-scope";
import {
  AccountBrowserSelect,
  accountHierarchyOptions,
  accountRootValues,
  createdAccountName,
  eligibleAccountNames,
} from "./account-picker";

function regexErrorMessage(pattern: string, cause: unknown) {
  if (/^[*+?]/u.test(pattern.trim()))
    return "量词不能单独使用：* 表示重复前一个字符；匹配任意内容请写 .*。";
  return cause instanceof Error ? cause.message : String(cause);
}

function commonAccountRoots(kinds: CounterpartyKind[]) {
  if (!kinds.length) return accountRootValues;
  return kinds
    .map((kind) => accountRoots(kind))
    .reduce((common, roots) => common.filter((root) => roots.includes(root)));
}

export function AccountDialog({
  controller,
}: {
  controller: PaymentsController;
}) {
  const accountPanel = useSyncExternalStore(
    controller.accountPanelState.subscribe,
    controller.accountPanelState.getSnapshot,
    controller.accountPanelState.getSnapshot,
  );
  if (!accountPanel) return null;
  return (
    <AccountDialogContent controller={controller} accountPanel={accountPanel} />
  );
}

function AccountDialogContent({
  controller: c,
  accountPanel,
}: {
  controller: PaymentsController;
  accountPanel: AccountPanel;
}) {
  const {
    setAccountPanel,
    batch,
    rows,
    paymentAccounts,
    counterpartyAccounts,
    accounts,
    busy,
    error,
    createAccount,
    linkAccount,
  } = c;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const optionListRef = useRef<HTMLFieldSetElement>(null);
  const [optionQuery, setOptionQuery] = useState("");
  const isDescription = accountPanel.mode === "description";
  const descriptionScope = accountPanel.descriptionScope ?? "all";
  const isPayment =
    accountPanel.mode === "payment" ||
    (isDescription && descriptionScope === "payment");
  const hasSourceSelector = !isDescription || descriptionScope !== "all";
  const isRegex = accountPanel.match === "regex";
  const isAllKinds = accountPanel.kind === "all";
  const anchor = accountPanel.rowId
    ? rows.find((row) => row.id === accountPanel.rowId)
    : undefined;
  const sourceLabel = isPayment ? "收/付款方式" : "交易对方";
  const sourceNames = isPayment
    ? accountPanel.payments
    : accountPanel.counterparties;
  const selectedNames = useMemo(
    () =>
      new Set(
        sourceNames.map(matchValue).filter((value) => isPayment || !!value),
      ),
    [sourceNames, isPayment],
  );
  const existingAccountNames = useMemo(
    () => eligibleAccountNames(accounts, accountRootValues),
    [accounts],
  );
  const accountOptions = useMemo(
    () => accountHierarchyOptions(existingAccountNames, accountRootValues),
    [existingAccountNames],
  );
  const index = useMemo(
    () =>
      buildAccountLinkingIndex(
        rows,
        paymentAccounts,
        counterpartyAccounts,
        batch?.provider ?? "",
      ),
    [rows, paymentAccounts, counterpartyAccounts, batch?.provider],
  );

  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.showModal();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected)
        opener.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    setOptionQuery("");
  }, [accountPanel.mode, descriptionScope]);
  useEffect(() => {
    if (isRegex || optionQuery) return;
    optionListRef.current
      ?.querySelector<HTMLElement>("label.is-selected")
      ?.scrollIntoView?.({ block: "nearest" });
  }, [accountPanel.mode, descriptionScope, isRegex, optionQuery]);
  useEscapeDismiss(dialogRef, true, () => {
    if (!busy) setAccountPanel(null);
  });

  let patternError = "";
  if (hasSourceSelector && isRegex && accountPanel.pattern.trim()) {
    try {
      validatePattern("regex", accountPanel.pattern);
    } catch (cause) {
      patternError = regexErrorMessage(accountPanel.pattern, cause);
    }
  }
  const descriptionPattern = accountPanel.descriptionPattern?.trim() ?? "";
  const descriptionMatch = accountPanel.descriptionMatch ?? "contains";
  const descriptionCondition = useMemo<
    CounterpartyDescriptionMatch | undefined
  >(
    () =>
      isDescription && descriptionPattern
        ? { match: descriptionMatch, pattern: descriptionPattern }
        : undefined,
    [isDescription, descriptionMatch, descriptionPattern],
  );
  let descriptionError = "";
  if (descriptionCondition) {
    try {
      readDescriptionCondition(descriptionCondition);
    } catch (cause) {
      descriptionError = regexErrorMessage(descriptionPattern, cause);
    }
  }
  const sourceConditionReady =
    !hasSourceSelector ||
    (isRegex
      ? !!accountPanel.pattern.trim() && !patternError
      : selectedNames.size > 0);
  const scopeRows = useMemo(() => {
    const expression =
      isRegex && accountPanel.pattern.trim() && !patternError
        ? new RegExp(accountPanel.pattern.trim(), "u")
        : undefined;
    return index.rows.filter(({ row, kind, payee, payment }) => {
      if (row.locked || row.committedAt) return false;
      if (!isPayment && !isAllKinds && kind !== accountPanel.kind) return false;
      if (!hasSourceSelector) return true;
      const value = isPayment ? payment : payee;
      return isRegex ? !!expression?.test(value) : selectedNames.has(value);
    });
  }, [
    index,
    accountPanel.kind,
    accountPanel.pattern,
    isPayment,
    isAllKinds,
    hasSourceSelector,
    isRegex,
    patternError,
    selectedNames,
  ]);
  const matchedRows = useMemo(
    () =>
      isDescription && !descriptionCondition
        ? []
        : scopeRows
            .filter(({ row }) =>
              descriptionMatches(descriptionCondition, row.description),
            )
            .map(({ row }) => row),
    [scopeRows, isDescription, descriptionCondition],
  );
  const descriptionOptions = useMemo(() => {
    const values = new Map<string, number>();
    for (const { row } of scopeRows) {
      const value = matchValue(row.description);
      if (value) values.set(value, (values.get(value) ?? 0) + 1);
    }
    return [...values].map(([description, count]) => ({ description, count }));
  }, [scopeRows]);
  const visibleDescriptionOptions = useMemo(
    () =>
      descriptionCondition
        ? descriptionOptions.filter(({ description }) =>
            descriptionMatches(descriptionCondition, description),
          )
        : descriptionOptions,
    [descriptionCondition, descriptionOptions],
  );
  const allOptions = isPayment
    ? [...new Set([...index.payments, ...accountPanel.payments])]
    : [
        ...new Set([
          ...(isAllKinds
            ? index.allCounterparties
            : (index.counterpartyOptions.get(
                accountPanel.kind as CounterpartyKind,
              ) ?? [])),
          ...accountPanel.counterparties.map(matchValue),
        ]),
      ].filter(Boolean);
  const needle = optionQuery.trim().toLocaleLowerCase();
  const visibleOptions = allOptions.filter((value) =>
    (isPayment ? paymentMethodLabel(value) : value)
      .toLocaleLowerCase()
      .includes(needle),
  );
  const previewItems = useMemo(() => {
    const values = new Map<string, number>();
    for (const row of matchedRows) {
      const label = isPayment
        ? paymentMethodLabel(matchValue(row.payment))
        : matchValue(row.payee);
      values.set(label, (values.get(label) ?? 0) + 1);
    }
    return [...values].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"),
    );
  }, [matchedRows, isPayment]);
  const otherKindMatches = useMemo(() => {
    if (isPayment || !isRegex || patternError || !accountPanel.pattern.trim())
      return [];
    const expression = new RegExp(accountPanel.pattern.trim(), "u");
    return counterpartyScopeOptions
      .filter(
        (option) =>
          option.value !== "all" && option.value !== accountPanel.kind,
      )
      .map((option) => ({
        label: option.label,
        count: index.rows.filter(
          ({ row, payee, kind }) =>
            !row.locked &&
            !row.committedAt &&
            kind === option.value &&
            expression.test(payee) &&
            descriptionMatches(descriptionCondition, row.description),
        ).length,
      }))
      .filter((item) => item.count > 0);
  }, [
    index,
    isPayment,
    isRegex,
    patternError,
    accountPanel.pattern,
    accountPanel.kind,
    descriptionCondition,
  ]);
  const selectedKinds: CounterpartyKind[] = isPayment
    ? []
    : isAllKinds
      ? hasSourceSelector
        ? [
            ...new Set(
              [...selectedNames].flatMap((name) => [
                ...(index.counterparties.get(name)?.applicableKinds ?? []),
              ]),
            ),
          ]
        : [...new Set(matchedRows.map(counterpartyKind))]
      : [accountPanel.kind as CounterpartyKind];
  const roots = commonAccountRoots(selectedKinds);
  const accountReady = !!accountPanel.account;
  const ready =
    accountReady &&
    sourceConditionReady &&
    !patternError &&
    !descriptionError &&
    (!isDescription || !!descriptionCondition) &&
    (!isAllKinds || selectedKinds.length > 0);
  const accountRootWarning =
    !isPayment &&
    accountReady &&
    selectedKinds.length &&
    !roots.includes(accountPanel.account.split(":")[0])
      ? selectedKinds.length > 1 && !roots.length
        ? `所选收支类型没有共同推荐的账户类别；仍可共用 ${accountPanel.account} 保存，请逐笔核对退款、冲销和转账。`
        : `“${selectedKinds.map((kind) => counterpartyKindLabels[kind]).join("、")}”通常关联 ${roots.join(" / ")} 账户；仍可保存为 ${accountPanel.account}，请核对退款、冲销或账户间调整。`
      : "";
  const sourceSummary = !hasSourceSelector
    ? ""
    : isRegex
      ? accountPanel.pattern.trim() || `等待填写${sourceLabel}规则`
      : [...selectedNames]
          .map((value) => (isPayment ? paymentMethodLabel(value) : value))
          .join("、") || `等待选择${sourceLabel}`;
  const matchSummary = isDescription
    ? `商品说明${descriptionMatch === "contains" ? "包含" : "匹配"}“${descriptionPattern || "等待输入"}”${hasSourceSelector ? ` 且 ${sourceSummary}` : ""}`
    : sourceSummary;
  const descriptionHint = descriptionError
    ? descriptionError
    : !descriptionPattern
      ? "输入关键词或从交易内容中选择；可按交易对方或收/付款方式限制范围。"
      : !sourceConditionReady
        ? `请先选择限制范围中的${sourceLabel}。`
        : matchedRows.length
          ? hasSourceSelector
            ? `${sourceLabel}与商品说明同时命中，当前匹配 ${matchedRows.length} 笔。`
            : `商品说明${descriptionMatch === "contains" ? "包含" : "匹配"}“${descriptionPattern}”，当前匹配 ${matchedRows.length} 笔。`
          : hasSourceSelector && scopeRows.length
            ? `${sourceLabel}已命中 ${scopeRows.length} 笔，但商品说明${descriptionMatch === "contains" ? "包含" : "匹配"}“${descriptionPattern}”没有命中。`
            : "当前范围没有匹配的未锁定交易；规则仍可保存，用于后续账单。";

  function switchMode(mode: AccountPanel["mode"]) {
    if (mode === accountPanel.mode) return;
    setAccountPanel({
      ...accountPanel,
      mode,
      descriptionScope: "all",
      kind:
        mode === "payment"
          ? "payment"
          : anchor
            ? counterpartyKind(anchor)
            : "expense",
      payments: mode === "payment" && anchor ? [anchor.payment] : [],
      counterparties:
        mode === "counterparty" && anchor?.payee ? [anchor.payee] : [],
      match: "exact",
      pattern: "",
      descriptionMatch: "contains",
      descriptionPattern:
        mode === "description" ? (anchor?.description ?? "") : "",
      account: "",
    });
  }
  function setScope(scope: NonNullable<AccountPanel["descriptionScope"]>) {
    setAccountPanel({
      ...accountPanel,
      descriptionScope: scope,
      kind:
        scope === "payment"
          ? "payment"
          : anchor
            ? counterpartyKind(anchor)
            : "expense",
      payments: scope === "payment" && anchor ? [anchor.payment] : [],
      counterparties:
        scope === "counterparty" && anchor?.payee ? [anchor.payee] : [],
      match: "exact",
      pattern: "",
      account: "",
    });
  }
  function setMatchMode(match: "exact" | "regex") {
    if (match === accountPanel.match) return;
    setAccountPanel({
      ...accountPanel,
      match,
      kind: isAllKinds
        ? anchor
          ? counterpartyKind(anchor)
          : "expense"
        : accountPanel.kind,
      pattern:
        match === "regex"
          ? (sourceNames[0] ??
            (isPayment ? anchor?.payment : anchor?.payee) ??
            "")
          : accountPanel.pattern,
      ...(isPayment
        ? {
            payments:
              match === "regex"
                ? []
                : allOptions.includes(accountPanel.pattern)
                  ? [accountPanel.pattern]
                  : [],
          }
        : {}),
    });
  }
  function toggleSource(value: string, checked: boolean) {
    const values = checked
      ? [...new Set([...sourceNames, value])]
      : sourceNames.filter((item) => matchValue(item) !== value);
    setAccountPanel({
      ...accountPanel,
      ...(isPayment ? { payments: values } : { counterparties: values }),
    });
  }

  const sourceSelector = hasSourceSelector && (
    <div
      className={`pm-link-selector ${isPayment ? "pm-payment-selector" : "pm-counterparty-selector"}`}
    >
      <div className="pm-link-control">
        <span className="pm-link-control-label">匹配方式</span>
        <div
          className="pm-link-rule-tabs"
          role="group"
          aria-label={isPayment ? "收付款方式匹配方式" : "交易对方匹配方式"}
        >
          <button
            type="button"
            aria-pressed={!isRegex}
            disabled={!!busy}
            onClick={() => setMatchMode("exact")}
          >
            {isPayment ? "按方式选择" : "按交易对方选择"}
          </button>
          <button
            type="button"
            aria-pressed={isRegex}
            disabled={!!busy}
            onClick={() => setMatchMode("regex")}
          >
            自定义匹配
          </button>
        </div>
      </div>
      {isRegex ? (
        <div className="pm-rule-editor">
          <label className="pm-rule-input">
            <span>
              正则表达式<small>任意内容用 .*；多个值用 | 连接</small>
            </span>
            <input
              type="text"
              aria-label={
                isPayment
                  ? "收付款方式自定义匹配规则"
                  : "交易对方自定义匹配规则"
              }
              placeholder={
                isPayment ? "例如：花呗|白条|分期" : "例如：美团|饿了么"
              }
              value={accountPanel.pattern}
              disabled={!!busy}
              maxLength={200}
              onChange={(event) =>
                setAccountPanel({
                  ...accountPanel,
                  pattern: event.target.value,
                })
              }
              onBlur={(event) =>
                setAccountPanel({
                  ...accountPanel,
                  pattern: event.target.value.trim(),
                })
              }
            />
          </label>
          <div className="pm-rule-example">
            <span>匹配字段</span>
            <p>
              {isPayment
                ? "收/付款方式名称"
                : "交易对方名称（不检查摘要、分类或单号）"}
            </p>
          </div>
          <div className="pm-rule-example">
            <span>作用范围</span>
            <p>
              仅影响{providerName(batch?.provider ?? "")}、
              {isPayment
                ? "收/付款方式"
                : isAllKinds
                  ? "全部"
                  : counterpartyKindLabels[
                      accountPanel.kind as CounterpartyKind
                    ]}
              类型的未锁定交易
            </p>
          </div>
          <section
            className={`pm-regex-preview${patternError ? " is-error" : ""}`}
            aria-label={`${isPayment ? "收付款方式" : "交易对方"}匹配预览`}
            aria-live="polite"
          >
            <header>
              <strong>{patternError ? "规则需要修正" : "匹配预览"}</strong>
              <span>
                {patternError ||
                  (accountPanel.pattern.trim()
                    ? `${previewItems.length} 项 · ${matchedRows.length} 笔`
                    : "等待输入")}
              </span>
            </header>
            {patternError ? (
              <p className="pm-regex-empty">{patternError}</p>
            ) : !accountPanel.pattern.trim() ? (
              <p className="pm-regex-empty">
                {isPayment ? "等待填写方式名称" : "等待填写交易对方规则"}
              </p>
            ) : previewItems.length ? (
              <ul>
                {previewItems.map(([label, count]) => (
                  <li key={label}>
                    <strong title={label}>{label}</strong>
                    <span>{count} 笔</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pm-regex-empty">
                {otherKindMatches.length
                  ? `当前“${counterpartyKindLabels[accountPanel.kind as CounterpartyKind]}”没有匹配；该规则在${otherKindMatches.map((item) => `“${item.label}”命中 ${item.count} 笔`).join("、")}，请切换收支类型。`
                  : `当前账单没有匹配项；这里只检查${sourceLabel}字段。`}
              </p>
            )}
          </section>
        </div>
      ) : (
        <>
          <label className="pm-link-search">
            <span>查找{sourceLabel}</span>
            <input
              type="search"
              aria-label={isPayment ? "搜索收付款方式" : "搜索交易对方"}
              placeholder={
                isPayment ? "输入银行卡、余额等关键词" : "输入商户或姓名"
              }
              value={optionQuery}
              disabled={!!busy}
              onChange={(event) => setOptionQuery(event.target.value)}
            />
          </label>
          <fieldset
            ref={optionListRef}
            className="pm-account-option-list"
            disabled={!!busy}
          >
            <legend className="pm-visually-hidden">{sourceLabel}列表</legend>
            {visibleOptions.map((value) => {
              const details = index.counterparties.get(value);
              const linked = isPayment
                ? index.paymentLinks.get(value)
                : isAllKinds
                  ? details?.firstLink
                  : details?.links.get(accountPanel.kind as CounterpartyKind);
              const checked = selectedNames.has(matchValue(value));
              return (
                <label
                  key={value || "unspecified-payment"}
                  className={checked ? "is-selected" : undefined}
                >
                  <input
                    type="checkbox"
                    aria-label={isPayment ? paymentMethodLabel(value) : value}
                    checked={checked}
                    onChange={(event) =>
                      toggleSource(value, event.target.checked)
                    }
                  />
                  <span className="pm-option-copy">
                    <strong>
                      {isPayment ? paymentMethodLabel(value) : value}
                    </strong>
                    <small>
                      {!isPayment && isAllKinds
                        ? `${[...(details?.kinds ?? [])].map((kind) => counterpartyKindLabels[kind]).join(" / ")} · `
                        : ""}
                      {linked
                        ? `当前：${linked.account}`
                        : `尚未关联${isPayment ? "资金" : "分类"}账户`}
                    </small>
                  </span>
                  <span className="pm-option-state" data-linked={!!linked}>
                    {checked ? "已选" : linked ? "已关联" : "可绑定"}
                  </span>
                </label>
              );
            })}
            {!visibleOptions.length && (
              <p>
                {isPayment
                  ? "没有匹配的收/付款方式"
                  : "该类型下没有匹配的交易对方"}
              </p>
            )}
          </fieldset>
        </>
      )}
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      className="pm-account-dialog"
      aria-labelledby="pm-account-panel-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) setAccountPanel(null);
      }}
    >
      <form
        className="pm-account-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) void linkAccount(accountPanel);
        }}
      >
        <header className="pm-account-dialog-head">
          <div>
            <span className="pm-dialog-eyebrow">ACCOUNT LINKING</span>
            <h2 id="pm-account-panel-title">账户关联</h2>
            <p>选择匹配依据，再指定账户。</p>
          </div>
          <button
            className="pm-dialog-close"
            type="button"
            aria-label="关闭账户关联表单"
            aria-keyshortcuts="Escape"
            title="关闭（Esc）"
            disabled={!!busy}
            onClick={() => setAccountPanel(null)}
          >
            ×
          </button>
        </header>
        <div className="pm-account-dialog-context">
          <span className="pm-provider-chip" data-provider={batch?.provider}>
            {providerName(batch?.provider ?? "")}
          </span>
          <span>
            {anchor ? `正在处理第 ${anchor.line} 行` : "本批次批量关联"} ·
            保存后更新未锁定交易，并复用于后续
            {providerName(batch?.provider ?? "")}账单
          </span>
        </div>
        <div className="pm-account-dialog-steps">
          <section className="pm-account-dialog-section">
            <header className="pm-form-step">
              <span className="pm-form-step-index">01</span>
              <div>
                <strong>选择匹配依据</strong>
                <small>选择一种规则；交易内容可附加范围条件</small>
              </div>
              <b>{matchedRows.length} 笔</b>
            </header>
            <div
              className="pm-link-dimensions"
              role="group"
              aria-label="账户关联维度"
            >
              {(
                [
                  ["counterparty", "交易对方", "商户或姓名"],
                  ["payment", "收/付款方式", "资金渠道"],
                  ["description", "交易内容", "商品说明，可限制范围"],
                ] as const
              ).map(([mode, label, hint]) => (
                <button
                  key={mode}
                  type="button"
                  data-rule-type={mode}
                  aria-pressed={accountPanel.mode === mode}
                  disabled={!!busy}
                  onClick={() => switchMode(mode)}
                >
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </button>
              ))}
            </div>
            {isDescription && (
              <div className="pm-description-condition pm-description-primary">
                <div className="pm-link-control">
                  <span className="pm-link-control-label">匹配方式</span>
                  <div
                    className="pm-link-rule-tabs"
                    role="group"
                    aria-label="商品说明匹配方式"
                  >
                    {(["contains", "regex"] as const).map((match) => (
                      <button
                        key={match}
                        type="button"
                        aria-pressed={descriptionMatch === match}
                        disabled={!!busy}
                        onClick={() =>
                          setAccountPanel({
                            ...accountPanel,
                            descriptionMatch: match,
                          })
                        }
                      >
                        {match === "contains" ? "包含" : "正则"}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="pm-link-search">
                  <span>匹配商品说明</span>
                  <input
                    type="search"
                    aria-label="商品说明匹配规则"
                    placeholder={
                      descriptionMatch === "contains"
                        ? "例如：机票"
                        : "例如：机票|行李"
                    }
                    value={accountPanel.descriptionPattern ?? ""}
                    disabled={!!busy}
                    maxLength={200}
                    onChange={(event) =>
                      setAccountPanel({
                        ...accountPanel,
                        descriptionPattern: event.target.value,
                      })
                    }
                    onBlur={(event) =>
                      setAccountPanel({
                        ...accountPanel,
                        descriptionPattern: event.target.value.trim(),
                      })
                    }
                  />
                </label>
                <div className="pm-link-control pm-description-scope">
                  <span className="pm-link-control-label">限制范围</span>
                  <div
                    className="pm-link-rule-tabs"
                    role="group"
                    aria-label="交易内容限制范围"
                  >
                    {(
                      [
                        ["all", "不限范围"],
                        ["counterparty", "交易对方"],
                        ["payment", "收/付款方式"],
                      ] as const
                    ).map(([scope, label]) => (
                      <button
                        key={scope}
                        type="button"
                        aria-pressed={descriptionScope === scope}
                        disabled={!!busy}
                        onClick={() => setScope(scope)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!isPayment && (
              <div className="pm-link-control">
                <span className="pm-link-control-label">收支类型</span>
                <div
                  className="pm-link-kind-tabs"
                  role="group"
                  aria-label="交易对方类型"
                >
                  {counterpartyScopeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={accountPanel.kind === option.value}
                      disabled={!!busy}
                      onClick={() =>
                        setAccountPanel({
                          ...accountPanel,
                          kind: option.value as CounterpartyKind | "all",
                          counterparties: [],
                          account: "",
                          ...(option.value === "all" && isRegex
                            ? { match: "exact", pattern: "" }
                            : {}),
                        })
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {sourceSelector}
            {!isDescription && (
              <p className="pm-rule-selection-hint">
                {isRegex
                  ? "使用正则规则匹配当前及后续同平台账单"
                  : isPayment
                    ? "可多选，所选方式共用右侧资金账户"
                    : isAllKinds
                      ? "可跨收支类型选择，保存时按实际类型拆分规则"
                      : "可多选；仅显示同平台、同收支类型的交易对方"}
                。如需按商品说明区分账户，请选择“交易内容”。
              </p>
            )}
            {isDescription && (
              <>
                <div
                  className={`pm-description-hint${descriptionError ? " is-error" : ""}`}
                  role={descriptionError ? "alert" : "status"}
                  aria-live="polite"
                >
                  <p>{descriptionHint}</p>
                </div>
                <fieldset className="pm-description-options" disabled={!!busy}>
                  <legend>
                    <span>筛选交易内容</span>
                    <small>
                      {visibleDescriptionOptions.length} /{" "}
                      {descriptionOptions.length} 条
                    </small>
                  </legend>
                  {visibleDescriptionOptions.map(({ description, count }) => (
                    <button
                      type="button"
                      key={description}
                      title={description}
                      aria-label={`使用交易内容 ${description}`}
                      data-selected={
                        descriptionMatch === "contains" &&
                        descriptionPattern === description
                      }
                      data-match={
                        !!descriptionCondition &&
                        descriptionMatches(descriptionCondition, description)
                      }
                      onClick={() =>
                        setAccountPanel({
                          ...accountPanel,
                          descriptionMatch: "contains",
                          descriptionPattern: description,
                        })
                      }
                    >
                      <span>{description}</span>
                      <small>{count} 笔</small>
                    </button>
                  ))}
                  {!visibleDescriptionOptions.length && (
                    <p>
                      {descriptionOptions.length
                        ? "没有匹配的交易内容，请调整商品说明条件。"
                        : "当前范围没有可用的交易内容。"}
                    </p>
                  )}
                </fieldset>
              </>
            )}
          </section>
          <section className="pm-account-dialog-section pm-account-target">
            <header className="pm-form-step">
              <span className="pm-form-step-index">02</span>
              <div>
                <strong>选择账户</strong>
                <small>
                  {isPayment
                    ? "指定实际收款或扣款的资金账户"
                    : "将符合条件的交易归入此分类账户"}
                </small>
              </div>
              {accountReady && <b className="is-ready">已就绪</b>}
            </header>
            <div className="pm-account-target-picker">
              <span>{isPayment ? "资金账户" : "分类账户"}</span>
              <AccountBrowserSelect
                label={isPayment ? "关联的资金账户" : "关联的分类账户"}
                searchLabel={
                  isPayment ? "搜索关联的资金账户" : "搜索关联的分类账户"
                }
                value={accountPanel.account}
                relevantRoots={isPayment ? fundingAccountRoots : undefined}
                disabled={!!busy}
                options={accountOptions}
                selectableValues={existingAccountNames}
                placeholder="选择或创建账户"
                createDate={accountPanel.date}
                onCreateAccount={(parent, leaf, date) =>
                  createAccount(createdAccountName(parent, leaf), date)
                }
                onChange={(account) =>
                  setAccountPanel({ ...accountPanel, account })
                }
              />
            </div>
            {!!accountRootWarning && (
              <p className="pm-account-root-warning" role="status">
                {accountRootWarning}
              </p>
            )}
            <p className="pm-account-target-note">
              每组匹配条件独立保存；只有完全相同的规则会更新账户。规则按管理面板中的优先级从上到下匹配。
            </p>
            <div className="pm-account-route-preview">
              <div>
                <span>匹配范围</span>
                <strong title={matchSummary}>{matchSummary}</strong>
                <small>{matchedRows.length} 笔未锁定交易</small>
              </div>
              <i aria-hidden="true">→</i>
              <div>
                <span>{isPayment ? "实际资金账户" : "目标分类账户"}</span>
                <strong title={accountPanel.account || undefined}>
                  {accountPanel.account || "等待选择账户"}
                </strong>
                <small>{isPayment ? "按资金来源记账" : "统一写入该分类"}</small>
              </div>
            </div>
          </section>
        </div>
        {error && (
          <div className="pm-error" role="alert">
            {error}
          </div>
        )}
        <footer className="pm-account-dialog-footer">
          <div className="pm-account-save-preview">
            <span>保存后</span>
            <strong>
              {isDescription
                ? "交易内容规则"
                : isRegex
                  ? "1 条正则规则"
                  : `${selectedNames.size} 个${sourceLabel}`}
              <i aria-hidden="true">→</i>
              {accountPanel.account || "尚未选择账户"}
            </strong>
          </div>
          <div className="pm-account-dialog-actions">
            <button
              type="button"
              disabled={!!busy}
              onClick={() => setAccountPanel(null)}
            >
              取消
            </button>
            <button
              className="pm-primary"
              type="submit"
              aria-label="保存关联"
              disabled={!!busy || !ready}
            >
              <span>保存关联</span>
              <small>
                {ready ? `匹配 ${matchedRows.length} 笔` : "完善匹配与账户"}
              </small>
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
