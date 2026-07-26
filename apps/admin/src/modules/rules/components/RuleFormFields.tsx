import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@repo/ui";

import type { AdminSpecies } from "@shared/api/adminApi";

interface SpeciesBreedFieldsProps {
  species: AdminSpecies[];
  speciesId: string;
  breedId: string;
  onSpeciesChange: (id: string) => void;
  onBreedChange: (id: string) => void;
  /** Species/breed cannot be retargeted on existing rules (backend constraint). */
  disabled?: boolean;
}

export function SpeciesBreedFields({
  species,
  speciesId,
  breedId,
  onSpeciesChange,
  onBreedChange,
  disabled
}: SpeciesBreedFieldsProps) {
  const selectedSpecies = species.find((s) => s.id === speciesId);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>Species</Label>
        <Select
          value={speciesId || undefined}
          onValueChange={(v) => {
            onSpeciesChange(v);
            onBreedChange("");
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select species" />
          </SelectTrigger>
          <SelectContent>
            {species.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Breed</Label>
        <Select
          value={breedId || undefined}
          onValueChange={onBreedChange}
          disabled={disabled || !selectedSpecies}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select breed" />
          </SelectTrigger>
          <SelectContent>
            {selectedSpecies?.breeds.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface AgeRangeFieldsProps {
  minAge: string;
  maxAge: string;
  onMinAgeChange: (v: string) => void;
  onMaxAgeChange: (v: string) => void;
}

export function AgeRangeFields({
  minAge,
  maxAge,
  onMinAgeChange,
  onMaxAgeChange
}: AgeRangeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="minAge">Min age (days)</Label>
        <Input
          id="minAge"
          type="number"
          min={0}
          placeholder="e.g. 56"
          value={minAge}
          onChange={(e) => onMinAgeChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxAge">Max age (days)</Label>
        <Input
          id="maxAge"
          type="number"
          min={0}
          placeholder="empty = no limit"
          value={maxAge}
          onChange={(e) => onMaxAgeChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function parseOptionalInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
