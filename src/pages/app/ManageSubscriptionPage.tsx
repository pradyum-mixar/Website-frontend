import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiClient, type PaymentHistoryItem, type SubscriptionStatus } from "../../lib/api-client";
import { useAuth } from "../../features/auth/AuthContext";


const PAGE_SIZE = 20;

function describePayment(item: PaymentHistoryItem): string {
  if (item.payment_type === "one_time") {
    const qty = item.credit_quantity ?? 0;
    return `Credit Purchase (${qty} credits)`;
  }
  const plan = item.plan_id
    ? item.plan_id.charAt(0).toUpperCase() + item.plan_id.slice(1)
    : "Plan";
  return `${plan} Subscription`;
}

function formatAmount(amount: number | null, currency: string | null): string {
  if (amount == null) return "--";
  return `${(amount / 100).toFixed(2)} ${currency?.toUpperCase() ?? "USD"}`;
}

function statusClass(status: string): string {
  switch (status) {
    case "succeeded": return "completed";
    case "failed": return "failed";
    case "refunded": return "refunded";
    default: return "pending";
  }
}

type Tab = "overview" | "billing" | "cancel";

export function ManageSubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "overview";
  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  const { data: subscriptionStatus, isLoading: statusLoading, isError: statusError } = useQuery<SubscriptionStatus>({
    queryKey: ["subscriptionStatus"],
    queryFn: () => apiClient.getSubscriptionStatus(),
    enabled: (user?.subscription_type ?? 0) > 0,
    retry: false,
  });

  const planLabel = subscriptionStatus?.plan_name ?? user?.plan_name ?? "Free";
  const hasSub = (user?.subscription_type ?? 0) > 0;
  const alreadyCancelled = !!user?.subscription_expires_at;

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Manage Subscription</h1>
        <p className="dashboard-subtitle">View your plan, billing history, and manage your subscription</p>
      </div>

      <div className="sub-tabs">
        <button className={`sub-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Overview
        </button>
        <button className={`sub-tab ${activeTab === "billing" ? "active" : ""}`} onClick={() => setTab("billing")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Billing History
        </button>
        {hasSub && !alreadyCancelled && (
          <button className={`sub-tab ${activeTab === "cancel" ? "active" : ""}`} onClick={() => setTab("cancel")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Cancel
          </button>
        )}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          planLabel={planLabel}
          hasSub={hasSub}
          alreadyCancelled={alreadyCancelled}
          subscriptionStatus={subscriptionStatus}
          statusLoading={statusLoading}
          statusError={statusError}
          user={user}
        />
      )}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "cancel" && hasSub && !alreadyCancelled && (
        <CancelTab
          planLabel={planLabel}
          onCancelled={() => {
            refreshUser();
            navigate("/app/manage-subscription?tab=overview");
          }}
        />
      )}
    </>
  );
}

function OverviewTab({ planLabel, hasSub, alreadyCancelled, subscriptionStatus, statusLoading, statusError, user }: {
  planLabel: string;
  hasSub: boolean;
  alreadyCancelled: boolean;
  subscriptionStatus?: SubscriptionStatus;
  statusLoading?: boolean;
  statusError?: boolean;
  user: ReturnType<typeof useAuth>["user"];
}) {
  return (
    <div className="sub-overview">
      <div className="sub-plan-card">
        <div className="sub-plan-header">
          <div>
            <div className="sub-plan-name">{planLabel} Plan</div>
            <div className="sub-plan-status">
              {alreadyCancelled ? (
                <span className="usage-status failed">Cancelling</span>
              ) : hasSub ? (
                <span className="usage-status completed">Active</span>
              ) : (
                <span className="usage-status pending">{planLabel}</span>
              )}
            </div>
          </div>
          <Link to="/app/pricing" className="btn-buy-credits">
            {hasSub ? "Change Plan" : "Upgrade"}
          </Link>
        </div>

        {statusError && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Could not load subscription details. Please refresh.
          </p>
        )}

        {subscriptionStatus && !statusLoading && !statusError && (
          <div className="sub-plan-details">
            <div className="sub-detail-row">
              <span className="sub-detail-label">Billing Cycle</span>
              <span className="sub-detail-value">
                {subscriptionStatus.subscription_expires_at
                  ? `Expires ${new Date(subscriptionStatus.subscription_expires_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`
                  : `${subscriptionStatus.days_left} days left in cycle`}
              </span>
            </div>
            <div className="sub-detail-row">
              <span className="sub-detail-label">Credits Balance</span>
              <span className="sub-detail-value">{user?.credits ?? 0} credits</span>
            </div>
          </div>
        )}

        {!hasSub && (
          <div className="sub-plan-details">
            <div className="sub-detail-row">
              <span className="sub-detail-label">Credits Balance</span>
              <span className="sub-detail-value">{user?.credits ?? 0} credits</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BillingTab() {
  const [page, setPage] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["billing-history", page],
    queryFn: () => apiClient.getPaymentHistory(page + 1, PAGE_SIZE),
  });

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDownload = async (paymentId: string) => {
    setDownloadError(null);
    setDownloading(paymentId);
    try {
      await apiClient.downloadInvoice(paymentId);
    } catch {
      setDownloadError("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  if (isError) {
    return (
      <div className="billing-error" style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
        Failed to load billing history. Please refresh the page.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="usage-table-container">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h3 className="empty-title">No payments yet</h3>
          <p className="empty-message">Your payment history will appear here once you make a purchase.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {downloadError && (
        <p style={{ color: "var(--error-color)", marginBottom: "1rem" }}>{downloadError}</p>
      )}
      <div className="usage-table-container">
        <table className="usage-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: PaymentHistoryItem) => (
              <tr key={item.id}>
                <td>{describePayment(item)}</td>
                <td>{formatAmount(item.amount, item.currency)}</td>
                <td>
                  <span className={`usage-status ${statusClass(item.status)}`}>{item.status}</span>
                </td>
                <td className="usage-date">
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </td>
                <td>
                  {item.has_invoice ? (
                    <button
                      className="btn-download-invoice"
                      onClick={() => handleDownload(item.dodo_payment_id)}
                      disabled={downloading === item.dodo_payment_id}
                    >
                      {downloading === item.dodo_payment_id ? (
                        <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                  ) : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button className="btn-download-invoice" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
            Previous
          </button>
          <span className="usage-date">Page {page + 1} of {totalPages}</span>
          <button className="btn-download-invoice" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
            Next
          </button>
        </div>
      )}
    </>
  );
}

function CancelTab({ planLabel, onCancelled }: { planLabel: string; onCancelled: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await apiClient.cancelSubscription();
      onCancelled();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="sub-overview">
      <div className="sub-plan-card">
        <h2 style={{ marginBottom: "0.5rem" }}>{planLabel} Plan</h2>
        <p className="order-tagline" style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
          Here's what will happen if you cancel:
        </p>

        <div className="sub-plan-details">
          <div className="sub-detail-row">
            <span className="sub-detail-label">Access</span>
            <span className="sub-detail-value">Retained until billing period ends</span>
          </div>
          <div className="sub-detail-row">
            <span className="sub-detail-label">After expiry</span>
            <span className="sub-detail-value">Reverts to Free plan</span>
          </div>
          <div className="sub-detail-row">
            <span className="sub-detail-label">Credits</span>
            <span className="sub-detail-value">Remaining credits are kept</span>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {error && <p className="checkout-error" style={{ width: "100%" }}>{error}</p>}
          <button className="btn-cancel" disabled={loading} onClick={handleCancel}>
            {loading ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}
