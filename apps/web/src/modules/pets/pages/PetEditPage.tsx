import React from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { EditPetForm } from "../components/EditPet/EditPetForm";
import { PetSectionHeader } from "../components/PetSectionHeader";
import type { PetOutletContext } from "./PetDetailLayout";

export function PetEditPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { pet } = useOutletContext<PetOutletContext>();
  const id = petId ?? pet.id;
  const detailPath = `/dashboard/pets/${id}`;

  return (
    <div className="flex w-full flex-col gap-6 pb-4">
      <PetSectionHeader
        title="Edit profile"
        description={`Update ${pet.name}'s details. Changes apply across preventive care and lifestyle guidance.`}
      />

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <EditPetForm
            pet={pet}
            onSuccess={() => navigate(detailPath)}
            onCancel={() => navigate(detailPath)}
          />
        </div>
      </div>
    </div>
  );
}
