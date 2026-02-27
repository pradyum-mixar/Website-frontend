import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";

export function SignupPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await apiClient.sendSignupOtp({
        email,
        password,
        name,
        referral_code: referralCode || undefined,
      });
      setStep("otp");
      setMessage("OTP sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.verifySignupOtp({
        email,
        password,
        name,
        otp_code: otpCode,
        referral_code: referralCode || undefined,
      });
      await refreshUser();
      navigate("/app");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create Account</h1>
          <p className="card-subtitle">Join Mixar to start creating</p>
        </div>
        {step === "details" ? (
          <form className="form" onSubmit={sendOtp}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  className="form-input"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Referral Code (Optional)</label>
              <input
                className="form-input"
                placeholder="Referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>

            {error && <div className="form-error show">{error}</div>}

            <button className="btn" type="submit" disabled={loading}>
              <span className="btn-text">{loading ? "Sending..." : "Send OTP"}</span>
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
              <input className="form-input" placeholder="Enter OTP code sent to your email" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
            </div>

            {message && <div className="form-error show" style={{ color: "var(--success-color)", background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.3)" }}>{message}</div>}
            {error && <div className="form-error show">{error}</div>}

            <button className="btn" type="submit" disabled={loading}>
              <span className="btn-text">{loading ? "Verifying..." : "Verify OTP & Complete Signup"}</span>
              <span className="btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </form>
        )}
        
        <p className="form-footer">
          Already registered? <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
