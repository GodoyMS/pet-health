import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Button,
} from "@repo/ui";
import CreatePetForm from "./CreatePetForm";
const CreateNewPet = ({trigger}: {trigger: React.ReactNode}) => {
  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="md:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Create New Pet</DialogTitle>
          <DialogDescription>
            <CreatePetForm/>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewPet;
