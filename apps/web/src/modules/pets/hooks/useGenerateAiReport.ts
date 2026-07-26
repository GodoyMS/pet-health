import { useMutation, useQueryClient } from "@tanstack/react-query";

import { aiSummaryApi } from "../api/aiSummaryApi";

export function useGenerateAiReport(petId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await aiSummaryApi.generate(petId!);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets", petId, "ai-reports"] });
      queryClient.invalidateQueries({ queryKey: ["pets", petId] });
    }
  });
}
