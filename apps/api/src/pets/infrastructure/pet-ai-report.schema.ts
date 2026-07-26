import { z } from "zod";

export const aiReportRecommendationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  priority: z.enum(["high", "medium", "low"])
});

export const deepseekPetAiReportResponseSchema = z.object({
  awarenessScore: z.number().int().min(0).max(100),
  headline: z.string().trim().min(1).max(300),
  executiveSummary: z.string().trim().min(1).max(4000),
  healthAnalysis: z.string().trim().min(1).max(4000),
  healthTrends: z.string().trim().min(1).max(3000),
  preventiveCareAnalysis: z.string().trim().min(1).max(3000),
  lifestyleInsights: z.string().trim().min(1).max(3000),
  predictions: z.string().trim().min(1).max(3000),
  recommendations: z.array(aiReportRecommendationSchema).min(1).max(12),
  actionSteps: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
  nutritionRecommendations: z
    .array(z.string().trim().min(1).max(500))
    .min(1)
    .max(8),
  activityRecommendations: z
    .array(z.string().trim().min(1).max(500))
    .min(1)
    .max(8),
  riskFactors: z.array(z.string().trim().min(1).max(500)).max(8),
  disclaimer: z.string().trim().min(1).max(1000)
});

export type DeepseekPetAiReportResponse = z.infer<
  typeof deepseekPetAiReportResponseSchema
>;
