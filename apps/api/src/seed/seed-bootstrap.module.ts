import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LifestyleRulesSeedService } from "../lifestyle-rules/application/lifestyle-rules-seed.service";
import { LifestyleRuleOrmEntity } from "../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { PreventiveCareRulesSeedService } from "../preventive-care-rules/application/preventive-care-rules-seed.service";
import { PreventiveCareRuleOrmEntity } from "../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { SpeciesSeedService } from "../species/application/species-seed.service";
import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { SeedBootstrapService } from "./seed-bootstrap.service";

/**
 * Wires the reference-data seeds into {@link AppModule} so they can run on boot
 * behind SEED_ON_BOOT. Unlike {@link SeedModule} (the standalone CLI context)
 * this does not open its own connection — it reuses the app's DataSource.
 */
@Module({
  imports: [
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
    LifestyleRulesSeedService,
    SeedBootstrapService
  ]
})
export class SeedBootstrapModule {}
