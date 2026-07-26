import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  FriendshipStatus,
  MyNeighbourhoodPet,
  NearbyPet
} from "../api/neighbourhoodApi";
import { NearbyPetPopover } from "./NearbyPetPopover";

const species = { id: "sp-dog", name: "Dog", imageUrl: null };

const activePet: MyNeighbourhoodPet = {
  id: "mine-1",
  name: "Milo",
  species,
  breed: null,
  birthDate: "2022-01-01",
  location: {
    lat: 1,
    lng: 1,
    source: "inherited",
    isDiscoverable: true,
    updatedAt: new Date().toISOString()
  },
  friendCount: 0,
  incomingRequestCount: 0
};

function nearbyPet(
  friendship: NearbyPet["friendship"],
  overrides: Partial<NearbyPet> = {}
): NearbyPet {
  return {
    id: "other-1",
    name: "Rex",
    species,
    breed: { id: "b1", name: "Beagle" },
    birthDate: "2021-06-01",
    ownerName: "Sam",
    location: { lat: 1.001, lng: 1.001 },
    distanceMeters: 240,
    isSameSpecies: true,
    friendship,
    ...overrides
  };
}

function renderPopover(pet: NearbyPet) {
  const handlers = {
    onClose: vi.fn(),
    onSendRequest: vi.fn(),
    onCancelRequest: vi.fn(),
    onRespond: vi.fn(),
    onUnfriend: vi.fn()
  };
  render(
    <NearbyPetPopover pet={pet} activePet={activePet} isBusy={false} {...handlers} />
  );
  return handlers;
}

const pending = (direction: "incoming" | "outgoing") => ({
  id: "f-1",
  status: "pending" as FriendshipStatus,
  direction
});

describe("NearbyPetPopover CTA state matrix", () => {
  it("offers to send a request when there is no friendship yet", () => {
    const handlers = renderPopover(nearbyPet(null));

    const button = screen.getByRole("button", { name: /send friend request/i });
    fireEvent.click(button);

    expect(handlers.onSendRequest).toHaveBeenCalledOnce();
  });

  it("offers to withdraw an outgoing pending request", () => {
    const handlers = renderPopover(nearbyPet(pending("outgoing")));

    expect(screen.getByText(/request sent/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /send friend request/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /withdraw/i }));
    expect(handlers.onCancelRequest).toHaveBeenCalledWith("f-1");
  });

  it("offers accept and decline for an incoming pending request", () => {
    const handlers = renderPopover(nearbyPet(pending("incoming")));

    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    expect(handlers.onRespond).toHaveBeenCalledWith("f-1", "accept");

    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(handlers.onRespond).toHaveBeenCalledWith("f-1", "reject");
  });

  it("shows the friendship and allows removing it once accepted", () => {
    const handlers = renderPopover(
      nearbyPet({ id: "f-1", status: "accepted", direction: "outgoing" })
    );

    expect(screen.getByText(/friends with milo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(handlers.onUnfriend).toHaveBeenCalledWith("f-1");
  });

  it("treats a rejected row as re-requestable", () => {
    renderPopover(
      nearbyPet({ id: "f-1", status: "rejected", direction: "outgoing" })
    );
    expect(
      screen.getByRole("button", { name: /send friend request/i })
    ).toBeInTheDocument();
  });

  it("disables the action while a mutation is in flight", () => {
    render(
      <NearbyPetPopover
        pet={nearbyPet(null)}
        activePet={activePet}
        isBusy
        onClose={vi.fn()}
        onSendRequest={vi.fn()}
        onCancelRequest={vi.fn()}
        onRespond={vi.fn()}
        onUnfriend={vi.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: /send friend request/i })
    ).toBeDisabled();
  });
});

describe("NearbyPetPopover details", () => {
  it("shows distance, owner, and species relationship", () => {
    renderPopover(nearbyPet(null));

    expect(screen.getByText("240 m")).toBeInTheDocument();
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Same")).toBeInTheDocument();
  });

  it("marks a different species accordingly", () => {
    renderPopover(
      nearbyPet(null, {
        isSameSpecies: false,
        species: { id: "sp-cat", name: "Cat", imageUrl: null }
      })
    );
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("closes from the header button", () => {
    const handlers = renderPopover(nearbyPet(null));
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(handlers.onClose).toHaveBeenCalledOnce();
  });
});
