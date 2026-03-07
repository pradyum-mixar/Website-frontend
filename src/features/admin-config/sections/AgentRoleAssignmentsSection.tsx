import { useState } from "react";
import { useAgentRoleAssignments } from "../hooks/useAgentRoleAssignments";
import { useAgentModelConfigs } from "../hooks/useAgentModelConfigs";

const ROLES = ["planner", "orchestrator", "researcher", "writer", "coder", "reviewer"];
const SLOTS = ["primary", "fallback", "fast", "fast_fallback"];

export function AgentRoleAssignmentsSection() {
  const { list, upsert, remove, reload } = useAgentRoleAssignments();
  const configs = useAgentModelConfigs();
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const assignments = list.data ?? [];
  const configList = configs.list.data ?? [];

  const getAssignment = (role: string, slot: string) =>
    assignments.find((a) => a.role === role && a.slot === slot);

  const handleChange = (role: string, slot: string, configId: string) => {
    if (configId === "") {
      remove.mutate({ role, slot });
    } else {
      upsert.mutate({ role, slot, config_id: configId });
    }
  };

  const handleReload = () => {
    reload.mutate(undefined, {
      onSuccess: () => setStatusMsg({ text: "Agent configs reloaded successfully.", type: "success" }),
      onError: () => setStatusMsg({ text: "Failed to reload agent configs.", type: "error" }),
    });
  };

  const isLoading = list.isLoading || configs.list.isLoading;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Role Assignments</h2>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={handleReload}
          disabled={reload.isPending}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          {reload.isPending ? "Reloading..." : "Reload Agent Configs"}
        </button>
      </div>

      {statusMsg && (
        <div className={`admin-status-msg ${statusMsg.type}`} style={{ marginBottom: "1rem" }}>
          {statusMsg.text}
        </div>
      )}

      <div className="admin-ops-card">
        {isLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="config-role-matrix">
            {/* Header row */}
            <div className="config-role-matrix-row">
              <div />
              {SLOTS.map((slot) => (
                <div key={slot} className="config-role-matrix-header">
                  {slot.replace(/_/g, " ")}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {ROLES.map((role) => (
              <div key={role} className="config-role-matrix-row">
                <div className="config-role-matrix-label">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
                {SLOTS.map((slot) => {
                  const current = getAssignment(role, slot);
                  return (
                    <select
                      key={slot}
                      value={current?.config_id ?? ""}
                      onChange={(e) => handleChange(role, slot, e.target.value)}
                    >
                      <option value="">— none —</option>
                      {configList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.config_name}
                        </option>
                      ))}
                    </select>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
