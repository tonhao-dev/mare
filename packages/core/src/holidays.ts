/**
 * Fetches Brazilian national holidays for a given year from BrasilAPI.
 * Returns a Set of "YYYY-MM-DD" date strings.
 *
 * Falls back to an empty Set on network errors so the app degrades gracefully.
 */
export async function fetchBrazilianHolidays(
  year: number,
): Promise<Set<string>> {
  try {
    const res = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`,
      { next: { revalidate: 86400 } }, // cache for 24h (Next.js fetch cache)
    );
    if (!res.ok) return new Set();
    const data = (await res.json()) as Array<{ date: string }>;
    return new Set(data.map((h) => h.date)); // "YYYY-MM-DD"
  } catch {
    return new Set();
  }
}
