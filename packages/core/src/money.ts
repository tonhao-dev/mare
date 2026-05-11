/**
 * Formats an integer number of cents as a Brazilian Real currency string.
 *
 * @example
 * formatCentsToBRL(100000) // "R$ 1.000,00"
 * formatCentsToBRL(0)      // "R$ 0,00"
 */
export function formatCentsToBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Parses a BRL-formatted string (or plain integer string) to an integer number of cents.
 *
 * Supported input formats:
 * - Plain integer string: "1000"     → 100000
 * - Comma-decimal format: "1000,00"  → 100000
 * - Dot-thousands + comma-decimal: "1.000,00" → 100000
 *
 * @example
 * parseBRLToCents("1.000,00") // 100000
 * parseBRLToCents("1000,00")  // 100000
 * parseBRLToCents("1000")     // 100000
 */
export function parseBRLToCents(value: string): number {
  // Strip currency symbol (R$) and surrounding whitespace
  const stripped = value.replace(/R\$\s*/g, "").trim();

  if (stripped.includes(",")) {
    // Brazilian decimal format: remove thousands dots, replace comma with dot
    const normalized = stripped.replace(/\./g, "").replace(",", ".");
    return Math.round(parseFloat(normalized) * 100);
  }

  // Plain integer string (no comma): multiply by 100
  return parseInt(stripped, 10) * 100;
}
