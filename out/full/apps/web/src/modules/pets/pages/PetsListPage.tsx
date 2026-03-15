import { Link } from "react-router-dom";
import CreateNewPet from "../components/CreateNewPet";
import { Button } from "@repo/ui";
import { useListPets } from "../hooks/useListPets";
import PetList from "../components/PetList";
import SkeletonGrid from "@shared/components/SkeletonGrid";

export const PetsListPage = () => {
  const { data, isLoading, isError } = useListPets();

  if (isLoading) {
    return <SkeletonGrid />;
  }

  if (isError) {
    return <p className="text-destructive">Could not load pets.</p>;
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your pets</h1>
          <p className="text-sm text-muted-foreground">
            Overview of pets registered to your account.
          </p>
        </div>
      </header>
      <div>
        <CreateNewPet trigger={<Button>Create New Pet</Button>} />
      </div>

      <PetList pets={data ?? []} />

    </section>
  );
};
