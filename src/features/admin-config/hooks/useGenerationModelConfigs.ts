import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, GenerationModelConfig } from "../types";

const KEY = ["admin", "generation-model-configs"];

export function useGenerationModelConfigs() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<GenerationModelConfig[]>>("/admin/generation-model-configs")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<GenerationModelConfig>) =>
      (await apiClient.instance.post("/admin/generation-model-configs", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: GenerationModelConfig) =>
      (await apiClient.instance.put(`/admin/generation-model-configs/${payload.id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      (await apiClient.instance.delete(`/admin/generation-model-configs/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
