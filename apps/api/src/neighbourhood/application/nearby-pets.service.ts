import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import { boundingBox, haversineMeters } from "../../shared/geo/haversine";
import { friendshipPairKey } from "../domain/friendship-policy";
import { PetFriendshipOrmEntity } from "../infrastructure/typeorm/pet-friendship.orm-entity";
import { PetLocationOrmEntity } from "../infrastructure/typeorm/pet-location.orm-entity";
import { FUZZ_GRID_METERS, fuzzLocation } from "./location-privacy";
import type { NearbyPet } from "./neighbourhood.read-model";

export const NEARBY_RADIUS_MIN = 200;
export const NEARBY_RADIUS_MAX = 20_000;
export const NEARBY_RADIUS_DEFAULT = 2_000;

/** Hard cap on markers returned, to keep the map responsive. */
const MAX_RESULTS = 50;

interface CandidateRow {
  id: string;
  name: string;
  birthDate: string;
  speciesId: string;
  speciesName: string;
  speciesImageUrl: string | null;
  breedId: string | null;
  breedName: string | null;
  ownerName: string;
  lat: number;
  lng: number;
}

@Injectable()
export class NearbyPetsService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly pets: Repository<PetOrmEntity>,
    @InjectRepository(PetLocationOrmEntity)
    private readonly petLocations: Repository<PetLocationOrmEntity>,
    @InjectRepository(PetFriendshipOrmEntity)
    private readonly friendships: Repository<PetFriendshipOrmEntity>
  ) {}

  /**
   * Discoverable pets belonging to other owners around the active pet.
   *
   * Two stages: an index-backed bounding-box prefilter in SQL, then exact
   * haversine distances in memory. The box is inflated by one privacy cell so
   * a pet whose fuzzed position lands inside the radius is never dropped by
   * the prefilter.
   */
  async findNearby(
    userId: string,
    petId: string,
    radiusMeters: number
  ): Promise<NearbyPet[]> {
    const activePet = await this.pets.findOne({
      where: { id: petId, owner: { id: userId } },
      relations: ["species"]
    });
    // 404 rather than 403 — don't leak which pet ids exist.
    if (!activePet) throw new NotFoundException("Pet not found");

    const centre = await this.petLocations.findOne({ where: { petId } });
    if (!centre) return [];

    const radius = clampRadius(radiusMeters);
    const box = boundingBox(centre.lat, centre.lng, radius + FUZZ_GRID_METERS);

    const qb = this.pets
      .createQueryBuilder("pet")
      .innerJoin(PetLocationOrmEntity, "loc", 'loc."petId" = pet.id')
      .innerJoin("pet.species", "species")
      .innerJoin("pet.owner", "owner")
      .leftJoin("pet.breed", "breed")
      .select("pet.id", "id")
      .addSelect("pet.name", "name")
      .addSelect("pet.birthDate", "birthDate")
      .addSelect("species.id", "speciesId")
      .addSelect("species.name", "speciesName")
      .addSelect("species.imageUrl", "speciesImageUrl")
      .addSelect("breed.id", "breedId")
      .addSelect("breed.name", "breedName")
      .addSelect("owner.name", "ownerName")
      .addSelect("loc.lat", "lat")
      .addSelect("loc.lng", "lng")
      .where('loc."isDiscoverable" = true')
      // Own pets are rendered from the tab-bar payload instead.
      .andWhere('pet."ownerId" != :userId', { userId })
      .andWhere("loc.lat BETWEEN :minLat AND :maxLat", {
        minLat: box.minLat,
        maxLat: box.maxLat
      });

    if (box.wrapsAntimeridian) {
      // The box straddles ±180°, so the range is the union of two spans.
      qb.andWhere("(loc.lng >= :minLng OR loc.lng <= :maxLng)", {
        minLng: box.minLng,
        maxLng: box.maxLng
      });
    } else {
      qb.andWhere("loc.lng BETWEEN :minLng AND :maxLng", {
        minLng: box.minLng,
        maxLng: box.maxLng
      });
    }

    const rows = await qb.getRawMany<CandidateRow>();
    if (rows.length === 0) return [];

    // Fuzz first, then measure — the number on screen matches the pin drawn.
    const withDistance = rows
      .map((row) => {
        const fuzzed = fuzzLocation(row.id, { lat: row.lat, lng: row.lng });
        return {
          row,
          fuzzed,
          distanceMeters: Math.round(
            haversineMeters(centre.lat, centre.lng, fuzzed.lat, fuzzed.lng)
          )
        };
      })
      .filter((c) => c.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, MAX_RESULTS);

    if (withDistance.length === 0) return [];

    const friendships = await this.friendshipsFor(
      petId,
      withDistance.map((c) => c.row.id)
    );

    return withDistance.map(({ row, fuzzed, distanceMeters }) => {
      const friendship = friendships.get(friendshipPairKey(petId, row.id));

      return {
        id: row.id,
        name: row.name,
        species: {
          id: row.speciesId,
          name: row.speciesName,
          imageUrl: row.speciesImageUrl
        },
        breed:
          row.breedId && row.breedName
            ? { id: row.breedId, name: row.breedName }
            : null,
        birthDate: row.birthDate,
        ownerName: row.ownerName,
        location: fuzzed,
        distanceMeters,
        isSameSpecies: row.speciesId === activePet.species.id,
        friendship: friendship
          ? {
              id: friendship.id,
              status: friendship.status,
              direction:
                friendship.requesterPetId === petId
                  ? ("outgoing" as const)
                  : ("incoming" as const)
            }
          : null
      };
    });
  }

  /** Existing friendship rows between the active pet and each candidate. */
  private async friendshipsFor(
    petId: string,
    candidateIds: string[]
  ): Promise<Map<string, PetFriendshipOrmEntity>> {
    const pairKeys = candidateIds.map((id) => friendshipPairKey(petId, id));
    const rows = await this.friendships.find({
      where: { pairKey: In(pairKeys) }
    });
    return new Map(rows.map((row) => [row.pairKey, row]));
  }
}

export function clampRadius(radius: number | undefined): number {
  if (radius == null || Number.isNaN(radius)) return NEARBY_RADIUS_DEFAULT;
  return Math.min(Math.max(radius, NEARBY_RADIUS_MIN), NEARBY_RADIUS_MAX);
}
