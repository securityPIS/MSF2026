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
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
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
          <a className="lp-btn lp-btn-primary lp-hide-sm" href={EVENT.registerUrl} target="_blank" rel="noreferrer">
            {tr('Daftar', 'Register')}
          </a>
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
            <a className="lp-btn lp-btn-primary" href={EVENT.registerUrl} target="_blank" rel="noreferrer">
              {tr('Daftar sekarang', 'Register now')}
              <Icon name="external" size={18} />
            </a>
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
            <a className="lp-btn lp-btn-primary lp-btn-lg" href={EVENT.registerUrl} target="_blank" rel="noreferrer">
              {tr('Daftar sekarang', 'Register now')}
              <Icon name="external" size={18} />
            </a>
            <a className="lp-btn lp-btn-ghost lp-btn-lg" href="#programme">
              {tr('Lihat agenda', 'View programme')}
              <Icon name="arrow" size={18} />
            </a>
          </div>
          <p className="lp-seats">{tr('Kursi terbatas', 'Limited seats')}</p>
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
    <section className="lp-section lp-section-alt">
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
    <section className="lp-section" id="programme">
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
    <section className="lp-section lp-section-alt" id="speakers">
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
    <section className="lp-section">
      <div className="lp-wrap lp-attend">
        <div className="lp-attend-intro">
          <SectionHead
            eyebrow={tr('Peserta', 'Audience')}
            title={tr('Siapa yang sebaiknya hadir', 'Who should attend')}
            intro={tr(
              'Keamanan maritim kini lintas fungsi. Forum ini relevan untuk siapa pun yang melindungi, mengelola, mengatur, atau mendukung operasi maritim.',
              'Maritime security is now cross-functional. The forum is relevant to anyone who protects, manages, regulates, or enables maritime operations.'
            )}
          />
          <img
            className="lp-attend-img"
            src="/landing/banner.webp"
            alt={tr('Tim keamanan maritim di pelabuhan energi saat malam', 'Maritime security team at an energy port at night')}
            loading="lazy"
            width="1400"
            height="630"
          />
        </div>
        <ul className="lp-attend-list">
          {ATTEND.map((a, i) => (
            <li key={i}>
              <Icon name="check" size={18} />
              {L(a)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Partners() {
  return (
    <section className="lp-section lp-section-alt" id="partners">
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
    <section className="lp-section" id="venue">
      <div className="lp-wrap lp-venue">
        <div className="lp-venue-card">
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
    <section className="lp-section lp-section-alt" id="faq">
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
    <section className="lp-section">
      <div className="lp-wrap">
        <div className="lp-community">
          <div>
            <h2>{L(COMMUNITY.title)}</h2>
            <p>{L(COMMUNITY.body)}</p>
          </div>
          <div className="lp-community-cta">
            <a className="lp-btn lp-btn-primary lp-btn-lg" href={EVENT.registerUrl} target="_blank" rel="noreferrer">
              {tr('Daftar forum', 'Register for the forum')}
              <Icon name="external" size={18} />
            </a>
            <a className="lp-btn lp-btn-ghost lp-btn-lg" href={EVENT.whatsappUrl} target="_blank" rel="noreferrer">
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
          <a className="lp-btn lp-btn-primary" href={EVENT.registerUrl} target="_blank" rel="noreferrer">
            {tr('Daftar sekarang', 'Register now')}
          </a>
          <StaffButton />
        </div>
      </div>
      <p className="lp-wrap lp-copy">© Maritime Security Forum 2026 · Patra Cirebon Hotel & Convention, Cirebon</p>
    </footer>
  )
}
