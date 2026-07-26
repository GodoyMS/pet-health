/**
 * Read model for pet API responses. Includes embedded species and breed details
 * so clients do not need to resolve IDs separately.
 */
export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface BreedSummary {
  id: string;
  name: string;
  expectedLifespanYears: number | null;
}

export interface PetWithSpecies {
  id: string;
  ownerId: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  weightKg: number | null;
  expectedLifeSpanYears: number | null;
  /** Latest AI wellness awareness score (0–100), null if no report generated yet. */
  awarenessScore: number | null;
}
