import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { AdminResponse, AdminPlan } from "../types";

const KEY = ["admin", "subscription-plans"];

export function useSubscriptionPlans() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: async () =>
      (await apiClient.instance.get<AdminResponse<AdminPlan[]>>("/plans/admin/all")).data.data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<AdminPlan>) =>
      (await apiClient.instance.post("/plans/", payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: async (payload: AdminPlan) =>
      (await apiClient.instance.put(`/plans/${payload.slug}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (slug: string) =>
      (await apiClient.instance.delete(`/plans/${slug}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
