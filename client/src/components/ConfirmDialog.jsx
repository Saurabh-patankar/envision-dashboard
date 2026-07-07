import Modal from './Modal.jsx';

/** Confirmation prompt used before destructive actions (delete). */
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onClose, busy }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-6 text-sm text-slate-300">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
