import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PetsModule } from "./pets/pets.module";
import { SpeciesModule } from "./species/species.module";
import { LifestyleRulesModule } from "./lifestyle-rules/lifestyle-rules.module";
import { PreventiveCareRulesModule } from "./preventive-care-rules/preventive-care-rules.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { GoogleCalendarModule } from "./google-calendar/google-calendar.module";
import { NearbyPlacesModule } from "./nearby-places/nearby-places.module";
import { NeighbourhoodModule } from "./neighbourhood/neighbourhood.module";
import { ormConfig } from "./config/ormconfig";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ormConfig
    }),
    AuthModule,
    UsersModule,
    SpeciesModule,
    PetsModule,
    PreventiveCareRulesModule,
    LifestyleRulesModule,
    DashboardModule,
    GoogleCalendarModule,
    NearbyPlacesModule,
    NeighbourhoodModule,
    AdminModule
  ]
})
export class AppModule {}

