import "reflect-metadata";

import { MigrationExecutor } from "typeorm";

import dataSource from "./data-source";

/**
 * Stamps migrations as applied without executing them ("fake run").
 *
 * Needed once, for the database that TypeORM's `synchronize` already built
 * before migrations existed: its tables are present, so running the initial
 * migration would fail with "relation already exists". Recording it instead
 * lines the migration history up with reality, and every later migration then
 * runs normally.
 *
 * Usage:
 *   pnpm run db:baseline          # stamp the oldest pending migration
 *   pnpm run db:baseline --all    # stamp every pending migration
 *
 * Do NOT run this against an empty database — use `migration:run` there.
 */

function say(message: string): void {
  console.error(`[baseline] ${message}`);
}

/**
 * Connects with retries. A sleeping managed database (Railway's TCP proxy in
 * particular) drops the first attempt with ECONNRESET, or answers "the database
 * system is starting up", while it wakes.
 */
async function connectWithRetry(attempts = 8, delayMs = 4000): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await dataSource.initialize();
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === attempts) {
        throw err;
      }
      say(`connection attempt ${attempt}/${attempts} failed (${message}); retrying…`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/** A schema TypeORM built already has this table; an empty database does not. */
async function schemaLooksPopulated(): Promise<boolean> {
  const rows: { exists: boolean }[] = await dataSource.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables " +
      "WHERE table_schema = current_schema() AND table_name = 'users') AS exists"
  );
  return rows[0]?.exists === true;
}

async function main(): Promise<void> {
  const stampAll = process.argv.includes("--all");

  await connectWithRetry();
  try {
    const executor = new MigrationExecutor(dataSource);
    const pending = await executor.getPendingMigrations();

    if (pending.length === 0) {
      say("no pending migrations — nothing to stamp.");
      return;
    }

    if (!(await schemaLooksPopulated())) {
      throw new Error(
        "This database has no application tables, so there is nothing to " +
          "baseline. Run `pnpm run migration:run` instead — it will build the " +
          "schema properly."
      );
    }

    const executed = await executor.getExecutedMigrations();
    if (executed.length > 0 && !stampAll) {
      throw new Error(
        `Migration history is not empty (${executed.length} recorded). ` +
          "Baselining is a one-time operation. If you really need to stamp " +
          "further migrations, pass --all."
      );
    }

    // Oldest first: getPendingMigrations preserves the timestamp ordering that
    // getAllMigrations applies, so the initial migration is at index 0.
    const toStamp = stampAll ? pending : [pending[0]];

    for (const migration of toStamp) {
      await executor.insertMigration(migration);
      say(`stamped ${migration.name} as applied (not executed).`);
    }

    const remaining = pending.length - toStamp.length;
    say(
      `done. ${toStamp.length} migration(s) recorded, ${remaining} still pending — ` +
        "run `pnpm run migration:run` to apply those."
    );
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
  console.error("[baseline] failed.");
  console.error(msg);
  process.exit(1);
});
