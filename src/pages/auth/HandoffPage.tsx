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
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Handoff failed. Please login manually.");
      }
    })();
  }, [navigate, refreshUser, searchParams]);

  return (
    <main className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Completing sign-in</h1>
          {!error && <p className="card-subtitle">Exchanging your desktop login token...</p>}
        </div>
        
        {error && (
          <div className="form-error show" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}
        
        {error && (
          <p className="form-footer">
            Continue to <Link to="/auth/login">login page</Link>
          </p>
        )}
      </div>
    </main>
  );
}
