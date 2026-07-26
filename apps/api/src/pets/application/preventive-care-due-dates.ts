import type { PreventiveCareRuleOrmEntity } from "../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function yearBounds(year: number): { start: Date; end: Date } {
  return {
    start: startOfDay(new Date(year, 0, 1)),
    end: startOfDay(new Date(year, 11, 31))
  };
}

/**
 * All due dates for a rule that fall within a calendar year, based on birth date.
 * Recurring rules (`intervalDays`) emit every occurrence in the year; one-offs emit at most once.
 */
export function computeDueDatesInYear(
  birthDate: string,
  rule: PreventiveCareRuleOrmEntity,
  year: number
): string[] {
  const birth = startOfDay(new Date(`${birthDate}T12:00:00`));
  const { start: yearStart, end: yearEnd } = yearBounds(year);
  const minDays = rule.applicableMinAgeDays ?? 0;
  const dates: string[] = [];

  if (rule.intervalDays != null && rule.intervalDays > 0) {
    let due = addDays(birth, minDays);
    while (due <= yearEnd) {
      if (due >= yearStart) {
        dates.push(toIsoDate(due));
      }
      due = addDays(due, rule.intervalDays);
    }
    return dates;
  }

  const candidates: Date[] = [];
  if (rule.applicableMinAgeDays != null) {
    candidates.push(addDays(birth, rule.applicableMinAgeDays));
  }
  if (
    rule.applicableMaxAgeDays != null &&
    rule.applicableMaxAgeDays !== rule.applicableMinAgeDays
  ) {
    candidates.push(addDays(birth, rule.applicableMaxAgeDays));
  }
  if (candidates.length === 0) {
    candidates.push(addDays(birth, minDays));
  }

  for (const due of candidates) {
    if (due >= yearStart && due <= yearEnd) {
      dates.push(toIsoDate(due));
    }
  }

  return dates;
}
