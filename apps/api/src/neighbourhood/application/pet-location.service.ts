import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import { OwnerLocationOrmEntity } from "../infrastructure/typeorm/owner-location.orm-entity";
import { PetLocationOrmEntity } from "../infrastructure/typeorm/pet-location.orm-entity";
import type { GeoPoint } from "../domain/pet-location.entity";

@Injectable()
export class PetLocationService {
  constructor(
    @InjectRepository(PetLocationOrmEntity)
    private readonly petLocations: Repository<PetLocationOrmEntity>,
    @InjectRepository(OwnerLocationOrmEntity)
    private readonly ownerLocations: Repository<OwnerLocationOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly pets: Repository<PetOrmEntity>
  ) {}

  async getOwnerLocation(userId: string): Promise<OwnerLocationOrmEntity | null> {
    return this.ownerLocations.findOne({ where: { userId } });
  }

  /**
   * Anchor the owner at a coordinate and move every pet that follows them.
   *
   * Runs in one transaction so a partially-moved household is never visible:
   * pets that have never been placed get a row seeded at the owner's position,
   * pets still on `inherited` are moved, and `manual` pets are left alone.
   */
  async upsertOwnerLocation(userId: string, point: GeoPoint): Promise<void> {
    await this.petLocations.manager.transaction(async (em) => {
      await em
        .getRepository(OwnerLocationOrmEntity)
        .upsert({ userId, lat: point.lat, lng: point.lng }, ["userId"]);

      const ownedPets = await em
        .getRepository(PetOrmEntity)
        .createQueryBuilder("pet")
        .select("pet.id", "id")
        .where("pet.ownerId = :userId", { userId })
        .getRawMany<{ id: string }>();

      if (ownedPets.length === 0) return;

      const petIds = ownedPets.map((p) => p.id);
      const locationRepo = em.getRepository(PetLocationOrmEntity);

      const existing = await locationRepo.find({
        where: { petId: In(petIds) },
        select: ["petId"]
      });
      const placed = new Set(existing.map((row) => row.petId));

      const missing = petIds.filter((id) => !placed.has(id));
      if (missing.length > 0) {
        await locationRepo.insert(
          missing.map((petId) => ({
            petId,
            lat: point.lat,
            lng: point.lng,
            source: "inherited" as const,
            isDiscoverable: true
          }))
        );
      }

      if (placed.size > 0) {
        await locationRepo.update(
          { petId: In([...placed]), source: "inherited" },
          { lat: point.lat, lng: point.lng }
        );
      }
    });
  }

  /** Pin a pet to an explicit coordinate, detaching it from the owner. */
  async setPetLocation(
    userId: string,
    petId: string,
    point: GeoPoint
  ): Promise<PetLocationOrmEntity> {
    await this.assertOwnership(userId, petId);

    await this.petLocations.upsert(
      {
        petId,
        lat: point.lat,
        lng: point.lng,
        source: "manual" as const
      },
      ["petId"]
    );

    return this.requirePetLocation(petId);
  }

  /**
   * Re-attach a pet to its owner's position. Requires the owner to have a
   * location — otherwise there is nothing to follow.
   */
  async followOwner(userId: string, petId: string): Promise<PetLocationOrmEntity> {
    await this.assertOwnership(userId, petId);

    const owner = await this.getOwnerLocation(userId);
    if (!owner) {
      throw new NotFoundException(
        "Set your own location first before a pet can follow it"
      );
    }

    await this.petLocations.upsert(
      {
        petId,
        lat: owner.lat,
        lng: owner.lng,
        source: "inherited" as const
      },
      ["petId"]
    );

    return this.requirePetLocation(petId);
  }

  async setDiscoverability(
    userId: string,
    petId: string,
    isDiscoverable: boolean
  ): Promise<PetLocationOrmEntity> {
    await this.assertOwnership(userId, petId);

    const location = await this.petLocations.findOne({ where: { petId } });
    if (!location) {
      throw new NotFoundException("Place this pet on the map first");
    }

    location.isDiscoverable = isDiscoverable;
    return this.petLocations.save(location);
  }

  /** Locations for a set of pets, keyed by pet id. */
  async findByPetIds(petIds: string[]): Promise<Map<string, PetLocationOrmEntity>> {
    if (petIds.length === 0) return new Map();
    const rows = await this.petLocations.find({ where: { petId: In(petIds) } });
    return new Map(rows.map((row) => [row.petId, row]));
  }

  /**
   * Throws 404 (never 403) for pets the user doesn't own, so these endpoints
   * can't be used to probe which pet ids exist.
   */
  private async assertOwnership(userId: string, petId: string): Promise<void> {
    const owned = await this.pets.exists({
      where: { id: petId, owner: { id: userId } }
    });
    if (!owned) throw new NotFoundException("Pet not found");
  }

  private async requirePetLocation(petId: string): Promise<PetLocationOrmEntity> {
    const location = await this.petLocations.findOne({ where: { petId } });
    if (!location) throw new NotFoundException("Pet location not found");
    return location;
  }
}
