import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../infrastructure/typeorm/preventive-care-rule.orm-entity";
import {
  buildPreventiveCareRulesForBreed,
  type PreventiveCareRuleSeedDefinition
} from "../infrastructure/preventive-care-rules.seed";

/** Existing row, read once up front so the diff needs no per-rule lookups. */
interface ExistingRule {
  id: string;
  breedId: string;
  title: string;
  type: string;
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
  intervalDays: number | null;
}

/** Row to create, with relations referenced by id. */
interface NewRule {
  title: string;
  species: { id: string };
  breed: { id: string };
  type: PreventiveCareRuleSeedDefinition["type"];
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
  intervalDays: number | null;
}

/** Postgres caps a statement at 65535 parameters; this stays well under it. */
const INSERT_CHUNK_SIZE = 500;

/**
 * Seeds from {@link ../infrastructure/preventive-care-rules.generated.json}.
 * Generate that file first: `pnpm run ai:generate-rules`.
 * Uses repositories directly so the seed CLI works without Nest module wiring.
 */
@Injectable()
export class PreventiveCareRulesSeedService {
  private readonly logger = new Logger(PreventiveCareRulesSeedService.name);

  constructor(
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly ruleRepo: Repository<PreventiveCareRuleOrmEntity>
  ) {}

  /**
   * Idempotent: upserts by (`species` + `breed` + `title`). Safe to re-run.
   * Run after species + breeds seed and after `ai:generate-rules`.
   *
   * Reads the whole table once and writes in bulk, so a no-op re-run costs a
   * couple of queries rather than one per rule. That keeps it usable on boot
   * (SEED_ON_BOOT) and over high-latency connections.
   */
  async seed(): Promise<void> {
    const legacyDeleted = await this.ruleRepo.delete({ breed: IsNull() });
    if (legacyDeleted.affected) {
      this.logger.log(
        `Removed ${legacyDeleted.affected} legacy species-scoped rule(s) without breedId.`
      );
    }

    const speciesList = await this.speciesRepo.find({
      relations: ["breeds"],
      order: { name: "ASC" }
    });

    const existingByKey = await this.loadExisting();
    const breedsWithRules = new Set(
      [...existingByKey.values()].map((rule) => rule.breedId)
    );

    const toInsert: NewRule[] = [];
    const toUpdate: { id: string; def: PreventiveCareRuleSeedDefinition }[] = [];

    let seededBreeds = 0;
    let updatedBreeds = 0;
    let missingFromFile = 0;

    for (const species of speciesList) {
      const slug = species.slug ?? "";

      for (const breed of species.breeds) {
        const definitions = buildPreventiveCareRulesForBreed(slug, breed.name);
        if (definitions.length === 0) {
          missingFromFile++;
          this.logger.warn(
            `No rules in generated file for "${breed.name}" (${slug}). Run ai:generate-rules.`
          );
          continue;
        }

        for (const def of definitions) {
          const existing = existingByKey.get(`${breed.id}::${def.title}`);
          if (!existing) {
            toInsert.push({
              title: def.title,
              species: { id: species.id },
              breed: { id: breed.id },
              type: def.type,
              applicableMinAgeDays: def.applicableMinAgeDays ?? null,
              applicableMaxAgeDays: def.applicableMaxAgeDays ?? null,
              intervalDays: def.intervalDays ?? null
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
        type: def.type,
        applicableMinAgeDays: def.applicableMinAgeDays ?? null,
        applicableMaxAgeDays: def.applicableMaxAgeDays ?? null,
        intervalDays: def.intervalDays ?? null
      });
    }

    this.logger.log(
      `Preventive care seed: ${seededBreeds} breed(s) created, ${updatedBreeds} already present, ` +
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
        'rule.type AS "type"',
        'rule."applicableMinAgeDays" AS "applicableMinAgeDays"',
        'rule."applicableMaxAgeDays" AS "applicableMaxAgeDays"',
        'rule."intervalDays" AS "intervalDays"'
      ])
      .getRawMany();

    return new Map(rows.map((row) => [`${row.breedId}::${row.title}`, row]));
  }

  private hasChanged(
    existing: ExistingRule,
    def: PreventiveCareRuleSeedDefinition
  ): boolean {
    return (
      existing.type !== def.type ||
      existing.applicableMinAgeDays !== (def.applicableMinAgeDays ?? null) ||
      existing.applicableMaxAgeDays !== (def.applicableMaxAgeDays ?? null) ||
      existing.intervalDays !== (def.intervalDays ?? null)
    );
  }

  private async insertInChunks(rows: NewRule[]): Promise<void> {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      await this.ruleRepo.insert(rows.slice(i, i + INSERT_CHUNK_SIZE));
    }
  }
}
