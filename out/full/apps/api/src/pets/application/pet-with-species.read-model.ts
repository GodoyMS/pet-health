/**
 * Read model for pet API responses. Includes embedded species details
 * so clients do not need to resolve speciesId separately.
 */
export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface PetWithSpecies {
  id: string;
  ownerId: string;
  name: string;
  species: SpeciesSummary;
  birthDate: string;
  breed: string;
  expectedLifeSpanYears: number | null;
}
