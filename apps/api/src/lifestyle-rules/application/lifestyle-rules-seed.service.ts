import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { LifestyleRuleOrmEntity } from "../infrastructure/typeorm/lifestyle-rule.orm-entity";
import {
  buildLifestyleRulesForBreed,
  type LifestyleRuleSeedDefinition
} from "../infrastructure/lifestyle-rules.seed";

/** Existing row, read once up front so the diff needs no per-rule lookups. */
interface ExistingRule {
  id: string;
  breedId: string;
  title: string;
  description: string;
  type: string;
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
}

/** Row to create, with relations referenced by id. */
interface NewRule {
  title: string;
  description: string;
  species: { id: string };
  breed: { id: string };
  type: LifestyleRuleSeedDefinition["type"];
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
}

/** Postgres caps a statement at 65535 parameters; this stays well under it. */
const INSERT_CHUNK_SIZE = 500;

/**
 * Seeds from {@link ../infrastructure/lifestyle-rules.generated.json}.
 * Generate that file first: `pnpm run ai:generate-lifestyle-rules`.
 */
@Injectable()
export class LifestyleRulesSeedService {
  private readonly logger = new Logger(LifestyleRulesSeedService.name);

  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(LifestyleRuleOrmEntity)
    private readonly ruleRepo: Repository<LifestyleRuleOrmEntity>
  ) {}

  /**
   * Idempotent: upserts by (`species` + `breed` + `title`). Safe to re-run.
   *
   * Reads the whole table once and writes in bulk, so a no-op re-run costs a
   * couple of queries rather than one per rule. That keeps it usable on boot
   * (SEED_ON_BOOT) and over high-latency connections.
   */
  async seed(): Promise<void> {
    const speciesList = await this.speciesRepo.find({
      relations: ["breeds"],
      order: { name: "ASC" }
    });

    const existingByKey = await this.loadExisting();
    const breedsWithRules = new Set(
      [...existingByKey.values()].map((rule) => rule.breedId)
    );

    const toInsert: NewRule[] = [];
    const toUpdate: { id: string; def: LifestyleRuleSeedDefinition }[] = [];

    let seededBreeds = 0;
    let updatedBreeds = 0;
    let missingFromFile = 0;

    for (const species of speciesList) {
      const slug = species.slug ?? "";

      for (const breed of species.breeds) {
        const definitions = buildLifestyleRulesForBreed(slug, breed.name);
        if (definitions.length === 0) {
          missingFromFile++;
          this.logger.warn(
            `No lifestyle rules in generated file for "${breed.name}" (${slug}). Run ai:generate-lifestyle-rules.`
          );
          continue;
        }

        for (const def of definitions) {
          const existing = existingByKey.get(`${breed.id}::${def.title}`);
          if (!existing) {
            toInsert.push({
              title: def.title,
              description: def.description,
              species: { id: species.id },
              breed: { id: breed.id },
              type: def.type,
              applicableMinAgeDays: def.applicableMinAgeDays ?? null,
              applicableMaxAgeDays: def.applicableMaxAgeDays ?? null
            });
          } else if (this.hasChanged(existing, def)) {
            toUpdate.push({ id: existing.id, def });
          }
        }

        if (breedsWithRules.has(breed.id)) {
          updatedBreeds++;
        } else {
          seededBreeds++;
        }
      }
    }

    await this.insertInChunks(toInsert);

    for (const { id, def } of toUpdate) {
      await this.ruleRepo.update(id, {
        description: def.description,
        type: def.type,
        applicableMinAgeDays: def.applicableMinAgeDays ?? null,
        applicableMaxAgeDays: def.applicableMaxAgeDays ?? null
      });
    }

    this.logger.log(
      `Lifestyle rules seed: ${seededBreeds} breed(s) created, ${updatedBreeds} already present, ` +
        `${missingFromFile} missing from generated file ` +
        `(${toInsert.length} rule(s) inserted, ${toUpdate.length} updated).`
    );
  }

  /** Single read of the table, keyed by breed + title (the natural key). */
  private async loadExisting(): Promise<Map<string, ExistingRule>> {
    const rows: ExistingRule[] = await this.ruleRepo
      .createQueryBuilder("rule")
      .select([
        'rule.id AS "id"',
        'rule."breedId" AS "breedId"',
        'rule.title AS "title"',
        'rule.description AS "description"',
        'rule.type AS "type"',
        'rule."applicableMinAgeDays" AS "applicableMinAgeDays"',
        'rule."applicableMaxAgeDays" AS "applicableMaxAgeDays"'
      ])
      .getRawMany();

    return new Map(rows.map((row) => [`${row.breedId}::${row.title}`, row]));
  }

  private hasChanged(
    existing: ExistingRule,
    def: LifestyleRuleSeedDefinition
  ): boolean {
    return (
      existing.description !== def.description ||
      existing.type !== def.type ||
      existing.applicableMinAgeDays !== (def.applicableMinAgeDays ?? null) ||
      existing.applicableMaxAgeDays !== (def.applicableMaxAgeDays ?? null)
    );
  }

  private async insertInChunks(rows: NewRule[]): Promise<void> {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      await this.ruleRepo.insert(rows.slice(i, i + INSERT_CHUNK_SIZE));
    }
  }
}
