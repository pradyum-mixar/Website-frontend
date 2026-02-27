import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <p>Loading session...</p>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { isSuperuser } = useAuth();
  if (!isSuperuser) return <Navigate to="/app" replace />;
  return <Outlet />;
}
