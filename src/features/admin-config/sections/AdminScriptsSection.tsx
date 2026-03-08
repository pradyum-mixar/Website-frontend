import { useState } from "react";
import { useAdminScripts } from "../hooks/useAdminScripts";

export function AdminScriptsSection() {
  const { seedAgentConfigs, ingestDocs, cleanupCheckpoints } = useAdminScripts();

  // Seed Agent Configs
  const [seedForce, setSeedForce] = useState(false);
  const [seedResult, setSeedResult] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Ingest Docs
  const [docsDir, setDocsDir] = useState("");
  const [ingestResult, setIngestResult] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cleanup Checkpoints
  const [retentionDays, setRetentionDays] = useState(30);
  const [batchSize, setBatchSize] = useState(100);
  const [vacuum, setVacuum] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [cleanupResult, setCleanupResult] = useState<{ text: string; type: "success" | "error" } | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Seed Agent Configs */}
      <div className="admin-ops-card">
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>Seed Agent Configs</h3>
        <div className="admin-ops-row">
          <div className="admin-ops-field">
            <label className="admin-ops-label">Force Overwrite</label>
            <label className="config-toggle" style={{ marginTop: "0.25rem" }}>
              <input type="checkbox" checked={seedForce} onChange={(e) => setSeedForce(e.target.checked)} />
              <span className="config-toggle-slider" />
            </label>
          </div>
        </div>
        <div className="admin-ops-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() =>
              seedAgentConfigs.mutate(
                { force: seedForce },
                {
                  onSuccess: (data) => setSeedResult({ text: JSON.stringify(data, null, 2), type: "success" }),
                  onError: (err) => setSeedResult({ text: String(err), type: "error" }),
                },
              )
            }
            disabled={seedAgentConfigs.isPending}
          >
            {seedAgentConfigs.isPending ? "Running..." : "Run Seed"}
          </button>
        </div>
        {seedResult && (
          <div className={`admin-status-msg ${seedResult.type}`}>
            <span className="config-script-result">{seedResult.text}</span>
          </div>
        )}
      </div>

      {/* Ingest Docs */}
      <div className="admin-ops-card">
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>Ingest Docs</h3>
        <div className="admin-ops-row">
          <div className="admin-ops-field" style={{ flex: 3 }}>
            <label className="admin-ops-label">Docs Directory</label>
            <input
              className="admin-ops-input"
              value={docsDir}
              onChange={(e) => setDocsDir(e.target.value)}
              placeholder="/path/to/docs"
            />
          </div>
        </div>
        <div className="admin-ops-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() =>
              ingestDocs.mutate(
                { docs_directory: docsDir },
                {
                  onSuccess: (data) => setIngestResult({ text: JSON.stringify(data, null, 2), type: "success" }),
                  onError: (err) => setIngestResult({ text: String(err), type: "error" }),
                },
              )
            }
            disabled={ingestDocs.isPending || !docsDir.trim()}
          >
            {ingestDocs.isPending ? "Running..." : "Run Ingest"}
          </button>
        </div>
        {ingestResult && (
          <div className={`admin-status-msg ${ingestResult.type}`}>
            <span className="config-script-result">{ingestResult.text}</span>
          </div>
        )}
      </div>

      {/* Cleanup Checkpoints */}
      <div className="admin-ops-card">
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>Cleanup Checkpoints</h3>
        <div className="admin-ops-row">
          <div className="admin-ops-field">
            <label className="admin-ops-label">Retention Days</label>
            <input
              type="number"
              className="admin-ops-input"
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              min={1}
            />
          </div>
          <div className="admin-ops-field">
            <label className="admin-ops-label">Batch Size</label>
            <input
              type="number"
              className="admin-ops-input"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              min={1}
            />
          </div>
          <div className="admin-ops-field">
            <label className="admin-ops-label">Vacuum</label>
            <label className="config-toggle" style={{ marginTop: "0.25rem" }}>
              <input type="checkbox" checked={vacuum} onChange={(e) => setVacuum(e.target.checked)} />
              <span className="config-toggle-slider" />
            </label>
          </div>
          <div className="admin-ops-field">
            <label className="admin-ops-label">Dry Run</label>
            <label className="config-toggle" style={{ marginTop: "0.25rem" }}>
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
              <span className="config-toggle-slider" />
            </label>
          </div>
        </div>
        <div className="admin-ops-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() =>
              cleanupCheckpoints.mutate(
                { retention_days: retentionDays, batch_size: batchSize, vacuum, dry_run: dryRun },
                {
                  onSuccess: (data) => setCleanupResult({ text: JSON.stringify(data, null, 2), type: "success" }),
                  onError: (err) => setCleanupResult({ text: String(err), type: "error" }),
                },
              )
            }
            disabled={cleanupCheckpoints.isPending}
          >
            {cleanupCheckpoints.isPending ? "Running..." : "Run Cleanup"}
          </button>
        </div>
        {cleanupResult && (
          <div className={`admin-status-msg ${cleanupResult.type}`}>
            <span className="config-script-result">{cleanupResult.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
