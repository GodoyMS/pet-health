import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ormConfig } from "../config/ormconfig";
import { LifestyleRulesSeedService } from "../lifestyle-rules/application/lifestyle-rules-seed.service";
import { LifestyleRuleOrmEntity } from "../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PreventiveCareRulesSeedService } from "../preventive-care-rules/application/preventive-care-rules-seed.service";
import { SpeciesSeedService } from "../species/application/species-seed.service";
import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";

/**
 * Standalone context for CLI seeding (not loaded by {@link AppModule}).
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => ormConfig }),
    TypeOrmModule.forFeature([
      SpeciesOrmEntity,
      BreedOrmEntity,
      PreventiveCareRuleOrmEntity,
      LifestyleRuleOrmEntity
    ])
  ],
  providers: [
    SpeciesSeedService,
    PreventiveCareRulesSeedService,
    LifestyleRulesSeedService
  ]
})
export class SeedModule {}
