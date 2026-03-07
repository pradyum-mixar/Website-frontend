import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

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

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const url = await apiClient.getGoogleLoginUrl();
      window.location.href = url;
    } catch {
      setError("Failed to start Google sign-up. Please try again.");
    }
  };

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

            <div className="divider">
              <span>or</span>
            </div>

            <button type="button" className="btn-google" onClick={handleGoogleSignup}>
              <GoogleIcon />
              <span>Continue with Google</span>
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
