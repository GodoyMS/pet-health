import type { LifestyleRuleType } from "./lifestyle-rule-type.enum";

/** Domain model for breed-scoped lifestyle guidance (read-only in the app). */
export class LifestyleRule {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly speciesId: string,
    public readonly breedId: string,
    public readonly type: LifestyleRuleType,
    public readonly applicableMinAgeDays: number | null,
    public readonly applicableMaxAgeDays: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
