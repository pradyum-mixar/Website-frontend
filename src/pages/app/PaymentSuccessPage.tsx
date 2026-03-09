import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

import "../../assets/css/pricing.css";

type SyncState = "polling" | "synced" | "sync-failed";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const { user, refreshUser } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>("polling");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialCreditsRef = useRef<number | null>(null);
  const initialSubTypeRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "succeeded" && status !== "active") return;

    if (initialCreditsRef.current === null) {
      initialCreditsRef.current = user?.credits ?? 0;
    }
    if (initialSubTypeRef.current === null) {
      initialSubTypeRef.current = user?.subscription_type ?? 0;
    }
    const initialCredits = initialCreditsRef.current;
    const initialSubType = initialSubTypeRef.current;
    let attempts = 0;
    const MAX_ATTEMPTS = 12;

    const poll = async () => {
      const freshUser = await refreshUser();
      attempts++;
      const credits = freshUser?.credits ?? user?.credits ?? 0;
      const subType = freshUser?.subscription_type ?? user?.subscription_type ?? 0;
      const updated = credits > initialCredits || subType > initialSubType;

      if (updated) {
        if (pollRef.current) clearInterval(pollRef.current);
        setSyncState("synced");
      } else if (attempts >= MAX_ATTEMPTS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setSyncState("sync-failed");
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const isSucceeded = status === "succeeded" || status === "active";
  const isFailed = status === "failed";
  const isTimedOut = status === "timeout" || status === "expired";
  const isUnknown = !isSucceeded && !isFailed && !isTimedOut;

  const isSubscribed = user && user.subscription_type > 0;
  const planLabel = user?.plan_name ?? null;

  const successMessage = isSubscribed
    ? `Your ${planLabel} plan is now active. Your credits have been added.`
    : "Your credits have been added to your account.";

  return (
    <div className="order-summary">
      <div className="order-card" style={{ textAlign: "center" }}>

        {/* ── SUCCESS ── */}
        {isSucceeded && (
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
            {syncState === "polling" && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Syncing your account...
              </p>
            )}
            {syncState === "sync-failed" && (
              <p style={{ fontSize: "0.85rem", color: "#eab308" }}>
                Your payment was successful but account sync is taking longer than usual.
                Don't worry — your credits will appear shortly. Try refreshing in a minute.
              </p>
            )}
          </>
        )}

        {/* ── FAILED ── */}
        {isFailed && (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6" />
              <path d="M9 9l6 6" />
            </svg>
            <h2>Payment Failed</h2>
            <p className="order-tagline">
              Your payment could not be completed. No charges were made to your account.
              Please try again or use a different payment method.
            </p>
          </>
        )}

        {/* ── TIMED OUT / EXPIRED ── */}
        {isTimedOut && (
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
            <h2>Payment Session Expired</h2>
            <p className="order-tagline">
              Your payment session timed out before it could be completed.
              No charges were made. Please try again.
            </p>
          </>
        )}

        {/* ── UNKNOWN (no status, user navigated here directly, or unexpected status) ── */}
        {isUnknown && (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <circle cx="12" cy="16" r="0.5" fill="#94a3b8" />
            </svg>
            <h2>No Payment Found</h2>
            <p className="order-tagline">
              {status
                ? `Your payment returned with status "${status}". If you were charged, please contact support.`
                : "It looks like you navigated here without completing a payment. If you believe this is an error, please check your billing history or contact support."}
            </p>
          </>
        )}

        {paymentId && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
            Payment reference: <code>{paymentId}</code>
          </p>
        )}

        <div className="order-actions" style={{ marginTop: "2rem" }}>
          {/* Show retry for failed/timeout/unknown states */}
          {(isFailed || isTimedOut) && (
            <>
              <Link to="/app/pricing" className="btn-payment active">
                Retry Payment
              </Link>
              <Link to="/app/buy-credits" className="btn-back">
                Buy Credits Instead
              </Link>
              <Link to="/app" className="btn-back">
                Go to Dashboard
              </Link>
            </>
          )}

          {/* Show dashboard + buy more for success */}
          {isSucceeded && (
            <>
              <Link to="/app" className="btn-payment active">
                Go to Dashboard
              </Link>
              <Link to="/app/buy-credits" className="btn-back">
                Buy More Credits
              </Link>
            </>
          )}

          {/* Unknown/no-status — direct them to pricing or dashboard */}
          {isUnknown && (
            <>
              <Link to="/app" className="btn-payment active">
                Go to Dashboard
              </Link>
              <Link to="/app/pricing" className="btn-back">
                View Plans
              </Link>
              <Link
                to="/app/manage-subscription?tab=billing"
                className="btn-back"
              >
                Check Billing History
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
