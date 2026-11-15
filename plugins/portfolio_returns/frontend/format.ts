export const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export function formatMoney(
  value: number,
  currency: string,
  compact = false,
): string {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 2,
    }).format(value);
  } catch {
    const number = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(value);
    return `${number} ${currency}`;
  }
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(value: string): string {
  return value.length === 10 ? value : value;
}

export function formatAxisDate(value: number): string {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

export function formatSigned(
  value: number,
  formatter: (value: number) => string,
): string {
  return `${value > 0 ? "+" : ""}${formatter(value)}`;
}

export function toneForValue(value: number, scheme: "green-red" | "red-green") {
  if (Math.abs(value) < 1e-12) return "neutral";
  const positive = value > 0;
  return scheme === "red-green"
    ? positive
      ? "loss"
      : "profit"
    : positive
      ? "profit"
      : "loss";
}
