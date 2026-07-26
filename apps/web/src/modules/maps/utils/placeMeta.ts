import type { NearbyPlaceType } from "../api/nearbyPlacesApi";

export interface CategoryMeta {
  label: string;
  /** Material Symbols icon name (matches @repo/ui <Icon />). */
  icon: string;
  /** Solid hex used for the map pin + accents. */
  color: string;
}

export const CATEGORY_META: Record<NearbyPlaceType, CategoryMeta> = {
  veterinary_care: { label: "Veterinary", icon: "stethoscope", color: "#0d9488" },
  pet_store: { label: "Pet store", icon: "storefront", color: "#7c3aed" }
};

export function formatDistance(meters: number | null): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

export function priceLevelToDollars(priceLevel: string | null): string | null {
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4
  };
  const level = priceLevel ? map[priceLevel] : undefined;
  if (level == null || level === 0) return null;
  return "$".repeat(level);
}
