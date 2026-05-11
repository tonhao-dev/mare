import { ControlType, CycleAnchor } from "./types";

/**
 * Returns the last day of the month for a given date.
 */
function lastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isBusinessDay(date: Date, holidays: Set<string>): boolean {
  const dow = date.getDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return false;
  const iso = toISODate(date);
  return !holidays.has(iso);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes the cycle start day-of-month for a given month/year, anchor, offset,
 * and working-days flag.
 *
 * START anchor:
 *   - calendar: day 1 + offsetDays
 *   - working:  the (offsetDays)th business day of the month (0-indexed)
 *
 * END anchor:
 *   - calendar: lastDay - offsetDays
 *   - working:  walk backwards from the last day; stop after offsetDays business days
 *               offset=0 → last business day
 *               offset=1 → 2nd-to-last business day
 */
export function computeCycleStartDay(
  anchor: CycleAnchor,
  offsetDays: number,
  referenceDate: Date = new Date(),
  countWorkingDaysOnly: boolean = false,
  holidays: Set<string> = new Set(),
): number {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const last = lastDayOfMonth(referenceDate);

  if (anchor === "START") {
    if (!countWorkingDaysOnly) {
      return Math.min(1 + offsetDays, last);
    }
    let businessCount = 0;
    for (let d = 1; d <= last; d++) {
      if (isBusinessDay(new Date(year, month, d), holidays)) {
        if (businessCount === offsetDays) return d;
        businessCount++;
      }
    }
    return last;
  } else {
    if (!countWorkingDaysOnly) {
      return Math.max(1, last - offsetDays);
    }
    let businessCount = 0;
    for (let d = last; d >= 1; d--) {
      if (isBusinessDay(new Date(year, month, d), holidays)) {
        if (businessCount === offsetDays) return d;
        businessCount++;
      }
    }
    return 1;
  }
}

/**
 * Counts elapsed days (calendar or working) between two dates, inclusive of
 * both startDate and endDate.
 *
 * Day 1 of the cycle (the start date itself) counts as 1 elapsed day.
 */
function countDaysBetween(
  startDate: Date,
  endDate: Date,
  countWorkingDaysOnly: boolean,
  holidays: Set<string>,
): number {
  let count = 0;
  const cursor = new Date(startDate); // start inclusive

  while (cursor <= endDate) {
    if (!countWorkingDaysOnly || isBusinessDay(cursor, holidays)) {
      count++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Calculates the expected balance for a control on a given date.
 *
 * The cycle is monthly and recurring. If today is before the current month's
 * cycle start, we are still in the previous month's cycle — elapsed days are
 * counted from the previous month's cycle start date up to today.
 *
 * Formula:
 *   INCREASE: baseValueCents + dailyStepCents * elapsed
 *   DECREASE: baseValueCents - dailyStepCents * elapsed
 */
export function calculateControlBalance(params: {
  baseValueCents: number;
  dailyStepCents: number;
  type: ControlType;
  cycleAnchor: CycleAnchor;
  cycleOffsetDays: number;
  countWorkingDaysOnly: boolean;
  holidays?: Set<string>;
  referenceDate?: Date;
}): number {
  const {
    baseValueCents,
    dailyStepCents,
    type,
    cycleAnchor,
    cycleOffsetDays,
    countWorkingDaysOnly,
    holidays = new Set(),
    referenceDate,
  } = params;

  const today = referenceDate ?? new Date();

  // Compute this month's cycle start as a full Date
  const thisMonthStart = computeCycleStartDay(
    cycleAnchor,
    cycleOffsetDays,
    today,
    countWorkingDaysOnly,
    holidays,
  );
  const cycleStartThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    thisMonthStart,
  );

  let cycleStartDate: Date;

  if (today >= cycleStartThisMonth) {
    // We are in the current month's cycle
    cycleStartDate = cycleStartThisMonth;
  } else {
    // We are before this month's cycle start — still in the previous month's cycle
    const prevMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const prevMonthStartDay = computeCycleStartDay(
      cycleAnchor,
      cycleOffsetDays,
      prevMonthDate,
      countWorkingDaysOnly,
      holidays,
    );
    cycleStartDate = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth(),
      prevMonthStartDay,
    );
  }

  const elapsed = countDaysBetween(
    cycleStartDate,
    today,
    false, // elapsed days are always calendar days; countWorkingDaysOnly only affects cycle start
    holidays,
  );

  if (type === "INCREASE") {
    return baseValueCents + dailyStepCents * elapsed;
  } else {
    return baseValueCents - dailyStepCents * elapsed;
  }
}

/**
 * Returns the cycle start Date for display purposes (used by pages).
 */
export function resolveCycleStartDate(params: {
  cycleAnchor: CycleAnchor;
  cycleOffsetDays: number;
  countWorkingDaysOnly: boolean;
  holidays?: Set<string>;
  referenceDate?: Date;
}): Date {
  const {
    cycleAnchor,
    cycleOffsetDays,
    countWorkingDaysOnly,
    holidays = new Set(),
    referenceDate,
  } = params;

  const today = referenceDate ?? new Date();

  const thisMonthStartDay = computeCycleStartDay(
    cycleAnchor,
    cycleOffsetDays,
    today,
    countWorkingDaysOnly,
    holidays,
  );
  const cycleStartThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    thisMonthStartDay,
  );

  if (today >= cycleStartThisMonth) {
    return cycleStartThisMonth;
  }

  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthStartDay = computeCycleStartDay(
    cycleAnchor,
    cycleOffsetDays,
    prevMonthDate,
    countWorkingDaysOnly,
    holidays,
  );
  return new Date(
    prevMonthDate.getFullYear(),
    prevMonthDate.getMonth(),
    prevMonthStartDay,
  );
}
