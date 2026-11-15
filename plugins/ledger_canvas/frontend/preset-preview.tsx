import { PickerIcon } from "./picker";
import type { PresetPreview, PresetViewMode } from "./types";

export function PresetPreviewPanel({
  name,
  preview,
  mode,
}: {
  name: string;
  preview: PresetPreview | undefined;
  mode: PresetViewMode;
}) {
  return (
    <details className="fmp-preset-preview">
      <summary>
        <PickerIcon kind="filter" />
        <span>
          匹配到的{mode === "raw" ? "原始" : "模拟映射后"}交易{" "}
          <strong>{preview?.matched ?? 0} 笔</strong>
        </span>
      </summary>
      <div className="fmp-preview-list">
        {preview?.transactions.length ? (
          preview.transactions.map((transaction) => (
            <div
              className="fmp-preview-row"
              key={`${name}-${transaction.directiveIndex}`}
            >
              <time>{transaction.date}</time>
              <div>
                <strong>{transaction.payee || "（无 payee）"}</strong>
                <span>{transaction.narration || "（无摘要）"}</span>
              </div>
              <small
                title={[
                  transaction.tags.length
                    ? transaction.tags.map((tag) => `#${tag}`).join(" ")
                    : "",
                  transaction.accounts.join("\n"),
                ]
                  .filter(Boolean)
                  .join("\n")}
              >
                {[
                  transaction.tags.map((tag) => `#${tag}`).join(" "),
                  transaction.accounts.join(" · "),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
              {Object.keys(transaction.meta).length ? (
                <div className="fmp-preview-meta-inline">
                  {Object.entries(transaction.meta)
                    .sort(([left], [right]) => left.localeCompare(right))
                    .map(([key, value]) => (
                      <span key={key}>
                        <b>{key}</b>={value || "（空）"}
                      </span>
                    ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="fmp-preview-empty">
            {preview
              ? "当前预设没有命中交易。"
              : "完成并保存预设条件后显示匹配交易。"}
          </div>
        )}
      </div>
    </details>
  );
}
