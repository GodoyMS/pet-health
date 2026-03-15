import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { PetsListPage } from "./PetsListPage";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
};

import { useListPets } from "../hooks/useListPets";

vi.mock("../hooks/useListPets", () => ({
  useListPets: vi.fn()
}));

describe("PetsListPage (integration)", () => {
  it("shows loading state when loading", () => {
    vi.mocked(useListPets).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    });

    render(<PetsListPage />, { wrapper: createWrapper() });

    expect(screen.queryByRole("heading", { name: /your pets/i })).not.toBeInTheDocument();
  });

  it("shows error message when request fails", () => {
    vi.mocked(useListPets).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true
    });

    render(<PetsListPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/could not load pets/i)).toBeInTheDocument();
  });

  it("shows pet list and create button when data is loaded", () => {
    vi.mocked(useListPets).mockReturnValue({
      data: [
        {
          id: "1",
          ownerId: "u1",
          name: "Rex",
          species: { id: "s1", name: "Dog", imageUrl: null },
          birthDate: "2020-01-01",
          breed: "Lab",
          expectedLifeSpanYears: 12
        }
      ],
      isLoading: false,
      isError: false
    });

    render(<PetsListPage />, { wrapper: createWrapper() });

    expect(screen.getByRole("heading", { name: /your pets/i })).toBeInTheDocument();
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("Create New Pet")).toBeInTheDocument();
  });
});
