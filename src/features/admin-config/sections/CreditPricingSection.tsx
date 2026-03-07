import { useState } from "react";
import { useCreditPricing } from "../hooks/useCreditPricing";
import { ConfigTable } from "../components/ConfigTable";
import { ConfigFormModal } from "../components/ConfigFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ToggleSwitch } from "../components/ToggleSwitch";
import type { Column, FieldConfig, AdminCreditPricing } from "../types";

const fields: FieldConfig[] = [
  { name: "slug", label: "Slug", type: "text", required: true, readOnlyOnEdit: true },
  { name: "price_per_credit_cents", label: "Price per Credit (cents)", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text" },
  { name: "min_quantity", label: "Min Quantity", type: "number" },
  { name: "max_quantity", label: "Max Quantity", type: "number" },
  { name: "dodo_product_id", label: "Dodo Product ID", type: "text" },
  { name: "enabled", label: "Enabled", type: "boolean" },
];

export function CreditPricingSection() {
  const { list, create, update, remove } = useCreditPricing();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: AdminCreditPricing } | null>(null);
  const [deleting, setDeleting] = useState<AdminCreditPricing | null>(null);

  const columns: Column<AdminCreditPricing>[] = [
    { key: "slug", label: "Slug" },
    {
      key: "price_per_credit_cents",
      label: "Price/Credit",
      render: (v) => `$${(Number(v) / 100).toFixed(2)}`,
    },
    { key: "min_quantity", label: "Min Qty" },
    { key: "max_quantity", label: "Max Qty" },
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
      update.mutate({ ...modal.item, ...values } as AdminCreditPricing, { onSuccess });
    } else {
      create.mutate(values as Partial<AdminCreditPricing>, { onSuccess });
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
        createLabel="Add Pricing"
      />

      {modal && (
        <ConfigFormModal
          title={modal.mode === "edit" ? "Edit Credit Pricing" : "Add Credit Pricing"}
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
          itemLabel={deleting.slug}
          isPending={remove.isPending}
          onConfirm={() => remove.mutate(deleting.slug, { onSuccess: () => setDeleting(null) })}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
