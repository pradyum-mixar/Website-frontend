import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authStorage } from "../../features/auth/storage";

export function DesktopLoginPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const port = searchParams.get("port");
    if (!port) {
      setStatus("error");
      setErrorMsg("Missing port parameter.");
      return;
    }

    const tokens = authStorage.readTokens();
    if (!tokens?.accessToken) {
      setStatus("error");
      setErrorMsg("No active session found.");
      return;
    }

    // Redirect browser to localhost server started by C++ app
    const callbackUrl = `http://127.0.0.1:${port}/?access_token=${encodeURIComponent(
      tokens.accessToken,
    )}&refresh_token=${encodeURIComponent(tokens.refreshToken || "")}`;

    // Send the redirect. We can use window.location.href
    window.location.href = callbackUrl;
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
