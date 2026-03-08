import { useRef, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { SUBSCRIPTION_TYPE_TO_LABEL } from "../features/auth/types";
import "../assets/css/dashboard.css";

export function AppShell() {
  const { user, logout, isSuperuser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnDashboard = location.pathname === "/app" || location.pathname === "/app/";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email.split("@")[0].substring(0, 2).toUpperCase();

  return (
    <>
      <nav className="app-navbar">
        <div className="app-navbar-content">
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
            <NavLink to="/app/downloads" className="app-nav-link">Download</NavLink>
            <NavLink to="/app/manage-subscription" className="app-nav-link">Manage Subscription</NavLink>
          </div>

          <div className="app-nav-actions">
            <NavLink to="/app/buy-credits" className="app-credits-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>{user?.credits ?? 0}</span>
            </NavLink>

            <div className="avatar-dropdown" ref={dropdownRef}>
              <button className="user-avatar" onClick={() => setDropdownOpen((o) => !o)}>
                {initials}
                {user && user.subscription_type > 0 && (
                  <span className={`avatar-plan-badge plan-${user.subscription_type}`}>
                    {SUBSCRIPTION_TYPE_TO_LABEL[user.subscription_type]}
                  </span>
                )}
              </button>
              {dropdownOpen && (
                <div className="avatar-menu">
                  <button className="avatar-menu-item" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
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
