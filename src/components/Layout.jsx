import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import BrandMark from './BrandMark.jsx'
import { canMenu } from '../lib/permissions.js'

const ICONS = {
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 13v3',
  dashboard: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  participants: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6',
  checkpoints: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  staff: 'M12 3 20 6v6c0 5-3.4 8.3-8 9.5C7.4 20.3 4 17 4 12V6ZM9 12l2 2 4-4',
}

function Icon({ name }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const links = [
    ...[
      { to: '/scan', label: 'Scan', icon: 'scan', menu: 'scan' },
      { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true, menu: 'dashboard' },
      { to: '/admin/participants', label: 'Peserta', icon: 'participants', menu: 'participants' },
    ].filter((l) => canMenu(profile, l.menu)),
    ...(isAdmin
      ? [
          { to: '/admin/checkpoints', label: 'Checkpoint', icon: 'checkpoints' },
          { to: '/admin/staff', label: 'Petugas', icon: 'staff' },
        ]
      : []),
  ]

  return (
    <div className={`shell ${links.length > 1 ? 'has-tabs' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <BrandMark size={30} />
          <div className="brand-text">
            <span className="brand-name">MSF 2026</span>
            <span className="brand-sub">Checkpoint</span>
          </div>
        </div>
        {links.length > 1 && (
          <nav className="tabs" aria-label="Menu utama">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                <Icon name={l.icon} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
        <div className="who">
          <span className="who-name">{profile?.full_name}</span>
          <button className="btn-ghost" onClick={signOut}>Keluar</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
