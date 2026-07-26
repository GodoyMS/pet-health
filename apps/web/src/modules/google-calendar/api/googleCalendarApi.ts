import { httpClient } from "@shared/api/httpClient";

export interface CalendarSyncStatusPet {
  id: string;
  name: string;
  synced: boolean;
  syncedCount: number;
  pendingCount: number;
}

export interface CalendarSyncStatus {
  connected: boolean;
  syncedPetIds: string[];
  pets: CalendarSyncStatusPet[];
}

export interface SyncOptions {
  petIds?: string[];
  types?: string[];
  year?: number;
}

export interface SyncResult {
  created: number;
  skipped: number;
  failed: number;
}

export const googleCalendarApi = {
  getAuthUrl: async (): Promise<{ url: string }> => {
    const res = await httpClient.get("/google-calendar/auth-url");
    return res.data;
  },

  getStatus: async (): Promise<CalendarSyncStatus> => {
    const res = await httpClient.get("/google-calendar/status");
    return res.data;
  },

  // Calendar mutations make several sequential Google API calls server-side,
  // so they need a much longer timeout than the global default (10s).
  sync: async (options: SyncOptions = {}): Promise<SyncResult> => {
    const res = await httpClient.post("/google-calendar/sync", options, {
      timeout: 120_000
    });
    return res.data;
  },

  syncPet: async (petId: string, options: { types?: string[]; year?: number } = {}): Promise<SyncResult> => {
    const res = await httpClient.post(`/google-calendar/sync/pet/${petId}`, options, {
      timeout: 120_000
    });
    return res.data;
  },

  disconnect: async (): Promise<{ success: boolean }> => {
    const res = await httpClient.delete("/google-calendar/disconnect", {
      timeout: 120_000
    });
    return res.data;
  }
};

export interface CalendarPreventiveCareItem {
  id: string;
  ruleId: string;
  title: string;
  dueDate: string;
  type: string;
  completedAt: string | null;
  petId: string;
  petName: string;
}

export interface AllPreventiveCareCalendar {
  year: number;
  items: CalendarPreventiveCareItem[];
}

export const preventiveCareCalendarApi = {
  getAll: async (year?: number): Promise<AllPreventiveCareCalendar> => {
    const res = await httpClient.get("/pets/preventive-care/calendar", {
      params: year ? { year } : undefined
    });
    return res.data;
  }
};
