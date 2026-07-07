import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/projects', label: 'Projects' },
];

/** App shell: top navigation + routed page content. */
export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 font-bold text-white">
              E
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-slate-100">EnvisionStudio</div>
              <div className="text-[11px] text-slate-500">Project Management</div>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ink-700 text-white'
                      : 'text-slate-400 hover:bg-ink-800 hover:text-slate-200'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-ink-600/60 py-6 text-center text-xs text-slate-600">
        Built for the EnvisionStudio Web Developer assessment · React + Express + SQLite
      </footer>
    </div>
  );
}
