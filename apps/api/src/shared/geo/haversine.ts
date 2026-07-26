const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance in metres between two lat/lng points. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  /** True when the box wraps the antimeridian (minLng > maxLng). */
  wrapsAntimeridian: boolean;
}

/**
 * Latitude/longitude window that fully contains a circle of `radiusMeters`
 * around a point. Used as an index-friendly SQL prefilter before exact
 * haversine distances are computed in memory.
 *
 * Longitude degrees shrink with latitude, so the lng delta is scaled by
 * 1/cos(lat). Near the poles cos(lat) approaches zero, so the delta is clamped
 * to a full 180° sweep rather than exploding to infinity.
 */
export function boundingBox(
  lat: number,
  lng: number,
  radiusMeters: number
): BoundingBox {
  const latDelta = (radiusMeters / EARTH_RADIUS_M) * (180 / Math.PI);

  const cosLat = Math.cos(toRad(lat));
  const lngDelta =
    Math.abs(cosLat) < 1e-6
      ? 180
      : Math.min(180, latDelta / Math.abs(cosLat));

  const minLat = Math.max(-90, lat - latDelta);
  const maxLat = Math.min(90, lat + latDelta);

  // Poles or a radius wide enough to circle the globe: no useful lng filter.
  if (lngDelta >= 180) {
    return { minLat, maxLat, minLng: -180, maxLng: 180, wrapsAntimeridian: false };
  }

  const rawMin = lng - lngDelta;
  const rawMax = lng + lngDelta;
  const wrapsAntimeridian = rawMin < -180 || rawMax > 180;

  return {
    minLat,
    maxLat,
    minLng: normalizeLng(rawMin),
    maxLng: normalizeLng(rawMax),
    wrapsAntimeridian
  };
}

/** Wrap a longitude into the [-180, 180] range. */
export function normalizeLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}
