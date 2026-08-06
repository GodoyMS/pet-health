import { DataSource } from "typeorm";

import { ormConfig } from "./ormconfig";

/**
 * Entry point for the TypeORM CLI (`pnpm run migration:generate|run|revert`).
 *
 * `migrationsRun` is stripped so the CLI never applies migrations as a side
 * effect of connecting — `migration:run` does that explicitly. `synchronize` is
 * stripped for the same reason: a CLI connection must not alter the schema.
 */
export default new DataSource({
  ...ormConfig,
  synchronize: false,
  migrationsRun: false
});
