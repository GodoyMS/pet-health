import { z } from "zod";

/** Matches string values of `LifestyleRuleType` for JSON from DeepSeek / static files. */
export const lifestyleRuleTypeJsonSchema = z.enum([
  "exercise",
  "feeding_awareness",
  "food_safety"
]);

export const lifestyleRuleSeedDefinitionSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(20).max(2000),
    type: lifestyleRuleTypeJsonSchema,
    applicableMinAgeDays: z
      .union([z.number().int().min(0).max(365_000), z.null()])
      .optional(),
    applicableMaxAgeDays: z
      .union([z.number().int().min(0).max(365_000), z.null()])
      .optional()
  })
  .superRefine((data, ctx) => {
    const min = data.applicableMinAgeDays;
    const max = data.applicableMaxAgeDays;
    if (min != null && max != null && min > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "applicableMinAgeDays must be <= applicableMaxAgeDays",
        path: ["applicableMinAgeDays"]
      });
    }
  });

/** species slug → breed name → rules */
export const rulesBySpeciesAndBreedSchema = z.record(
  z.string(),
  z.record(z.string(), z.array(lifestyleRuleSeedDefinitionSchema))
);

export const generatedLifestyleRulesFileSchema = z.object({
  generatedAt: z.string().min(1),
  model: z.string().min(1),
  rulesBySpeciesAndBreed: rulesBySpeciesAndBreedSchema
});

export type GeneratedLifestyleRulesFile = z.infer<
  typeof generatedLifestyleRulesFileSchema
>;

export const deepseekBreedLifestyleRulesResponseSchema = z.object({
  rulesByBreedName: z.record(
    z.string(),
    z.array(lifestyleRuleSeedDefinitionSchema)
  )
});

export const GENERATOR_MIN_RULES_PER_BREED = 6;

export const GENERATOR_MIN_DISTINCT_TYPES_PER_BREED = 3;

export const GENERATOR_MIN_DESCRIPTION_CHARS = 40;

export type ExpectedBreedRef = {
  speciesSlug: string;
  speciesName: string;
  breedName: string;
};

export type LifestyleRuleRowForCoverage = {
  title: string;
  description: string;
  type: string;
};

/**
 * Extra validation after Zod: coverage depth and owner-friendly copy per breed.
 * Returns an error message for the LLM retry prompt, or `undefined` if OK.
 */
export function validateGeneratorProfessionalCoverageForBreeds(
  expectedBreeds: readonly ExpectedBreedRef[],
  rulesBySpeciesAndBreed: Record<
    string,
    Record<string, LifestyleRuleRowForCoverage[]>
  >
): string | undefined {
  const parts: string[] = [];

  for (const { speciesSlug, breedName } of expectedBreeds) {
    const label = `${speciesSlug} / ${breedName}`;
    const rules = rulesBySpeciesAndBreed[speciesSlug]?.[breedName] ?? [];

    if (rules.length < GENERATOR_MIN_RULES_PER_BREED) {
      parts.push(
        `"${label}": need at least ${GENERATOR_MIN_RULES_PER_BREED} rules (found ${rules.length}).`
      );
    }

    const types = new Set(rules.map((r) => r.type));
    if (types.size < GENERATOR_MIN_DISTINCT_TYPES_PER_BREED) {
      parts.push(
        `"${label}": need all three types (exercise, feeding_awareness, food_safety); found: ${[...types].join(", ") || "none"}.`
      );
    }

    for (const r of rules) {
      if (r.description.trim().length < GENERATOR_MIN_DESCRIPTION_CHARS) {
        parts.push(
          `"${label}": description too short for "${r.title}" (min ${GENERATOR_MIN_DESCRIPTION_CHARS} chars).`
        );
      }
    }
  }

  return parts.length > 0 ? parts.join("\n") : undefined;
}
