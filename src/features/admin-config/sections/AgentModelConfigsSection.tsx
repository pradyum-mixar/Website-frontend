import { useState } from "react";
import { useAgentModelConfigs } from "../hooks/useAgentModelConfigs";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, AgentModelConfig } from "../types";

const fields: FieldConfig[] = [
  { name: "config_name", label: "Config Name", type: "text", required: true },
  { name: "provider", label: "Provider", type: "text", required: true },
  { name: "model_name", label: "Model Name", type: "text", required: true },
  { name: "temperature", label: "Temperature", type: "number" },
  { name: "max_tokens", label: "Max Tokens", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "enabled", label: "Enabled", type: "boolean" },
];

export function AgentModelConfigsSection() {
  const { list, create, update, remove } = useAgentModelConfigs();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: AgentModelConfig } | null>(null);
  const [deleting, setDeleting] = useState<AgentModelConfig | null>(null);

  const columns: Column<AgentModelConfig>[] = [
    { key: "config_name", label: "Name" },
    { key: "provider", label: "Provider" },
    { key: "model_name", label: "Model" },
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
          itemLabel={deleting.config_name}
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
