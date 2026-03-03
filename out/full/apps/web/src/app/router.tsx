import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@app/shell/AppShell";
import { LoginPage } from "@modules/auth/pages/LoginPage";
import { RegisterPage } from "@modules/auth/pages/RegisterPage";
import { DashboardHomePage } from "@modules/dashboard/pages/DashboardHomePage";
import { PetsListPage } from "@modules/pets/pages/PetsListPage";
import { PetDetailPage } from "@modules/pets/pages/PetDetailPage";
import DashboardLayout from "@shared/layouts/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "dashboard",
        element:<DashboardLayout />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: "pets", element: <PetsListPage /> },
          { path: "pets/:id", element: <PetDetailPage /> }
        ]
      }
    ]
  }
]);

