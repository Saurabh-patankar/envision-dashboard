/** Colour-coded pill for project & task statuses. */
const STYLES = {
  // Project statuses
  Active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Completed: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  'On Hold': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  // Task statuses
  Pending: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'In Progress': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
