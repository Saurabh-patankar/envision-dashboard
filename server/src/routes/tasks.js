/**
 * Task routes — RESTful CRUD for tasks, always scoped to a parent project.
 *
 * Mounted at /api/projects/:projectId/tasks  (nested to express the relationship)
 *
 *   GET    /api/projects/:projectId/tasks           -> list tasks for a project
 *   POST   /api/projects/:projectId/tasks           -> create a task
 *   PUT    /api/projects/:projectId/tasks/:taskId   -> update a task
 *   PATCH  /api/projects/:projectId/tasks/:taskId/toggle -> flip complete/incomplete
 *   DELETE /api/projects/:projectId/tasks/:taskId   -> delete a task
 *
 * `mergeParams: true` lets this router read :projectId from the parent path.
 */
import { Router } from 'express';
import db from '../db.js';

const router = Router({ mergeParams: true });

const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];

/** Ensure the parent project exists; returns it or null. */
function getProject(projectId) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
}

function validateTask(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (!body.title || !String(body.title).trim()) errors.push('title is required');
  }
  if (!partial || body.status !== undefined) {
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }
  return errors;
}

/* --------------------------------- List ----------------------------------- */
router.get('/', (req, res) => {
  if (!getProject(req.params.projectId)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const tasks = db
    .prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY id')
    .all(req.params.projectId);
  res.json(tasks);
});

/* ------------------------------- Create ----------------------------------- */
router.post('/', (req, res) => {
  if (!getProject(req.params.projectId)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const { title, description = '', status = 'Pending' } = req.body;
  const info = db
    .prepare(
      `INSERT INTO tasks (project_id, title, description, status)
       VALUES (?, ?, ?, ?)`
    )
    .run(req.params.projectId, title.trim(), description, status);

  const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

/* ------------------------------- Update ----------------------------------- */
router.put('/:taskId', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?')
    .get(req.params.taskId, req.params.projectId);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const errors = validateTask(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const merged = {
    title: req.body.title !== undefined ? String(req.body.title).trim() : existing.title,
    description: req.body.description !== undefined ? req.body.description : existing.description,
    status: req.body.status !== undefined ? req.body.status : existing.status,
  };

  db.prepare(
    `UPDATE tasks
        SET title = ?, description = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?`
  ).run(merged.title, merged.description, merged.status, req.params.taskId);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.taskId);
  res.json(updated);
});

/* --------------------- Toggle complete / incomplete ----------------------- */
// Convenience endpoint for the "mark as complete/incomplete" checkbox.
router.patch('/:taskId/toggle', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND project_id = ?')
    .get(req.params.taskId, req.params.projectId);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  // Completed <-> Pending. (In-Progress tasks become Completed when toggled on.)
  const nextStatus = existing.status === 'Completed' ? 'Pending' : 'Completed';

  db.prepare(
    "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(nextStatus, req.params.taskId);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.taskId);
  res.json(updated);
});

/* ------------------------------- Delete ----------------------------------- */
router.delete('/:taskId', (req, res) => {
  const info = db
    .prepare('DELETE FROM tasks WHERE id = ? AND project_id = ?')
    .run(req.params.taskId, req.params.projectId);
  if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});

export default router;
