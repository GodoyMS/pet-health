import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../infrastructure/typeorm/preventive-care-rule.orm-entity";
import {
  buildPreventiveCareRulesForSpecies,
  type PreventiveCareRuleSeedDefinition
} from "../infrastructure/preventive-care-rules.seed";

/**
 * Seeds from trusted JSON (validated by zod when generated). Uses repositories
 * directly so the seed CLI works without relying on {@link PreventiveCareRuleService}
 * injection from nested modules.
 */
@Injectable()
export class PreventiveCareRulesSeedService {
  private readonly logger = new Logger(PreventiveCareRulesSeedService.name);

  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly ruleRepo: Repository<PreventiveCareRuleOrmEntity>
  ) {}

  /**
   * Idempotent: upserts by (`species` + `title`). Safe to re-run.
   * Run after species seed so every species row exists.
   */
  async seed(): Promise<void> {
    const speciesList = await this.speciesRepo.find({
      order: { name: "ASC" }
    });

    let seededSpecies = 0;
    let skippedSpecies = 0;

    for (const species of speciesList) {
      const existingCount = await this.ruleRepo.count({
        where: { species: { id: species.id } }
      });
      if (existingCount > 0) {
        skippedSpecies++;
        this.logger.log(
          `Skip "${species.name}" (${species.slug ?? "no slug"}): already has ${existingCount} preventive care rule(s).`
        );
        continue;
      }

      const slug = species.slug ?? "";
      const definitions = buildPreventiveCareRulesForSpecies(slug, species.id);
      await this.upsertDefinitionsForSpecies(species.id, definitions);
      seededSpecies++;
    }

    this.logger.log(
      `Preventive care seed: ${seededSpecies} species seeded, ${skippedSpecies} skipped (already had rules).`
    );
  }

  private async upsertDefinitionsForSpecies(
    speciesId: string,
    definitions: PreventiveCareRuleSeedDefinition[]
  ): Promise<void> {
    const species = await this.speciesRepo.findOne({ where: { id: speciesId } });
    if (!species) {
      throw new NotFoundException(`Species not found: ${speciesId}`);
    }

    for (const def of definitions) {
      const existing = await this.ruleRepo.findOne({
        where: { species: { id: speciesId }, title: def.title }
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
