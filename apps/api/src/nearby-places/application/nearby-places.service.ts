import {
  Injectable,
  Logger,
  ServiceUnavailableException
} from "@nestjs/common";

import { configEnvs } from "../../config/configEnvs";

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";

/** Place types we surface on the Nearby Care map. */
export type NearbyPlaceType = "veterinary_care" | "pet_store";

export const NEARBY_PLACE_TYPES: NearbyPlaceType[] = [
  "veterinary_care",
  "pet_store"
];

const RADIUS_MIN = 500;
const RADIUS_MAX = 50_000;
const RADIUS_DEFAULT = 5_000;
const MAX_RESULTS_PER_TYPE = 20;

/**
 * Field mask sent to the Places API (New). Requesting only what the UI renders
 * keeps the response small and the request in the cheaper SKU tier.
 */
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.currentOpeningHours.openNow",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.photos.name",
  "places.photos.widthPx",
  "places.photos.heightPx"
].join(",");

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
  /** Opaque Places photo resource name; resolve via `resolvePhoto`. */
  photoRef: string | null;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  types?: NearbyPlaceType[];
}

interface RawPlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  businessStatus?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  currentOpeningHours?: { openNow?: boolean };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: { name?: string }[];
}

@Injectable()
export class NearbyPlacesService {
  private readonly logger = new Logger(NearbyPlacesService.name);

  /**
   * Search for the nearest vets / pet stores around a coordinate. When several
   * types are requested we query each separately (the Places API ranks a single
   * type best), then merge, de-dupe, and sort by distance from the user.
   */
  async search(params: NearbySearchParams): Promise<NearbyPlace[]> {
    const apiKey = this.requireApiKey();
    const radius = this.clampRadius(params.radius);
    const types =
      params.types && params.types.length > 0 ? params.types : NEARBY_PLACE_TYPES;

    const batches = await Promise.all(
      types.map((type) =>
        this.searchOne(apiKey, params.lat, params.lng, radius, type)
      )
    );

    const byId = new Map<string, NearbyPlace>();
    for (const batch of batches) {
      for (const place of batch) {
        // Prefer the first hit; a vet listed under two types keeps its primary one.
        if (!byId.has(place.id)) byId.set(place.id, place);
      }
    }

    return Array.from(byId.values()).sort(
      (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity)
    );
  }

  private async searchOne(
    apiKey: string,
    lat: number,
    lng: number,
    radius: number,
    type: NearbyPlaceType
  ): Promise<NearbyPlace[]> {
    let response: Response;
    try {
      response = await fetch(PLACES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK
        },
        body: JSON.stringify({
          includedTypes: [type],
          maxResultCount: MAX_RESULTS_PER_TYPE,
          rankPreference: "DISTANCE",
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius
            }
          }
        })
      });
    } catch (err) {
      this.logger.error(`Places request failed (${type})`, err as Error);
      throw new ServiceUnavailableException("Nearby search is temporarily unavailable");
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      this.logger.error(
        `Places API error (${type}) status=${response.status} body=${detail.slice(0, 500)}`
      );
      throw new ServiceUnavailableException("Nearby search is temporarily unavailable");
    }

    const data = (await response.json()) as { places?: RawPlace[] };
    return (data.places ?? []).map((raw) => this.toNearbyPlace(raw, type, lat, lng));
  }

  private toNearbyPlace(
    raw: RawPlace,
    category: NearbyPlaceType,
    fromLat: number,
    fromLng: number
  ): NearbyPlace {
    const lat = raw.location?.latitude ?? null;
    const lng = raw.location?.longitude ?? null;

    return {
      id: raw.id,
      name: raw.displayName?.text ?? "Unnamed place",
      category,
      categoryLabel: raw.primaryTypeDisplayName?.text ?? null,
      address: raw.shortFormattedAddress ?? raw.formattedAddress ?? null,
      location: { lat: lat ?? 0, lng: lng ?? 0 },
      distanceMeters:
        lat != null && lng != null
          ? Math.round(haversineMeters(fromLat, fromLng, lat, lng))
          : null,
      rating: raw.rating ?? null,
      userRatingCount: raw.userRatingCount ?? null,
      priceLevel: raw.priceLevel ?? null,
      businessStatus: raw.businessStatus ?? null,
      openNow: raw.currentOpeningHours?.openNow ?? null,
      weekdayHours: raw.regularOpeningHours?.weekdayDescriptions ?? null,
      phone: raw.nationalPhoneNumber ?? raw.internationalPhoneNumber ?? null,
      websiteUri: raw.websiteUri ?? null,
      googleMapsUri: raw.googleMapsUri ?? null,
      photoRef: raw.photos?.[0]?.name ?? null
    };
  }

  /**
   * Resolve a Places photo resource name to a directly-embeddable image URL.
   * `skipHttpRedirect` makes the API return the final googleusercontent URI as
   * JSON (rather than a 302), so the browser can load it without the API key.
   */
  async resolvePhoto(photoName: string, maxWidthPx = 640): Promise<string> {
    const apiKey = this.requireApiKey();
    // photoName looks like "places/XXX/photos/YYY".
    const width = Math.min(Math.max(Math.round(maxWidthPx), 100), 1600);
    const url =
      `https://places.googleapis.com/v1/${encodeURI(photoName)}/media` +
      `?maxWidthPx=${width}&skipHttpRedirect=true&key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch (err) {
      this.logger.error("Places photo request failed", err as Error);
      throw new ServiceUnavailableException("Photo is temporarily unavailable");
    }

    if (!response.ok) {
      this.logger.error(`Places photo error status=${response.status}`);
      throw new ServiceUnavailableException("Photo is temporarily unavailable");
    }

    const data = (await response.json()) as { photoUri?: string };
    if (!data.photoUri) {
      throw new ServiceUnavailableException("Photo is temporarily unavailable");
    }
    return data.photoUri;
  }

  private clampRadius(radius?: number): number {
    if (radius == null || Number.isNaN(radius)) return RADIUS_DEFAULT;
    return Math.min(Math.max(radius, RADIUS_MIN), RADIUS_MAX);
  }

  private requireApiKey(): string {
    const key = configEnvs.GOOGLE_MAPS_API_KEY;
    if (!key) {
      throw new ServiceUnavailableException(
        "Nearby search is not configured (missing GOOGLE_MAPS_API_KEY)"
      );
    }
    return key;
  }
}

/** Great-circle distance in metres between two lat/lng points. */
function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
