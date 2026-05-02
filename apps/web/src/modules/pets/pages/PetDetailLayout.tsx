import React from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { Badge, Button, Icon, Skeleton } from "@repo/ui";

import type { PetDTO } from "../api/petsApi";
import { petsApi } from "../api/petsApi";
import { DeletePetDialog } from "../components/DeletePetDialog";

export type PetOutletContext = {
  pet: PetDTO;
};

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
    return (
      <p className="text-sm text-muted-foreground">Missing pet.</p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Skeleton className="size-24 shrink-0 rounded-2xl sm:size-28" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-8 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-8 text-center">
        <p className="text-destructive text-sm font-medium">Could not load this pet.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/dashboard/pets">Back to pets</Link>
        </Button>
      </div>
    );
  }

  const imageUrl = pet.species.imageUrl;

  return (
    <div className="flex flex-1 flex-col gap-8 pb-10">
      <header className="flex flex-col gap-6 border-b border-border/40 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm sm:size-28">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-accent/30">
                <Icon
                  name="pets"
                  className="size-12 text-muted-foreground"
                  aria-hidden
                />
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {pet.name}
            </h1>
            <div className="flex justify-start items-center gap-2">
              <Badge variant={"secondary"}>
                <Icon name="pets" aria-hidden />
                {pet.species.name}
              </Badge>
              <Badge variant="outline">
                <Icon name="pets" aria-hidden />
                {pet.breed?.name ?? "—"}
              </Badge>
              {pet.weightKg != null ? (
                <Badge variant="outline">
                  <Icon name="monitor_weight" aria-hidden />
                  {pet.weightKg.toFixed(1)} kg
                </Badge>
              ) : null}

            </div>
            
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/pets/${petId}/edit`}>
              <Icon name="edit" className="mr-1.5 size-4" aria-hidden />
              Edit
            </Link>
          </Button>
          <DeletePetDialog
            petId={pet.id}
            petName={pet.name}
            onDeleted={() => navigate("/dashboard/pets")}
            trigger={
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                <Icon name="delete" className="mr-1.5 size-4" aria-hidden />
                Delete
              </Button>
            }
          />
        </div>
      </header>

      <Outlet context={{ pet } satisfies PetOutletContext} />
    </div>
  );
}
