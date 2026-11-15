export const LIFE_CALENDAR_CONFIG_FILE = "plugins/life_calendar/config.json";

export type LifeCalendarCustomType = {
  id: string;
  label: string;
  startMonth: string;
  endMonth: string;
  display: "fill" | "underline";
  color: string;
};

export type LifeCalendarConfig = {
  version: 1;
  birthday: string;
  lifeExpectancy: number;
  retirementAge: number;
  sleepHours: number;
  workHours: number;
  showNominalAge: boolean;
  customTypes: LifeCalendarCustomType[];
};

export type CalendarCellState = "past" | "current" | "future" | "retirement";

export type CalendarFillSegment = {
  id: string;
  label: string;
  color: string;
  startMonth: number;
  endMonth: number;
};

export type CalendarCell = {
  index: number;
  ordinal: number;
  year: number;
  ageStart: number;
  ageEnd: number;
  state: CalendarCellState;
  isCurrent: boolean;
  displayAge: number;
  customTypes: Array<
    Pick<LifeCalendarCustomType, "id" | "label" | "color" | "display">
  >;
  fillSegments: CalendarFillSegment[];
};

export type LifeCalendarPlan = {
  ok: true;
  birthday: Date;
  showNominalAge: boolean;
  lifeExpectancy: number;
  deathDate: Date;
  currentYear: number;
  currentOrdinal: number;
  currentAge: number;
  currentAgeExact: number;
  retirementYear: number;
  deathYear: number;
  livedYears: number;
  livedYearsExact: number;
  remainingYears: number;
  remainingYearsExact: number;
  sleepYears: number;
  workYears: number;
  freeYears: number;
  freeYearsBeforeRetirement: number;
  freeYearsAfterRetirement: number;
  sleepHours: number;
  workHours: number;
  progressPercent: number;
  customTypes: LifeCalendarCustomType[];
  cells: CalendarCell[];
};

export type LifeCalendarError = {
  ok: false;
  error: string;
};

export type LifeCalendarResult = LifeCalendarPlan | LifeCalendarError;

export type CalendarMonthDay = {
  day: number;
  date: string;
  isToday: boolean;
  isPast: boolean;
  weekday: number;
};

export type CalendarMonth = {
  year: number;
  month: number;
  monthLabel: string;
  day: number;
  daysInMonth: number;
  daysLeft: number;
  progressPercent: number;
  weeks: Array<Array<CalendarMonthDay | null>>;
};

export const DEFAULT_LIFE_CALENDAR_SLEEP_HOURS = 8;
export const DEFAULT_LIFE_CALENDAR_WORK_HOURS = 8;

export const DEFAULT_LIFE_CALENDAR_CONFIG: LifeCalendarConfig = {
  version: 1,
  birthday: "1999-03-07",
  lifeExpectancy: 85,
  retirementAge: 65,
  sleepHours: DEFAULT_LIFE_CALENDAR_SLEEP_HOURS,
  workHours: DEFAULT_LIFE_CALENDAR_WORK_HOURS,
  showNominalAge: false,
  customTypes: [],
};

const DAY_MS = 86_400_000;
const DAYS_PER_YEAR = 365.2425;
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const ISO_MONTH_PATTERN = /^(\d{4})-(\d{2})$/u;
const RELATIVE_MONTH_PATTERN = /^now(?:([+-])(\d{1,3}))?$/iu;

export type CustomBoundaryEdge = "start" | "end";

type Mapping = Record<string, unknown>;

function record(value: unknown): Mapping {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("配置必须是对象");
  }
  return value as Mapping;
}

function integerInRange(
  value: unknown,
  label: string,
  min: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`${label}必须是 ${min} 到 ${max} 之间的整数`);
  }
  return value;
}

function numberInRange(
  value: unknown,
  label: string,
  min: number,
  max: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(`${label}必须是 ${min} 到 ${max} 之间的数字`);
  }
  return value;
}

export function parseIsoDate(value: string): Date | null {
  const match = ISO_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function requiredDate(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`${label}必须是日期`);
  const date = value.trim();
  if (!parseIsoDate(date)) throw new Error(`${label}不是有效日期`);
  return date;
}

export function parseIsoMonth(
  value: string,
): { year: number; month: number } | null {
  const match = ISO_MONTH_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || year < 1 || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export function parseAgeBoundary(value: unknown): number | null {
  if (
    typeof value !== "string" &&
    (typeof value !== "number" || !Number.isInteger(value))
  ) {
    return null;
  }
  const raw = String(value).trim();
  if (!/^\d{1,3}$/u.test(raw)) return null;
  const age = Number(raw);
  return Number.isInteger(age) && age >= 0 && age <= 119 ? age : null;
}

export function monthForAge(
  age: number,
  birthday: string,
  showNominalAge: boolean,
  edge: CustomBoundaryEdge,
): string | null {
  const birthMonth = parseIsoMonth(birthday.slice(0, 7));
  if (!birthMonth || !Number.isInteger(age) || age < 0 || age > 119) {
    return null;
  }
  const yearOffset = Math.max(age - (showNominalAge ? 1 : 0), 0);
  return `${birthMonth.year + yearOffset}-${edge === "start" ? "01" : "12"}`;
}

export function monthFromNow(value: unknown, todayIso: string): string | null {
  if (typeof value !== "string") return null;
  const match = RELATIVE_MONTH_PATTERN.exec(value.trim());
  if (!match) return null;
  const today = parseIsoDate(todayIso);
  if (!today) return null;
  const years = Number(match[2] ?? 0) * (match[1] === "-" ? -1 : 1);
  const year = today.getUTCFullYear() + years;
  if (year < 1 || year > 9999) return null;
  return `${String(year).padStart(4, "0")}-${String(today.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function parseRelativeMonthOffset(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = RELATIVE_MONTH_PATTERN.exec(value.trim());
  if (!match) return null;
  const years = Number(match[2] ?? 0) * (match[1] === "-" ? -1 : 1);
  return years;
}

export function relativeMonthBoundary(value: number): string {
  if (value === 0) return "now";
  return `now${value > 0 ? "+" : ""}${value}`;
}

export function resolveMonthBoundary(
  value: string,
  todayIso: string,
): string | null {
  const relative = parseRelativeMonthOffset(value);
  if (relative !== null) return monthFromNow(value, todayIso);
  const month = value.trim();
  return parseIsoMonth(month) ? month : null;
}

export function normalizeMonthBoundary(
  value: unknown,
  birthday: string,
  showNominalAge: boolean,
  edge: CustomBoundaryEdge,
): string | null {
  if (value === edge) return edge;
  const relative = parseRelativeMonthOffset(value);
  if (relative !== null) return relativeMonthBoundary(relative);
  const age = parseAgeBoundary(value);
  if (age !== null) return monthForAge(age, birthday, showNominalAge, edge);
  if (typeof value !== "string") return null;
  const month = value.trim();
  return parseIsoMonth(month) ? month : null;
}

export function boundaryAge(
  value: string,
  birthday: string,
  showNominalAge: boolean,
  lifeExpectancy?: number,
  todayIso?: string,
): number | null {
  if (value === "start") return 0;
  if (
    value === "end" &&
    lifeExpectancy !== undefined &&
    Number.isInteger(lifeExpectancy) &&
    lifeExpectancy >= 1
  ) {
    return lifeExpectancy;
  }
  const resolved = todayIso ? resolveMonthBoundary(value, todayIso) : value;
  const month = resolved ? parseIsoMonth(resolved) : null;
  const birthMonth = parseIsoMonth(birthday.slice(0, 7));
  if (!month || !birthMonth) return null;
  return month.year - birthMonth.year + (showNominalAge ? 1 : 0);
}

function normalizeCustomBoundary(
  value: unknown,
  label: string,
  birthday: string,
  showNominalAge: boolean,
  edge: CustomBoundaryEdge,
): string {
  const normalized = normalizeMonthBoundary(
    value,
    birthday,
    showNominalAge,
    edge,
  );
  if (!normalized) {
    const examples =
      edge === "start"
        ? "YYYY-MM、now+N、年龄或 start"
        : "YYYY-MM、now+N、年龄或 end";
    throw new Error(`${label}必须是 ${examples}`);
  }
  return normalized;
}

function boundaryStartMonth(value: string, todayIso: string): string | null {
  return value === "start" ? null : resolveMonthBoundary(value, todayIso);
}

function boundaryEndMonth(value: string, todayIso: string): string | null {
  return value === "end" ? null : resolveMonthBoundary(value, todayIso);
}

function absoluteMonth(value: { year: number; month: number }): number {
  return value.year * 12 + value.month - 1;
}

export function customFillSegments(
  customTypes: LifeCalendarCustomType[],
  year: number,
  todayIso: string,
): CalendarFillSegment[] {
  const owners: Array<LifeCalendarCustomType | null> = Array.from(
    { length: 12 },
    () => null,
  );
  const yearStart = year * 12;
  const yearEnd = yearStart + 11;

  for (const type of customTypes) {
    if (type.display !== "fill") continue;
    const start =
      type.startMonth === "start"
        ? Number.NEGATIVE_INFINITY
        : (() => {
            const resolved = resolveMonthBoundary(type.startMonth, todayIso);
            const parsed = resolved ? parseIsoMonth(resolved) : null;
            return parsed ? absoluteMonth(parsed) : Number.POSITIVE_INFINITY;
          })();
    const end =
      type.endMonth === "end"
        ? Number.POSITIVE_INFINITY
        : (() => {
            const resolved = resolveMonthBoundary(type.endMonth, todayIso);
            const parsed = resolved ? parseIsoMonth(resolved) : null;
            return parsed ? absoluteMonth(parsed) : Number.NEGATIVE_INFINITY;
          })();
    const overlapStart = Math.max(start, yearStart);
    const overlapEnd = Math.min(end, yearEnd);
    for (let month = overlapStart; month <= overlapEnd; month += 1) {
      const index = month - yearStart;
      if (owners[index] === null) owners[index] = type;
    }
  }

  const segments: CalendarFillSegment[] = [];
  let active: LifeCalendarCustomType | null = null;
  let activeStart = 0;
  for (let index = 0; index <= 12; index += 1) {
    const owner = index < 12 ? owners[index] : null;
    const ownerId = owner ? owner.id : null;
    const activeId = active ? active.id : null;
    if (ownerId === activeId) continue;
    if (active) {
      segments.push({
        id: active.id,
        label: active.label,
        color: active.color,
        startMonth: activeStart + 1,
        endMonth: index,
      });
    }
    active = owner;
    activeStart = index;
  }
  return segments;
}

function parseCustomType(
  value: unknown,
  index: number,
  birthday: string,
  showNominalAge: boolean,
  todayIso: string,
): LifeCalendarCustomType {
  const input = record(value);
  const prefix = `customTypes[${index}]`;
  const id = typeof input.id === "string" ? input.id.trim() : "";
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/iu.test(id)) {
    throw new Error(`${prefix}.id 格式无效`);
  }
  const label = typeof input.label === "string" ? input.label.trim() : "";
  if (!label || label.length > 24) {
    throw new Error(`${prefix}.label 需要 1 到 24 个字符`);
  }
  let startMonth: string;
  let endMonth: string;
  const birthMonth = parseIsoMonth(birthday.slice(0, 7));
  if (!birthMonth) throw new Error("出生日期不是有效日期");
  if (input.startMonth !== undefined || input.endMonth !== undefined) {
    startMonth = normalizeCustomBoundary(
      input.startMonth,
      `${prefix}.startMonth`,
      birthday,
      showNominalAge,
      "start",
    );
    endMonth = normalizeCustomBoundary(
      input.endMonth,
      `${prefix}.endMonth`,
      birthday,
      showNominalAge,
      "end",
    );
  } else {
    // Older configs stored ages. Convert them to an inclusive month range.
    const startAge = integerInRange(
      input.startAge,
      `${prefix}.startAge`,
      0,
      119,
    );
    const endAge = integerInRange(input.endAge, `${prefix}.endAge`, 1, 120);
    if (endAge <= startAge) {
      throw new Error(`${prefix} 的结束年龄必须大于开始年龄`);
    }
    startMonth =
      monthForAge(startAge, birthday, showNominalAge, "start") ??
      `${birthMonth.year}-01`;
    endMonth =
      monthForAge(endAge - 1, birthday, showNominalAge, "end") ??
      `${birthMonth.year}-12`;
  }
  const resolvedStart = boundaryStartMonth(startMonth, todayIso);
  const resolvedEnd = boundaryEndMonth(endMonth, todayIso);
  if (resolvedStart && resolvedEnd && resolvedEnd < resolvedStart) {
    throw new Error(`${prefix} 的结束边界不能早于开始边界`);
  }
  if (
    input.display !== undefined &&
    input.display !== "fill" &&
    input.display !== "underline"
  ) {
    throw new Error(`${prefix}.display 必须是 fill 或 underline`);
  }
  const color = typeof input.color === "string" ? input.color.trim() : "";
  if (!/^#[0-9a-f]{6}$/iu.test(color)) {
    throw new Error(`${prefix}.color 必须是 6 位十六进制颜色`);
  }
  return {
    id,
    label,
    startMonth,
    endMonth,
    display: input.display === "underline" ? "underline" : "fill",
    color,
  };
}

export function addYearsClamped(date: Date, years: number): Date {
  const targetYear = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(targetYear, month, Math.min(date.getUTCDate(), lastDay)),
  );
}

function daysBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / DAY_MS;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseLifeCalendarConfig(
  value: unknown,
  todayIso = new Date().toISOString().slice(0, 10),
): LifeCalendarConfig {
  const input = record(value);
  if (input.version !== 1) throw new Error("config.version 必须为 1");
  const birthday = requiredDate(input.birthday, "出生日期");
  const lifeExpectancy = integerInRange(
    input.lifeExpectancy,
    "预期寿命",
    1,
    120,
  );
  const retirementAge = integerInRange(
    input.retirementAge,
    "退休年龄",
    0,
    lifeExpectancy,
  );
  const sleepHours = numberInRange(
    input.sleepHours ?? DEFAULT_LIFE_CALENDAR_SLEEP_HOURS,
    "每日睡眠",
    0,
    24,
  );
  const workHours = numberInRange(
    input.workHours ?? DEFAULT_LIFE_CALENDAR_WORK_HOURS,
    "退休前工作",
    0,
    24,
  );
  if (sleepHours + workHours > 24) {
    throw new Error("每日睡眠与退休前工作之和不能超过 24 小时");
  }
  if (
    input.showNominalAge !== undefined &&
    typeof input.showNominalAge !== "boolean"
  ) {
    throw new Error("showNominalAge 必须是布尔值");
  }
  const showNominalAge = input.showNominalAge === true;
  const customTypesInput = input.customTypes ?? [];
  if (!Array.isArray(customTypesInput) || customTypesInput.length > 12) {
    throw new Error("customTypes 必须是最多包含 12 项的数组");
  }
  const customTypes = customTypesInput.map((type, index) =>
    parseCustomType(type, index, birthday, showNominalAge, todayIso),
  );
  if (new Set(customTypes.map((type) => type.id)).size !== customTypes.length) {
    throw new Error("自定义类型 id 不能重复");
  }
  return {
    version: 1,
    birthday,
    lifeExpectancy,
    retirementAge,
    sleepHours,
    workHours,
    showNominalAge,
    customTypes,
  };
}

export function cloneLifeCalendarConfig(
  config: LifeCalendarConfig,
): LifeCalendarConfig {
  return {
    ...config,
    customTypes: config.customTypes.map((type) => ({ ...type })),
  };
}

export function lifeCalendarConfigDocument(config: LifeCalendarConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function computeLifeCalendar(
  value: unknown,
  todayIso: string,
): LifeCalendarResult {
  const today = parseIsoDate(todayIso);
  if (!today) return { ok: false, error: "今天的日期格式无效。" };

  let config: LifeCalendarConfig;
  try {
    config = parseLifeCalendarConfig(value, todayIso);
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : String(cause),
    };
  }

  const birthday = parseIsoDate(config.birthday);
  if (!birthday) return { ok: false, error: "出生日期无效。" };
  if (birthday > today) {
    return { ok: false, error: "出生日期不能晚于今天。" };
  }

  const ageOffset = config.showNominalAge ? 1 : 0;
  const finalLivingAge = config.lifeExpectancy - ageOffset;
  const deathDate = addYearsClamped(birthday, finalLivingAge);
  if (today >= deathDate) {
    return {
      ok: false,
      error: "预期寿命需要晚于当前日期，请调整寿命或出生日期。",
    };
  }

  let currentAge = 0;
  while (
    currentAge < finalLivingAge &&
    addYearsClamped(birthday, currentAge + 1) <= today
  ) {
    currentAge += 1;
  }

  const currentIndex = Math.min(currentAge, finalLivingAge);
  const currentAgeExact = daysBetween(birthday, today) / DAYS_PER_YEAR;
  const birthdayYear = birthday.getUTCFullYear();
  const currentYear = birthdayYear + currentIndex;
  const retirementIndex = Math.min(
    Math.max(config.retirementAge - ageOffset, 0),
    finalLivingAge,
  );
  const retirementDate = addYearsClamped(birthday, retirementIndex);
  const retirementYear = birthdayYear + retirementIndex;
  const deathYear = birthdayYear + finalLivingAge;
  const livedYearsExact = daysBetween(birthday, today) / DAYS_PER_YEAR;
  const remainingYearsExact = daysBetween(today, deathDate) / DAYS_PER_YEAR;
  const sleepYears = remainingYearsExact * (config.sleepHours / 24);
  const yearsBeforeRetirement =
    Math.max(0, daysBetween(today, retirementDate)) / DAYS_PER_YEAR;
  const yearsAfterRetirement =
    Math.max(
      0,
      daysBetween(retirementDate > today ? retirementDate : today, deathDate),
    ) / DAYS_PER_YEAR;
  const workYears = yearsBeforeRetirement * (config.workHours / 24);
  const freeYearsBeforeRetirement =
    yearsBeforeRetirement * ((24 - config.sleepHours - config.workHours) / 24);
  const freeYearsAfterRetirement =
    yearsAfterRetirement * ((24 - config.sleepHours) / 24);
  const freeYears = freeYearsBeforeRetirement + freeYearsAfterRetirement;
  const progressPercent = clamp(
    (daysBetween(birthday, today) /
      Math.max(daysBetween(birthday, deathDate), 1)) *
      100,
    0,
    100,
  );

  const cells: CalendarCell[] = Array.from(
    { length: finalLivingAge + 1 },
    (_, index) => {
      const ordinal = index + 1;
      const displayAge =
        index === currentIndex
          ? currentAgeExact + ageOffset
          : index + ageOffset;
      const state: CalendarCellState =
        index < currentIndex
          ? "past"
          : index === currentIndex
            ? "current"
            : displayAge >= config.retirementAge
              ? "retirement"
              : "future";
      return {
        index,
        ordinal,
        year: birthdayYear + index,
        ageStart: index,
        ageEnd: ordinal,
        state,
        isCurrent: index === currentIndex,
        displayAge,
        fillSegments: customFillSegments(
          config.customTypes,
          birthdayYear + index,
          todayIso,
        ),
        customTypes: config.customTypes
          .filter((type) => {
            const yearStart = `${birthdayYear + index}-01`;
            const yearEnd = `${birthdayYear + index + 1}-01`;
            const customStart = boundaryStartMonth(type.startMonth, todayIso);
            const customEnd = boundaryEndMonth(type.endMonth, todayIso);
            const startsBeforeYearEnd =
              customStart === null || customStart < yearEnd;
            const endsAfterYearStart =
              customEnd === null || customEnd >= yearStart;
            return startsBeforeYearEnd && endsAfterYearStart;
          })
          .map(({ id, label, color, display }) => ({
            id,
            label,
            color,
            display,
          })),
      };
    },
  );

  return {
    ok: true,
    birthday,
    showNominalAge: config.showNominalAge,
    lifeExpectancy: config.lifeExpectancy,
    deathDate,
    currentYear,
    currentOrdinal: currentIndex + 1,
    currentAge,
    currentAgeExact,
    retirementYear,
    deathYear,
    livedYears: currentIndex,
    livedYearsExact,
    remainingYears: finalLivingAge + 1 - currentIndex,
    remainingYearsExact,
    sleepYears,
    workYears,
    freeYears,
    freeYearsBeforeRetirement,
    freeYearsAfterRetirement,
    sleepHours: config.sleepHours,
    workHours: config.workHours,
    progressPercent,
    customTypes: config.customTypes,
    cells,
  };
}

export function buildCalendarMonth(todayIso: string): CalendarMonth | null {
  const today = parseIsoDate(todayIso);
  if (!today) return null;

  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday =
    (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const requiredCells = firstWeekday + daysInMonth;
  const totalCells = requiredCells <= 35 ? 35 : 42;
  const days: Array<CalendarMonthDay | null> = Array.from(
    { length: totalCells },
    (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) return null;
      const date = new Date(Date.UTC(year, month - 1, dayNumber));
      return {
        day: dayNumber,
        date: [
          String(year).padStart(4, "0"),
          String(month).padStart(2, "0"),
          String(dayNumber).padStart(2, "0"),
        ].join("-"),
        isToday: dayNumber === day,
        isPast: dayNumber < day,
        weekday: (date.getUTCDay() + 6) % 7,
      };
    },
  );
  const weeks: Array<Array<CalendarMonthDay | null>> = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return {
    year,
    month,
    monthLabel: `${year} 年 ${month} 月`,
    day,
    daysInMonth,
    daysLeft: daysInMonth - day,
    progressPercent: (day / daysInMonth) * 100,
    weeks,
  };
}
