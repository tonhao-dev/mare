import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculateControlBalance } from "../src/calculate-control-balance";

describe("calculateControlBalance", () => {
  it("DECREASE: subtracts dailyStep * dayOfMonth from baseValue", () => {
    // baseValueCents=100000, dailyStepCents=3500, dayOfMonth=5 → 100000 - 3500*5 = 82500
    expect(
      calculateControlBalance({
        baseValueCents: 100000,
        dailyStepCents: 3500,
        type: "DECREASE",
        dayOfMonth: 5,
      }),
    ).toBe(82500);
  });

  it("INCREASE: adds dailyStep * dayOfMonth to baseValue", () => {
    // baseValueCents=0, dailyStepCents=10000, dayOfMonth=10 → 0 + 10000*10 = 100000
    expect(
      calculateControlBalance({
        baseValueCents: 0,
        dailyStepCents: 10000,
        type: "INCREASE",
        dayOfMonth: 10,
      }),
    ).toBe(100000);
  });

  it("uses the day from a Date object when dayOfMonth is not provided", () => {
    // date = new Date(2024, 0, 15) → day 15; INCREASE: 0 + 1000*15 = 15000
    expect(
      calculateControlBalance({
        baseValueCents: 0,
        dailyStepCents: 1000,
        type: "INCREASE",
        date: new Date(2024, 0, 15),
      }),
    ).toBe(15000);
  });

  it("handles day 1 edge case correctly (DECREASE)", () => {
    // baseValueCents=10000, dailyStepCents=100, dayOfMonth=1 → 10000 - 100*1 = 9900
    expect(
      calculateControlBalance({
        baseValueCents: 10000,
        dailyStepCents: 100,
        type: "DECREASE",
        dayOfMonth: 1,
      }),
    ).toBe(9900);
  });

  it("handles non-zero base value with INCREASE", () => {
    // baseValueCents=50000, dailyStepCents=2000, dayOfMonth=3 → 50000 + 2000*3 = 56000
    expect(
      calculateControlBalance({
        baseValueCents: 50000,
        dailyStepCents: 2000,
        type: "INCREASE",
        dayOfMonth: 3,
      }),
    ).toBe(56000);
  });

  // Feature: sistema-mare, Property 4: DECREASE balance = baseValueCents - dailyStepCents * dayOfMonth
  // Validates: Requirements 2.6, 11.2
  it("Property 4: DECREASE balance formula holds for all valid inputs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 1 }),
        fc.integer({ min: 1, max: 31 }),
        (base, step, day) => {
          return (
            calculateControlBalance({
              baseValueCents: base,
              dailyStepCents: step,
              type: "DECREASE",
              dayOfMonth: day,
            }) ===
            base - step * day
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: sistema-mare, Property 5: INCREASE balance = baseValueCents + dailyStepCents * dayOfMonth
  // Validates: Requirements 2.5, 11.3
  it("Property 5: INCREASE balance formula holds for all valid inputs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 1 }),
        fc.integer({ min: 1, max: 31 }),
        (base, step, day) => {
          return (
            calculateControlBalance({
              baseValueCents: base,
              dailyStepCents: step,
              type: "INCREASE",
              dayOfMonth: day,
            }) ===
            base + step * day
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: sistema-mare, Property 6: dayOfMonth overrides date when both provided
  // Validates: Requirements 2.2, 2.3
  it("Property 6: dayOfMonth takes priority over date when both are provided", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 1 }),
        fc.integer({ min: 1, max: 31 }),
        fc.date(),
        fc.constantFrom("INCREASE" as const, "DECREASE" as const),
        (base, step, day, date, type) => {
          const withBoth = calculateControlBalance({
            baseValueCents: base,
            dailyStepCents: step,
            type,
            dayOfMonth: day,
            date,
          });
          const withDayOnly = calculateControlBalance({
            baseValueCents: base,
            dailyStepCents: step,
            type,
            dayOfMonth: day,
          });
          return withBoth === withDayOnly;
        },
      ),
      { numRuns: 100 },
    );
  });
});
