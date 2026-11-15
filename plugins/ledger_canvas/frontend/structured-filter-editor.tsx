import { useMemo, type ReactNode } from "react";
import { AccountBrowserSelect } from "@plugins/shared/frontend/account-browser-select";
import {
  activeFilterConditions,
  conditionFormula,
  matcherCatalogMatches,
  matcherKindLabel,
  matcherPatterns,
  matcherStatement,
  matcherValue,
  metaPairMatchesValue,
  metaPairStatement,
  metaPairsForFilter,
  pairLogicStatement,
  pairValueText,
  selectedExactValues,
  setSelectedExactValues,
  tagPairsForFilter,
  tagPairMatchesValue,
  tagPairStatement,
  valuePattern,
} from "./model";
import {
  FacetedPicker,
  KeyValueRows,
  MatcherField,
  PickerIcon,
  MatcherReadout,
  MatcherTextarea,
  type PickerGroup,
} from "./picker";
import type {
  ConditionLogic,
  MetaPair,
  PresetViewMode,
  SelectionCatalog,
  StructuredFilter,
  TagPair,
} from "./types";

const ACCOUNT_ROOTS = [
  { value: "Assets", label: "Assets", color: "#3b82f6" },
  { value: "Liabilities", label: "Liabilities", color: "#f59e0b" },
  { value: "Equity", label: "Equity", color: "#a855f7" },
  { value: "Income", label: "Income", color: "#16a34a" },
  { value: "Expenses", label: "Expenses", color: "#ef4444" },
] as const;
const metadataAllValueId = (key: string) => `${key}\u0000*`;

function ConditionField({
  title,
  configured,
  state,
  className,
  disabled,
  isFirst,
  logic,
  onLogicChange,
  children,
}: {
  title: string;
  configured: boolean;
  state: string;
  className: string;
  disabled: boolean;
  isFirst: boolean;
  logic: ConditionLogic | undefined;
  onLogicChange(logic: ConditionLogic): void;
  children: ReactNode;
}) {
  const excluded = logic?.exclude === true;
  return (
    <div className={className}>
      <details
        className={`fmp-condition${configured ? " is-configured" : ""}${excluded ? " is-excluded" : ""}`}
      >
        <summary>
          <span className="fmp-condition-title">{title}</span>
          {configured ? (
            <span className="fmp-condition-logic-label">
              {isFirst ? "起始" : logic?.join === "or" ? "OR" : "AND"}
              {excluded ? " · 排除" : ""}
            </span>
          ) : null}
          <span className={`fmp-condition-state${configured ? " is-set" : ""}`}>
            {state}
          </span>
        </summary>
        <div className="fmp-condition-body">
          <div className="fmp-condition-logic-row">
            <span>与上一条件</span>
            <div
              className="fmp-condition-join"
              role="group"
              aria-label="与上一条件的关系"
            >
              <button
                type="button"
                className={!isFirst && logic?.join !== "or" ? "is-active" : ""}
                aria-pressed={!isFirst && logic?.join !== "or"}
                disabled={isFirst || disabled}
                onClick={() => onLogicChange({ ...logic, join: "and" })}
              >
                AND
              </button>
              <button
                type="button"
                className={!isFirst && logic?.join === "or" ? "is-active" : ""}
                aria-pressed={!isFirst && logic?.join === "or"}
                disabled={isFirst || disabled}
                onClick={() => onLogicChange({ ...logic, join: "or" })}
              >
                OR
              </button>
            </div>
            <span className="fmp-condition-logic-spacer">
              {isFirst ? "首条条件" : "按卡片顺序计算"}
            </span>
            <button
              type="button"
              className={`fmp-condition-exclude${excluded ? " is-active" : ""}`}
              aria-pressed={excluded}
              disabled={disabled}
              onClick={() => onLogicChange({ ...logic, exclude: !excluded })}
            >
              {excluded ? "已排除" : "排除此条件"}
            </button>
          </div>
          {children}
        </div>
      </details>
    </div>
  );
}

export function StructuredFilterEditor({
  filter,
  disabled,
  catalog,
  catalogMode,
  catalogPending,
  onChange,
}: {
  filter: StructuredFilter;
  disabled: boolean;
  catalog: SelectionCatalog;
  catalogMode: PresetViewMode;
  catalogPending: boolean;
  onChange(filter: StructuredFilter): void;
}) {
  const update = (patch: Partial<StructuredFilter>) =>
    onChange({ ...filter, ...patch });
  const updateLogic = (
    key: keyof NonNullable<StructuredFilter["conditionLogic"]>,
    logic: ConditionLogic,
  ) =>
    onChange({
      ...filter,
      conditionLogic: { ...filter.conditionLogic, [key]: logic },
    });
  const removeEmpty = (key: keyof StructuredFilter) => {
    const next = { ...filter };
    delete next[key];
    onChange(next);
  };
  const accountRoots = useMemo(() => {
    const present = new Set(
      catalog.accounts.map((item) => item.value.split(":")[0]),
    );
    const extra = [...present]
      .filter((root) => !ACCOUNT_ROOTS.some((item) => item.value === root))
      .sort()
      .map((root) => ({ value: root, label: root, color: "#64748b" }));
    return [...ACCOUNT_ROOTS, ...extra];
  }, [catalog.accounts]);
  const selectedAccounts = selectedExactValues(
    filter.account,
    catalog.accounts,
  );
  const accountPreview = matcherCatalogMatches(
    filter.account,
    catalog.accounts,
  );
  const tagPairs = tagPairsForFilter(filter);
  const hasKeyedTags = tagPairs.some((pair) => pair.key.trim() !== "*");
  const metaPairs = metaPairsForFilter(filter);
  const activeConditions = activeFilterConditions(filter);
  const firstCondition = activeConditions[0];
  const anyCatalog = useMemo(() => {
    const values = new Map<string, number>();
    for (const item of [
      ...catalog.accounts,
      ...catalog.payees,
      ...catalog.narrations,
      ...catalog.tags,
      ...catalog.metadata.flatMap((group) => group.values),
    ])
      values.set(item.value, Math.max(values.get(item.value) ?? 0, item.count));
    return [...values.entries()].map(([value, count]) => ({ value, count }));
  }, [catalog]);
  const anyPreview = matcherCatalogMatches(filter.any, anyCatalog);
  const metadataGroups: PickerGroup[] = catalog.metadata.map((item) => ({
    id: item.key,
    label: item.key,
    icon: "meta",
    options: item.values.map((entry) => ({
      id: `${item.key}\u0000${entry.value}`,
      label: entry.value,
      count: entry.count,
    })),
    allOption: {
      id: metadataAllValueId(item.key),
      label: "全部值",
      count: item.count,
    },
  }));
  const selectedMeta = new Set<string>();
  for (const group of catalog.metadata) {
    if (
      metaPairs.some(
        (pair) =>
          pair.key.trim() === group.key &&
          pairValueText(pair.value).trim() === "*",
      )
    ) {
      selectedMeta.add(metadataAllValueId(group.key));
      continue;
    }
    for (const item of group.values) {
      if (
        metaPairs.some((pair) =>
          metaPairMatchesValue(pair, group.key, item.value),
        )
      )
        selectedMeta.add(`${group.key}\u0000${item.value}`);
    }
  }
  const tagGroups: PickerGroup[] = [
    {
      id: "tags",
      label: "已有标签",
      icon: "tag",
      options: catalog.tags.map((item) => ({
        id: item.value,
        label: `#${item.value}`,
        count: item.count,
      })),
    },
  ];
  const tagMatches = catalog.tags.filter((item) =>
    tagPairs.some((pair) => tagPairMatchesValue(pair, item.value)),
  );
  const selectedTags = new Set(tagMatches.map((item) => item.value));
  const metaMatches = catalog.metadata.flatMap((group) =>
    group.values
      .filter((item) =>
        metaPairs.some((pair) =>
          metaPairMatchesValue(pair, group.key, item.value),
        ),
      )
      .map((item) => ({
        value: `${group.key} = ${item.value}`,
        count: item.count,
      })),
  );
  const metadataEntries = catalog.metadata.flatMap((group) =>
    group.values.map((item) => ({ key: group.key, value: item.value })),
  );
  const tagPairsForSelection = (selected: Set<string>): TagPair[] => {
    const next: TagPair[] = [];
    for (const pair of tagPairs) {
      if (!pair.key.trim() || !pair.value.trim()) continue;
      const matched = catalog.tags.filter((item) =>
        tagPairMatchesValue(pair, item.value),
      );
      if (matched.length === 0) {
        next.push(pair);
        continue;
      }
      let first = true;
      for (const item of matched) {
        if (!selected.has(item.value)) continue;
        next.push({
          key: "*",
          value: valuePattern(item.value),
          ...(first && pair.join ? { join: pair.join } : {}),
          ...(!first ? { join: pair.exclude ? "and" : "or" } : {}),
          ...(pair.exclude ? { exclude: true } : {}),
        });
        first = false;
      }
    }
    for (const tag of selected) {
      if (!next.some((pair) => tagPairMatchesValue(pair, tag)))
        next.push({ key: "*", value: valuePattern(tag) });
    }
    return next;
  };
  const metaPairsForSelection = (selected: Set<string>): MetaPair[] => {
    const next: MetaPair[] = [];
    for (const pair of metaPairs) {
      if (!pair.key.trim() || !pairValueText(pair.value).trim()) continue;
      if (
        pairValueText(pair.value).trim() === "*" &&
        selected.has(metadataAllValueId(pair.key.trim()))
      ) {
        next.push(pair);
        continue;
      }
      const matched = metadataEntries.filter((item) =>
        metaPairMatchesValue(pair, item.key, item.value),
      );
      if (matched.length === 0) {
        next.push(pair);
        continue;
      }
      let first = true;
      for (const item of matched) {
        if (!selected.has(`${item.key}\u0000${item.value}`)) continue;
        next.push({
          key: item.key,
          value: valuePattern(item.value),
          ...(first && pair.join ? { join: pair.join } : {}),
          ...(!first ? { join: pair.exclude ? "and" : "or" } : {}),
          ...(pair.exclude ? { exclude: true } : {}),
        });
        first = false;
      }
    }
    for (const id of selected) {
      const separator = id.indexOf("\u0000");
      const key = id.slice(0, separator);
      const value = id.slice(separator + 1);
      if (!next.some((pair) => metaPairMatchesValue(pair, key, value)))
        next.push({ key, value: value === "*" ? "*" : valuePattern(value) });
    }
    return next;
  };
  const accountConditionCount = matcherPatterns(filter.account).length;
  const payeeConditionCount = matcherPatterns(filter.payee).length;
  const narrationConditionCount = matcherPatterns(filter.narration).length;
  const anyConditionCount = matcherPatterns(filter.any).length;

  return (
    <>
      <div className="fmp-field is-twelve fmp-condition-formula">
        <div className="fmp-combine-copy">
          <span className="fmp-label">Preset 匹配表达式</span>
          <strong>
            {activeConditions.length
              ? conditionFormula(filter)
              : "尚未设置匹配条件"}
          </strong>
          <small>
            每个条件卡片单独选择 AND / OR 和是否排除，按卡片从上到下计算；
            标签与元数据的每一行也分别支持。
          </small>
        </div>
        <div
          className={`fmp-catalog-source is-${catalogMode}${catalogPending ? " is-pending" : ""}`}
          role="status"
        >
          <span className="fmp-catalog-source-dot" aria-hidden="true" />
          <strong>
            {catalogMode === "mapped" ? "映射后数据" : "原始数据"}
          </strong>
          <span>账户、收款人、摘要、标签、元数据选择器</span>
          <small>
            {catalogPending ? "正在刷新此数据视图的候选值…" : "均已使用此视图"}
          </small>
        </div>
      </div>
      <ConditionField
        className="fmp-field is-six"
        disabled={disabled}
        title="账户"
        configured={accountConditionCount > 0}
        state={accountConditionCount ? `${accountConditionCount} 条` : "未设置"}
        isFirst={firstCondition === "account"}
        logic={filter.conditionLogic?.account}
        onLogicChange={(logic) => updateLogic("account", logic)}
      >
        <div className="fmp-matcher-picker">
          <div className="fmp-matcher-toolbar">
            <div className="fmp-matcher-type">
              <span className="fmp-matcher-name">账户</span>
              <span
                className={`fmp-pattern-kind${
                  matcherKindLabel(filter.account) === "通配符"
                    ? " is-wildcard"
                    : ""
                }`}
              >
                {matcherKindLabel(filter.account)}
              </span>
            </div>
            {catalog.accounts.length ? (
              <div className="fmp-account-picker">
                <PickerIcon kind="account" />
                <AccountBrowserSelect
                  label="选择账户并追加精确匹配"
                  searchLabel="搜索所有账户层级"
                  value=""
                  roots={accountRoots}
                  options={catalog.accounts}
                  selectableValues={catalog.accounts.map((item) => item.value)}
                  placeholder="账户"
                  disabled={disabled}
                  onChange={(account) => {
                    if (!account) return;
                    update({
                      account: matcherValue([
                        ...matcherPatterns(filter.account),
                        valuePattern(account),
                      ]),
                    });
                  }}
                />
              </div>
            ) : (
              <span className="fmp-hint">账本中暂无可选账户</span>
            )}
          </div>
          <MatcherTextarea
            label="账户匹配表达式"
            value={filter.account}
            disabled={disabled}
            placeholder="^Expenses:Subscriptions 或 *Music*"
            onChange={(value) =>
              value ? update({ account: value }) : removeEmpty("account")
            }
          />
          <MatcherReadout
            statement={matcherStatement("账户", filter.account)}
            matches={accountPreview.matches}
            error={accountPreview.error}
          />
          {selectedAccounts.size ? (
            <div className="fmp-matcher-chips">
              {[...selectedAccounts].map((account) => (
                <span className="fmp-tag" key={account}>
                  {account}
                  <button
                    type="button"
                    aria-label={`移除账户 ${account}`}
                    onClick={() => {
                      const next = new Set(selectedAccounts);
                      next.delete(account);
                      const value = setSelectedExactValues(
                        filter.account,
                        catalog.accounts,
                        next,
                      );
                      if (value) update({ account: value });
                      else removeEmpty("account");
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="fmp-hint">
            每行一个表达式，任一命中即可。含 * 或 ? 时自动按通配符，可用 regex:
            / wildcard: 强制匹配方式。
          </div>
        </div>
      </ConditionField>
      <ConditionField
        className="fmp-field is-six"
        disabled={disabled}
        title="收款人"
        configured={payeeConditionCount > 0}
        state={payeeConditionCount ? `${payeeConditionCount} 条` : "未设置"}
        isFirst={firstCondition === "payee"}
        logic={filter.conditionLogic?.payee}
        onLogicChange={(logic) => updateLogic("payee", logic)}
      >
        <MatcherField
          label="收款人"
          placeholder="精确限制 payee"
          hint="从已观察到的 payee 选择；选择器追加精确匹配，手写表达式会保留。"
          value={filter.payee}
          disabled={disabled}
          onChange={(value) =>
            value ? update({ payee: value }) : removeEmpty("payee")
          }
          pickerLabel="收款人"
          pickerTitle="从账本选择收款人"
          groups={[
            {
              id: "payees",
              label: "收款人",
              icon: "user",
              options: catalog.payees.map((item) => ({
                id: item.value,
                label: item.value,
                count: item.count,
              })),
            },
          ]}
          catalog={catalog.payees}
        />
      </ConditionField>
      <ConditionField
        className="fmp-field is-six"
        disabled={disabled}
        title="摘要"
        configured={narrationConditionCount > 0}
        state={
          narrationConditionCount ? `${narrationConditionCount} 条` : "未设置"
        }
        isFirst={firstCondition === "narration"}
        logic={filter.conditionLogic?.narration}
        onLogicChange={(logic) => updateLogic("narration", logic)}
      >
        <MatcherField
          label="摘要"
          placeholder="narration 关键字"
          hint="从已进入账本的交易摘要中选择，或填写正则 / 通配符。"
          value={filter.narration}
          disabled={disabled}
          onChange={(value) =>
            value ? update({ narration: value }) : removeEmpty("narration")
          }
          pickerLabel="摘要"
          pickerTitle="从账本选择摘要"
          groups={[
            {
              id: "narrations",
              label: "摘要",
              icon: "text",
              options: catalog.narrations.map((item) => ({
                id: item.value,
                label: item.value,
                count: item.count,
              })),
            },
          ]}
          catalog={catalog.narrations}
        />
      </ConditionField>
      <ConditionField
        className="fmp-field is-twelve"
        disabled={disabled}
        title="标签条件"
        configured={tagPairs.length > 0}
        state={tagPairs.length ? `${tagPairs.length} 条` : "未设置"}
        isFirst={firstCondition === "tags"}
        logic={filter.conditionLogic?.tags}
        onLogicChange={(logic) => updateLogic("tags", logic)}
      >
        <div className="fmp-matcher-toolbar">
          <div className="fmp-matcher-type">
            <span className="fmp-matcher-name">标签条件</span>
            <span className="fmp-pattern-kind">标签表达式</span>
          </div>
          <div className="fmp-matcher-actions">
            <FacetedPicker
              label="标签"
              title="从账本选择已有标签"
              groups={tagGroups}
              selected={selectedTags}
              disabled={disabled}
              onToggle={(tag, checked) => {
                const selected = new Set(selectedTags);
                if (checked) selected.add(tag);
                else selected.delete(tag);
                const next = tagPairsForSelection(selected);
                onChange({
                  ...filter,
                  tags: undefined,
                  tagPairs: next.length ? next : undefined,
                });
              }}
              addSearchLabel="添加为标签正则"
              onAddSearch={(input) => {
                const value = input.trim().replace(/^#/u, "");
                if (!value) return;
                if (
                  tagPairs.some(
                    (pair) =>
                      pair.key.trim() === "*" && pair.value.trim() === value,
                  )
                )
                  return;
                onChange({
                  ...filter,
                  tags: undefined,
                  tagPairs: [
                    ...tagPairs,
                    {
                      key: "*",
                      value,
                      ...(tagPairs.length
                        ? {
                            join:
                              filter.tagMode === "all"
                                ? ("and" as const)
                                : ("or" as const),
                          }
                        : {}),
                    },
                  ],
                });
              }}
            />
          </div>
        </div>
        {hasKeyedTags ? (
          <div className="fmp-hint">
            当前预设包含高级键值标签条件。把键改为{" "}
            <span className="fmp-code">*</span> 后会恢复普通标签表达式编辑。
          </div>
        ) : null}
        <KeyValueRows
          value={tagPairs}
          label="标签条件"
          disabled={disabled}
          keyPlaceholder="*"
          valuePlaceholder="recurring*"
          keyHint="键（* = 任意）"
          valueHint={
            hasKeyedTags
              ? "值（支持正则 / 通配符）"
              : "标签（支持正则 / 通配符）"
          }
          showKey={hasKeyedTags}
          newKey="*"
          addLabel={hasKeyedTags ? "＋ 添加键值" : "＋ 添加标签"}
          onChange={(pairs) =>
            onChange({
              ...filter,
              tags: undefined,
              tagPairs: pairs.length ? pairs : undefined,
            })
          }
        />
        <MatcherReadout
          statement={
            tagPairs.length
              ? tagPairs
                  .map((pair, index) =>
                    pairLogicStatement(
                      index,
                      pair.join ?? (filter.tagMode === "any" ? "or" : "and"),
                      pair.exclude,
                      tagPairStatement(pair),
                    ),
                  )
                  .join("；")
              : "标签条件尚未设置"
          }
          matches={tagMatches}
          error={null}
        />
        <div className="fmp-hint">
          直接填写标签或匹配表达式，例如{" "}
          <span className="fmp-code">recurring*</span>、{" "}
          <span className="fmp-code">key:value</span>。也保留了对旧版高级键值
          标签条件的兼容。
        </div>
      </ConditionField>
      <ConditionField
        className="fmp-field is-twelve"
        disabled={disabled}
        title="元数据条件"
        configured={metaPairs.length > 0}
        state={metaPairs.length ? `${metaPairs.length} 条` : "未设置"}
        isFirst={firstCondition === "meta"}
        logic={filter.conditionLogic?.meta}
        onLogicChange={(logic) => updateLogic("meta", logic)}
      >
        <div className="fmp-matcher-toolbar">
          <div className="fmp-matcher-type">
            <span className="fmp-matcher-name">元数据条件</span>
            <span className="fmp-pattern-kind">键 / 值</span>
          </div>
          <div className="fmp-matcher-actions">
            <FacetedPicker
              label="元数据"
              title="从账本选择元数据键值"
              groups={metadataGroups}
              selected={selectedMeta}
              disabled={disabled}
              onToggle={(id, checked) => {
                const selected = new Set(selectedMeta);
                if (checked) selected.add(id);
                else selected.delete(id);
                const next = metaPairsForSelection(selected);
                onChange({
                  ...filter,
                  meta: undefined,
                  metaPairs: next.length ? next : undefined,
                });
              }}
            />
          </div>
        </div>
        <KeyValueRows
          value={metaPairs.map((pair) => ({
            key: pair.key,
            value: pairValueText(pair.value),
            join: pair.join,
            exclude: pair.exclude,
          }))}
          label="元数据条件"
          disabled={disabled}
          keyPlaceholder="payment-provider"
          valuePlaceholder="wechat"
          keyHint="键（* = 任意）"
          valueHint="值（支持正则 / 通配符）"
          onChange={(pairs) =>
            onChange({
              ...filter,
              meta: undefined,
              metaPairs: pairs.length
                ? pairs.map((pair) => ({
                    key: pair.key,
                    value: pair.value,
                    ...(pair.join === undefined ? {} : { join: pair.join }),
                    ...(pair.exclude === undefined
                      ? {}
                      : { exclude: pair.exclude }),
                  }))
                : undefined,
            })
          }
        />
        <MatcherReadout
          statement={
            metaPairs.length
              ? metaPairs
                  .map((pair, index) =>
                    pairLogicStatement(
                      index,
                      pair.join ?? (filter.metaMode === "any" ? "or" : "and"),
                      pair.exclude,
                      metaPairStatement(pair),
                    ),
                  )
                  .join("；")
              : "元数据条件尚未设置"
          }
          matches={metaMatches}
          error={null}
        />
        <div className="fmp-hint">
          键填 <span className="fmp-code">*</span>{" "}
          表示任意用户元数据键；选择“全部值”等同值填{" "}
          <span className="fmp-code">*</span>，会匹配该键的任意值。
        </div>
      </ConditionField>
      <ConditionField
        className="fmp-field is-twelve"
        disabled={disabled}
        title="任意文本"
        configured={anyConditionCount > 0}
        state={anyConditionCount ? `${anyConditionCount} 条` : "未设置"}
        isFirst={firstCondition === "any"}
        logic={filter.conditionLogic?.any}
        onLogicChange={(logic) => updateLogic("any", logic)}
      >
        <div className="fmp-matcher-picker">
          <div className="fmp-matcher-toolbar">
            <div className="fmp-matcher-type">
              <span className="fmp-matcher-name">任意文本</span>
              <span
                className={`fmp-pattern-kind${
                  matcherKindLabel(filter.any) === "通配符"
                    ? " is-wildcard"
                    : ""
                }`}
              >
                {matcherKindLabel(filter.any)}
              </span>
            </div>
          </div>
          <MatcherTextarea
            label="任意文本"
            value={filter.any}
            disabled={disabled}
            placeholder="payee / 摘要 / 标签 / 元数据"
            onChange={(value) =>
              value ? update({ any: value }) : removeEmpty("any")
            }
          />
          <MatcherReadout
            statement={matcherStatement("任意文本", filter.any)}
            matches={anyPreview.matches}
            error={anyPreview.error}
          />
          <div className="fmp-hint">
            任意文本是最后执行的兜底条件，也支持正则与通配符；每行一个表达式。
          </div>
        </div>
      </ConditionField>
    </>
  );
}
