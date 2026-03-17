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
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Poll until user data reflects the payment (webhook delivery may lag).
  // Works for both status=succeeded and status=processing/pending/missing.
  // Stops when subscription_type > 0 or credits change, or after 60s.
  useEffect(() => {
    const initialCredits = user?.credits ?? 0;
    const initialSubType = user?.subscription_type ?? 0;

    let attempts = 0;
    const MAX_ATTEMPTS = 40; // ~60s with 1.5s intervals
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;

      try {
        const freshUser = await refreshUser();
        if (cancelled) return;

        const credits = freshUser?.credits ?? 0;
        const subType = freshUser?.subscription_type ?? 0;
        const planSlug = freshUser?.plan_slug ?? "free";
        const updated = credits !== initialCredits || subType > initialSubType || planSlug === "trial" || subType > 0;

        if (updated) {
          setSyncState("synced");
          return;
        }
      } catch (err) {
        console.error("Payment sync poll error:", err);
      }

      attempts++;

      if (attempts >= MAX_ATTEMPTS) {
        setSyncState("sync-failed");
        return;
      }

      // Schedule next poll
      if (!cancelled) {
        pollRef.current = setTimeout(poll, 1500);
      }
    };

    // Start polling immediately
    poll();

    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const isSucceeded = status === "succeeded" || status === "active";
  const isFailed = status === "failed";
  const isTimedOut = status === "timeout" || status === "expired";
  const isUnknown = !isSucceeded && !isFailed && !isTimedOut;

  const isSubscribed = user && user.subscription_type > 0;
  const planLabel = user?.plan_name ?? null;

  // Build success message based on state
  const isTrial = user?.plan_slug === "trial";
  const successMessage = syncState === "synced" && isSubscribed
    ? isTrial
      ? `Your ${planLabel} trial is now active!`
      : `Your ${planLabel} plan is now active.`
    : "Your payment was received. Your plan status will update shortly.";

  return (
    <div className="order-summary">
      <div className="order-card" style={{ textAlign: "center" }}>

        {/* -- SUCCEEDED -- */}
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

        {/* -- FAILED -- */}
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

        {/* -- TIMED OUT / EXPIRED -- */}
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

        {/* -- UNKNOWN (no status, user navigated here directly, or unexpected status) -- */}
        {isUnknown && (
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
            <h2>{syncState === "synced" ? "Payment Received" : "Processing Payment"}</h2>
            <p className="order-tagline">
              {syncState === "synced"
                ? successMessage
                : "Confirming your payment, this may take a few seconds..."}
            </p>
            {syncState === "polling" && (
              <div style={{ margin: "1rem auto", width: 28, height: 28 }}>
                <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              </div>
            )}
            {syncState === "sync-failed" && (
              <p style={{ fontSize: "0.85rem", color: "#eab308" }}>
                Account sync is taking longer than usual. Your plan status will update shortly.
                Try refreshing in a minute.
              </p>
            )}
          </>
        )}

        {paymentId && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
            Payment reference: <code>{paymentId}</code>
          </p>
        )}

        <div className="order-actions" style={{ marginTop: "2rem" }}>
          {/* Show retry for failed/timeout states */}
          {(isFailed || isTimedOut) && (
            <>
              <Link to="/app/pricing" className="btn-payment active">
                Retry Payment
              </Link>
              <Link to="/app" className="btn-back">
                Go to Dashboard
              </Link>
            </>
          )}

          {/* Show dashboard + plans for success */}
          {isSucceeded && (
            <>
              <Link to="/app" className="btn-payment active">
                Go to Dashboard
              </Link>
              <Link to="/app/pricing" className="btn-back">
                View Plans
              </Link>
            </>
          )}

          {/* Unknown/no-status — direct them to dashboard or pricing */}
          {isUnknown && (
            <>
              <Link to="/app" className="btn-payment active">
                Go to Dashboard
              </Link>
              <Link to="/app/pricing" className="btn-back">
                View Plans
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
