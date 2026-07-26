import "reflect-metadata";
import * as dotenv from "dotenv";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

dotenv.config({});

import { SPECIES_SEED_DATA } from "species/infrastructure/species.seed";

import { deepseekChatCompletion } from "./deepseek.client";
import {
  deepseekBreedRulesResponseSchema,
  generatedPreventiveCareRulesFileSchema,
  type ExpectedBreedRef,
  validateGeneratorProfessionalCoverageForBreeds
} from "./preventive-care-rules.schema";

const BREEDS_PER_BATCH = 6;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function listExpectedBreeds(): ExpectedBreedRef[] {
  return SPECIES_SEED_DATA.flatMap((species) =>
    species.breeds.map((breed) => ({
      speciesSlug: species.slug,
      speciesName: species.name,
      breedName: breed.name
    }))
  );
}

async function generateRulesForBreedBatch(
  apiKey: string,
  speciesName: string,
  speciesSlug: string,
  breedNames: readonly string[],
  attemptError?: string
): Promise<{
  rulesByBreedName: z.infer<
    typeof deepseekBreedRulesResponseSchema
  >["rulesByBreedName"];
  model: string;
}> {
  const breedList = breedNames.map((name) => `- "${name}"`).join("\n");

  const systemPrompt = `You are a senior veterinary information editor helping build in-app preventive-care reminders for pet owners.
Audience: front-end pet parents (clear, calm, professional tone — like trusted clinic handouts). Not clinical jargon overload.
Content is educational scheduling guidance only (not a diagnosis; owners must consult their veterinarian).

Output MUST be a single JSON object only (no markdown, no code fences, no commentary).
Use whole days from birth for ages and intervals.
Each rule uses exactly one type: "vaccination", "deworming", "checkup", or "parasite_control".
Titles: <= 200 characters, Title Case or sentence case, specific and actionable (e.g. "Annual wellness exam and weight check" not "Exam").
Tailor schedules to each breed's known health risks, size, and lifespan where relevant (e.g. brachycephalic airway checks, giant-breed joint screens, HCM screening for predisposed cats).
Use realistic recurring schedules: set intervalDays for repeating items; omit or null intervalDays for one-off windows.
Ground suggestions in common veterinary schedules where widely accepted; when uncertain, prefer conservative mainstream intervals.`;

  const userPrompt = `Return JSON with exactly this shape:
{"rulesByBreedName":{"<breed name exactly as listed>":[{"title":"string","type":"vaccination|deworming|checkup|parasite_control","applicableMinAgeDays":number|null optional,"applicableMaxAgeDays":number|null optional,"intervalDays":number|null optional}]}}

Species: "${speciesName}" (slug "${speciesSlug}").

For EVERY breed below you MUST return a non-empty array with many rules: aim for broad coverage (young-animal series, adult boosters, parasite rotation, annual exams, breed-specific wellness checks).
Arrays must not be empty. Spread types across vaccination, deworming, checkup, and parasite_control where relevant.
Use breed names EXACTLY as written (case and spacing must match).

Breeds:
${breedList}`;

  let lastValidationError = attemptError;

  for (let attempt = 0; attempt < 3; attempt++) {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content:
          attempt === 0 && !lastValidationError
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

    let inner: z.infer<typeof deepseekBreedRulesResponseSchema>;
    try {
      inner = deepseekBreedRulesResponseSchema.parse(parsedJson);
    } catch (e) {
      lastValidationError =
        e instanceof z.ZodError ? e.flatten().toString() : String(e);
      continue;
    }

    const partialRules: Record<string, Record<string, { title: string; type: string }[]>> = {
      [speciesSlug]: {}
    };
    for (const breedName of breedNames) {
      partialRules[speciesSlug][breedName] =
        inner.rulesByBreedName[breedName] ?? [];
    }

    const expectedBatch = breedNames.map((breedName) => ({
      speciesSlug,
      speciesName,
      breedName
    }));
    const coverageError = validateGeneratorProfessionalCoverageForBreeds(
      expectedBatch,
      partialRules
    );
    if (coverageError) {
      lastValidationError = `Professional coverage check failed:\n${coverageError}`;
      continue;
    }

    for (const breedName of breedNames) {
      if (!inner.rulesByBreedName[breedName]?.length) {
        lastValidationError = `Missing rules for breed "${breedName}".`;
        break;
      }
    }
    if (lastValidationError?.startsWith("Missing rules")) {
      continue;
    }

    return {
      rulesByBreedName: inner.rulesByBreedName,
      model
    };
  }

  throw new Error(
    `[generate-rules] Failed for ${speciesSlug} batch [${breedNames.join(", ")}]: ${lastValidationError}`
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[generate-rules] Set DEEPSEEK_API_KEY in your environment or .env file."
    );
    process.exit(1);
  }

  const outPath = join(
    process.cwd(),
    "src/preventive-care-rules/infrastructure/preventive-care-rules.generated.json"
  );

  const merged: Record<
    string,
    Record<string, z.infer<typeof deepseekBreedRulesResponseSchema>["rulesByBreedName"][string]>
  > = {};

  let modelUsed = "deepseek-chat";

  for (const species of SPECIES_SEED_DATA) {
    merged[species.slug] = {};
    const batches = chunk(species.breeds, BREEDS_PER_BATCH);

    console.error(
      `[generate-rules] ${species.name} (${species.slug}): ${species.breeds.length} breed(s) in ${batches.length} batch(es)…`
    );

    for (const batch of batches) {
      const breedNames = batch.map((b) => b.name);
      console.error(`[generate-rules]   → ${breedNames.join(", ")}`);

      const result = await generateRulesForBreedBatch(
        apiKey,
        species.name,
        species.slug,
        breedNames
      );
      modelUsed = result.model;

      for (const breedName of breedNames) {
        merged[species.slug][breedName] = result.rulesByBreedName[breedName] ?? [];
      }
    }
  }

  const expectedBreeds = listExpectedBreeds();
  const coverageError = validateGeneratorProfessionalCoverageForBreeds(
    expectedBreeds,
    merged
  );
  if (coverageError) {
    console.error("[generate-rules] Final coverage check failed:\n", coverageError);
    process.exit(1);
  }

  const envelope = generatedPreventiveCareRulesFileSchema.parse({
    generatedAt: new Date().toISOString(),
    model: modelUsed,
    rulesBySpeciesAndBreed: merged
  });

  writeFileSync(outPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf-8");
  console.error(`[generate-rules] Wrote ${outPath}`);
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
