import type { FriendshipStatus } from "../domain/friendship-policy";
import type { LocationSource } from "../domain/pet-location.entity";

export interface SpeciesSummary {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface BreedSummary {
  id: string;
  name: string;
}

export interface PetLocationView {
  lat: number;
  lng: number;
  source: LocationSource;
  isDiscoverable: boolean;
  updatedAt: string;
}

/** One of the signed-in user's own pets, as rendered in the pet tab bar. */
export interface MyNeighbourhoodPet {
  id: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  /** Null until the pet has been placed on the map. */
  location: PetLocationView | null;
  friendCount: number;
  /** Pending requests awaiting this pet's response. */
  incomingRequestCount: number;
}

/**
 * How the active pet relates to a nearby pet. `null` means no row exists yet,
 * so the only available action is to send a request.
 */
export interface NearbyFriendship {
  id: string;
  status: FriendshipStatus;
  /** Whether the active pet sent or received this request. */
  direction: "outgoing" | "incoming";
}

/** Another owner's pet, as shown on the map around the active pet. */
export interface NearbyPet {
  id: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  /** Display name only — never email or owner id. */
  ownerName: string;
  /** Privacy-fuzzed position; not the pet's true coordinates. */
  location: { lat: number; lng: number };
  /** Distance to the fuzzed position, so it agrees with what's on screen. */
  distanceMeters: number;
  isSameSpecies: boolean;
  friendship: NearbyFriendship | null;
}

export interface PetSummaryView {
  id: string;
  name: string;
  species: SpeciesSummary;
  ownerName: string;
}

/**
 * An accepted friendship, from the signed-in user's point of view.
 *
 * Both sides are named so the UI can always say *which* of the user's pets a
 * friendship belongs to — with several pets, "Rex is a friend" is ambiguous
 * without it.
 */
export interface PetFriendshipView {
  id: string;
  /** The user's own pet in this friendship. */
  myPet: PetSummaryView;
  /** The other owner's pet. */
  friendPet: PetSummaryView;
  /** When the request was accepted (falls back to creation time). */
  since: string;
}

/** A row in the friendship inbox. */
export interface FriendshipRequestView {
  id: string;
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
  /** The pet that asked. */
  requesterPet: PetSummaryView;
  /** The pet that was asked. */
  addresseePet: PetSummaryView;
  /** Which side belongs to the signed-in user. */
  direction: "incoming" | "outgoing";
}
