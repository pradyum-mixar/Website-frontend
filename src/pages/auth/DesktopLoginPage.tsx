import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { authStorage } from "../../features/auth/storage";

export function DesktopLoginPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const port = searchParams.get("port");
    const codeChallenge = searchParams.get("code_challenge");

    if (!port || !codeChallenge) {
      setStatus("error");
      setErrorMsg("Missing authentication parameters.");
      return;
    }

    const tokens = authStorage.readTokens();
    if (!tokens?.accessToken) {
      setStatus("error");
      setErrorMsg("Please log in to Mixar before connecting the desktop app.");
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
        setStatus("error");
        setErrorMsg("Failed to authenticate with the desktop app. Please try again.");
      }
    })();
  }, [searchParams]);

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Desktop Login</h1>
        {status === "processing" && <p className="muted">Redirecting back to Mixar app...</p>}
        {status === "error" && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
}
