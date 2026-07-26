import React from "react";
import { Link } from "react-router-dom";

import { Badge, Icon } from "@repo/ui";

import type { PetAiReportSummary } from "../../api/aiSummaryApi";
import {
  formatReportDate,
  getAwarenessScoreColor,
  getAwarenessScoreLabel
} from "../../utils/awarenessScore";
import { AwarenessScoreRing } from "./AwarenessScoreRing";

type AiReportListItemProps = {
  report: PetAiReportSummary;
  petId: string;
};

export function AiReportListItem({ report, petId }: AiReportListItemProps) {
  const scoreColor = getAwarenessScoreColor(report.awarenessScore);

  return (
    <Link
      to={`/dashboard/pets/${petId}/ai-summary/${report.id}`}
      className="group flex items-center gap-5 rounded-xl border border-border/50 bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="hidden sm:block">
        <AwarenessScoreRing score={report.awarenessScore} size="sm" showLabel={false} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-display text-2xl font-bold tabular-nums sm:hidden ${scoreColor}`}>
            {report.awarenessScore}
          </span>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            {getAwarenessScoreLabel(report.awarenessScore)}
          </Badge>
        </div>
        <p className="mt-1 font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {report.headline}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="schedule" className="size-3.5" aria-hidden />
          {formatReportDate(report.generatedAt)}
        </p>
      </div>

      <Icon
        name="chevron_right"
        className="size-5 shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
