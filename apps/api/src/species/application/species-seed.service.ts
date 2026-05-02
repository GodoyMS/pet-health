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

  /** Upserts species + breeds from {@link SPECIES_SEED_DATA}. Idempotent. */
  async seed(): Promise<void> {
    console.error(
      `[species-seed] upserting ${SPECIES_SEED_DATA.length} species and their breeds…`
    );
    for (const s of SPECIES_SEED_DATA) {
      const payload = {
        name: s.name,
        slug: s.slug,
        description: s.description,
        imageUrl: s.imageUrl,
        order: s.order
      };
      const existing = await this.speciesRepo.findOne({ where: { name: s.name } });
      if (existing) {
        await this.speciesRepo.update(existing.id, payload);
      } else {
        await this.speciesRepo.insert(payload);
      }

      const speciesRow = await this.speciesRepo.findOne({
        where: { name: s.name }
      });
      if (!speciesRow) {
        continue;
      }

      for (const b of s.breeds) {
        const existingBreed = await this.breedRepo.findOne({
          where: { species: { id: speciesRow.id }, name: b.name }
        });
        if (existingBreed) {
          await this.breedRepo.update(existingBreed.id, { name: b.name });
        } else {
          await this.breedRepo.save(
            this.breedRepo.create({
              name: b.name,
              species: speciesRow
            })
          );
        }
      }
    }
    console.error("[species-seed] species and breeds upsert completed.");
  }
}
