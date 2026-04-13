import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

import "../assets/css/dashboard.css";

export function AppShell() {
  const { user, logout, isSuperuser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnDashboard = location.pathname === "/app" || location.pathname === "/app/";
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email.split("@")[0].substring(0, 2).toUpperCase();

  return (
    <>
      <nav className="app-navbar">
        <div className={`app-navbar-content${menuOpen ? " menu-open" : ""}`}>
          <NavLink to="/" className="logo">
            <img src="/assets/Logo-Primary_light.png" alt="Mixar" />
          </NavLink>

          <div className="app-nav-links">
            {isSuperuser && (
              <NavLink to="/app/admin" className="app-nav-link admin-link">Admin</NavLink>
            )}
            {isOnDashboard ? (
              <NavLink to="/" className="app-nav-link">Home</NavLink>
            ) : (
              <NavLink to="/app" end className="app-nav-link">Dashboard</NavLink>
            )}
            <NavLink to="/downloads" className="app-nav-link">Download</NavLink>
            <NavLink to="/app/manage-subscription" className="app-nav-link">Manage Subscription</NavLink>
          </div>

          <div className="app-nav-actions">
            <div className="user-avatar">
              {initials}
              {user && user.subscription_type > 0 && (
                <span className={`avatar-plan-badge plan-${user.plan_slug}`}>
                  {user.plan_slug === "trial" ? "Trial" : user.plan_name}
                </span>
              )}
            </div>
            <button className="app-nav-link" onClick={handleLogout} style={{ cursor: "pointer", background: "none", border: "none" }}>
              Logout
            </button>

            {/* Hamburger toggle — visible only on mobile */}
            <button
              className="app-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="app-mobile-menu">
            {isSuperuser && (
              <NavLink to="/app/admin" className="app-nav-link admin-link">Admin</NavLink>
            )}
            {isOnDashboard ? (
              <NavLink to="/" className="app-nav-link">Home</NavLink>
            ) : (
              <NavLink to="/app" end className="app-nav-link">Dashboard</NavLink>
            )}
            <NavLink to="/downloads" className="app-nav-link">Download</NavLink>
            <NavLink to="/app/manage-subscription" className="app-nav-link">Manage Subscription</NavLink>
            <div className="mobile-menu-divider" />
            <button className="app-nav-link" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>Logout</button>
          </div>
        )}
      </nav>

      <main className="dashboard-container">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </>
  );
}
