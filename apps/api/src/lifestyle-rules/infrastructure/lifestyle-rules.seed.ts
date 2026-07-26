import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { LifestyleRuleType } from "../domain/lifestyle-rule-type.enum";
import {
  generatedLifestyleRulesFileSchema,
  lifestyleRuleSeedDefinitionSchema,
  type GeneratedLifestyleRulesFile
} from "./lifestyle-rules.schema";

type ParsedLifestyleRule = ReturnType<
  typeof lifestyleRuleSeedDefinitionSchema.parse
>;

/**
 * One row to insert/update during DB seeding.
 * Mirrors create payload fields except `speciesId` / `breedId` (filled at seed time).
 */
export interface LifestyleRuleSeedDefinition {
  title: string;
  description: string;
  type: LifestyleRuleType;
  applicableMinAgeDays?: number | null;
  applicableMaxAgeDays?: number | null;
}

function loadGeneratedFile(): GeneratedLifestyleRulesFile {
  const candidates = [
    join(__dirname, "lifestyle-rules.generated.json"),
    join(
      process.cwd(),
      "src/lifestyle-rules/infrastructure/lifestyle-rules.generated.json"
    ),
    join(
      process.cwd(),
      "dist/lifestyle-rules/infrastructure/lifestyle-rules.generated.json"
    )
  ];

  for (const p of candidates) {
    if (!existsSync(p)) {
      continue;
    }
    const raw = readFileSync(p, "utf-8");
    return generatedLifestyleRulesFileSchema.parse(JSON.parse(raw));
  }

  throw new Error(
    `[lifestyle-rules] Missing lifestyle-rules.generated.json. Tried:\n${candidates.join("\n")}\nRun: pnpm run ai:generate-lifestyle-rules (requires DEEPSEEK_API_KEY), then pnpm run seed:lifestyle-rules.`
  );
}

let cached: GeneratedLifestyleRulesFile | undefined;

function getGenerated(): GeneratedLifestyleRulesFile {
  if (!cached) {
    cached = loadGeneratedFile();
  }
  return cached;
}

/**
 * Returns lifestyle rules to seed for a breed from
 * {@link ./lifestyle-rules.generated.json} (regenerate via
 * `pnpm run ai:generate-lifestyle-rules` before seeding).
 */
function resolveBreedRules(
  bySpecies: Record<string, ParsedLifestyleRule[] | undefined> | undefined,
  breedName: string
): ParsedLifestyleRule[] | undefined {
  if (!bySpecies) return undefined;

  const direct = bySpecies[breedName];
  if (direct?.length) return direct;

  const caseInsensitiveKey = Object.keys(bySpecies).find(
    (key) => key.toLowerCase() === breedName.toLowerCase()
  );
  if (caseInsensitiveKey && bySpecies[caseInsensitiveKey]?.length) {
    return bySpecies[caseInsensitiveKey];
  }

  const normalized = breedName.toLowerCase();
  if (normalized.includes("mixed") || normalized.includes("other")) {
    return bySpecies.Mixed ?? bySpecies.Other;
  }

  return undefined;
}

export function buildLifestyleRulesForBreed(
  speciesSlug: string,
  breedName: string
): LifestyleRuleSeedDefinition[] {
  const file = getGenerated();
  const rules = resolveBreedRules(
    file.rulesBySpeciesAndBreed[speciesSlug],
    breedName
  );
  if (!rules?.length) {
    return [];
  }

  return rules.map((r) => ({
    title: r.title,
    description: r.description,
    type: r.type as LifestyleRuleType,
    applicableMinAgeDays: r.applicableMinAgeDays ?? null,
    applicableMaxAgeDays: r.applicableMaxAgeDays ?? null
  }));
}
