import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { Button } from "@repo/ui";

import {
  isChunkLoadError,
  reloadForFreshAssets
} from "@shared/utils/chunkLoadRecovery";

/**
 * Root route error UI. Stale deploy chunks auto-reload; everything else gets a
 * simple recovery screen instead of React Router's default crash page.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    if (chunkError) reloadForFreshAssets();
  }, [chunkError]);

  if (chunkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <p className="text-sm text-muted-foreground">Updating the app…</p>
      </div>
    );
  }

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";

  const detail = isRouteErrorResponse(error)
    ? typeof error.data === "string"
      ? error.data
      : null
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {detail ? (
          <p className="mt-2 text-sm text-muted-foreground wrap-break-word">{detail}</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Reloading usually fixes this after a new deploy.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
