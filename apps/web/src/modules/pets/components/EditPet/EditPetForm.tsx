import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  DatePicker,
  FieldGroup,
  FieldSeparator,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton
} from "@repo/ui";

import type { PetDTO } from "../../api/petsApi";
import type { SpeciesSummary } from "../../api/speciesApi";
import { useListSpecies } from "../../hooks/useListSpecies";
import { useUpdatePet } from "../../hooks/useUpdatePet";
import {
  editPetFormSchema,
  editPetFormValuesFromPet,
  parseExpectedLifeSpanFromForm,
  parseWeightKgFromForm,
  type EditPetFormValues
} from "../../schemas/createPetForm.schema";
import { SpeciesSelectOption } from "../SpeciesSelectOption";

export type EditPetFormProps = {
  pet: PetDTO;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function isFutureDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
}

export function EditPetForm({ pet, onSuccess, onCancel }: EditPetFormProps) {
  const { data: speciesList, isLoading: speciesLoading, isError: speciesError } =
    useListSpecies();
  const updatePet = useUpdatePet(pet.id);

  const form = useForm<EditPetFormValues>({
    resolver: zodResolver(editPetFormSchema),
    defaultValues: editPetFormValuesFromPet(pet),
    mode: "onChange"
  });

  useEffect(() => {
    form.reset(editPetFormValuesFromPet(pet));
  }, [pet, form]);

  const speciesId = form.watch("speciesId");

  const selectedSpecies = useMemo(
    () => speciesList?.find((s) => s.id === speciesId),
    [speciesList, speciesId]
  );

  const breeds = selectedSpecies?.breeds ?? [];

  const breedId = form.watch("breedId");
  const breedReferenceYears = useMemo(() => {
    const breed = breeds.find((b) => b.id === breedId);
    return breed?.expectedLifespanYears ?? null;
  }, [breeds, breedId]);

  const onSubmit = form.handleSubmit((values) => {
    const species = speciesList?.find((s) => s.id === values.speciesId);
    const breedOk = species?.breeds.some((b) => b.id === values.breedId);
    if (!breedOk) {
      form.setError("breedId", {
        type: "manual",
        message: "Pick a breed that matches the species"
      });
      return;
    }

    updatePet.mutate(
      {
        name: values.name.trim(),
        speciesId: values.speciesId,
        breedId: values.breedId,
        birthDate: values.birthDate,
        weightKg: parseWeightKgFromForm(values.weightKg),
        expectedLifeSpanYears: parseExpectedLifeSpanFromForm(
          values.expectedLifeSpanYears
        )
      },
      { onSuccess: () => onSuccess?.() }
    );
  });

  const speciesUnavailable =
    speciesLoading || !!speciesError || !speciesList?.length;
  const breedSelectDisabled =
    updatePet.isPending ||
    !speciesId ||
    speciesLoading ||
    breeds.length === 0;

  const isDirty = form.formState.isDirty;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <FieldGroup className="gap-5">
          <FormField
            control={form.control}
            name="name"
            render={() => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Buddy"
                    autoComplete="off"
                    disabled={updatePet.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="speciesId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  {speciesLoading ? (
                    <Skeleton className="h-10 w-full rounded-lg" />
                  ) : speciesError ? (
                    <p className="text-sm text-destructive">
                      Could not load species.
                    </p>
                  ) : (
                    <Select
                      disabled={speciesUnavailable || updatePet.isPending}
                      value={
                        typeof field.value === "string" && field.value
                          ? field.value
                          : undefined
                      }
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("breedId", "", {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger
                          aria-invalid={!!form.formState.errors.speciesId}
                          className="[&>span]:flex [&>span]:items-center [&>span]:line-clamp-none"
                        >
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(speciesList ?? []).map((s: SpeciesSummary) => (
                          <SelectItem key={s.id} value={s.id} className="py-2">
                            <SpeciesSelectOption species={s} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breedId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breed</FormLabel>
                  {speciesLoading ? (
                    <Skeleton className="h-10 w-full rounded-lg" />
                  ) : (
                    <Select
                      disabled={breedSelectDisabled}
                      value={
                        typeof field.value === "string" && field.value
                          ? field.value
                          : undefined
                      }
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          aria-invalid={!!form.formState.errors.breedId}
                        >
                          <SelectValue
                            placeholder={
                              speciesId
                                ? "Select breed"
                                : "Choose species first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {breeds.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="birthDate"
              render={() => (
                <FormItem>
                  <FormLabel>Birth date</FormLabel>
                  <FormControl>
                    <DatePicker
                      placeholder="Select birth date"
                      disabled={updatePet.isPending}
                      disabledDate={isFutureDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightKg"
              render={() => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min={0.01}
                      max={9999}
                      placeholder="e.g. 12.5"
                      autoComplete="off"
                      disabled={updatePet.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FieldSeparator />

          <FormField
            control={form.control}
            name="expectedLifeSpanYears"
            render={() => (
              <FormItem>
                <FormLabel>
                  Expected lifespan (years){" "}
                  <span className="font-normal text-muted-foreground">
                    optional
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={50}
                    step={1}
                    placeholder={
                      breedReferenceYears != null
                        ? `Breed reference ~${breedReferenceYears} yr`
                        : "e.g. 12"
                    }
                    autoComplete="off"
                    disabled={updatePet.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Your estimate for planning—not a medical prediction. Leave blank
                  to clear.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGroup>

        <div className="flex flex-col-reverse gap-2 border-t border-border/40 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={updatePet.isPending}
            onClick={() => {
              form.reset(editPetFormValuesFromPet(pet));
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updatePet.isPending || speciesUnavailable || !isDirty}
          >
            {updatePet.isPending ? (
              <>
                <Icon
                  name="progress_activity"
                  className="mr-2 size-4 animate-spin"
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              <>
                <Icon name="save" className="mr-2 size-4" aria-hidden />
                Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
