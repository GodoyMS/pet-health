/**
 * How a pet's coordinates are maintained.
 *
 * - `inherited` — the pet follows its owner's location. Whenever the owner
 *   updates their position, every inherited pet moves with them. This is the
 *   state every pet starts in.
 * - `manual` — the pet has been placed explicitly (pin drag, map click). Owner
 *   movement no longer affects it until the owner chooses "follow me" again.
 */
export type LocationSource = "inherited" | "manual";

export const LOCATION_SOURCES: LocationSource[] = ["inherited", "manual"];

export interface GeoPoint {
  lat: number;
  lng: number;
}

export class PetLocation {
  constructor(
    public readonly petId: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly source: LocationSource,
    /** When false the pet is hidden from every other owner's neighbourhood. */
    public readonly isDiscoverable: boolean,
    public readonly updatedAt: Date
  ) {}
}

export class OwnerLocation {
  constructor(
    public readonly userId: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly updatedAt: Date
  ) {}
}
