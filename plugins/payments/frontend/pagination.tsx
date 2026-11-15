import React, { useEffect, useState } from "react";
import type { PaymentsController } from "./use-payments";

export function Pagination({
  controller: c,
}: {
  controller: PaymentsController;
}) {
  const { safePage, pageCount, setPage, pageSize, changePageSize } = c;
  const [draft, setDraft] = useState(String(pageSize ?? 50));
  useEffect(() => {
    if (pageSize !== null) setDraft(String(pageSize));
  }, [pageSize]);
  function apply() {
    if (pageSize === null) return;
    const value = Number(draft);
    if (Number.isSafeInteger(value) && value > 0) {
      changePageSize(value);
      setDraft(String(value));
    } else {
      setDraft(String(pageSize));
    }
  }
  return (
    <div className="pm-pagination">
      <span className="pm-pagination-caption">
        {pageSize === null ? (
          <span>全部展示 {c.pageGroups.length} 项</span>
        ) : (
          <span className="pm-page-position">
            {safePage + 1} / {pageCount} 页
          </span>
        )}
        <span aria-hidden="true">·</span> 退款分组计为一项
      </span>
      <div className="pm-pagination-controls">
        {pageSize !== null && (
          <>
            <button
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <span aria-hidden="true">←</span> 上一页
            </button>
            <button
              disabled={safePage + 1 >= pageCount}
              onClick={() => setPage(safePage + 1)}
            >
              下一页 <span aria-hidden="true">→</span>
            </button>
            <label>
              每页
              <input
                className="pm-page-size"
                type="number"
                min={1}
                step={1}
                aria-label="每页展示数量"
                title="输入正整数，按回车或离开输入框生效"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={apply}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    apply();
                  }
                }}
              />
              项
            </label>
          </>
        )}
        <button
          onClick={() =>
            changePageSize(pageSize === null ? Number(draft) : null)
          }
        >
          {pageSize === null ? "启用分页" : "显示全部"}
        </button>
      </div>
    </div>
  );
}
