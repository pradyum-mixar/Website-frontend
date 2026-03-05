import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, type PaymentHistoryItem } from "../../lib/api-client";

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
    case "succeeded":
      return "completed";
    case "failed":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return "pending";
  }
}

export function BillingHistoryPage() {
  const [page, setPage] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["billing-history", page],
    queryFn: () => apiClient.getPaymentHistory(page * PAGE_SIZE, PAGE_SIZE),
  });

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDownload = async (paymentId: string) => {
    setDownloading(paymentId);
    try {
      await apiClient.downloadInvoice(paymentId);
    } catch {
      // silently fail — user sees no file downloaded
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Billing History</h1>
        <p className="dashboard-subtitle">View your past payments and download invoices</p>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="usage-table-container">
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 className="empty-title">No payments yet</h3>
            <p className="empty-message">Your payment history will appear here once you make a purchase.</p>
          </div>
        </div>
      ) : (
        <>
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
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{describePayment(item)}</td>
                    <td>{formatAmount(item.amount, item.currency)}</td>
                    <td>
                      <span className={`usage-status ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="usage-date">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
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
                      ) : (
                        "--"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="btn-download-invoice"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                Previous
              </button>
              <span className="usage-date">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn-download-invoice"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
