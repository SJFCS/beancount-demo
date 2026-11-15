import React, { useEffect, useId, useRef, useState } from "react";
import type { Row } from "../types";
import { metadataFieldName } from "../metadata";

function isOutsideDialog(event: React.MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  );
}

export function OriginalTransaction({
  row,
  title,
  onLink,
  canLink = !!onLink,
}: {
  row: Row;
  title: string;
  onLink?(): void;
  canLink?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutside = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const titleId = useId();
  useEffect(() => {
    function finishPointer(event: PointerEvent) {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start) return;
      suppressClick.current =
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4;
      if (suppressClick.current)
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 0);
    }
    function cancelPointer() {
      pointerStart.current = null;
      suppressClick.current = false;
    }
    window.addEventListener("pointerup", finishPointer);
    window.addEventListener("pointercancel", cancelPointer);
    return () => {
      window.removeEventListener("pointerup", finishPointer);
      window.removeEventListener("pointercancel", cancelPointer);
    };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const opener = triggerRef.current;
    dialogRef.current?.showModal();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [expanded]);
  function openDialog() {
    setExpanded(true);
  }
  return (
    <>
      <div className="pm-trade-content">
        <span
          className="pm-trade-title"
          title={canLink ? `${title}\n点击按交易内容关联账户` : title}
          aria-label={`${title}，按第 ${row.line} 行交易内容关联账户`}
          aria-haspopup="dialog"
          aria-disabled={!canLink}
          role="button"
          tabIndex={canLink ? 0 : -1}
          onPointerDown={(event) => {
            pointerStart.current =
              event.button === 0
                ? { x: event.clientX, y: event.clientY }
                : null;
            suppressClick.current = false;
          }}
          onPointerCancel={() => {
            pointerStart.current = null;
            suppressClick.current = false;
          }}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            if (canLink) onLink?.();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            if (canLink) onLink?.();
          }}
        >
          <span className="pm-trade-title-text">{title}</span>
          {canLink && (
            <span className="pm-trade-title-arrow" aria-hidden="true">
              ↗
            </span>
          )}
        </span>
        <button
          ref={triggerRef}
          className="pm-original-info-button"
          type="button"
          title="查看原始交易信息"
          aria-label={`${title}，查看第 ${row.line} 行原始交易信息`}
          aria-haspopup="dialog"
          onClick={openDialog}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11.5 2.5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9z" />
            <path d="M11 2.5V8h5M7 11h6M7 14h4" />
          </svg>
          <span>原始交易信息</span>
        </button>
      </div>
      {expanded && (
        <dialog
          ref={dialogRef}
          className="pm-original-dialog"
          aria-labelledby={titleId}
          onPointerDown={(event) => {
            pressedOutside.current =
              event.button === 0 && isOutsideDialog(event);
          }}
          onPointerCancel={() => {
            pressedOutside.current = false;
          }}
          onClick={(event) => {
            const dismiss = pressedOutside.current && isOutsideDialog(event);
            pressedOutside.current = false;
            if (dismiss) setExpanded(false);
          }}
          onCancel={(event) => {
            event.preventDefault();
            setExpanded(false);
          }}
          onClose={() => setExpanded(false)}
        >
          <header className="pm-original-dialog-header">
            <div>
              <h3 id={titleId}>第 {row.line} 行原始交易信息</h3>
              <p>原账单数据 · 不随审核修改</p>
            </div>
            <button
              type="button"
              aria-label="关闭原始交易信息"
              autoFocus
              onClick={() => setExpanded(false)}
            >
              ×
            </button>
          </header>
          <div className="pm-original-content">
            {row.originalFields ? (
              <>
                <p className="pm-original-caption">
                  原账单第 {row.line} 行 · 全部 {row.originalFields.length}{" "}
                  个字段
                </p>
                <dl aria-label={`第 ${row.line} 行全部原始字段`}>
                  {row.originalFields.map((field, index) => (
                    <div key={index}>
                      <dt title={field.name}>
                        {metadataFieldName(field.name) ||
                          `第 ${index + 1} 列（无列名）`}
                      </dt>
                      <dd data-empty={field.value === ""}>
                        {field.value === "" ? "（空）" : field.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="pm-original-caption">
                当前草稿未保存原始字段，请重新打开账单以读取原表数据。
              </p>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
