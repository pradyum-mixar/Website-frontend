import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient, type SubscriptionStatus } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";

type UsageLog = {
  id: string;
  mode: string;
  reason: string;
  endpoint: string;
  credits: number;
  status: string;
  error?: string | null;
  created_at: string;
  model_name?: string;
};
type UsageLogsResponse = {
  status: string;
  data: UsageLog[];
  pagination: { total: number; page: number; page_size: number };
};
type UsageStats = {
  total_generations: number;
  total_credits_spent: number;
  images_generated: number;
  models_generated: number;
};
type UsageStatsResponse = { status: string; data: UsageStats };

const IMAGE_MODES = new Set(["image_generation", "generative_brush", "depth_to_image", "ideation"]);
const THREE_D_MODES = new Set([
  "model_3d_generation", "hunyuan_3d_pro", "hunyuan_3d_rapid",
  "hunyuan_3d_part", "hunyuan_3d_topology", "hunyuan_3d_texture_edit",
  "hunyuan_3d_uv", "generate_3d",
]);
const MATERIAL_MODES = new Set(["texture", "lookdev", "material_generation", "mat_gen", "mat_gen_prompt", "mat_gen_image"]);
const SCENE_MODES = new Set(["scene_layout", "scene_generation"]);
const SEGMENT_MODES = new Set(["segment", "mesh_segmentation"]);
const CHAT_MODES = new Set(["ask", "agent", "blender_agent", "chat"]);
const SEARCH_MODES = new Set(["search", "asset_search", "web_search"]);

const MODE_LABELS: Record<string, string> = {
  ideation: "Image Generation",
  image_generation: "Image Generation",
  generative_brush: "Generative Brush",
  depth_to_image: "Depth to Image",
  texture: "Texture Painting",
  lookdev: "Look Development",
  material_generation: "Material Generation",
  mat_gen: "Material Generation",
  mat_gen_prompt: "Material Gen (Prompt)",
  mat_gen_image: "Material Gen (Image)",
  generate_3d: "3D Model Generation",
  model_3d_generation: "3D Model Generation",
  hunyuan_3d_pro: "Hunyuan 3D Pro",
  hunyuan_3d_rapid: "Hunyuan 3D Rapid",
  hunyuan_3d_part: "Hunyuan 3D Part",
  hunyuan_3d_topology: "Hunyuan 3D Topology",
  hunyuan_3d_texture_edit: "Hunyuan 3D Texture Edit",
  hunyuan_3d_uv: "Hunyuan 3D UV",
  ask: "AI Chat",
  agent: "Blender Agent",
  blender_agent: "Blender Agent",
  chat: "Chat",
  segment: "Mesh Segmentation",
  mesh_segmentation: "Mesh Segmentation",
  scene_layout: "Scene Layout",
  scene_generation: "Scene Generation",
  search: "Asset Search",
  asset_search: "Asset Search",
  web_search: "Web Search",
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Features" },
  { value: "ideation", label: "Image Generation" },
  { value: "generative_brush", label: "Generative Brush" },
  { value: "depth_to_image", label: "Depth to Image" },
  { value: "generate_3d", label: "3D Model Generation" },
  { value: "hunyuan_3d_pro", label: "Hunyuan 3D Pro" },
  { value: "hunyuan_3d_rapid", label: "Hunyuan 3D Rapid" },
  { value: "hunyuan_3d_part", label: "Hunyuan 3D Part" },
  { value: "hunyuan_3d_topology", label: "Hunyuan 3D Topology" },
  { value: "hunyuan_3d_texture_edit", label: "Hunyuan 3D Texture Edit" },
  { value: "hunyuan_3d_uv", label: "Hunyuan 3D UV" },
  { value: "texture", label: "Texture Painting" },
  { value: "lookdev", label: "Look Development" },
  { value: "mat_gen", label: "Material Generation" },
  { value: "mat_gen_prompt", label: "Material Gen (Prompt)" },
  { value: "mat_gen_image", label: "Material Gen (Image)" },
  { value: "ask", label: "AI Chat" },
  { value: "agent", label: "Blender Agent" },
  { value: "segment", label: "Mesh Segmentation" },
  { value: "scene_layout", label: "Scene Layout" },
  { value: "scene_generation", label: "Scene Generation" },
  { value: "search", label: "Asset Search" },
  { value: "web_search", label: "Web Search" },
];

const PAGE_SIZE = 10;

export function DashboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [modeFilter, setModeFilter] = useState("");

  const usage = useQuery({
    queryKey: ["usage", page, modeFilter, user?.id],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      if (modeFilter) params.set("mode", modeFilter);
      return (await apiClient.instance.get<UsageLogsResponse>(`/users/user-usage-logs/?${params}`)).data;
    },
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const stats = useQuery({
    queryKey: ["usageStats", user?.id],
    queryFn: async () => (await apiClient.instance.get<UsageStatsResponse>("/users/usage-stats")).data,
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

  const getModeLabel = (mode: string) =>
    MODE_LABELS[mode] || mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const getIcon = (mode: string) => {
    if (IMAGE_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
    }
    if (THREE_D_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
    }
    if (MATERIAL_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>;
    }
    if (SEGMENT_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v6M9 6h6M18 9v6M9 18h6"/></svg>;
    }
    if (CHAT_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    }
    if (SEARCH_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
    }
    if (SCENE_MODES.has(mode)) {
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    }
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
  };

  const usageData = usage.data?.data ?? [];
  const total = usage.data?.pagination.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasSubscription = (user?.subscription_type ?? 0) > 0;
  const creditsPerMonth = subscriptionStatus.data?.credits_per_month ?? 0;
  const creditsRemaining = user?.credits ?? 0;

  // Credit usage percentage (how much remains of plan allocation)
  let remainingPct = 100;
  if (hasSubscription && creditsPerMonth > 0) {
    remainingPct = Math.min(
      100,
      Math.max(0, (creditsRemaining / creditsPerMonth) * 100)
    );
  }

  const handleFilterChange = (value: string) => {
    setModeFilter(value);
    setPage(1);
  };

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
        {user?.plan_slug === "trial" && user.trial_days_remaining != null ? (
          <div className="billing-cycle-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {user.plan_name}
          </div>
        ) : subscriptionStatus.data ? (
          <div className="billing-cycle-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {subscriptionStatus.data.subscription_expires_at
              ? `${subscriptionStatus.data.plan_name} · Expires in ${subscriptionStatus.data.days_left} days`
              : `${subscriptionStatus.data.plan_name} · ${subscriptionStatus.data.days_left} days left in cycle`}
          </div>
        ) : null}
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
      </div>

      <div className="stats-grid">
          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5"/>
                          <path d="M2 12l10 5 10-5"/>
                      </svg>
                  </div>
              </div>
              <div className="stat-value">{stats.data?.data.total_generations ?? 0}</div>
              <div className="stat-label">Total Generations</div>
          </div>

          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                      </svg>
                  </div>
              </div>
              <div className="stat-value">{stats.data?.data.images_generated ?? 0}</div>
              <div className="stat-label">Images Generated</div>
          </div>

          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                  </div>
              </div>
              <div className="stat-value">{stats.data?.data.models_generated ?? 0}</div>
              <div className="stat-label">3D Models Generated</div>
          </div>
      </div>

      <div className="section">
          <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-filter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <select
                  className="activity-filter-select"
                  value={modeFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="usage-table-container">
              {usage.isLoading ? (
                <div className="loading"><div className="spinner" /></div>
              ) : usageData.length > 0 ? (
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
                                  <div className="usage-type-icon">
                                      {getIcon(event.mode)}
                                  </div>
                                  <div className="usage-type-info">
                                      <span>{getModeLabel(event.mode)}</span>
                                      {event.reason !== event.mode && <small className="usage-model">{event.reason}</small>}
                                  </div>
                              </div>
                          </td>
                          <td className="usage-date">{new Date(event.created_at).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td><span className={`usage-status ${event.status === "success" ? "completed" : "failed"}`}>{event.status === "success" ? "Completed" : "Failed"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              ) : (
                <div className="empty-state">
                    <div className="empty-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <h3 className="empty-title">{modeFilter ? "No matching activity" : "No activity yet"}</h3>
                    <p className="empty-message">
                      {modeFilter
                        ? "Try selecting a different feature filter."
                        : hasSubscription
                          ? "Start creating with Mixar to see your usage history here."
                          : "Subscribe to a plan and start creating with Mixar."}
                    </p>
                    {!hasSubscription && !modeFilter && (
                      <Link to="/app/pricing" className="empty-state-cta">
                        View Plans
                      </Link>
                    )}
                </div>
              )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="btn-download-invoice"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span className="usage-date">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn-download-invoice"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
      </div>
    </>
  );
}
