import { Icon } from "@repo/ui";

type SpeciesSelectOptionProps = {
  species: {
    name: string;
    imageUrl: string | null;
  };
};

/** Species row for SelectItem — image (or pets glyph) left of the name. */
export function SpeciesSelectOption({ species }: SpeciesSelectOptionProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {species.imageUrl ? (
          <img
            src={species.imageUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <Icon name="pets" className="size-4 text-muted-foreground" aria-hidden />
        )}
      </span>
      <span className="truncate">{species.name}</span>
    </span>
  );
}
