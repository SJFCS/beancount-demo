import type {
  PeriodicFrequency,
  PeriodicGenerationMode,
  PeriodicKind,
  ScheduleRow,
} from "./types";

export const KIND_LABELS: Record<PeriodicKind, string> = {
  amortization: "摊销",
  depreciation: "折旧",
};

export const FREQUENCY_LABELS: Record<PeriodicFrequency, string> = {
  daily: "每日",
  weekly: "每周",
  monthly: "每月",
  quarterly: "每季度",
  yearly: "每年",
};

export const GENERATION_MODE_OPTIONS: Array<{
  value: PeriodicGenerationMode;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "全部生成",
    description: "生成全部期间，未来分录也使用正常 flag。",
  },
  {
    value: "through_today",
    label: "截止今天",
    description: "默认策略，只生成日期不晚于今天的分期。",
  },
  {
    value: "pending",
    label: "未来未入账",
    description:
      "生成全部期间；今天之后的分录标记为 !（未入账/待确认），今天及以前正常入账。",
  },
];

export function generationModeOption(mode: PeriodicGenerationMode) {
  return (
    GENERATION_MODE_OPTIONS.find((option) => option.value === mode) ??
    GENERATION_MODE_OPTIONS[1]
  );
}

export function frequencyLabel(
  frequency: PeriodicFrequency,
  stepCount: number,
): string {
  const label = FREQUENCY_LABELS[frequency];
  return stepCount > 1 ? `${label} × ${stepCount}` : label;
}

export function todayLocal(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function formatNumber(value: string | number, precision = 2): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(amount);
}

export function formatMoney(value: string | number, currency: string): string {
  return `${formatNumber(value)} ${currency}`;
}

export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(0)}k`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function isFuture(date: string): boolean {
  return date > todayLocal();
}

export function rowsForCurrency(
  rows: ScheduleRow[],
  currency: string,
): ScheduleRow[] {
  return rows.filter((row) => row.currency === currency);
}
