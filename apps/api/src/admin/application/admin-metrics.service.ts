import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserOrmEntity } from "../../users/infrastructure/typeorm/user.orm-entity";
import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import { PetHealthLogOrmEntity } from "../../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PetAiReportOrmEntity } from "../../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { SpeciesOrmEntity } from "../../species/infrastructure/typeorm/species.orm-entity";
import { BreedOrmEntity } from "../../species/infrastructure/typeorm/breed.orm-entity";
import { PreventiveCareRuleOrmEntity } from "../../preventive-care-rules/infrastructure/typeorm/preventive-care-rule.orm-entity";
import { LifestyleRuleOrmEntity } from "../../lifestyle-rules/infrastructure/typeorm/lifestyle-rule.orm-entity";
import {
  addCalendarDays,
  formatCalendarDate
} from "../../pets/application/date-utils";

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface DistributionSlice {
  label: string;
  count: number;
}

export interface AdminOverviewMetrics {
  totals: {
    users: number;
    pets: number;
    healthLogs: number;
    aiReports: number;
    species: number;
    breeds: number;
    preventiveCareRules: number;
    lifestyleRules: number;
  };
  careItems: {
    total: number;
    completed: number;
    overdue: number;
    pending: number;
  };
  averages: {
    awarenessScore: number | null;
    petsPerUser: number;
  };
  timeseries: {
    signupsLast30Days: TimeSeriesPoint[];
    healthLogsLast14Days: TimeSeriesPoint[];
    aiReportsLast14Days: TimeSeriesPoint[];
  };
  distributions: {
    petsBySpecies: DistributionSlice[];
    topBreeds: DistributionSlice[];
    usersByProvider: DistributionSlice[];
  };
}

/** Fill missing days with zero so charts render a continuous axis. */
function fillDailySeries(
  rows: { day: string; count: string | number }[],
  from: string,
  to: string
): TimeSeriesPoint[] {
  const byDay = new Map(rows.map((r) => [r.day, Number(r.count)]));
  const series: TimeSeriesPoint[] = [];
  for (let day = from; day <= to; day = addCalendarDays(day, 1)) {
    series.push({ date: day, count: byDay.get(day) ?? 0 });
  }
  return series;
}

@Injectable()
export class AdminMetricsService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly usersRepo: Repository<UserOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly petsRepo: Repository<PetOrmEntity>,
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly logsRepo: Repository<PetHealthLogOrmEntity>,
    @InjectRepository(PetAiReportOrmEntity)
    private readonly aiReportsRepo: Repository<PetAiReportOrmEntity>,
    @InjectRepository(PreventiveCarePetItemOrmEntity)
    private readonly careItemsRepo: Repository<PreventiveCarePetItemOrmEntity>,
    @InjectRepository(SpeciesOrmEntity)
    private readonly speciesRepo: Repository<SpeciesOrmEntity>,
    @InjectRepository(BreedOrmEntity)
    private readonly breedsRepo: Repository<BreedOrmEntity>,
    @InjectRepository(PreventiveCareRuleOrmEntity)
    private readonly preventiveRulesRepo: Repository<PreventiveCareRuleOrmEntity>,
    @InjectRepository(LifestyleRuleOrmEntity)
    private readonly lifestyleRulesRepo: Repository<LifestyleRuleOrmEntity>
  ) {}

  async getOverview(): Promise<AdminOverviewMetrics> {
    const today = formatCalendarDate(new Date());
    const thirtyDaysAgo = addCalendarDays(today, -29);
    const fourteenDaysAgo = addCalendarDays(today, -13);

    const [
      users,
      pets,
      healthLogs,
      aiReports,
      species,
      breeds,
      preventiveCareRules,
      lifestyleRules,
      careTotal,
      careCompleted,
      careOverdue
    ] = await Promise.all([
      this.usersRepo.count(),
      this.petsRepo.count(),
      this.logsRepo.count(),
      this.aiReportsRepo.count(),
      this.speciesRepo.count(),
      this.breedsRepo.count(),
      this.preventiveRulesRepo.count(),
      this.lifestyleRulesRepo.count(),
      this.careItemsRepo.count(),
      this.careItemsRepo
        .createQueryBuilder("item")
        .where("item.completedAt IS NOT NULL")
        .getCount(),
      this.careItemsRepo
        .createQueryBuilder("item")
        .where("item.completedAt IS NULL")
        .andWhere("item.dueDate < :today", { today })
        .getCount()
    ]);

    const [signupRows, logRows, reportRows] = await Promise.all([
      this.usersRepo
        .createQueryBuilder("u")
        .select("to_char(u.createdAt, 'YYYY-MM-DD')", "day")
        .addSelect("COUNT(*)", "count")
        .where("u.createdAt >= :from", { from: `${thirtyDaysAgo}T00:00:00Z` })
        .groupBy("day")
        .getRawMany<{ day: string; count: string }>(),
      this.logsRepo
        .createQueryBuilder("l")
        .select("to_char(l.logDate, 'YYYY-MM-DD')", "day")
        .addSelect("COUNT(*)", "count")
        .where("l.logDate >= :from", { from: fourteenDaysAgo })
        .groupBy("day")
        .getRawMany<{ day: string; count: string }>(),
      this.aiReportsRepo
        .createQueryBuilder("r")
        .select("to_char(r.generatedAt, 'YYYY-MM-DD')", "day")
        .addSelect("COUNT(*)", "count")
        .where("r.generatedAt >= :from", { from: `${fourteenDaysAgo}T00:00:00Z` })
        .groupBy("day")
        .getRawMany<{ day: string; count: string }>()
    ]);

    const [speciesRows, breedRows, providerRows, awarenessRow] =
      await Promise.all([
        this.petsRepo
          .createQueryBuilder("pet")
          .leftJoin("pet.species", "species")
          .select("species.name", "label")
          .addSelect("COUNT(*)", "count")
          .groupBy("species.name")
          .orderBy("count", "DESC")
          .getRawMany<{ label: string | null; count: string }>(),
        this.petsRepo
          .createQueryBuilder("pet")
          .leftJoin("pet.breed", "breed")
          .select("breed.name", "label")
          .addSelect("COUNT(*)", "count")
          .where("breed.id IS NOT NULL")
          .groupBy("breed.name")
          .orderBy("count", "DESC")
          .limit(6)
          .getRawMany<{ label: string; count: string }>(),
        this.usersRepo
          .createQueryBuilder("u")
          .select("u.provider", "label")
          .addSelect("COUNT(*)", "count")
          .groupBy("u.provider")
          .getRawMany<{ label: string; count: string }>(),
        this.petsRepo
          .createQueryBuilder("pet")
          .select("AVG(pet.awarenessScore)", "avg")
          .where("pet.awarenessScore IS NOT NULL")
          .getRawOne<{ avg: string | null }>()
      ]);

    return {
      totals: {
        users,
        pets,
        healthLogs,
        aiReports,
        species,
        breeds,
        preventiveCareRules,
        lifestyleRules
      },
      careItems: {
        total: careTotal,
        completed: careCompleted,
        overdue: careOverdue,
        pending: careTotal - careCompleted
      },
      averages: {
        awarenessScore:
          awarenessRow?.avg != null ? Math.round(Number(awarenessRow.avg)) : null,
        petsPerUser: users > 0 ? Math.round((pets / users) * 10) / 10 : 0
      },
      timeseries: {
        signupsLast30Days: fillDailySeries(signupRows, thirtyDaysAgo, today),
        healthLogsLast14Days: fillDailySeries(logRows, fourteenDaysAgo, today),
        aiReportsLast14Days: fillDailySeries(reportRows, fourteenDaysAgo, today)
      },
      distributions: {
        petsBySpecies: speciesRows.map((r) => ({
          label: r.label ?? "Unknown",
          count: Number(r.count)
        })),
        topBreeds: breedRows.map((r) => ({
          label: r.label,
          count: Number(r.count)
        })),
        usersByProvider: providerRows.map((r) => ({
          label: r.label,
          count: Number(r.count)
        }))
      }
    };
  }
}
