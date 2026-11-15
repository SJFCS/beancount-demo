import type { PresetDataView, Rule } from "./types";

export function PresetDataViewControl({
  view,
  rules,
  disabled,
  onChange,
}: {
  view: PresetDataView;
  rules: Rule[];
  disabled: boolean;
  onChange(patch: Partial<PresetDataView>): void;
}) {
  const disabledRuleIds = new Set(view.disabledRuleIds);
  const enabledCount = rules.filter(
    (rule) => !disabledRuleIds.has(rule.id),
  ).length;

  function setRuleEnabled(ruleId: string, enabled: boolean) {
    const next = new Set(view.disabledRuleIds);
    if (enabled) next.delete(ruleId);
    else next.add(ruleId);
    onChange({ disabledRuleIds: [...next] });
  }

  return (
    <section className="fmp-preset-data-view" aria-label="Preset 数据视图">
      <div className="fmp-preset-data-view-head">
        <div>
          <strong>数据视图</strong>
          <small>
            仅影响 Preset 的选择器和匹配预览，不改变 Rules 的实际启用状态。
          </small>
        </div>
        <div
          className="fmp-preset-data-view-mode"
          role="group"
          aria-label="Preset 数据来源"
        >
          {(
            [
              ["raw", "原始数据"],
              ["mapped", "映射后"],
            ] as const
          ).map(([mode, label]) => (
            <button
              type="button"
              key={mode}
              className={view.mode === mode ? "is-active" : ""}
              aria-pressed={view.mode === mode}
              disabled={disabled}
              onClick={() => onChange({ mode })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view.mode === "mapped" ? (
        <div className="fmp-preset-rule-view">
          <div className="fmp-preset-rule-view-head">
            <span>
              模拟映射状态 <b>{enabledCount}</b> / {rules.length} 条规则
            </span>
            <div>
              <button
                type="button"
                disabled={disabled || enabledCount === rules.length}
                onClick={() => onChange({ disabledRuleIds: [] })}
              >
                全部启用
              </button>
              <button
                type="button"
                disabled={disabled || enabledCount === 0}
                onClick={() =>
                  onChange({ disabledRuleIds: rules.map((rule) => rule.id) })
                }
              >
                全部停用
              </button>
            </div>
          </div>
          {rules.length ? (
            <div className="fmp-preset-rule-view-list">
              {rules.map((rule, index) => {
                const applied = !disabledRuleIds.has(rule.id);
                return (
                  <label
                    key={rule.id}
                    className={`fmp-preset-rule-view-item${applied ? " is-applied" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={applied}
                      disabled={disabled}
                      onChange={(event) =>
                        setRuleEnabled(rule.id, event.target.checked)
                      }
                    />
                    <span className="fmp-preset-rule-view-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{rule.name?.trim() || rule.id}</strong>
                      <small>
                        {applied ? "应用到此视图" : "此视图跳过"}
                        {rule.enabled ? "" : " · 实际规则已停用"}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="fmp-preset-rule-view-empty">
              还没有 Mapping Rules，映射后视图与原始数据相同。
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
