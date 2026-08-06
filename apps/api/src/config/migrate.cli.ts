import "reflect-metadata";

import dataSource from "./data-source";
import { connectWithRetry } from "./db-connect";

/**
 * Applies pending migrations. Used as Railway's pre-deploy command, so a failed
 * migration aborts the deploy and the previous version keeps serving.
 *
 * Preferred over calling the TypeORM CLI directly because that has no
 * connection retry, and the first connect after a container starts routinely
 * fails while the database or the private network wakes up.
 *
 *   pnpm run migrate:prod
 */

function say(message: string): void {
  console.error(`[migrate] ${message}`);
}

async function main(): Promise<void> {
  await connectWithRetry(dataSource, say);
  try {
    const applied = await dataSource.runMigrations({ transaction: "each" });
    if (applied.length === 0) {
      say("no pending migrations — schema is up to date.");
      return;
    }
    for (const migration of applied) {
      say(`applied ${migration.name}`);
    }
    say(`done. ${applied.length} migration(s) applied.`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
  console.error("[migrate] failed.");
  console.error(msg);
  process.exit(1);
});
