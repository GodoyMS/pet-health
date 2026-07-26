import React, { useCallback, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import { Alert, Badge, Button, Icon, Skeleton } from "@repo/ui";

import type { PreventiveCareScheduleItem } from "../api/preventiveCareApi";
import { PetSectionHeader } from "../components/PetSectionHeader";
import { PreventiveCareScheduleTabs } from "../components/PreventiveCare/PreventiveCareScheduleTabs";
import { usePetPreventiveCare } from "../hooks/usePetPreventiveCare";
import { useTogglePreventiveCareItem } from "../hooks/useTogglePreventiveCareItem";
import type { PetOutletContext } from "./PetDetailLayout";
import { useCalendarStatus, useSyncPetGoogleCalendar } from "@modules/google-calendar/hooks/useGoogleCalendar";
import { SyncPetModal } from "@modules/google-calendar/components/SyncPetModal";

const currentYear = new Date().getFullYear();

export function PetPreventiveCarePage() {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();
  const id = petId ?? pet.id;

  const { data: schedule, isLoading, isError } = usePetPreventiveCare(id, currentYear);
  const toggleItem = useTogglePreventiveCareItem(id, currentYear);
  const { data: calendarStatus } = useCalendarStatus();
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const handleToggle = useCallback(
    (item: PreventiveCareScheduleItem) => {
      toggleItem.mutate(item.id);
    },
    [toggleItem]
  );

  const breedLabel = schedule?.breedName ?? pet.breed?.name ?? null;
  const scheduleYear = schedule?.year ?? currentYear;

  const petSyncStatus = calendarStatus?.pets.find((p) => p.id === id);
  const isConnected = calendarStatus?.connected ?? false;
  const isSynced = petSyncStatus?.synced ?? false;
  const pendingCount = petSyncStatus?.pendingCount ?? 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <PetSectionHeader
        title="Preventive Care"
        description={
          breedLabel
            ? `${scheduleYear} schedule tailored to ${breedLabel}. Switch tabs to review vaccinations, deworming, and wellness checks.`
            : `Add a breed to unlock a tailored ${scheduleYear} care plan.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 font-normal">
              <Icon name="calendar_today" className="size-3.5" aria-hidden />
              {scheduleYear}
            </Badge>

            {isConnected && pendingCount > 0 && (
              <Button
                variant={isSynced ? "outline" : "default"}
                size="sm"
                onClick={() => setSyncModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Icon name={isSynced ? "event_available" : "sync"} className="size-3.5" />
                {isSynced ? "Synced" : "Sync to Calendar"}
              </Button>
            )}

            {!isConnected && (
              <Link to="/dashboard/settings">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  <Icon name="calendar_add_on" className="size-3.5" />
                  Connect Calendar
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Google Calendar sync suggestion for unsynced pet */}
      {isConnected && !isSynced && pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Icon name="calendar_add_on" className="text-sm text-primary shrink-0" />
          <p className="flex-1 text-xs text-foreground/80">
            {petSyncStatus?.syncedCount
              ? `${petSyncStatus.syncedCount} of ${pendingCount} events synced to Google Calendar.`
              : `${pendingCount} pending event${pendingCount !== 1 ? "s" : ""} not yet synced to Google Calendar.`}
          </p>
          <button
            onClick={() => setSyncModalOpen(true)}
            className="text-xs text-primary font-medium underline underline-offset-2 shrink-0"
          >
            Sync now
          </button>
        </div>
      )}

      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-foreground/90">
        <strong className="font-medium">Educational use only.</strong> Schedules
        are generated from species and breed guidelines and your pet&apos;s birth
        date. Always confirm timing and products with your veterinarian.
      </div>

      {!breedLabel && !isLoading ? (
        <Alert variant="warning">
          Add a breed to this pet to see a tailored preventive care schedule.
        </Alert>
      ) : null}

      {toggleItem.isError ? (
        <Alert variant="error">
          Could not update that item. Please try again.
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : null}

      {isError ? (
        <Alert variant="error">
          Could not load the preventive care schedule. Try again later.
        </Alert>
      ) : null}

      {!isLoading && !isError && breedLabel && schedule?.groups.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <Icon name="event_busy" className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            Nothing scheduled for {scheduleYear}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No preventive care items fall in this calendar year. Check back next
            year, or ask your vet for a tailored plan.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link to={`/dashboard/pets/${id}`}>Back to overview</Link>
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && schedule && schedule.groups.length > 0 ? (
        <PreventiveCareScheduleTabs
          groups={schedule.groups}
          petName={pet.name}
          onToggleItem={handleToggle}
          togglingItemId={toggleItem.isPending ? toggleItem.variables : undefined}
        />
      ) : null}

      {/* Sync modal for this specific pet */}
      {isConnected && (
        <SyncPetModal
          open={syncModalOpen}
          onClose={() => setSyncModalOpen(false)}
          petId={id}
          petName={pet.name}
        />
      )}
    </div>
  );
}
