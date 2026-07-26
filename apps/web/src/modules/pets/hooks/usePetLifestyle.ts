import { useQuery } from "@tanstack/react-query";

import { lifestyleApi } from "../api/lifestyleApi";

export function usePetLifestyle(petId: string | undefined) {
  return useQuery({
    queryKey: ["pets", petId, "lifestyle"],
    enabled: Boolean(petId),
    queryFn: async () => {
      const res = await lifestyleApi.getGuidance(petId!);
      return res.data;
    }
  });
}
