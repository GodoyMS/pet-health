import type { PreventiveCareSummary } from "../../pets/application/preventive-care-summary";

export interface DashboardSummary {
  petCount: number;
  totalHealthLogs: number;
  overduePreventiveItems: number;
  upcomingPreventiveItems: number;
  averageAwarenessScore: number | null;
  bestLoggingStreakDays: number;
  logsThisWeek: number;
}

export interface DashboardPetCard {
  id: string;
  name: string;
  speciesName: string;
  speciesImageUrl: string | null;
  breedName: string | null;
  awarenessScore: number | null;
  weightKg: number | null;
  preventiveCare: PreventiveCareSummary;
  lastHealthLogDate: string | null;
  loggingStreakDays: number;
  nextDueDate: string | null;
  nextDueTitle: string | null;
}

export type DashboardAlertType =
  | "overdue_preventive"
  | "missing_logs"
  | "upcoming_due";

export interface DashboardAlert {
  type: DashboardAlertType;
  petId: string;
  petName: string;
  message: string;
  severity: "high" | "medium" | "low";
  actionPath: string;
}

export type DashboardActivityType =
  | "health_log"
  | "preventive_completed"
  | "ai_report";

export interface DashboardActivity {
  type: DashboardActivityType;
  petId: string;
  petName: string;
  date: string;
  description: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  pets: DashboardPetCard[];
  alerts: DashboardAlert[];
  recentActivity: DashboardActivity[];
}
