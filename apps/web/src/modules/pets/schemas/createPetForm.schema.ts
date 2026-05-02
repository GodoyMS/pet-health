import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

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
    .regex(isoDateRegex, "Use a valid date")
});

export type CreatePetFormValues = z.infer<typeof createPetFormSchema>;

export function emptyCreatePetForm(): CreatePetFormValues {
  return {
    name: "",
    speciesId: "",
    breedId: "",
    birthDate: ""
  };
}
