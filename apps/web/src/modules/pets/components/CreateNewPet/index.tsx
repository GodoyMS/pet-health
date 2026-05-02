import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@repo/ui";
import CreatePetForm from "./CreatePetForm";

type CreateNewPetProps = {
  trigger: React.ReactNode;
};

const CreateNewPet = ({ trigger }: CreateNewPetProps) => {
  const [open, setOpen] = useState(false);
  const [formMountKey, setFormMountKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setFormMountKey((k) => k + 1);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg md:max-w-xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Add a pet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pick a species and breed, then enter a name and birth date. All fields
            are required.
          </DialogDescription>
        </DialogHeader>
        <CreatePetForm
          key={formMountKey}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewPet;
