import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PetsModule } from "./pets/pets.module";
import { SpeciesModule } from "./species/species.module";
import { ormConfig } from "./config/ormconfig";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ormConfig
    }),
    AuthModule,
    UsersModule,
    SpeciesModule,
    PetsModule
  ]
})
export class AppModule {}

