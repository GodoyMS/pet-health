import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { LifestyleRule } from "../domain/lifestyle-rule.entity";
import { LifestyleRuleOrmEntity } from "../infrastructure/typeorm/lifestyle-rule.orm-entity";

@Injectable()
export class LifestyleRuleService {
  constructor(
    @InjectRepository(LifestyleRuleOrmEntity)
    private readonly ruleRepo: Repository<LifestyleRuleOrmEntity>
  ) {}

  private toDomain(row: LifestyleRuleOrmEntity): LifestyleRule {
    return new LifestyleRule(
      row.id,
      row.title,
      row.description,
      row.species.id,
      row.breed.id,
      row.type,
      row.applicableMinAgeDays,
      row.applicableMaxAgeDays,
      row.createdAt,
      row.updatedAt
    );
  }

  async findByBreedId(breedId: string): Promise<LifestyleRule[]> {
    const rows = await this.ruleRepo.find({
      where: { breed: { id: breedId } },
      relations: ["species", "breed"],
      order: { type: "ASC", title: "ASC" }
    });
    return rows.map((row) => this.toDomain(row));
  }
}
