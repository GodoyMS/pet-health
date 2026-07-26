import { httpClient } from "@shared/api/httpClient";

export interface WeightTrendPoint {
  label: string;
  date: string;
  kg: number;
}

export interface WellnessDayPoint {
  date: string;
  short: string;
  energy: number;
  mood: number;
}

export interface LoggingWeekDay {
  date: string;
  short: string;
  logged: boolean;
  isToday: boolean;
}

export interface LoggingWeekBar {
  label: string;
  loggedDays: number;
}

export interface LoggingConsistency {
  streakDays: number;
  weekCompletion: number;
  totalLogsLast30Days: number;
  lastLogDate: string | null;
  daysSinceLastLog: number | null;
  currentWeekDays: LoggingWeekDay[];
  recentWeeks: LoggingWeekBar[];
  headline: string;
  subline: string;
  tip: string;
}

export interface PetAnalyticsKpis {
  appetite: number | null;
  energy: number | null;
  mood: number | null;
  logCount: number;
}

export interface PetAnalytics {
  petId: string;
  weightTrend: WeightTrendPoint[];
  wellnessWeek: WellnessDayPoint[];
  loggingConsistency: LoggingConsistency;
  kpis: PetAnalyticsKpis;
}

export const analyticsApi = {
  get(petId: string) {
    return httpClient.get<PetAnalytics>(`/pets/${petId}/analytics`);
  }
};
