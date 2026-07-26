/**
 * Central query-key registry. Mutations invalidate through these helpers so a
 * key rename can never silently orphan a cache entry.
 */
export const neighbourhoodKeys = {
  all: ["neighbourhood"] as const,
  myPets: () => [...neighbourhoodKeys.all, "my-pets"] as const,
  ownerLocation: () => [...neighbourhoodKeys.all, "owner-location"] as const,
  nearby: (petId: string, radius: number) =>
    [...neighbourhoodKeys.all, "nearby", petId, radius] as const,
  /** Every nearby query regardless of pet or radius. */
  nearbyAll: () => [...neighbourhoodKeys.all, "nearby"] as const,
  inbox: () => [...neighbourhoodKeys.all, "inbox"] as const,
  friends: () => [...neighbourhoodKeys.all, "friends"] as const
};
