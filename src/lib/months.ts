import type { YearMonth } from "@/content/profile";

/** Months since year 0, so ranges can be compared and subtracted. */
export function monthIndex(ym: YearMonth): number {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
}

export function toYearMonth(date: Date, timeZone = "Asia/Jakarta"): YearMonth {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${Number(parts.year)}-${Number(parts.month)}` as YearMonth;
}

/** Inclusive month count: Feb–Apr = 3. */
export function monthsBetween(start: YearMonth, end: YearMonth): number {
  return monthIndex(end) - monthIndex(start) + 1;
}

export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(ym: YearMonth): string {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Feb 2026 — now", "Oct 2023 — Jan 2026", "Feb — Apr 2022". */
export function formatRange(start: YearMonth, end: YearMonth | null): string {
  if (end === null) return `${formatMonth(start)} — now`;
  const [sy] = start.split("-").map(Number);
  const [ey] = end.split("-").map(Number);
  if (sy === ey) return `${formatMonth(start).split(" ")[0]} — ${formatMonth(end)}`;
  return `${formatMonth(start)} — ${formatMonth(end)}`;
}
