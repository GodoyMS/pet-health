import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAdminAuth } from "../hooks/useAdminAuth";

/**
 * Route gate for the whole backoffice: requires an authenticated session
 * AND the admin role. Non-admin users are sent back to the login screen.
 */
export function RequireAdmin() {
  const { user, isAdmin, isLoading, isError } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/login?error=not_admin" replace />;
  }

  return <Outlet />;
}
