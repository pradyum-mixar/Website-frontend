import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Missing authentication parameters from Google.");
      return;
    }

    (async () => {
      try {
        await apiClient.exchangeGoogleCode(code, state);
        await refreshUser();
        navigate("/app", { replace: true });
      } catch (err: any) {
        const message = err.response?.data?.detail?.message
          || err.response?.data?.message
          || "Google sign-in failed. Please try again.";
        setError(message);
      }
    })();
  }, []);

  return (
    <main className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Google Sign-In</h1>
        </div>
        {error ? (
          <>
            <div className="form-error show">{error}</div>
            <p className="form-footer">
              <a href="/auth/login">Back to Login</a>
            </p>
          </>
        ) : (
          <p className="card-subtitle">Signing you in...</p>
        )}
      </div>
    </main>
  );
}
