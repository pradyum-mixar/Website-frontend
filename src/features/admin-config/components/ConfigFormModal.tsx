import { useState, useEffect } from "react";
import type { FieldConfig } from "../types";
import { ToggleSwitch } from "./ToggleSwitch";

type Props = {
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, unknown>;
  isEdit?: boolean;
  isPending?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onClose: () => void;
};

export function ConfigFormModal({ title, fields, initialValues, isEdit, isPending, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    for (const f of fields) {
      const init = initialValues?.[f.name];
      if (f.type === "json") {
        defaults[f.name] = init != null ? JSON.stringify(init, null, 2) : "";
      } else if (f.type === "boolean") {
        defaults[f.name] = init ?? false;
      } else if (f.type === "number") {
        defaults[f.name] = init ?? 0;
      } else {
        defaults[f.name] = init ?? "";
      }
    }
    setValues(defaults);
  }, [fields, initialValues]);

  const set = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = () => {
    const parsed: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    for (const f of fields) {
      let v = values[f.name];
      if (f.type === "json" && typeof v === "string" && v.trim()) {
        try {
          v = JSON.parse(v);
        } catch {
          errors[f.name] = "Invalid JSON";
        }
      }
      if (f.type === "number" && v !== "" && v != null) {
        v = Number(v);
      }
      parsed[f.name] = v;
    }

    if (Object.keys(errors).length > 0) {
      setJsonErrors(errors);
      return;
    }
    setJsonErrors({});
    onSubmit(parsed);
  };

  return (
    <div className="config-modal-overlay" onClick={onClose}>
      <div className="config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="config-modal-header">
          <h3>{title}</h3>
          <button type="button" className="config-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="config-modal-body">
          <div className="config-form-grid">
            {fields.map((f) => {
              const isReadOnly = isEdit && f.readOnlyOnEdit;
              const fullWidth = f.type === "textarea" || f.type === "json";

              return (
                <div key={f.name} className={`config-form-field ${fullWidth ? "config-field-full" : ""}`}>
                  <label>{f.label}</label>

                  {f.type === "boolean" ? (
                    <ToggleSwitch
                      checked={!!values[f.name]}
                      onChange={(v) => set(f.name, v)}
                      disabled={isReadOnly}
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                      disabled={isReadOnly}
                    >
                      <option value="">Select...</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === "textarea" || f.type === "json" ? (
                    <>
                      <textarea
                        className={f.type === "json" ? "config-json-editor" : ""}
                        rows={f.type === "json" ? 5 : 3}
                        value={String(values[f.name] ?? "")}
                        onChange={(e) => set(f.name, e.target.value)}
                        placeholder={f.placeholder}
                        readOnly={isReadOnly}
                      />
                      {jsonErrors[f.name] && (
                        <span style={{ color: "var(--error-color)", fontSize: "0.75rem" }}>
                          {jsonErrors[f.name]}
                        </span>
                      )}
                    </>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={String(values[f.name] ?? "")}
                      onChange={(e) => set(f.name, f.type === "number" ? e.target.value : e.target.value)}
                      placeholder={f.placeholder}
                      readOnly={isReadOnly}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="config-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
