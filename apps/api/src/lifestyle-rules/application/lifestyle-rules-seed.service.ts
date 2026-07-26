import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BreedOrmEntity } from "../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { LifestyleRuleOrmEntity } from "../infrastructure/typeorm/lifestyle-rule.orm-entity";
import {
  buildLifestyleRulesForBreed,
  type LifestyleRuleSeedDefinition
} from "../infrastructure/lifestyle-rules.seed";

/**
 * Seeds from {@link ../infrastructure/lifestyle-rules.generated.json}.
 * Generate that file first: `pnpm run ai:generate-lifestyle-rules`.
 */
@Injectable()
export class LifestyleRulesSeedService {
  private readonly logger = new Logger(LifestyleRulesSeedService.name);

  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedRepo: Repository<BreedOrmEntity>,
    @InjectRepository(LifestyleRuleOrmEntity)
    private readonly ruleRepo: Repository<LifestyleRuleOrmEntity>
  ) {}

  /** Idempotent: upserts by (`species` + `breed` + `title`). Safe to re-run. */
  async seed(): Promise<void> {
    const speciesList = await this.speciesRepo.find({
      relations: ["breeds"],
      order: { name: "ASC" }
    });

    let seededBreeds = 0;
    let updatedBreeds = 0;
    let missingFromFile = 0;

    for (const species of speciesList) {
      const slug = species.slug ?? "";

      for (const breed of species.breeds) {
        const definitions = buildLifestyleRulesForBreed(slug, breed.name);
        if (definitions.length === 0) {
          missingFromFile++;
          this.logger.warn(
            `No lifestyle rules in generated file for "${breed.name}" (${slug}). Run ai:generate-lifestyle-rules.`
          );
          continue;
        }

        const before = await this.ruleRepo.count({
          where: { breed: { id: breed.id } }
        });
        await this.upsertDefinitions(species.id, breed.id, definitions);
        if (before > 0) {
          updatedBreeds++;
          this.logger.log(
            `Updated "${breed.name}" (${slug}): ${definitions.length} lifestyle rule(s).`
          );
        } else {
          seededBreeds++;
        }
      }
    }

    this.logger.log(
      `Lifestyle rules seed: ${seededBreeds} breed(s) created, ${updatedBreeds} updated, ${missingFromFile} missing from generated file.`
    );
  }

  private async upsertDefinitions(
    speciesId: string,
    breedId: string,
    definitions: LifestyleRuleSeedDefinition[]
  ): Promise<void> {
    const species = await this.speciesRepo.findOne({ where: { id: speciesId } });
    if (!species) {
      throw new NotFoundException(`Species not found: ${speciesId}`);
    }

    const breed = await this.breedRepo.findOne({ where: { id: breedId } });
    if (!breed) {
      throw new NotFoundException(`Breed not found: ${breedId}`);
    }

    for (const def of definitions) {
      const existing = await this.ruleRepo.findOne({
        where: {
          species: { id: speciesId },
          breed: { id: breedId },
          title: def.title
        }
      });
      if (existing) {
        existing.description = def.description;
        existing.type = def.type;
        existing.applicableMinAgeDays = def.applicableMinAgeDays ?? null;
        existing.applicableMaxAgeDays = def.applicableMaxAgeDays ?? null;
        await this.ruleRepo.save(existing);
      } else {
        const row = this.ruleRepo.create({
          title: def.title,
          description: def.description,
          species,
          breed,
          type: def.type,
          applicableMinAgeDays: def.applicableMinAgeDays ?? null,
          applicableMaxAgeDays: def.applicableMaxAgeDays ?? null
        });
        await this.ruleRepo.save(row);
      }
    }
  }
}
