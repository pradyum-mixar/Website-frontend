import type { Column } from "../types";

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  idKey: keyof T;
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  createLabel?: string;
};

export function ConfigTable<T>({
  data,
  columns,
  isLoading,
  idKey,
  onCreate,
  onEdit,
  onDelete,
  createLabel = "Create",
}: Props<T>) {
  return (
    <div className="section">
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="section-count">{data.length} items</span>
        </div>
        {onCreate && (
          <button type="button" className="admin-btn admin-btn-primary" onClick={onCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {createLabel}
          </button>
        )}
      </div>

      <div className="usage-table-container">
        {isLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-title">No items yet</h3>
            <p className="empty-message">Create one to get started.</p>
          </div>
        ) : (
          <table className="usage-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)}>{col.label}</th>
                ))}
                {(onEdit || onDelete) && <th style={{ width: 80 }} />}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={String(row[idKey])}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      <div className="config-row-actions">
                        {onEdit && (
                          <button
                            type="button"
                            className="config-action-btn"
                            onClick={() => onEdit(row)}
                            title="Edit"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="config-action-btn delete"
                            onClick={() => onDelete(row)}
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
