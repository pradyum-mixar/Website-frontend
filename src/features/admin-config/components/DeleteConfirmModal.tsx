type Props = {
  itemLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteConfirmModal({ itemLabel, isPending, onConfirm, onClose }: Props) {
  return (
    <div className="config-modal-overlay" onClick={onClose}>
      <div className="config-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="config-modal-header">
          <h3>Confirm Delete</h3>
          <button type="button" className="config-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="config-modal-body">
          <div className="config-delete-body">
            <p>Are you sure you want to delete</p>
            <p><strong>{itemLabel}</strong>?</p>
          </div>
        </div>

        <div className="config-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
