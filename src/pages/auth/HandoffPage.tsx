import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";

export function HandoffPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ticket = searchParams.get("ticket");
        if (!ticket) throw new Error("Missing ticket");
        await apiClient.exchangeHandoff(ticket);
        await refreshUser();
        navigate("/app");
      } catch {
        setError("Handoff failed. Please login manually.");
      }
    })();
  }, [navigate, refreshUser, searchParams]);

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Completing sign-in</h1>
        {!error && <p className="muted">Exchanging your desktop login token...</p>}
        {error && (
          <>
            <p className="error">{error}</p>
            <p className="muted">
              Continue to <Link to="/auth/login">login page</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
