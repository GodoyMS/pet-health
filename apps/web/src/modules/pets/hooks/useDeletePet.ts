import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "@repo/ui";

import { petsApi } from "../api/petsApi";

function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return "Could not delete pet.";
  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (data?.message != null) {
    return Array.isArray(data.message) ? data.message.join(", ") : String(data.message);
  }
  return error.message || "Could not delete pet.";
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (petId: string) => {
      await petsApi.delete(petId);
    },
    onSuccess: (_void, petId) => {
      void queryClient.invalidateQueries({ queryKey: ["pets"] });
      void queryClient.removeQueries({ queryKey: ["pets", petId] });
      toast.success("Pet removed");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    }
  });
}
