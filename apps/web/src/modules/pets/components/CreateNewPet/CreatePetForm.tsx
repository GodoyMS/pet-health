import React, { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  FieldGroup,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Icon
} from "@repo/ui";

import type { SpeciesSummary } from "../../api/speciesApi";
import { useListSpecies } from "../../hooks/useListSpecies";
import { useCreatePet } from "../../hooks/useCreatePet";
import {
  createPetFormSchema,
  emptyCreatePetForm,
  type CreatePetFormValues
} from "../../schemas/createPetForm.schema";

export type CreatePetFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreatePetForm({ onSuccess, onCancel }: CreatePetFormProps) {
  const { data: speciesList, isLoading: speciesLoading, isError: speciesError } =
    useListSpecies();
  const createPet = useCreatePet();

  const form = useForm<CreatePetFormValues>({
    resolver: zodResolver(createPetFormSchema),
    defaultValues: emptyCreatePetForm(),
    mode: "onChange"
  });

  const speciesId = form.watch("speciesId");

  const selectedSpecies = useMemo(
    () => speciesList?.find((s) => s.id === speciesId),
    [speciesList, speciesId]
  );

  const breeds = selectedSpecies?.breeds ?? [];

  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

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

    createPet.mutate(
      {
        name: values.name.trim(),
        speciesId: values.speciesId,
        breedId: values.breedId,
        birthDate: values.birthDate
      },
      {
        onSuccess: () => {
          form.reset(emptyCreatePetForm());
          onSuccess?.();
        }
      }
    );
  });

  const speciesUnavailable =
    speciesLoading || !!speciesError || !speciesList?.length;
  const breedSelectDisabled =
    createPet.isPending ||
    !speciesId ||
    speciesLoading ||
    breeds.length === 0;

  return (
    <FormProvider {...form}>
      <form
        id="create-pet-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-6"
        noValidate
      >
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
                    disabled={createPet.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    Could not load species. Refresh and try again.
                  </p>
                ) : (
                  <Select
                    disabled={speciesUnavailable || createPet.isPending}
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
                      >
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(speciesList ?? []).map((s: SpeciesSummary) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
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
                  <>
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
                                : "Choose a species first"
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
                    {speciesId && breeds.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No breeds listed for this species yet.
                      </p>
                    ) : null}
                  </>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={() => (
              <FormItem>
                <FormLabel>Birth date</FormLabel>
                <FormControl>
                  <Input type="date" max={todayIso} disabled={createPet.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGroup>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={createPet.isPending}
            onClick={() => {
              form.reset(emptyCreatePetForm());
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPet.isPending || speciesUnavailable}
          >
            {createPet.isPending ? (
              <>
                <Icon
                  name="progress_activity"
                  className="mr-2 size-4 animate-spin"
                  aria-hidden
                />
                Creating…
              </>
            ) : (
              "Create pet"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default CreatePetForm;
