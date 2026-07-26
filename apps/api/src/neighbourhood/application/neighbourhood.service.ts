import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import type { MyNeighbourhoodPet } from "./neighbourhood.read-model";
import { PetFriendshipService } from "./pet-friendship.service";
import { PetLocationService } from "./pet-location.service";

/**
 * Composes the single payload the neighbourhood view boots from: the user's
 * pets, where each one currently stands, and its friendship badge counts.
 * One round-trip keeps the tab bar from flickering in piecemeal.
 */
@Injectable()
export class NeighbourhoodService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly pets: Repository<PetOrmEntity>,
    private readonly locations: PetLocationService,
    private readonly friendships: PetFriendshipService
  ) {}

  async listMyPets(userId: string): Promise<MyNeighbourhoodPet[]> {
    const pets = await this.pets.find({
      where: { owner: { id: userId } },
      relations: ["species", "breed"],
      order: { name: "ASC" }
    });
    if (pets.length === 0) return [];

    const petIds = pets.map((pet) => pet.id);
    const [locations, counts] = await Promise.all([
      this.locations.findByPetIds(petIds),
      this.friendships.countsFor(petIds)
    ]);

    return pets.map((pet) => {
      const location = locations.get(pet.id);
      const count = counts.get(pet.id);

      return {
        id: pet.id,
        name: pet.name,
        species: {
          id: pet.species.id,
          name: pet.species.name,
          imageUrl: pet.species.imageUrl
        },
        breed: pet.breed ? { id: pet.breed.id, name: pet.breed.name } : null,
        birthDate: pet.birthDate,
        location: location
          ? {
              lat: location.lat,
              lng: location.lng,
              source: location.source,
              isDiscoverable: location.isDiscoverable,
              updatedAt: location.updatedAt.toISOString()
            }
          : null,
        friendCount: count?.friendCount ?? 0,
        incomingRequestCount: count?.incomingRequestCount ?? 0
      };
    });
  }
}
