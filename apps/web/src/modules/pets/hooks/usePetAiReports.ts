import { useQuery } from "@tanstack/react-query";

import { aiSummaryApi } from "../api/aiSummaryApi";

export function usePetAiReports(petId: string | undefined) {
  return useQuery({
    queryKey: ["pets", petId, "ai-reports"],
    enabled: Boolean(petId),
    queryFn: async () => {
      const res = await aiSummaryApi.list(petId!);
      return res.data;
    }
  });
}

export function usePetAiReport(
  petId: string | undefined,
  reportId: string | undefined
) {
  return useQuery({
    queryKey: ["pets", petId, "ai-reports", reportId],
    enabled: Boolean(petId && reportId),
    queryFn: async () => {
      const res = await aiSummaryApi.get(petId!, reportId!);
      return res.data;
    }
  });
}
