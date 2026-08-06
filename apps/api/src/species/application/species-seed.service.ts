import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BreedOrmEntity } from "../infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../infrastructure/typeorm/species.orm-entity";
import { SPECIES_SEED_DATA } from "species/infrastructure/species.seed";

@Injectable()
export class SpeciesSeedService {
  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedRepo: Repository<BreedOrmEntity>
  ) {}

  /**
   * Upserts species + breeds from {@link SPECIES_SEED_DATA}. Idempotent.
   *
   * Reads both tables once and writes only what differs, so a no-op re-run
   * stays at a handful of queries instead of one per breed.
   */
  async seed(): Promise<void> {
    console.error(
      `[species-seed] upserting ${SPECIES_SEED_DATA.length} species and their breeds…`
    );

    const speciesByName = new Map(
      (await this.speciesRepo.find()).map((row) => [row.name, row])
    );

    const newSpecies = SPECIES_SEED_DATA.filter(
      (s) => !speciesByName.has(s.name)
    ).map((s) => ({
      name: s.name,
      slug: s.slug,
      description: s.description,
      imageUrl: s.imageUrl,
      order: s.order
    }));

    if (newSpecies.length > 0) {
      await this.speciesRepo.insert(newSpecies);
    }

    for (const s of SPECIES_SEED_DATA) {
      const existing = speciesByName.get(s.name);
      if (!existing) {
        continue;
      }
      const changed =
        existing.slug !== s.slug ||
        existing.description !== s.description ||
        existing.imageUrl !== s.imageUrl ||
        existing.order !== s.order;
      if (changed) {
        await this.speciesRepo.update(existing.id, {
          slug: s.slug,
          description: s.description,
          imageUrl: s.imageUrl,
          order: s.order
        });
      }
    }

    // Re-read so newly inserted species carry their generated ids.
    const speciesRows = new Map(
      (await this.speciesRepo.find()).map((row) => [row.name, row])
    );

    const existingBreeds: {
      id: string;
      speciesId: string;
      name: string;
      expectedLifespanYears: number | null;
    }[] = await this.breedRepo
      .createQueryBuilder("breed")
      .select([
        'breed.id AS "id"',
        'breed."speciesId" AS "speciesId"',
        'breed.name AS "name"',
        'breed."expectedLifespanYears" AS "expectedLifespanYears"'
      ])
      .getRawMany();
    const breedByKey = new Map(
      existingBreeds.map((row) => [`${row.speciesId}::${row.name}`, row])
    );

    const newBreeds: {
      name: string;
      expectedLifespanYears: number | null;
      species: { id: string };
    }[] = [];

    for (const s of SPECIES_SEED_DATA) {
      const speciesRow = speciesRows.get(s.name);
      if (!speciesRow) {
        continue;
      }

      for (const b of s.breeds) {
        const lifespan = b.expectedLifespanYears ?? null;
        const existing = breedByKey.get(`${speciesRow.id}::${b.name}`);

        if (!existing) {
          newBreeds.push({
            name: b.name,
            expectedLifespanYears: lifespan,
            species: { id: speciesRow.id }
          });
        } else if (existing.expectedLifespanYears !== lifespan) {
          await this.breedRepo.update(existing.id, {
            expectedLifespanYears: lifespan
          });
        }
      }
    }

    if (newBreeds.length > 0) {
      await this.breedRepo.insert(newBreeds);
    }

    console.error(
      `[species-seed] species and breeds upsert completed ` +
        `(${newSpecies.length} species, ${newBreeds.length} breed(s) created).`
    );
  }
}
