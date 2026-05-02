import { PetDTO } from "@modules/pets/api/petsApi";
import { DeletePetDialog } from "@modules/pets/components/DeletePetDialog";
import { Button, Icon } from "@repo/ui";
import React from "react";
import { Link } from "react-router-dom";

const PetListCard = ({ pet }: { pet: PetDTO }) => {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      <Link
        to={`/dashboard/pets/${pet.id}`}
        className="block p-5 hover:bg-muted/30 transition"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0 overflow-hidden">
            {pet.species.imageUrl ? (
              <img
                src={pet.species.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Icon name="pets" className="text-accent-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-card-foreground">
              {pet.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {pet.species.name}
              <span className="mx-1 text-border">·</span>
              {pet.breed?.name ?? "—"}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              <span>Born: {pet.birthDate}</span>
              {pet.weightKg != null ? (
                <span>Weight: {pet.weightKg.toFixed(1)} kg</span>
              ) : null}
              {pet.expectedLifeSpanYears != null ? (
                <span>Est. lifespan: {pet.expectedLifeSpanYears} yr</span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2">
        <Link
          to={`/dashboard/pets/${pet.id}/edit`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Edit
        </Link>
        <span className="text-border">·</span>
        <DeletePetDialog
          petId={pet.id}
          petName={pet.name}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Icon name="delete" className="size-4 mr-1" aria-hidden />
              Delete
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default PetListCard;
