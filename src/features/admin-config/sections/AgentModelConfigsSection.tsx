import { useState } from "react";
import { useAgentModelConfigs } from "../hooks/useAgentModelConfigs";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, AgentModelConfig } from "../types";

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "provider", label: "Provider", type: "select", required: true, options: [
    { value: "anthropic", label: "Anthropic" },
    { value: "vertex", label: "Vertex" },
    { value: "bedrock", label: "Bedrock" },
    { value: "openai", label: "OpenAI" },
    { value: "gemini", label: "Gemini" },
  ]},
  { name: "model", label: "Model", type: "text", required: true },
  { name: "temperature", label: "Temperature", type: "number" },
  { name: "max_tokens", label: "Max Tokens", type: "number" },
  { name: "thinking", label: "Thinking", type: "select", options: [
    { value: "disabled", label: "Disabled" },
    { value: "enabled", label: "Enabled" },
    { value: "adaptive", label: "Adaptive" },
  ]},
  { name: "thinking_budget", label: "Thinking Budget", type: "number" },
  { name: "thinking_level", label: "Thinking Level", type: "select", options: [
    { value: "", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "max", label: "Max" },
  ]},
  { name: "streaming", label: "Streaming", type: "boolean" },
  { name: "timeout", label: "Timeout (ms)", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "enabled", label: "Enabled", type: "boolean" },
];

export function AgentModelConfigsSection() {
  const { list, create, update, remove } = useAgentModelConfigs();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: AgentModelConfig } | null>(null);
  const [deleting, setDeleting] = useState<AgentModelConfig | null>(null);

  const columns: Column<AgentModelConfig>[] = [
    { key: "name", label: "Name" },
    { key: "provider", label: "Provider" },
    { key: "model", label: "Model" },
    {
      key: "enabled",
      label: "Enabled",
      render: (_, row) => (
        <ToggleSwitch
          checked={row.enabled}
          onChange={(v) => update.mutate({ ...row, enabled: v })}
        />
      ),
    },
  ];

  const handleSubmit = (values: Record<string, unknown>) => {
    const onSuccess = () => setModal(null);
    if (modal?.mode === "edit" && modal.item) {
      update.mutate({ ...modal.item, ...values } as AgentModelConfig, { onSuccess });
    } else {
      create.mutate(values as Partial<AgentModelConfig>, { onSuccess });
    }
  };

  return (
    <>
      <ConfigTable
        data={list.data ?? []}
        columns={columns}
        isLoading={list.isLoading}
        idKey="id"
        onCreate={() => setModal({ mode: "create" })}
        onEdit={(item) => setModal({ mode: "edit", item })}
        onDelete={(item) => setDeleting(item)}
        createLabel="Add Config"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Agent Model" : "Add Agent Model"}
          fields={fields}
          initialValues={modal.item as unknown as Record<string, unknown>}
          isEdit={modal.mode === "edit"}
          isPending={create.isPending || update.isPending}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          itemLabel={deleting.name}
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
