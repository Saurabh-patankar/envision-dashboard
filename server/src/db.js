/**
 * Database bootstrap.
 *
 * We use better-sqlite3 — a fast, synchronous SQLite driver. SQLite keeps the
 * whole database in a single file (data.sqlite), so there is no external DB
 * server to install: perfect for an assessment that must "just run".
 *
 * This module:
 *   1. Opens (or creates) the SQLite file.
 *   2. Enables foreign-key enforcement (off by default in SQLite).
 *   3. Creates the two tables — `projects` and `tasks` — if they don't exist.
 *
 * Data model / relationship:
 *   A Project HAS MANY Tasks.
 *   A Task BELONGS TO one Project (tasks.project_id -> projects.id).
 *   ON DELETE CASCADE ensures a project's tasks are removed with it.
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Allow the DB path to be overridden (useful for tests / deployment volumes).
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data.sqlite');

const db = new Database(DB_PATH);

// Enforce referential integrity and use a write-ahead log for better concurrency.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** Create the schema if it does not already exist. */
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'Active'
                          CHECK (status IN ('Active', 'Completed', 'On Hold')),
      deadline    TEXT,                       -- ISO date string (YYYY-MM-DD)
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id  INTEGER NOT NULL,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'Pending'
                          CHECK (status IN ('Pending', 'In Progress', 'Completed')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
  `);
}

export default db;
