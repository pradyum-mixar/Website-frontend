import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
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
    queryKey: ["usage"],
    queryFn: async () => (await apiClient.instance.get<UsageResponse>("/users/user-usage-logs/?skip=0&limit=20")).data,
  });

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
        'ideation': 'Image Generation',
        'texture': 'Texture Painting',
        'ask': 'AI Chat',
        'generate_3d': '3D Model Generation',
        'lookdev': 'Look Development',
        'segment': 'Mesh Segmentation',
        'agent': 'Blender Agent'
    };
    return labels[mode] || mode;
  }

  const getIcon = (mode: string) => {
    switch(mode) {
      case 'ideation':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
      case 'generate_3d':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
      case 'texture':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>;
      default:
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    }
  }

  const usageData = usage.data?.data ?? [];
  const totalGenerations = usageData.length;
  const imagesGenerated = usageData.filter(u => u.mode === 'ideation').length;
  const modelsGenerated = usageData.filter(u => u.mode === 'generate_3d').length;

  return (
    <>
      <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, <span>{user?.name?.split(' ')[0] || user?.email.split('@')[0]}</span>!</h1>
          <p className="dashboard-subtitle">Manage your credits and view your usage history</p>
      </div>

      <div className="stats-grid">
          <div className="stat-card highlight">
              <div className="stat-header">
                  <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                      </svg>
                  </div>
                  <span className="stat-badge">Available</span>
              </div>
              <div className="stat-value">{user?.credits ?? "--"}</div>
              <div className="stat-label">Credits Balance</div>
              <Link to="/app/buy-credits" className="btn-buy-credits">Buy Credits</Link>
          </div>

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
              <div className="stat-value">{totalGenerations}</div>
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
              <div className="stat-value">{imagesGenerated}</div>
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
              <div className="stat-value">{modelsGenerated}</div>
              <div className="stat-label">3D Models Generated</div>
          </div>
      </div>

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
                            <th>Credits Used</th>
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
                                      {event.model_name && <small className="usage-model">{event.model_name}</small>}
                                  </div>
                              </div>
                          </td>
                          <td className="usage-credits">{event.credits_used > 0 ? `-${event.credits_used}` : '0'}</td>
                          <td className="usage-date">{new Date(event.created_at || '').toLocaleDateString()}</td>
                          <td><span className={`usage-status completed`}>Completed</span></td>
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
                    <h3 className="empty-title">No activity yet</h3>
                    <p className="empty-message">Start creating with Mixar to see your usage history here.</p>
                </div>
              )}
          </div>
      </div>
    </>
  );
}
