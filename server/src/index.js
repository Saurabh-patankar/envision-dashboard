/**
 * Express application entry point.
 *
 * Wires up middleware, the REST routers, a health check, static serving of the
 * built frontend (for single-service deployment), and centralised error
 * handling. Start with:  npm start   (or npm run dev for auto-reload).
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

import { initSchema } from './db.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// Ensure the schema exists on boot (safe if already created / seeded).
initSchema();

/* -------------------------------- Middleware ------------------------------ */
app.use(cors()); // Allow the Vite dev server (and any deployed frontend) to call us.
app.use(express.json());

// Tiny request logger — helpful during development and demos.
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

/* --------------------------------- Routes --------------------------------- */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/projects', projectsRouter);
// Nested resource: tasks always live under a project.
app.use('/api/projects/:projectId/tasks', tasksRouter);

/* --------------- Serve the built frontend in production -------------------- */
// If the client has been built (client/dist), serve it so one service hosts
// both API and UI. In development the Vite dev server handles the UI instead.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: send index.html for any non-API GET route.
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

/* ----------------------------- 404 for API -------------------------------- */
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }));

/* --------------------------- Error handler -------------------------------- */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 EnvisionStudio API running on http://localhost:${PORT}`);
});
