import { useState } from "react";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, AdminPlan } from "../types";

const fields: FieldConfig[] = [
  { name: "slug", label: "Slug", type: "text", required: true, readOnlyOnEdit: true },
  { name: "name", label: "Name", type: "text", required: true },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "price_monthly_cents", label: "Monthly Price (cents)", type: "number", required: true },
  { name: "price_yearly_cents", label: "Yearly Price (cents)", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text" },
  { name: "credits_per_month", label: "Credits / Month", type: "number" },
  { name: "cta_label", label: "CTA Label", type: "text" },
  { name: "dodo_product_id", label: "Dodo Product ID", type: "text" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "highlight", label: "Highlight", type: "boolean" },
  { name: "enabled", label: "Enabled", type: "boolean" },
  { name: "features", label: "Features (JSON array)", type: "json" },
];

export function SubscriptionPlansSection() {
  const { list, create, update, remove } = useSubscriptionPlans();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: AdminPlan } | null>(null);
  const [deleting, setDeleting] = useState<AdminPlan | null>(null);

  const columns: Column<AdminPlan>[] = [
    { key: "slug", label: "Slug" },
    { key: "name", label: "Name" },
    {
      key: "price_monthly_cents",
      label: "Monthly",
      render: (v) => `$${(Number(v) / 100).toFixed(2)}`,
    },
    { key: "credits_per_month", label: "Credits" },
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
      update.mutate({ ...modal.item, ...values } as AdminPlan, { onSuccess });
    } else {
      create.mutate(values as Partial<AdminPlan>, { onSuccess });
    }
  };

  return (
    <>
      <ConfigTable
        data={list.data ?? []}
        columns={columns}
        isLoading={list.isLoading}
        idKey="slug"
        onCreate={() => setModal({ mode: "create" })}
        onEdit={(item) => setModal({ mode: "edit", item })}
        onDelete={(item) => setDeleting(item)}
        createLabel="Add Plan"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Plan" : "Add Plan"}
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
          onConfirm={() => remove.mutate(deleting.slug, { onSuccess: () => setDeleting(null) })}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
