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

type AdminGeneration = {
  id: string;
  user_email: string;
  type: string;
  status: string;
  model_name?: string;
  credits_charged?: number;
  created_at?: string;
};

type AdminGenerationsResponse = {
  generations: AdminGeneration[];
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

  const generations = useQuery({
    queryKey: ["admin-generations"],
    queryFn: async () =>
      (await apiClient.instance.get<AdminGenerationsResponse>("/admin/generations?skip=0&limit=20")).data,
  });

  const grantCredits = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("Pick a user first.");
      await apiClient.instance.post(
        `/credits/add?user_id=${selectedUser}&amount=${creditAmount}&reason=${encodeURIComponent(creditReason)}`,
      );
    },
    onSuccess: async () => {
      setStatusMessage("Credits added.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => setStatusMessage("Failed to add credits."),
  });

  const createReferral = useMutation({
    mutationFn: async () =>
      (await apiClient.instance.post(`/admin/generate_referral?credit_amount=${creditAmount}`)).data as {
        data: { referral_code: string };
      },
    onSuccess: (data) => setStatusMessage(`Referral code: ${data.data.referral_code}`),
    onError: () => setStatusMessage("Failed to create referral code."),
  });

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <section className="card">
        <h3>Credit operations</h3>
        <div className="grid cols-2">
          <div>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Select user</option>
              {(users.data?.users ?? []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.credits} credits)
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              min={1}
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              placeholder="Credit amount"
            />
          </div>
        </div>
        <input value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="Reason" />
        <div className="grid cols-2">
          <button type="button" onClick={() => grantCredits.mutate()}>
            Add credits
          </button>
          <button type="button" className="secondary" onClick={() => createReferral.mutate()}>
            Generate referral
          </button>
        </div>
        {statusMessage && <p className="muted">{statusMessage}</p>}
      </section>

      <section className="card">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {(users.data?.users ?? []).map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name ?? "-"}</td>
                <td>{user.credits}</td>
                <td>{user.is_superuser ? "Admin" : "User"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Recent Activity</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Mode</th>
              <th>Model</th>
              <th>Credits</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {(activity.data?.activity ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.user_email}</td>
                <td>{item.mode}</td>
                <td>{item.model_name ?? "-"}</td>
                <td>{item.credits_used ?? 0}</td>
                <td>{item.created_at ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Generations</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Status</th>
              <th>Model</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {(generations.data?.generations ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.user_email}</td>
                <td>{item.type}</td>
                <td>{item.status}</td>
                <td>{item.model_name ?? "-"}</td>
                <td>{item.credits_charged ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
