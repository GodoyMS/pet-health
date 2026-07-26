import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboardApi";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await dashboardApi.get();
      return response.data;
    }
  });
};
