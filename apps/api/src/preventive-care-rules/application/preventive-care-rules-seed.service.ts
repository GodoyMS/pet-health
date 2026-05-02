import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PreventiveCareRuleService } from "./preventive-care-rule.service";
import {
  buildPreventiveCareRulesForSpecies,
  type PreventiveCareRuleSeedDefinition
} from "../infrastructure/preventive-care-rules.seed";

@Injectable()
export class PreventiveCareRulesSeedService {
  private readonly logger = new Logger(PreventiveCareRulesSeedService.name);

  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly ruleRepo: Repository<PreventiveCareRuleOrmEntity>,
    private readonly preventiveCareRuleService: PreventiveCareRuleService
  ) {}

  /**
   * Idempotent: upserts by (`species` + `title`). Safe to re-run.
   * Run after species seed so every species row exists.
   */
  async seed(): Promise<void> {
    const speciesList = await this.speciesRepo.find({
      order: { name: "ASC" }
    });

    for (const species of speciesList) {
      const slug = species.slug ?? "";
      const definitions = buildPreventiveCareRulesForSpecies(slug, species.id);
      await this.upsertDefinitionsForSpecies(species.id, definitions);
    }

    this.logger.log(
      `Processed preventive care rules for ${speciesList.length} species (definitions may be empty).`
    );
  }

  private async upsertDefinitionsForSpecies(
    speciesId: string,
    definitions: PreventiveCareRuleSeedDefinition[]
  ): Promise<void> {
    for (const def of definitions) {
      const existing = await this.ruleRepo.findOne({
        where: { species: { id: speciesId }, title: def.title }
      });
      if (existing) {
        await this.preventiveCareRuleService.update(existing.id, {
          type: def.type,
          applicableMinAgeDays: def.applicableMinAgeDays ?? null,
          applicableMaxAgeDays: def.applicableMaxAgeDays ?? null,
          intervalDays: def.intervalDays ?? null
        });
      } else {
        await this.preventiveCareRuleService.create({
          title: def.title,
          speciesId,
          type: def.type,
          applicableMinAgeDays: def.applicableMinAgeDays ?? null,
          applicableMaxAgeDays: def.applicableMaxAgeDays ?? null,
          intervalDays: def.intervalDays ?? null
        });
      }
    }
  }
}
