import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

type PublicNavbarProps = {
  activePage?: "about" | "pricing" | "download" | "contact" | "bug-report" | "changelog";
};

export function PublicNavbar({ activePage }: PublicNavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.split("@")[0].substring(0, 2).toUpperCase() ?? "?";

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className={`navbar-content${menuOpen ? " menu-open" : ""}`}>
        <Link to="/" className="logo">
          <img src="https://d2znch1yzypu23.cloudfront.net/Logo-Primary_light.png" alt="Mixar" />
        </Link>

        {!isMobile && (
          <>
            <div className="nav-links">
              <Link to="/about" className={activePage === "about" ? "active" : ""}>About</Link>
              <Link to="/pricing" className={activePage === "pricing" ? "active" : ""}>Pricing</Link>
              <Link to="/changelog" className={activePage === "changelog" ? "active" : ""}>Changelog</Link>
              <Link to="/downloads" className={activePage === "download" ? "active" : ""}>Download</Link>
              {isAuthenticated && <Link to="/app">Dashboard</Link>}
            </div>

            <div className="nav-buttons">
              <a
                href="https://discord.gg/YVqvkQx8rX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-nav-secondary"
              >
                Join Discord
              </a>
              {isAuthenticated ? (
                <div className="avatar-dropdown" ref={profileRef}>
                  <button className="user-avatar" onClick={() => setProfileOpen((o) => !o)}>
                    {initials}
                  </button>
                  {profileOpen && (
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
              ) : (
                <Link to="/auth/login" className="btn-nav-primary">
                  Sign In
                </Link>
              )}
            </div>
          </>
        )}

        {isMobile && (
          <button
            className="hamburger-toggle"
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
        )}
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/about" className={activePage === "about" ? "active" : ""}>About</Link>
          <Link to="/pricing" className={activePage === "pricing" ? "active" : ""}>Pricing</Link>
          <Link to="/changelog" className={activePage === "changelog" ? "active" : ""}>Changelog</Link>
          <Link to="/downloads" className={activePage === "download" ? "active" : ""}>Download</Link>
          {isAuthenticated && <Link to="/app">Dashboard</Link>}
          <div className="mobile-menu-divider" />
          {isAuthenticated ? (
            <button className="mobile-menu-link" onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/auth/login" className="btn-nav-primary mobile-menu-signin">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
