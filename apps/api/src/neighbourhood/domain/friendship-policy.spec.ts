import {
  applyAction,
  canReRequest,
  friendshipPairKey,
  validateRequestPair,
  type FriendshipAction,
  type FriendshipActor,
  type FriendshipStatus
} from "./friendship-policy";

describe("friendshipPairKey", () => {
  it("is identical regardless of argument order", () => {
    expect(friendshipPairKey("bbb", "aaa")).toBe(friendshipPairKey("aaa", "bbb"));
  });

  it("sorts the ids so the key is canonical", () => {
    expect(friendshipPairKey("bbb", "aaa")).toBe("aaa:bbb");
  });

  it("keeps distinct pairs distinct", () => {
    expect(friendshipPairKey("a", "b")).not.toBe(friendshipPairKey("a", "c"));
  });
});

describe("validateRequestPair", () => {
  it("accepts two different pets from different owners", () => {
    expect(
      validateRequestPair({
        requesterPetId: "pet-1",
        addresseePetId: "pet-2",
        sameOwner: false
      })
    ).toEqual({ ok: true });
  });

  it("rejects a pet befriending itself", () => {
    const result = validateRequestPair({
      requesterPetId: "pet-1",
      addresseePetId: "pet-1",
      sameOwner: false
    });
    expect(result.ok).toBe(false);
  });

  it("rejects two pets in the same household", () => {
    const result = validateRequestPair({
      requesterPetId: "pet-1",
      addresseePetId: "pet-2",
      sameOwner: true
    });
    expect(result.ok).toBe(false);
  });
});

describe("canReRequest", () => {
  it("allows a fresh request after rejection or cancellation", () => {
    expect(canReRequest("rejected")).toBe(true);
    expect(canReRequest("cancelled")).toBe(true);
  });

  it("blocks a duplicate request while pending or already friends", () => {
    expect(canReRequest("pending")).toBe(false);
    expect(canReRequest("accepted")).toBe(false);
  });
});

describe("applyAction", () => {
  const act = (
    current: FriendshipStatus,
    action: FriendshipAction,
    actor: FriendshipActor
  ) => applyAction({ current, action, actor });

  describe("legal transitions", () => {
    it("the addressee accepts a pending request", () => {
      expect(act("pending", "accept", "addressee")).toEqual({
        ok: true,
        next: "accepted"
      });
    });

    it("the addressee rejects a pending request", () => {
      expect(act("pending", "reject", "addressee")).toEqual({
        ok: true,
        next: "rejected"
      });
    });

    it("the requester cancels their own pending request", () => {
      expect(act("pending", "cancel", "requester")).toEqual({
        ok: true,
        next: "cancelled"
      });
    });

    it("either side can end an accepted friendship", () => {
      expect(act("accepted", "unfriend", "requester")).toEqual({
        ok: true,
        next: "cancelled"
      });
      expect(act("accepted", "unfriend", "addressee")).toEqual({
        ok: true,
        next: "cancelled"
      });
    });
  });

  describe("authorization", () => {
    it("stops the requester from accepting their own request", () => {
      const result = act("pending", "accept", "requester");
      expect(result.ok).toBe(false);
    });

    it("stops the requester from rejecting their own request", () => {
      expect(act("pending", "reject", "requester").ok).toBe(false);
    });

    it("stops the addressee from cancelling someone else's request", () => {
      expect(act("pending", "cancel", "addressee").ok).toBe(false);
    });
  });

  describe("illegal source states", () => {
    it("cannot respond to a request that is no longer pending", () => {
      for (const status of ["accepted", "rejected", "cancelled"] as const) {
        expect(act(status, "accept", "addressee").ok).toBe(false);
        expect(act(status, "reject", "addressee").ok).toBe(false);
        expect(act(status, "cancel", "requester").ok).toBe(false);
      }
    });

    it("cannot unfriend pets that are not friends", () => {
      for (const status of ["pending", "rejected", "cancelled"] as const) {
        expect(act(status, "unfriend", "requester").ok).toBe(false);
      }
    });
  });

  it("never produces a state outside the known set", () => {
    const statuses: FriendshipStatus[] = [
      "pending",
      "accepted",
      "rejected",
      "cancelled"
    ];
    const actions: FriendshipAction[] = ["accept", "reject", "cancel", "unfriend"];
    const actors: FriendshipActor[] = ["requester", "addressee"];

    for (const current of statuses) {
      for (const action of actions) {
        for (const actor of actors) {
          const result = applyAction({ current, action, actor });
          if (result.ok) expect(statuses).toContain(result.next);
          else expect(typeof result.reason).toBe("string");
        }
      }
    }
  });
});
