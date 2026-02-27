import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

type DashboardResponse = {
  status: string;
  message: string;
  data: { name: string; credits: number };
};

type UserCreditsResponse = {
  status: string;
  data: { remaining_credits: number };
};

type UsageEvent = {
  id: string;
  mode: string;
  credits_used: number;
  model_name?: string;
  created_at?: string;
};

type UsageResponse = {
  status: string;
  data: UsageEvent[];
};

export function DashboardPage() {
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await apiClient.instance.get<DashboardResponse>("/users/dashboard")).data,
  });
  const credits = useQuery({
    queryKey: ["credits"],
    queryFn: async () => (await apiClient.instance.get<UserCreditsResponse>("/credits/user-credits/")).data,
  });
  const usage = useQuery({
    queryKey: ["usage"],
    queryFn: async () => (await apiClient.instance.get<UsageResponse>("/users/user-usage-logs/?skip=0&limit=20")).data,
  });

  return (
    <div>
      <h1>User Dashboard</h1>
      <div className="grid cols-2">
        <section className="card">
          <h3>Profile snapshot</h3>
          <p className="muted">Name: {dashboard.data?.data.name ?? "-"}</p>
          <p className="muted">Credits: {dashboard.data?.data.credits ?? "-"}</p>
        </section>
        <section className="card">
          <h3>Live remaining credits</h3>
          <p className="muted">{credits.data?.data.remaining_credits ?? "-"}</p>
        </section>
      </div>

      <section className="card">
        <h3>Recent usage logs</h3>
        {usage.isLoading && <p className="muted">Loading usage...</p>}
        <table>
          <thead>
            <tr>
              <th>Mode</th>
              <th>Model</th>
              <th>Credits</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {(usage.data?.data ?? []).map((event) => (
              <tr key={event.id}>
                <td>{event.mode}</td>
                <td>{event.model_name ?? "-"}</td>
                <td>{event.credits_used ?? 0}</td>
                <td>{event.created_at ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
