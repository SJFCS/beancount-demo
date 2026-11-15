import { presetExpressionReferences, presetExpressionText } from "./model";
import { SelectMenu } from "./select-menu";
import type { PresetExpression } from "./types";

function flatOrPresets(expression: PresetExpression | undefined): string[] {
  if (!expression) return [];
  if ("preset" in expression) return [expression.preset];
  if ("any" in expression && expression.any.every((child) => "preset" in child))
    return expression.any.map((child) =>
      "preset" in child ? child.preset : "",
    );
  return presetExpressionReferences(expression);
}

function isFlatOrExpression(expression: PresetExpression | undefined): boolean {
  return (
    expression === undefined ||
    "preset" in expression ||
    ("any" in expression && expression.any.every((child) => "preset" in child))
  );
}

function expressionFromPresets(
  presets: string[],
): PresetExpression | undefined {
  if (presets.length === 0) return undefined;
  if (presets.length === 1) return { preset: presets[0] };
  return { any: presets.map((preset) => ({ preset })) };
}

export function PresetExpressionEditor({
  value,
  presetNames,
  scopeLabel = "Preset",
  className = "is-twelve",
  disabled,
  onChange,
}: {
  value: PresetExpression | undefined;
  presetNames: string[];
  scopeLabel?: string;
  className?: string;
  disabled: boolean;
  onChange(value: PresetExpression | undefined): void;
}) {
  const references = [...new Set(flatOrPresets(value))];
  const available = presetNames.filter((name) => !references.includes(name));
  const legacyCombination = !isFlatOrExpression(value);

  function update(next: string[]) {
    onChange(expressionFromPresets(next));
  }

  return (
    <div className={`fmp-field ${className}`}>
      <label className="fmp-label">引用 Preset</label>
      <div className="fmp-preset-refs">
        <div className="fmp-preset-refs-head">
          <div>
            <strong>
              {references.length > 1
                ? `${references.length} 个 Preset · 任一命中`
                : references.length === 1
                  ? "1 个 Preset"
                  : "尚未引用 Preset"}
            </strong>
            <small>
              多个 Preset 默认用 OR 组合；需要同时满足的条件请放进同一个
              Preset。可选项仅来自 {scopeLabel}。
            </small>
          </div>
          <div className="fmp-preset-add-select">
            <SelectMenu
              ariaLabel="添加 Preset 引用"
              value=""
              disabled={disabled || available.length === 0}
              placeholder={
                presetNames.length === 0
                  ? `请先创建 ${scopeLabel}`
                  : available.length === 0
                    ? `全部 ${scopeLabel} 已引用`
                    : "＋ 添加 Preset…"
              }
              options={available.map((name) => ({
                value: name,
                label: name,
              }))}
              onChange={(name) => {
                if (name) update([...references, name]);
              }}
            />
          </div>
        </div>

        {references.length ? (
          <>
            <div className="fmp-preset-refs-formula">
              {value && value !== undefined
                ? presetExpressionText(value)
                : references.join(" 或 ")}
            </div>
            <div className="fmp-preset-refs-list">
              {references.map((name) => (
                <div className="fmp-preset-ref" key={name}>
                  <span className="fmp-preset-ref-kind">Preset</span>
                  <strong>{name}</strong>
                  <button
                    type="button"
                    className="fmp-preset-ref-remove"
                    aria-label={`移除 Preset ${name}`}
                    disabled={disabled}
                    onClick={() =>
                      update(references.filter((item) => item !== name))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="fmp-preset-expr-empty">
            未引用 Preset；需要只按时间匹配时，请在下方设置时间范围。
          </div>
        )}

        {legacyCombination ? (
          <div className="fmp-preset-refs-legacy">
            当前规则保留了旧版嵌套组合。修改引用后会统一转换为默认 OR。
          </div>
        ) : null}
      </div>
      <div className="fmp-hint">
        Rules 只保存 Preset 引用、时间与动作；账户、收款人、摘要、标签、元数据的
        AND / OR 和排除都在 Preset 内设置。
      </div>
    </div>
  );
}
