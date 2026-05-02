import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PreventiveCareRuleType } from "../domain/preventive-care-rule-type.enum";
import {
  generatedPreventiveCareRulesFileSchema,
  type GeneratedPreventiveCareRulesFile
} from "./preventive-care-rules.schema";

/**
 * One row to insert/update for a species during DB seeding.
 * Mirrors create payload fields except `speciesId` (filled at seed time).
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
    `[preventive-care-rules] Missing preventive-care-rules.generated.json. Tried:\n${candidates.join("\n")}\nRun: pnpm run ai:generate-rules (requires DEEPSEEK_API_KEY), or add the file by hand.`
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
 * Returns preventive-care rules to seed for a species from
 * {@link ./preventive-care-rules.generated.json} (maintainers regenerate via
 * `pnpm run ai:generate-rules`).
 *
 * @param speciesSlug - Stable slug from species seed (e.g. `"dog"`, `"cat"`).
 * @param _speciesId - Reserved for future per-id overrides.
 */
export function buildPreventiveCareRulesForSpecies(
  speciesSlug: string,
  _speciesId: string
): PreventiveCareRuleSeedDefinition[] {
  void _speciesId;

  const file = getGenerated();
  const rules = file.rulesBySpeciesSlug[speciesSlug];
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
