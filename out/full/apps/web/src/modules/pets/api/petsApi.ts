import { httpClient } from "@shared/api/httpClient";

export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface PetDTO {
  id: string;
  ownerId: string;
  name: string;
  species: SpeciesSummary;
  birthDate: string;
  breed: string;
  expectedLifeSpanYears: number | null;
}

export interface CreatePetPayload {
  name: string;
  speciesId: string;
  birthDate: string;
  breed: string;
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
  }
};
