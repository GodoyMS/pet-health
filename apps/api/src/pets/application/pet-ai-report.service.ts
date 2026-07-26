import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { configEnvs } from "../../config/configEnvs";
import { deepseekChatCompletion } from "../../preventive-care-rules/infrastructure/deepseek.client";
import type {
  AiReportContent,
  PetAiReport,
  PetAiReportSummary
} from "../domain/pet-ai-report.entity";
import {
  deepseekPetAiReportResponseSchema,
  type DeepseekPetAiReportResponse
} from "../infrastructure/pet-ai-report.schema";
import { PetAiReportOrmEntity } from "../infrastructure/typeorm/pet-ai-report.orm-entity";
import { PetHealthLogOrmEntity } from "../infrastructure/typeorm/pet-health-log.orm-entity";
import { PetOrmEntity } from "../infrastructure/typeorm/pet.orm-entity";
import { formatPetAgeLabel, petAgeDays } from "./lifestyle-age";
import { PetLifestyleGuidanceService } from "./pet-lifestyle-guidance.service";
import { PetPreventiveCareItemService } from "./pet-preventive-care-item.service";

const MAX_GENERATION_RETRIES = 3;
const HEALTH_LOG_LIMIT = 50;

function toReportSummary(entity: PetAiReportOrmEntity): PetAiReportSummary {
  return {
    id: entity.id,
    petId: entity.pet.id,
    awarenessScore: entity.awarenessScore,
    headline: entity.headline,
    generatedAt: entity.generatedAt.toISOString()
  };
}

function toFullReport(entity: PetAiReportOrmEntity): PetAiReport {
  return {
    ...toReportSummary(entity),
    content: entity.content,
    model: entity.model
  };
}

function toContentPayload(
  parsed: DeepseekPetAiReportResponse
): AiReportContent {
  return {
    executiveSummary: parsed.executiveSummary,
    healthAnalysis: parsed.healthAnalysis,
    healthTrends: parsed.healthTrends,
    preventiveCareAnalysis: parsed.preventiveCareAnalysis,
    lifestyleInsights: parsed.lifestyleInsights,
    predictions: parsed.predictions,
    recommendations: parsed.recommendations,
    actionSteps: parsed.actionSteps,
    nutritionRecommendations: parsed.nutritionRecommendations,
    activityRecommendations: parsed.activityRecommendations,
    riskFactors: parsed.riskFactors,
    disclaimer: parsed.disclaimer
  };
}

@Injectable()
export class PetAiReportService {
  constructor(
    @InjectRepository(PetOrmEntity)
    private readonly petRepo: Repository<PetOrmEntity>,
    @InjectRepository(PetAiReportOrmEntity)
    private readonly reportRepo: Repository<PetAiReportOrmEntity>,
    @InjectRepository(PetHealthLogOrmEntity)
    private readonly healthLogRepo: Repository<PetHealthLogOrmEntity>,
    private readonly preventiveCareItems: PetPreventiveCareItemService,
    private readonly lifestyleGuidance: PetLifestyleGuidanceService
  ) {}

  async listForUser(
    userId: string,
    petId: string
  ): Promise<PetAiReportSummary[]> {
    await this.assertPetOwnedByUser(userId, petId);

    const reports = await this.reportRepo.find({
      where: { pet: { id: petId } },
      relations: ["pet"],
      order: { generatedAt: "DESC" }
    });

    return reports.map(toReportSummary);
  }

  async getForUser(
    userId: string,
    petId: string,
    reportId: string
  ): Promise<PetAiReport> {
    await this.assertPetOwnedByUser(userId, petId);

    const report = await this.reportRepo.findOne({
      where: { id: reportId, pet: { id: petId } },
      relations: ["pet"]
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    return toFullReport(report);
  }

  async generateForUser(userId: string, petId: string): Promise<PetAiReport> {
    const pet = await this.assertPetOwnedByUser(userId, petId);
    const apiKey = configEnvs.DEEPSEEK_API_KEY;
    if (!apiKey?.trim()) {
      throw new ServiceUnavailableException(
        "AI report generation is not configured (DEEPSEEK_API_KEY missing)"
      );
    }

    const context = await this.buildPetContext(userId, pet);
    const parsed = await this.callDeepseekWithRetry(apiKey, context);

    const saved = await this.reportRepo.save(
      this.reportRepo.create({
        pet,
        awarenessScore: parsed.awarenessScore,
        headline: parsed.headline,
        content: toContentPayload(parsed),
        model: parsed.model
      })
    );

    pet.awarenessScore = parsed.awarenessScore;
    await this.petRepo.save(pet);

    const withRelations = await this.reportRepo.findOne({
      where: { id: saved.id },
      relations: ["pet"]
    });

    return toFullReport(withRelations!);
  }

  private async assertPetOwnedByUser(
    userId: string,
    petId: string
  ): Promise<PetOrmEntity> {
    const pet = await this.petRepo.findOne({
      where: { id: petId, owner: { id: userId } },
      relations: ["species", "breed", "owner"]
    });
    if (!pet) {
      throw new NotFoundException("Pet not found");
    }
    return pet;
  }

  private async buildPetContext(
    userId: string,
    pet: PetOrmEntity
  ): Promise<string> {
    const ageDays = petAgeDays(pet.birthDate);
    const ageLabel = formatPetAgeLabel(ageDays);
    const currentYear = new Date().getFullYear();

    const [healthLogs, preventiveSchedule, lifestyle] = await Promise.all([
      this.healthLogRepo.find({
        where: { pet: { id: pet.id } },
        order: { logDate: "DESC" },
        take: HEALTH_LOG_LIMIT
      }),
      this.preventiveCareItems.getScheduleForUser(userId, pet.id, currentYear),
      this.lifestyleGuidance.getGuidanceForUser(userId, pet.id)
    ]);

    const allPreventiveItems = preventiveSchedule.groups.flatMap((g) =>
      g.items.map((item) => ({
        group: g.title,
        title: item.title,
        type: item.type,
        dueDate: item.dueDate,
        completed: item.completedAt != null
      }))
    );

    const completedCount = allPreventiveItems.filter((i) => i.completed).length;
    const pendingCount = allPreventiveItems.length - completedCount;
    const overdueCount = allPreventiveItems.filter(
      (i) => !i.completed && i.dueDate < new Date().toISOString().slice(0, 10)
    ).length;

    const avg = (values: number[]) =>
      values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : null;

    const appetiteAvg = avg(healthLogs.map((l) => l.appetite));
    const energyAvg = avg(healthLogs.map((l) => l.energy));
    const moodAvg = avg(healthLogs.map((l) => l.mood));

    const lifestyleSummary = lifestyle.tabs.map((tab) => ({
      category: tab.title,
      tipCount: tab.items.length,
      tips: tab.items.slice(0, 5).map((t) => ({
        title: t.title,
        description: t.description
      }))
    }));

    const payload = {
      pet: {
        name: pet.name,
        species: pet.species.name,
        breed: pet.breed?.name ?? null,
        birthDate: pet.birthDate,
        ageDays,
        ageLabel,
        weightKg: pet.weightKg,
        expectedLifeSpanYears: pet.expectedLifeSpanYears,
        breedExpectedLifespanYears: pet.breed?.expectedLifespanYears ?? null
      },
      healthLogs: {
        totalCount: healthLogs.length,
        averages: {
          appetite: appetiteAvg,
          energy: energyAvg,
          mood: moodAvg
        },
        recentEntries: healthLogs.slice(0, 20).map((log) => ({
          date: log.logDate,
          weightKg: log.weightKg,
          appetite: log.appetite,
          energy: log.energy,
          mood: log.mood,
          notes: log.notes ?? ""
        }))
      },
      preventiveCare: {
        year: currentYear,
        totalItems: allPreventiveItems.length,
        completedCount,
        pendingCount,
        overdueCount,
        items: allPreventiveItems
      },
      lifestyleGuidance: {
        petAgeLabel: lifestyle.petAgeLabel,
        categories: lifestyleSummary
      }
    };

    return JSON.stringify(payload, null, 2);
  }

  private async callDeepseekWithRetry(
    apiKey: string,
    petContextJson: string
  ): Promise<DeepseekPetAiReportResponse & { model: string }> {
    const systemPrompt = `You are a veterinary wellness analyst for a pet health platform.
Analyze the provided pet data and produce a comprehensive wellness report as strict JSON.

Rules:
- awarenessScore (0-100): holistic pet health awareness score. 0 = critical neglect, 100 = exemplary proactive care.
  Factor in: health log consistency, appetite/energy/mood trends, preventive care completion, overdue items, weight tracking, lifestyle alignment with breed/species/age.
- Be specific to THIS pet's data. Reference actual numbers and items from the context.
- recommendations: actionable, prioritized (high/medium/low).
- actionSteps: concrete next steps the owner can take this week.
- nutritionRecommendations and activityRecommendations: breed/species/age appropriate.
- riskFactors: list concerns; empty array only if truly none.
- disclaimer: state this is educational, not veterinary diagnosis.
- All text fields: clear, empathetic, professional prose suitable for pet owners.
- Output ONLY valid JSON matching the required schema. No markdown.`;

    const userPrompt = `Analyze this pet's complete platform data and generate the wellness report JSON:

${petContextJson}

Required JSON keys:
awarenessScore, headline, executiveSummary, healthAnalysis, healthTrends,
preventiveCareAnalysis, lifestyleInsights, predictions, recommendations (array of {title, description, priority}),
actionSteps (string array), nutritionRecommendations (string array), activityRecommendations (string array),
riskFactors (string array), disclaimer`;

    let lastError = "Unknown validation error";

    for (let attempt = 1; attempt <= MAX_GENERATION_RETRIES; attempt++) {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      if (attempt > 1) {
        messages.push({
          role: "user",
          content: `Previous response failed validation: ${lastError}. Return corrected JSON only.`
        });
      }

      const result = await deepseekChatCompletion({
        apiKey,
        messages,
        temperature: 0.2,
        responseFormatJsonObject: true
      });

      let raw: unknown;
      try {
        raw = JSON.parse(result.content);
      } catch {
        lastError = "Response was not valid JSON";
        continue;
      }

      const parsed = deepseekPetAiReportResponseSchema.safeParse(raw);
      if (parsed.success) {
        return { ...parsed.data, model: result.model };
      }

      lastError = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    }

    throw new ServiceUnavailableException(
      `AI report generation failed after ${MAX_GENERATION_RETRIES} attempts: ${lastError}`
    );
  }
}
