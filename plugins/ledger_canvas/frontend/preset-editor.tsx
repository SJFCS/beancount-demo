import { useState } from "react";
import { formatFilterDsl, generatedDsl, parseGeneratedDsl } from "./model";
import { StructuredFilterEditor } from "./structured-filter-editor";
import type { Filter, PresetViewMode, SelectionCatalog } from "./types";

export function PresetEditor({
  filter,
  disabled,
  catalog,
  catalogMode,
  catalogPending,
  onChange,
}: {
  filter: Filter;
  disabled: boolean;
  catalog: SelectionCatalog;
  catalogMode: PresetViewMode;
  catalogPending: boolean;
  onChange(filter: Filter): void;
}) {
  const mode = typeof filter === "string" ? "dsl" : "structured";
  const [dslDraft, setDslDraft] = useState(
    typeof filter === "string" ? formatFilterDsl(filter) : "",
  );
  const [conversionError, setConversionError] = useState("");

  function switchMode(next: "structured" | "dsl") {
    if (next === mode) return;
    setConversionError("");
    if (next === "dsl") {
      try {
        const dsl = formatFilterDsl(
          typeof filter === "string" ? filter : generatedDsl(filter),
        );
        setDslDraft(dsl);
        onChange(dsl);
      } catch (error) {
        setConversionError(
          error instanceof Error ? error.message : String(error),
        );
      }
      return;
    }
    try {
      const source = typeof filter === "string" ? filter : dslDraft;
      onChange(parseGeneratedDsl(source));
    } catch (error) {
      setConversionError(
        error instanceof Error
          ? `${error.message} 切换未执行，当前 DSL 不会被清空。`
          : String(error),
      );
    }
  }

  return (
    <>
      <div className="fmp-field is-twelve">
        <div
          className="fmp-mode-tabs"
          role="group"
          aria-label="预设条件编辑方式"
        >
          {(
            [
              ["structured", "结构化"],
              ["dsl", "高级 DSL"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              className={`fmp-mode-btn${mode === value ? " is-active" : ""}`}
              key={value}
              disabled={disabled}
              onClick={() => switchMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {conversionError ? (
          <p className="fmp-conversion-note" role="status">
            {conversionError}
          </p>
        ) : null}
        {mode === "dsl" ? (
          <>
            <div className="fmp-dsl-toolbar">
              <span>Fava Advanced Filter · 已自动格式化</span>
              <button
                type="button"
                className="fmp-btn fmp-btn-ghost"
                disabled={disabled}
                onClick={() => {
                  const formatted = formatFilterDsl(
                    typeof filter === "string" ? filter : dslDraft,
                  );
                  setDslDraft(formatted);
                  onChange(formatted);
                }}
              >
                格式化
              </button>
            </div>
            <textarea
              className="fmp-textarea"
              rows={8}
              aria-label="高级 filter DSL"
              value={dslDraft}
              disabled={disabled}
              placeholder='例如 "#recurring", "payment-provider:wechat" 或 "amount>10"'
              onChange={(event) => {
                setDslDraft(event.target.value);
                onChange(event.target.value);
                setConversionError("");
              }}
              onBlur={() => {
                const formatted = formatFilterDsl(dslDraft);
                setDslDraft(formatted);
                if (formatted !== filter) onChange(formatted);
              }}
            />
            <div className="fmp-hint">
              条件会按括号、AND 与 OR 分组自动换行缩进；切换视图不会先清空原文。
            </div>
          </>
        ) : (
          <div className="fmp-form-grid">
            <StructuredFilterEditor
              filter={typeof filter === "string" ? {} : filter}
              disabled={disabled}
              catalog={catalog}
              catalogMode={catalogMode}
              catalogPending={catalogPending}
              onChange={onChange}
            />
          </div>
        )}
      </div>
    </>
  );
}
