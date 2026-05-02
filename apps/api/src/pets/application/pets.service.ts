import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";
import { BreedOrmEntity } from "../../species/infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import type { PetWithSpecies } from "./pet-with-species.read-model";
import { toPetWithSpecies } from "./pet-with-species.mapper";

export interface CreatePetInput {
  name: string;
  speciesId: string;
  breedId: string;
  birthDate: string;
  weightKg: number;
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
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedRepo: Repository<BreedOrmEntity>
  ) {}

  async listForUser(userId: string): Promise<PetWithSpecies[]> {
    const pets = await this.repo.find({
      where: { owner: { id: userId } },
      relations: ["owner", "species", "breed"],
      order: { name: "ASC" }
    });
    return pets.map(toPetWithSpecies);
  }

  async getForUser(userId: string, id: string): Promise<PetWithSpecies> {
    const pet = await this.repo.findOne({
      where: { id, owner: { id: userId } },
      relations: ["owner", "species", "breed"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
    return toPetWithSpecies(pet);
  }

  async createForUser(
    userId: string,
    input: CreatePetInput
  ): Promise<PetWithSpecies> {
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

    const breed = await this.breedRepo.findOne({
      where: { id: input.breedId },
      relations: ["species"]
    });
    if (!breed) {
      throw new BadRequestException("Breed not found");
    }
    if (breed.species.id !== input.speciesId) {
      throw new BadRequestException("Breed does not belong to the selected species");
    }

    const entity = this.repo.create({
      name: input.name,
      owner,
      species,
      breed,
      birthDate: input.birthDate,
      weightKg: input.weightKg,
      expectedLifeSpanYears: input.expectedLifeSpanYears ?? null
    });
    const saved = await this.repo.save(entity);

    const withRelations = await this.repo.findOne({
      where: { id: saved.id },
      relations: ["owner", "species", "breed"]
    });
    if (!withRelations) {
      throw new NotFoundException("Pet not found after create");
    }
    return toPetWithSpecies(withRelations);
  }

  async deleteForUser(userId: string, id: string): Promise<void> {
    const pet = await this.repo.findOne({
      where: { id, owner: { id: userId } }
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
    await this.repo.remove(pet);
  }
}
