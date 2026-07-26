import { useQuery } from "@tanstack/react-query";

import { preventiveCareApi } from "../api/preventiveCareApi";

export function usePetPreventiveCare(
  petId: string | undefined,
  year = new Date().getFullYear()
) {
  return useQuery({
    queryKey: ["pets", petId, "preventive-care", year],
    enabled: Boolean(petId),
    queryFn: async () => {
      const res = await preventiveCareApi.getSchedule(petId!, year);
      return res.data;
    }
  });
}
