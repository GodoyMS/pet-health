import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../api/authApi";

export const CURRENT_ADMIN_QUERY_KEY = ["auth", "me"] as const;

export function useAdminAuth() {
  const query = useQuery({
    queryKey: CURRENT_ADMIN_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  return {
    user: query.data,
    isAdmin: query.data?.role === "admin",
    isLoading: query.isLoading,
    isError: query.isError
  };
}

export function useResetAdminAuth() {
  const queryClient = useQueryClient();
  return () => queryClient.removeQueries({ queryKey: CURRENT_ADMIN_QUERY_KEY });
}
