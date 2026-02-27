import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import "../assets/css/dashboard.css";

export function AppShell() {
  const { user, logout, isSuperuser } = useAuth();
  console.log("AppShell Auth State:", { user, isSuperuser, is_superuser_prop: user?.is_superuser });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <nav className="nav">
        <NavLink to="/app" className="nav-brand">
          <img src="/assets/Logo-Primary_light.png" alt="Mixar" className="brand-logo" />
        </NavLink>
        <div className="user-menu">
          {isSuperuser && (
            <NavLink to="/app/admin" className="nav-link admin-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Admin
            </NavLink>
          )}
          <div className="user-credits">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{user?.credits ?? 0}</span> credits
          </div>
          <div className="user-avatar">
            {user?.name
              ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : user?.email.split("@")[0].substring(0, 2).toUpperCase()}
          </div>
          <button className="nav-link" style={{ background: "transparent", border: "none" }} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-container">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
