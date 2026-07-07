/** Small presentational helpers for loading, error, and empty states. */

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-brand-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card mx-auto my-10 max-w-lg p-6 text-center">
      <div className="mb-2 text-3xl">⚠️</div>
      <h3 className="mb-1 font-semibold text-red-300">Something went wrong</h3>
      <p className="mb-4 text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="card my-8 p-10 text-center">
      <div className="mb-3 text-4xl">📭</div>
      <h3 className="mb-1 font-semibold text-slate-200">{title}</h3>
      {subtitle && <p className="mb-4 text-sm text-slate-400">{subtitle}</p>}
      {action}
    </div>
  );
}
