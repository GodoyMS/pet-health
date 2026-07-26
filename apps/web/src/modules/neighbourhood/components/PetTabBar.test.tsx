import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";
import { PetTabBar } from "./PetTabBar";

function pet(overrides: Partial<MyNeighbourhoodPet> = {}): MyNeighbourhoodPet {
  return {
    id: "p1",
    name: "Milo",
    species: { id: "sp-dog", name: "Dog", imageUrl: null },
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
    incomingRequestCount: 0,
    ...overrides
  };
}

describe("PetTabBar", () => {
  it("renders one tab per pet", () => {
    render(
      <PetTabBar
        pets={[pet(), pet({ id: "p2", name: "Luna" })]}
        activePetId="p1"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("marks only the active pet as selected", () => {
    render(
      <PetTabBar
        pets={[pet(), pet({ id: "p2", name: "Luna" })]}
        activePetId="p2"
        onSelect={vi.fn()}
      />
    );
    const [milo, luna] = screen.getAllByRole("tab");
    expect(milo).toHaveAttribute("aria-selected", "false");
    expect(luna).toHaveAttribute("aria-selected", "true");
  });

  it("selects a pet when its tab is clicked", () => {
    const onSelect = vi.fn();
    render(
      <PetTabBar
        pets={[pet(), pet({ id: "p2", name: "Luna" })]}
        activePetId="p1"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getAllByRole("tab")[1]);
    expect(onSelect).toHaveBeenCalledWith("p2");
  });

  it("shows a pending-request badge only when there are requests", () => {
    const { rerender } = render(
      <PetTabBar pets={[pet()]} activePetId="p1" onSelect={vi.fn()} />
    );
    expect(screen.queryByTitle(/pending request/i)).not.toBeInTheDocument();

    rerender(
      <PetTabBar
        pets={[pet({ incomingRequestCount: 3 })]}
        activePetId="p1"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByTitle("3 pending requests")).toHaveTextContent("3");
  });

  it("singularises the badge tooltip for one request", () => {
    render(
      <PetTabBar
        pets={[pet({ incomingRequestCount: 1 })]}
        activePetId="p1"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByTitle("1 pending request")).toBeInTheDocument();
  });

  it("caps the badge at 9+", () => {
    render(
      <PetTabBar
        pets={[pet({ incomingRequestCount: 42 })]}
        activePetId="p1"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByTitle("42 pending requests")).toHaveTextContent("9+");
  });

  it("flags a pet hidden from neighbours", () => {
    render(
      <PetTabBar
        pets={[
          pet({
            location: {
              lat: 1,
              lng: 1,
              source: "manual",
              isDiscoverable: false,
              updatedAt: new Date().toISOString()
            }
          })
        ]}
        activePetId="p1"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/hidden from neighbours/i)).toBeInTheDocument();
  });
});
