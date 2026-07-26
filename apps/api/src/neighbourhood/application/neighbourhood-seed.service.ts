import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BreedOrmEntity } from "../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";
import { PetLocationOrmEntity } from "../infrastructure/typeorm/pet-location.orm-entity";

const DEMO_EMAIL_DOMAIN = "neighbour.demo";

const NEIGHBOUR_NAMES = [
  "Ana",
  "Ben",
  "Chloe",
  "Diego",
  "Emma",
  "Farid",
  "Grace",
  "Hugo",
  "Iris",
  "Jonas",
  "Kira",
  "Luca"
];

const PET_NAMES = [
  "Rex", "Bella", "Coco", "Duke", "Eli", "Fern", "Gus", "Hazel",
  "Iggy", "Juno", "Kiwi", "Loki", "Mango", "Nala", "Olive", "Pepper",
  "Quill", "Rocky", "Sasha", "Toby", "Uma", "Vito", "Willow", "Ziggy"
];

export interface NeighbourhoodSeedOptions {
  /** Centre of the demo cluster. */
  lat: number;
  lng: number;
  /** How far out demo pets are scattered, in metres. */
  radiusMeters: number;
  /** Number of demo pets to create. */
  count: number;
}

/**
 * Populates the map with demo neighbours so the Neighbourhood view has
 * something to show in development.
 *
 * Every generated account uses the `@neighbour.demo` domain and is created
 * without a password hash, so these rows can never be signed into and are
 * trivially identifiable for cleanup.
 */
@Injectable()
export class NeighbourhoodSeedService {
  private readonly logger = new Logger(NeighbourhoodSeedService.name);

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly pets: Repository<PetOrmEntity>,
    @InjectRepository(SpeciesOrmEntity)
    private readonly species: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breeds: Repository<BreedOrmEntity>,
    @InjectRepository(PetLocationOrmEntity)
    private readonly locations: Repository<PetLocationOrmEntity>
  ) {}

  async seed(options: NeighbourhoodSeedOptions): Promise<void> {
    const allSpecies = await this.species.find({ order: { name: "ASC" } });
    if (allSpecies.length === 0) {
      throw new Error(
        "No species found. Run `pnpm run seed:species` before seeding neighbours."
      );
    }

    const created: string[] = [];

    for (let i = 0; i < options.count; i++) {
      const ownerName = NEIGHBOUR_NAMES[i % NEIGHBOUR_NAMES.length];
      const email = `demo-neighbour-${i + 1}@${DEMO_EMAIL_DOMAIN}`;

      let owner = await this.users.findOne({ where: { email } });
      if (!owner) {
        owner = await this.users.save(
          this.users.create({
            email,
            name: `${ownerName} (demo)`,
            passwordHash: null,
            provider: "email",
            googleId: null,
            role: "user"
          })
        );
      }

      // One pet per demo owner keeps the map varied without ballooning rows.
      const petName = PET_NAMES[i % PET_NAMES.length];
      const existingPet = await this.pets.findOne({
        where: { name: petName, owner: { id: owner.id } },
        relations: ["owner"]
      });

      const species = allSpecies[i % allSpecies.length];
      const breed = await this.breeds.findOne({
        where: { species: { id: species.id } }
      });

      const pet =
        existingPet ??
        (await this.pets.save(
          this.pets.create({
            name: petName,
            owner,
            species,
            breed: breed ?? undefined,
            birthDate: randomBirthDate(i),
            weightKg: 4 + (i % 20),
            expectedLifeSpanYears: null,
            awarenessScore: null
          })
        ));

      const point = scatter(options, i, options.count);
      await this.locations.upsert(
        {
          petId: pet.id,
          lat: point.lat,
          lng: point.lng,
          source: "manual" as const,
          isDiscoverable: true
        },
        ["petId"]
      );

      created.push(`${petName} (${species.name})`);
    }

    this.logger.log(
      `Seeded ${created.length} demo neighbours around ${options.lat}, ${options.lng}: ${created.join(", ")}`
    );
  }

  /** Remove every demo neighbour account and its pets. */
  async clear(): Promise<number> {
    const demoUsers = await this.users
      .createQueryBuilder("user")
      .where("user.email LIKE :pattern", { pattern: `%@${DEMO_EMAIL_DOMAIN}` })
      .getMany();

    if (demoUsers.length === 0) return 0;

    // Pets and locations cascade from the user delete.
    await this.users.remove(demoUsers);
    this.logger.log(`Removed ${demoUsers.length} demo neighbour(s).`);
    return demoUsers.length;
  }
}

/**
 * Spread pets over a disc using a golden-angle spiral, so they look naturally
 * scattered rather than ringed or clumped at the centre.
 */
function scatter(
  options: NeighbourhoodSeedOptions,
  index: number,
  total: number
): { lat: number; lng: number } {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const distance = options.radiusMeters * Math.sqrt((index + 0.5) / total);

  const dLat = (distance * Math.cos(angle)) / 111_320;
  const dLng =
    (distance * Math.sin(angle)) /
    (111_320 * Math.cos((options.lat * Math.PI) / 180));

  return { lat: options.lat + dLat, lng: options.lng + dLng };
}

function randomBirthDate(index: number): string {
  const now = new Date();
  const monthsOld = 6 + ((index * 7) % 120);
  const born = new Date(now.getFullYear(), now.getMonth() - monthsOld, 1 + (index % 28));
  return born.toISOString().slice(0, 10);
}
