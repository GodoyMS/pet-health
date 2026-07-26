import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module";
import { PetsModule } from "../pets/pets.module";
import { PetOrmEntity } from "../pets/infrastructure/typeorm/pet.orm-entity";
import { PetHealthLogOrmEntity } from "../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { PetAiReportOrmEntity } from "../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { DashboardService } from "./application/dashboard.service";
import { DashboardController } from "./interfaces/http/dashboard.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetOrmEntity,
      PetHealthLogOrmEntity,
      PreventiveCarePetItemOrmEntity,
      PetAiReportOrmEntity
    ]),
    AuthModule,
    PetsModule
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
