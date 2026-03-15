import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Species } from "../domain/species.entity";
import { SpeciesOrmEntity } from "../infrastructure/typeorm/species.orm-entity";

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly repo: Repository<SpeciesOrmEntity>
  ) {}

  private toDomain(entity: SpeciesOrmEntity): Species {
    return new Species(entity.id, entity.name, entity.imageUrl);
  }

  async findAll(): Promise<Species[]> {
    const list = await this.repo.find({ order: { name: "ASC" } });
    return list.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<Species> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException("Species not found");
    }
    return this.toDomain(entity);
  }
}
