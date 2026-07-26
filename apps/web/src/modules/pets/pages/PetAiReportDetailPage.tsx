import React from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import {
  Alert,
  Badge,
  Button,
  Icon,
  Skeleton
} from "@repo/ui";

import { AiReportProse, AiReportSection, AiReportList } from "../components/AiSummary/AiReportSection";
import { AiReportRecommendations } from "../components/AiSummary/AiReportRecommendations";
import { AwarenessScoreRing } from "../components/AiSummary/AwarenessScoreRing";
import { PetSectionHeader } from "../components/PetSectionHeader";
import { usePetAiReport } from "../hooks/usePetAiReports";
import {
  formatReportDate,
  getAwarenessScoreLabel
} from "../utils/awarenessScore";
import type { PetOutletContext } from "./PetDetailLayout";

export function PetAiReportDetailPage() {
  const { petId, reportId } = useParams<{ petId: string; reportId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();
  const id = petId ?? pet.id;

  const { data: report, isLoading, isError } = usePetAiReport(id, reportId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error">Report not found or could not be loaded.</Alert>
        <Button variant="outline" asChild>
          <Link to={`/dashboard/pets/${id}/ai-summary`}>Back to AI Summary</Link>
        </Button>
      </div>
    );
  }

  const { content } = report;

  return (
    <div className="flex w-full flex-col gap-8">
      <PetSectionHeader
        title="Wellness Report"
        description={`Generated ${formatReportDate(report.generatedAt)}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/pets/${id}/ai-summary`}>
              <Icon name="arrow_back" className="mr-1.5 size-4" aria-hidden />
              All reports
            </Link>
          </Button>
        }
      />

      <header className="relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-br from-primary/10 via-card to-card p-8 shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <AwarenessScoreRing score={report.awarenessScore} />
          <div className="flex-1 space-y-3">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              {getAwarenessScoreLabel(report.awarenessScore)} · Awareness score
            </Badge>
            <h1 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {report.headline}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {content.executiveSummary}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiReportSection icon="monitor_heart" title="Health analysis">
          <AiReportProse text={content.healthAnalysis} />
        </AiReportSection>

        <AiReportSection icon="trending_up" title="Health trends">
          <AiReportProse text={content.healthTrends} />
        </AiReportSection>

        <AiReportSection icon="vaccines" title="Preventive care">
          <AiReportProse text={content.preventiveCareAnalysis} />
        </AiReportSection>

        <AiReportSection icon="nutrition" title="Lifestyle insights">
          <AiReportProse text={content.lifestyleInsights} />
        </AiReportSection>
      </div>

      <AiReportSection icon="query_stats" title="Predictions" variant="highlight">
        <AiReportProse text={content.predictions} />
      </AiReportSection>

      {content.riskFactors.length > 0 ? (
        <AiReportSection icon="warning" title="Risk factors">
          <AiReportList items={content.riskFactors} icon="error_outline" />
        </AiReportSection>
      ) : null}

      <AiReportSection icon="lightbulb" title="Recommendations">
        <AiReportRecommendations recommendations={content.recommendations} />
      </AiReportSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiReportSection icon="checklist" title="Action steps">
          <AiReportList items={content.actionSteps} ordered />
        </AiReportSection>

        <AiReportSection icon="restaurant" title="Nutrition">
          <AiReportList items={content.nutritionRecommendations} icon="restaurant" />
        </AiReportSection>
      </div>

      <AiReportSection icon="directions_run" title="Activity">
        <AiReportList items={content.activityRecommendations} icon="directions_run" />
      </AiReportSection>

      <div className="rounded-lg border border-border/40 bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
        <Icon name="info" className="mr-1.5 inline size-3.5 align-text-bottom" aria-hidden />
        {content.disclaimer}
        {report.model ? (
          <span className="mt-2 block text-[10px] opacity-60">
            Generated with {report.model}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link to={`/dashboard/pets/${id}/ai-summary`}>Back to AI Summary</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/dashboard/pets/${id}`}>Pet overview</Link>
        </Button>
      </div>
    </div>
  );
}
