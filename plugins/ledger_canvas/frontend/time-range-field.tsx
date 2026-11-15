import { useState } from "react";
import { useSearchMenu } from "@plugins/shared/frontend/use-search-menu";
import { PickerIcon } from "./picker";

function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function isoRange(value: string | undefined): {
  start: string;
  end: string;
} {
  const match =
    value &&
    /^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/iu.exec(value.trim());
  if (!match) return { start: "", end: "" };
  return {
    start: match[1],
    end: addDays(match[2], -1),
  };
}

function currentRange(kind: string): { start: string; end: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  if (kind === "this-month")
    return {
      start: isoDate(new Date(year, month, 1)),
      end: isoDate(new Date(year, month + 1, 0)),
    };
  if (kind === "last-month")
    return {
      start: isoDate(new Date(year, month - 1, 1)),
      end: isoDate(new Date(year, month, 0)),
    };
  if (kind === "this-quarter") {
    const first = Math.floor(month / 3) * 3;
    return {
      start: isoDate(new Date(year, first, 1)),
      end: isoDate(new Date(year, first + 3, 0)),
    };
  }
  if (kind === "this-year")
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    };
  return {
    start: isoDate(new Date(year, month - 11, 1)),
    end: isoDate(new Date(year, month + 1, 0)),
  };
}

export function TimeRangeField({
  value,
  disabled,
  onChange,
}: {
  value: string | undefined;
  disabled: boolean;
  onChange(value: string | undefined): void;
}) {
  const menu = useSearchMenu({
    minWidth: 370,
    maxWidth: 430,
    maxHeight: 440,
  });
  const [range, setRange] = useState(() => isoRange(value));
  const [dateError, setDateError] = useState("");
  function openPicker() {
    setRange(isoRange(value));
    setDateError("");
    menu.setOpen(true);
  }
  function apply() {
    if (!range.start || !range.end) {
      setDateError("请选择开始和结束日期。");
      return;
    }
    if (range.start > range.end) {
      setDateError("开始日期不能晚于结束日期。");
      return;
    }
    onChange(`${range.start} to ${addDays(range.end, 1)}`);
    menu.setOpen(false);
  }
  return (
    <div className="fmp-time-field" ref={menu.root}>
      <div className="fmp-time-row">
        <input
          className="fmp-input"
          value={value ?? ""}
          disabled={disabled}
          placeholder="2026 或 2026-01-01 to 2026-12-31"
          aria-label="时间范围"
          onChange={(event) => onChange(event.target.value || undefined)}
        />
        <button
          type="button"
          className="fmp-icon-btn"
          disabled={disabled}
          aria-label="点击选择时间范围"
          aria-haspopup="dialog"
          aria-expanded={menu.open}
          onClick={() => {
            if (!menu.open) openPicker();
            else menu.setOpen(false);
          }}
        >
          <PickerIcon kind="calendar" />
        </button>
      </div>
      <div className="fmp-hint">
        留空或选择“全部时间”表示不限制日期；也可直接输入 Fava
        年/月/区间或点日历选择。
      </div>
      {menu.open ? (
        <div
          className="pm-search-select-menu fmp-date-menu"
          popover="manual"
          role="dialog"
          aria-label="选择时间范围"
          style={menu.position}
        >
          <div className="fmp-date-head">
            <strong>选择时间范围</strong>
            <span>
              快捷范围按自然月 / 季度 / 年生成，仍可在输入框继续手改。
            </span>
          </div>
          <div className="fmp-date-fields">
            <label>
              开始日期
              <input
                data-menu-initial-focus
                type="date"
                value={range.start}
                disabled={disabled}
                onChange={(event) => {
                  setRange({ ...range, start: event.target.value });
                  setDateError("");
                }}
              />
            </label>
            <label>
              结束日期（含）
              <input
                type="date"
                value={range.end}
                disabled={disabled}
                onChange={(event) => {
                  setRange({ ...range, end: event.target.value });
                  setDateError("");
                }}
              />
            </label>
          </div>
          <div className="fmp-date-quick">
            {[
              ["this-month", "本月"],
              ["last-month", "上月"],
              ["this-quarter", "本季度"],
              ["this-year", "今年"],
              ["last-12-months", "最近 12 个月"],
            ].map(([kind, label]) => (
              <button
                type="button"
                key={kind}
                onClick={() => {
                  setRange(currentRange(kind));
                  setDateError("");
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className={value === undefined ? "is-selected" : ""}
              aria-pressed={value === undefined}
              onClick={() => {
                onChange(undefined);
                setDateError("");
                menu.setOpen(false);
              }}
            >
              全部时间
            </button>
          </div>
          <div className="fmp-date-footer">
            <span>{dateError || "保存为 Fava 的 [开始, 结束) 区间。"}</span>
            <button type="button" onClick={() => menu.setOpen(false)}>
              取消
            </button>
            <button type="button" className="is-primary" onClick={apply}>
              应用
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
