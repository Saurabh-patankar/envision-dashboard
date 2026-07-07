/**
 * Database seeding script.
 *
 * Reads the provided mock data (mockData.json) and inserts it into SQLite.
 * Run with:  npm run seed
 *
 * The script is idempotent-friendly: it wipes existing rows first so re-running
 * always yields the exact seed state. We preserve the original IDs from the mock
 * data (e.g. project 1, task 101) so URLs and relationships stay predictable.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import db, { initSchema } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function seed() {
  initSchema();

  const raw = readFileSync(path.join(__dirname, 'mockData.json'), 'utf-8');
  const { projects, tasks } = JSON.parse(raw);

  // Prepared statements that keep the seed IDs from the mock data.
  const insertProject = db.prepare(
    `INSERT INTO projects (id, title, description, status, deadline)
     VALUES (@id, @title, @description, @status, @deadline)`
  );
  const insertTask = db.prepare(
    `INSERT INTO tasks (id, project_id, title, description, status)
     VALUES (@id, @projectId, @title, @description, @status)`
  );

  // Wrap everything in a single transaction for speed and atomicity.
  const run = db.transaction(() => {
    db.exec('DELETE FROM tasks; DELETE FROM projects;');
    // Reset AUTOINCREMENT counters so new inserts continue after the seed IDs.
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tasks','projects');");

    for (const p of projects) insertProject.run(p);
    for (const t of tasks) insertTask.run(t);
  });

  run();

  console.log(
    `✅ Seed complete: ${projects.length} projects, ${tasks.length} tasks inserted.`
  );
}

seed();
