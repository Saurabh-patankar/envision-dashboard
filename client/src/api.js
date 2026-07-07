/**
 * Thin API client.
 *
 * All calls go through `request`, which centralises JSON handling and error
 * normalisation so components can rely on thrown Errors with readable messages.
 *
 * The base URL is configurable via VITE_API_URL for deployments where the API
 * lives on a different origin. In local dev it defaults to '' so calls hit the
 * Vite proxy (/api -> localhost:4000). In single-service production the built
 * frontend is served by Express, so '' is also correct there.
 */
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null; // No Content (e.g. DELETE)

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

/* --------------------------------- Projects ------------------------------- */
export const api = {
  getSummary: () => request('/api/projects/summary'),

  listProjects: (status) =>
    request(`/api/projects${status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : ''}`),

  getProject: (id) => request(`/api/projects/${id}`),

  createProject: (body) =>
    request('/api/projects', { method: 'POST', body: JSON.stringify(body) }),

  updateProject: (id, body) =>
    request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  /* ---------------------------------- Tasks ------------------------------- */
  listTasks: (projectId) => request(`/api/projects/${projectId}/tasks`),

  createTask: (projectId, body) =>
    request(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateTask: (projectId, taskId, body) =>
    request(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  toggleTask: (projectId, taskId) =>
    request(`/api/projects/${projectId}/tasks/${taskId}/toggle`, { method: 'PATCH' }),

  deleteTask: (projectId, taskId) =>
    request(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
};
