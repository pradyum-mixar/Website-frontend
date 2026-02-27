import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiClient } from "../../lib/api-client";

type ResetState = { resetToken?: string };

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetState | null) ?? {};
  const [password, setPassword] = useState("");
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
      setTimeout(() => navigate("/auth/login"), 1000);
    } catch {
      setError("Password reset failed.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Set new password</h1>
        <form onSubmit={onSubmit}>
          <input
            placeholder="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Reset password</button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
