import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PetsService } from "./application/pets.service";
import { PetsController } from "./interfaces/http/pets.controller";
import { PetOrmEntity } from "./infrastructure/typeorm/pet.orm-entity";
import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "./infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { AuthModule } from "../auth/auth.module";
import { LifestyleRulesModule } from "../lifestyle-rules/lifestyle-rules.module";
import { LifestyleRuleOrmEntity } from "../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { PetPreventiveCareItemService } from "./application/pet-preventive-care-item.service";
import { PetLifestyleGuidanceService } from "./application/pet-lifestyle-guidance.service";
import { PetHealthLogService } from "./application/pet-health-log.service";
import { PetHealthLogOrmEntity } from "./infrastructure/typeorm/pet-health-log.orm-entity";
import { PetAiReportOrmEntity } from "./infrastructure/typeorm/pet-ai-report.orm-entity";
import { PetAiReportService } from "./application/pet-ai-report.service";
import { PetAnalyticsService } from "./application/pet-analytics.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetOrmEntity,
      UserOrmEntity,
      SpeciesOrmEntity,
      BreedOrmEntity,
      PreventiveCareRuleOrmEntity,
      LifestyleRuleOrmEntity,
      PetHealthLogOrmEntity,
      PreventiveCarePetItemOrmEntity,
      PetAiReportOrmEntity
    ]),
    AuthModule,
    LifestyleRulesModule
  ],
  controllers: [PetsController],
  providers: [
    PetsService,
    PetPreventiveCareItemService,
    PetLifestyleGuidanceService,
    PetHealthLogService,
    PetAiReportService,
    PetAnalyticsService
  ],
  exports: [PetPreventiveCareItemService]
})
export class PetsModule {}

