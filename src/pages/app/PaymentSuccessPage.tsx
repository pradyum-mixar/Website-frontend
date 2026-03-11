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

  // Poll until user data reflects the payment (webhook delivery may lag).
  // Works for both status=succeeded and status=processing/pending/missing.
  // Stops when subscription_type > 0 or credits change, or after 60s.
  useEffect(() => {
    const initialCredits = user?.credits ?? 0;
    const initialSubType = user?.subscription_type ?? 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 40;

    const poll = async () => {
      const me = await refreshUser();
      attempts++;
      const updated = me && (
        me.credits !== initialCredits ||
        me.subscription_type > initialSubType
      );
      if (updated || attempts >= MAX_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setSynced(true);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const isSubscribed = user && user.subscription_type > 0;
  const planLabel = user ? SUBSCRIPTION_TYPE_TO_LABEL[user.subscription_type] : null;

  return (
    <div className="order-summary">
      <div className="order-card" style={{ textAlign: "center" }}>
        {synced && isSubscribed ? (
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
            <p className="order-tagline">
              Your {planLabel} plan is now active.
            </p>
          </>
        ) : synced ? (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke={status === "succeeded" ? "#22c55e" : "#eab308"}
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d={status === "succeeded" ? "M8 12l3 3 5-6" : "M12 6v6l4 2"} />
            </svg>
            <h2>{status === "succeeded" ? "Payment Successful!" : "Payment Received"}</h2>
            <p className="order-tagline">
              Your plan status will update shortly.
            </p>
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
            <h2>Processing Payment</h2>
            <p className="order-tagline">
              Confirming your payment, this may take a few seconds...
            </p>
            <div style={{ margin: "1rem auto", width: 28, height: 28 }}>
              <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            </div>
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
          <Link to="/app/pricing" className="btn-back">
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
