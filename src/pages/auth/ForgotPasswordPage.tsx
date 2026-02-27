import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiClient.forgotPasswordSendOtp(email);
      setStep("otp");
      setMessage("If the account exists, OTP has been sent.");
    } catch {
      setError("Unable to send reset OTP.");
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const response = await apiClient.forgotPasswordVerifyOtp(email, otpCode);
      navigate("/auth/reset-password", { state: { resetToken: response.reset_token } });
    } catch {
      setError("Invalid or expired OTP.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Forgot password</h1>
        {step === "email" ? (
          <form onSubmit={sendOtp}>
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Send reset OTP</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <input placeholder="OTP code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
            <button type="submit">Verify OTP</button>
          </form>
        )}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p className="muted">
          Back to <Link to="/auth/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
