import React, { useEffect, useState } from "react";

import { Icon } from "@repo/ui";

const ANALYSIS_STEPS = [
  {
    icon: "pets" as const,
    label: "Profile & breed",
    detail: "Analyzing species, breed, age, and weight profile"
  },
  {
    icon: "assignment" as const,
    label: "Health logs",
    detail: "Reviewing appetite, energy, mood, and weight trends"
  },
  {
    icon: "vaccines" as const,
    label: "Preventive care",
    detail: "Evaluating vaccinations, checkups, and overdue items"
  },
  {
    icon: "nutrition" as const,
    label: "Lifestyle rules",
    detail: "Cross-referencing exercise, feeding, and safety guidance"
  },
  {
    icon: "monitoring" as const,
    label: "Predictions",
    detail: "Synthesizing insights and computing awareness score"
  },
  {
    icon: "auto_awesome" as const,
    label: "Report assembly",
    detail: "Crafting personalized recommendations and action plan"
  }
];

type AiAnalysisAnimationProps = {
  petName: string;
};

export function AiAnalysisAnimation({ petName }: AiAnalysisAnimationProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const current = ANALYSIS_STEPS[activeStep]!;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/8 via-card to-card p-8 shadow-lg"
      role="status"
      aria-live="polite"
      aria-label={`AI analysis in progress for ${petName}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 size-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 size-80 animate-pulse rounded-full bg-primary/5 blur-3xl [animation-delay:1s]" />
      </div>

      <div className="relative flex flex-col items-center gap-8 text-center">
        <div className="relative flex size-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary [animation-duration:3s]" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-primary/10 border-b-primary/60 [animation-duration:2s] [animation-direction:reverse]" />
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Icon name="auto_awesome" className="size-7 animate-pulse" aria-hidden />
          </div>
        </div>

        <div className="max-w-md space-y-2">
          <p className="font-display text-xl font-semibold text-foreground">
            Analyzing {petName}&apos;s wellness
          </p>
          <p className="text-sm text-muted-foreground">
            DeepSeek AI is reviewing health logs, preventive care, lifestyle
            guidance, and breed-specific data to build your report.
          </p>
        </div>

        <div className="w-full max-w-lg space-y-3">
          {ANALYSIS_STEPS.map((step, index) => {
            const isActive = index === activeStep;
            const isDone = index < activeStep;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                  isActive
                    ? "border-primary/40 bg-primary/10 shadow-sm"
                    : isDone
                      ? "border-border/40 bg-muted/30 opacity-70"
                      : "border-border/30 bg-transparent opacity-40"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon
                    name={isDone ? "check" : step.icon}
                    className="size-4"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive ? (
                    <p className="mt-0.5 text-xs text-muted-foreground animate-pulse">
                      {step.detail}
                    </p>
                  ) : null}
                </div>
                {isActive ? (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="size-1.5 animate-bounce rounded-full bg-primary"
                        style={{ animationDelay: `${dot * 150}ms` }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          This may take 15–30 seconds. Please keep this page open.
        </p>
      </div>
    </div>
  );
}
