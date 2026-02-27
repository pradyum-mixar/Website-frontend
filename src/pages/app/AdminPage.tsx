import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "../../lib/api-client";

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
  const [statusMessage, setStatusMessage] = useState("");

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
      setStatusMessage("Credits added successfully.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => setStatusMessage("Failed to add credits."),
  });

  const createReferral = useMutation({
    mutationFn: async () =>
      (await apiClient.instance.post(`/admin/generate_referral?credit_amount=${creditAmount}`)).data as {
        data: { referral_code: string };
      },
    onSuccess: (data) => setStatusMessage(`Referral code generated: ${data.data.referral_code}`),
    onError: () => setStatusMessage("Failed to create referral code."),
  });

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage users, credits, and view system activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card referral-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-header">
            <h3 style={{ margin: 0 }}>Credit Operations</h3>
          </div>
          <div className="referral-form" style={{ marginTop: '1.5rem' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">User</label>
              <select className="form-input" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Select a user...</option>
                {(users.data?.users ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.credits} credits)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Amount</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="referral-form" style={{ marginTop: '1rem' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Reason</label>
              <input 
                className="form-input" 
                value={creditReason} 
                onChange={(e) => setCreditReason(e.target.value)} 
                placeholder="e.g. admin_grant" 
              />
            </div>
            <div className="form-group" style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => grantCredits.mutate()}>Add Credits</button>
              <button type="button" className="btn btn-secondary" onClick={() => createReferral.mutate()}>New Code</button>
            </div>
          </div>
          
          {statusMessage && (
            <div className="referral-result">
              <div className="referral-code-display">
                <span className="referral-label">Result:</span>
                <span className="referral-code">{statusMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
            <h2 className="section-title">Users List</h2>
        </div>
        <div className="usage-table-container">
          <table className="usage-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Credits</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {(users.data?.users ?? []).map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar-small">
                        {user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : user.email.split("@")[0].substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{user.name || "Unknown"}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="user-credits">{user.credits}</td>
                  <td>
                    {user.is_superuser ? <span className="admin-badge">Admin</span> : <span className="status-badge active">User</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
            <h2 className="section-title">System Activity</h2>
        </div>
        <div className="usage-table-container">
          <table className="usage-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Activity</th>
                <th>Cost</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(activity.data?.activity ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.user_email}</td>
                  <td>
                    <div className="usage-type-info">
                      <span>{item.mode}</span>
                      {item.model_name && <small className="usage-model">{item.model_name}</small>}
                    </div>
                  </td>
                  <td className="usage-credits">{item.credits_used ? `-${item.credits_used}` : '0'}</td>
                  <td className="usage-date">{new Date(item.created_at || '').toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
