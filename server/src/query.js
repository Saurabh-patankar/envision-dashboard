/**
 * Ad-hoc SQL query runner — a tiny helper for inspecting the database.
 *
 * Usage (from the server/ folder):
 *
 *   node src/query.js "SELECT * FROM projects"
 *   node src/query.js "SELECT * FROM tasks WHERE project_id = 1"
 *   node src/query.js "SELECT status, COUNT(*) AS n FROM projects GROUP BY status"
 *
 * With no argument it prints a quick overview (row counts + all projects).
 * This is a convenience/debug tool; the app itself never uses it.
 */
import db from './db.js';

const sql = process.argv.slice(2).join(' ').trim();

function print(rows) {
  if (!rows || rows.length === 0) {
    console.log('(no rows)');
    return;
  }
  console.table(rows);
}

if (!sql) {
  // Default overview.
  const p = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
  const t = db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c;
  console.log(`Projects: ${p}   Tasks: ${t}\n`);
  console.log('All projects:');
  print(db.prepare('SELECT id, title, status, deadline FROM projects ORDER BY id').all());
} else {
  const isSelect = /^\s*select|^\s*pragma|^\s*with/i.test(sql);
  if (isSelect) {
    print(db.prepare(sql).all());
  } else {
    // INSERT / UPDATE / DELETE etc.
    const info = db.prepare(sql).run();
    console.log(`OK. changes=${info.changes}, lastInsertRowid=${info.lastInsertRowid}`);
  }
}
