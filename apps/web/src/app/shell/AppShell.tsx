import { Toaster } from "@repo/ui";
import { Outlet } from "react-router-dom";

export const AppShell = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main" className="mx-auto ">
        <Toaster/>
        <Outlet />
      </main>
    </div>
  );
};

