import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PetsService } from "./application/pets.service";
import { PetsController } from "./interfaces/http/pets.controller";
import { PetOrmEntity } from "./infrastructure/typeorm/pet.orm-entity";
import { UserOrmEntity } from "../users/infrastructure/typeorm/user.orm-entity";
import { SpeciesOrmEntity } from "../species/infrastructure/typeorm/species.orm-entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PetOrmEntity, UserOrmEntity, SpeciesOrmEntity]),
    AuthModule
  ],
  controllers: [PetsController],
  providers: [PetsService]
})
export class PetsModule {}

