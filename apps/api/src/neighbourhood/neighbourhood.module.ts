import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module";
import { PetOrmEntity } from "../pets/infrastructure/typeorm/pet.orm-entity";
import { NeighbourhoodService } from "./application/neighbourhood.service";
import { NearbyPetsService } from "./application/nearby-pets.service";
import { PetFriendshipService } from "./application/pet-friendship.service";
import { PetLocationService } from "./application/pet-location.service";
import { OwnerLocationOrmEntity } from "./infrastructure/typeorm/owner-location.orm-entity";
import { PetFriendshipOrmEntity } from "./infrastructure/typeorm/pet-friendship.orm-entity";
import { PetLocationOrmEntity } from "./infrastructure/typeorm/pet-location.orm-entity";
import { NeighbourhoodController } from "./interfaces/http/neighbourhood.controller";
import { PetFriendshipsController } from "./interfaces/http/pet-friendships.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetLocationOrmEntity,
      OwnerLocationOrmEntity,
      PetFriendshipOrmEntity,
      PetOrmEntity
    ]),
    AuthModule
  ],
  controllers: [NeighbourhoodController, PetFriendshipsController],
  providers: [
    NeighbourhoodService,
    PetLocationService,
    NearbyPetsService,
    PetFriendshipService
  ]
})
export class NeighbourhoodModule {}
