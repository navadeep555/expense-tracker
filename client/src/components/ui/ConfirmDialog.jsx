import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } catch {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <Trash2 className="h-5 w-5" />
        </div>
        <p className="pt-1 text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn-danger" onClick={handle} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
