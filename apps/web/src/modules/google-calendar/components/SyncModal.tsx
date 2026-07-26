import React, { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Icon,
  Separator
} from "@repo/ui";

import type { CalendarSyncStatusPet } from "../api/googleCalendarApi";
import { useSyncGoogleCalendar } from "../hooks/useGoogleCalendar";

const CARE_TYPES = [
  { value: "vaccination", label: "Vaccinations", icon: "vaccines" },
  { value: "deworming", label: "Deworming", icon: "medication" },
  { value: "checkup", label: "Health Checkups", icon: "stethoscope" },
  { value: "parasite_control", label: "Parasite Control", icon: "bug_report" }
] as const;

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
  pets: CalendarSyncStatusPet[];
}

export function SyncModal({ open, onClose, pets }: SyncModalProps) {
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [allPets, setAllPets] = useState(true);
  const [allTypes, setAllTypes] = useState(true);
  const sync = useSyncGoogleCalendar();

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSync = async () => {
    await sync.mutateAsync({
      petIds: allPets ? undefined : selectedPetIds,
      types: allTypes ? undefined : selectedTypes,
      year: new Date().getFullYear()
    });
    onClose();
  };

  const canSync = (allPets || selectedPetIds.length > 0) && (allTypes || selectedTypes.length > 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon name="calendar_add_on" className="text-lg text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Sync to Google Calendar
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select what to sync for {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Pet selection */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Pets</p>

            <RadioOption
              selected={allPets}
              onClick={() => { setAllPets(true); setSelectedPetIds([]); }}
              label="All pets"
              description={`${pets.length} pet${pets.length !== 1 ? "s" : ""}`}
            />
            <RadioOption
              selected={!allPets}
              onClick={() => setAllPets(false)}
              label="Select specific pets"
            />

            {!allPets && (
              <div className="ml-1 space-y-2 pl-3 border-l-2 border-muted">
                {pets.map((pet) => (
                  <label key={pet.id} className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={selectedPetIds.includes(pet.id)}
                      onChange={() => togglePet(pet.id)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <div className="flex items-center gap-2">
                      <Icon name="pets" className="text-sm text-muted-foreground" />
                      <span className="text-sm">{pet.name}</span>
                      {pet.synced && <Badge variant="success" className="text-[10px] py-0 px-1.5">Synced</Badge>}
                      {!pet.synced && pet.pendingCount > 0 && (
                        <span className="text-xs text-muted-foreground">· {pet.pendingCount} pending</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Type selection */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Care types</p>

            <RadioOption
              selected={allTypes}
              onClick={() => { setAllTypes(true); setSelectedTypes([]); }}
              label="All care types"
            />

            <div className="grid grid-cols-2 gap-2">
              {CARE_TYPES.map((type) => {
                const selected = !allTypes && selectedTypes.includes(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => { setAllTypes(false); toggleType(type.value); }}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <Icon name={type.icon} className="text-base text-muted-foreground" />
                    <span className="text-xs font-medium leading-tight">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10 flex-row items-center justify-between gap-3 sm:justify-between">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Already synced events will be skipped.
          </p>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={sync.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSync} disabled={!canSync || sync.isPending} className="gap-2 min-w-[100px]">
              {sync.isPending ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" className="text-sm animate-spin" />
                  Syncing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="sync" className="text-sm" />
                  Sync now
                </span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RadioOption({
  selected,
  onClick,
  label,
  description
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
      }`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}
      >
        {selected && <Icon name="check" className="text-[10px] text-white" />}
      </div>
      <div>
        <span className="text-sm font-medium">{label}</span>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </button>
  );
}
