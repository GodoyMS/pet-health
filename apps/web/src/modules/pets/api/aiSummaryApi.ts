import { httpClient } from "@shared/api/httpClient";

export type AiReportPriority = "high" | "medium" | "low";

export interface AiReportRecommendation {
  title: string;
  description: string;
  priority: AiReportPriority;
}

export interface AiReportContent {
  executiveSummary: string;
  healthAnalysis: string;
  healthTrends: string;
  preventiveCareAnalysis: string;
  lifestyleInsights: string;
  predictions: string;
  recommendations: AiReportRecommendation[];
  actionSteps: string[];
  nutritionRecommendations: string[];
  activityRecommendations: string[];
  riskFactors: string[];
  disclaimer: string;
}

export interface PetAiReportSummary {
  id: string;
  petId: string;
  awarenessScore: number;
  headline: string;
  generatedAt: string;
}

export interface PetAiReport extends PetAiReportSummary {
  content: AiReportContent;
  model: string | null;
}

export const aiSummaryApi = {
  list(petId: string) {
    return httpClient.get<PetAiReportSummary[]>(`/pets/${petId}/ai-reports`);
  },
  get(petId: string, reportId: string) {
    return httpClient.get<PetAiReport>(`/pets/${petId}/ai-reports/${reportId}`);
  },
  generate(petId: string) {
    return httpClient.post<PetAiReport>(`/pets/${petId}/ai-reports/generate`, undefined, {
      timeout: 120_000
    });
  }
};
