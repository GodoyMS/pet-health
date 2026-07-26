import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { LifestyleRuleService } from "./application/lifestyle-rule.service";
import { LifestyleRuleOrmEntity } from "./infrastructure/typeorm/lifestyle-rule.orm-entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LifestyleRuleOrmEntity,
      SpeciesOrmEntity,
      BreedOrmEntity
    ])
  ],
  providers: [LifestyleRuleService],
  exports: [LifestyleRuleService, TypeOrmModule]
})
export class LifestyleRulesModule {}
