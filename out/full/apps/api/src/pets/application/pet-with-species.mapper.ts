import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import type { PetWithSpecies } from "./pet-with-species.read-model";

/**
 * Maps a persisted pet entity (with species relation loaded) to the API read model.
 * Ensures a single place for response shape and avoids leaking ORM types.
 */
export function toPetWithSpecies(entity: PetOrmEntity): PetWithSpecies {
  return {
    id: entity.id,
    ownerId: entity.owner.id,
    name: entity.name,
    species: {
      id: entity.species.id,
      name: entity.species.name,
      imageUrl: entity.species.imageUrl
    },
    birthDate: entity.birthDate,
    breed: entity.breed,
    expectedLifeSpanYears: entity.expectedLifeSpanYears
  };
}
