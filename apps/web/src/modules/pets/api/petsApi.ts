import { httpClient } from "@shared/api/httpClient";

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

export interface PetDTO {
  id: string;
  ownerId: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  weightKg: number | null;
  expectedLifeSpanYears: number | null;
  awarenessScore: number | null;
}

export interface CreatePetPayload {
  name: string;
  speciesId: string;
  breedId: string;
  birthDate: string;
  weightKg: number;
  expectedLifeSpanYears?: number | null;
}

export type UpdatePetPayload = CreatePetPayload;

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
  update(id: string, payload: UpdatePetPayload) {
    return httpClient.patch<PetDTO>(`/pets/${id}`, payload);
  },
  delete(id: string) {
    return httpClient.delete<void>(`/pets/${id}`);
  }
};
