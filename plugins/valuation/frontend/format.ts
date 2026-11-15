export function decimal(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value: string, digits = 2): string {
  return decimal(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatMoney(value: string, currency: string): string {
  return `${formatNumber(value)} ${currency}`;
}

export function pnlClass(value: string): string {
  if (decimal(value) > 0) return "ve-pnl is-positive";
  if (decimal(value) < 0) return "ve-pnl is-negative";
  return "ve-pnl";
}

export function signedMoney(value: string, currency: string): string {
  const sign = decimal(value) > 0 ? "+" : "";
  return `${sign}${formatMoney(value, currency)}`;
}
