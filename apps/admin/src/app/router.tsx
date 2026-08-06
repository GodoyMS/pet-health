import { Suspense, lazy, type FunctionComponent } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AdminShell } from "@app/shell/AdminShell";

import { LoginPage } from "@modules/auth/pages/LoginPage";
import { RequireAdmin } from "@modules/auth/components/RequireAdmin";

/**
 * Route-level code splitting.
 *
 * The login screen, the auth gate and the shell load eagerly — every visit
 * needs all three. Each backoffice page is fetched on navigation instead, so a
 * cold load no longer carries the tables, editors and charts for twelve
 * screens at once.
 *
 * The fallback renders inside the mounted shell, leaving the sidebar in place.
 */
const lazyPage = <K extends string>(
  load: () => Promise<Record<K, FunctionComponent>>,
  name: K,
) => {
  // The cast collapses `Record<K, FunctionComponent>[K]`, which stays deferred
  // while K is unresolved and so cannot be checked as a JSX element type.
  const Page = lazy(() =>
    load().then((module) => ({ default: module[name] as FunctionComponent })),
  );
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/",
        element: <AdminShell />,
        children: [
          {
            index: true,
            element: lazyPage(() => import("@modules/overview/pages/OverviewPage"), "OverviewPage")
          },
          {
            path: "users",
            element: lazyPage(() => import("@modules/users/pages/UsersListPage"), "UsersListPage")
          },
          {
            path: "users/:userId",
            element: lazyPage(() => import("@modules/users/pages/UserDetailPage"), "UserDetailPage")
          },
          {
            path: "pets",
            element: lazyPage(() => import("@modules/pets/pages/PetsListPage"), "PetsListPage")
          },
          {
            path: "pets/:petId",
            element: lazyPage(() => import("@modules/pets/pages/PetDetailPage"), "PetDetailPage")
          },
          {
            path: "health-logs",
            element: lazyPage(
              () => import("@modules/records/pages/HealthLogsPage"),
              "HealthLogsPage"
            )
          },
          {
            path: "ai-reports",
            element: lazyPage(() => import("@modules/records/pages/AiReportsPage"), "AiReportsPage")
          },
          {
            path: "ai-reports/:reportId",
            element: lazyPage(
              () => import("@modules/records/pages/AiReportDetailPage"),
              "AiReportDetailPage"
            )
          },
          {
            path: "preventive-care-rules",
            element: lazyPage(
              () => import("@modules/rules/pages/PreventiveRulesPage"),
              "PreventiveRulesPage"
            )
          },
          {
            path: "lifestyle-rules",
            element: lazyPage(
              () => import("@modules/rules/pages/LifestyleRulesPage"),
              "LifestyleRulesPage"
            )
          },
          {
            path: "species",
            element: lazyPage(() => import("@modules/rules/pages/SpeciesPage"), "SpeciesPage")
          },
          {
            path: "system",
            element: lazyPage(() => import("@modules/system/pages/SystemPage"), "SystemPage")
          },
          { path: "*", element: <Navigate to="/" replace /> }
        ]
      }
    ]
  }
]);
