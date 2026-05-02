import React from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import { Icon } from "@repo/ui";

import type { PetOutletContext } from "./PetDetailLayout";
import {
  computeAgeLabel,
  computeAgeYearsDecimal,
  inferLifeStageLabel
} from "../utils/petAge";

/** Demo metric until backend supports it */
const MOCK_AWARENESS_SCORE = 82;

function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm transition hover:border-border">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function PetOverviewPage() {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();

  const ageDecimal = computeAgeYearsDecimal(pet.birthDate);
  const ageLabel = computeAgeLabel(pet.birthDate);
  const lifeStage =
    ageDecimal >= 0 ? inferLifeStageLabel(ageDecimal) : "—";

  const basePath = `/dashboard/pets/${petId ?? pet.id}`;

  const actionsPrimary = [
    {
      slug: "preventive-care",
      title: "Preventive Care",
      description: "Vaccines, parasite control, and scheduled wellness.",
      icon: "vaccines" as const
    },
    {
      slug: "health-logs",
      title: "Health Logs",
      description: "Symptoms, medications, and vet visit notes.",
      icon: "assignment" as const
    },
    {
      slug: "analytics",
      title: "Analytics",
      description: "Trends and comparisons over time.",
      icon: "monitoring" as const
    },
    {
      slug: "lifestyle",
      title: "Lifestyle",
      description: "Activity, diet, and environment.",
      icon: "nutrition" as const
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="sr-only">Overview metrics</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard label="Age" value={ageLabel} hint="From birth date" />
          <StatCard label="Life stage" value={lifeStage} hint="Estimated (demo)" />
          <StatCard
            label="Weight"
            value={
              pet.weightKg != null
                ? `${pet.weightKg.toFixed(1)} kg`
                : "—"
            }
            hint={
              pet.weightKg != null
                ? "Recorded at registration"
                : "Not set yet"
            }
          />
          <StatCard
            label="Awareness score"
            value={`${MOCK_AWARENESS_SCORE}`}
            hint="Engagement index (demo)"
          />
        </div>
      </section>

      <section className="rounded-xl border border-border/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Expected lifespan <span className="text-muted-foreground font-normal">(reference)</span>
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Typical ranges vary widely by genetics, care, and environment.{" "}
              {pet.expectedLifeSpanYears != null ? (
                <>
                  Recorded estimate for your profile:{" "}
                  <span className="font-medium text-foreground">
                    ~{pet.expectedLifeSpanYears} years
                  </span>
                  .{" "}
                </>
              ) : (
                <>Your vet can add a tailored estimate to your record. </>
              )}
              This tool shows generic guidance only —{" "}
              <strong className="text-foreground/90">
                ask your veterinarian to confirm details
              </strong>{" "}
              for your companion.
            </p>
          </div>
          <div className="shrink-0 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Educational · not a diagnosis
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {actionsPrimary.map((a) => (
            <Link
              key={a.slug}
              to={`${basePath}/${a.slug}`}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/15">
                  <Icon name={a.icon}  aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {a.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                    {a.description}
                  </p>
                </div>
                <Icon
                  name="chevron_right"
                  className="size-5 shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden
                />
              </div>
            </Link>
          ))}

          <Link
            to={`${basePath}/ai-summary`}
            className="group relative overflow-hidden rounded-xl border-2 border-primary/35 bg-linear-to-br from-primary/10 via-card to-card p-5 shadow-md transition hover:border-primary/55 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:col-span-2"
          >
            <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Premium
            </span>
            <div className="flex items-start gap-4 pr-16">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Icon name="auto_awesome"  aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold text-foreground">
                  AI Summary
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Unified narrative across health signals — the flagship view for proactive
                  pet care (included with Premium).
                </p>
              </div>
              <Icon
                name="chevron_right"
                className="size-5 shrink-0 text-primary opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                aria-hidden
              />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
