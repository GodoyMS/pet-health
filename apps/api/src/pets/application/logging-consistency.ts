/** Pure helpers for health-log streaks and heatmap grids (no I/O). */

import { addCalendarDays, formatCalendarDate, normalizeLogDate } from "./date-utils";

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

/** Count of distinct calendar days with at least one log in the current ISO week (Mon–Sun). */
export function computeWeekCompletion(
  logDates: unknown[],
  reference = new Date()
): number {
  const normalized = logDates.map(normalizeLogDate).filter(Boolean);
  const weekStart = startOfWeekMonday(reference);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const startStr = formatCalendarDate(weekStart);
  const endStr = formatCalendarDate(weekEnd);
  const unique = new Set(normalized);
  let count = 0;
  for (const date of unique) {
    if (date >= startStr && date <= endStr) count++;
  }
  return count;
}

/** Consecutive days with logs ending today or yesterday (allows missing today). */
export function computeLoggingStreak(
  logDates: unknown[],
  reference = new Date()
): number {
  const normalized = logDates.map(normalizeLogDate).filter(Boolean);
  if (normalized.length === 0) return 0;

  const unique = new Set(normalized);
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());

  let cursor = new Date(today);
  const todayStr = formatCalendarDate(today);
  if (!unique.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  for (let i = 0; i < 366; i++) {
    if (unique.has(formatCalendarDate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** Map log dates to per-day counts (multiple entries on same day count). */
export function countLogsByDate(logDates: unknown[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const raw of logDates) {
    const date = normalizeLogDate(raw);
    if (!date) continue;
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }
  return counts;
}

/** 5×7 grid (weeks × days) ending on reference date; cell values 0–3 by intensity. */
export function buildLoggingHeatmap(
  logDates: unknown[],
  weeks = 5,
  reference = new Date()
): number[][] {
  const counts = countLogsByDate(logDates);
  const end = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());

  const grid: number[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const row: number[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(end);
      cell.setDate(cell.getDate() - w * 7 - (6 - d));
      const count = counts.get(formatCalendarDate(cell)) ?? 0;
      row.push(count === 0 ? 0 : count >= 3 ? 3 : count);
    }
    grid.push(row);
  }
  return grid;
}

/** Distinct normalized log dates, newest first. */
export function distinctLogDates(logDates: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of logDates) {
    const date = normalizeLogDate(raw);
    if (date && !seen.has(date)) {
      seen.add(date);
      result.push(date);
    }
  }
  return result.sort((a, b) => b.localeCompare(a));
}
