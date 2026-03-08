import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { SeedAgentConfigsPayload, IngestDocsPayload, CleanupCheckpointsPayload } from "../types";

export function useAdminScripts() {
  const seedAgentConfigs = useMutation({
    mutationFn: async (payload: SeedAgentConfigsPayload) =>
      (await apiClient.instance.post("/admin/scripts/seed-agent-configs", payload)).data,
  });

  const ingestDocs = useMutation({
    mutationFn: async (payload: IngestDocsPayload) =>
      (await apiClient.instance.post("/admin/scripts/ingest-docs", payload)).data,
  });

  const cleanupCheckpoints = useMutation({
    mutationFn: async (payload: CleanupCheckpointsPayload) =>
      (await apiClient.instance.post("/admin/scripts/cleanup-checkpoints", payload)).data,
  });

  return { seedAgentConfigs, ingestDocs, cleanupCheckpoints };
}
