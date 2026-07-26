import { httpClient } from "@shared/api/httpClient";

import type { HealthLogDraft, HealthLogEntry, HealthRating } from "../components/HealthLogs/types";

export interface HealthLogKpis {
  appetite: number | null;
  energy: number | null;
  mood: number | null;
  logCount: number;
}

export interface PaginatedHealthLogs {
  petId: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  kpis: HealthLogKpis;
  items: HealthLogEntry[];
}

export interface ListHealthLogsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

function toHealthRating(value: number): HealthRating {
  return value as HealthRating;
}

function mapItem(item: HealthLogEntry): HealthLogEntry {
  return {
    ...item,
    appetite: toHealthRating(item.appetite),
    energy: toHealthRating(item.energy),
    mood: toHealthRating(item.mood)
  };
}

export const healthLogsApi = {
  list(petId: string, params: ListHealthLogsParams = {}) {
    return httpClient.get<PaginatedHealthLogs>(`/pets/${petId}/health-logs`, {
      params
    });
  },

  create(petId: string, payload: HealthLogDraft) {
    return httpClient.post<HealthLogEntry>(`/pets/${petId}/health-logs`, payload);
  }
};

export function mapPaginatedHealthLogs(data: PaginatedHealthLogs): PaginatedHealthLogs {
  return {
    ...data,
    items: data.items.map(mapItem)
  };
}
