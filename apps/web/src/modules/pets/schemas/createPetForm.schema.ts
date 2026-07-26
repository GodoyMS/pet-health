import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function parseWeightKgKg(raw: string): number | null {
  const n = Number(raw.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export const createPetFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your pet's name")
    .max(120, "Name is too long"),
  speciesId: z.string().min(1, "Choose a species").uuid("Choose a species"),
  breedId: z.string().min(1, "Choose a breed").uuid("Choose a breed"),
  birthDate: z
    .string()
    .min(1, "Select a birth date")
    .regex(isoDateRegex, "Use a valid date"),
  weightKg: z
    .string()
    .trim()
    .min(1, "Enter weight (kg)")
    .refine((s) => {
      const n = parseWeightKgKg(s);
      return n != null && n >= 0.01 && n <= 9999;
    }, "Enter a weight between 0.01 and 9999 kg")
});

export type CreatePetFormValues = z.infer<typeof createPetFormSchema>;

export function emptyCreatePetForm(): CreatePetFormValues {
  return {
    name: "",
    speciesId: "",
    breedId: "",
    birthDate: "",
    weightKg: ""
  };
}

/** Call only after the form value passes `createPetFormSchema`. */
export function parseWeightKgFromForm(weightKg: string): number {
  return Number(weightKg.trim().replace(",", "."));
}

export const editPetFormSchema = createPetFormSchema.extend({
  expectedLifeSpanYears: z
    .string()
    .optional()
    .refine((s) => {
      if (s == null || s.trim() === "") return true;
      const n = Number(s.trim());
      return Number.isInteger(n) && n >= 1 && n <= 50;
    }, "Use a whole number between 1 and 50 years")
});

export type EditPetFormValues = z.infer<typeof editPetFormSchema>;

export function editPetFormValuesFromPet(pet: {
  name: string;
  species: { id: string };
  breed: { id: string } | null;
  birthDate: string;
  weightKg: number | null;
  expectedLifeSpanYears: number | null;
}): EditPetFormValues {
  return {
    name: pet.name,
    speciesId: pet.species.id,
    breedId: pet.breed?.id ?? "",
    birthDate: pet.birthDate,
    weightKg: pet.weightKg != null ? String(pet.weightKg) : "",
    expectedLifeSpanYears:
      pet.expectedLifeSpanYears != null
        ? String(pet.expectedLifeSpanYears)
        : ""
  };
}

export function parseExpectedLifeSpanFromForm(
  value: string | undefined
): number | null {
  if (value == null || value.trim() === "") return null;
  return Number(value.trim());
}
