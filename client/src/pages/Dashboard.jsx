import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Spinner, ErrorState } from '../components/Feedback.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

/** Summary card used in the metrics grid. */
function StatCard({ label, value, accent, hint }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      // Fetch summary + project list together.
      const [s, projects] = await Promise.all([api.getSummary(), api.listProjects()]);
      setSummary(s);
      setRecent(projects.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400">An overview of your agency's projects and tasks.</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Projects" value={summary.totalProjects} accent="text-slate-100" />
        <StatCard label="Active Projects" value={summary.activeProjects} accent="text-emerald-400" />
        <StatCard label="Completed Tasks" value={summary.completedTasks} accent="text-brand-400" hint={`of ${summary.totalTasks} total`} />
        <StatCard label="Pending Tasks" value={summary.pendingTasks} accent="text-amber-400" hint="not yet completed" />
      </div>

      {/* Secondary breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Completed Projects" value={summary.completedProjects} accent="text-brand-400" />
        <StatCard label="On Hold Projects" value={summary.onHoldProjects} accent="text-amber-400" />
        <StatCard label="Total Tasks" value={summary.totalTasks} accent="text-slate-100" />
      </div>

      {/* Recent projects */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-100">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-brand-400 hover:underline">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-ink-600/50">
          {recent.map((p) => (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 hover:bg-ink-700/50"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-200">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.taskCount} task{p.taskCount === 1 ? '' : 's'} · due {p.deadline || '—'}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
