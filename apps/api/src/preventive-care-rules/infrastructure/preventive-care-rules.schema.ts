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

export const generatedPreventiveCareRulesFileSchema = z.object({
  generatedAt: z.string().min(1),
  model: z.string().min(1),
  rulesBySpeciesSlug: z.record(
    z.string(),
    z.array(preventiveCareRuleSeedDefinitionSchema)
  )
});

export type GeneratedPreventiveCareRulesFile = z.infer<
  typeof generatedPreventiveCareRulesFileSchema
>;

/** Payload expected inside DeepSeek `json_object` responses (no metadata). */
export const deepseekRulesResponseSchema = z.object({
  rulesBySpeciesSlug: z.record(
    z.string(),
    z.array(preventiveCareRuleSeedDefinitionSchema)
  )
});

/** Minimum rows per species for AI-generated files (pet-owner dashboard quality). */
export const GENERATOR_MIN_RULES_PER_SPECIES = 3;

/** Require breadth across rule categories. */
export const GENERATOR_MIN_DISTINCT_TYPES_PER_SPECIES = 2;

/** Titles should read like clear product copy for owners, not single-word labels. */
export const GENERATOR_MIN_TITLE_WORDS = 1;

export type RuleRowForCoverage = {
  title: string;
  type: string;
};

/**
 * Extra validation after Zod: coverage depth and owner-friendly titles.
 * Returns an error message for the LLM retry prompt, or `undefined` if OK.
 */
export function validateGeneratorProfessionalCoverage(
  expectedSlugs: readonly string[],
  rulesBySpeciesSlug: Record<string, RuleRowForCoverage[]>
): string | undefined {
  const parts: string[] = [];

  for (const slug of expectedSlugs) {
    const rules = rulesBySpeciesSlug[slug] ?? [];
    if (rules.length < GENERATOR_MIN_RULES_PER_SPECIES) {
      parts.push(
        `"${slug}": need at least ${GENERATOR_MIN_RULES_PER_SPECIES} rules (found ${rules.length}).`
      );
    }

    const types = new Set(rules.map((r) => r.type));
    if (types.size < GENERATOR_MIN_DISTINCT_TYPES_PER_SPECIES) {
      parts.push(
        `"${slug}": need at least ${GENERATOR_MIN_DISTINCT_TYPES_PER_SPECIES} different rule types (found: ${[...types].join(", ") || "none"}).`
      );
    }

    for (const r of rules) {
      const words = r.title
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      if (words.length < GENERATOR_MIN_TITLE_WORDS) {
        parts.push(
          `"${slug}": title must be at least ${GENERATOR_MIN_TITLE_WORDS} words for clarity (e.g. vaccine/wellness copy): "${r.title}"`
        );
      }
    }
  }

  return parts.length > 0 ? parts.join("\n") : undefined;
}
