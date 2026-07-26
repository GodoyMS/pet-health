import { httpClient } from "@shared/api/httpClient";

export type LocationSource = "inherited" | "manual";

export type FriendshipStatus = "pending" | "accepted" | "rejected" | "cancelled";

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

/** One of my pets, as rendered in the tab bar. */
export interface MyNeighbourhoodPet {
  id: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  location: PetLocationView | null;
  friendCount: number;
  incomingRequestCount: number;
}

export interface NearbyFriendship {
  id: string;
  status: FriendshipStatus;
  direction: "outgoing" | "incoming";
}

/** Another owner's pet around the active pet. Coordinates are privacy-fuzzed. */
export interface NearbyPet {
  id: string;
  name: string;
  species: SpeciesSummary;
  breed: BreedSummary | null;
  birthDate: string;
  ownerName: string;
  location: { lat: number; lng: number };
  distanceMeters: number;
  isSameSpecies: boolean;
  friendship: NearbyFriendship | null;
}

export interface OwnerLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

export const neighbourhoodApi = {
  myPets() {
    return httpClient.get<{ pets: MyNeighbourhoodPet[] }>("/neighbourhood/pets");
  },

  ownerLocation() {
    return httpClient.get<{ location: OwnerLocation | null }>(
      "/neighbourhood/owner-location"
    );
  },

  /** Returns the refreshed pet list, since inherited pets move with the owner. */
  setOwnerLocation(lat: number, lng: number) {
    return httpClient.put<{ pets: MyNeighbourhoodPet[] }>(
      "/neighbourhood/owner-location",
      { lat, lng }
    );
  },

  setPetLocation(petId: string, lat: number, lng: number) {
    return httpClient.put<{ location: PetLocationView }>(
      `/neighbourhood/pets/${petId}/location`,
      { lat, lng }
    );
  },

  followOwner(petId: string) {
    return httpClient.post<{ location: PetLocationView }>(
      `/neighbourhood/pets/${petId}/location/follow-owner`
    );
  },

  setDiscoverability(petId: string, isDiscoverable: boolean) {
    return httpClient.patch<{ location: PetLocationView }>(
      `/neighbourhood/pets/${petId}/discoverability`,
      { isDiscoverable }
    );
  },

  nearby(petId: string, radius: number) {
    return httpClient.get<{ pets: NearbyPet[] }>(
      `/neighbourhood/pets/${petId}/nearby`,
      { params: { radius } }
    );
  }
};
