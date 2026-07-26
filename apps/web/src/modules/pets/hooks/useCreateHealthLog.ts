import { useMutation, useQueryClient } from "@tanstack/react-query";

import { healthLogsApi } from "../api/healthLogsApi";
import type { HealthLogDraft } from "../components/HealthLogs/types";

export function useCreateHealthLog(petId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: HealthLogDraft) => {
      const res = await healthLogsApi.create(petId!, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pets", petId, "health-logs"]
      });
      queryClient.invalidateQueries({
        queryKey: ["pets", petId, "analytics"]
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
