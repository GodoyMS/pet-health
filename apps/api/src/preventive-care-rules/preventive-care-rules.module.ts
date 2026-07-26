import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleService } from "./application/preventive-care-rule.service";
import { PreventiveCareRuleOrmEntity } from "./infrastructure/typeorm/preventive-care-rule.orm-entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PreventiveCareRuleOrmEntity,
      SpeciesOrmEntity,
      BreedOrmEntity
    ])
  ],
  providers: [PreventiveCareRuleService],
  exports: [PreventiveCareRuleService]
})
export class PreventiveCareRulesModule {}
