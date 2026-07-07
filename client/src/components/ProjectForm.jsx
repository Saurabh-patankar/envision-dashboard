import { useState } from 'react';
import Modal from './Modal.jsx';

const STATUSES = ['Active', 'Completed', 'On Hold'];

/**
 * Create / edit project form inside a modal.
 * `initial` populates fields when editing; absence means "create".
 */
export default function ProjectForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'Active',
    deadline: initial?.deadline || '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setBusy(true);
    setError('');
    try {
      await onSubmit({ ...form, deadline: form.deadline || null });
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={initial ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Website Redesign" autoFocus />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[90px] resize-y" value={form.description} onChange={set('description')} placeholder="Short summary of the project…" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline || ''} onChange={set('deadline')} />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : initial ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
