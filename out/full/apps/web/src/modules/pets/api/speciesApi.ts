import { httpClient } from "@shared/api/httpClient";

export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
}


export const speciesApi = {
  list() {
    return httpClient.get<SpeciesSummary[]>("/species");
  },
};
