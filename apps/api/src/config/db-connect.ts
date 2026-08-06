import { DataSource } from "typeorm";

/**
 * Connects with retries, for the one-shot CLIs that run around a deploy.
 *
 * Two transient failures are expected in a managed environment and both look
 * like a hard error on the first attempt:
 *   - a sleeping database answers `ECONNRESET` or "the database system is
 *     starting up" while it wakes;
 *   - Railway's private network (`*.railway.internal`) needs a moment to come
 *     up when the container starts, so an immediate connect gets ENOTFOUND.
 *
 * The long-running API does not need this — the Nest TypeORM module already
 * retries on its own.
 */
export async function connectWithRetry(
  dataSource: DataSource,
  log: (message: string) => void,
  attempts = 10,
  delayMs = 3000
): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await dataSource.initialize();
      return;
    } catch (err) {
      if (attempt === attempts) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      log(`connection attempt ${attempt}/${attempts} failed (${message}); retrying…`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
