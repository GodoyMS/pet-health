import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module";
import { PreventiveCareRulesModule } from "../preventive-care-rules/preventive-care-rules.module";
import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { PetOrmEntity } from "../pets/infrastructure/typeorm/pet.orm-entity";
import { PetHealthLogOrmEntity } from "../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PetAiReportOrmEntity } from "../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { BreedOrmEntity } from "../species/infrastructure/typeorm/breed.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { LifestyleRuleOrmEntity } from "../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";

import { AuditLogOrmEntity } from "./infrastructure/typeorm/audit-log.orm-entity";
import { AuditLogService } from "./application/audit-log.service";
import { AdminMetricsService } from "./application/admin-metrics.service";
import { AdminBootstrapService } from "./application/admin-bootstrap.service";
import { AdminGuard } from "./interfaces/http/admin.guard";
import { AdminMetricsController } from "./interfaces/http/admin-metrics.controller";
import { AdminUsersController } from "./interfaces/http/admin-users.controller";
import { AdminPetsController } from "./interfaces/http/admin-pets.controller";
import { AdminRecordsController } from "./interfaces/http/admin-records.controller";
import { AdminRulesController } from "./interfaces/http/admin-rules.controller";
import { AdminSystemController } from "./interfaces/http/admin-system.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLogOrmEntity,
      UserOrmEntity,
      PetOrmEntity,
      PetHealthLogOrmEntity,
      PetAiReportOrmEntity,
      PreventiveCarePetItemOrmEntity,
      SpeciesOrmEntity,
      BreedOrmEntity,
      PreventiveCareRuleOrmEntity,
      LifestyleRuleOrmEntity
    ]),
    AuthModule,
    PreventiveCareRulesModule
  ],
  controllers: [
    AdminMetricsController,
    AdminUsersController,
    AdminPetsController,
    AdminRecordsController,
    AdminRulesController,
    AdminSystemController
  ],
  providers: [
    AdminGuard,
    AuditLogService,
    AdminMetricsService,
    AdminBootstrapService
  ]
})
export class AdminModule {}
