const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;
const ISO_DATE_RANGE = /^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/iu;

function utcDay(value: string): number | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return Math.floor(timestamp / 86_400_000);
}

function dayCountText(days: number): string {
  return `${new Intl.NumberFormat("zh-CN").format(days)} 天`;
}

export function dateRangeWithDays(firstDate: string, lastDate: string): string {
  const range =
    firstDate === lastDate ? firstDate : `${firstDate} → ${lastDate}`;
  const firstDay = utcDay(firstDate);
  const lastDay = utcDay(lastDate);
  if (firstDay === null || lastDay === null || lastDay < firstDay) return range;
  return `${range} · 共 ${dayCountText(lastDay - firstDay + 1)}`;
}

export function timeRangeWithDays(value: string | undefined): string {
  const range = value?.trim();
  if (!range) return "未设置";
  const match = ISO_DATE_RANGE.exec(range);
  if (!match) return range;
  const firstDay = utcDay(match[1]);
  const lastDay = utcDay(match[2]);
  if (firstDay === null || lastDay === null || lastDay <= firstDay)
    return range;
  return `${range} · 共 ${dayCountText(lastDay - firstDay)}`;
}
