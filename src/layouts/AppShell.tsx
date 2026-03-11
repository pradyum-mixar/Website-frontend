import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { SUBSCRIPTION_TYPE_TO_LABEL } from "../features/auth/types";
import "../assets/css/dashboard.css";

export function AppShell() {
  const { user, logout, isSuperuser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email.split("@")[0].substring(0, 2).toUpperCase();

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
          <NavLink to="/app/downloads" className="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </NavLink>
          <NavLink to="/app/pricing" className="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Pricing
          </NavLink>
          <NavLink to="/app/billing" className="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Billing
          </NavLink>
          <div className="user-avatar">
            {initials}
            {user && user.subscription_type > 0 && (
              <span className={`avatar-plan-badge plan-${user.subscription_type}`}>
                {SUBSCRIPTION_TYPE_TO_LABEL[user.subscription_type]}
              </span>
            )}
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ cursor: "pointer", background: "none", border: "none" }}>
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
