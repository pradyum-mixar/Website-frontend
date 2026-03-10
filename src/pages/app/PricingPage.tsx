import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
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
                  ${(plan.credits_per_month / 100).toFixed(0)} usage / month
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
                  <Link to="/app/manage-subscription?tab=upgrade" className="pricing-cta switch">
                    Switch to {plan.name}
                  </Link>
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
