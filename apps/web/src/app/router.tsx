import { createBrowserRouter } from "react-router-dom";



import { AppShell } from "@app/shell/AppShell";

import { LoginPage } from "@modules/auth/pages/LoginPage";

import { RegisterPage } from "@modules/auth/pages/RegisterPage";

import { AccountPage } from "@modules/dashboard/pages/AccountPage";
import { DashboardHomePage } from "@modules/dashboard/pages/DashboardHomePage";

import { PetsListPage } from "@modules/pets/pages/PetsListPage";

import { PetDetailLayout } from "@modules/pets/pages/PetDetailLayout";

import { PetOverviewPage } from "@modules/pets/pages/PetOverviewPage";

import { PetFeaturePage } from "@modules/pets/pages/PetFeaturePage";

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

      {

        path: "dashboard",

        element: <DashboardLayout />,

        children: [

          { index: true, element: <DashboardHomePage /> },

          { path: "account", element: <AccountPage /> },

          { path: "pets", element: <PetsListPage /> },

          {

            path: "pets/:petId",

            element: <PetDetailLayout />,

            children: [

              { index: true, element: <PetOverviewPage /> },

              { path: "edit", element: <PetEditPage /> },

              {

                path: "preventive-care",

                element: <PetFeaturePage slug="preventive-care" />

              },

              {

                path: "health-logs",

                element: <PetFeaturePage slug="health-logs" />

              },

              {

                path: "analytics",

                element: <PetFeaturePage slug="analytics" />

              },

              {

                path: "lifestyle",

                element: <PetFeaturePage slug="lifestyle" />

              },

              {

                path: "ai-summary",

                element: <PetFeaturePage slug="ai-summary" />

              }

            ]

          }

        ]

      }

    ]

  }

]);

