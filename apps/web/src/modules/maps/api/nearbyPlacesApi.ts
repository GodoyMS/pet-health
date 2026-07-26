import { httpClient } from "@shared/api/httpClient";

export type NearbyPlaceType = "veterinary_care" | "pet_store";

export interface NearbyPlace {
  id: string;
  name: string;
  category: NearbyPlaceType;
  categoryLabel: string | null;
  address: string | null;
  location: { lat: number; lng: number };
  distanceMeters: number | null;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: string | null;
  businessStatus: string | null;
  openNow: boolean | null;
  weekdayHours: string[] | null;
  phone: string | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  photoRef: string | null;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  types?: NearbyPlaceType[];
}

export const nearbyPlacesApi = {
  search(params: NearbySearchParams) {
    return httpClient.get<{ places: NearbyPlace[] }>("/nearby-places", {
      params: {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius,
        types: params.types?.length ? params.types.join(",") : undefined
      }
    });
  },

  resolvePhoto(name: string, maxWidthPx = 640) {
    return httpClient.get<{ url: string }>("/nearby-places/photo", {
      params: { name, maxWidthPx }
    });
  }
};
