import { httpClient } from "./httpClient";

// ─── Shared types ────────────────────────────────────────────────────────────

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface DistributionSlice {
  label: string;
  count: number;
}

export interface OverviewMetrics {
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

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  provider: "email" | "google";
  role: "user" | "admin";
  createdAt: string;
  petCount: number;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  provider: "email" | "google";
  role: "user" | "admin";
  createdAt: string;
  pets: {
    id: string;
    name: string;
    speciesName: string | null;
    breedName: string | null;
    birthDate: string;
    weightKg: number | null;
    awarenessScore: number | null;
  }[];
}

export interface AdminPetListItem {
  id: string;
  name: string;
  speciesName: string | null;
  breedName: string | null;
  birthDate: string;
  weightKg: number | null;
  awarenessScore: number | null;
  owner: { id: string; name: string; email: string } | null;
}

export interface AdminPetDetail extends Omit<AdminPetListItem, "owner"> {
  expectedLifeSpanYears: number | null;
  owner: { id: string; name: string; email: string } | null;
  healthLogCount: number;
  aiReportCount: number;
  recentHealthLogs: {
    id: string;
    logDate: string;
    weightKg: number;
    appetite: number;
    energy: number;
    mood: number;
    notes: string | null;
  }[];
  careItems: {
    id: string;
    title: string;
    dueDate: string;
    completedAt: string | null;
  }[];
  recentAiReports: {
    id: string;
    headline: string;
    awarenessScore: number;
    model: string | null;
    generatedAt: string;
  }[];
}

export interface AdminHealthLog {
  id: string;
  logDate: string;
  weightKg: number;
  appetite: number;
  energy: number;
  mood: number;
  notes: string | null;
  createdAt: string;
  pet: { id: string; name: string; ownerEmail: string | null } | null;
}

export interface AdminAiReport {
  id: string;
  headline: string;
  awarenessScore: number;
  model: string | null;
  generatedAt: string;
  pet: { id: string; name: string; ownerEmail: string | null } | null;
}

export interface AdminAiReportDetail extends AdminAiReport {
  content: unknown;
}

export interface PreventiveRule {
  id: string;
  title: string;
  type: string;
  speciesId: string | null;
  speciesName: string | null;
  breedId: string | null;
  breedName: string | null;
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
  intervalDays: number | null;
  updatedAt: string;
}

export interface LifestyleRule {
  id: string;
  title: string;
  description: string;
  type: string;
  speciesId: string | null;
  speciesName: string | null;
  breedId: string | null;
  breedName: string | null;
  applicableMinAgeDays: number | null;
  applicableMaxAgeDays: number | null;
  updatedAt: string;
}

export interface AdminSpecies {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  imageUrl: string | null;
  petCount: number;
  breeds: { id: string; name: string; expectedLifespanYears: number | null }[];
}

export interface SystemStatus {
  api: {
    uptimeSeconds: number;
    nodeVersion: string;
    environment: string;
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  };
  database: { ok: boolean; latencyMs: number | null; error?: string };
  featureFlags: {
    googleAuth: boolean;
    googleCalendar: boolean;
    nearbyPlaces: boolean;
    aiReports: boolean;
  };
  tableCounts: Record<string, number | null>;
  checkedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string | null;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

// ─── API surface ─────────────────────────────────────────────────────────────

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

function clean(params: ListParams): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== ""
    )
  ) as Record<string, string | number>;
}

export const adminApi = {
  async overview(): Promise<OverviewMetrics> {
    const res = await httpClient.get("/admin/metrics/overview");
    return res.data;
  },

  // Users
  async listUsers(params: ListParams): Promise<Paginated<AdminUserListItem>> {
    const res = await httpClient.get("/admin/users", { params: clean(params) });
    return res.data;
  },
  async getUser(id: string): Promise<AdminUserDetail> {
    const res = await httpClient.get(`/admin/users/${id}`);
    return res.data;
  },
  async updateUser(
    id: string,
    body: { name?: string; role?: "user" | "admin" }
  ): Promise<AdminUserListItem> {
    const res = await httpClient.patch(`/admin/users/${id}`, body);
    return res.data;
  },
  async deleteUser(id: string): Promise<void> {
    await httpClient.delete(`/admin/users/${id}`);
  },

  // Pets
  async listPets(params: ListParams): Promise<Paginated<AdminPetListItem>> {
    const res = await httpClient.get("/admin/pets", { params: clean(params) });
    return res.data;
  },
  async getPet(id: string): Promise<AdminPetDetail> {
    const res = await httpClient.get(`/admin/pets/${id}`);
    return res.data;
  },
  async deletePet(id: string): Promise<void> {
    await httpClient.delete(`/admin/pets/${id}`);
  },

  // Records
  async listHealthLogs(params: ListParams): Promise<Paginated<AdminHealthLog>> {
    const res = await httpClient.get("/admin/health-logs", {
      params: clean(params)
    });
    return res.data;
  },
  async listAiReports(params: ListParams): Promise<Paginated<AdminAiReport>> {
    const res = await httpClient.get("/admin/ai-reports", {
      params: clean(params)
    });
    return res.data;
  },
  async getAiReport(id: string): Promise<AdminAiReportDetail> {
    const res = await httpClient.get(`/admin/ai-reports/${id}`);
    return res.data;
  },

  // Rules
  async listPreventiveRules(
    params: ListParams
  ): Promise<Paginated<PreventiveRule>> {
    const res = await httpClient.get("/admin/preventive-care-rules", {
      params: clean(params)
    });
    return res.data;
  },
  async createPreventiveRule(body: {
    title: string;
    speciesId: string;
    breedId: string;
    type: string;
    applicableMinAgeDays?: number | null;
    applicableMaxAgeDays?: number | null;
    intervalDays?: number | null;
  }): Promise<PreventiveRule> {
    const res = await httpClient.post("/admin/preventive-care-rules", body);
    return res.data;
  },
  async updatePreventiveRule(
    id: string,
    body: Partial<{
      title: string;
      type: string;
      applicableMinAgeDays: number | null;
      applicableMaxAgeDays: number | null;
      intervalDays: number | null;
    }>
  ): Promise<PreventiveRule> {
    const res = await httpClient.patch(`/admin/preventive-care-rules/${id}`, body);
    return res.data;
  },
  async deletePreventiveRule(id: string): Promise<void> {
    await httpClient.delete(`/admin/preventive-care-rules/${id}`);
  },

  async listLifestyleRules(params: ListParams): Promise<Paginated<LifestyleRule>> {
    const res = await httpClient.get("/admin/lifestyle-rules", {
      params: clean(params)
    });
    return res.data;
  },
  async createLifestyleRule(body: {
    title: string;
    description: string;
    speciesId: string;
    breedId: string;
    type: string;
    applicableMinAgeDays?: number | null;
    applicableMaxAgeDays?: number | null;
  }): Promise<{ id: string }> {
    const res = await httpClient.post("/admin/lifestyle-rules", body);
    return res.data;
  },
  async updateLifestyleRule(
    id: string,
    body: Partial<{
      title: string;
      description: string;
      type: string;
      applicableMinAgeDays: number | null;
      applicableMaxAgeDays: number | null;
    }>
  ): Promise<{ id: string }> {
    const res = await httpClient.patch(`/admin/lifestyle-rules/${id}`, body);
    return res.data;
  },
  async deleteLifestyleRule(id: string): Promise<void> {
    await httpClient.delete(`/admin/lifestyle-rules/${id}`);
  },

  // Reference + system
  async listSpecies(): Promise<AdminSpecies[]> {
    const res = await httpClient.get("/admin/species");
    return res.data;
  },
  async systemStatus(): Promise<SystemStatus> {
    const res = await httpClient.get("/admin/system/status");
    return res.data;
  },
  async listAuditLogs(params: ListParams): Promise<Paginated<AuditLogEntry>> {
    const res = await httpClient.get("/admin/system/audit-logs", {
      params: clean(params)
    });
    return res.data;
  }
};
