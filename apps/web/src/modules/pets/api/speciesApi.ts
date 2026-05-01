import { httpClient } from "@shared/api/httpClient";

export interface BreedSummary {
  id: string;
  name: string;
}

export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  breeds: BreedSummary[];
}

export const speciesApi = {
  list() {
    return httpClient.get<SpeciesSummary[]>("/species");
  },
  listBreeds(speciesId: string) {
    return httpClient.get<BreedSummary[]>(`/species/${speciesId}/breeds`);
  }
};
