import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { PetHealthLogOrmEntity } from "../infrastructure/typeorm/pet-health-log.orm-entity";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import {
  addCalendarDays,
  addCalendarMonths,
  formatCalendarDate,
  normalizeLogDate,
  startOfCalendarMonth
} from "./date-utils";
import {
  buildLoggingConsistencySummary
} from "./logging-consistency-summary";
import type { PetAnalytics } from "./pet-analytics.read-model";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
] as const;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const LOG_DATE_EXPR = "TO_CHAR(log.logDate, 'YYYY-MM-DD')";

function scaleRatingToPercent(value: number | null): number {
  if (value === null || Number.isNaN(value)) return 0;
  return Math.round(((value - 1) / 4) * 100);
}

@Injectable()
export class PetAnalyticsService {
  constructor(
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly logsRepo: Repository<PetHealthLogOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly petsRepo: Repository<PetOrmEntity>
  ) {}

  private async assertPetOwnedByUser(
    userId: string,
    petId: string
  ): Promise<void> {
    const pet = await this.petsRepo.findOne({
      where: { id: petId, owner: { id: userId } }
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
  }

  private buildFilteredQuery(petId: string, startDate?: string) {
    const qb = this.logsRepo
      .createQueryBuilder("log")
      .innerJoin("log.pet", "pet")
      .where("pet.id = :petId", { petId });

    if (startDate) {
      qb.andWhere("log.logDate >= :startDate", { startDate });
    }

    return qb;
  }

  async getForUser(userId: string, petId: string): Promise<PetAnalytics> {
    await this.assertPetOwnedByUser(userId, petId);

    const today = formatCalendarDate(new Date());
    const sixMonthsStart = addCalendarMonths(startOfCalendarMonth(new Date()), -5);
    const thirtyDaysStart = addCalendarDays(today, -30);
    const sevenDaysStart = addCalendarDays(today, -6);
    const thirtyFiveDaysStart = addCalendarDays(today, -34);

    const [weightRows, wellnessRows, kpiResult, recentLogRows] =
      await Promise.all([
        this.buildFilteredQuery(petId, sixMonthsStart)
          .select("TO_CHAR(log.logDate, 'YYYY-MM')", "monthKey")
          .addSelect("AVG(log.weightKg)", "avgWeight")
          .groupBy("TO_CHAR(log.logDate, 'YYYY-MM')")
          .orderBy("TO_CHAR(log.logDate, 'YYYY-MM')", "ASC")
          .getRawMany<{ monthKey: string; avgWeight: string }>(),

        this.buildFilteredQuery(petId, thirtyDaysStart)
          .select(LOG_DATE_EXPR, "date")
          .addSelect("AVG(log.energy)", "energy")
          .addSelect("AVG(log.mood)", "mood")
          .groupBy(LOG_DATE_EXPR)
          .orderBy(LOG_DATE_EXPR, "ASC")
          .getRawMany<{ date: string; energy: string; mood: string }>(),

        this.buildFilteredQuery(petId, thirtyDaysStart)
          .select("AVG(log.appetite)", "appetite")
          .addSelect("AVG(log.energy)", "energy")
          .addSelect("AVG(log.mood)", "mood")
          .addSelect("COUNT(log.id)", "logCount")
          .getRawOne<{
            appetite: string | null;
            energy: string | null;
            mood: string | null;
            logCount: string;
          }>(),

        this.buildFilteredQuery(petId, thirtyFiveDaysStart)
          .select(LOG_DATE_EXPR, "date")
          .orderBy(LOG_DATE_EXPR, "DESC")
          .getRawMany<{ date: string }>()
      ]);

    const weightByMonth = new Map(
      weightRows.map((r) => [r.monthKey, Number(r.avgWeight)])
    );

    const weightTrend: PetAnalytics["weightTrend"] = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = addCalendarMonths(sixMonthsStart, i);
      const key = monthStart.slice(0, 7);
      const avg = weightByMonth.get(key);
      if (avg !== undefined && !Number.isNaN(avg)) {
        const monthIndex = Number(key.slice(5, 7)) - 1;
        weightTrend.push({
          label: MONTH_LABELS[monthIndex] ?? key,
          date: key,
          kg: Math.round(avg * 10) / 10
        });
      }
    }

    const wellnessByDate = new Map(
      wellnessRows.map((r) => {
        const date = normalizeLogDate(r.date);
        return [
          date,
          {
            energy: scaleRatingToPercent(Number(r.energy)),
            mood: scaleRatingToPercent(Number(r.mood))
          }
        ] as const;
      })
    );

    const wellnessWeek: PetAnalytics["wellnessWeek"] = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = addCalendarDays(sevenDaysStart, i);
      const [y, m, d] = dateStr.split("-").map(Number);
      const day = new Date(y, m - 1, d);
      const dayIndex = day.getDay();
      const shortIdx = dayIndex === 0 ? 6 : dayIndex - 1;
      const values = wellnessByDate.get(dateStr);
      wellnessWeek.push({
        date: dateStr,
        short: DAY_LABELS[shortIdx] ?? dateStr.slice(5),
        energy: values?.energy ?? 0,
        mood: values?.mood ?? 0
      });
    }

    const logDates = recentLogRows.map((r) => normalizeLogDate(r.date));
    const roundAvg = (value: string | null | undefined): number | null => {
      if (value === null || value === undefined) return null;
      const n = Number(value);
      if (Number.isNaN(n)) return null;
      return Math.round(n * 10) / 10;
    };

    const logCount = Number(kpiResult?.logCount ?? 0);
    const reference = new Date();

    return {
      petId,
      weightTrend,
      wellnessWeek,
      loggingConsistency: buildLoggingConsistencySummary(
        logDates,
        logCount,
        reference
      ),
      kpis: {
        appetite: logCount > 0 ? roundAvg(kpiResult?.appetite) : null,
        energy: logCount > 0 ? roundAvg(kpiResult?.energy) : null,
        mood: logCount > 0 ? roundAvg(kpiResult?.mood) : null,
        logCount
      }
    };
  }
}
