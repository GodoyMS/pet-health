/** Calendar-date helpers (timezone-safe for date-only values). */

export function formatCalendarDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function normalizeLogDate(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) {
    return formatCalendarDate(value);
  }
  if (typeof value === "string") {
    return value.includes("T") ? value.slice(0, 10) : value.slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatCalendarDate(date);
}

export function startOfCalendarMonth(d: Date): string {
  return formatCalendarDate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function addCalendarMonths(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  return formatCalendarDate(date);
}
