import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import BrandMark from './BrandMark.jsx'
import { canMenu } from '../lib/permissions.js'
import { tr, useLang } from '../lib/i18n.jsx'
import { useRegistrationOpen } from '../lib/registration.js'

const ICONS = {
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 13v3',
  dashboard: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  participants: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6',
  checkpoints: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  staff: 'M12 3 20 6v6c0 5-3.4 8.3-8 9.5C7.4 20.3 4 17 4 12V6ZM9 12l2 2 4-4',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  register: 'M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6',
  signout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
}

function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export default function Layout() {
  const { profile } = useAuth()

  const links = [
    { to: '/scan', label: 'Scan', icon: 'scan', menu: 'scan' },
    { to: '/admin', label: 'Monitoring', icon: 'dashboard', end: true, menu: 'dashboard' },
    { to: '/admin/participants', label: tr('Peserta', 'Participants'), icon: 'participants', menu: 'participants' },
  ].filter((l) => canMenu(profile, l.menu))

  return (
    <div className={`shell ${links.length > 1 ? 'has-tabs' : ''}`}>
      <header className="topbar">
        <Link className="brand" to="/" aria-label={tr('MSF 2026, ke halaman utama', 'MSF 2026, go to the home page')}>
          <BrandMark size={34} />
          <div className="brand-text">
            <span className="brand-name">MSF 2026</span>
            <span className="brand-sub">Checkpoint</span>
          </div>
        </Link>
        {links.length > 1 && (
          <nav className="tabs" aria-label={tr('Menu utama', 'Main menu')}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                <Icon name={l.icon} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
        <SettingsMenu />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

// Ikon pengaturan di kanan atas: bahasa, menu khusus admin, dan keluar
function SettingsMenu() {
  const { profile, signOut } = useAuth()
  const { lang, setLang } = useLang()
  const isAdmin = profile?.role === 'admin'
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !box.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="settings" ref={box}>
      <button
        className={`settings-btn ${open ? 'open' : ''}`}
        aria-label={tr('Pengaturan', 'Settings')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="settings" />
      </button>
      {open && (
        <div className="settings-menu" role="menu">
          <div className="settings-who">
            <strong>{profile?.full_name}</strong>
            <span>{profile?.email}</span>
          </div>
          <div className="settings-lang" role="group" aria-label={tr('Bahasa', 'Language')}>
            <span>{tr('Bahasa', 'Language')}</span>
            <div className="segmented">
              <button className={lang === 'id' ? 'active' : ''} aria-pressed={lang === 'id'} onClick={() => setLang('id')}>IDN</button>
              <button className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>ENG</button>
            </div>
          </div>
          {isAdmin && (
            <>
              <RegistrationToggle />
              <Link role="menuitem" to="/admin/checkpoints" className="settings-item">
                <Icon name="checkpoints" size={20} />
                Checkpoint
              </Link>
              <Link role="menuitem" to="/admin/staff" className="settings-item">
                <Icon name="staff" size={20} />
                {tr('Petugas', 'Staff')}
              </Link>
            </>
          )}
          <button role="menuitem" className="settings-item danger" onClick={signOut}>
            <Icon name="signout" size={20} />
            {tr('Keluar', 'Sign out')}
          </button>
        </div>
      )}
    </div>
  )
}

// Buka/tutup halaman registrasi publik. Saat ditutup, tombol registrasi di landing page hilang
// dan /register menampilkan pemberitahuan bahwa pendaftaran telah ditutup.
function RegistrationToggle() {
  const { open, setOpen } = useRegistrationOpen()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function toggle() {
    setBusy(true)
    setError('')
    const message = await setOpen(!open)
    setBusy(false)
    if (message) setError(tr(`Gagal mengubah status registrasi: ${message}`, `Could not change the registration status: ${message}`))
  }

  return (
    <>
      <button
        role="menuitemcheckbox"
        aria-checked={open === true}
        className="settings-item settings-toggle"
        disabled={open === null || busy}
        onClick={toggle}
      >
        <Icon name="register" size={20} />
        <span>
          {tr('Registrasi peserta', 'Participant registration')}
          <small>{open === null ? tr('Memuat…', 'Loading…') : open ? tr('Dibuka untuk umum', 'Open to the public') : tr('Ditutup', 'Closed')}</small>
        </span>
        <span className={`switch ${open ? 'on' : ''}`} aria-hidden="true" />
      </button>
      {error && <p className="settings-error" role="alert">{error}</p>}
    </>
  )
}
