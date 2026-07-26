import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui";

import {
  neighbourhoodApi,
  type MyNeighbourhoodPet,
  type PetLocationView
} from "../api/neighbourhoodApi";
import { neighbourhoodKeys } from "./queryKeys";

interface MovePetInput {
  petId: string;
  lat: number;
  lng: number;
}

/**
 * The three ways a pet's pin can move: drag/drop it, re-attach it to the
 * owner, or move the owner (which drags every following pet along).
 *
 * Each mutation writes the new position into the cache immediately so the pin
 * lands under the cursor at click time, and rolls back with a toast if the
 * request fails.
 */
export function usePetLocationMutations() {
  const queryClient = useQueryClient();

  /** Patch one pet's location in the tab-bar cache, returning a rollback fn. */
  const patchPetLocation = async (
    petId: string,
    patch: Partial<PetLocationView>
  ) => {
    await queryClient.cancelQueries({ queryKey: neighbourhoodKeys.myPets() });
    const previous = queryClient.getQueryData<MyNeighbourhoodPet[]>(
      neighbourhoodKeys.myPets()
    );

    queryClient.setQueryData<MyNeighbourhoodPet[]>(
      neighbourhoodKeys.myPets(),
      (pets) =>
        pets?.map((pet) =>
          pet.id === petId && pet.location
            ? { ...pet, location: { ...pet.location, ...patch } }
            : pet
        )
    );

    return () => {
      if (previous) {
        queryClient.setQueryData(neighbourhoodKeys.myPets(), previous);
      }
    };
  };

  const settle = () => {
    void queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.myPets() });
    void queryClient.invalidateQueries({ queryKey: neighbourhoodKeys.nearbyAll() });
  };

  const movePet = useMutation({
    mutationFn: async ({ petId, lat, lng }: MovePetInput) =>
      (await neighbourhoodApi.setPetLocation(petId, lat, lng)).data.location,
    onMutate: async ({ petId, lat, lng }) =>
      patchPetLocation(petId, { lat, lng, source: "manual" }),
    onError: (_err, _vars, rollback) => {
      rollback?.();
      toast.error("Couldn't move that pet. Please try again.");
    },
    onSettled: settle
  });

  const followOwner = useMutation({
    mutationFn: async (petId: string) =>
      (await neighbourhoodApi.followOwner(petId)).data.location,
    onMutate: async (petId) => patchPetLocation(petId, { source: "inherited" }),
    onError: (_err, _vars, rollback) => {
      rollback?.();
      toast.error("Couldn't follow your location. Please try again.");
    },
    onSuccess: () => toast.success("This pet now follows your location."),
    onSettled: settle
  });

  const setDiscoverability = useMutation({
    mutationFn: async ({
      petId,
      isDiscoverable
    }: {
      petId: string;
      isDiscoverable: boolean;
    }) =>
      (await neighbourhoodApi.setDiscoverability(petId, isDiscoverable)).data
        .location,
    onMutate: async ({ petId, isDiscoverable }) =>
      patchPetLocation(petId, { isDiscoverable }),
    onError: (_err, _vars, rollback) => {
      rollback?.();
      toast.error("Couldn't update visibility. Please try again.");
    },
    onSuccess: (location) =>
      toast.success(
        location.isDiscoverable
          ? "This pet is visible to neighbours."
          : "This pet is now hidden from neighbours."
      ),
    onSettled: settle
  });

  /**
   * Anchor the owner. The API responds with the whole pet list because every
   * pet still set to "inherited" moved too, so we seed the cache from it
   * rather than refetching.
   */
  const setOwnerLocation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) =>
      (await neighbourhoodApi.setOwnerLocation(lat, lng)).data.pets,
    onSuccess: (pets) => {
      queryClient.setQueryData(neighbourhoodKeys.myPets(), pets);
      void queryClient.invalidateQueries({
        queryKey: neighbourhoodKeys.ownerLocation()
      });
      void queryClient.invalidateQueries({
        queryKey: neighbourhoodKeys.nearbyAll()
      });
    }
  });

  return { movePet, followOwner, setDiscoverability, setOwnerLocation };
}
