import "reflect-metadata";
import * as dotenv from "dotenv";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

dotenv.config({});

import { SPECIES_SEED_DATA } from "species/infrastructure/species.seed";

import { deepseekChatCompletion } from "../../preventive-care-rules/infrastructure/deepseek.client";
import {
  deepseekBreedLifestyleRulesResponseSchema,
  generatedLifestyleRulesFileSchema,
  type ExpectedBreedRef,
  validateGeneratorProfessionalCoverageForBreeds
} from "./lifestyle-rules.schema";

const BREEDS_PER_BATCH = 4;

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
    typeof deepseekBreedLifestyleRulesResponseSchema
  >["rulesByBreedName"];
  model: string;
}> {
  const breedList = breedNames.map((name) => `- "${name}"`).join("\n");

  const systemPrompt = `You are a senior veterinary nutrition and behavior editor building in-app lifestyle guidance for pet owners.
Audience: caring pet parents on a wellness dashboard (clear, calm, professional tone — like trusted clinic handouts). Not diagnosis; owners must consult their veterinarian for medical decisions.

Output MUST be a single JSON object only (no markdown, no code fences, no commentary).
Use whole days from birth for age windows (applicableMinAgeDays / applicableMaxAgeDays).
Each rule uses exactly one type: "exercise", "feeding_awareness", or "food_safety".
Titles: <= 200 characters, specific and actionable.
Descriptions: 2–4 sentences (40–400 chars), practical and breed-aware — mention portion sizes, frequency, or safety where relevant.
Tailor guidance to each breed's size, growth rate, temperament, and known risks (e.g. bloat in deep-chested dogs, brachycephalic heat limits, large-breed puppy growth diets).
Cover life stages with overlapping age windows where helpful (neonatal/puppy/kitten, adolescent, adult, senior).
For very young animals (e.g. under 8 weeks), include feeding_awareness on milk replacer, weaning, and vet-supervised transitions when species-appropriate.`;

  const userPrompt = `Return JSON with exactly this shape:
{"rulesByBreedName":{"<breed name exactly as listed>":[{"title":"string","description":"string","type":"exercise|feeding_awareness|food_safety","applicableMinAgeDays":number|null optional,"applicableMaxAgeDays":number|null optional}]}}

Species: "${speciesName}" (slug "${speciesSlug}").

For EVERY breed below return a non-empty array with at least 6 rules spanning all three types.
Include multiple feeding_awareness items for puppies/kittens and juniors with realistic professional standards (meal frequency, growth formulas, body condition).
Arrays must not be empty. Use breed names EXACTLY as written.

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

    let inner: z.infer<typeof deepseekBreedLifestyleRulesResponseSchema>;
    try {
      inner = deepseekBreedLifestyleRulesResponseSchema.parse(parsedJson);
    } catch (e) {
      lastValidationError =
        e instanceof z.ZodError ? e.flatten().toString() : String(e);
      continue;
    }

    const partialRules: Record<
      string,
      Record<string, { title: string; description: string; type: string }[]>
    > = {
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
    `[generate-lifestyle-rules] Failed for ${speciesSlug} batch [${breedNames.join(", ")}]: ${lastValidationError}`
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[generate-lifestyle-rules] Set DEEPSEEK_API_KEY in your environment or .env file."
    );
    process.exit(1);
  }

  const outPath = join(
    process.cwd(),
    "src/lifestyle-rules/infrastructure/lifestyle-rules.generated.json"
  );

  const merged: Record<
    string,
    Record<
      string,
      z.infer<
        typeof deepseekBreedLifestyleRulesResponseSchema
      >["rulesByBreedName"][string]
    >
  > = {};

  let modelUsed = "deepseek-chat";

  for (const species of SPECIES_SEED_DATA) {
    merged[species.slug] = {};
    const batches = chunk(species.breeds, BREEDS_PER_BATCH);

    console.error(
      `[generate-lifestyle-rules] ${species.name} (${species.slug}): ${species.breeds.length} breed(s) in ${batches.length} batch(es)…`
    );

    for (const batch of batches) {
      const breedNames = batch.map((b) => b.name);
      console.error(`[generate-lifestyle-rules]   → ${breedNames.join(", ")}`);

      const result = await generateRulesForBreedBatch(
        apiKey,
        species.name,
        species.slug,
        breedNames
      );
      modelUsed = result.model;

      for (const breedName of breedNames) {
        merged[species.slug][breedName] =
          result.rulesByBreedName[breedName] ?? [];
      }
    }
  }

  const expectedBreeds = listExpectedBreeds();
  const coverageError = validateGeneratorProfessionalCoverageForBreeds(
    expectedBreeds,
    merged
  );
  if (coverageError) {
    console.error(
      "[generate-lifestyle-rules] Final coverage check failed:\n",
      coverageError
    );
    process.exit(1);
  }

  const envelope = generatedLifestyleRulesFileSchema.parse({
    generatedAt: new Date().toISOString(),
    model: modelUsed,
    rulesBySpeciesAndBreed: merged
  });

  writeFileSync(outPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf-8");
  console.error(`[generate-lifestyle-rules] Wrote ${outPath}`);
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
