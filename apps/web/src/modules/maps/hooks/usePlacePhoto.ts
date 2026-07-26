import { useQuery } from "@tanstack/react-query";

import { nearbyPlacesApi } from "../api/nearbyPlacesApi";

/**
 * Lazily resolve a Places photo reference to an embeddable URL. Only runs when
 * `photoRef` is present and `enabled` (i.e. the place's card is actually open),
 * so we don't spend a photo lookup on every marker in the list.
 */
export function usePlacePhoto(photoRef: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["place-photo", photoRef],
    enabled: enabled && !!photoRef,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: 1,
    queryFn: async () => {
      const res = await nearbyPlacesApi.resolvePhoto(photoRef as string, 640);
      return res.data.url;
    }
  });
}
