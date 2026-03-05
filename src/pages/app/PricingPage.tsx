import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiClient, type Plan } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";
import { SUBSCRIPTION_TYPE_TO_SLUG } from "../../features/auth/types";
import "../../assets/css/pricing.css";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="pricing-skeleton">
      <div className="skeleton-line medium" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line price" />
      <div className="skeleton-line narrow" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line medium" />
    </div>
  );
}

function PricingNav() {
  return (
    <nav className="pricing-nav">
      <Link to="/" className="pricing-nav-brand">
        <img src="https://d2znch1yzypu23.cloudfront.net/Logo-Primary_light.png" alt="Mixar" />
      </Link>
      <div className="pricing-nav-links">
        <Link to="/auth/login" className="pricing-nav-signin">Sign In</Link>
      </div>
    </nav>
  );
}

type PricingContentProps = {
  standalone?: boolean;
  isAuthenticated: boolean;
  currentPlanId: string | null;
};

function PricingContent({ standalone, isAuthenticated, currentPlanId }: PricingContentProps) {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiClient.getPlans(),
  });

  const plans: Plan[] = data?.data ?? [];

  // Compute the max savings % across paid plans for the toggle badge
  const savePct = plans.reduce((max, p) => {
    const full = p.price_monthly * 12;
    if (full === 0) return max;
    const pct = Math.round(((full - p.price_yearly) / full) * 100);
    return pct > max ? pct : max;
  }, 0);

  const handleBuy = (plan: Plan) => {
    if (!isAuthenticated) {
      navigate("/auth/signup");
      return;
    }
    const billing = yearly ? "yearly" : "monthly";
    navigate(`/app/order?plan=${plan.id}&billing=${billing}`);
  };

  return (
    <div className={`pricing-page${standalone ? " pricing-standalone" : ""}`}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Pricing Plans</h1>
        <p className="dashboard-subtitle">Choose the plan that fits your creative workflow</p>
      </div>

      <div className="pricing-toggle">
        <span className={!yearly ? "active" : ""}>Monthly</span>
        <button
          className={`toggle-switch${yearly ? " active" : ""}`}
          onClick={() => setYearly(!yearly)}
          aria-label="Toggle yearly billing"
        >
          <span className="toggle-knob" />
        </button>
        <span className={yearly ? "active" : ""}>Yearly</span>
        {savePct > 0 && <span className="pricing-save-badge">Save {savePct}%</span>}
      </div>

      <div className="pricing-grid">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          plans.map((plan) => {
            const price = yearly ? plan.price_yearly : plan.price_monthly;
            const period = yearly ? "/yr" : "/mo";
            const fullYearlyPrice = plan.price_monthly * 12;
            const hasDiscount = yearly && fullYearlyPrice > 0 && fullYearlyPrice > plan.price_yearly;
            const isCurrent = isAuthenticated && plan.id === currentPlanId;

            return (
              <div key={plan.id} className={`pricing-card${plan.highlight ? " featured" : ""}${isCurrent ? " current" : ""}`}>
                {isCurrent && <span className="pricing-current-badge">Your Plan</span>}
                <div className="pricing-card-name">{plan.name}</div>
                <div className="pricing-card-tagline">{plan.tagline}</div>

                <div className="pricing-price">
                  {hasDiscount && (
                    <span className="price-original">${fullYearlyPrice}</span>
                  )}
                  <span className="currency">$</span>
                  <span className="amount">{price}</span>
                  <span className="period">{period}</span>
                </div>

                <div className="pricing-credits">
                  {plan.credits_per_month.toLocaleString()} credits / month
                </div>

                <ul className="pricing-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button className="pricing-cta current" disabled>
                    Current Plan
                  </button>
                ) : (
                  <button className="pricing-cta" onClick={() => handleBuy(plan)}>
                    {isAuthenticated ? plan.cta_label : plan.price_monthly === 0 ? "Get Started" : plan.cta_label}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/** Public pricing page — includes its own nav bar */
export function PublicPricingPage() {
  return (
    <>
      <PricingNav />
      <PricingContent standalone isAuthenticated={false} currentPlanId={null} />
    </>
  );
}

/** Authenticated pricing page — rendered inside AppShell */
export function PricingPage() {
  const { user } = useAuth();
  const currentPlanId = user ? (SUBSCRIPTION_TYPE_TO_SLUG[user.subscription_type] ?? "free") : null;

  return <PricingContent isAuthenticated currentPlanId={currentPlanId} />;
}
