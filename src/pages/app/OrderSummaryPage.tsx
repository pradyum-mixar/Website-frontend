import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/AuthContext";
import { apiClient } from "../../lib/api-client";
import "../../assets/css/pricing.css";

export function OrderSummaryPage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const billing = searchParams.get("billing") ?? "monthly";

  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiClient.getPlans(),
  });

  const plans = data?.data ?? [];
  const plan = plans.find((p) => p.id === planId);

  const handleCheckout = async () => {
    if (!planId || checkoutLoading) return;
    setError(null);
    setCheckoutLoading(true);
    try {
      // Snapshot pre-payment state so PaymentSuccessPage can detect changes
      sessionStorage.setItem(
        "pre_checkout_user",
        JSON.stringify({ credits: user?.credits ?? 0, subscription_type: user?.subscription_type ?? 0 }),
      );
      const result = await apiClient.createCheckout(planId, billing);
      window.gtag?.("event", "begin_checkout", { plan_id: planId, billing });
      window.location.href = result.data.payment_link;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="order-summary">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Order Summary</h1>
        </div>
        <div className="order-card">
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line price" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="order-summary">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Plan Not Found</h1>
          <p className="dashboard-subtitle">The selected plan does not exist.</p>
        </div>
        <Link to="/app/pricing" className="btn-back">
          Back to Pricing
        </Link>
      </div>
    );
  }

  const price = plan.price_monthly;
  const hasTrial = plan.trial_period_days > 0 && !(user?.subscription_type && user.subscription_type > 0) && !user?.trial_utilized;

  return (
    <div className="order-summary">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Order Summary</h1>
        <p className="dashboard-subtitle">Review your selection before checkout</p>
      </div>

      <div className="order-card">
        <h2>{plan.name}</h2>
        <p className="order-tagline">{plan.tagline}</p>

        <div className="order-row">
          <span className="label">Plan</span>
          <span className="value">{plan.name}</span>
        </div>
        <div className="order-row">
          <span className="label">Billing Cycle</span>
          <span className="value">Monthly</span>
        </div>
        {hasTrial && (
          <div className="order-row">
            <span className="label">Free Trial</span>
            <span className="value">Included</span>
          </div>
        )}
        <div className="order-total">
          <span className="label">{hasTrial ? "Due today" : "Total"}</span>
          <span className="value">{hasTrial ? "$0.00" : `$${price} / mo`}</span>
        </div>
        {hasTrial && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.75rem 0 0", textAlign: "center" }}>
            After your free trial, you'll be charged ${price}/mo. Cancel anytime.
          </p>
        )}

        <div className="order-actions">
          {error && <p className="checkout-error">{error}</p>}
          <button
            className="btn-payment active"
            disabled={checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading
              ? "Redirecting to checkout…"
              : hasTrial
                ? "Start free trial"
                : "Proceed to Payment"}
          </button>
          <Link to="/app/pricing" className="btn-back">
            Back to Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
