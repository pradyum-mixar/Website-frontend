import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, GenerationStylePreset } from "../types";

const KEY = ["admin", "generation-style-presets"];

export function useGenerationStylePresets() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<GenerationStylePreset[]>>("/admin/generation-style-presets")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<GenerationStylePreset>) =>
      (await apiClient.instance.post("/admin/generation-style-presets", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: GenerationStylePreset) =>
      (await apiClient.instance.put(`/admin/generation-style-presets/${payload.id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      (await apiClient.instance.delete(`/admin/generation-style-presets/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
