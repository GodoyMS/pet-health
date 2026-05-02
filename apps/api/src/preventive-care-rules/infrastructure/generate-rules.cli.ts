import "reflect-metadata";
import * as dotenv from "dotenv";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

dotenv.config({});

import { SPECIES_SEED_DATA } from "species/infrastructure/species.seed";

import { deepseekChatCompletion } from "./deepseek.client";
import {
  deepseekRulesResponseSchema,
  generatedPreventiveCareRulesFileSchema
} from "./preventive-care-rules.schema";

async function main(): Promise<void> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[generate-rules] Set DEEPSEEK_API_KEY in your environment or .env file."
    );
    process.exit(1);
  }

  /** Run from `apps/api` (e.g. `pnpm run ai:generate-rules`). */
  const outPath = join(
    process.cwd(),
    "src/preventive-care-rules/infrastructure/preventive-care-rules.generated.json"
  );

  const speciesSlugs = SPECIES_SEED_DATA.map((s) => s.slug).join(", ");
  const speciesBlock = SPECIES_SEED_DATA.map(
    (s) => `- slug "${s.slug}" (${s.name})`
  ).join("\n");

  const systemPrompt = `You are compiling concise preventive-care scheduling hints for a pet health application (educational reference only — not medical advice).
Output MUST be a single JSON object only (no markdown, no commentary).
Use ages and intervals in whole days from birth.
Each rule must use one of these types exactly: "vaccination", "deworming", "checkup", "parasite_control".
Titles must be short (<= 200 characters). Prefer realistic recurring schedules when interval_days applies; omit interval_days or use null for one-off windows.
Include realistic breadth per species (multiple rules where appropriate).`;

  const userPrompt = `Return JSON with exactly this shape:
{"rulesBySpeciesSlug":{"<slug>":[{"title":"string","type":"vaccination|deworming|checkup|parasite_control","applicableMinAgeDays":number|null optional,"applicableMaxAgeDays":number|null optional,"intervalDays":number|null optional}]}}

Include a key for EVERY slug listed below (even if the array is empty). Allowed slug values only: ${speciesSlugs}.

Species:
${speciesBlock}`;

  let lastValidationError: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content:
          attempt === 0
            ? userPrompt
            : `Your previous reply failed validation:\n${lastValidationError}\n\nFix the JSON only. ${userPrompt}`
      }
    ];

    const { content, model } = await deepseekChatCompletion({
      apiKey,
      messages,
      temperature: 0,
      responseFormatJsonObject: true
    });

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content) as unknown;
    } catch {
      lastValidationError = "Assistant message was not valid JSON.";
      continue;
    }

    let inner: z.infer<typeof deepseekRulesResponseSchema>;
    try {
      inner = deepseekRulesResponseSchema.parse(parsedJson);
    } catch (e) {
      lastValidationError =
        e instanceof z.ZodError ? e.flatten().toString() : String(e);
      continue;
    }

    const merged: Record<
      string,
      z.infer<typeof deepseekRulesResponseSchema>["rulesBySpeciesSlug"][string]
    > = {};
    for (const s of SPECIES_SEED_DATA) {
      merged[s.slug] = inner.rulesBySpeciesSlug[s.slug] ?? [];
    }

    const envelope = generatedPreventiveCareRulesFileSchema.parse({
      generatedAt: new Date().toISOString(),
      model,
      rulesBySpeciesSlug: merged
    });

    writeFileSync(outPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf-8");
    console.error(`[generate-rules] Wrote ${outPath}`);
    return;
  }

  console.error("[generate-rules] Failed after retries:", lastValidationError);
  process.exit(1);
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
