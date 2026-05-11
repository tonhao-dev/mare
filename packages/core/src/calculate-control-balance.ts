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
  const iso = date.toISOString().slice(0, 10);
  return !holidays.has(iso);
}

/**
 * Computes the cycle start date (day-of-month) given the anchor, offset, and
 * whether to count only business days.
 *
 * START anchor:
 *   - calendar: day 1 + offsetDays
 *   - working:  the Nth business day of the month (offset=0 → first business day)
 *
 * END anchor:
 *   - calendar: lastDay - offsetDays
 *   - working:  walk backwards from the last day of the month, counting only
 *               business days; stop after offsetDays steps.
 *               offset=0 → last business day
 *               offset=2 → 3rd-to-last business day (skip 2 from the end)
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
    // Walk forward from day 1, counting business days
    let businessCount = 0;
    for (let d = 1; d <= last; d++) {
      const date = new Date(year, month, d);
      if (isBusinessDay(date, holidays)) {
        if (businessCount === offsetDays) return d;
        businessCount++;
      }
    }
    return last; // fallback
  } else {
    if (!countWorkingDaysOnly) {
      return Math.max(1, last - offsetDays);
    }
    // Walk backwards from the last day, counting business days
    let businessCount = 0;
    for (let d = last; d >= 1; d--) {
      const date = new Date(year, month, d);
      if (isBusinessDay(date, holidays)) {
        if (businessCount === offsetDays) return d;
        businessCount++;
      }
    }
    return 1; // fallback
  }
}

/**
 * Counts the number of elapsed days between cycleStartDay and today (inclusive of today,
 * exclusive of start), optionally counting only working days.
 *
 * Working days = Mon–Fri, excluding Brazilian national holidays.
 * Holidays are passed in as a Set of "YYYY-MM-DD" strings.
 *
 * Returns 0 if today < cycleStartDay.
 */
export function countElapsedDays(params: {
  cycleStartDay: number;
  referenceDate?: Date;
  countWorkingDaysOnly: boolean;
  holidays?: Set<string>;
}): number {
  const {
    cycleStartDay,
    countWorkingDaysOnly,
    holidays = new Set<string>(),
  } = params;

  const today = params.referenceDate ?? new Date();
  const todayDay = today.getDate();

  if (todayDay < cycleStartDay) {
    return 0;
  }

  if (!countWorkingDaysOnly) {
    return todayDay - cycleStartDay;
  }

  // Count working days from cycleStartDay (exclusive) to todayDay (inclusive)
  let count = 0;
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  for (let d = cycleStartDay + 1; d <= todayDay; d++) {
    const date = new Date(year, month, d);
    if (isBusinessDay(date, holidays)) {
      count++;
    }
  }

  return count;
}

/**
 * Calculates the expected balance for a control on a given date.
 *
 * Steps:
 * 1. Compute the cycle start day from anchor + offset (respecting working days).
 * 2. If today < cycle start → return baseValueCents (cycle hasn't started).
 * 3. Count elapsed days (working or calendar) since cycle start.
 * 4. Apply formula: INCREASE = base + step * elapsed, DECREASE = base - step * elapsed.
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
  const cycleStartDay = computeCycleStartDay(
    cycleAnchor,
    cycleOffsetDays,
    today,
    countWorkingDaysOnly,
    holidays,
  );

  const elapsed = countElapsedDays({
    cycleStartDay,
    referenceDate: today,
    countWorkingDaysOnly,
    holidays,
  });

  if (type === "INCREASE") {
    return baseValueCents + dailyStepCents * elapsed;
  } else {
    return baseValueCents - dailyStepCents * elapsed;
  }
}
