/**
 * Project routes — RESTful CRUD for projects, plus a dashboard summary.
 *
 * Mounted at /api/projects
 *
 *   GET    /api/projects            -> list projects (optional ?status= filter)
 *   GET    /api/projects/summary    -> dashboard aggregate counts
 *   GET    /api/projects/:id        -> single project (with its tasks)
 *   POST   /api/projects            -> create a project
 *   PUT    /api/projects/:id        -> update a project
 *   DELETE /api/projects/:id        -> delete a project (cascades to its tasks)
 */
import { Router } from 'express';
import db from '../db.js';

const router = Router();

const VALID_STATUSES = ['Active', 'Completed', 'On Hold'];

/** Basic validation helper for create/update payloads. */
function validateProject(body, { partial = false } = {}) {
  const errors = [];
  const { title, status } = body;

  if (!partial || title !== undefined) {
    if (!title || !String(title).trim()) errors.push('title is required');
  }
  if (!partial || status !== undefined) {
    if (status && !VALID_STATUSES.includes(status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }
  return errors;
}

/* ----------------------------- Dashboard summary -------------------------- */
// Declared BEFORE "/:id" so "summary" is not captured as an id.
router.get('/summary', (_req, res) => {
  const totalProjects = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
  const activeProjects = db
    .prepare("SELECT COUNT(*) AS c FROM projects WHERE status = 'Active'").get().c;
  const completedProjects = db
    .prepare("SELECT COUNT(*) AS c FROM projects WHERE status = 'Completed'").get().c;
  const onHoldProjects = db
    .prepare("SELECT COUNT(*) AS c FROM projects WHERE status = 'On Hold'").get().c;

  const totalTasks = db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c;
  const completedTasks = db
    .prepare("SELECT COUNT(*) AS c FROM tasks WHERE status = 'Completed'").get().c;
  // "Pending" here means "not yet completed" (Pending + In Progress) — the two
  // buckets the dashboard cares about per the brief.
  const pendingTasks = totalTasks - completedTasks;

  res.json({
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
  });
});

/* --------------------------------- List ----------------------------------- */
router.get('/', (req, res) => {
  const { status } = req.query;

  let rows;
  if (status && VALID_STATUSES.includes(status)) {
    rows = db
      .prepare('SELECT * FROM projects WHERE status = ? ORDER BY id')
      .all(status);
  } else {
    rows = db.prepare('SELECT * FROM projects ORDER BY id').all();
  }

  // Attach a lightweight task count to each project for list/card badges.
  const countStmt = db.prepare('SELECT COUNT(*) AS c FROM tasks WHERE project_id = ?');
  const withCounts = rows.map((p) => ({ ...p, taskCount: countStmt.get(p.id).c }));

  res.json(withCounts);
});

/* ------------------------------ Get one ----------------------------------- */
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const tasks = db
    .prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY id')
    .all(project.id);

  res.json({ ...project, tasks });
});

/* ------------------------------- Create ----------------------------------- */
router.post('/', (req, res) => {
  const errors = validateProject(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const { title, description = '', status = 'Active', deadline = null } = req.body;

  const info = db
    .prepare(
      `INSERT INTO projects (title, description, status, deadline)
       VALUES (?, ?, ?, ?)`
    )
    .run(title.trim(), description, status, deadline);

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

/* ------------------------------- Update ----------------------------------- */
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  const errors = validateProject(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  // Merge provided fields over the existing record.
  const merged = {
    title: req.body.title !== undefined ? String(req.body.title).trim() : existing.title,
    description: req.body.description !== undefined ? req.body.description : existing.description,
    status: req.body.status !== undefined ? req.body.status : existing.status,
    deadline: req.body.deadline !== undefined ? req.body.deadline : existing.deadline,
  };

  db.prepare(
    `UPDATE projects
        SET title = ?, description = ?, status = ?, deadline = ?, updated_at = datetime('now')
      WHERE id = ?`
  ).run(merged.title, merged.description, merged.status, merged.deadline, req.params.id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(updated);
});

/* ------------------------------- Delete ----------------------------------- */
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Project not found' });
  res.status(204).send();
});

export default router;
