import type { LifestyleRuleOrmEntity } from "../../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";

/** Whole days since birth (UTC noon anchor for date-only strings). */
export function petAgeDays(birthDate: string): number {
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  return Math.floor((now.getTime() - birth.getTime()) / (24 * 60 * 60 * 1000));
}

/** Short label for a day count (e.g. "about 4 months", "about 2 years"). */
export function formatAgeMilestone(days: number): string {
  if (days <= 0) return "birth";
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `about ${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30));
    return `about ${months} month${months === 1 ? "" : "s"}`;
  }
  const years = Math.max(1, Math.round(days / 365));
  return `about ${years} year${years === 1 ? "" : "s"}`;
}

/** Human-readable pet age for lifestyle context (e.g. "30 days old"). */
export function formatPetAgeLabel(ageDays: number): string {
  if (ageDays < 0) return "unknown age";
  if (ageDays === 0) return "newborn (0 days old)";
  if (ageDays === 1) return "1 day old";
  if (ageDays < 14) return `${ageDays} days old`;
  if (ageDays < 60) {
    const weeks = Math.floor(ageDays / 7);
    const rem = ageDays % 7;
    if (rem === 0 && weeks > 0) {
      return `${weeks} week${weeks === 1 ? "" : "s"} old`;
    }
    return `${ageDays} days old`;
  }
  if (ageDays < 365) {
    const months = Math.max(1, Math.round(ageDays / 30));
    return `about ${months} month${months === 1 ? "" : "s"} old`;
  }
  const years = Math.floor(ageDays / 365);
  const remDays = ageDays % 365;
  if (remDays < 45) {
    return `${years} year${years === 1 ? "" : "s"} old`;
  }
  const months = Math.round(remDays / 30);
  if (months <= 0) {
    return `${years} year${years === 1 ? "" : "s"} old`;
  }
  return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"} old`;
}

/** When a lifestyle tip applies, based on rule age window. */
export function formatLifestyleValidFor(
  applicableMinAgeDays: number | null,
  applicableMaxAgeDays: number | null
): string {
  if (applicableMinAgeDays == null && applicableMaxAgeDays == null) {
    return "Valid at all ages";
  }
  if (applicableMinAgeDays == null && applicableMaxAgeDays != null) {
    return `Valid until ${formatAgeMilestone(applicableMaxAgeDays)} of age`;
  }
  if (applicableMinAgeDays != null && applicableMaxAgeDays == null) {
    return `Valid from ${formatAgeMilestone(applicableMinAgeDays)} of age onward`;
  }
  return `Valid from ${formatAgeMilestone(applicableMinAgeDays!)} to ${formatAgeMilestone(applicableMaxAgeDays!)} of age`;
}

export function ruleMatchesPetAge(
  rule: Pick<
    LifestyleRuleOrmEntity,
    "applicableMinAgeDays" | "applicableMaxAgeDays"
  >,
  ageDays: number
): boolean {
  if (
    rule.applicableMinAgeDays != null &&
    ageDays < rule.applicableMinAgeDays
  ) {
    return false;
  }
  if (
    rule.applicableMaxAgeDays != null &&
    ageDays > rule.applicableMaxAgeDays
  ) {
    return false;
  }
  return true;
}
