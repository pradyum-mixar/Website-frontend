import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, GenerationFeatureFlag } from "../types";

const KEY = ["admin", "generation-feature-flags"];

export function useGenerationFeatureFlags() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<GenerationFeatureFlag[]>>("/admin/generation-feature-flags")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<GenerationFeatureFlag>) =>
      (await apiClient.instance.post("/admin/generation-feature-flags", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: GenerationFeatureFlag) =>
      (await apiClient.instance.put(`/admin/generation-feature-flags/${payload.id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      (await apiClient.instance.delete(`/admin/generation-feature-flags/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
