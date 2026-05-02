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
  generatedPreventiveCareRulesFileSchema,
  validateGeneratorProfessionalCoverage
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

  const systemPrompt = `You are a senior veterinary information editor helping build in-app preventive-care reminders for pet owners.
Audience: front-end pet parents (clear, calm, professional tone — like trusted clinic handouts). Not clinical jargon overload.
Content is educational scheduling guidance only (not a diagnosis; owners must consult their veterinarian).

Output MUST be a single JSON object only (no markdown, no code fences, no commentary).
Use whole days from birth for ages and intervals.
Each rule uses exactly one type: "vaccination", "deworming", "checkup", or "parasite_control".
Titles: <= 200 characters, Title Case or sentence case, specific and actionable (e.g. "Annual wellness exam and weight check" not "Exam").
Cover each species thoroughly: typical vaccine series windows, booster cadence where applicable, parasite prevention rotation, routine exams, dental/or wellness checks when species-appropriate.
Use realistic recurring schedules: set intervalDays for repeating items; omit or null intervalDays for one-off windows.
Ground suggestions in common veterinary schedules for that species where widely accepted; when uncertain, prefer conservative mainstream intervals.`;

  const userPrompt = `Return JSON with exactly this shape:
{"rulesBySpeciesSlug":{"<slug>":[{"title":"string","type":"vaccination|deworming|checkup|parasite_control","applicableMinAgeDays":number|null optional,"applicableMaxAgeDays":number|null optional,"intervalDays":number|null optional}]}}

For EVERY slug below you MUST return a non-empty array with many rules: aim for broad coverage (puppy/kitten series, adult boosters, parasite rotation, annual exams, species-specific risks).
Arrays must not be empty. Spread types across vaccination, deworming, checkup, and parasite_control where relevant.

Allowed slug keys only: ${speciesSlugs}.

Species:
${speciesBlock}`;

  let lastValidationError: string | undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
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

    const coverageError = validateGeneratorProfessionalCoverage(
      SPECIES_SEED_DATA.map((s) => s.slug),
      merged
    );
    if (coverageError) {
      lastValidationError = `Professional coverage check failed:\n${coverageError}`;
      continue;
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
