const RELOAD_KEY = "pet-health:chunk-reload";
const RELOAD_COOLDOWN_MS = 15_000;

/** True when a dynamic import failed because the hashed asset is gone (typical after a deploy). */
export function isChunkLoadError(error: unknown): boolean {
  if (error == null) return false;

  const name = error instanceof Error ? error.name : "";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error);

  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    (name === "TypeError" && /dynamically imported module/i.test(message))
  );
}

/**
 * Reload once after a stale-chunk failure so the browser picks up the new
 * index.html and asset hashes. A short cooldown prevents infinite reload loops
 * if the CDN or network is genuinely down.
 */
export function reloadForFreshAssets(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
    const now = Date.now();
    if (now - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    /* private mode / blocked storage — still attempt one reload */
  }
  window.location.reload();
  return true;
}

/**
 * Run a dynamic import; on chunk-load failure, reload for fresh assets.
 * Returns a never-settling promise while the reload is in flight so React
 * Suspense does not flip to an error UI mid-navigation.
 */
export function importWithChunkRecovery<T>(factory: () => Promise<T>): Promise<T> {
  return factory().catch((error: unknown) => {
    if (isChunkLoadError(error) && reloadForFreshAssets()) {
      return new Promise<T>(() => {
        /* waiting for reload */
      });
    }
    throw error;
  });
}
