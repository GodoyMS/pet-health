import React from "react";

type PetSectionHeaderProps = {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export function PetSectionHeader({
  title,
  description,
  actions
}: PetSectionHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
