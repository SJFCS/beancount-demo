import React, { useMemo, useState } from "react";
import type { PaymentsController } from "./use-payments";
import type { CounterpartyAccount, PaymentAccount } from "../types";
import {
  compareRulePriority,
  mappingRuleId,
  sortCounterpartyRules,
  sortPaymentRules,
} from "../account-scope";
import { paymentMethodLabel, providerName } from "./display";
import { counterpartyKindLabels as kindLabels } from "./mapping-editor-row";
import { mappingManagerStyles } from "./mapping-manager-styles";
import { accountRoots } from "./account-picker";

type SavedRule =
  | { type: "payment"; rule: PaymentAccount }
  | { type: "counterparty"; rule: CounterpartyAccount };

type MappingGroup = {
  provider: string;
  account: string;
  payments: PaymentAccount[];
  counterparties: CounterpartyAccount[];
};

function ruleCount(group: MappingGroup) {
  return group.payments.length + group.counterparties.length;
}

function providerRank(provider: string) {
  return provider === "alipay" ? 0 : provider === "wechat" ? 1 : 2;
}
const accountCategoryOrder = [
  "Assets",
  "Liabilities",
  "Income",
  "Expenses",
  "Equity",
];
function accountRank(account: string) {
  const index = accountCategoryOrder.indexOf(account.split(":")[0]);
  return index < 0 ? 5 : index;
}

function savedRuleId(item: SavedRule) {
  return mappingRuleId(item.type, item.rule);
}

function ruleCategory(item: SavedRule) {
  return item.rule.description
    ? "content"
    : item.type === "payment"
      ? "payment"
      : "counterparty";
}

function ruleCategoryLabel(item: SavedRule) {
  return item.rule.description
    ? "交易内容"
    : item.type === "payment"
      ? "收/付款方式"
      : "交易对方";
}

function ruleLabel(item: SavedRule) {
  return item.type === "payment"
    ? paymentMethodLabel(item.rule.payment)
    : item.rule.pattern || "仅交易内容";
}

function ruleDescription(item: SavedRule) {
  const description = item.rule.description;
  const scope =
    item.type === "payment"
      ? item.rule.match === "regex"
        ? "正则规则"
        : ""
      : `${kindLabels[item.rule.kind]}${item.rule.match === "regex" ? " · 正则" : ""}`;
  return [
    scope,
    description
      ? `商品说明${description.match === "contains" ? "包含" : "正则"}「${description.pattern}」`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function paymentConditions({ payment, match, description }: PaymentAccount) {
  return {
    payment,
    ...(match ? { match } : {}),
    ...(description ? { description } : {}),
  };
}

function counterpartyConditions({
  kind,
  match,
  pattern,
  description,
}: CounterpartyAccount) {
  return {
    kind,
    ...(pattern ? { match, pattern } : {}),
    ...(description ? { description } : {}),
  };
}

export function MappingManager({
  controller: c,
  canWrite,
}: {
  controller: PaymentsController;
  canWrite: boolean;
}) {
  const {
    paymentAccounts = [],
    counterpartyAccounts = [],
    busy,
    deleteMappings,
    reorderMappings,
  } = c;
  const [savedSearch, setSavedSearch] = useState("");
  const [selectedAccountRoots, setSelectedAccountRoots] = useState<string[]>(
    [],
  );
  const [view, setView] = useState<"accounts" | "priority">("accounts");
  const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);
  const [dropRuleId, setDropRuleId] = useState<string | null>(null);
  const [sorting, setSorting] = useState(false);
  const disabled = !canWrite || !!busy || sorting;

  const orderedRules = useMemo(() => {
    const rules: SavedRule[] = [
      ...sortCounterpartyRules(counterpartyAccounts).map(
        (rule): SavedRule => ({ type: "counterparty", rule }),
      ),
      ...sortPaymentRules(paymentAccounts).map(
        (rule): SavedRule => ({ type: "payment", rule }),
      ),
    ];
    return rules.sort(
      (first, second) =>
        compareRulePriority(first.rule, second.rule) ||
        Number(!first.rule.description) - Number(!second.rule.description),
    );
  }, [paymentAccounts, counterpartyAccounts]);
  const rulePositions = useMemo(
    () =>
      new Map(orderedRules.map((rule, index) => [savedRuleId(rule), index])),
    [orderedRules],
  );

  const savedGroups = useMemo(() => {
    const groups = new Map<string, MappingGroup>();
    const getGroup = (provider: string, account: string) => {
      const key = JSON.stringify([provider, account]);
      let group = groups.get(key);
      if (!group) {
        group = { provider, account, payments: [], counterparties: [] };
        groups.set(key, group);
      }
      return group;
    };
    for (const item of orderedRules) {
      const group = getGroup(item.rule.provider, item.rule.account);
      if (item.type === "payment") group.payments.push(item.rule);
      else group.counterparties.push(item.rule);
    }
    return [...groups.values()].sort(
      (first, second) =>
        providerRank(first.provider) - providerRank(second.provider) ||
        providerName(first.provider).localeCompare(
          providerName(second.provider),
        ) ||
        accountRank(first.account) - accountRank(second.account) ||
        first.account.localeCompare(second.account),
    );
  }, [orderedRules]);

  const visibleGroups = useMemo(() => {
    const query = savedSearch.trim().toLocaleLowerCase();
    return savedGroups.filter(
      (group) =>
        (!selectedAccountRoots.length ||
          selectedAccountRoots.includes(group.account.split(":")[0])) &&
        [
          providerName(group.provider),
          group.provider,
          group.account,
          ...group.payments.map((rule) =>
            [
              ruleLabel({ type: "payment", rule }),
              ruleDescription({ type: "payment", rule }),
            ].join(" "),
          ),
          ...group.counterparties.map((rule) =>
            [
              ruleLabel({ type: "counterparty", rule }),
              ruleDescription({ type: "counterparty", rule }),
            ].join(" "),
          ),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query),
    );
  }, [savedGroups, savedSearch, selectedAccountRoots]);
  const accountCategories = useMemo(() => {
    const categories = new Set([
      ...accountCategoryOrder,
      ...savedGroups.map((group) => group.account.split(":")[0]),
    ]);
    return [...categories].map((root) => ({
      root,
      label: accountRoots[root]?.label ?? root,
      color: accountRoots[root]?.color ?? "#64748b",
      count: savedGroups.filter((group) => group.account.split(":")[0] === root)
        .length,
    }));
  }, [savedGroups]);

  const providerGroups = useMemo(() => {
    const groups = new Map<string, MappingGroup[]>();
    for (const group of visibleGroups) {
      const provider = groups.get(group.provider) ?? [];
      provider.push(group);
      groups.set(group.provider, provider);
    }
    return [...groups.entries()];
  }, [visibleGroups]);

  const visibleRules = useMemo(() => {
    const query = savedSearch.trim().toLocaleLowerCase();
    if (!query) return orderedRules;
    return orderedRules.filter((item) =>
      [
        providerName(item.rule.provider),
        item.rule.provider,
        item.rule.account,
        ruleCategoryLabel(item),
        ruleLabel(item),
        ruleDescription(item),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [orderedRules, savedSearch]);

  const visibleRuleCount = visibleGroups.reduce(
    (total, group) => total + ruleCount(group),
    0,
  );

  async function remove(group: MappingGroup) {
    const count = ruleCount(group);
    if (
      !window.confirm(
        `删除 ${providerName(group.provider)} 到 ${group.account} 的 ${count} 条关联？删除后新账单将不再自动使用这些规则。`,
      )
    )
      return;
    await deleteMappings({
      provider: group.provider,
      account: group.account,
      paymentMappings: group.payments.map(paymentConditions),
      rules: group.counterparties.map(counterpartyConditions),
    });
  }

  async function removeRule(item: SavedRule) {
    if (disabled) return;
    await deleteMappings({
      provider: item.rule.provider,
      account: item.rule.account,
      paymentMappings:
        item.type === "payment" ? [paymentConditions(item.rule)] : [],
      rules:
        item.type === "counterparty" ? [counterpartyConditions(item.rule)] : [],
    });
  }

  async function moveRule(ruleId: string, targetId: string) {
    if (disabled || ruleId === targetId) return;
    const ruleIds = orderedRules.map(savedRuleId);
    const fromIndex = ruleIds.indexOf(ruleId);
    const targetIndex = ruleIds.indexOf(targetId);
    if (fromIndex < 0 || targetIndex < 0) return;
    ruleIds.splice(fromIndex, 1);
    ruleIds.splice(targetIndex, 0, ruleId);
    setSorting(true);
    try {
      await reorderMappings(ruleIds);
    } finally {
      setSorting(false);
      setDraggedRuleId(null);
      setDropRuleId(null);
    }
  }

  function renderRule(item: SavedRule, sortable = false) {
    const ruleId = savedRuleId(item);
    const index = rulePositions.get(ruleId) ?? 0;
    const label = ruleLabel(item);
    const actionLabel = `${label}${item.rule.description ? ` · ${item.rule.description.pattern}` : ""}`;
    const description = ruleDescription(item);
    return (
      <div
        className={`pm-saved-rule-chip pm-managed-rule${sortable ? " is-sortable" : ""}${draggedRuleId === ruleId ? " is-dragging" : ""}${dropRuleId === ruleId ? " is-drop-target" : ""}`}
        key={ruleId}
        data-rule-type={ruleCategory(item)}
        data-rule-id={ruleId}
        draggable={sortable && !disabled}
        onDragStart={
          sortable
            ? (event) => {
                if (disabled) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", ruleId);
                setDraggedRuleId(ruleId);
              }
            : undefined
        }
        onDragOver={
          sortable
            ? (event) => {
                if (disabled || !draggedRuleId || draggedRuleId === ruleId)
                  return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropRuleId(ruleId);
              }
            : undefined
        }
        onDragLeave={sortable ? () => setDropRuleId(null) : undefined}
        onDrop={
          sortable
            ? (event) => {
                event.preventDefault();
                const sourceId =
                  draggedRuleId || event.dataTransfer.getData("text/plain");
                if (sourceId) void moveRule(sourceId, ruleId);
              }
            : undefined
        }
        onDragEnd={
          sortable
            ? () => {
                setDraggedRuleId(null);
                setDropRuleId(null);
              }
            : undefined
        }
      >
        <span className="pm-rule-priority" title={`优先级 ${index + 1}`}>
          {sortable && <span aria-hidden="true">⠿</span>}
          {index + 1}
        </span>
        <span className="pm-managed-rule-copy">
          <span className="pm-rule-type-label">{ruleCategoryLabel(item)}</span>
          <strong>{label}</strong>
          {description && <small>{description}</small>}
          {sortable && (
            <span className="pm-managed-rule-target">
              {providerName(item.rule.provider)} → {item.rule.account}
            </span>
          )}
        </span>
        <span className="pm-managed-rule-actions">
          {sortable && (
            <>
              <button
                type="button"
                aria-label={`上移规则 ${actionLabel}`}
                title="提高优先级"
                disabled={disabled || index === 0}
                onClick={() =>
                  void moveRule(ruleId, savedRuleId(orderedRules[index - 1]))
                }
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`下移规则 ${actionLabel}`}
                title="降低优先级"
                disabled={disabled || index === orderedRules.length - 1}
                onClick={() =>
                  void moveRule(ruleId, savedRuleId(orderedRules[index + 1]))
                }
              >
                ↓
              </button>
            </>
          )}
          <button
            className="pm-danger"
            type="button"
            aria-label={`删除规则 ${actionLabel}`}
            title="只删除此条规则"
            disabled={disabled}
            onClick={() => void removeRule(item)}
          >
            删除
          </button>
        </span>
      </div>
    );
  }

  function renderRuleGroups(group: MappingGroup) {
    const items: SavedRule[] = [
      ...group.payments.map((rule): SavedRule => ({ type: "payment", rule })),
      ...group.counterparties.map(
        (rule): SavedRule => ({ type: "counterparty", rule }),
      ),
    ];
    return (["counterparty", "payment", "content"] as const).map((category) => {
      const categoryRules = items
        .filter((item) => ruleCategory(item) === category)
        .sort(
          (first, second) =>
            (rulePositions.get(savedRuleId(first)) ?? 0) -
            (rulePositions.get(savedRuleId(second)) ?? 0),
        );
      if (!categoryRules.length) return null;
      const label =
        category === "content"
          ? "交易内容"
          : category === "payment"
            ? "支付方式"
            : "交易对方";
      return (
        <div className="pm-saved-rule-group" key={category}>
          <span>
            {label} · {categoryRules.length}
          </span>
          <div>{categoryRules.map((item) => renderRule(item))}</div>
        </div>
      );
    });
  }

  return (
    <details className="pm-card pm-mapping-manager" id="pm-mapping-manager">
      <summary>
        <span>
          <strong>账户关联管理</strong>
          <small>{`已保存 ${paymentAccounts.length + counterpartyAccounts.length} 条规则，导入新账单时自动复用`}</small>
        </span>
        <span className="pm-mapping-summary-action">查看与管理</span>
      </summary>
      <style>{mappingManagerStyles}</style>
      <div className="pm-mapping-manager-body">
        <div className="pm-mapping-overview">
          <div>
            <strong>已保存关联</strong>
            <span>
              {visibleGroups.length} 个目标账户 · {visibleRuleCount} 条
            </span>
          </div>
          <input
            type="search"
            aria-label="搜索已保存关联"
            placeholder="搜索平台、支付方式、交易对方、商品说明或账户"
            value={savedSearch}
            onChange={(event) => setSavedSearch(event.target.value)}
          />
        </div>
        <div className="pm-mapping-management-toolbar">
          <div
            className="pm-link-rule-tabs"
            role="group"
            aria-label="规则管理视图"
          >
            <button
              type="button"
              aria-pressed={view === "accounts"}
              onClick={() => setView("accounts")}
            >
              按账户查看
            </button>
            <button
              type="button"
              aria-pressed={view === "priority"}
              onClick={() => setView("priority")}
            >
              调整优先级
            </button>
          </div>
          <div className="pm-rule-type-legend" aria-label="规则类型颜色">
            <span data-rule-type="counterparty">交易对方</span>
            <span data-rule-type="payment">收/付款方式</span>
            <span data-rule-type="content">交易内容</span>
          </div>
        </div>
        <p className="pm-rule-order-note">
          优先级数字越小越先匹配；同一平台中，资金账户和分类账户各自采用第一条命中规则。
          {view === "priority"
            ? "拖动规则或使用上下按钮，调整顺序后自动保存。"
            : "每条规则可单独删除；切换“调整优先级”可跨账户拖动排序。"}
        </p>
        {view === "priority" ? (
          <div
            className="pm-rule-priority-list"
            role="list"
            aria-label="账户关联规则优先级"
          >
            {visibleRules.map((item) => (
              <div role="listitem" key={savedRuleId(item)}>
                {renderRule(item, true)}
              </div>
            ))}
            {!visibleRules.length && (
              <p className="pm-muted">没有匹配的已保存关联。</p>
            )}
          </div>
        ) : (
          <div className="pm-saved-mappings" aria-label="已保存账户关联">
            <div
              className="pm-account-category-tags"
              role="group"
              aria-label="账户类别筛选（可多选）"
            >
              <button
                type="button"
                aria-pressed={!selectedAccountRoots.length}
                onClick={() => setSelectedAccountRoots([])}
              >
                全部<span>{savedGroups.length}</span>
              </button>
              {accountCategories.map(({ root, label, color, count }) => (
                <button
                  key={root}
                  type="button"
                  data-account-root={root}
                  style={{ "--pm-account-color": color } as React.CSSProperties}
                  aria-pressed={selectedAccountRoots.includes(root)}
                  disabled={!count}
                  onClick={() =>
                    setSelectedAccountRoots((current) =>
                      current.includes(root)
                        ? current.filter((value) => value !== root)
                        : [...current, root],
                    )
                  }
                >
                  <span className="pm-category-tag-check" aria-hidden="true">
                    {selectedAccountRoots.includes(root) ? "✓" : ""}
                  </span>
                  {label}
                  <span>{count}</span>
                </button>
              ))}
              <small>可多选</small>
            </div>
            {providerGroups.map(([provider, groups]) => {
              const count = groups.reduce(
                (total, group) => total + ruleCount(group),
                0,
              );
              return (
                <section
                  className="pm-saved-provider"
                  key={provider}
                  aria-label={`${providerName(provider)}账户关联`}
                >
                  <header className="pm-saved-provider-heading">
                    <strong>{providerName(provider)}</strong>
                    <span>
                      {groups.length} 个目标账户 · {count} 条关联
                    </span>
                  </header>
                  <div className="pm-saved-groups">
                    {groups.map((group) => (
                      <article
                        className="pm-saved-group"
                        key={JSON.stringify([group.provider, group.account])}
                        aria-label={`${group.account}的账户关联`}
                        data-account-root={group.account.split(":")[0]}
                        style={
                          {
                            "--pm-account-color":
                              accountRoots[group.account.split(":")[0]]
                                ?.color ?? "#64748b",
                          } as React.CSSProperties
                        }
                      >
                        <header className="pm-saved-group-heading">
                          <div>
                            <small className="pm-saved-account-kind">
                              {accountRoots[group.account.split(":")[0]]
                                ?.label ?? "其他"}
                              账户
                            </small>
                            <strong>{group.account}</strong>
                          </div>
                          <button
                            className="pm-danger pm-saved-delete"
                            aria-label={`删除 ${providerName(group.provider)} 到 ${group.account} 的 ${ruleCount(group)} 条关联`}
                            disabled={disabled}
                            onClick={() => void remove(group)}
                          >
                            删除关联
                          </button>
                        </header>
                        <div className="pm-saved-rule-groups">
                          {renderRuleGroups(group)}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {!visibleGroups.length && (
              <p className="pm-muted">
                {savedGroups.length
                  ? "没有匹配的已保存关联。"
                  : "暂无已保存关联。打开账单批次后，可在交易页面建立关联。"}
              </p>
            )}
          </div>
        )}
        {busy && (
          <p className="pm-muted" role="status">
            {busy}
          </p>
        )}
      </div>
    </details>
  );
}
