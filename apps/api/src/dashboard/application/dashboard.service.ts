import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Repository } from "typeorm";

import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import { PetHealthLogOrmEntity } from "../../pets/infrastructure/typeorm/pet-health-log.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { PetAiReportOrmEntity } from "../../pets/infrastructure/typeorm/pet-ai-report.orm-entity";
import { PetPreventiveCareItemService } from "../../pets/application/pet-preventive-care-item.service";
import {
  computeLoggingStreak,
  computeWeekCompletion
} from "../../pets/application/logging-consistency";
import {
  findNextDueItem,
  summarizePreventiveCareItems
} from "../../pets/application/preventive-care-summary";
import {
  addCalendarDays,
  formatCalendarDate
} from "../../pets/application/date-utils";

function currentYear(): number {
  return new Date().getFullYear();
}

function yearBounds(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
}
import type {
  DashboardActivity,
  DashboardAlert,
  DashboardData,
  DashboardPetCard
} from "./dashboard.read-model";

export class DashboardService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly petsRepo: Repository<PetOrmEntity>,
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly logsRepo: Repository<PetHealthLogOrmEntity>,
    @InjectRepository(PreventiveCarePetItemOrmEntity)
    private readonly preventiveRepo: Repository<PreventiveCarePetItemOrmEntity>,
    @InjectRepository(PetAiReportOrmEntity)
    private readonly aiReportsRepo: Repository<PetAiReportOrmEntity>,
    private readonly preventiveCareItems: PetPreventiveCareItemService
  ) {}

  async getForUser(userId: string): Promise<DashboardData> {
    const today = formatCalendarDate(new Date());
    const year = currentYear();
    const { start: yearStart, end: yearEnd } = yearBounds(year);
    const upcomingCutoff = addCalendarDays(today, 30);
    const thirtyFiveDaysAgo = addCalendarDays(today, -34);

    const pets = await this.petsRepo.find({
      where: { owner: { id: userId } },
      relations: ["species", "breed"],
      order: { name: "ASC" }
    });

    if (pets.length === 0) {
      return {
        summary: {
          petCount: 0,
          totalHealthLogs: 0,
          overduePreventiveItems: 0,
          upcomingPreventiveItems: 0,
          averageAwarenessScore: null,
          bestLoggingStreakDays: 0,
          logsThisWeek: 0
        },
        pets: [],
        alerts: [],
        recentActivity: []
      };
    }

    const petIds = pets.map((p) => p.id);

    for (const pet of pets) {
      if (pet.breed) {
        await this.preventiveCareItems.ensureItemsForYear(pet.id, year);
      }
    }

    const [preventiveItems, healthLogs, totalLogCount, recentAiReports] =
      await Promise.all([
        this.preventiveRepo.find({
          where: {
            pet: { id: In(petIds) },
            dueDate: Between(yearStart, yearEnd)
          },
          relations: ["pet", "preventiveCareRule"],
          order: { dueDate: "ASC" }
        }),
        this.logsRepo.find({
          where: {
            pet: { id: In(petIds) },
            logDate: Between(thirtyFiveDaysAgo, today)
          },
          relations: ["pet"],
          order: { logDate: "DESC", createdAt: "DESC" }
        }),
        this.logsRepo.count({
          where: { pet: { id: In(petIds) } }
        }),
        this.aiReportsRepo.find({
          where: { pet: { id: In(petIds) } },
          relations: ["pet"],
          order: { generatedAt: "DESC" },
          take: 5
        })
      ]);

    const preventiveByPet = new Map<string, typeof preventiveItems>();
    for (const item of preventiveItems) {
      const pid = item.pet.id;
      const list = preventiveByPet.get(pid) ?? [];
      list.push(item);
      preventiveByPet.set(pid, list);
    }

    const logDatesByPet = new Map<string, string[]>();
    const lastLogByPet = new Map<string, string>();
    for (const log of healthLogs) {
      const pid = log.pet.id;
      const dates = logDatesByPet.get(pid) ?? [];
      dates.push(log.logDate);
      logDatesByPet.set(pid, dates);
      if (!lastLogByPet.has(pid)) {
        lastLogByPet.set(pid, log.logDate);
      }
    }

    let totalOverdue = 0;
    let totalUpcoming = 0;
    let bestStreak = 0;
    let logsThisWeek = 0;
    const awarenessScores: number[] = [];
    const alerts: DashboardAlert[] = [];
    const petCards: DashboardPetCard[] = [];

    for (const pet of pets) {
      const items = preventiveByPet.get(pet.id) ?? [];
      const itemLikes = items.map((i) => ({
        dueDate: i.dueDate,
        completedAt: i.completedAt ? i.completedAt.toISOString() : null
      }));
      const summary = summarizePreventiveCareItems(itemLikes, today);
      totalOverdue += summary.overdue;

      const upcoming = items.filter(
        (i) =>
          !i.completedAt &&
          i.dueDate >= today &&
          i.dueDate <= upcomingCutoff
      ).length;
      totalUpcoming += upcoming;

      const logDates = logDatesByPet.get(pet.id) ?? [];
      const streak = computeLoggingStreak(logDates);
      bestStreak = Math.max(bestStreak, streak);
      logsThisWeek += computeWeekCompletion(logDates);

      if (pet.awarenessScore != null) {
        awarenessScores.push(pet.awarenessScore);
      }

      const nextPending = items
        .filter((i) => !i.completedAt && i.dueDate >= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

      const nextDue = findNextDueItem(itemLikes, today);

      petCards.push({
        id: pet.id,
        name: pet.name,
        speciesName: pet.species.name,
        speciesImageUrl: pet.species.imageUrl,
        breedName: pet.breed?.name ?? null,
        awarenessScore: pet.awarenessScore,
        weightKg: pet.weightKg,
        preventiveCare: summary,
        lastHealthLogDate: lastLogByPet.get(pet.id) ?? null,
        loggingStreakDays: streak,
        nextDueDate: nextDue?.dueDate ?? null,
        nextDueTitle: nextPending?.preventiveCareRule.title ?? null
      });

      if (summary.overdue > 0) {
        alerts.push({
          type: "overdue_preventive",
          petId: pet.id,
          petName: pet.name,
          message: `${summary.overdue} overdue preventive care item${summary.overdue > 1 ? "s" : ""}`,
          severity: "high",
          actionPath: `/dashboard/pets/${pet.id}/preventive-care`
        });
      }

      const daysSinceLog =
        lastLogByPet.has(pet.id)
          ? Math.floor(
              (Date.parse(today) - Date.parse(lastLogByPet.get(pet.id)!)) /
                86_400_000
            )
          : null;

      if (daysSinceLog === null || daysSinceLog >= 7) {
        alerts.push({
          type: "missing_logs",
          petId: pet.id,
          petName: pet.name,
          message:
            daysSinceLog === null
              ? "No health logs recorded yet"
              : `No health log in ${daysSinceLog} days`,
          severity: daysSinceLog === null || daysSinceLog >= 14 ? "medium" : "low",
          actionPath: `/dashboard/pets/${pet.id}/health-logs`
        });
      }

      const soonDue = items.filter(
        (i) =>
          !i.completedAt &&
          i.dueDate >= today &&
          i.dueDate <= addCalendarDays(today, 7)
      );
      for (const item of soonDue.slice(0, 2)) {
        alerts.push({
          type: "upcoming_due",
          petId: pet.id,
          petName: pet.name,
          message: `${item.preventiveCareRule.title} due ${item.dueDate}`,
          severity: "low",
          actionPath: `/dashboard/pets/${pet.id}/preventive-care`
        });
      }
    }

    alerts.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.severity] - order[b.severity];
    });

    const recentActivity: DashboardActivity[] = [];

    for (const log of healthLogs.slice(0, 8)) {
      recentActivity.push({
        type: "health_log",
        petId: log.pet.id,
        petName: log.pet.name,
        date: log.logDate,
        description: `Health check-in logged (weight ${log.weightKg.toFixed(1)} kg)`
      });
    }

    for (const report of recentAiReports) {
      recentActivity.push({
        type: "ai_report",
        petId: report.pet.id,
        petName: report.pet.name,
        date: report.generatedAt.toISOString().slice(0, 10),
        description: report.headline
      });
    }

    recentActivity.sort((a, b) => b.date.localeCompare(a.date));
    const trimmedActivity = recentActivity.slice(0, 10);

    const avgAwareness =
      awarenessScores.length > 0
        ? Math.round(
            awarenessScores.reduce((a, b) => a + b, 0) / awarenessScores.length
          )
        : null;

    return {
      summary: {
        petCount: pets.length,
        totalHealthLogs: totalLogCount,
        overduePreventiveItems: totalOverdue,
        upcomingPreventiveItems: totalUpcoming,
        averageAwarenessScore: avgAwareness,
        bestLoggingStreakDays: bestStreak,
        logsThisWeek
      },
      pets: petCards,
      alerts: alerts.slice(0, 12),
      recentActivity: trimmedActivity
    };
  }
}
