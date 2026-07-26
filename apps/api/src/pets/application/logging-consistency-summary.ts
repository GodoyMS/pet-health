import {
  formatCalendarDate,
  normalizeLogDate
} from "./date-utils";
import {
  computeLoggingStreak,
  computeWeekCompletion
} from "./logging-consistency";

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const RECENT_WEEK_LABELS = [
  "This week",
  "Last week",
  "2 weeks ago",
  "3 weeks ago"
] as const;

export interface LoggingWeekDay {
  date: string;
  short: string;
  logged: boolean;
  isToday: boolean;
}

export interface LoggingWeekBar {
  label: string;
  loggedDays: number;
}

export interface LoggingConsistencySummary {
  streakDays: number;
  weekCompletion: number;
  totalLogsLast30Days: number;
  lastLogDate: string | null;
  daysSinceLastLog: number | null;
  currentWeekDays: LoggingWeekDay[];
  recentWeeks: LoggingWeekBar[];
  headline: string;
  subline: string;
  tip: string;
}

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function uniqueLogDates(logDates: unknown[]): Set<string> {
  return new Set(logDates.map(normalizeLogDate).filter(Boolean));
}

export function buildCurrentWeekDays(
  logDates: unknown[],
  reference = new Date()
): LoggingWeekDay[] {
  const logged = uniqueLogDates(logDates);
  const today = formatCalendarDate(reference);
  const weekStart = startOfWeekMonday(reference);
  const days: LoggingWeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dateStr = formatCalendarDate(day);
    const dayIndex = day.getDay();
    const shortIdx = dayIndex === 0 ? 6 : dayIndex - 1;
    days.push({
      date: dateStr,
      short: DAY_SHORT[shortIdx] ?? dateStr.slice(5),
      logged: logged.has(dateStr),
      isToday: dateStr === today
    });
  }

  return days;
}

export function buildRecentWeekBars(
  logDates: unknown[],
  reference = new Date(),
  weekCount = 4
): LoggingWeekBar[] {
  const logged = uniqueLogDates(logDates);
  const weekStart = startOfWeekMonday(reference);
  const bars: LoggingWeekBar[] = [];

  for (let w = 0; w < weekCount; w++) {
    const ws = new Date(weekStart);
    ws.setDate(ws.getDate() - w * 7);
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(ws);
      day.setDate(day.getDate() + d);
      if (logged.has(formatCalendarDate(day))) count++;
    }
    bars.push({
      label: RECENT_WEEK_LABELS[w] ?? `${w} weeks ago`,
      loggedDays: count
    });
  }

  return bars;
}

export function findLastLogDate(logDates: unknown[]): string | null {
  const normalized = logDates.map(normalizeLogDate).filter(Boolean);
  if (normalized.length === 0) return null;
  return normalized.sort((a, b) => b.localeCompare(a))[0] ?? null;
}

export function daysSinceDate(isoDate: string, reference = new Date()): number {
  const today = formatCalendarDate(reference);
  const [y1, m1, d1] = today.split("-").map(Number);
  const [y2, m2, d2] = isoDate.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.floor((a - b) / 86_400_000);
}

export function buildLoggingMessages(params: {
  streakDays: number;
  weekCompletion: number;
  daysSinceLastLog: number | null;
  totalLogsLast30Days: number;
}): { headline: string; subline: string; tip: string } {
  const { streakDays, weekCompletion, daysSinceLastLog, totalLogsLast30Days } =
    params;

  if (totalLogsLast30Days === 0) {
    return {
      headline: "No check-ins yet",
      subline: "Start logging to build a picture of your pet's day-to-day health.",
      tip: "Try one quick note per week — appetite, energy, and weight are enough."
    };
  }

  if (daysSinceLastLog !== null && daysSinceLastLog > 14) {
    return {
      headline: `It's been ${daysSinceLastLog} days since your last check-in`,
      subline: "Regular notes help you notice small changes before they become problems.",
      tip: "Set a weekly reminder — even a 30-second log makes a difference."
    };
  }

  if (streakDays >= 3) {
    return {
      headline: `${streakDays}-day logging streak`,
      subline: `${weekCompletion} of 7 days logged this week.`,
      tip:
        streakDays >= 7
          ? "Excellent habit — you're building a reliable health history."
          : "Log again today to keep your streak alive."
    };
  }

  if (weekCompletion >= 4) {
    return {
      headline: "Strong week of tracking",
      subline: `${weekCompletion} check-in${weekCompletion !== 1 ? "s" : ""} so far this week.`,
      tip: "Logging most days of the week gives the clearest health picture."
    };
  }

  if (weekCompletion > 0) {
    return {
      headline: "You're getting started",
      subline: `${weekCompletion} day${weekCompletion !== 1 ? "s" : ""} logged this week — nice work.`,
      tip: "A few more check-ins this week will make trends easier to read."
    };
  }

  return {
    headline: "Ready for a check-in?",
    subline: "No logs yet this week.",
    tip: "Open health logs and add a quick note about how your pet is doing today."
  };
}

export function buildLoggingConsistencySummary(
  logDates: unknown[],
  totalLogsLast30Days: number,
  reference = new Date()
): LoggingConsistencySummary {
  const streakDays = computeLoggingStreak(logDates, reference);
  const weekCompletion = computeWeekCompletion(logDates, reference);
  const lastLogDate = findLastLogDate(logDates);
  const daysSinceLastLog =
    lastLogDate != null ? daysSinceDate(lastLogDate, reference) : null;
  const messages = buildLoggingMessages({
    streakDays,
    weekCompletion,
    daysSinceLastLog,
    totalLogsLast30Days
  });

  return {
    streakDays,
    weekCompletion,
    totalLogsLast30Days,
    lastLogDate,
    daysSinceLastLog,
    currentWeekDays: buildCurrentWeekDays(logDates, reference),
    recentWeeks: buildRecentWeekBars(logDates, reference),
    ...messages
  };
}
