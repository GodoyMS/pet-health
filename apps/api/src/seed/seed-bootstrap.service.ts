import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";

import { configEnvs } from "config/configEnvs";
import { LifestyleRulesSeedService } from "../lifestyle-rules/application/lifestyle-rules-seed.service";
import { PreventiveCareRulesSeedService } from "../preventive-care-rules/application/preventive-care-rules-seed.service";
import { SpeciesSeedService } from "../species/application/species-seed.service";

/**
 * Loads reference data (species, breeds, preventive-care and lifestyle rules)
 * on boot when SEED_ON_BOOT is enabled, so a fresh deployment reaches a usable
 * state without a manual step.
 *
 * Runs after migrations: TypeORM applies those while the DataSource initialises,
 * which is strictly before `onApplicationBootstrap`.
 *
 * Every seed is an idempotent upsert, so this is safe on each restart. Demo
 * neighbours are deliberately excluded — they create fake accounts and stay
 * opt-in via `pnpm run seed:neighbours`.
 */
@Injectable()
export class SeedBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedBootstrapService.name);

  constructor(
    private readonly speciesSeed: SpeciesSeedService,
    private readonly preventiveCareRulesSeed: PreventiveCareRulesSeedService,
    private readonly lifestyleRulesSeed: LifestyleRulesSeedService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!configEnvs.isSeedOnBootEnabled) {
      return;
    }

    const startedAt = Date.now();
    this.logger.log("SEED_ON_BOOT is enabled — seeding reference data…");

    try {
      await this.speciesSeed.seed();
      await this.preventiveCareRulesSeed.seed();
      await this.lifestyleRulesSeed.seed();
      this.logger.log(
        `Reference data seed finished in ${Date.now() - startedAt}ms.`
      );
    } catch (err) {
      // A failed seed must not take the API down: the schema is already
      // migrated, and the seed can be re-run with `pnpm run seed:prod`.
      this.logger.error(
        "Reference data seed failed — the API will keep serving. " +
          "Re-run it with `pnpm run seed:prod`.",
        err as Error
      );
    }
  }
}
