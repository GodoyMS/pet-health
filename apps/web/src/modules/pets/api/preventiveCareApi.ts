import { httpClient } from "@shared/api/httpClient";

export type PreventiveCareGroupKey = "vaccination" | "deworming" | "checklist";

export interface PreventiveCareScheduleItem {
  id: string;
  ruleId: string;
  title: string;
  dueDate: string;
  type: string;
  completedAt: string | null;
}

export interface PreventiveCareScheduleGroup {
  key: PreventiveCareGroupKey;
  title: string;
  subtitle: string;
  icon: string;
  items: PreventiveCareScheduleItem[];
}

export interface PetPreventiveCareSchedule {
  petId: string;
  speciesName: string;
  breedName: string | null;
  year: number;
  groups: PreventiveCareScheduleGroup[];
}

export const preventiveCareApi = {
  getSchedule(petId: string, year?: number) {
    return httpClient.get<PetPreventiveCareSchedule>(
      `/pets/${petId}/preventive-care`,
      { params: year != null ? { year } : undefined }
    );
  },

  toggleItem(petId: string, itemId: string) {
    return httpClient.patch<PreventiveCareScheduleItem>(
      `/pets/${petId}/preventive-care/items/${itemId}/toggle`
    );
  }
};
