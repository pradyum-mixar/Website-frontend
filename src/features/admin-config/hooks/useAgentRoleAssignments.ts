import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, AgentRoleAssignment } from "../types";

const KEY = ["admin", "agent-role-assignments"];

export function useAgentRoleAssignments() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<AgentRoleAssignment[]>>("/admin/agent-role-assignments")).data.data,
  });

  const upsert = useMutation({
    mutationFn: async (payload: { role: string; slot: string; config_id: string }) =>
      (await apiClient.instance.put("/admin/agent-role-assignments", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (payload: { role: string; slot: string }) =>
      (await apiClient.instance.delete("/admin/agent-role-assignments", { data: payload })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const reload = useMutation({
    mutationFn: async () =>
      (await apiClient.instance.post("/admin/agent-reload")).data,
  });

  return { list, upsert, remove, reload };
}
