import React, { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Icon
} from "@repo/ui";

import { useDeletePet } from "../hooks/useDeletePet";

export type DeletePetDialogProps = {
  petId: string;
  petName: string;
  trigger: React.ReactNode;
  /** Called after successful delete (e.g. navigate away from pet detail) */
  onDeleted?: () => void;
};

export function DeletePetDialog({
  petId,
  petName,
  trigger,
  onDeleted
}: DeletePetDialogProps) {
  const [open, setOpen] = useState(false);
  const deletePet = useDeletePet();

  const handleConfirm = () => {
    deletePet.mutate(petId, {
      onSuccess: () => {
        setOpen(false);
        onDeleted?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={!deletePet.isPending}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Icon name="warning" className="size-5 shrink-0" aria-hidden />
            Delete pet?
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground leading-relaxed pt-1">
            <span className="font-medium text-foreground">{petName}</span> will be
            permanently removed from your account.{" "}
            <strong className="text-foreground">This cannot be undone.</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={deletePet.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deletePet.isPending}
            onClick={handleConfirm}
          >
            {deletePet.isPending ? (
              <>
                <Icon
                  name="progress_activity"
                  className="mr-2 size-4 animate-spin"
                  aria-hidden
                />
                Deleting…
              </>
            ) : (
              "Delete permanently"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
