import type { LifestyleRuleOrmEntity } from "../../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import {
  formatLifestyleValidFor,
  formatPetAgeLabel,
  petAgeDays,
  ruleMatchesPetAge
} from "./lifestyle-age";

function rule(
  partial: Partial<LifestyleRuleOrmEntity>
): LifestyleRuleOrmEntity {
  return {
    applicableMinAgeDays: null,
    applicableMaxAgeDays: null,
    ...partial
  } as LifestyleRuleOrmEntity;
}

describe("lifestyle-age", () => {
  it("computes whole days since birth", () => {
    const today = new Date();
    const birth = new Date(today);
    birth.setDate(birth.getDate() - 30);
    const iso = birth.toISOString().slice(0, 10);
    expect(petAgeDays(iso)).toBeGreaterThanOrEqual(29);
    expect(petAgeDays(iso)).toBeLessThanOrEqual(31);
  });

  it("formats pet age and valid-for labels", () => {
    expect(formatPetAgeLabel(30)).toBe("30 days old");
    expect(formatLifestyleValidFor(0, 120)).toBe(
      "Valid from birth to about 4 months of age"
    );
    expect(formatLifestyleValidFor(365, null)).toBe(
      "Valid from about 1 year of age onward"
    );
    expect(formatLifestyleValidFor(null, null)).toBe("Valid at all ages");
  });

  it("matches rules within age window", () => {
    expect(
      ruleMatchesPetAge(
        rule({ applicableMinAgeDays: 0, applicableMaxAgeDays: 60 }),
        30
      )
    ).toBe(true);
    expect(
      ruleMatchesPetAge(
        rule({ applicableMinAgeDays: 0, applicableMaxAgeDays: 60 }),
        90
      )
    ).toBe(false);
    expect(
      ruleMatchesPetAge(rule({ applicableMinAgeDays: 365 }), 30)
    ).toBe(false);
  });
});
