import { useState } from "react";
import { useGenerationModelConfigs } from "../hooks/useGenerationModelConfigs";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, GenerationModelConfig } from "../types";

const fields: FieldConfig[] = [
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "generation_type", label: "Generation Type", type: "text", required: true, placeholder: "image, model_3d, depth_to_image, pbr" },
  { name: "display_name", label: "Display Name", type: "text", required: true },
  { name: "generator", label: "Generator", type: "text", placeholder: "gemini, flux, hunyuan..." },
  { name: "model_name", label: "Model Name", type: "text" },
  { name: "model_ref", label: "Model Ref", type: "text" },
  { name: "model_version", label: "Model Version", type: "text" },
  { name: "credit_cost", label: "Credit Cost", type: "number" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "max_reference_images", label: "Max Ref Images", type: "number" },
  { name: "is_default", label: "Is Default", type: "boolean" },
  { name: "supports_resolution", label: "Supports Resolution", type: "boolean" },
  { name: "enabled", label: "Enabled", type: "boolean" },
  { name: "parameters", label: "Parameters (JSON)", type: "json" },
];

export function GenerationModelConfigsSection() {
  const { list, create, update, remove } = useGenerationModelConfigs();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: GenerationModelConfig } | null>(null);
  const [deleting, setDeleting] = useState<GenerationModelConfig | null>(null);

  const columns: Column<GenerationModelConfig>[] = [
    { key: "slug", label: "Slug" },
    { key: "generation_type", label: "Type" },
    { key: "display_name", label: "Display Name" },
    { key: "credit_cost", label: "Credits" },
    { key: "sort_order", label: "Order" },
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
      update.mutate({ ...modal.item, ...values } as GenerationModelConfig, { onSuccess });
    } else {
      create.mutate(values as Partial<GenerationModelConfig>, { onSuccess });
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
        createLabel="Add Model"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Generation Model" : "Add Generation Model"}
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
          itemLabel={deleting.display_name}
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
