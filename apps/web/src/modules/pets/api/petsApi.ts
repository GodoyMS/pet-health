import { httpClient } from "@shared/api/httpClient";

export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface BreedSummary {
  id: string;
  name: string;
}

export interface PetDTO {
  id: string;
  ownerId: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  weightKg: number | null;
  expectedLifeSpanYears: number | null;
}

export interface CreatePetPayload {
  name: string;
  speciesId: string;
  breedId: string;
  birthDate: string;
  weightKg: number;
  expectedLifeSpanYears?: number | null;
}

export const petsApi = {
  list() {
    return httpClient.get<PetDTO[]>("/pets");
  },
  get(id: string) {
    return httpClient.get<PetDTO>(`/pets/${id}`);
  },
  create(payload: CreatePetPayload) {
    return httpClient.post<PetDTO>("/pets", payload);
  },
  delete(id: string) {
    return httpClient.delete<void>(`/pets/${id}`);
  }
};
