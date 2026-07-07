# EnvisionStudio — Project Management Dashboard

A full‑stack **Project Management Dashboard** for a fictional agency, built for the
EnvisionStudio Web Developer practical assessment.

It lets you manage **projects** and their **tasks** with full CRUD, status
filtering, a dashboard summary, and a clean, responsive **dark theme** UI.

**Stack:** React (Vite) + Tailwind CSS · Node.js / Express · SQLite (better‑sqlite3)

---

## ✨ Features

| # | Feature | Where |
|---|---------|-------|
| 1 | **Project list** (card layout) with status | `Projects` page |
| 2 | **Status filter** (All / Active / Completed / On Hold) | `Projects` page |
| 3 | **Add new project** (Title, Description, Status, Deadline) | modal form |
| 4 | **Edit project** | modal form |
| 5 | **Delete project** with confirmation prompt | confirm dialog |
| 6 | **Project detail view** (dedicated page + progress bar) | `Projects/:id` |
| 7 | **Task management per project** — add / edit / delete / toggle complete | detail page |
| 8 | **Dashboard summary** — total projects, active projects, completed & pending tasks | `Dashboard` page |

Plus: loading / error / empty states, responsive layout, SPA navigation, and a
REST API with server‑side validation and cascading deletes.

---

## 🏗️ Project structure

```
envision-dashboard/
├── server/                  # Express + SQLite backend
│   ├── src/
│   │   ├── index.js         # App entry: middleware, routes, static serving
│   │   ├── db.js            # SQLite connection + schema (projects, tasks)
│   │   ├── seed.js          # Seeds mockData.json into the database
│   │   ├── mockData.json    # Provided mock data (10 projects, 20 tasks)
│   │   └── routes/
│   │       ├── projects.js  # /api/projects CRUD + /summary
│   │       └── tasks.js     # /api/projects/:id/tasks CRUD + toggle
│   └── package.json
├── client/                  # React (Vite) + Tailwind frontend
│   ├── src/
│   │   ├── api.js           # Central fetch wrapper
│   │   ├── App.jsx          # Routes
│   │   ├── pages/           # Dashboard, Projects, ProjectDetail
│   │   └── components/      # Layout, forms, modal, badges, feedback states
│   └── package.json
├── render.yaml              # One-click single-service deploy (Render)
├── package.json             # Root convenience scripts
└── README.md
```

---

## 🚀 Running locally

**Prerequisites:** Node.js 18+ (tested on Node 20) and npm.

### 1. Install dependencies

```bash
# from the repo root
npm run install:all
# (or manually)
# cd server && npm install
# cd ../client && npm install
```

### 2. Seed the database

This imports the provided mock data so the app works on first load.

```bash
npm run seed          # from root  (or: cd server && npm run seed)
```

You should see: `✅ Seed complete: 10 projects, 20 tasks inserted.`

### 3. Start the backend and frontend (two terminals)

```bash
# Terminal 1 — API on http://localhost:4000
npm run dev:server

# Terminal 2 — UI on http://localhost:5173
npm run dev:client
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` calls to the
backend automatically, so there's no extra configuration.

### Single‑service mode (one URL, like production)

```bash
npm run build         # builds client -> client/dist
npm run seed          # if you haven't already
npm start             # Express serves API + built frontend on :4000
```

Open **http://localhost:4000**.

---

## 🔌 API documentation

Base URL: `/api`. All request/response bodies are JSON.

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Liveness check `{ status: "ok" }` |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects. Optional `?status=Active\|Completed\|On Hold`. Each item includes `taskCount`. |
| GET | `/api/projects/summary` | Dashboard aggregates (totals, active, completed/pending tasks). |
| GET | `/api/projects/:id` | Single project **with its `tasks[]`**. |
| POST | `/api/projects` | Create. Body: `{ title*, description, status, deadline }`. |
| PUT | `/api/projects/:id` | Update (partial fields allowed). |
| DELETE | `/api/projects/:id` | Delete project (**cascades** to its tasks). |

### Tasks (nested under a project)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | List tasks for a project. |
| POST | `/api/projects/:projectId/tasks` | Create. Body: `{ title*, description, status }`. |
| PUT | `/api/projects/:projectId/tasks/:taskId` | Update a task. |
| PATCH | `/api/projects/:projectId/tasks/:taskId/toggle` | Toggle Completed ⇄ Pending. |
| DELETE | `/api/projects/:projectId/tasks/:taskId` | Delete a task. |

`*` = required. Statuses are validated server‑side:
projects use `Active / Completed / On Hold`; tasks use `Pending / In Progress / Completed`.

**Example**

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"New site","description":"Marketing site","status":"Active","deadline":"2026-12-01"}'
```

### Data models

**Project** `id, title, description, status, deadline, created_at, updated_at`
**Task** `id, project_id (FK → projects.id, ON DELETE CASCADE), title, description, status, created_at, updated_at`

Relationship: a **Project has many Tasks**.

---

## 🌐 Deployment

The app is designed to deploy as a **single web service** — Express serves both
the REST API and the pre‑built React frontend from one public URL.

### Render (recommended — uses the included `render.yaml`)

1. Push this repository to GitHub.
2. On [Render](https://render.com) → **New +** → **Blueprint** → select the repo.
3. Render reads `render.yaml`, runs the build (installs deps, builds the client,
   seeds SQLite onto a persistent disk) and starts the service.

Manual settings (if not using the blueprint):
- **Build command:**
  `npm install --prefix server && npm install --prefix client && npm run build --prefix client && npm run seed --prefix server`
- **Start command:** `npm start --prefix server`
- **Environment:** `NODE_VERSION=20.11.0`

> Because `client/dist` exists in production, Express automatically serves the UI
> and falls back to `index.html` for client‑side routes.

### Split deployment (frontend and API separately)

- Deploy `server/` to Render/Railway → get its public URL.
- Deploy `client/` to Vercel/Netlify with build `npm run build`, output `dist`,
  and env var `VITE_API_URL=https://your-api-url`.

---

## 🧠 Technology choices & reasoning

- **React + Vite** — fast dev server/HMR and a tiny, modern build. React Router
  gives clean navigation between Dashboard, Projects, and Detail views.
- **Tailwind CSS** — rapid, consistent styling; the dark palette is defined once
  in `tailwind.config.js` and reused via component classes in `index.css`.
- **Express** — minimal, explicit routing. Routes are split into `projects.js`
  and `tasks.js` (tasks nested under projects) to mirror the data relationship.
- **SQLite via better‑sqlite3** — zero external DB server, so the project "just
  runs". It's synchronous (simpler code, no callback/promise noise) and fast for
  this workload. Schema uses a real foreign key with `ON DELETE CASCADE`.

---

## 🧩 Challenges & notes

- **Route ordering:** `/api/projects/summary` had to be declared *before*
  `/api/projects/:id` so Express doesn't treat `"summary"` as an id.
- **Cascading deletes:** SQLite doesn't enforce foreign keys by default —
  `PRAGMA foreign_keys = ON` is set on every connection so deleting a project
  removes its tasks automatically.
- **One URL vs two:** the API client uses relative `/api` paths so the same code
  works in dev (Vite proxy), single‑service prod (Express static), and split
  deploys (via `VITE_API_URL`).
- **"Pending" definition:** the dashboard treats *pending tasks* as everything
  not yet `Completed` (i.e. Pending + In Progress), which matches the brief's
  "completed vs pending" framing.

---

## 🤖 Use of AI tools

AI assistance (an LLM coding assistant) was used to scaffold boilerplate,
draft repetitive CRUD handlers, and speed up the Tailwind styling. Every piece
of code was reviewed, understood, and validated by:

- Running the seed script and confirming row counts (10 projects, 20 tasks).
- Exercising each endpoint with `curl` (list, filter, get‑with‑tasks, create,
  update, delete, toggle) and checking status codes and payloads.
- Building the frontend (`vite build`) with no errors and manually testing the
  full flow: dashboard metrics, filtering, add/edit/delete project, project
  detail, and task add/edit/delete/toggle with loading and error states.

I understand every part of this codebase and can walk through any design or
implementation decision on request.

---

## 📄 License

MIT
