import { describe, it } from "vitest";
import * as fc from "fast-check";
import { controlSchema } from "./schemas";

describe("controlSchema", () => {
  // Feature: sistema-mare, Property 7: dailyStep <= 0 is rejected by Zod schema
  // Validates: Requirements 5.5
  it("Property 7: non-positive daily step values are rejected", () => {
    fc.assert(
      fc.property(fc.integer({ max: 0 }), (invalidStep) => {
        const result = controlSchema.safeParse({
          name: "Test",
          baseValue: "100",
          type: "DECREASE",
          dailyStep: String(invalidStep),
        });
        return result.success === false;
      }),
      { numRuns: 100 },
    );
  });
});
