import { useQuery } from "@tanstack/react-query";

import {
  healthLogsApi,
  mapPaginatedHealthLogs,
  type ListHealthLogsParams
} from "../api/healthLogsApi";

export function usePetHealthLogs(
  petId: string | undefined,
  params: ListHealthLogsParams = {}
) {
  const { page = 1, limit = 10, startDate, endDate } = params;

  return useQuery({
    queryKey: ["pets", petId, "health-logs", page, limit, startDate, endDate],
    enabled: Boolean(petId),
    queryFn: async () => {
      const res = await healthLogsApi.list(petId!, {
        page,
        limit,
        startDate,
        endDate
      });
      return mapPaginatedHealthLogs(res.data);
    }
  });
}
