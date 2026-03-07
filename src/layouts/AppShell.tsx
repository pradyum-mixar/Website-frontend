import { useRef, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { SUBSCRIPTION_TYPE_TO_LABEL } from "../features/auth/types";
import "../assets/css/dashboard.css";

export function AppShell() {
  const { user, logout, isSuperuser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
      <nav className={`app-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="app-navbar-content">
          <NavLink to="/app" className="logo">
            <img src="/assets/Logo-Primary_light.png" alt="Mixar" />
          </NavLink>

          <div className="app-nav-links">
            {isSuperuser && (
              <NavLink to="/app/admin" className="app-nav-link admin-link">Admin</NavLink>
            )}
            <NavLink to="/app/downloads" className="app-nav-link">Download</NavLink>
            <NavLink to="/app/pricing" className="app-nav-link">Pricing</NavLink>
            <NavLink to="/app/manage-subscription" className="app-nav-link">Subscription</NavLink>
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
                  <NavLink to="/" className="avatar-menu-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Home
                  </NavLink>
                  <NavLink to="/app" end className="avatar-menu-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                  </NavLink>
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
