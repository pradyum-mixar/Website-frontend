import { useState } from "react";
import { useFeatureCreditCosts } from "../hooks/useFeatureCreditCosts";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, FeatureCreditCost } from "../types";

const fields: FieldConfig[] = [
  { name: "feature_key", label: "Feature Key", type: "text", required: true, readOnlyOnEdit: true },
  { name: "display_name", label: "Display Name", type: "text", required: true },
  { name: "credit_cost", label: "Credit Cost", type: "number", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "enabled", label: "Enabled", type: "boolean" },
];

export function FeatureCreditCostsSection() {
  const { list, create, update } = useFeatureCreditCosts();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: FeatureCreditCost } | null>(null);

  const columns: Column<FeatureCreditCost>[] = [
    { key: "feature_key", label: "Feature Key" },
    { key: "display_name", label: "Display Name" },
    { key: "credit_cost", label: "Credits" },
    {
      key: "enabled",
      label: "Enabled",
      render: (_, row) => (
        <ToggleSwitch
          checked={row.enabled}
          onChange={(v) => update.mutate({ ...row, enabled: v } as FeatureCreditCost)}
        />
      ),
    },
  ];

  const handleSubmit = (values: Record<string, unknown>) => {
    const onSuccess = () => setModal(null);
    if (modal?.mode === "edit") {
      update.mutate(values as FeatureCreditCost, { onSuccess });
    } else {
      create.mutate(values as Partial<FeatureCreditCost>, { onSuccess });
    }
  };

  return (
    <>
      <ConfigTable
        data={list.data ?? []}
        columns={columns}
        isLoading={list.isLoading}
        idKey="feature_key"
        onCreate={() => setModal({ mode: "create" })}
        onEdit={(item) => setModal({ mode: "edit", item })}
        createLabel="Add Cost"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Credit Cost" : "Add Credit Cost"}
          fields={fields}
          initialValues={modal.item as unknown as Record<string, unknown>}
          isEdit={modal.mode === "edit"}
          isPending={create.isPending || update.isPending}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
