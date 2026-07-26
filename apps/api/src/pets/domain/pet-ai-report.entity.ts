/** Structured AI report payload stored as JSONB. */
export interface AiReportRecommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
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

export interface PetAiReport {
  id: string;
  petId: string;
  awarenessScore: number;
  headline: string;
  content: AiReportContent;
  model: string | null;
  generatedAt: string;
}

export interface PetAiReportSummary {
  id: string;
  petId: string;
  awarenessScore: number;
  headline: string;
  generatedAt: string;
}
