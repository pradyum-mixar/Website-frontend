import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, FeatureCreditCost } from "../types";

const KEY = ["admin", "feature-credit-costs"];

export function useFeatureCreditCosts() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<FeatureCreditCost[]>>("/admin/feature-credit-costs")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<FeatureCreditCost>) =>
      (await apiClient.instance.post("/admin/feature-credit-costs", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: FeatureCreditCost) =>
      (await apiClient.instance.put(`/admin/feature-credit-costs/${payload.feature_key}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update };
}
