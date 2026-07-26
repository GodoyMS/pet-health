import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "@repo/ui";

import type { UpdatePetPayload } from "../api/petsApi";
import { petsApi } from "../api/petsApi";

function getMutationErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Could not save changes. Try again.";
  }
  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (data?.message != null) {
    return Array.isArray(data.message)
      ? data.message.join(", ")
      : String(data.message);
  }
  return error.message || "Could not save changes.";
}

export function useUpdatePet(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePetPayload) => {
      const res = await petsApi.update(petId, payload);
      return res.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["pets"] });
      void queryClient.setQueryData(["pets", petId], data);
      toast.success("Pet profile updated");
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error));
    }
  });
}
