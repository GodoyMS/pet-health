import React, { useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import {
  Alert,
  Icon,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@repo/ui";

import type { LifestyleCategory } from "../api/lifestyleApi";
import { LifestyleGuidanceList } from "../components/Lifestyle/LifestyleGuidanceList";
import { PetSectionHeader } from "../components/PetSectionHeader";
import { usePetLifestyle } from "../hooks/usePetLifestyle";
import type { PetOutletContext } from "./PetDetailLayout";

const DEFAULT_TAB: LifestyleCategory = "exercise";

export function PetLifestylePage() {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();
  const id = petId ?? pet.id;

  const { data: guidance, isLoading, isError } = usePetLifestyle(id);
  const [activeTab, setActiveTab] = useState<LifestyleCategory>(DEFAULT_TAB);

  const tabs = guidance?.tabs ?? [];
  const resolvedTab = useMemo(() => {
    if (tabs.some((t) => t.key === activeTab)) return activeTab;
    return tabs[0]?.key ?? DEFAULT_TAB;
  }, [tabs, activeTab]);

  return (
    <div className="flex w-full flex-col gap-6">
      <PetSectionHeader
        title="Lifestyle"
        description={
          guidance
            ? guidance.breedName
              ? `Breed-specific guidance for ${guidance.breedName} tailored to ${pet.name}'s age.`
              : `General ${guidance.speciesName} guidance — add a breed on the profile for richer tips.`
            : "Exercise, feeding, and food-safety tips for your companion."
        }
      />

      {!isLoading && !isError && guidance ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <div className="flex gap-2">
            <Icon
              name="info"
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <p>
              Tips below are filtered for{" "}
              <strong className="font-medium">{pet.name}</strong>
              &apos;s current age ({guidance.petAgeLabel}). Each item shows when
              it applies; guidance may change as your pet grows—check back after
              birthdays or when your vet updates their care plan.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-foreground/90">
        <strong className="font-medium">Educational only.</strong> These tips are
        general wellness information—not a substitute for veterinary advice.
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : null}

      {isError ? (
        <Alert variant="error">
          Could not load lifestyle guidance. Try again later.
        </Alert>
      ) : null}

      {!isLoading && !isError && guidance ? (
        <Tabs
          value={resolvedTab}
          onValueChange={(v) => setActiveTab(v as LifestyleCategory)}
          className="gap-4"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 p-1">
            {guidance.tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="px-2 py-2 text-xs sm:text-sm"
              >
                <Icon name={tab.icon} className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{tab.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {guidance.tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-0">
              <section className="rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm sm:p-5">
                <header className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={tab.icon} className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold text-foreground">
                      {tab.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {tab.items.length}{" "}
                      {tab.items.length === 1 ? "tip" : "tips"} for{" "}
                      {pet.name} at {guidance.petAgeLabel}
                    </p>
                  </div>
                </header>
                <LifestyleGuidanceList
                  items={tab.items}
                  emptyMessage={`No ${tab.title.toLowerCase()} tips match ${pet.name}'s age right now.`}
                />
              </section>
            </TabsContent>
          ))}
        </Tabs>
      ) : null}
    </div>
  );
}
