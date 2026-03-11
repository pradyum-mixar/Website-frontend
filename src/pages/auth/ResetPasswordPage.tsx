import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiClient } from "../../lib/api-client";

type ResetState = { resetToken?: string };

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetState | null) ?? {};
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!state.resetToken) {
      setError("Missing reset token. Restart forgot-password flow.");
      return;
    }
    try {
      await apiClient.resetPassword(state.resetToken, password);
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/auth/login"), 1500);
    } catch {
      setError("Password reset failed.");
    }
  };

  return (
    <main className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Set New Password</h1>
          <p className="card-subtitle">Please choose a secure password</p>
        </div>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-input-container">
              <input
                className="form-input"
                placeholder="New password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && <div className="form-error show" style={{ color: "var(--success-color)", background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.3)" }}>{message}</div>}
          {error && <div className="form-error show">{error}</div>}

          <button type="submit" className="btn">
            <span className="btn-text">Reset Password</span>
            <span className="btn-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
