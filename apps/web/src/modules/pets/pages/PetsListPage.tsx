import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { petsApi } from "../api/petsApi";

export const PetsListPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const response = await petsApi.list();
      return response.data;
    }
  });

  if (isLoading) {
    return <p>Loading pets...</p>;
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

      <div className="grid gap-4">
        {data?.map((pet) => (
          <Link
            key={pet.id}
            to={`/dashboard/pets/${pet.id}`}
            className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-accent"
          >
            <div>
              <p className="font-medium">{pet.name}</p>
              <p className="text-sm text-muted-foreground">
                {pet.species}
                {pet.age ? ` • ${pet.age} years` : null}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">View details</span>
          </Link>
        ))}
        {data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You have no pets yet. Once you add them via the API, they will
            appear here.
          </p>
        )}
      </div>
    </section>
  );
};

