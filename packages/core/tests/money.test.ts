import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatCentsToBRL, parseBRLToCents } from "../src/money";

describe("money", () => {
  describe("formatCentsToBRL", () => {
    it("formats 100000 cents as R$\u00a01.000,00", () => {
      // Intl.NumberFormat uses a non-breaking space (U+00A0) between "R$" and the amount
      expect(formatCentsToBRL(100000)).toBe("R$\u00a01.000,00");
    });
  });

  describe("parseBRLToCents", () => {
    it("parses plain integer string '1000' to 100000", () => {
      expect(parseBRLToCents("1000")).toBe(100000);
    });

    it("parses comma-decimal string '1000,00' to 100000", () => {
      expect(parseBRLToCents("1000,00")).toBe(100000);
    });

    it("parses dot-thousands + comma-decimal string '1.000,00' to 100000", () => {
      expect(parseBRLToCents("1.000,00")).toBe(100000);
    });
  });

  // Feature: sistema-mare, Property 1: parseBRLToCents(formatCentsToBRL(c)) === c
  // Validates: Requirements 3.5
  it("Property 1: money formatting/parsing round-trip holds for all valid cent values", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10_000_000 }), (cents) => {
        return parseBRLToCents(formatCentsToBRL(cents)) === cents;
      }),
      { numRuns: 100 },
    );
  });

  // Feature: sistema-mare, Property 2: formatCentsToBRL output starts with "R$" and uses correct separators
  // Validates: Requirements 3.1
  it("Property 2: formatCentsToBRL output starts with 'R$' and uses comma as decimal separator", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10_000_000 }), (cents) => {
        const result = formatCentsToBRL(cents);
        return result.startsWith("R$") && result.includes(",");
      }),
      { numRuns: 100 },
    );
  });

  // Feature: sistema-mare, Property 3: parseBRLToCents(String(n)) === n * 100
  // Validates: Requirements 3.3
  it("Property 3: plain integer string parsing returns n * 100 for all positive integers", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100_000 }), (n) => {
        return parseBRLToCents(String(n)) === n * 100;
      }),
      { numRuns: 100 },
    );
  });
});
