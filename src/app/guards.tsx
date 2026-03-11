import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { LandingPage } from "../pages/LandingPage";
import "../assets/css/landing.css";

function SessionLoader() {
  return (
    <div className="lp-overlay" aria-hidden="true">
      <img src="/assets/Logomark.svg" alt="" className="lp-overlay-logo" />
    </div>
  );
}

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SessionLoader />;
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

  if (isLoading) return <SessionLoader />;
  return <LandingPage />;
}
