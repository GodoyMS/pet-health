import { Suspense, lazy, type FunctionComponent } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Spinner } from "@repo/ui";

import { AppShell } from "@app/shell/AppShell";

import { LoginPage } from "@modules/auth/pages/LoginPage";

import DashboardLayout from "@shared/layouts/DashboardLayout";

/**
 * Route-level code splitting.
 *
 * Shells and auth entry are eager. Marketing landing and everything else —
 * including Maps SDK pages — load on navigation.
 *
 * The fallback renders inside the already-mounted layout, so the sidebar and
 * header stay put while a dashboard page chunk loads.
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
          <Spinner className="text-3xl text-muted-foreground" />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: lazyPage(
          () => import("@modules/marketing/pages/LandingPage"),
          "LandingPage",
        ),
      },
      { path: "login", element: <LoginPage /> },
      {
        path: "register",
        element: lazyPage(() => import("@modules/auth/pages/RegisterPage"), "RegisterPage")
      },
      {
        path: "verify-email",
        element: lazyPage(() => import("@modules/auth/pages/VerifyEmailPage"), "VerifyEmailPage")
      },
      {
        path: "forgot-password",
        element: lazyPage(
          () => import("@modules/auth/pages/ForgotPasswordPage"),
          "ForgotPasswordPage"
        )
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: lazyPage(
              () => import("@modules/dashboard/pages/DashboardHomePage"),
              "DashboardHomePage"
            )
          },
          {
            path: "account",
            element: lazyPage(() => import("@modules/dashboard/pages/AccountPage"), "AccountPage")
          },
          {
            path: "settings",
            element: lazyPage(() => import("@modules/dashboard/pages/SettingsPage"), "SettingsPage")
          },
          {
            path: "calendar",
            element: lazyPage(() => import("@modules/calendar/pages/CalendarPage"), "CalendarPage")
          },
          {
            path: "maps",
            element: lazyPage(() => import("@modules/maps/pages/MapsPage"), "MapsPage")
          },
          {
            path: "neighbourhood",
            element: lazyPage(
              () => import("@modules/neighbourhood/pages/NeighbourhoodPage"),
              "NeighbourhoodPage"
            )
          },
          {
            path: "pets",
            element: lazyPage(() => import("@modules/pets/pages/PetsListPage"), "PetsListPage")
          },
          {
            path: "pets/:petId",
            element: lazyPage(
              () => import("@modules/pets/pages/PetDetailLayout"),
              "PetDetailLayout"
            ),
            children: [
              {
                index: true,
                element: lazyPage(
                  () => import("@modules/pets/pages/PetOverviewPage"),
                  "PetOverviewPage"
                )
              },
              {
                path: "edit",
                element: lazyPage(() => import("@modules/pets/pages/PetEditPage"), "PetEditPage")
              },
              {
                path: "preventive-care",
                element: lazyPage(
                  () => import("@modules/pets/pages/PetPreventiveCarePage"),
                  "PetPreventiveCarePage"
                )
              },
              {
                path: "health-logs",
                element: lazyPage(
                  () => import("@modules/pets/pages/PetHealthLogsPage"),
                  "PetHealthLogsPage"
                )
              },
              {
                path: "analytics",
                element: lazyPage(
                  () => import("@modules/pets/pages/PetAnalyticsPage"),
                  "PetAnalyticsPage"
                )
              },
              {
                path: "lifestyle",
                element: lazyPage(
                  () => import("@modules/pets/pages/PetLifestylePage"),
                  "PetLifestylePage"
                )
              },
              {
                path: "ai-summary",
                element: lazyPage(
                  () => import("@modules/pets/pages/PetAiSummaryPage"),
                  "PetAiSummaryPage"
                )
              },
              {
                path: "ai-summary/:reportId",
                element: lazyPage(
                  () => import("@modules/pets/pages/PetAiReportDetailPage"),
                  "PetAiReportDetailPage"
                )
              }
            ]
          }
        ]
      }
    ]
  }
]);
