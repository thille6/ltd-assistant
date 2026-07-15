import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/match/new', label: 'Ny match' },
  { to: '/journal', label: 'Journal' },
  { to: '/settings', label: 'Inställningar' },
  { to: '/backup', label: 'Backup' },
]

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LTD Assistant Version 1</p>
          <h1>Lokal LTD-operatör</h1>
        </div>
        <nav className="main-nav" aria-label="Huvudnavigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  )
}
