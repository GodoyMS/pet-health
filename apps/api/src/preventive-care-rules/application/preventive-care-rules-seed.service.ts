import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import { BreedOrmEntity } from "../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../infrastructure/typeorm/preventive-care-rule.orm-entity";
import {
  buildPreventiveCareRulesForBreed,
  type PreventiveCareRuleSeedDefinition
} from "../infrastructure/preventive-care-rules.seed";

/**
 * Seeds from {@link ../infrastructure/preventive-care-rules.generated.json}.
 * Generate that file first: `pnpm run ai:generate-rules`.
 * Uses repositories directly so the seed CLI works without Nest module wiring.
 */
@Injectable()
export class PreventiveCareRulesSeedService {
  private readonly logger = new Logger(PreventiveCareRulesSeedService.name);

  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedRepo: Repository<BreedOrmEntity>,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly ruleRepo: Repository<PreventiveCareRuleOrmEntity>
  ) {}

  /**
   * Idempotent: upserts by (`species` + `breed` + `title`). Safe to re-run.
   * Run after species + breeds seed and after `ai:generate-rules`.
   */
  async seed(): Promise<void> {
    const legacyDeleted = await this.ruleRepo.delete({ breed: IsNull() });
    if (legacyDeleted.affected) {
      this.logger.log(
        `Removed ${legacyDeleted.affected} legacy species-scoped rule(s) without breedId.`
      );
    }

    const speciesList = await this.speciesRepo.find({
      relations: ["breeds"],
      order: { name: "ASC" }
    });

    let seededBreeds = 0;
    let skippedBreeds = 0;
    let missingFromFile = 0;

    for (const species of speciesList) {
      const slug = species.slug ?? "";

      for (const breed of species.breeds) {
        const definitions = buildPreventiveCareRulesForBreed(slug, breed.name);
        if (definitions.length === 0) {
          missingFromFile++;
          this.logger.warn(
            `No rules in generated file for "${breed.name}" (${slug}). Run ai:generate-rules.`
          );
          continue;
        }

        const before = await this.ruleRepo.count({
          where: { breed: { id: breed.id } }
        });
        await this.upsertDefinitions(species.id, breed.id, definitions);
        if (before > 0) {
          skippedBreeds++;
          this.logger.log(`Updated "${breed.name}" (${slug}): ${definitions.length} rule(s).`);
        } else {
          seededBreeds++;
        }
      }
    }

    this.logger.log(
      `Preventive care seed: ${seededBreeds} breed(s) created, ${skippedBreeds} updated, ${missingFromFile} missing from generated file.`
    );
  }

  private async upsertDefinitions(
    speciesId: string,
    breedId: string,
    definitions: PreventiveCareRuleSeedDefinition[]
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
        existing.type = def.type;
        existing.applicableMinAgeDays = def.applicableMinAgeDays ?? null;
        existing.applicableMaxAgeDays = def.applicableMaxAgeDays ?? null;
        existing.intervalDays = def.intervalDays ?? null;
        await this.ruleRepo.save(existing);
      } else {
        const row = this.ruleRepo.create({
          title: def.title,
          species,
          breed,
          type: def.type,
          applicableMinAgeDays: def.applicableMinAgeDays ?? null,
          applicableMaxAgeDays: def.applicableMaxAgeDays ?? null,
          intervalDays: def.intervalDays ?? null
        });
        await this.ruleRepo.save(row);
      }
    }
  }
}
