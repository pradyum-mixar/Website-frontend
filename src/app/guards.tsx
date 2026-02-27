import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

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
