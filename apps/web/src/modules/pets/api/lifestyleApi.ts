import { httpClient } from "@shared/api/httpClient";

export type LifestyleCategory =
  | "exercise"
  | "feeding_awareness"
  | "food_safety";

export interface LifestyleGuidanceItem {
  id: string;
  title: string;
  description: string;
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
  validForLabel: string;
}

export interface LifestyleTab {
  key: LifestyleCategory;
  title: string;
  icon: string;
  items: LifestyleGuidanceItem[];
}

export interface PetLifestyleGuidance {
  petId: string;
  speciesName: string;
  breedName: string | null;
  petAgeDays: number;
  petAgeLabel: string;
  tabs: LifestyleTab[];
}

export const lifestyleApi = {
  getGuidance(petId: string) {
    return httpClient.get<PetLifestyleGuidance>(`/pets/${petId}/lifestyle`);
  }
};
