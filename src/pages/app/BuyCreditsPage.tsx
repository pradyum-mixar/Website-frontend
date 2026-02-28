import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";
import "../../assets/css/pricing.css";

export function BuyCreditsPage() {
  const [quantity, setQuantity] = useState(10);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["credit-pricing"],
    queryFn: () => apiClient.getCreditPricing(),
  });

  const pricing = data?.data;

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    if (pricing) {
      setQuantity(Math.max(pricing.min_quantity, Math.min(pricing.max_quantity, num)));
    } else {
      setQuantity(num);
    }
  };

  const handleCheckout = async () => {
    if (checkoutLoading || !pricing) return;
    setError(null);
    setCheckoutLoading(true);
    try {
      const result = await apiClient.createCreditCheckout(quantity);
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
          <h1 className="dashboard-title">Buy Credits</h1>
        </div>
        <div className="order-card">
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line price" />
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="order-summary">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Buy Credits</h1>
          <p className="dashboard-subtitle">Credit pricing is currently unavailable.</p>
        </div>
        <Link to="/app" className="btn-back">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const total = (quantity * pricing.price_per_credit).toFixed(2);

  return (
    <div className="order-summary">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Buy Credits</h1>
        <p className="dashboard-subtitle">Purchase additional credits for your account</p>
      </div>

      <div className="order-card">
        <h2>Mixar Credits</h2>
        <p className="order-tagline">One-time purchase — credits never expire</p>

        <div className="order-row">
          <span className="label">Price per Credit</span>
          <span className="value">${pricing.price_per_credit.toFixed(2)}</span>
        </div>
        <div className="order-row">
          <span className="label">Quantity</span>
          <span className="value">
            <input
              type="number"
              className="credit-qty-input"
              value={quantity}
              min={pricing.min_quantity}
              max={pricing.max_quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
            />
          </span>
        </div>

        <div className="order-total">
          <span className="label">Total</span>
          <span className="value">${total}</span>
        </div>

        <div className="order-actions">
          {error && <p className="checkout-error">{error}</p>}
          <button
            className="btn-payment active"
            disabled={checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? "Redirecting to checkout\u2026" : "Proceed to Payment"}
          </button>
          <Link to="/app" className="btn-back">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
