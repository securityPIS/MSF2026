import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { demo, supabase } from '../lib/supabase.js'
import { tr, useLang } from '../lib/i18n.jsx'
import { formatTime } from '../lib/format.js'
import BrandMark from '../components/BrandMark.jsx'
import { downloadCertificate, renderCertificate } from '../lib/certificate.js'
import { PROGRAMME } from './home/content.js'

// Pertanyaan contoh (dummy) untuk feedback MSF 2026. Jawaban disimpan apa adanya di kolom feedback.answers.
const L = (x) => tr(x.id, x.en)
const SESSIONS = PROGRAMME.flatMap((d) => d.sessions.filter((s) => !s.kind).map((s) => s.title))
const QUESTIONS = [
  { key: 'overall', type: 'rating', label: { id: 'Secara keseluruhan, bagaimana penilaian Anda terhadap MSF 2026?', en: 'Overall, how would you rate MSF 2026?' } },
  { key: 'content', type: 'rating', label: { id: 'Seberapa relevan materi forum dengan pekerjaan Anda?', en: 'How relevant was the content to your work?' } },
  { key: 'speakers', type: 'rating', label: { id: 'Bagaimana kualitas para pembicara?', en: 'How would you rate the speakers?' } },
  { key: 'organization', type: 'rating', label: { id: 'Bagaimana penyelenggaraan acara dan venue?', en: 'How would you rate the organisation and venue?' } },
  {
    key: 'best_session', type: 'select',
    label: { id: 'Sesi mana yang paling bermanfaat bagi Anda?', en: 'Which session was most valuable to you?' },
    options: SESSIONS.map((s) => ({ value: s, label: { id: s, en: s } })),
  },
  {
    key: 'attend_next', type: 'choice',
    label: { id: 'Apakah Anda akan hadir di Maritime Security Forum berikutnya?', en: 'Would you attend the next Maritime Security Forum?' },
    options: [
      { value: 'yes', label: { id: 'Ya', en: 'Yes' } },
      { value: 'maybe', label: { id: 'Mungkin', en: 'Maybe' } },
      { value: 'no', label: { id: 'Tidak', en: 'No' } },
    ],
  },
  { key: 'topics', type: 'text', optional: true, label: { id: 'Topik apa yang ingin dibahas di forum berikutnya?', en: 'What topics would you like at the next forum?' } },
  { key: 'suggestion', type: 'text', optional: true, label: { id: 'Saran untuk panitia', en: 'Suggestions for the organisers' } },
]
const RATING_ENDS = { low: { id: 'Sangat kurang', en: 'Very poor' }, high: { id: 'Sangat baik', en: 'Excellent' } }

// Ganti bahasa menggambar ulang seluruh halaman; status disimpan di sessionStorage supaya jawaban tidak hilang
const STATE_KEY = 'msf2026.feedback'
function readState() {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY)) || {}
  } catch {
    return {}
  }
}

// Fungsi database belum dibuat (migrasi feedback belum dijalankan) atau gangguan lain
function describeError(error) {
  if (error?.code === 'PGRST202' || /function .* does not exist|Could not find the function/i.test(error?.message ?? '')) {
    return tr('Halaman feedback belum aktif. Silakan hubungi panitia.', 'The feedback page is not active yet. Please contact the organisers.')
  }
  return tr(`Gagal terhubung ke server: ${error?.message ?? ''}. Coba lagi.`, `Could not reach the server: ${error?.message ?? ''}. Please try again.`)
}

export default function Feedback() {
  const [saved] = useState(readState)
  const [step, setStep] = useState(saved.step ?? 'email') // email → form → done
  const [email, setEmail] = useState(saved.email ?? '')
  const [person, setPerson] = useState(saved.person ?? null)
  const [answers, setAnswers] = useState(saved.answers ?? {})
  const [result, setResult] = useState(saved.result ?? null)
  const [already, setAlready] = useState(saved.already ?? false)

  useEffect(() => {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ step, email, person, answers, result, already }))
    } catch { /* storage diblokir: status hanya bertahan selama halaman terbuka */ }
  }, [step, email, person, answers, result, already])

  useEffect(() => {
    const prev = document.title
    document.title = 'Feedback · Maritime Security Forum 2026'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  return (
    <div className="fb">
      <FeedbackHeader />
      <main className="fb-main">
        <ol className="fb-steps" aria-label={tr('Langkah', 'Steps')}>
          {[
            ['email', tr('Email', 'Email')],
            ['form', tr('Feedback', 'Feedback')],
            ['done', tr('Sertifikat', 'Certificate')],
          ].map(([key, label], i) => (
            <li key={key} className={step === key ? 'current' : ['email', 'form', 'done'].indexOf(step) > i ? 'done' : ''} aria-current={step === key ? 'step' : undefined}>
              <span>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        {step === 'email' && (
          <EmailStep
            onFound={(e, r) => {
              setEmail(e)
              setPerson({ name: r.name, organization: r.organization })
              setAnswers({})
              if (r.status === 'done') {
                setResult(r)
                setAlready(true)
                setStep('done')
              } else {
                setStep('form')
              }
            }}
          />
        )}
        {step === 'form' && (
          <FormStep
            email={email}
            person={person}
            answers={answers}
            setAnswers={setAnswers}
            onBack={() => setStep('email')}
            onDone={(r) => {
              setResult(r)
              setAlready(false)
              setStep('done')
            }}
          />
        )}
        {step === 'done' && result && <DoneStep result={result} already={already} />}
      </main>
    </div>
  )
}

// Dipakai juga oleh halaman registrasi
export function FeedbackHeader() {
  const { lang, setLang } = useLang()
  return (
    <header className="fb-header">
      <Link className="fb-brand" to="/">
        <BrandMark size={32} />
        <span>
          <b>Maritime Security</b>
          <small>Forum 2026</small>
        </span>
      </Link>
      <div className="fb-lang" role="group" aria-label={tr('Bahasa', 'Language')}>
        <button className={lang === 'id' ? 'active' : ''} aria-pressed={lang === 'id'} onClick={() => setLang('id')}>ID</button>
        <button className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
      </div>
    </header>
  )
}

function EmailStep({ onFound }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const value = email.trim()
    if (!value) return
    setBusy(true)
    setError('')
    const { data, error } = await supabase.rpc('feedback_lookup', { p_email: value })
    setBusy(false)
    if (error) return setError(describeError(error))
    if (data?.status === 'not_found') {
      return setError(
        tr(
          'Email ini tidak terdaftar sebagai peserta. Gunakan email yang Anda pakai saat registrasi, atau hubungi panitia.',
          'This email is not registered as a participant. Use the email you registered with, or contact the organisers.'
        )
      )
    }
    onFound(value, data)
  }

  return (
    <form className="fb-card" onSubmit={submit}>
      <p className="fb-eyebrow">Feedback · Maritime Security Forum 2026</p>
      <h1>{tr('Terima kasih telah hadir', 'Thank you for joining us')}</h1>
      <p className="fb-lead">
        {tr(
          'Bagikan pendapat Anda tentang MSF 2026. Setelah mengisi feedback, sertifikat keikutsertaan Anda bisa langsung diunduh.',
          'Share your thoughts on MSF 2026. After completing the feedback, you can download your certificate of participation right away.'
        )}
      </p>
      <label>
        {tr('Email yang terdaftar', 'Registered email')}
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tr('nama@perusahaan.com', 'name@company.com')}
        />
      </label>
      {demo && <p className="fb-hint">{tr('Mode demo: coba', 'Demo mode: try')} <code>agus.wijaya@contoh.id</code></p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? tr('Memeriksa…', 'Checking…') : tr('Lanjut', 'Continue')}
      </button>
      <Link className="fb-back" to="/">← {tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </form>
  )
}

function FormStep({ email, person, answers, setAnswers, onBack, onDone }) {
  const [missing, setMissing] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef({})
  const set = (k, v) => {
    setAnswers((a) => ({ ...a, [k]: v }))
    setMissing((m) => m.filter((x) => x !== k))
  }

  async function submit(e) {
    e.preventDefault()
    const empty = QUESTIONS.filter((q) => !q.optional && (answers[q.key] === undefined || answers[q.key] === '')).map((q) => q.key)
    setMissing(empty)
    if (empty.length) {
      refs.current[empty[0]]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return setError(tr(`Masih ada ${empty.length} pertanyaan wajib yang belum dijawab.`, `${empty.length} required question${empty.length === 1 ? ' is' : 's are'} still unanswered.`))
    }
    setBusy(true)
    setError('')
    const payload = {}
    for (const q of QUESTIONS) {
      const v = answers[q.key]
      if (v !== undefined && v !== '') payload[q.key] = typeof v === 'string' ? v.trim().slice(0, 2000) : v
    }
    const { data, error } = await supabase.rpc('submit_feedback', { p_email: email, p_answers: payload })
    setBusy(false)
    if (error) return setError(describeError(error))
    if (data?.status !== 'done') return setError(tr('Email tidak ditemukan. Silakan mulai ulang.', 'Email not found. Please start again.'))
    onDone(data)
  }

  return (
    <form className="fb-card fb-form" onSubmit={submit} noValidate>
      <div className="fb-person">
        <div>
          <p className="fb-eyebrow">{tr('Mengisi sebagai', 'Answering as')}</p>
          <h1>{person?.name}</h1>
          {person?.organization && <p className="fb-org">{person.organization}</p>}
        </div>
        <button type="button" className="btn-ghost" onClick={onBack}>{tr('Ganti email', 'Change email')}</button>
      </div>

      {QUESTIONS.map((q, i) => (
        <fieldset key={q.key} ref={(el) => (refs.current[q.key] = el)} className={`fb-q ${missing.includes(q.key) ? 'missing' : ''}`}>
          <legend>
            <span className="fb-q-num">{i + 1}</span>
            <span>
              {L(q.label)}
              {q.optional ? <em>{tr(' (opsional)', ' (optional)')}</em> : <span className="fb-req" aria-label={tr('wajib', 'required')}> *</span>}
            </span>
          </legend>
          {q.type === 'rating' && (
            <div className="fb-rating">
              <div className="fb-rating-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className={answers[q.key] === n ? 'active' : ''}>
                    <input type="radio" name={q.key} value={n} checked={answers[q.key] === n} onChange={() => set(q.key, n)} />
                    <span aria-hidden="true">{'★'}</span>
                    <b>{n}</b>
                  </label>
                ))}
              </div>
              <div className="fb-rating-ends" aria-hidden="true">
                <span>{L(RATING_ENDS.low)}</span>
                <span>{L(RATING_ENDS.high)}</span>
              </div>
            </div>
          )}
          {q.type === 'choice' && (
            <div className="fb-choices">
              {q.options.map((o) => (
                <label key={o.value} className={answers[q.key] === o.value ? 'active' : ''}>
                  <input type="radio" name={q.key} value={o.value} checked={answers[q.key] === o.value} onChange={() => set(q.key, o.value)} />
                  {L(o.label)}
                </label>
              ))}
            </div>
          )}
          {q.type === 'select' && (
            <select value={answers[q.key] ?? ''} onChange={(e) => set(q.key, e.target.value)} aria-label={L(q.label)}>
              <option value="">{tr('Pilih sesi', 'Choose a session')}</option>
              {q.options.map((o) => <option key={o.value} value={o.value}>{L(o.label)}</option>)}
            </select>
          )}
          {q.type === 'text' && (
            <textarea rows={3} maxLength={2000} value={answers[q.key] ?? ''} onChange={(e) => set(q.key, e.target.value)} aria-label={L(q.label)} />
          )}
          {missing.includes(q.key) && <p className="fb-missing">{tr('Pertanyaan ini wajib dijawab.', 'This question is required.')}</p>}
        </fieldset>
      ))}

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? tr('Mengirim…', 'Sending…') : tr('Kirim feedback & dapatkan sertifikat', 'Submit feedback & get certificate')}
      </button>
    </form>
  )
}

function DoneStep({ result, already }) {
  const [canvas, setCanvas] = useState(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    let cancelled = false
    renderCertificate({ name: result.name, organization: result.organization, certificateNo: result.certificate_no, submittedAt: result.submitted_at })
      .then((c) => {
        if (cancelled) return
        setCanvas(c)
        setPreview(c.toDataURL('image/png'))
      })
    return () => {
      cancelled = true
    }
  }, [result])

  return (
    <section className="fb-card fb-done">
      <span className="fb-done-check" aria-hidden="true">✓</span>
      <h1>{already ? tr('Feedback Anda sudah kami terima', 'We already have your feedback') : tr('Terima kasih atas feedback Anda!', 'Thank you for your feedback!')}</h1>
      <p className="fb-lead">
        {already
          ? tr(`Anda mengisi feedback pada ${formatTime(result.submitted_at)}. Sertifikat Anda tetap bisa diunduh.`, `You submitted feedback on ${formatTime(result.submitted_at)}. You can still download your certificate.`)
          : tr('Sertifikat keikutsertaan Anda sudah siap.', 'Your certificate of participation is ready.')}
      </p>
      <div className="fb-cert">
        {preview ? (
          <img src={preview} alt={tr(`Sertifikat keikutsertaan atas nama ${result.name}`, `Certificate of participation for ${result.name}`)} />
        ) : (
          <p className="fb-hint">{tr('Menyiapkan sertifikat…', 'Preparing certificate…')}</p>
        )}
      </div>
      <button className="btn btn-primary btn-block" disabled={!canvas} onClick={() => downloadCertificate(canvas, result.name)}>
        {tr('Unduh sertifikat (PNG)', 'Download certificate (PNG)')}
      </button>
      <p className="fb-hint">{tr('Nomor sertifikat', 'Certificate number')}: <b>{result.certificate_no}</b></p>
      <Link className="btn-link" to="/">{tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </section>
  )
}
