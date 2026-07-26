/**
 * Pure friendship rules — no database, no Nest, no I/O.
 *
 * A single row represents both a request and, once accepted, the friendship
 * itself. Keeping the state machine here means every transition and
 * authorization rule is unit-testable in isolation from persistence.
 */

export type FriendshipStatus = "pending" | "accepted" | "rejected" | "cancelled";

export const FRIENDSHIP_STATUSES: FriendshipStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled"
];

export type FriendshipAction = "accept" | "reject" | "cancel" | "unfriend";

export const FRIENDSHIP_ACTIONS: FriendshipAction[] = [
  "accept",
  "reject",
  "cancel",
  "unfriend"
];

/** Which side of the row the acting user's pet sits on. */
export type FriendshipActor = "requester" | "addressee";

export type TransitionResult =
  | { ok: true; next: FriendshipStatus }
  | { ok: false; reason: string };

/**
 * Direction-independent identity for a pair of pets.
 *
 * Sorting the two ids means "A asked B" and "B asked A" collapse to the same
 * key. Backed by a unique index, this makes duplicate friendships impossible
 * at the database level even under concurrent requests.
 */
export function friendshipPairKey(petIdA: string, petIdB: string): string {
  return [petIdA, petIdB].sort().join(":");
}

/**
 * A request may be created (or an old row revived) only between two distinct
 * pets belonging to different owners. Pets in the same household already share
 * a home, so allowing them to "friend" would clutter the inbox with noise.
 */
export function validateRequestPair(input: {
  requesterPetId: string;
  addresseePetId: string;
  sameOwner: boolean;
}): { ok: true } | { ok: false; reason: string } {
  if (input.requesterPetId === input.addresseePetId) {
    return { ok: false, reason: "A pet cannot befriend itself" };
  }
  if (input.sameOwner) {
    return { ok: false, reason: "These pets already share the same owner" };
  }
  return { ok: true };
}

/** Statuses from which a brand-new request may be sent for the same pair. */
export function canReRequest(status: FriendshipStatus): boolean {
  return status === "rejected" || status === "cancelled";
}

/**
 * Apply an action to an existing friendship row.
 *
 * Authorization is part of the transition, not a separate check: accepting is
 * only ever meaningful for the addressee, cancelling only for the requester.
 */
export function applyAction(input: {
  current: FriendshipStatus;
  action: FriendshipAction;
  actor: FriendshipActor;
}): TransitionResult {
  const { current, action, actor } = input;

  switch (action) {
    case "accept":
    case "reject": {
      if (current !== "pending") {
        return { ok: false, reason: `This request is already ${current}` };
      }
      if (actor !== "addressee") {
        return { ok: false, reason: "Only the invited pet's owner can respond" };
      }
      return { ok: true, next: action === "accept" ? "accepted" : "rejected" };
    }

    case "cancel": {
      if (current !== "pending") {
        return { ok: false, reason: `This request is already ${current}` };
      }
      if (actor !== "requester") {
        return { ok: false, reason: "Only the requesting pet's owner can cancel" };
      }
      return { ok: true, next: "cancelled" };
    }

    case "unfriend": {
      if (current !== "accepted") {
        return { ok: false, reason: "These pets are not friends" };
      }
      // Either side may end a friendship.
      return { ok: true, next: "cancelled" };
    }

    default: {
      const exhaustive: never = action;
      return { ok: false, reason: `Unknown action: ${String(exhaustive)}` };
    }
  }
}
