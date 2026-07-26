import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";
import type {
  FriendshipRequestView,
  PetFriendshipView
} from "../api/petFriendshipsApi";
import { FriendshipSidebar } from "./FriendshipSidebar";

const dog = { id: "sp-dog", name: "Dog", imageUrl: null };
const cat = { id: "sp-cat", name: "Cat", imageUrl: null };

const milo: MyNeighbourhoodPet = {
  id: "milo",
  name: "Milo",
  species: dog,
  breed: null,
  birthDate: "2022-01-01",
  location: {
    lat: 1,
    lng: 1,
    source: "inherited",
    isDiscoverable: true,
    updatedAt: new Date().toISOString()
  },
  friendCount: 1,
  incomingRequestCount: 1
};

const summary = (id: string, name: string, species = dog) => ({
  id,
  name,
  species,
  ownerName: "Sam"
});

/** A request addressed to one of my pets. */
const incomingFor = (myPetId: string, id: string): FriendshipRequestView => ({
  id,
  status: "pending",
  createdAt: new Date().toISOString(),
  respondedAt: null,
  requesterPet: summary(`other-${id}`, `Other ${id}`),
  addresseePet: summary(myPetId, myPetId === "milo" ? "Milo" : "Luna"),
  direction: "incoming"
});

const outgoingFrom = (myPetId: string, id: string): FriendshipRequestView => ({
  id,
  status: "pending",
  createdAt: new Date().toISOString(),
  respondedAt: null,
  requesterPet: summary(myPetId, myPetId === "milo" ? "Milo" : "Luna"),
  addresseePet: summary(`other-${id}`, `Other ${id}`),
  direction: "outgoing"
});

const friendshipOf = (myPetId: string, id: string): PetFriendshipView => ({
  id,
  myPet: summary(myPetId, myPetId === "milo" ? "Milo" : "Luna"),
  friendPet: summary(`friend-${id}`, `Friend ${id}`, cat),
  since: new Date().toISOString()
});

function renderSidebar(overrides: Partial<Parameters<typeof FriendshipSidebar>[0]> = {}) {
  const props = {
    incoming: [incomingFor("milo", "i1"), incomingFor("luna", "i2")],
    outgoing: [outgoingFrom("milo", "o1"), outgoingFrom("luna", "o2")],
    friends: [friendshipOf("milo", "f1"), friendshipOf("luna", "f2")],
    activePet: milo,
    hasMultiplePets: true,
    isLoading: false,
    isBusy: false,
    onRespond: vi.fn(),
    onCancel: vi.fn(),
    onUnfriend: vi.fn(),
    ...overrides
  };
  render(<FriendshipSidebar {...props} />);
  return props;
}

const tab = (name: RegExp) => screen.getByRole("tab", { name });

describe("FriendshipSidebar scope consistency", () => {
  it("shows all three tabs household-wide by default", () => {
    renderSidebar();

    // Every tab counts across both pets — the whole point of the fix.
    expect(tab(/requests/i)).toHaveTextContent("2");
    expect(tab(/sent/i)).toHaveTextContent("2");
    expect(tab(/friends/i)).toHaveTextContent("2");
  });

  it("narrows every tab to the active pet when scope is switched", () => {
    renderSidebar();

    fireEvent.click(screen.getByRole("button", { name: /milo only/i }));

    expect(tab(/requests/i)).toHaveTextContent("1");
    expect(tab(/sent/i)).toHaveTextContent("1");
    expect(tab(/friends/i)).toHaveTextContent("1");
  });

  it("keeps the friends tab consistent with the other tabs in both scopes", () => {
    renderSidebar();

    // All-pets scope: friends count matches the other aggregated tabs.
    const allScopeCounts = [
      tab(/requests/i).textContent,
      tab(/sent/i).textContent,
      tab(/friends/i).textContent
    ];
    expect(new Set(allScopeCounts.map((t) => t?.replace(/\D/g, "")))).toEqual(
      new Set(["2"])
    );

    fireEvent.click(screen.getByRole("button", { name: /milo only/i }));
    const activeScopeCounts = [
      tab(/requests/i).textContent,
      tab(/sent/i).textContent,
      tab(/friends/i).textContent
    ];
    expect(new Set(activeScopeCounts.map((t) => t?.replace(/\D/g, "")))).toEqual(
      new Set(["1"])
    );
  });

  it("filters the rendered friend rows, not just the count", () => {
    renderSidebar();
    fireEvent.click(tab(/friends/i));

    // Each name appears twice (visible label + the avatar's sr-only text).
    expect(screen.getAllByText("Friend f1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Friend f2").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /milo only/i }));
    expect(screen.getAllByText("Friend f1").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Friend f2")).toHaveLength(0);
  });

  it("hides the scope filter entirely for single-pet owners", () => {
    renderSidebar({ hasMultiplePets: false });
    expect(screen.queryByRole("button", { name: /for all pets/i })).not.toBeInTheDocument();
  });

  it("does not filter when the owner has only one pet", () => {
    renderSidebar({ hasMultiplePets: false });
    // Nothing is hidden even though some rows belong to another pet id.
    expect(tab(/requests/i)).toHaveTextContent("2");
  });
});

describe("FriendshipSidebar row attribution", () => {
  it("names which of my pets each incoming request concerns", () => {
    renderSidebar();
    const list = screen.getByRole("list");
    // The requester leads, and the card states the pet of mine involved.
    expect(within(list).getAllByText("Milo").length).toBeGreaterThan(0);
    expect(within(list).getAllByText("Luna").length).toBeGreaterThan(0);
  });

  it("names which of my pets each friendship belongs to", () => {
    renderSidebar();
    fireEvent.click(tab(/friends/i));

    const list = screen.getByRole("list");
    expect(within(list).getAllByText(/friends with/i)).toHaveLength(2);
  });
});

describe("FriendshipSidebar actions", () => {
  it("accepts and declines incoming requests", () => {
    const props = renderSidebar();

    fireEvent.click(screen.getAllByRole("button", { name: /accept/i })[0]);
    expect(props.onRespond).toHaveBeenCalledWith("i1", "accept");

    fireEvent.click(screen.getAllByRole("button", { name: /decline/i })[0]);
    expect(props.onRespond).toHaveBeenCalledWith("i1", "reject");
  });

  it("withdraws a sent request", () => {
    const props = renderSidebar();
    fireEvent.click(tab(/sent/i));

    fireEvent.click(screen.getAllByRole("button", { name: /withdraw/i })[0]);
    expect(props.onCancel).toHaveBeenCalledWith("o1");
  });

  it("removes a friendship from the friends tab", () => {
    const props = renderSidebar();
    fireEvent.click(tab(/friends/i));

    fireEvent.click(screen.getAllByRole("button", { name: /remove/i })[0]);
    expect(props.onUnfriend).toHaveBeenCalledWith("f1");
  });

  it("disables actions while a mutation is in flight", () => {
    renderSidebar({ isBusy: true });
    expect(screen.getAllByRole("button", { name: /accept/i })[0]).toBeDisabled();
  });

  it("shows a scope-aware empty state", () => {
    renderSidebar({ incoming: [] });
    expect(screen.getByText(/no pending requests/i)).toBeInTheDocument();
  });
});
