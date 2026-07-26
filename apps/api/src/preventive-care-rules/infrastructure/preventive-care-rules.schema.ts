import { z } from "zod";

/** Matches string values of `PreventiveCareRuleType` for JSON from DeepSeek / static files. */
export const preventiveCareRuleTypeJsonSchema = z.enum([
  "vaccination",
  "deworming",
  "checkup",
  "parasite_control"
]);

export const preventiveCareRuleSeedDefinitionSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    type: preventiveCareRuleTypeJsonSchema,
    applicableMinAgeDays: z
      .union([z.number().int().min(0).max(365_000), z.null()])
      .optional(),
    applicableMaxAgeDays: z
      .union([z.number().int().min(0).max(365_000), z.null()])
      .optional(),
    intervalDays: z
      .union([z.number().int().min(1).max(365_000), z.null()])
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
  z.record(z.string(), z.array(preventiveCareRuleSeedDefinitionSchema))
);

export const generatedPreventiveCareRulesFileSchema = z.object({
  generatedAt: z.string().min(1),
  model: z.string().min(1),
  rulesBySpeciesAndBreed: rulesBySpeciesAndBreedSchema
});

export type GeneratedPreventiveCareRulesFile = z.infer<
  typeof generatedPreventiveCareRulesFileSchema
>;

/** Payload expected inside DeepSeek `json_object` responses for one species batch. */
export const deepseekBreedRulesResponseSchema = z.object({
  rulesByBreedName: z.record(
    z.string(),
    z.array(preventiveCareRuleSeedDefinitionSchema)
  )
});

/** Minimum rows per breed for AI-generated files (pet-owner dashboard quality). */
export const GENERATOR_MIN_RULES_PER_BREED = 3;

/** Require breadth across rule categories per breed. */
export const GENERATOR_MIN_DISTINCT_TYPES_PER_BREED = 2;

/** Titles should read like clear product copy for owners, not single-word labels. */
export const GENERATOR_MIN_TITLE_WORDS = 1;

export type ExpectedBreedRef = {
  speciesSlug: string;
  speciesName: string;
  breedName: string;
};

export type RuleRowForCoverage = {
  title: string;
  type: string;
};

/**
 * Extra validation after Zod: coverage depth and owner-friendly titles per breed.
 * Returns an error message for the LLM retry prompt, or `undefined` if OK.
 */
export function validateGeneratorProfessionalCoverageForBreeds(
  expectedBreeds: readonly ExpectedBreedRef[],
  rulesBySpeciesAndBreed: Record<string, Record<string, RuleRowForCoverage[]>>
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
        `"${label}": need at least ${GENERATOR_MIN_DISTINCT_TYPES_PER_BREED} different rule types (found: ${[...types].join(", ") || "none"}).`
      );
    }

    for (const r of rules) {
      const words = r.title
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      if (words.length < GENERATOR_MIN_TITLE_WORDS) {
        parts.push(
          `"${label}": title must be at least ${GENERATOR_MIN_TITLE_WORDS} words for clarity: "${r.title}"`
        );
      }
    }
  }

  return parts.length > 0 ? parts.join("\n") : undefined;
}
