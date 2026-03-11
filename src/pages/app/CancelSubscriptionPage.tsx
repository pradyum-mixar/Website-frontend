import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";
import "../../assets/css/pricing.css";

export function CancelSubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.subscription_type === 0) {
    return <Navigate to="/app/pricing" replace />;
  }

  const planLabel = user.plan_name ?? "Paid";
  const alreadyCancelled = !!user.subscription_expires_at;

  const handleCancel = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel your ${planLabel} plan?\n\nYou'll keep access until the end of your current billing period, then revert to the Free plan.`
    );
    if (!confirmed) return;

    setError(null);
    setLoading(true);
    try {
      await apiClient.cancelSubscription();
      await refreshUser();
      navigate("/app/pricing");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="order-summary">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Cancel Subscription</h1>
        <p className="dashboard-subtitle">
          {alreadyCancelled
            ? "Your cancellation is already in progress"
            : "We're sorry to see you go"}
        </p>
      </div>

      <div className="order-card">
        <h2>{planLabel} Plan</h2>

        {alreadyCancelled ? (
          <>
            <p className="order-tagline">
              Your subscription has been cancelled. You'll retain access until{" "}
              <strong>
                {new Date(user.subscription_expires_at!).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>.
            </p>
            <div className="order-actions">
              <Link to="/app/pricing" className="btn-back">
                Back to Pricing
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="order-tagline">Here's what will happen if you cancel:</p>

            <div className="order-row">
              <span className="label">Access</span>
              <span className="value">Retained until billing period ends</span>
            </div>
            <div className="order-row">
              <span className="label">After expiry</span>
              <span className="value">Reverts to Free plan</span>
            </div>
            <div className="order-row">
              <span className="label">Credits</span>
              <span className="value">Remaining credits are kept</span>
            </div>

            <div className="order-actions">
              {error && <p className="checkout-error">{error}</p>}
              <button
                className="btn-cancel"
                disabled={loading}
                onClick={handleCancel}
              >
                {loading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
              <Link to="/app/pricing" className="btn-back">
                Keep My Plan
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
