import type { DateRangePreset } from "./types";

function dateFromIso(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function addMonths(value: string, months: number): string {
  const date = dateFromIso(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

export function resolveRange(
  preset: DateRangePreset,
  firstDate: string,
  lastDate: string,
): { startDate: string; endDate: string } {
  let startDate = firstDate;
  if (preset === "YTD") startDate = `${lastDate.slice(0, 4)}-01-01`;
  else {
    const months: Record<string, number> = {
      "3M": 3,
      "6M": 6,
      "1Y": 12,
      "2Y": 24,
      "3Y": 36,
      "5Y": 60,
      "10Y": 120,
    };
    if (preset !== "MAX") startDate = addMonths(lastDate, -months[preset]);
  }
  return {
    startDate: startDate < firstDate ? firstDate : startDate,
    endDate: lastDate,
  };
}
