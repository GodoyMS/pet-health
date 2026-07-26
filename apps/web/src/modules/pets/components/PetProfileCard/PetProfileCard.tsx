import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Badge, Button, Icon } from "@repo/ui";

import type { PetDTO } from "../../api/petsApi";
import { DeletePetDialog } from "../DeletePetDialog";
import { PET_NAV_ITEMS, petNavPath } from "../../constants/petNavItems";
import {
  computeAgeLabel,
  computeAgeYearsDecimal,
  inferLifeStageLabel
} from "../../utils/petAge";

type PetProfileCardProps = {
  pet: PetDTO;
  petId: string;
  onDeleted: () => void;
};

function formatBirthDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function ProfileStat({
  icon,
  label,
  value
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon name={icon} className="size-3 shrink-0" aria-hidden />
        {label}
      </div>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

export function PetProfileCard({ pet, petId, onDeleted }: PetProfileCardProps) {
  const location = useLocation();
  const imageUrl = pet.species.imageUrl;
  const ageLabel = computeAgeLabel(pet.birthDate);
  const ageYears = computeAgeYearsDecimal(pet.birthDate);
  const lifeStage = ageYears >= 0 ? inferLifeStageLabel(ageYears) : "—";
  const isEditActive = location.pathname.endsWith("/edit");

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <Link
        to="/dashboard/pets"
        className="flex items-center gap-1.5 border-b border-border/40 px-4 py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
      >
        <Icon name="arrow_back" className="size-3.5" aria-hidden />
        All pets
      </Link>

      <div className="relative">
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/15 to-muted">
              <Icon name="pets" className="size-16 text-muted-foreground/60" aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h1 className="font-display text-xl font-semibold tracking-tight text-white drop-shadow-sm">
              {pet.name}
            </h1>
            <p className="mt-0.5 text-sm text-white/85">
              {pet.species.name}
              {pet.breed ? ` · ${pet.breed.name}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-border/40 p-3">
        <ProfileStat icon="cake" label="Age" value={ageLabel} />
        <ProfileStat
          icon="monitor_weight"
          label="Weight"
          value={pet.weightKg != null ? `${pet.weightKg.toFixed(1)} kg` : "—"}
        />
        <ProfileStat icon="pets" label="Stage" value={lifeStage} />
      </div>

      <div className="border-b border-border/40 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Born
        </p>
        <p className="mt-0.5 text-sm text-foreground">{formatBirthDate(pet.birthDate)}</p>
        {pet.expectedLifeSpanYears != null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Expected lifespan ~{pet.expectedLifeSpanYears} yrs
          </p>
        ) : null}
      </div>

      <nav className="flex flex-col gap-0.5 p-2" aria-label="Pet sections">
        {PET_NAV_ITEMS.map((item) => {
          const to = petNavPath(petId, item.slug);
          const isOverview = item.slug === "";
          return (
            <NavLink
              key={item.slug || "overview"}
              to={to}
              end={isOverview}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground group-hover:bg-muted"
                    }`}
                  >
                    <Icon name={item.icon} className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate">{item.label}</span>
                      {item.premium ? (
                        <Badge className="h-4 px-1.5 text-[9px] uppercase">Pro</Badge>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-normal opacity-80">
                      {item.description}
                    </span>
                  </span>
                  <Icon
                    name="chevron_right"
                    className={`size-4 shrink-0 transition ${
                      isActive ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-50"
                    }`}
                    aria-hidden
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-row gap-2 border-t border-border/40 p-3">
        <Button
          variant={isEditActive ? "default" : "outline"}
          size="sm"
          className="flex-1"
          asChild
        >
          <Link to={`/dashboard/pets/${petId}/edit`}>
            <Icon name="edit"  aria-hidden />
            Edit profile
          </Link>
        </Button>
        <DeletePetDialog
          petId={pet.id}
          petName={pet.name}
          onDeleted={onDeleted}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Icon name="delete"  aria-hidden />
              Delete pet
            </Button>
          }
        />
      </div>
    </div>
  );
}
