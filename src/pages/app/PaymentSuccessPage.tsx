import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { SUBSCRIPTION_TYPE_TO_LABEL } from "../../features/auth/types";
import "../../assets/css/pricing.css";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const { user, refreshUser } = useAuth();
  const [synced, setSynced] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll until user data reflects the payment (webhook delivery may lag a few seconds).
  // Stop as soon as subscription_type > 0 or credits increase, or after 15 s.
  useEffect(() => {
    if (status !== "succeeded") return;

    const initialCredits = user?.credits ?? 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    const poll = async () => {
      await refreshUser();
      attempts++;
      const updated = user?.credits !== initialCredits || (user?.subscription_type ?? 0) > 0;
      if (updated || attempts >= MAX_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setSynced(true);
      }
    };

    poll(); // immediate first fetch
    pollRef.current = setInterval(poll, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const isSucceeded = status === "succeeded";
  const isSubscribed = user && user.subscription_type > 0;
  const planLabel = user ? SUBSCRIPTION_TYPE_TO_LABEL[user.subscription_type] : null;

  const successMessage = isSubscribed
    ? `Your ${planLabel} plan is now active. Your credits have been added.`
    : "Your credits have been added to your account.";

  return (
    <div className="order-summary">
      <div className="order-card" style={{ textAlign: "center" }}>
        {isSucceeded ? (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <h2>Payment Successful!</h2>
            <p className="order-tagline">{successMessage}</p>
            {!synced && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Syncing your account…
              </p>
            )}
          </>
        ) : (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <h2>Payment Processing</h2>
            <p className="order-tagline">
              Your payment is being processed. Credits and plan status will
              update in your account shortly.
            </p>
          </>
        )}

        {paymentId && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
            Payment reference: <code>{paymentId}</code>
          </p>
        )}

        <div className="order-actions" style={{ marginTop: "2rem" }}>
          <Link to="/app" className="btn-payment active">
            Go to Dashboard
          </Link>
          <Link to="/app/buy-credits" className="btn-back">
            Buy More Credits
          </Link>
        </div>
      </div>
    </div>
  );
}
