import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui";

import { googleCalendarApi, preventiveCareCalendarApi, type SyncOptions } from "../api/googleCalendarApi";

export const CALENDAR_STATUS_KEY = ["google-calendar", "status"];
export const CALENDAR_ITEMS_KEY = (year: number) => ["google-calendar", "items", year];

export function useCalendarStatus() {
  return useQuery({
    queryKey: CALENDAR_STATUS_KEY,
    queryFn: () => googleCalendarApi.getStatus(),
    staleTime: 30_000
  });
}

export function useAllPreventiveCareCalendar(year: number) {
  return useQuery({
    queryKey: CALENDAR_ITEMS_KEY(year),
    queryFn: () => preventiveCareCalendarApi.getAll(year),
    staleTime: 60_000
  });
}

export function useConnectGoogleCalendar() {
  return useMutation({
    mutationFn: async () => {
      const { url } = await googleCalendarApi.getAuthUrl();
      window.location.href = url;
    },
    onError: () => {
      toast.error("Could not initiate Google Calendar connection. Try again.");
    }
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => googleCalendarApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_STATUS_KEY });
      toast.success("Google Calendar disconnected. All synced events have been removed.");
    },
    onError: () => {
      toast.error("Could not disconnect Google Calendar. Try again.");
    }
  });
}

export function useSyncGoogleCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: SyncOptions) => googleCalendarApi.sync(options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_STATUS_KEY });
      if (result.created === 0 && result.skipped > 0) {
        toast.info(`All events already synced (${result.skipped} skipped).`);
      } else {
        toast.success(
          `Synced ${result.created} event${result.created !== 1 ? "s" : ""} to Google Calendar.${result.skipped ? ` ${result.skipped} already synced.` : ""}${result.failed ? ` ${result.failed} failed.` : ""}`
        );
      }
    },
    onError: () => {
      toast.error("Could not sync to Google Calendar. Try again.");
    }
  });
}

export function useSyncPetGoogleCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, types, year }: { petId: string; types?: string[]; year?: number }) =>
      googleCalendarApi.syncPet(petId, { types, year }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_STATUS_KEY });
      if (result.created === 0 && result.skipped > 0) {
        toast.info(`All events already synced (${result.skipped} skipped).`);
      } else {
        toast.success(
          `Synced ${result.created} event${result.created !== 1 ? "s" : ""} to Google Calendar.`
        );
      }
    },
    onError: () => {
      toast.error("Could not sync to Google Calendar. Try again.");
    }
  });
}
