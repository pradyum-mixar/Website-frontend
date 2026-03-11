import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, AgentModelConfig } from "../types";

const KEY = ["admin", "agent-model-configs"];

export function useAgentModelConfigs() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<AgentModelConfig[]>>("/admin/agent-model-configs")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<AgentModelConfig>) =>
      (await apiClient.instance.post("/admin/agent-model-configs", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: AgentModelConfig) =>
      (await apiClient.instance.put(`/admin/agent-model-configs/${payload.id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      (await apiClient.instance.delete(`/admin/agent-model-configs/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
