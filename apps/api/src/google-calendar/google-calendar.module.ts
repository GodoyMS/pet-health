import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GoogleCalendarTokenOrmEntity } from "./infrastructure/typeorm/google-calendar-token.orm-entity";
import { GoogleCalendarSyncOrmEntity } from "./infrastructure/typeorm/google-calendar-sync.orm-entity";
import { GoogleCalendarService } from "./application/google-calendar.service";
import { GoogleCalendarController } from "./interfaces/http/google-calendar.controller";
import { PetOrmEntity } from "../pets/infrastructure/typeorm/pet.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([
      GoogleCalendarTokenOrmEntity,
      GoogleCalendarSyncOrmEntity,
      PetOrmEntity,
      PreventiveCarePetItemOrmEntity
    ])
  ],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService]
})
export class GoogleCalendarModule {}
