import type { GeoPoint } from "../domain/pet-location.entity";

/**
 * Edge length of the privacy grid, in metres. Other owners see the centre of
 * the cell a pet occupies rather than its true position — enough to say "this
 * pet is around the block", never enough to identify a doorstep.
 */
export const FUZZ_GRID_METERS = 120;

const METERS_PER_LAT_DEGREE = 111_320;

/** Deterministic 32-bit hash so a pet's grid offset never changes. */
function hashToUnit(seed: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // >>> 0 keeps it unsigned; divide into [0, 1).
  return (h >>> 0) / 4294967296;
}

/**
 * Snap a coordinate to the centre of a per-pet privacy cell.
 *
 * Each pet gets its own grid origin (derived from its id), so cell boundaries
 * can't be correlated across pets to triangulate true positions. The result is
 * stable while the pet stays inside a cell, which is what keeps pins from
 * jittering between refreshes.
 */
export function fuzzLocation(petId: string, point: GeoPoint): GeoPoint {
  const latStep = FUZZ_GRID_METERS / METERS_PER_LAT_DEGREE;
  const latOffset = hashToUnit(petId, 1) * latStep;
  const lat = snap(point.lat, latStep, latOffset);

  // Cell width in degrees of longitude must be derived from the *snapped*
  // latitude. Deriving it from the raw latitude would make the longitude grid
  // slide continuously as the pet drifts north/south, so the output would
  // never actually quantise and every GPS tick would publish a new point.
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const lngStep =
    Math.abs(cosLat) < 1e-6
      ? 180
      : FUZZ_GRID_METERS / (METERS_PER_LAT_DEGREE * Math.abs(cosLat));
  const lngOffset = hashToUnit(petId, 2) * lngStep;

  return { lat, lng: snap(point.lng, lngStep, lngOffset) };
}

/** Centre of the cell containing `value` on a grid of `step`, shifted by `offset`. */
function snap(value: number, step: number, offset: number): number {
  const cell = Math.floor((value + offset) / step);
  return cell * step + step / 2 - offset;
}
