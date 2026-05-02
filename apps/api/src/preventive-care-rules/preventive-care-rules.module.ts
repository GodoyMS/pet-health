import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleService } from "./application/preventive-care-rule.service";
import { PreventiveCareRuleOrmEntity } from "./infrastructure/typeorm/preventive-care-rule.orm-entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([PreventiveCareRuleOrmEntity, SpeciesOrmEntity])
  ],
  providers: [PreventiveCareRuleService],
  exports: [PreventiveCareRuleService]
})
export class PreventiveCareRulesModule {}
