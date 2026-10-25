const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" });

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Tanggal lokal (bukan UTC) dalam format YYYY-MM-DD. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;
  return toISODate(parseISODate(value)) === value;
}

export function addDays(value: string, days: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addMonths(value: string, months: number): string {
  const date = parseISODate(startOfMonth(value));
  date.setMonth(date.getMonth() + months);
  return toISODate(date);
}

export function startOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

export function endOfMonth(value: string): string {
  const date = parseISODate(value);
  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function formatDate(value: string): string {
  return dateFormatter.format(parseISODate(value));
}

export function formatShortDate(value: string): string {
  return shortDateFormatter.format(parseISODate(value));
}

/** "2026-10" -> "Okt 26" */
export function formatMonthLabel(monthKey: string): string {
  return monthFormatter.format(parseISODate(`${monthKey}-01`));
}