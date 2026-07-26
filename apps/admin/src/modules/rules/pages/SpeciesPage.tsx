import { useQuery } from "@tanstack/react-query";

import { Badge } from "@repo/ui";

import { adminApi } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { PageHeader } from "@shared/components/PageHeader";
import { PageError, PageLoading } from "@shared/components/States";

export function SpeciesPage() {
  const query = useQuery({
    queryKey: ["admin", "species"],
    queryFn: adminApi.listSpecies,
    staleTime: 5 * 60 * 1000
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError || !query.data) {
    return (
      <PageError
        message={apiErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Species & breeds"
        description="Reference catalog managed by the seed pipeline (pnpm run seed:species). Rules and pet profiles link to these entries."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {query.data.map((species) => (
          <section
            key={species.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {species.imageUrl ? (
                  <img
                    src={species.imageUrl}
                    alt=""
                    className="size-10 rounded-lg object-cover"
                  />
                ) : null}
                <div>
                  <h3 className="text-sm font-semibold">{species.name}</h3>
                  {species.description ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {species.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <Badge variant="secondary">
                {species.petCount.toLocaleString()} pets
              </Badge>
            </header>

            <div className="mt-4 flex flex-wrap gap-2">
              {species.breeds.map((breed) => (
                <span
                  key={breed.id}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                  title={
                    breed.expectedLifespanYears != null
                      ? `Expected lifespan ${breed.expectedLifespanYears} years`
                      : undefined
                  }
                >
                  {breed.name}
                  {breed.expectedLifespanYears != null ? (
                    <span className="ml-1 text-muted-foreground">
                      · {breed.expectedLifespanYears}y
                    </span>
                  ) : null}
                </span>
              ))}
              {species.breeds.length === 0 ? (
                <p className="text-xs text-muted-foreground">No breeds seeded.</p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
