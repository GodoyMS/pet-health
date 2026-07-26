import { PreventiveCareRuleType } from "../../preventive-care-rules/domain/preventive-care-rule-type.enum";
import type { PreventiveCareRuleOrmEntity } from "../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { computeDueDatesInYear } from "./preventive-care-due-dates";

function rule(partial: Partial<PreventiveCareRuleOrmEntity>): PreventiveCareRuleOrmEntity {
  return {
    id: "rule-1",
    title: "Test rule",
    type: PreventiveCareRuleType.Vaccination,
    applicableMinAgeDays: null,
    applicableMaxAgeDays: null,
    intervalDays: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial
  } as PreventiveCareRuleOrmEntity;
}

describe("computeDueDatesInYear", () => {
  it("generates every interval occurrence within the calendar year", () => {
    const dates = computeDueDatesInYear(
      "2025-01-01",
      rule({ applicableMinAgeDays: 56, intervalDays: 30 }),
      2026
    );
    expect(dates.length).toBeGreaterThan(10);
    expect(dates.every((d) => d.startsWith("2026-"))).toBe(true);
  });

  it("includes a one-off due date when it falls in the year", () => {
    const dates = computeDueDatesInYear(
      "2025-06-01",
      rule({ applicableMinAgeDays: 42 }),
      2025
    );
    expect(dates).toEqual(["2025-07-13"]);
  });

  it("returns empty when a one-off due date is outside the year", () => {
    const dates = computeDueDatesInYear(
      "2020-01-01",
      rule({ applicableMinAgeDays: 42 }),
      2026
    );
    expect(dates).toEqual([]);
  });
});
