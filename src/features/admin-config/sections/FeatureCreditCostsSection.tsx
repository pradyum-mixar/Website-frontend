import { useState } from "react";
import { useFeatureCreditCosts } from "../hooks/useFeatureCreditCosts";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import type { Column, FieldConfig, FeatureCreditCost } from "../types";

const columns: Column<FeatureCreditCost>[] = [
  { key: "feature_key", label: "Feature Key" },
  { key: "credits", label: "Credits" },
  { key: "label", label: "Label" },
];

const fields: FieldConfig[] = [
  { name: "feature_key", label: "Feature Key", type: "text", required: true, readOnlyOnEdit: true },
  { name: "credits", label: "Credits", type: "number", required: true },
  { name: "label", label: "Label", type: "text" },
];

export function FeatureCreditCostsSection() {
  const { list, create, update } = useFeatureCreditCosts();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: FeatureCreditCost } | null>(null);

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
