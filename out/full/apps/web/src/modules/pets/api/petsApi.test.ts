import { describe, it, expect, vi, beforeEach } from "vitest";
import { petsApi } from "./petsApi";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("@shared/api/httpClient", () => ({
  httpClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args)
  }
}));

describe("petsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls GET /pets and returns data", async () => {
      const pets = [
        {
          id: "1",
          ownerId: "u1",
          name: "Rex",
          species: { id: "s1", name: "Dog", imageUrl: null },
          birthDate: "2020-01-01",
          breed: "Lab",
          expectedLifeSpanYears: 12
        }
      ];
      mockGet.mockResolvedValue({ data: pets });

      const result = await petsApi.list();

      expect(mockGet).toHaveBeenCalledWith("/pets");
      expect(result.data).toEqual(pets);
    });
  });

  describe("get", () => {
    it("calls GET /pets/:id and returns data", async () => {
      const pet = {
        id: "1",
        ownerId: "u1",
        name: "Rex",
        species: { id: "s1", name: "Dog", imageUrl: null },
        birthDate: "2020-01-01",
        breed: "Lab",
        expectedLifeSpanYears: 12
      };
      mockGet.mockResolvedValue({ data: pet });

      const result = await petsApi.get("1");

      expect(mockGet).toHaveBeenCalledWith("/pets/1");
      expect(result.data).toEqual(pet);
    });
  });

  describe("create", () => {
    it("calls POST /pets with payload and returns data", async () => {
      const payload = {
        name: "Rex",
        speciesId: "s1",
        birthDate: "2020-01-01",
        breed: "Lab"
      };
      const created = {
        id: "1",
        ownerId: "u1",
        name: "Rex",
        species: { id: "s1", name: "Dog", imageUrl: null },
        birthDate: "2020-01-01",
        breed: "Lab",
        expectedLifeSpanYears: null
      };
      mockPost.mockResolvedValue({ data: created });

      const result = await petsApi.create(payload);

      expect(mockPost).toHaveBeenCalledWith("/pets", payload);
      expect(result.data).toEqual(created);
    });
  });
});
