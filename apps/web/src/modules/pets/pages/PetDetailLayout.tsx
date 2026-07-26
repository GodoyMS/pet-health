import React from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Button, Skeleton } from "@repo/ui";

import { petsApi } from "../api/petsApi";
import { PetProfileCard } from "../components/PetProfileCard/PetProfileCard";
import type { PetDTO } from "../api/petsApi";

export type PetOutletContext = {
  pet: PetDTO;
};

function ProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <Skeleton className="h-8 w-full rounded-none" />
      <Skeleton className="aspect-16/10 w-full rounded-none" />
      <div className="grid grid-cols-3 gap-2 p-3">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
      <div className="space-y-2 p-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function PetDetailLayout() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();

  const { data: pet, isLoading, isError } = useQuery({
    queryKey: ["pets", petId],
    enabled: Boolean(petId),
    queryFn: async () => {
      const res = await petsApi.get(petId!);
      return res.data;
    }
  });

  if (!petId) {
    return <p className="text-sm text-muted-foreground">Missing pet.</p>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72 lg:self-start xl:w-80">
          <ProfileCardSkeleton />
        </aside>
        <main className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border/60 bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm font-medium text-destructive">Could not load this pet.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/dashboard/pets">Back to pets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72 lg:self-start xl:w-80">
        <PetProfileCard
          pet={pet}
          petId={petId}
          onDeleted={() => navigate("/dashboard/pets")}
        />
      </aside>

      <main className="min-w-0 flex-1 pb-6">
        <Outlet context={{ pet } satisfies PetOutletContext} />
      </main>
    </div>
  );
}
