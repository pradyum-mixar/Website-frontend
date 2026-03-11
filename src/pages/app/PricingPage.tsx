import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient, type Plan } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";
import { PublicNavbar } from "../../components/PublicNavbar";
import "../../assets/css/landing.css";
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


type PricingContentProps = {
  standalone?: boolean;
  isAuthenticated: boolean;
  currentPlanId: string | null;
  hasActiveSubscription: boolean;
};

function PricingContent({ standalone, isAuthenticated, currentPlanId, hasActiveSubscription }: PricingContentProps) {
  const navigate = useNavigate();
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["plans"],
    queryFn: () => apiClient.getPlans(),
  });

  const plans: Plan[] = data?.data ?? [];

  const handleBuy = (plan: Plan) => {
    if (!isAuthenticated) {
      navigate("/auth/signup");
      return;
    }
    navigate(`/app/order?plan=${plan.id}&billing=monthly`);
  };

  const handleSwitch = async (plan: Plan) => {
    const confirmed = window.confirm(
      `Switch to ${plan.name} ($${plan.price_monthly}/mo)?\n\nThe price difference will be charged immediately (prorated for the remaining days in your current cycle).`
    );
    if (!confirmed) return;

    setSwitchError(null);
    setSwitchingPlan(plan.id);
    try {
      await apiClient.upgradeSubscription(plan.id);
      // Refresh user data to reflect new plan
      window.location.href = "/app/payment-success?status=succeeded";
    } catch {
      setSwitchError("Failed to switch plan. Please try again.");
      setSwitchingPlan(null);
    }
  };

  if (isError) {
    return (
      <div className={`pricing-page${standalone ? " pricing-standalone" : ""}`}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Pricing Plans</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>
          Failed to load plans. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className={`pricing-page${standalone ? " pricing-standalone" : ""}`}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Pricing Plans</h1>
        <p className="dashboard-subtitle">Choose the plan that fits your creative workflow</p>
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
            const isCurrent = isAuthenticated && plan.id === currentPlanId;

            // Find the basic plan's credits to compute usage multiplier
            const basicPlan = plans.find(p => p.price_monthly > 0 && p.price_monthly < 15);
            const basicCredits = basicPlan?.credits_per_month ?? 0;
            const multiplier = basicCredits > 0 && plan.credits_per_month > basicCredits
              ? Math.round(plan.credits_per_month / basicCredits)
              : null;

            return (
              <div key={plan.id} className={`pricing-card${plan.highlight ? " featured" : ""}${isCurrent ? " current" : ""}`}>
                {isCurrent && <span className="pricing-current-badge">Your Plan</span>}
                <div className="pricing-card-name">{plan.name}</div>
                <div className="pricing-card-tagline">{plan.tagline}</div>

                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price_monthly}</span>
                  <span className="period">/mo</span>
                </div>

                <div className="pricing-credits">
                  {multiplier !== null ? (
                    <span className="pricing-multiplier">{multiplier}x more usage than Basic</span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
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
                ) : hasActiveSubscription ? (
                  <button
                    className="pricing-cta"
                    onClick={() => handleSwitch(plan)}
                    disabled={switchingPlan !== null}
                  >
                    {switchingPlan === plan.id ? "Switching\u2026" : `Switch to ${plan.name}`}
                  </button>
                ) : (
                  <button className="pricing-cta" onClick={() => handleBuy(plan)}>
                    {plan.price_monthly === 0
                      ? "Get Started Free"
                      : `Start ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {switchError && (
        <p className="checkout-error" style={{ textAlign: "center", marginBottom: "1rem" }}>{switchError}</p>
      )}

      {/* Trust signal */}
      <p className="pricing-trust">
        Cancel anytime. Credits never expire. Secure checkout via Dodo Payments.
      </p>
    </div>
  );
}

/** Public pricing page — includes its own nav bar */
export function PublicPricingPage() {
  const { user, isAuthenticated } = useAuth();
  const subType = user?.subscription_type ?? 0;
  const hasActiveSubscription = isAuthenticated && subType > 0;
  const currentPlanId = hasActiveSubscription ? (user?.plan_slug ?? null) : null;

  return (
    <>
      <PublicNavbar activePage="pricing" />
      <PricingContent
        standalone
        isAuthenticated={isAuthenticated}
        currentPlanId={currentPlanId}
        hasActiveSubscription={hasActiveSubscription}
      />
    </>
  );
}

/** Authenticated pricing page — rendered inside AppShell */
export function PricingPage() {
  const { user } = useAuth();
  const subType = user?.subscription_type ?? 0;
  const hasActiveSubscription = subType > 0;
  const currentPlanId = hasActiveSubscription ? (user?.plan_slug ?? null) : null;

  return (
    <PricingContent
      isAuthenticated
      currentPlanId={currentPlanId}
      hasActiveSubscription={hasActiveSubscription}
    />
  );
}
