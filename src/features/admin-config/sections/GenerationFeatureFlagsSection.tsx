import { useState } from "react";
import { useGenerationFeatureFlags } from "../hooks/useGenerationFeatureFlags";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, GenerationFeatureFlag } from "../types";

const fields: FieldConfig[] = [
  { name: "flag_name", label: "Flag Name", type: "text", required: true },
  { name: "generation_type", label: "Generation Type", type: "text", required: true, placeholder: "image, model_3d..." },
  { name: "description", label: "Description", type: "textarea" },
  { name: "enabled", label: "Enabled", type: "boolean" },
];

export function GenerationFeatureFlagsSection() {
  const { list, create, update, remove } = useGenerationFeatureFlags();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: GenerationFeatureFlag } | null>(null);
  const [deleting, setDeleting] = useState<GenerationFeatureFlag | null>(null);

  const columns: Column<GenerationFeatureFlag>[] = [
    { key: "flag_name", label: "Flag Name" },
    { key: "generation_type", label: "Type" },
    {
      key: "description",
      label: "Description",
      render: (v) => (
        <span style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>
          {String(v ?? "—")}
        </span>
      ),
    },
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
      update.mutate({ ...modal.item, ...values } as GenerationFeatureFlag, { onSuccess });
    } else {
      create.mutate(values as Partial<GenerationFeatureFlag>, { onSuccess });
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
        createLabel="Add Flag"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Feature Flag" : "Add Feature Flag"}
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
          itemLabel={deleting.flag_name}
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
