import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page-container">
      <div className="card" style={{ textAlign: "center", gap: "1.5rem" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 700, margin: 0, opacity: 0.2 }}>404</h1>
        <div>
          <h2 className="card-title">Page not found</h2>
          <p className="card-subtitle">The page you're looking for doesn't exist.</p>
        </div>
        <Link to="/" className="btn" style={{ display: "inline-flex", textDecoration: "none" }}>
          <span className="btn-text">Back to home</span>
        </Link>
      </div>
    </main>
  );
}
