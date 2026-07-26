export type HealthRating = 1 | 2 | 3 | 4 | 5;

export class PetHealthLog {
  constructor(
    public readonly id: string,
    public readonly petId: string,
    public readonly logDate: string,
    public readonly weightKg: number,
    public readonly appetite: HealthRating,
    public readonly energy: HealthRating,
    public readonly mood: HealthRating,
    public readonly notes: string | null,
    public readonly createdAt: Date
  ) {}
}
