import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  nearbyPlacesApi,
  type NearbyPlaceType,
  type NearbySearchParams
} from "../api/nearbyPlacesApi";

interface UseNearbyPlacesArgs {
  lat: number | undefined;
  lng: number | undefined;
  radius: number;
  types: NearbyPlaceType[];
}

/**
 * Query nearby places for the current location. Coordinates are rounded into a
 * ~110m grid so tiny GPS jitter in live mode doesn't refetch on every update.
 */
export function useNearbyPlaces({ lat, lng, radius, types }: UseNearbyPlacesArgs) {
  const gridLat = lat != null ? Number(lat.toFixed(3)) : undefined;
  const gridLng = lng != null ? Number(lng.toFixed(3)) : undefined;
  const enabled = gridLat != null && gridLng != null;

  return useQuery({
    queryKey: ["nearby-places", gridLat, gridLng, radius, [...types].sort()],
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    queryFn: async () => {
      const params: NearbySearchParams = {
        lat: gridLat as number,
        lng: gridLng as number,
        radius,
        types
      };
      const res = await nearbyPlacesApi.search(params);
      return res.data.places;
    }
  });
}
