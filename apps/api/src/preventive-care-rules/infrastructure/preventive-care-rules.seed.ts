import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PreventiveCareRuleType } from "../domain/preventive-care-rule-type.enum";
import {
  generatedPreventiveCareRulesFileSchema,
  type GeneratedPreventiveCareRulesFile
} from "./preventive-care-rules.schema";

/**
 * One row to insert/update during DB seeding.
 * Mirrors create payload fields except `speciesId` / `breedId` (filled at seed time).
 */
export interface PreventiveCareRuleSeedDefinition {
  title: string;
  type: PreventiveCareRuleType;
  applicableMinAgeDays?: number | null;
  applicableMaxAgeDays?: number | null;
  intervalDays?: number | null;
}

function loadGeneratedFile(): GeneratedPreventiveCareRulesFile {
  const candidates = [
    join(__dirname, "preventive-care-rules.generated.json"),
    join(
      process.cwd(),
      "src/preventive-care-rules/infrastructure/preventive-care-rules.generated.json"
    ),
    join(
      process.cwd(),
      "dist/preventive-care-rules/infrastructure/preventive-care-rules.generated.json"
    )
  ];

  for (const p of candidates) {
    if (!existsSync(p)) {
      continue;
    }
    const raw = readFileSync(p, "utf-8");
    return generatedPreventiveCareRulesFileSchema.parse(JSON.parse(raw));
  }

  throw new Error(
    `[preventive-care-rules] Missing preventive-care-rules.generated.json. Tried:\n${candidates.join("\n")}\nRun: pnpm run ai:generate-rules (requires DEEPSEEK_API_KEY), then pnpm run seed:preventive-care-rules.`
  );
}

let cached: GeneratedPreventiveCareRulesFile | undefined;

function getGenerated(): GeneratedPreventiveCareRulesFile {
  if (!cached) {
    cached = loadGeneratedFile();
  }
  return cached;
}

/**
 * Returns preventive-care rules to seed for a breed from
 * {@link ./preventive-care-rules.generated.json} (regenerate via
 * `pnpm run ai:generate-rules` before seeding).
 *
 * @param speciesSlug - Stable slug from species seed (e.g. `"dog"`, `"cat"`).
 * @param breedName - Exact breed name from species/breeds seed.
 */
export function buildPreventiveCareRulesForBreed(
  speciesSlug: string,
  breedName: string
): PreventiveCareRuleSeedDefinition[] {
  const file = getGenerated();
  const rules = file.rulesBySpeciesAndBreed[speciesSlug]?.[breedName];
  if (!rules?.length) {
    return [];
  }

  return rules.map((r) => ({
    title: r.title,
    type: r.type as PreventiveCareRuleType,
    applicableMinAgeDays: r.applicableMinAgeDays ?? null,
    applicableMaxAgeDays: r.applicableMaxAgeDays ?? null,
    intervalDays: r.intervalDays ?? null
  }));
}
