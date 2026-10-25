import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { tr, useLang } from '../../lib/i18n.jsx'
import { useAuth } from '../../lib/auth.jsx'
import BrandMark from '../../components/BrandMark.jsx'
import {
  ATTEND, COMMUNITY, EVENT, FAQ, GAINS, INTRO, PARTNERS, PARTNERS_TEXT, PROGRAMME, ROUTES,
  SESSION_ROOM, SPEAKERS, SPEAKER_ORDER,
} from './content.js'
import './home.css'

const L = (x) => (typeof x === 'string' ? x : tr(x.id, x.en))

const NAV = [
  { id: 'programme', label: { id: 'Agenda', en: 'Programme' } },
  { id: 'speakers', label: { id: 'Pembicara', en: 'Speakers' } },
  { id: 'partners', label: { id: 'Partner', en: 'Partners' } },
  { id: 'venue', label: { id: 'Lokasi', en: 'Venue' } },
  { id: 'faq', label: 'FAQ' },
]

const ICON = {
  calendar: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  chat: 'M4 20l1.5-4A8 8 0 1 1 8 18.5L4 20Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  check: 'm5 12 4 4 10-10',
  plane: 'M10.5 13.5 3 11l1.5-1.5 7.5 1 4-4a2 2 0 0 1 3 3l-4 4 1 7.5L15.5 22 13 14.5',
  train: 'M7 3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM4 10h16M8 21l2-4M16 21l-2-4M8 14h.01M16 14h.01',
  car: 'M5 16h14M6 16l1.5-5h9L18 16M5 16v3M19 16v3M8 13.5h.01M16 13.5h.01',
  // Ikon bagian Manfaat
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
  mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8',
  book: 'M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h14M8 7h8M8 11h5',
  shield: 'M12 3 20 6v6c0 5-3.4 8.3-8 9.5C7.4 20.3 4 17 4 12V6l8-3ZM9 12l2 2 4-4',
  network: 'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM19 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 8v4l-5.3 4.4M12 12l5.3 4.4',
  link: 'M9 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM15 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  // Ikon bagian Siapa yang sebaiknya hadir
  ship: 'M3.5 15h17l-2 4h-13l-2-4ZM6.5 15v-5h11v5M10 10V6h4v4M2 21.5c1.7 0 2.3-1 4-1s2.3 1 4 1 2.3-1 4-1 2.3 1 4 1 2.3-1 4-1',
  shieldPlain: 'M12 3 20 6v6c0 5-3.4 8.3-8 9.5C7.4 20.3 4 17 4 12V6l8-3Z',
  crane: 'M6 21V3M10 21V3M6 7l4-4M6 11l4-4M6 15l4-4M3 3h18M18 3v5M16 8h4v3h-4ZM14 21v-5h8v5M2 21h20',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  anchor: 'M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 8v13M8.5 11h7M4 13a8 8 0 0 0 16 0M2.5 14.5 4 13l1.5 1.5M18.5 14.5 20 13l1.5 1.5',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12l7-7M16 5h3v3',
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1ZM8 11V8a4 4 0 0 1 8 0v3M12 15v2',
  lifebuoy: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6',
  chip: 'M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM10 10h4v4h-4ZM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  bookOpen: 'M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2V5ZM22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V5Z',
}

// Ornamen latar bertema keamanan maritim: radar, gelombang, jalur pelayaran, mata angin
function Deco({ kind, className = '' }) {
  const common = { className: `lp-deco lp-deco-${kind} ${className}`, 'aria-hidden': true, focusable: 'false', fill: 'none', stroke: 'currentColor' }
  if (kind === 'radar') {
    return (
      <svg {...common} viewBox="0 0 400 400" strokeWidth="1.2">
        {[50, 95, 140, 185].map((r) => <circle key={r} cx="200" cy="200" r={r} />)}
        <path d="M200 10v380M10 200h380M66 66l268 268M334 66 66 334" strokeDasharray="3 7" />
        <path d="M200 200 200 15A185 185 0 0 1 353 96Z" fill="currentColor" fillOpacity="0.18" stroke="none" />
        <circle cx="262" cy="118" r="4" fill="currentColor" />
        <circle cx="140" cy="250" r="3" fill="currentColor" />
        <circle cx="300" cy="230" r="3" fill="currentColor" />
      </svg>
    )
  }
  if (kind === 'waves') {
    return (
      <svg {...common} viewBox="0 0 1200 220" preserveAspectRatio="none" strokeWidth="1.4">
        {[0, 28, 56, 84, 112].map((y, i) => (
          <path key={y} d={`M0 ${100 + y}C150 ${60 + y} 300 ${150 + y} 450 ${100 + y}S750 ${50 + y} 900 ${100 + y}S1150 ${150 + y} 1200 ${90 + y}`} opacity={1 - i * 0.16} />
        ))}
      </svg>
    )
  }
  if (kind === 'route') {
    return (
      <svg {...common} viewBox="0 0 600 320" strokeWidth="1.4">
        <defs>
          <pattern id={`lp-dots-${className}`} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="currentColor" stroke="none" />
          </pattern>
        </defs>
        <rect width="600" height="320" fill={`url(#lp-dots-${className})`} stroke="none" opacity="0.6" />
        <path d="M30 280C140 240 170 120 300 140S470 70 570 40" strokeDasharray="7 8" strokeWidth="2" />
        {[[30, 280], [300, 140], [570, 40]].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="7" fill="currentColor" fillOpacity="0.25" />
            <circle cx={x} cy={y} r="16" />
          </g>
        ))}
      </svg>
    )
  }
  return (
    <svg {...common} viewBox="0 0 200 200" strokeWidth="1.2">
      <circle cx="100" cy="100" r="92" />
      <circle cx="100" cy="100" r="74" strokeDasharray="2 6" />
      <path d="M100 6 112 100 100 194 88 100ZM6 100l94-12 94 12-94 12Z" />
      <path d="M100 6v188M6 100h188" opacity="0.5" />
      <path d="m100 40 6 54 54 6-54 6-6 54-6-54-54-6 54-6Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  )
}

function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON[name]} />
    </svg>
  )
}

export default function Home() {
  const [speaker, setSpeaker] = useState(null)

  useEffect(() => {
    const prev = document.title
    document.title = 'Maritime Security Forum 2026 · Cirebon, 29–30 October 2026'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="lp">
      <a className="lp-skip" href="#main">{tr('Lewati ke konten', 'Skip to content')}</a>
      <Header />
      <main id="main">
        <Hero />
        <Gains />
        <Programme onSpeaker={setSpeaker} />
        <Speakers onSpeaker={setSpeaker} />
        <Attend />
        <Partners />
        <Venue />
        <Faq />
        <Community />
      </main>
      <Footer />
      <SpeakerDialog speakerKey={speaker} onClose={() => setSpeaker(null)} />
    </div>
  )
}

function StaffButton({ className = '' }) {
  const { session } = useAuth()
  return session ? (
    <Link className={`lp-btn lp-btn-ghost ${className}`} to="/app">
      <Icon name="user" size={18} />
      {tr('Buka aplikasi', 'Open app')}
    </Link>
  ) : (
    <Link className={`lp-btn lp-btn-ghost ${className}`} to="/login">
      <Icon name="user" size={18} />
      {tr('Masuk petugas', 'Staff sign in')}
    </Link>
  )
}

function LangSwitch() {
  const { lang, setLang } = useLang()
  return (
    <div className="lp-lang" role="group" aria-label={tr('Bahasa', 'Language')}>
      <button className={lang === 'id' ? 'active' : ''} aria-pressed={lang === 'id'} onClick={() => setLang('id')}>ID</button>
      <button className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`lp-header ${scrolled || open ? 'solid' : ''}`}>
      <div className="lp-wrap lp-header-row">
        <a className="lp-brand" href="#top" aria-label="Maritime Security Forum 2026" onClick={() => setOpen(false)}>
          <BrandMark size={34} />
          <span>
            <b>Maritime Security</b>
            <small>Forum 2026</small>
          </span>
        </a>
        <nav className="lp-nav" aria-label={tr('Navigasi halaman', 'Page navigation')}>
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`}>{L(n.label)}</a>)}
        </nav>
        <div className="lp-header-actions">
          <LangSwitch />
          <StaffButton className="lp-hide-sm" />
          <button
            className="lp-menu-btn"
            aria-label={open ? tr('Tutup menu', 'Close menu') : tr('Buka menu', 'Open menu')}
            aria-expanded={open}
            aria-controls="lp-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="lp-mobile-nav" className="lp-mobile-nav" aria-label={tr('Navigasi halaman', 'Page navigation')}>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {L(n.label)}
              <Icon name="arrow" size={18} />
            </a>
          ))}
          <div className="lp-mobile-cta">
            <StaffButton />
          </div>
        </nav>
      )}
    </header>
  )
}

// Hitung mundur ke sesi pertama; berganti status saat acara berlangsung dan sesudahnya
function useCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const start = Date.parse(EVENT.start)
  const end = Date.parse(EVENT.end)
  if (now >= end) return { phase: 'after' }
  if (now >= start) return { phase: 'live' }
  const mins = Math.floor((start - now) / 60000)
  return { phase: 'before', days: Math.floor(mins / 1440), hours: Math.floor((mins % 1440) / 60), minutes: mins % 60 }
}

function Countdown() {
  const c = useCountdown()
  if (c.phase === 'live') return <p className="lp-status live">{tr('Forum sedang berlangsung', 'The forum is live now')}</p>
  if (c.phase === 'after') return <p className="lp-status">{tr('Terima kasih atas partisipasi Anda di MSF 2026', 'Thank you for joining MSF 2026')}</p>
  const units = [
    [c.days, tr('hari', c.days === 1 ? 'day' : 'days')],
    [c.hours, tr('jam', c.hours === 1 ? 'hour' : 'hours')],
    [c.minutes, tr('menit', c.minutes === 1 ? 'minute' : 'minutes')],
  ]
  return (
    <div className="lp-countdown" role="timer" aria-label={tr('Hitung mundur ke pembukaan', 'Countdown to opening')}>
      <span className="lp-countdown-label">{tr('Dimulai dalam', 'Starts in')}</span>
      <div className="lp-countdown-units">
        {units.map(([v, u]) => (
          <span key={u}>
            <b>{String(v).padStart(2, '0')}</b>
            <small>{u}</small>
          </span>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  const sessions = PROGRAMME.reduce((n, d) => n + d.sessions.length, 0)
  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-bg" aria-hidden="true" />
      <div className="lp-wrap lp-hero-grid">
        <div className="lp-hero-copy">
          <div className="lp-organizers">
            <img src="/landing/logos/danantara.webp" alt="Danantara Indonesia" width="120" height="40" />
            <span aria-hidden="true" />
            <img src="/landing/logos/pertamina-patra-niaga.webp" alt="Pertamina Patra Niaga" width="120" height="40" />
          </div>
          <p className="lp-eyebrow">Cirebon · 29–30 {tr('Oktober', 'October')} 2026</p>
          <h1>
            Maritime Security <span>Forum 2026</span>
          </h1>
          <p className="lp-theme">
            <b>Navigating Uncertainty:</b> Building Resilient Maritime Security in a Changing Risk Landscape
          </p>
          <p className="lp-lead">{L(INTRO)}</p>
          <div className="lp-hero-cta">
            <a className="lp-btn lp-btn-primary lp-btn-lg" href="#programme">
              {tr('Lihat agenda', 'View programme')}
              <Icon name="arrow" size={18} />
            </a>
            <a className="lp-btn lp-btn-ghost lp-btn-lg" href="#speakers">
              {tr('Lihat pembicara', 'Meet the speakers')}
            </a>
          </div>
        </div>
        <aside className="lp-hero-card" aria-label={tr('Ringkasan acara', 'Event summary')}>
          <Countdown />
          <ul className="lp-facts">
            <li>
              <Icon name="calendar" />
              <span>
                <b>29–30 {tr('Oktober', 'October')} 2026</b>
                <small>{tr('Dua hari forum', 'Two-day forum')}</small>
              </span>
            </li>
            <li>
              <Icon name="pin" />
              <span>
                <b>{EVENT.venue}</b>
                <small>{SESSION_ROOM} · Cirebon, {tr('Jawa Barat', 'West Java')}</small>
              </span>
            </li>
          </ul>
          <dl className="lp-stats">
            <div><dt>{tr('Pembicara', 'Speakers')}</dt><dd>{Object.keys(SPEAKERS).length}</dd></div>
            <div><dt>{tr('Sesi', 'Sessions')}</dt><dd>{sessions}</dd></div>
            <div><dt>Partner</dt><dd>{PARTNERS.length}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  )
}

function SectionHead({ eyebrow, title, intro }) {
  return (
    <div className="lp-section-head">
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  )
}

function Gains() {
  return (
    <section className="lp-section lp-light">
      <Deco kind="waves" className="lp-deco-bottom" />
      <Deco kind="compass" className="lp-deco-tr" />
      <div className="lp-wrap">
        <SectionHead eyebrow={tr('Manfaat', 'Benefits')} title={tr('Yang akan Anda dapatkan', 'What you will gain')} />
        <ol className="lp-gains">
          {GAINS.map((g, i) => (
            <li key={i}>
              <div className="lp-gain-top">
                <span className="lp-gain-icon"><Icon name={g.icon} size={26} /></span>
                <span className="lp-gain-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{L(g.title)}</h3>
              <p>{L(g.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Programme({ onSpeaker }) {
  // Hari kedua dibuka otomatis saat tanggalnya tiba
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  const [day, setDay] = useState(() => (PROGRAMME.find((d) => d.date === today) ?? PROGRAMME[0]).key)
  const current = PROGRAMME.find((d) => d.key === day)

  return (
    <section className="lp-section lp-dark-section" id="programme">
      <Deco kind="radar" className="lp-deco-tr lp-deco-lg" />
      <div className="lp-wrap">
        <SectionHead
          eyebrow={tr('Agenda acara', 'Event programme')}
          title={tr('Dua hari perspektif pakar', 'Two days of expert perspectives')}
          intro={tr(
            'Dialog strategis dan kolaborasi keamanan maritim. Semua sesi di ' + SESSION_ROOM + ', ' + EVENT.venue + '.',
            'Strategic dialogue and maritime security collaboration. All sessions in ' + SESSION_ROOM + ', ' + EVENT.venue + '.'
          )}
        />
        <div className="lp-tabs" role="tablist" aria-label={tr('Pilih hari', 'Choose a day')}>
          {PROGRAMME.map((d) => (
            <button
              key={d.key}
              role="tab"
              id={`tab-${d.key}`}
              aria-selected={day === d.key}
              aria-controls={`panel-${d.key}`}
              className={day === d.key ? 'active' : ''}
              onClick={() => setDay(d.key)}
            >
              <b>{L(d.day)}</b>
              <small>{L(d.when)}</small>
            </button>
          ))}
        </div>
        <ol className="lp-agenda" id={`panel-${current.key}`} role="tabpanel" aria-labelledby={`tab-${current.key}`}>
          {current.sessions.map((s) => (
            <li key={s.time}>
              <time>
                <Icon name="clock" size={16} />
                {s.time}
              </time>
              <div className="lp-agenda-body">
                {s.kind && <span className="lp-tag">{L(s.kind)}</span>}
                {!s.kind && <h3>{s.title}</h3>}
                <div className="lp-agenda-speakers">
                  {s.speakers.map((k) => {
                    const p = SPEAKERS[k]
                    return (
                      <button key={k} className="lp-person" onClick={() => onSpeaker(k)}>
                        <img src={p.photo} alt="" loading="lazy" width="44" height="44" />
                        <span>
                          <b>{p.name}</b>
                          <small>{p.role}, {p.org}</small>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Speakers({ onSpeaker }) {
  return (
    <section className="lp-section lp-light" id="speakers">
      <Deco kind="route" className="lp-deco-tr" />
      <div className="lp-wrap">
        <SectionHead
          eyebrow={tr('Pembicara', 'Speakers')}
          title={tr('Pembicara MSF 2026', 'Featured speakers')}
          intro={tr('Ketuk pembicara untuk melihat profil dan jadwal sesinya.', 'Tap a speaker to see their profile and session.')}
        />
        <ul className="lp-speakers">
          {SPEAKER_ORDER.map((k) => {
            const p = SPEAKERS[k]
            return (
              <li key={k}>
                <button onClick={() => onSpeaker(k)} aria-haspopup="dialog">
                  <img src={p.photo} alt="" loading="lazy" width="400" height="400" />
                  <span className="lp-speaker-text">
                    <b>{p.name}</b>
                    <small>{p.role}</small>
                    <em>{p.org}</em>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function SpeakerDialog({ speakerKey, onClose }) {
  const ref = useRef(null)
  const p = speakerKey ? SPEAKERS[speakerKey] : null
  const slots = speakerKey
    ? PROGRAMME.flatMap((d) => d.sessions.filter((s) => s.speakers.includes(speakerKey)).map((s) => ({ day: d, s })))
    : []

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (p && !d.open) d.showModal()
    if (!p && d.open) d.close()
  }, [p])

  return (
    <dialog
      ref={ref}
      className="lp-dialog"
      aria-labelledby="lp-dialog-name"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {p && (
        <div className="lp-dialog-inner">
          <button className="lp-dialog-close" onClick={onClose} aria-label={tr('Tutup', 'Close')} autoFocus>
            <Icon name="close" size={22} />
          </button>
          <div className="lp-dialog-head">
            <img src={p.photo} alt="" width="120" height="120" />
            <div>
              <h2 id="lp-dialog-name">{p.name}</h2>
              <p>{p.role}</p>
              <p className="lp-dialog-org">{p.org}</p>
            </div>
          </div>
          {slots.map(({ day, s }) => (
            <div key={s.time} className="lp-dialog-slot">
              <p className="lp-eyebrow">{tr('Berbicara di', 'Speaking at')}</p>
              <p className="lp-dialog-title">{s.kind ? L(s.kind) : s.title}</p>
              <p className="lp-dialog-meta">
                <Icon name="calendar" size={16} /> {L(day.day)} · {L(day.when)} · {s.time} WIB
              </p>
              <p className="lp-dialog-meta">
                <Icon name="pin" size={16} /> {SESSION_ROOM}, {EVENT.venue}
              </p>
            </div>
          ))}
          {p.bio.length > 0 && (
            <div className="lp-dialog-bio">
              {p.bio.map((b, i) => <p key={i}>{b}</p>)}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}

function Attend() {
  return (
    <section className="lp-section lp-dark lp-attend-section">
      <img className="lp-attend-photo" src="/landing/banner.webp" alt="" loading="lazy" width="1400" height="630" />
      <Deco kind="waves" className="lp-deco-wave-top" />
      <Deco kind="waves" className="lp-deco-wave-mid" />
      <Deco kind="waves" className="lp-deco-bottom" />
      <div className="lp-wrap">
        <div className="lp-attend-head">
          <p className="lp-eyebrow lp-eyebrow-line">{tr('Komunitas kami', 'Our community')}</p>
          <h2>
            {tr('Siapa yang sebaiknya', 'Who should')} <span>{tr('hadir', 'attend')}</span>
          </h2>
          <p>
            {tr(
              'Terhubung dengan para profesional yang membangun operasi maritim yang lebih aman dan tangguh.',
              'Connect with the people shaping safer, more resilient maritime operations.'
            )}
          </p>
        </div>
        <ul className="lp-attend-grid">
          {ATTEND.map((a, i) => (
            <li key={i}>
              <span className="lp-attend-icon"><Icon name={a.icon} size={28} /></span>
              <div>
                <h3>{L(a.title)}</h3>
                <p>{L(a.desc)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Partners() {
  return (
    <section className="lp-section lp-dark-section" id="partners">
      <Deco kind="waves" className="lp-deco-bottom" />
      <div className="lp-wrap">
        <SectionHead eyebrow="MSF 2026" title={tr('Partner kami', 'Our partners')} intro={L(PARTNERS_TEXT)} />
        <ul className="lp-partners">
          {PARTNERS.map((p) => (
            <li key={p.name}>
              <img src={p.logo} alt={p.name} loading="lazy" width="200" height="80" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Venue() {
  const routeIcons = ['plane', 'train', 'car']
  return (
    <section className="lp-section lp-light" id="venue">
      <Deco kind="route" className="lp-deco-bl" />
      <div className="lp-wrap lp-venue">
        <div className="lp-venue-card lp-dark">
          <img
            className="lp-venue-photo"
            src="/landing/venue.jpg"
            alt={tr('Gedung Patra Cirebon Hotel & Convention', 'Patra Cirebon Hotel & Convention building')}
            loading="lazy"
            width="678"
            height="452"
          />
          <Deco kind="compass" className="lp-deco-card" />
          <SectionHead eyebrow={tr('Lokasi', 'Venue')} title={EVENT.venue} />
          <p className="lp-venue-room">{SESSION_ROOM}</p>
          <address>{EVENT.address}</address>
          <a className="lp-btn lp-btn-primary" href={EVENT.mapUrl} target="_blank" rel="noreferrer">
            <Icon name="pin" size={18} />
            {tr('Buka di Google Maps', 'Open in Google Maps')}
          </a>
        </div>
        <div>
          <h3 className="lp-venue-sub">{tr('Rute dari Jakarta', 'Getting there from Jakarta')}</h3>
          <ol className="lp-routes">
            {ROUTES.map((r, i) => (
              <li key={i}>
                <span className="lp-route-icon"><Icon name={routeIcons[i]} /></span>
                <div>
                  <h4>{L(r.title)}</h4>
                  {r.options.map((o, j) => (
                    <p key={j}>
                      {o.label && <b>{L(o.label)}: </b>}
                      {L(o.body)}
                      {o.link === 'train' && (
                        <>
                          {' '}
                          <a href={EVENT.trainUrl} target="_blank" rel="noreferrer">{tr('Pesan tiket di KAI Access', 'Book tickets on KAI Access')}</a>
                        </>
                      )}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const [all, setAll] = useState(false)
  const shown = all ? FAQ : FAQ.slice(0, 6)
  return (
    <section className="lp-section lp-dark-section" id="faq">
      <Deco kind="radar" className="lp-deco-bl lp-deco-lg" />
      <div className="lp-wrap lp-faq-wrap">
        <SectionHead eyebrow="FAQ" title={tr('Pertanyaan yang sering diajukan', 'Frequently asked questions')} />
        <div className="lp-faq">
          {shown.map((f, i) => (
            <details key={i}>
              <summary>{L(f.q)}</summary>
              <div className="lp-faq-body">
                {f.a?.map((p, j) => <p key={j}>{L(p)}</p>)}
                {f.list && (
                  <ul>
                    {f.list.map((x, j) => <li key={j}>{L(x)}</li>)}
                  </ul>
                )}
              </div>
            </details>
          ))}
        </div>
        {!all && (
          <button className="lp-btn lp-btn-ghost lp-faq-more" onClick={() => setAll(true)}>
            {tr(`Lihat semua ${FAQ.length} pertanyaan`, `Show all ${FAQ.length} questions`)}
          </button>
        )}
      </div>
    </section>
  )
}

function Community() {
  return (
    <section className="lp-section lp-light">
      <div className="lp-wrap">
        <div className="lp-community lp-dark">
          <Deco kind="compass" className="lp-deco-card" />
          <div>
            <h2>{L(COMMUNITY.title)}</h2>
            <p>{L(COMMUNITY.body)}</p>
          </div>
          <div className="lp-community-cta">
            <a className="lp-btn lp-btn-primary lp-btn-lg" href={EVENT.whatsappUrl} target="_blank" rel="noreferrer">
              <Icon name="chat" size={18} />
              {tr('Gabung grup WhatsApp', 'Join the WhatsApp group')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer-grid">
        <div>
          <div className="lp-brand">
            <BrandMark size={34} />
            <span>
              <b>Maritime Security</b>
              <small>Forum 2026</small>
            </span>
          </div>
          <p>{EVENT.theme}</p>
          <div className="lp-organizers">
            <img src="/landing/logos/danantara.webp" alt="Danantara Indonesia" width="120" height="40" loading="lazy" />
            <span aria-hidden="true" />
            <img src="/landing/logos/pertamina-patra-niaga.webp" alt="Pertamina Patra Niaga" width="120" height="40" loading="lazy" />
          </div>
        </div>
        <nav aria-label={tr('Tautan footer', 'Footer links')}>
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`}>{L(n.label)}</a>)}
        </nav>
        <div className="lp-footer-cta">
          <StaffButton />
        </div>
      </div>
      <p className="lp-wrap lp-copy">© Maritime Security Forum 2026 · Patra Cirebon Hotel & Convention, Cirebon</p>
    </footer>
  )
}
