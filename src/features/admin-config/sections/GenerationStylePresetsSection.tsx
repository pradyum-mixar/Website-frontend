import { useState } from "react";
import { useGenerationStylePresets } from "../hooks/useGenerationStylePresets";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, GenerationStylePreset } from "../types";

const fields: FieldConfig[] = [
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "generation_type", label: "Generation Type", type: "text", required: true, placeholder: "image, model_3d..." },
  { name: "display_name", label: "Display Name", type: "text", required: true },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "enabled", label: "Enabled", type: "boolean" },
  { name: "prompt_template", label: "Prompt Template", type: "textarea" },
];

export function GenerationStylePresetsSection() {
  const { list, create, update, remove } = useGenerationStylePresets();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: GenerationStylePreset } | null>(null);
  const [deleting, setDeleting] = useState<GenerationStylePreset | null>(null);

  const columns: Column<GenerationStylePreset>[] = [
    { key: "slug", label: "Slug" },
    { key: "generation_type", label: "Type" },
    { key: "display_name", label: "Display Name" },
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
      update.mutate({ ...modal.item, ...values } as GenerationStylePreset, { onSuccess });
    } else {
      create.mutate(values as Partial<GenerationStylePreset>, { onSuccess });
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
        createLabel="Add Preset"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Style Preset" : "Add Style Preset"}
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
