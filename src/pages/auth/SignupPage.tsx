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

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiClient.sendSignupOtp({
        email,
        password,
        name,
        referral_code: referralCode || undefined,
      });
      setStep("otp");
      setMessage("OTP sent to your email.");
    } catch {
      setError("Failed to send OTP.");
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
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
    } catch {
      setError("OTP verification failed.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create account</h1>
        {step === "details" ? (
          <form onSubmit={sendOtp}>
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              placeholder="Referral code (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <button type="submit">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <input placeholder="OTP code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
            <button type="submit">Verify OTP & Complete Signup</button>
          </form>
        )}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p className="muted">
          Already registered? <Link to="/auth/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
