import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { neighbourhoodApi } from "../api/neighbourhoodApi";
import { petFriendshipsApi } from "../api/petFriendshipsApi";
import { neighbourhoodKeys } from "./queryKeys";

/**
 * How often the map re-checks who's around. Pet locations change on the order
 * of minutes, so this is deliberately unhurried; it is also the single place to
 * swap in a socket transport later without touching any component.
 */
export const NEARBY_POLL_MS = 15_000;
const INBOX_POLL_MS = 30_000;

/** The signed-in user's pets, their pins, and their badge counts. */
export function useMyNeighbourhoodPets() {
  return useQuery({
    queryKey: neighbourhoodKeys.myPets(),
    queryFn: async () => (await neighbourhoodApi.myPets()).data.pets,
    staleTime: 10_000
  });
}

export function useOwnerLocation() {
  return useQuery({
    queryKey: neighbourhoodKeys.ownerLocation(),
    queryFn: async () => (await neighbourhoodApi.ownerLocation()).data.location,
    staleTime: 30_000
  });
}

/**
 * Pets around the active pet. `keepPreviousData` means switching pets or
 * nudging the radius never blanks the map — the old pins stay until the new
 * ones land.
 */
export function useNearbyPets(petId: string | undefined, radius: number) {
  return useQuery({
    queryKey: neighbourhoodKeys.nearby(petId ?? "none", radius),
    enabled: Boolean(petId),
    queryFn: async () => (await neighbourhoodApi.nearby(petId as string, radius)).data.pets,
    placeholderData: keepPreviousData,
    refetchInterval: NEARBY_POLL_MS,
    staleTime: NEARBY_POLL_MS
  });
}

/** Pending requests across every pet the user owns. */
export function useFriendshipInbox() {
  return useQuery({
    queryKey: neighbourhoodKeys.inbox(),
    queryFn: async () => (await petFriendshipsApi.inbox()).data,
    refetchInterval: INBOX_POLL_MS,
    staleTime: 10_000
  });
}

/**
 * All accepted friendships across every pet the user owns — the same scope as
 * the inbox, so the sidebar's three tabs always describe one set of pets.
 * Narrowing to a single pet is a client-side filter, which keeps switching
 * scope instant.
 */
export function useFriendships() {
  return useQuery({
    queryKey: neighbourhoodKeys.friends(),
    queryFn: async () => (await petFriendshipsApi.friends()).data.friends,
    staleTime: 30_000
  });
}
