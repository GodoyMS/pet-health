import React from "react";

import { Badge } from "@repo/ui";

import type { AiReportRecommendation } from "../../api/aiSummaryApi";

const PRIORITY_VARIANT: Record<
  AiReportRecommendation["priority"],
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary"
};

type AiReportRecommendationsProps = {
  recommendations: AiReportRecommendation[];
};

export function AiReportRecommendations({
  recommendations
}: AiReportRecommendationsProps) {
  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-3">
      {sorted.map((rec) => (
        <div
          key={rec.title}
          className="rounded-lg border border-border/40 bg-muted/20 p-4 transition hover:border-border/60"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-foreground">{rec.title}</h3>
            <Badge variant={PRIORITY_VARIANT[rec.priority]} className="text-[10px] uppercase">
              {rec.priority}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {rec.description}
          </p>
        </div>
      ))}
    </div>
  );
}
