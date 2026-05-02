import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Repository } from "typeorm";

import { PreventiveCareRule } from "../domain/preventive-care-rule.entity";
import { PreventiveCareRuleOrmEntity } from "../infrastructure/typeorm/preventive-care-rule.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { CreatePreventiveCareRuleDto } from "./dto/create-preventive-care-rule.dto";
import { UpdatePreventiveCareRuleDto } from "./dto/update-preventive-care-rule.dto";

function assertValid<T extends object>(
  Cls: new () => T,
  plain: unknown,
  options?: { forbidNonWhitelisted?: boolean }
): T {
  const dto = plainToInstance(Cls, plain);
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: options?.forbidNonWhitelisted ?? false
  });
  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }
  return dto;
}

@Injectable()
export class PreventiveCareRuleService {
  constructor(
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly ruleRepo: Repository<PreventiveCareRuleOrmEntity>,
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>
  ) {}

  private toDomain(row: PreventiveCareRuleOrmEntity): PreventiveCareRule {
    return new PreventiveCareRule(
      row.id,
      row.title,
      row.species.id,
      row.type,
      row.applicableMinAgeDays,
      row.applicableMaxAgeDays,
      row.intervalDays,
      row.createdAt,
      row.updatedAt
    );
  }

  private async requireSpecies(id: string): Promise<SpeciesOrmEntity> {
    const species = await this.speciesRepo.findOne({ where: { id } });
    if (!species) {
      throw new NotFoundException("Species not found");
    }
    return species;
  }

  async findAll(): Promise<PreventiveCareRule[]> {
    const rows = await this.ruleRepo
      .createQueryBuilder("rule")
      .leftJoinAndSelect("rule.species", "species")
      .orderBy("species.name", "ASC")
      .addOrderBy("rule.title", "ASC")
      .getMany();
    return rows.map((r) => this.toDomain(r));
  }

  /** Rules for a single species (by species UUID). */
  async findBySpecie(specieId: string): Promise<PreventiveCareRule[]> {
    await this.requireSpecies(specieId);
    const rows = await this.ruleRepo.find({
      where: { species: { id: specieId } },
      relations: ["species"],
      order: { title: "ASC" }
    });
    return rows.map((r) => this.toDomain(r));
  }

  async create(raw: CreatePreventiveCareRuleDto): Promise<PreventiveCareRule> {
    const dto = assertValid(CreatePreventiveCareRuleDto, raw, {
      forbidNonWhitelisted: true
    });
    const species = await this.requireSpecies(dto.speciesId);
    const row = this.ruleRepo.create({
      title: dto.title,
      species,
      type: dto.type,
      applicableMinAgeDays: dto.applicableMinAgeDays ?? null,
      applicableMaxAgeDays: dto.applicableMaxAgeDays ?? null,
      intervalDays: dto.intervalDays ?? null
    });
    const saved = await this.ruleRepo.save(row);
    const withSpecies = await this.ruleRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ["species"]
    });
    return this.toDomain(withSpecies);
  }

  async update(
    id: string,
    raw: UpdatePreventiveCareRuleDto
  ): Promise<PreventiveCareRule> {
    const dto = assertValid(UpdatePreventiveCareRuleDto, raw, {
      forbidNonWhitelisted: true
    });
    const row = await this.ruleRepo.findOne({
      where: { id },
      relations: ["species"]
    });
    if (!row) {
      throw new NotFoundException("Preventive care rule not found");
    }

    if (dto.title !== undefined) {
      row.title = dto.title;
    }
    if (dto.type !== undefined) {
      row.type = dto.type;
    }
    if (dto.applicableMinAgeDays !== undefined) {
      row.applicableMinAgeDays = dto.applicableMinAgeDays;
    }
    if (dto.applicableMaxAgeDays !== undefined) {
      row.applicableMaxAgeDays = dto.applicableMaxAgeDays;
    }
    if (dto.intervalDays !== undefined) {
      row.intervalDays = dto.intervalDays;
    }
    if (dto.speciesId !== undefined) {
      row.species = await this.requireSpecies(dto.speciesId);
    }

    await this.ruleRepo.save(row);
    const refreshed = await this.ruleRepo.findOneOrFail({
      where: { id: row.id },
      relations: ["species"]
    });
    return this.toDomain(refreshed);
  }

  async delete(id: string): Promise<void> {
    const res = await this.ruleRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException("Preventive care rule not found");
    }
  }
}
