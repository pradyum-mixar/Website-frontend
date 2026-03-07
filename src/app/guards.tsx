import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { LandingPage } from "../pages/LandingPage";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading session...</p>;
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { isSuperuser } = useAuth();
  if (!isSuperuser) return <Navigate to="/app" replace />;
  return <Outlet />;
}

/** Shows the landing page to all visitors. */
export function LandingRoute() {
  const { isLoading } = useAuth();

  // Return null during auth init to avoid a flash of the landing page for logged-in users.
  if (isLoading) return null;
  return <LandingPage />;
}
