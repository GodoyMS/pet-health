import { toPetWithSpecies } from "./pet-with-species.mapper";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";
import { BreedOrmEntity } from "../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";

describe("toPetWithSpecies", () => {
  it("maps ORM entity to PetWithSpecies read model", () => {
    const owner = { id: "owner-1" } as UserOrmEntity;
    const species = {
      id: "species-1",
      name: "Dog",
      imageUrl: "https://example.com/dog.png"
    } as SpeciesOrmEntity;
    const breed = {
      id: "breed-1",
      name: "Labrador Retriever",
      expectedLifespanYears: 11
    } as BreedOrmEntity;
    const entity = {
      id: "pet-1",
      owner,
      name: "Rex",
      species,
      breed,
      birthDate: "2020-01-15",
      weightKg: 28.5,
      expectedLifeSpanYears: 12,
      awarenessScore: 85
    } as PetOrmEntity;

    const result = toPetWithSpecies(entity);

    expect(result).toEqual({
      id: "pet-1",
      ownerId: "owner-1",
      name: "Rex",
      species: {
        id: "species-1",
        name: "Dog",
        imageUrl: "https://example.com/dog.png"
      },
      breed: {
        id: "breed-1",
        name: "Labrador Retriever",
        expectedLifespanYears: 11
      },
      birthDate: "2020-01-15",
      weightKg: 28.5,
      expectedLifeSpanYears: 12,
      awarenessScore: 85
    });
  });

  it("handles null imageUrl and expectedLifeSpanYears", () => {
    const owner = { id: "owner-1" } as UserOrmEntity;
    const species = {
      id: "species-1",
      name: "Cat",
      imageUrl: null
    } as SpeciesOrmEntity;
    const breed = {
      id: "breed-2",
      name: "Siamese",
      expectedLifespanYears: 12
    } as BreedOrmEntity;
    const entity = {
      id: "pet-2",
      owner,
      name: "Whiskers",
      species,
      breed,
      birthDate: "2021-06-01",
      weightKg: null,
      expectedLifeSpanYears: null,
      awarenessScore: null
    } as PetOrmEntity;

    const result = toPetWithSpecies(entity);

    expect(result.species.imageUrl).toBeNull();
    expect(result.weightKg).toBeNull();
    expect(result.expectedLifeSpanYears).toBeNull();
    expect(result.awarenessScore).toBeNull();
    expect(result.breed?.expectedLifespanYears).toBe(12);
  });
});
