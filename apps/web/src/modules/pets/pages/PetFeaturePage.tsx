import React from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import { Button, Icon } from "@repo/ui";

import type { PetOutletContext } from "./PetDetailLayout";

const FEATURE_COPY = {
  "preventive-care": {
    title: "Preventive Care",
    body: "Schedule vaccines, flea/tick control, and dental checks. Your timeline will appear here."
  },
  "health-logs": {
    title: "Health Logs",
    body: "Track symptoms, medications, and vet outcomes in one place."
  },
  analytics: {
    title: "Analytics",
    body: "Charts and trends across weight, activity, and visits."
  },
  lifestyle: {
    title: "Lifestyle",
    body: "Diet, exercise, and enrichment tailored to your pet."
  },
  "ai-summary": {
    title: "AI Summary",
    body: "Premium narrative that synthesizes signals across the platform — launching soon."
  }
} as const;

export type PetFeatureSlug = keyof typeof FEATURE_COPY;

type PetFeaturePageProps = {
  slug: PetFeatureSlug;
};

export function PetFeaturePage({ slug }: PetFeaturePageProps) {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();
  const meta = FEATURE_COPY[slug];

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to={`/dashboard/pets/${petId ?? pet.id}`}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <Icon name="arrow_back"aria-hidden />
          {pet.name}
        </Link>
        <span className="text-border">/</span>
        <span>{meta.title}</span>
      </div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{meta.title}</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">{meta.body}</p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" asChild>
          <Link to={`/dashboard/pets/${petId ?? pet.id}`}>Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}
