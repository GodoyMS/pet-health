import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Species } from "../domain/species.entity";
import { BreedOrmEntity } from "../infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../infrastructure/typeorm/species.orm-entity";

export interface BreedSummary {
  id: string;
  name: string;
}

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly repo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedRepo: Repository<BreedOrmEntity>
  ) {}

  private mapBreedsFromEntity(entity: SpeciesOrmEntity): BreedSummary[] {
    const rows = entity.breeds ?? [];
    return [...rows]
      .map((b) => ({ id: b.id, name: b.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private toDomain(entity: SpeciesOrmEntity): Species {
    return new Species(
      entity.id,
      entity.name,
      entity.imageUrl,
      this.mapBreedsFromEntity(entity)
    );
  }

  async findAll(): Promise<Species[]> {
    const list = await this.repo.find({
      order: { name: "ASC" },
      relations: ["breeds"]
    });
    return list.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<Species> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["breeds"]
    });
    if (!entity) {
      throw new NotFoundException("Species not found");
    }
    return this.toDomain(entity);
  }

  async findBreedsBySpeciesId(speciesId: string): Promise<BreedSummary[]> {
    const species = await this.repo.findOne({ where: { id: speciesId } });
    if (!species) {
      throw new NotFoundException("Species not found");
    }
    const list = await this.breedRepo.find({
      where: { species: { id: speciesId } },
      order: { name: "ASC" }
    });
    return list.map((b) => ({ id: b.id, name: b.name }));
  }
}
