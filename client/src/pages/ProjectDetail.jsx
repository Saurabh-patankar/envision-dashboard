import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Spinner, ErrorState, EmptyState } from '../components/Feedback.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / action state.
  const [editProject, setEditProject] = useState(false);
  const [deleteProject, setDeleteProject] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProject(await api.getProject(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /* --------------------------- Project actions --------------------------- */
  async function handleUpdateProject(body) {
    await api.updateProject(id, body);
    await load();
  }
  async function handleDeleteProject() {
    setBusy(true);
    try {
      await api.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  /* ----------------------------- Task actions ---------------------------- */
  async function handleCreateTask(body) {
    await api.createTask(id, body);
    await load();
  }
  async function handleUpdateTask(body) {
    await api.updateTask(id, editingTask.id, body);
    await load();
  }
  async function handleToggleTask(task) {
    await api.toggleTask(id, task.id);
    await load();
  }
  async function handleDeleteTask() {
    setBusy(true);
    try {
      await api.deleteTask(id, deletingTask.id);
      setDeletingTask(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading project…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!project) return null;

  const tasks = project.tasks || [];
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500">
        <Link to="/projects" className="hover:text-brand-400">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{project.title}</span>
      </div>

      {/* Project header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="max-w-2xl text-slate-400">{project.description || 'No description provided.'}</p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-500">
              <span>📅 Deadline: <span className="text-slate-300">{project.deadline || '—'}</span></span>
              <span>✅ {completed}/{tasks.length} tasks completed</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setEditProject(true)}>Edit</button>
            <button className="btn-danger" onClick={() => setDeleteProject(true)}>Delete</button>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-600">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-100">Tasks</h2>
          <button className="btn-primary" onClick={() => setShowTaskForm(true)}>+ Add Task</button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            subtitle="Break this project down into actionable tasks."
            action={<button className="btn-primary" onClick={() => setShowTaskForm(true)}>+ Add Task</button>}
          />
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-lg border border-ink-600/50 bg-ink-900/40 p-3"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'Completed'}
                  onChange={() => handleToggleTask(task)}
                  className="mt-1 h-4 w-4 cursor-pointer accent-brand-500"
                  title="Mark complete / incomplete"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-medium ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.title}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                  {task.description && (
                    <p className="mt-0.5 text-sm text-slate-500">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" onClick={() => setEditingTask(task)} title="Edit task">✏️</button>
                  <button className="btn-ghost px-2 py-1 text-red-400" onClick={() => setDeletingTask(task)} title="Delete task">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      {editProject && (
        <ProjectForm initial={project} onSubmit={handleUpdateProject} onClose={() => setEditProject(false)} />
      )}
      {deleteProject && (
        <ConfirmDialog
          title="Delete project?"
          message={`This will permanently delete "${project.title}" and all of its tasks.`}
          onConfirm={handleDeleteProject}
          onClose={() => setDeleteProject(false)}
          busy={busy}
        />
      )}
      {showTaskForm && (
        <TaskForm onSubmit={handleCreateTask} onClose={() => setShowTaskForm(false)} />
      )}
      {editingTask && (
        <TaskForm initial={editingTask} onSubmit={handleUpdateTask} onClose={() => setEditingTask(null)} />
      )}
      {deletingTask && (
        <ConfirmDialog
          title="Delete task?"
          message={`Delete "${deletingTask.title}"? This cannot be undone.`}
          onConfirm={handleDeleteTask}
          onClose={() => setDeletingTask(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
