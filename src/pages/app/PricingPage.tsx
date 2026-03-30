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
  trialUtilized?: boolean;
};

function PricingContent({ standalone, isAuthenticated, currentPlanId, hasActiveSubscription, trialUtilized }: PricingContentProps) {
  const trialEligible = !hasActiveSubscription && !trialUtilized;
  const navigate = useNavigate();
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);

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
    window.gtag?.("event", "select_plan", { plan_id: plan.id, plan_name: plan.name, price: plan.price_monthly });
    navigate(`/app/order?plan=${plan.id}&billing=monthly`);
  };

  const handleSwitch = (plan: Plan) => {
    setConfirmPlan(plan);
    setSwitchError(null);
  };

  const handleConfirmSwitch = async () => {
    if (!confirmPlan || switchingPlan) return;
    const currentPlan = plans.find((p) => p.id === currentPlanId);
    const isDowngrade = currentPlan && confirmPlan.price_monthly < currentPlan.price_monthly;

    setSwitchError(null);
    setSwitchingPlan(confirmPlan.id);
    try {
      await apiClient.upgradeSubscription(confirmPlan.id);
      window.gtag?.("event", "plan_switch", {
        from_plan: currentPlanId,
        to_plan: confirmPlan.id,
        direction: isDowngrade ? "downgrade" : "upgrade",
      });
      if (isDowngrade) {
        setSwitchingPlan(null);
        setConfirmPlan(null);
        window.location.reload();
      } else {
        window.location.href = "/app/payment-success?status=succeeded";
      }
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

            return (
              <div key={plan.id} className={`pricing-card${plan.highlight ? " featured" : ""}${isCurrent ? " current" : ""}`}>
                {isCurrent && <span className="pricing-current-badge">Your Plan</span>}
                <div className="pricing-card-name">{plan.name}</div>
                <div className="pricing-card-tagline">{plan.tagline}</div>

                <div className="pricing-price">
                  {plan.id === "pro" && (
                    <span className="price-original">$39.99</span>
                  )}
                  <span className="currency">$</span>
                  <span className="amount">{plan.price_monthly}</span>
                  <span className="period">/mo</span>
                </div>
                {plan.id === "pro" && (
                  <div className="pricing-discount-badge">GDC 2026 Offer</div>
                )}

                {plan.trial_period_days > 0 && trialEligible && (
                  <div className="pricing-trial-badge">
                    Free trial
                  </div>
                )}

                <div className="pricing-credits">&nbsp;</div>

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
                      : plan.trial_period_days > 0
                        ? "Start free trial"
                        : `Start ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {confirmPlan && (() => {
        const currentPlan = plans.find((p) => p.id === currentPlanId);
        const isDowngrade = currentPlan && confirmPlan.price_monthly < currentPlan.price_monthly;
        return (
          <div style={{
            maxWidth: 480,
            margin: "0 auto 1.5rem",
            padding: "1.5rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            textAlign: "center",
          }}>
            <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.5rem" }}>
              {isDowngrade ? `Switch to ${confirmPlan.name}?` : `Upgrade to ${confirmPlan.name}?`}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
              {isDowngrade
                ? "Your current plan stays active until the end of your billing cycle. The new plan takes effect at your next renewal."
                : `The price difference ($${confirmPlan.price_monthly - (currentPlan?.price_monthly ?? 0)}/mo) will be charged immediately, prorated for the remaining days.`}
            </p>
            {switchError && (
              <p className="checkout-error" style={{ marginBottom: "1rem" }}>{switchError}</p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                className="pricing-cta"
                style={{ flex: 1, maxWidth: 180 }}
                onClick={() => { setConfirmPlan(null); setSwitchError(null); }}
                disabled={!!switchingPlan}
              >
                Cancel
              </button>
              <button
                className="pricing-cta"
                style={{
                  flex: 1,
                  maxWidth: 180,
                  background: "linear-gradient(135deg, var(--primary-cyan) 0%, var(--primary-green) 100%)",
                  color: "var(--bg-dark)",
                  borderColor: "transparent",
                }}
                onClick={handleConfirmSwitch}
                disabled={!!switchingPlan}
              >
                {switchingPlan ? "Switching\u2026" : "Confirm"}
              </button>
            </div>
          </div>
        );
      })()}

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
  const isTrial = user?.plan_slug === "trial";
  const subType = user?.subscription_type ?? 0;
  const hasActiveSubscription = isAuthenticated && subType > 0 && !isTrial;
  const currentPlanId = hasActiveSubscription ? (user?.plan_slug ?? null) : null;

  return (
    <>
      <PublicNavbar activePage="pricing" />
      <PricingContent
        standalone
        isAuthenticated={isAuthenticated}
        currentPlanId={currentPlanId}
        hasActiveSubscription={hasActiveSubscription}
        trialUtilized={user?.trial_utilized}
      />
    </>
  );
}

/** Authenticated pricing page — rendered inside AppShell */
export function PricingPage() {
  const { user } = useAuth();
  const isTrial = user?.plan_slug === "trial";
  const subType = user?.subscription_type ?? 0;
  const hasActiveSubscription = subType > 0 && !isTrial;
  const currentPlanId = hasActiveSubscription ? (user?.plan_slug ?? null) : null;

  return (
    <PricingContent
      isAuthenticated
      currentPlanId={currentPlanId}
      hasActiveSubscription={hasActiveSubscription}
      trialUtilized={user?.trial_utilized}
    />
  );
}
