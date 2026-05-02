import React from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import { Button } from "@repo/ui";

import type { PetOutletContext } from "./PetDetailLayout";

/** Placeholder until edit flow is implemented */
export function PetEditPage() {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border/50 bg-card p-8 text-center shadow-sm">
      <h1 className="font-display text-xl font-semibold">Edit {pet.name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Profile editing will be available in a future update.
      </p>
      <Button className="mt-6" variant="outline" asChild>
        <Link to={`/dashboard/pets/${petId ?? pet.id}`}>Back to pet</Link>
      </Button>
    </div>
  );
}
