import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminShell } from "@app/shell/AdminShell";

import { LoginPage } from "@modules/auth/pages/LoginPage";
import { RequireAdmin } from "@modules/auth/components/RequireAdmin";

import { OverviewPage } from "@modules/overview/pages/OverviewPage";
import { UsersListPage } from "@modules/users/pages/UsersListPage";
import { UserDetailPage } from "@modules/users/pages/UserDetailPage";
import { PetsListPage } from "@modules/pets/pages/PetsListPage";
import { PetDetailPage } from "@modules/pets/pages/PetDetailPage";
import { HealthLogsPage } from "@modules/records/pages/HealthLogsPage";
import { AiReportsPage } from "@modules/records/pages/AiReportsPage";
import { AiReportDetailPage } from "@modules/records/pages/AiReportDetailPage";
import { PreventiveRulesPage } from "@modules/rules/pages/PreventiveRulesPage";
import { LifestyleRulesPage } from "@modules/rules/pages/LifestyleRulesPage";
import { SpeciesPage } from "@modules/rules/pages/SpeciesPage";
import { SystemPage } from "@modules/system/pages/SystemPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/",
        element: <AdminShell />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: "users", element: <UsersListPage /> },
          { path: "users/:userId", element: <UserDetailPage /> },
          { path: "pets", element: <PetsListPage /> },
          { path: "pets/:petId", element: <PetDetailPage /> },
          { path: "health-logs", element: <HealthLogsPage /> },
          { path: "ai-reports", element: <AiReportsPage /> },
          { path: "ai-reports/:reportId", element: <AiReportDetailPage /> },
          { path: "preventive-care-rules", element: <PreventiveRulesPage /> },
          { path: "lifestyle-rules", element: <LifestyleRulesPage /> },
          { path: "species", element: <SpeciesPage /> },
          { path: "system", element: <SystemPage /> },
          { path: "*", element: <Navigate to="/" replace /> }
        ]
      }
    ]
  }
]);
