import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import { Pet } from "../domain/pet.entity";
import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";

export interface CreatePetInput {
  name: string;
  speciesId: string;
  birthDate: string;
  breed: string;
  expectedLifeSpanYears?: number | null;
}

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly repo: Repository<PetOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly usersRepo: Repository<UserOrmEntity>,
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>
  ) {}

  private toDomain(entity: PetOrmEntity): Pet {
    return new Pet(
      entity.id,
      entity.owner.id,
      entity.name,
      entity.species.id,
      new Date(entity.birthDate),
      entity.breed,
      entity.expectedLifeSpanYears
    );
  }

  async listForUser(userId: string): Promise<Pet[]> {
    const pets = await this.repo.find({
      where: { owner: { id: userId } },
      relations: ["owner", "species"]
    });
    return pets.map((p) => this.toDomain(p));
  }

  async getForUser(userId: string, id: string): Promise<Pet> {
    const pet = await this.repo.findOne({
      where: { id, owner: { id: userId } },
      relations: ["owner", "species"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
    return this.toDomain(pet);
  }

  async createForUser(userId: string, input: CreatePetInput): Promise<Pet> {
    const owner = await this.usersRepo.findOne({ where: { id: userId } });
    if (!owner) {
      throw new NotFoundException("Owner not found");
    }

    const species = await this.speciesRepo.findOne({
      where: { id: input.speciesId }
    });
    if (!species) {
      throw new BadRequestException("Species not found");
    }

    const entity = this.repo.create({
      name: input.name,
      owner,
      species,
      birthDate: input.birthDate,
      breed: input.breed,
      expectedLifeSpanYears: input.expectedLifeSpanYears ?? null
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }
}
