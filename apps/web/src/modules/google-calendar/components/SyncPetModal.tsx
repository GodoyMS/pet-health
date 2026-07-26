import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Icon,
  Separator
} from "@repo/ui";

import { useSyncPetGoogleCalendar } from "../hooks/useGoogleCalendar";

const CARE_TYPES = [
  { value: "vaccination", label: "Vaccinations", icon: "vaccines" },
  { value: "deworming", label: "Deworming", icon: "medication" },
  { value: "checkup", label: "Health Checkups", icon: "stethoscope" },
  { value: "parasite_control", label: "Parasite Control", icon: "bug_report" }
] as const;

interface SyncPetModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

export function SyncPetModal({ open, onClose, petId, petName }: SyncPetModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [allTypes, setAllTypes] = useState(true);
  const sync = useSyncPetGoogleCalendar();

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSync = async () => {
    await sync.mutateAsync({
      petId,
      types: allTypes ? undefined : selectedTypes,
      year: new Date().getFullYear()
    });
    onClose();
  };

  const canSync = allTypes || selectedTypes.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 py-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon name="pets" className="text-lg text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Sync {petName} to Calendar
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pending events for {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Which care types would you like to sync for <strong>{petName}</strong>?
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => { setAllTypes(true); setSelectedTypes([]); }}
              className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                allTypes ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
              }`}
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${allTypes ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                {allTypes && <Icon name="check" className="text-[10px] text-white" />}
              </div>
              <span className="text-sm font-medium">All care types</span>
            </button>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              {CARE_TYPES.map((type) => {
                const selected = !allTypes && selectedTypes.includes(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => { setAllTypes(false); toggleType(type.value); }}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted/30"
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

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10 flex-row justify-end gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={sync.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={!canSync || sync.isPending} className="gap-2 min-w-[90px]">
            {sync.isPending ? (
              <span className="flex items-center gap-2">
                <Icon name="progress_activity" className="text-sm animate-spin" />
                Syncing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon name="sync" className="text-sm" />
                Sync
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
