import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { petsApi } from "../api/petsApi";

export const PetDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pets", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await petsApi.get(id!);
      return response.data;
    }
  });

  if (!id) {
    return <p>Missing pet id.</p>;
  }

  if (isLoading) {
    return <p>Loading pet...</p>;
  }

  if (isError || !data) {
    return <p className="text-destructive">Could not load pet.</p>;
  }

  return (
    <section className="flex flex-1 flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-sm text-muted-foreground">
          {data.species}
          {data.age ? ` • ${data.age} years` : null}
        </p>
      </header>
    </section>
  );
};

