import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SpeciesOrmEntity } from "../infrastructure/typeorm/species.orm-entity";
import { DEFAULT_SPECIES } from "../infrastructure/species.seed";

@Injectable()
export class SpeciesSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly repo: Repository<SpeciesOrmEntity>
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    await this.repo.insert(
      DEFAULT_SPECIES.map((s) => ({ name: s.name, imageUrl: s.imageUrl }))
    );
  }
}
