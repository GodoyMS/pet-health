import { PreventiveCareRuleType } from "../domain/preventive-care-rule-type.enum";

/**
 * One row to insert/update for a species during DB seeding.
 * Mirrors create payload fields except `speciesId` (filled at seed time).
 */
export interface PreventiveCareRuleSeedDefinition {
  title: string;
  type: PreventiveCareRuleType;
  applicableMinAgeDays?: number | null;
  applicableMaxAgeDays?: number | null;
  intervalDays?: number | null;
}

/**
 * Returns preventive-care rules to seed for a species.
 *
 * **Boilerplate:** branch on `speciesSlug` (see `SPECIES_SEED_DATA` slugs) and
 * return rule definitions. Currently returns no rows — extend the map or add
 * `switch (speciesSlug)` logic when you have real data.
 *
 * @param speciesSlug - Stable slug from species seed (e.g. `"dog"`, `"cat"`).
 * @param _speciesId - Species UUID; use when definitions need to vary by id.
 */
export function buildPreventiveCareRulesForSpecies(
  speciesSlug: string,
  _speciesId: string
): PreventiveCareRuleSeedDefinition[] {
  void _speciesId;

  const rulesBySlug: Partial<
    Record<string, readonly PreventiveCareRuleSeedDefinition[]>
  > = {
    // Example (uncomment and adjust when ready):
    // dog: [
    //   {
    //     title: "Core vaccines (puppy)",
    //     type: PreventiveCareRuleType.Vaccination,
    //     applicableMinAgeDays: 42,
    //     applicableMaxAgeDays: 112,
    //     intervalDays: 21
    //   }
    // ]
  };

  const fromMap = rulesBySlug[speciesSlug];
  if (fromMap?.length) {
    return [...fromMap];
  }

  return [];
}
