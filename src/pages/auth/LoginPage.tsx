import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const returnTo = searchParams.get("returnTo") || "/app";
      navigate(returnTo);
    } catch {
      setError("Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Sign in to access user and admin dashboard.</p>
        <form onSubmit={onSubmit}>
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="muted">
          No account? <Link to="/auth/signup">Create one</Link>
        </p>
        <p className="muted">
          Forgot password? <Link to="/auth/forgot-password">Reset it</Link>
        </p>
      </div>
    </div>
  );
}
