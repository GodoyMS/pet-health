/** Persisted preventive-care to-do row for a specific pet, rule, and due date. */
export class PreventiveCarePetItem {
  constructor(
    public readonly id: string,
    public readonly petId: string,
    public readonly preventiveCareRuleId: string,
    public readonly dueDate: string,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date
  ) {}
}
