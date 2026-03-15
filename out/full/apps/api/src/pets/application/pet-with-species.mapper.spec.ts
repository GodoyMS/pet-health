import { toPetWithSpecies } from "./pet-with-species.mapper";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";

describe("toPetWithSpecies", () => {
  it("maps ORM entity to PetWithSpecies read model", () => {
    const owner = { id: "owner-1" } as UserOrmEntity;
    const species = {
      id: "species-1",
      name: "Dog",
      imageUrl: "https://example.com/dog.png"
    } as SpeciesOrmEntity;
    const entity = {
      id: "pet-1",
      owner,
      name: "Rex",
      species,
      birthDate: "2020-01-15",
      breed: "Labrador",
      expectedLifeSpanYears: 12
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
      birthDate: "2020-01-15",
      breed: "Labrador",
      expectedLifeSpanYears: 12
    });
  });

  it("handles null imageUrl and expectedLifeSpanYears", () => {
    const owner = { id: "owner-1" } as UserOrmEntity;
    const species = {
      id: "species-1",
      name: "Cat",
      imageUrl: null
    } as SpeciesOrmEntity;
    const entity = {
      id: "pet-2",
      owner,
      name: "Whiskers",
      species,
      birthDate: "2021-06-01",
      breed: "Mixed",
      expectedLifeSpanYears: null
    } as PetOrmEntity;

    const result = toPetWithSpecies(entity);

    expect(result.species.imageUrl).toBeNull();
    expect(result.expectedLifeSpanYears).toBeNull();
  });
});
