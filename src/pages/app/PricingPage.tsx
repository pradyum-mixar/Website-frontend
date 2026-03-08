import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiClient, type Plan } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";
import { SUBSCRIPTION_TYPE_TO_SLUG, SUBSCRIPTION_TYPE_TO_LABEL } from "../../features/auth/types";
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

function PricingNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <img src="https://d2znch1yzypu23.cloudfront.net/Logo-Primary_light.png" alt="Mixar" />
        </Link>
        <div className="nav-links">
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
          {isAuthenticated && <Link to="/app/downloads">Download</Link>}
          {isAuthenticated && <Link to="/app">Dashboard</Link>}
        </div>
        <div className="nav-buttons">
          <a
            href="https://discord.gg/YVqvkQx8rX"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-nav-secondary"
          >
            Join Discord
          </a>
          {isAuthenticated ? (
            <div className="avatar-dropdown" ref={profileRef}>
              <button className="user-avatar" onClick={() => setProfileOpen((o) => !o)}>
                {initials}
              </button>
              {profileOpen && (
                <div className="avatar-menu">
                  <button className="avatar-menu-item" onClick={async () => { setProfileOpen(false); await logout(); navigate("/"); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth/login" className="btn-nav-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

type PricingContentProps = {
  standalone?: boolean;
  isAuthenticated: boolean;
  currentPlanId: string | null;
  hasActiveSubscription: boolean;
  subscriptionLabel: string;
};

function PricingContent({ standalone, isAuthenticated, currentPlanId, hasActiveSubscription, subscriptionLabel }: PricingContentProps) {
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
                ) : hasActiveSubscription ? (
                  <Link to="/app/manage-subscription?tab=cancel" className="pricing-cta switch">
                    Cancel {subscriptionLabel} to switch
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
  const currentPlanId = hasActiveSubscription ? (SUBSCRIPTION_TYPE_TO_SLUG[subType] ?? null) : null;
  const subscriptionLabel = SUBSCRIPTION_TYPE_TO_LABEL[subType] ?? "";

  return (
    <>
      <PricingNav />
      <PricingContent
        standalone
        isAuthenticated={isAuthenticated}
        currentPlanId={currentPlanId}
        hasActiveSubscription={hasActiveSubscription}
        subscriptionLabel={subscriptionLabel}
      />
    </>
  );
}

/** Authenticated pricing page — rendered inside AppShell */
export function PricingPage() {
  const { user } = useAuth();
  const subType = user?.subscription_type ?? 0;
  const hasActiveSubscription = subType > 0;
  const currentPlanId = hasActiveSubscription ? (SUBSCRIPTION_TYPE_TO_SLUG[subType] ?? null) : null;
  const subscriptionLabel = SUBSCRIPTION_TYPE_TO_LABEL[subType] ?? "";

  return (
    <PricingContent
      isAuthenticated
      currentPlanId={currentPlanId}
      hasActiveSubscription={hasActiveSubscription}
      subscriptionLabel={subscriptionLabel}
    />
  );
}
