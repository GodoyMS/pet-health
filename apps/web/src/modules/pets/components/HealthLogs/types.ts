export type HealthRating = 1 | 2 | 3 | 4 | 5;

export type HealthLogEntry = {
  id: string;
  date: string;
  weightKg: number;
  appetite: HealthRating;
  energy: HealthRating;
  mood: HealthRating;
  notes: string;
};

export type HealthLogDraft = Omit<HealthLogEntry, "id">;
