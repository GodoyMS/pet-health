import { httpClient } from "@shared/api/httpClient";

import type { FriendshipStatus, SpeciesSummary } from "./neighbourhoodApi";

export type FriendshipAction = "accept" | "reject" | "cancel" | "unfriend";

export interface PetSummaryView {
  id: string;
  name: string;
  species: SpeciesSummary;
  ownerName: string;
}

export interface FriendshipRequestView {
  id: string;
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
  /** The pet that asked. */
  requesterPet: PetSummaryView;
  /** The pet that was asked. */
  addresseePet: PetSummaryView;
  direction: "incoming" | "outgoing";
}

export interface FriendshipInbox {
  incoming: FriendshipRequestView[];
  outgoing: FriendshipRequestView[];
}

export interface PetFriendView {
  id: string;
  name: string;
  species: SpeciesSummary;
  ownerName: string;
}

export const petFriendshipsApi = {
  inbox() {
    return httpClient.get<FriendshipInbox>("/pet-friendships/inbox");
  },

  friendsOf(petId: string) {
    return httpClient.get<{ friends: PetFriendView[] }>(
      `/pet-friendships/pets/${petId}/friends`
    );
  },

  request(requesterPetId: string, addresseePetId: string) {
    return httpClient.post<{ friendship: FriendshipRequestView }>(
      "/pet-friendships",
      { requesterPetId, addresseePetId }
    );
  },

  act(id: string, action: FriendshipAction) {
    return httpClient.patch<{ friendship: FriendshipRequestView }>(
      `/pet-friendships/${id}`,
      { action }
    );
  }
};
