import React from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import { Button } from "@repo/ui";

import { PetSectionHeader } from "../components/PetSectionHeader";
import type { PetOutletContext } from "./PetDetailLayout";

const FEATURE_COPY = {
  "preventive-care": {
    title: "Preventive Care",
    body: "Schedule vaccines, flea/tick control, and dental checks. Your timeline will appear here."
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
    <div className="flex w-full flex-col gap-6">
      <PetSectionHeader title={meta.title} description={meta.body} />
      <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
        <Button variant="outline" asChild>
          <Link to={`/dashboard/pets/${petId ?? pet.id}`}>Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}
