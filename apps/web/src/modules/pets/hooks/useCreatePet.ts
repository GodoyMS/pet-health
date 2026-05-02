import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "@repo/ui";

import type { CreatePetPayload } from "../api/petsApi";
import { petsApi } from "../api/petsApi";

function getMutationErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Could not create pet. Try again.";
  }
  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (data?.message != null) {
    return Array.isArray(data.message)
      ? data.message.join(", ")
      : String(data.message);
  }
  return error.message || "Could not create pet.";
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePetPayload) => {
      const res = await petsApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast.success("Pet created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getMutationErrorMessage(error));
    }
  });
}
