import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import "../assets/css/landing.css";
import "../assets/css/about.css";

export function AboutPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="about-page">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <img src="/assets/Logo-Primary_light.png" alt="Mixar" />
          </Link>
          <div className="nav-links">
            <Link to="/about" className="active">About</Link>
            <Link to="/pricing">Pricing</Link>
            {isAuthenticated && <Link to="/app/downloads">Download</Link>}
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
                    <button className="avatar-menu-item" onClick={async () => { setProfileOpen(false); await logout(); navigate("/"); }}>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-image-container">
          <img src="/assets/about-us/skate_back.webp" alt="The world is 3D" />
          <div className="about-hero-text-overlay">
            <h1>The world is <span className="about-text-gradient">3D</span>. The intelligence that powers it must be, too.</h1>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="about-mission-left">
          <h2>At Mixar, we are building the <span className="about-text-gradient">agentic layer</span> for the spatial era.</h2>
        </div>
        <div className="about-mission-right">
          <p>For decades, 3D creation has been a manual bottleneck. Whether building assets for a game or environments for a robot, the pipeline is high-entropy and time-consuming. At Mixar, we are architecting the intelligence layer that transforms 3D software from a passive editor into an <span className="about-highlight">autonomous collaborator</span>.</p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="about-philosophy">
        <p className="about-section-label">OUR PHILOSOPHY</p>
        <h2 className="about-section-title">What drives how we build</h2>
        <p className="about-section-description">While our journey began with empowering 3D artists, the engine we are building lies at the convergence of the world's most critical frontiers:</p>

        <div className="about-philosophy-cards">
          <div className="about-philosophy-card">
            <div className="about-card-header">
              <div className="about-card-dot"></div>
              <span className="about-card-title">Creative Economy</span>
            </div>
            <p className="about-card-description">Empowering game developers and filmmakers to iterate at the speed of thought.</p>
          </div>

          <div className="about-philosophy-card">
            <div className="about-card-header">
              <div className="about-card-dot"></div>
              <span className="about-card-title">Physical AI</span>
            </div>
            <p className="about-card-description">Providing the high-fidelity, semantic data layer required for robots to perceive and interact with reality.</p>
          </div>

          <div className="about-philosophy-card">
            <div className="about-card-header">
              <div className="about-card-dot"></div>
              <span className="about-card-title">Spatial Intelligence</span>
            </div>
            <p className="about-card-description">Architecting the infrastructure that teaches machines to understand depth, physics, and spatial relationships.</p>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="about-join">
        <p className="about-section-label">JOIN US</p>
        <h2 className="about-section-title">Build the frontier of <span className="about-text-gradient">Agentic 3D</span></h2>
        <p className="about-join-description">We are a team of passionate engineers, designers and researchers, working towards building the future. If you are obsessed with collapsing the entropy of 3D creation and building the infrastructure for Physical AI, we want to hear from you.</p>
        <div className="about-join-buttons">
          <a href="https://discord.gg/YVqvkQx8rX" target="_blank" rel="noopener noreferrer" className="about-btn-primary">Join Discord</a>
          <a href="mailto:careers@mixar.io" className="about-btn-outline">Get in Touch</a>
        </div>
      </section>
    </div>
  );
}
