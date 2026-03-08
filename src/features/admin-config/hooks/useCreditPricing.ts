import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, AdminCreditPricing } from "../types";

const KEY = ["admin", "credit-pricing"];

export function useCreditPricing() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<AdminCreditPricing[]>>("/plans/admin/credit-pricing")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<AdminCreditPricing>) =>
      (await apiClient.instance.post("/plans/credit-pricing", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: AdminCreditPricing) =>
      (await apiClient.instance.put(`/plans/credit-pricing/${payload.slug}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (slug: string) =>
      (await apiClient.instance.delete(`/plans/credit-pricing/${slug}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
