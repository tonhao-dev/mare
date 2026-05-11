import { ControlType } from "./types";

/**
 * Calculates the expected balance for a control on a given day of the month.
 *
 * Day resolution priority: dayOfMonth > date.getDate() > new Date().getDate()
 *
 * Formulas:
 * - INCREASE: baseValueCents + dailyStepCents * dayOfMonth
 * - DECREASE: baseValueCents - dailyStepCents * dayOfMonth
 */
export function calculateControlBalance(params: {
  baseValueCents: number;
  dailyStepCents: number;
  type: ControlType;
  dayOfMonth?: number;
  date?: Date;
}): number {
  const { baseValueCents, dailyStepCents, type, dayOfMonth, date } = params;

  const day =
    dayOfMonth !== undefined
      ? dayOfMonth
      : date !== undefined
        ? date.getDate()
        : new Date().getDate();

  if (type === "INCREASE") {
    return baseValueCents + dailyStepCents * day;
  } else {
    return baseValueCents - dailyStepCents * day;
  }
}
