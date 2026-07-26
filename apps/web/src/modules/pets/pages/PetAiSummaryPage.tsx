import React from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";

import {
  Alert,
  Badge,
  Button,
  Icon,
  Skeleton
} from "@repo/ui";

import { AiAnalysisAnimation } from "../components/AiSummary/AiAnalysisAnimation";
import { AiReportListItem } from "../components/AiSummary/AiReportListItem";
import { AwarenessScoreRing } from "../components/AiSummary/AwarenessScoreRing";
import { PetSectionHeader } from "../components/PetSectionHeader";
import { useGenerateAiReport } from "../hooks/useGenerateAiReport";
import { usePetAiReports } from "../hooks/usePetAiReports";
import type { PetOutletContext } from "./PetDetailLayout";

export function PetAiSummaryPage() {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();
  const id = petId ?? pet.id;
  const navigate = useNavigate();

  const { data: reports, isLoading, isError } = usePetAiReports(id);
  const generate = useGenerateAiReport(id);

  const handleGenerate = () => {
    generate.mutate(undefined, {
      onSuccess: (report) => {
        navigate(`/dashboard/pets/${id}/ai-summary/${report.id}`);
      }
    });
  };

  const latestScore = pet.awarenessScore ?? reports?.[0]?.awarenessScore ?? null;

  return (
    <div className="flex w-full flex-col gap-8">
      <PetSectionHeader
        title="AI Summary"
        description={`Deep wellness analysis for ${pet.name} — powered by DeepSeek AI across health logs, preventive care, and lifestyle guidance.`}
        actions={
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
            <Icon name="auto_awesome" className="mr-1 size-3.5" aria-hidden />
            Premium
          </Badge>
        }
      />

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
        <div className="flex gap-2">
          <Icon name="info" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            Reports analyze your pet&apos;s complete platform data — profile, health
            logs, preventive care completion, and breed-specific lifestyle rules.
            The <strong className="font-medium">awareness score</strong> (0–100)
            reflects how proactively you&apos;re managing your companion&apos;s wellness.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-foreground/90">
        <strong className="font-medium">Educational only.</strong> AI reports are
        wellness insights, not veterinary diagnoses. Always consult your vet for
        medical decisions.
      </div>

      {generate.isPending ? (
        <AiAnalysisAnimation petName={pet.name} />
      ) : (
        <div className="rounded-2xl border border-primary/30 bg-linear-to-br from-primary/8 via-card to-card p-6 shadow-md">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {latestScore != null ? (
                <AwarenessScoreRing score={latestScore} size="sm" />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
                  <Icon name="insights" className="text-2xl" aria-hidden />
                </div>
              )}
              <div>
                <p className="font-display text-lg font-semibold text-foreground">
                  {latestScore != null
                    ? "Current awareness score"
                    : "No report yet"}
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {latestScore != null
                    ? "Based on your latest AI wellness report. Generate a new report to refresh."
                    : "Generate your first AI report to get a personalized wellness score and action plan."}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="shrink-0 gap-2 shadow-lg shadow-primary/20"
              onClick={handleGenerate}
              disabled={generate.isPending}
            >
              <Icon name="auto_awesome" className="text-lg" aria-hidden />
              {reports?.length ? "Generate new report" : "Generate AI report"}
            </Button>
          </div>
        </div>
      )}

      {generate.isError ? (
        <Alert variant="error">
          {(generate.error as Error)?.message ??
            "Failed to generate report. Check that DEEPSEEK_API_KEY is configured and try again."}
        </Alert>
      ) : null}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Report history
        </h2>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : null}

        {isError ? (
          <Alert variant="error">Could not load reports. Please try again.</Alert>
        ) : null}

        {!isLoading && !isError && reports?.length === 0 && !generate.isPending ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="description" className="text-xl" aria-hidden />
            </div>
            <div>
              <p className="font-medium text-foreground">No reports yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Tap &quot;Generate AI report&quot; above to create your first
                comprehensive wellness analysis for {pet.name}.
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && reports && reports.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <AiReportListItem key={report.id} report={report} petId={id} />
            ))}
          </div>
        ) : null}
      </section>

      <Button variant="outline" asChild>
        <Link to={`/dashboard/pets/${id}`}>Back to overview</Link>
      </Button>
    </div>
  );
}
