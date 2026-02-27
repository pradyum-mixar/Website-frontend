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
      setMessage("If the account exists, an OTP has been sent.");
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
    <main className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Forgot Password</h1>
          <p className="card-subtitle">Reset your account password</p>
        </div>

        {step === "email" ? (
          <form className="form" onSubmit={sendOtp}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="form-error show">{error}</div>}

            <button type="submit" className="btn">
              <span className="btn-text">Send Reset Code</span>
              <span className="btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={verifyOtp}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter OTP from your email"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>

            {message && <div className="form-error show" style={{ color: "var(--success-color)", background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.3)" }}>{message}</div>}
            {error && <div className="form-error show">{error}</div>}

            <button type="submit" className="btn">
              <span className="btn-text">Verify Code</span>
              <span className="btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </form>
        )}

        <p className="form-footer">
          Back to <Link to="/auth/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
