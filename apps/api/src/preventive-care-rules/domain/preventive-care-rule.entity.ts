import type { PreventiveCareRuleType } from "./preventive-care-rule-type.enum";

/** Domain model for preventive care scheduling rules (species + breed scoped). */
export class PreventiveCareRule {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly speciesId: string,
    public readonly breedId: string,
    public readonly type: PreventiveCareRuleType,
    public readonly applicableMinAgeDays: number | null,
    public readonly applicableMaxAgeDays: number | null,
    public readonly intervalDays: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
