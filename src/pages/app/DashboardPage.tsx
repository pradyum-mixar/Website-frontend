import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient, type SubscriptionStatus } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";

type UsageEvent = {
  id: string;
  mode: string;
  credits_used: number;
  model_name?: string;
  created_at?: string;
  status?: string;
};

type UsageResponse = {
  status: string;
  data: UsageEvent[];
};

export function DashboardPage() {
  const { user } = useAuth();

  const usage = useQuery({
    queryKey: ["usage", user?.id],
    queryFn: async () =>
      (
        await apiClient.instance.get<UsageResponse>(
          "/users/user-usage-logs/?skip=0&limit=20"
        )
      ).data,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const subscriptionStatus = useQuery<SubscriptionStatus>({
    queryKey: ["subscriptionStatus", user?.id],
    queryFn: () => apiClient.getSubscriptionStatus(),
    enabled: (user?.subscription_type ?? 0) > 0,
    retry: false,
    refetchInterval: 60_000,
  });

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      ideation: "Image Generation",
      texture: "Texture Painting",
      ask: "AI Chat",
      generate_3d: "3D Model Generation",
      lookdev: "Look Development",
      segment: "Mesh Segmentation",
      agent: "Blender Agent",
    };
    return labels[mode] || mode;
  };

  const usageData = usage.data?.data ?? [];
  const totalGenerations = usageData.length;

  const creditsRemaining = user?.credits ?? 0;
  const creditsPerMonth = subscriptionStatus.data?.credits_per_month ?? 0;
  const hasSubscription = (user?.subscription_type ?? 0) > 0;

  // Credit usage percentage (how much remains of plan allocation)
  let remainingPct = 100;
  if (hasSubscription && creditsPerMonth > 0) {
    remainingPct = Math.min(
      100,
      Math.max(0, (creditsRemaining / creditsPerMonth) * 100)
    );
  }

  // Generation breakdown by mode
  const modeBreakdown = usageData.reduce(
    (acc, u) => {
      acc[u.mode] = (acc[u.mode] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedModes = Object.entries(modeBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome,{" "}
          <span>
            {user?.name?.split(" ")[0] || user?.email.split("@")[0]}
          </span>
          !
        </h1>
        <p className="dashboard-subtitle">
          Manage your usage and activity
        </p>
        {subscriptionStatus.data && (
          <div className="billing-cycle-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {subscriptionStatus.data.subscription_expires_at
              ? `${subscriptionStatus.data.plan_name} · Expires in ${subscriptionStatus.data.days_left} days`
              : `${subscriptionStatus.data.plan_name} · ${subscriptionStatus.data.days_left} days left in cycle`}
          </div>
        )}
      </div>

      {/* Upgrade Banner — only for free users (loss aversion + value framing) */}
      {!hasSubscription && (
        <div className="upgrade-banner">
          <div className="upgrade-banner-content">
            <div className="upgrade-banner-text">
              <h3 className="upgrade-banner-title">Unlock the full power of Mixar</h3>
              <p className="upgrade-banner-desc">
                Get monthly usage for AI image generation, 3D modeling, texture painting, and the Blender agent.
                Teams using Mixar ship 3D assets 10x faster.
              </p>
              <div className="upgrade-banner-features">
                <span>Image Generation</span>
                <span>3D Model Creation</span>
                <span>Texture Painting</span>
                <span>AI Blender Agent</span>
              </div>
            </div>
            <Link to="/app/pricing" className="upgrade-banner-cta">
              View Plans
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Usage Bars - Claude Code style */}
      <div className="usage-section">
        {/* Usage Bar */}
        <div className="usage-bar-card">
          <div className="usage-bar-header">
            <span className="usage-bar-label">Usage</span>
            <span className="usage-bar-value">
              {hasSubscription
                ? `${Math.round(100 - remainingPct)}% used`
                : creditsRemaining > 0 ? "Available" : "No usage"}
            </span>
          </div>
          <div className="usage-bar-track">
            <div
              className={`usage-bar-fill${remainingPct < 20 ? " critical" : remainingPct < 50 ? " warning" : ""}`}
              style={{
                width: `${hasSubscription ? remainingPct : (creditsRemaining > 0 ? 100 : 0)}%`,
              }}
            />
          </div>
          <div className="usage-bar-footer">
            {hasSubscription ? (
              <span>{Math.round(remainingPct)}% remaining this cycle</span>
            ) : creditsRemaining === 0 ? (
              <span className="usage-bar-nudge">Subscribe to get monthly usage</span>
            ) : (
              <span>&nbsp;</span>
            )}
            <div className="usage-bar-actions">
              {!hasSubscription && (
                <Link to="/app/pricing" className="usage-bar-link">
                  Subscribe
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Generation Breakdown Bars */}
        {sortedModes.map(([mode, count]) => {
          const pct =
            totalGenerations > 0
              ? Math.round((count / totalGenerations) * 100)
              : 0;
          return (
            <div className="usage-bar-card compact" key={mode}>
              <div className="usage-bar-header">
                <span className="usage-bar-label">{getModeLabel(mode)}</span>
                <span className="usage-bar-value">
                  {count} generation{count !== 1 ? "s" : ""} · {pct}%
                </span>
              </div>
              <div className="usage-bar-track">
                <div className="usage-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        {sortedModes.length === 0 && (
          <div className="usage-bar-card compact">
            <div className="usage-bar-header">
              <span className="usage-bar-label">Generations</span>
              <span className="usage-bar-value">No activity yet</span>
            </div>
            <div className="usage-bar-track">
              <div className="usage-bar-fill" style={{ width: "0%" }} />
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>

        <div className="usage-table-container">
          {usageData.length > 0 ? (
            <table className="usage-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usageData.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="usage-type">
                        <div className="usage-type-info">
                          <span>{getModeLabel(event.mode)}</span>
                          {event.model_name && (
                            <small className="usage-model">
                              {event.model_name}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="usage-date">
                      {new Date(
                        event.created_at || ""
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="usage-status completed">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="empty-title">No activity yet</h3>
              <p className="empty-message">
                {hasSubscription
                  ? "Start creating with Mixar to see your usage history here."
                  : "Subscribe to a plan and start creating with Mixar."}
              </p>
              {!hasSubscription && (
                <Link to="/app/pricing" className="empty-state-cta">
                  View Plans
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
