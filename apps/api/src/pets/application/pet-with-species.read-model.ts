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
}

export interface PetWithSpecies {
  id: string;
  ownerId: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  expectedLifeSpanYears: number | null;
}
