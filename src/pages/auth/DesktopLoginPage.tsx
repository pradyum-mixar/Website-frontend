import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { authStorage } from "../../features/auth/storage";

export function DesktopLoginPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    const port = searchParams.get("port");
    const codeChallenge = searchParams.get("code_challenge");

    if (!port || !codeChallenge) {
      setErrorMsg("Missing authentication parameters.");
      setStatus("error");
      return;
    }

    const tokens = authStorage.readTokens();
    if (!tokens?.accessToken) {
      setErrorMsg("Please log in to Mixar before connecting the desktop app.");
      setIsAuthError(true);
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const response = await apiClient.instance.post<{ data: { code: string } }>(
          "/auth/desktop/code",
          { code_challenge: codeChallenge },
        );
        const { code } = response.data.data;
        window.location.href = `http://127.0.0.1:${port}/?code=${encodeURIComponent(code)}`;
      } catch {
        setErrorMsg("Failed to authenticate with the desktop app. Please try again.");
        setStatus("error");
      }
    })();
  }, [searchParams]);

  return (
    <main className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Desktop Login</h1>
          <p className="card-subtitle">Connecting Mixar to your browser</p>
        </div>

        {status === "processing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div className="spinner" />
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Redirecting back to Mixar app...
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="form-error show">{errorMsg}</div>
            {isAuthError && (
              <a href="/auth/login" className="btn-secondary" style={{ justifyContent: "center" }}>
                Sign in to Mixar
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
