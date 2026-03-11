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
        <div className="order-row">
          <span className="label">Credits</span>
          <span className="value">{plan.credits_per_month.toLocaleString()} / month</span>
        </div>

        <div className="order-total">
          <span className="label">Total</span>
          <span className="value">${price} / mo</span>
        </div>

        <div className="order-actions">
          {error && <p className="checkout-error">{error}</p>}
          <button
            className="btn-payment active"
            disabled={checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? "Redirecting to checkout…" : "Proceed to Payment"}
          </button>
          <Link to="/app/pricing" className="btn-back">
            Back to Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
