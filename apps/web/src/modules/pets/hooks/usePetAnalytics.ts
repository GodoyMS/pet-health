import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "../api/analyticsApi";

export const usePetAnalytics = (petId: string | undefined) => {
  return useQuery({
    queryKey: ["pets", petId, "analytics"],
    queryFn: async () => {
      const response = await analyticsApi.get(petId!);
      return response.data;
    },
    enabled: Boolean(petId)
  });
};
