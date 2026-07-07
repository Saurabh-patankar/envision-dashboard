import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Spinner, ErrorState, EmptyState } from '../components/Feedback.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const FILTERS = ['All', 'Active', 'Completed', 'On Hold'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state.
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProjects(await api.listProjects(filter));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(body) {
    await api.createProject(body);
    await load();
  }
  async function handleUpdate(body) {
    await api.updateProject(editing.id, body);
    await load();
  }
  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await api.deleteProject(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-400">Manage all agency projects in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Project
        </button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-500 text-white'
                : 'bg-ink-800 text-slate-400 hover:bg-ink-700 hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading projects…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          subtitle={filter === 'All' ? 'Create your first project to get started.' : `No projects with status "${filter}".`}
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + New Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="card flex flex-col p-5 transition-colors hover:border-brand-500/40">
              <div className="mb-2 flex items-start justify-between gap-3">
                <Link to={`/projects/${p.id}`} className="font-semibold text-slate-100 hover:text-brand-400">
                  {p.title}
                </Link>
                <StatusBadge status={p.status} />
              </div>
              <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-400">{p.description || 'No description.'}</p>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <span>📅 {p.deadline || 'No deadline'}</span>
                <span>{p.taskCount} task{p.taskCount === 1 ? '' : 's'}</span>
              </div>
              <div className="flex gap-2">
                <Link to={`/projects/${p.id}`} className="btn-secondary flex-1">
                  View
                </Link>
                <button className="btn-ghost" onClick={() => setEditing(p)} title="Edit">
                  ✏️
                </button>
                <button className="btn-ghost text-red-400" onClick={() => setDeleting(p)} title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProjectForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <ProjectForm initial={editing} onSubmit={handleUpdate} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete project?"
          message={`This will permanently delete "${deleting.title}" and all of its tasks. This action cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}
