import { PetDTO } from "@modules/pets/api/petsApi";
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
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Icon name="pets" className=" text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg text-card-foreground">
              {pet.name}
            </h3>
            <p className="text-sm text-muted-foreground">{pet.breed}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              <span>Age: {pet.birthDate}</span>
              <span>Weight: 10 kg</span>
              <span>Stage:</span>
              
              {pet.expectedLifeSpanYears && <span>Lifespan: {pet.expectedLifeSpanYears} years</span>}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2">
        <Link
          to={`/pets/${pet.id}/edit`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Edit
        </Link>
        <span className="text-border">·</span>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
        >
          <Icon name="delete" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default PetListCard;
