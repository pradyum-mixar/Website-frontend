import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export function AppShell() {
  const { user, logout, isSuperuser } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Mixie Dashboard</h2>
        <p className="muted">{user?.email}</p>
        <nav>
          <NavLink to="/app">Dashboard</NavLink>
          <NavLink to="/app/account">Account</NavLink>
          <NavLink to="/app/admin">Admin</NavLink>
          <button className="secondary" type="button" onClick={logout}>
            Logout
          </button>
        </nav>
        {!isSuperuser && <p className="muted">Admin access requires superuser.</p>}
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
