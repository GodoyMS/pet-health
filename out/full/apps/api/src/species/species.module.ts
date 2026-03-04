import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SpeciesService } from "./application/species.service";
import { SpeciesSeedService } from "./application/species-seed.service";
import { SpeciesController } from "./interfaces/http/species.controller";
import { SpeciesOrmEntity } from "./infrastructure/typeorm/species.orm-entity";

@Module({
  imports: [TypeOrmModule.forFeature([SpeciesOrmEntity])],
  controllers: [SpeciesController],
  providers: [SpeciesService, SpeciesSeedService],
  exports: [SpeciesService]
})
export class SpeciesModule {}
