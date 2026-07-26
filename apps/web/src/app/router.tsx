import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@app/shell/AppShell";

import { ForgotPasswordPage } from "@modules/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@modules/auth/pages/LoginPage";
import { RegisterPage } from "@modules/auth/pages/RegisterPage";
import { VerifyEmailPage } from "@modules/auth/pages/VerifyEmailPage";

import { AccountPage } from "@modules/dashboard/pages/AccountPage";
import { DashboardHomePage } from "@modules/dashboard/pages/DashboardHomePage";
import { SettingsPage } from "@modules/dashboard/pages/SettingsPage";

import { CalendarPage } from "@modules/calendar/pages/CalendarPage";

import { MapsPage } from "@modules/maps/pages/MapsPage";

import { NeighbourhoodPage } from "@modules/neighbourhood/pages/NeighbourhoodPage";

import { PetsListPage } from "@modules/pets/pages/PetsListPage";
import { PetDetailLayout } from "@modules/pets/pages/PetDetailLayout";
import { PetOverviewPage } from "@modules/pets/pages/PetOverviewPage";
import { PetAnalyticsPage } from "@modules/pets/pages/PetAnalyticsPage";
import { PetHealthLogsPage } from "@modules/pets/pages/PetHealthLogsPage";
import { PetPreventiveCarePage } from "@modules/pets/pages/PetPreventiveCarePage";
import { PetLifestylePage } from "@modules/pets/pages/PetLifestylePage";
import { PetAiSummaryPage } from "@modules/pets/pages/PetAiSummaryPage";
import { PetAiReportDetailPage } from "@modules/pets/pages/PetAiReportDetailPage";
import { PetEditPage } from "@modules/pets/pages/PetEditPage";

import DashboardLayout from "@shared/layouts/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: "account", element: <AccountPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "maps", element: <MapsPage /> },
          { path: "neighbourhood", element: <NeighbourhoodPage /> },
          { path: "pets", element: <PetsListPage /> },
          {
            path: "pets/:petId",
            element: <PetDetailLayout />,
            children: [
              { index: true, element: <PetOverviewPage /> },
              { path: "edit", element: <PetEditPage /> },
              { path: "preventive-care", element: <PetPreventiveCarePage /> },
              { path: "health-logs", element: <PetHealthLogsPage /> },
              { path: "analytics", element: <PetAnalyticsPage /> },
              { path: "lifestyle", element: <PetLifestylePage /> },
              { path: "ai-summary", element: <PetAiSummaryPage /> },
              { path: "ai-summary/:reportId", element: <PetAiReportDetailPage /> }
            ]
          }
        ]
      }
    ]
  }
]);
