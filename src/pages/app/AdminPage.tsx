import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "../../assets/css/admin.css";

type AdminUser = {
  id: string;
  user_no?: number;
  email: string;
  name?: string;
  credits: number;
  is_superuser: boolean;
};

type AdminUsersResponse = {
  users: AdminUser[];
  total_users: number;
};

type AdminActivityItem = {
  id: string;
  user_email: string;
  mode: string;
  model_name?: string;
  credits_used?: number;
  created_at?: string;
};

type AdminActivityResponse = {
  activity: AdminActivityItem[];
};

export function AdminPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState("");
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditReason, setCreditReason] = useState("admin_grant");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await apiClient.instance.get<AdminUsersResponse>("/admin/users?skip=0&limit=50")).data,
  });

  const activity = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => (await apiClient.instance.get<AdminActivityResponse>("/admin/activity?skip=0&limit=20")).data,
  });

  const grantCredits = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("Pick a user first.");
      await apiClient.instance.post(
        `/credits/add?user_id=${selectedUser}&amount=${creditAmount}&reason=${encodeURIComponent(creditReason)}`,
      );
    },
    onSuccess: async () => {
      setStatusMessage({ text: "Credits added successfully.", type: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => setStatusMessage({ text: "Failed to add credits.", type: "error" }),
  });

  const createReferral = useMutation({
    mutationFn: async () =>
      (await apiClient.instance.post(`/admin/generate_referral?credit_amount=${creditAmount}`)).data as {
        data: { referral_code: string };
      },
    onSuccess: (data) => setStatusMessage({ text: `Referral code: ${data.data.referral_code}`, type: "success" }),
    onError: () => setStatusMessage({ text: "Failed to create referral code.", type: "error" }),
  });

  const userList = users.data?.users ?? [];
  const activityList = activity.data?.activity ?? [];

  return (
    <>
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage users, credits, and view system activity</p>
          </div>
          <Link to="/app/admin/config" className="admin-btn admin-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            System Configuration
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="admin-stat-value">{users.data?.total_users ?? "—"}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="admin-stat-value">{activityList.length}</div>
          <div className="admin-stat-label">Recent Events</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="admin-stat-value">{userList.filter(u => u.is_superuser).length}</div>
          <div className="admin-stat-label">Admins</div>
        </div>
      </div>

      {/* Credit Operations */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Credit Operations</h2>
        </div>
        <div className="admin-ops-card">
          <div className="admin-ops-row">
            <div className="admin-ops-field" style={{ flex: 2 }}>
              <label className="admin-ops-label">User</label>
              <select className="admin-ops-input" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Select a user...</option>
                {userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.credits} credits)
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-ops-field">
              <label className="admin-ops-label">Amount</label>
              <input
                type="number"
                min={1}
                className="admin-ops-input"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
              />
            </div>
            <div className="admin-ops-field" style={{ flex: 2 }}>
              <label className="admin-ops-label">Reason</label>
              <input
                className="admin-ops-input"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g. admin_grant"
              />
            </div>
          </div>
          <div className="admin-ops-actions">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => grantCredits.mutate()}
              disabled={grantCredits.isPending}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
              </svg>
              {grantCredits.isPending ? "Adding..." : "Add Credits"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => createReferral.mutate()}
              disabled={createReferral.isPending}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {createReferral.isPending ? "Generating..." : "Generate Referral"}
            </button>
          </div>

          {statusMessage && (
            <div className={`admin-status-msg ${statusMessage.type}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {statusMessage.type === "success" ? (
                  <><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>
                ) : (
                  <><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></>
                )}
              </svg>
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Users</h2>
          <span className="section-count">{users.data?.total_users ?? 0} total</span>
        </div>
        <div className="usage-table-container">
          {users.isLoading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <table className="usage-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Credits</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar-small">
                          {user.name
                            ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                            : user.email.split("@")[0].substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.name || "—"}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-credit-badge">{user.credits}</span>
                    </td>
                    <td>
                      {user.is_superuser
                        ? <span className="admin-badge">Admin</span>
                        : <span className="status-badge active">User</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* System Activity */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>
        <div className="usage-table-container">
          {activity.isLoading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : activityList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="empty-title">No activity yet</h3>
              <p className="empty-message">System activity will appear here.</p>
            </div>
          ) : (
            <table className="usage-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Activity</th>
                  <th>Credits</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activityList.map((item) => (
                  <tr key={item.id}>
                    <td className="admin-activity-email">{item.user_email}</td>
                    <td>
                      <div className="usage-type-info">
                        <span>{item.mode.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                        {item.model_name && <small className="usage-model">{item.model_name}</small>}
                      </div>
                    </td>
                    <td className="usage-credits">{item.credits_used ? `-${item.credits_used}` : "0"}</td>
                    <td className="usage-date">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
