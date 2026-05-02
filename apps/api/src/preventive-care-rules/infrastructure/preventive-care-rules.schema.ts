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
