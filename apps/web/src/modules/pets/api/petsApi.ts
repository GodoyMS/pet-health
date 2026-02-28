import { httpClient } from "@shared/api/httpClient";

export interface PetDTO {
  id: string;
  name: string;
  species: string;
  age?: number;
}

export interface CreatePetPayload {
  name: string;
  species: string;
  age?: number;
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

