import { useMutation, useQueryClient } from "@tanstack/react-query";

import { preventiveCareApi } from "../api/preventiveCareApi";

export function useTogglePreventiveCareItem(petId: string | undefined, year?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await preventiveCareApi.toggleItem(petId!, itemId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pets", petId, "preventive-care", year]
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
