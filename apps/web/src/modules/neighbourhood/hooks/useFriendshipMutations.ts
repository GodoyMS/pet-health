import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "@repo/ui";

import {
  petFriendshipsApi,
  type FriendshipAction,
  type FriendshipInbox
} from "../api/petFriendshipsApi";
import { neighbourhoodKeys } from "./queryKeys";

/** Surface the API's own message ("already friends", …) when it sent one. */
function messageFrom(err: unknown, fallback: string): string {
  const detail = (err as AxiosError<{ message?: string | string[] }>)?.response
    ?.data?.message;
  if (Array.isArray(detail)) return detail[0] ?? fallback;
  return detail ?? fallback;
}

const ACTION_TOAST: Record<FriendshipAction, string> = {
  accept: "You're now friends!",
  reject: "Request declined.",
  cancel: "Request withdrawn.",
  unfriend: "Friendship removed."
};

export function useFriendshipMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.inbox() });
    void queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.nearbyAll() });
    void queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.myPets() });
    void queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.friends() });
  };

  const sendRequest = useMutation({
    mutationFn: async ({
      requesterPetId,
      addresseePetId
    }: {
      requesterPetId: string;
      addresseePetId: string;
    }) =>
      (await petFriendshipsApi.request(requesterPetId, addresseePetId)).data
        .friendship,
    onSuccess: () => toast.success("Friend request sent!"),
    onError: (err) =>
      toast.error(messageFrom(err, "Couldn't send that request.")),
    onSettled: invalidate
  });

  /**
   * Responding to a request removes it from the inbox optimistically, so the
   * card disappears the instant it's actioned rather than after a round-trip.
   */
  const respond = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: FriendshipAction }) =>
      (await petFriendshipsApi.act(id, action)).data.friendship,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: neighbourhoodKeys.inbox() });
      const previous = queryClient.getQueryData<FriendshipInbox>(
        neighbourhoodKeys.inbox()
      );

      queryClient.setQueryData<FriendshipInbox>(
        neighbourhoodKeys.inbox(),
        (inbox) =>
          inbox && {
            incoming: inbox.incoming.filter((r) => r.id !== id),
            outgoing: inbox.outgoing.filter((r) => r.id !== id)
          }
      );

      return () => {
        if (previous) {
          queryClient.setQueryData(neighbourhoodKeys.inbox(), previous);
        }
      };
    },
    onSuccess: (_data, { action }) => toast.success(ACTION_TOAST[action]),
    onError: (err, _vars, rollback) => {
      rollback?.();
      toast.error(messageFrom(err, "Couldn't complete that action."));
    },
    onSettled: invalidate
  });

  return { sendRequest, respond };
}
