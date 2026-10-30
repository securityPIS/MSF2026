import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { demo, supabase } from '../lib/supabase.js'
import { tr, useLang } from '../lib/i18n.jsx'
import { formatTime } from '../lib/format.js'
import BrandMark from '../components/BrandMark.jsx'
import { downloadCertificate, renderCertificate } from '../lib/certificate.js'

// Pertanyaan sesuai formulir panitia "MSF2026 Participant Feedback & Event Evaluation".
// Jawaban disimpan apa adanya di kolom feedback.answers; nilai pilihan memakai label bahasa Inggris supaya mudah direkap.
// Key "overall" (pertanyaan 12) juga dibaca di detail peserta (admin).
const L = (x) => tr(x.id, x.en)
const OTHER = 'Other'
const opt = (en, id) => ({ value: en, label: { id, en } })
const rating = (key, en, id) => ({ key, type: 'rating', label: { id, en } })
const QUESTIONS = [
  {
    key: 'sector', type: 'choice', cols: 2, other: true,
    section: { id: 'A. Informasi Peserta', en: 'A. Participant Information' },
    label: { id: 'Sektor apa yang paling mewakili organisasi Anda?', en: 'Which sector best represents your organization?' },
    options: [
      opt('Energy / Oil & Gas', 'Energi / Migas'),
      opt('Shipping / Maritime Industry', 'Pelayaran / Industri Maritim'),
      opt('Government / Regulatory Authority', 'Pemerintah / Regulator'),
      opt('Military / Law Enforcement', 'Militer / Penegak Hukum'),
      opt('Security / Technology Provider', 'Penyedia Jasa Keamanan / Teknologi'),
      opt('Academia / Research', 'Akademisi / Riset'),
    ],
  },
  {
    key: 'days_attended', type: 'choice',
    label: { id: 'Hari forum mana yang Anda hadiri?', en: 'Which day(s) of the forum did you attend?' },
    options: [opt('Day 1 – October 29', 'Hari 1 – 29 Oktober'), opt('Day 2 – October 30', 'Hari 2 – 30 Oktober'), opt('Both days', 'Kedua hari')],
  },
  {
    ...rating('topic_relevance',
      'How relevant were the forum topics to your professional responsibilities and industry challenges?',
      'Seberapa relevan topik forum dengan tanggung jawab profesional dan tantangan industri Anda?'),
    section: { id: 'B. Materi Forum & Pembicara', en: 'B. Forum Content & Speakers' },
  },
  rating('speakers', 'How would you rate the quality and expertise of the speakers?', 'Bagaimana penilaian Anda terhadap kualitas dan keahlian para pembicara?'),
  rating('emerging_threats',
    'How effectively did the sessions address emerging maritime security threats and challenges?',
    'Seberapa efektif sesi-sesi membahas ancaman dan tantangan keamanan maritim yang sedang berkembang?'),
  rating('insights',
    'How useful were the insights and discussions for your professional decision-making?',
    'Seberapa bermanfaat wawasan dan diskusi forum untuk pengambilan keputusan profesional Anda?'),
  {
    key: 'most_valuable', type: 'text', optional: true,
    label: { id: 'Topik atau sesi mana yang paling bermanfaat bagi Anda, dan mengapa?', en: 'Which topic or session did you find most valuable, and why?' },
  },
  {
    ...rating('organization',
      'How satisfied were you with the overall event organization and coordination?',
      'Seberapa puas Anda dengan penyelenggaraan dan koordinasi acara secara keseluruhan?'),
    section: { id: 'C. Penyelenggaraan & Pengalaman Acara', en: 'C. Event Organization & Experience' },
  },
  rating('registration',
    'How would you rate the registration process and participant information provided before the event?',
    'Bagaimana penilaian Anda terhadap proses registrasi dan informasi peserta yang diberikan sebelum acara?'),
  rating('venue', 'How satisfied were you with the venue, facilities, and event arrangements?', 'Seberapa puas Anda dengan venue, fasilitas, dan pengaturan acara?'),
  rating('networking',
    'How valuable were the networking and collaboration opportunities provided during the forum?',
    'Seberapa berharga kesempatan networking dan kolaborasi yang tersedia selama forum?'),
  {
    ...rating('overall', 'Overall, how satisfied were you with Maritime Security Forum 2026?', 'Secara keseluruhan, seberapa puas Anda dengan Maritime Security Forum 2026?'),
    section: { id: 'D. Evaluasi Keseluruhan & Harapan ke Depan', en: 'D. Overall Evaluation & Future Expectations' },
  },
  {
    key: 'recommend', type: 'scale',
    label: {
      id: 'Seberapa besar kemungkinan Anda merekomendasikan forum ini kepada rekan kerja atau jaringan profesional Anda?',
      en: 'How likely are you to recommend this forum to your colleagues or professional network?',
    },
  },
  {
    key: 'future_topics', type: 'multi', cols: 2, other: true,
    label: { id: 'Topik apa yang ingin Anda lihat di Maritime Security Forum berikutnya?', en: 'What topics would you like to see covered in future Maritime Security Forums?' },
    note: { id: 'Boleh pilih lebih dari satu.', en: 'Select all that apply.' },
    options: [
      opt('Maritime Threat Intelligence & Risk Assessment', 'Intelijen Ancaman & Penilaian Risiko Maritim'),
      opt('Cybersecurity in Maritime Operations', 'Keamanan Siber dalam Operasi Maritim'),
      opt('Geopolitical Risks & Regional Security', 'Risiko Geopolitik & Keamanan Kawasan'),
      opt('Maritime Security Technology & Innovation', 'Teknologi & Inovasi Keamanan Maritim'),
      opt('Port & Vessel Security', 'Keamanan Pelabuhan & Kapal'),
      opt('Crisis Management & Emergency Response', 'Manajemen Krisis & Tanggap Darurat'),
      opt('Maritime Security Regulations & Compliance', 'Regulasi & Kepatuhan Keamanan Maritim'),
    ],
  },
  {
    key: 'suggestion', type: 'text', optional: true,
    label: { id: 'Perbaikan atau saran apa yang Anda rekomendasikan untuk acara berikutnya?', en: 'What improvements or suggestions would you recommend for future events?' },
  },
]
const RATINGS = [
  { id: 'Sangat buruk', en: 'Very Poor' },
  { id: 'Buruk', en: 'Poor' },
  { id: 'Cukup', en: 'Fair' },
  { id: 'Baik', en: 'Good' },
  { id: 'Sangat baik', en: 'Excellent' },
]
const SCALE_ENDS = { low: { id: '0 = Sangat tidak mungkin', en: '0 = Not at all likely' }, high: { id: '10 = Sangat mungkin', en: '10 = Extremely likely' } }

// Jawaban "Other" disimpan di <key>_other
const otherKey = (q) => `${q.key}_other`
const picked = (q, answers) => (q.type === 'multi' ? (answers[q.key] ?? []).includes(OTHER) : answers[q.key] === OTHER)
const blank = (v) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
function unanswered(q, answers) {
  if (q.optional) return false
  if (blank(answers[q.key])) return true
  return q.other && picked(q, answers) && !String(answers[otherKey(q)] ?? '').trim()
}

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
  // qKey: pertanyaan yang tanda "wajib dijawab"-nya dihapus (kolom "Other" milik pertanyaan induknya)
  const set = (k, v, qKey = k) => {
    setAnswers((a) => ({ ...a, [k]: v }))
    setMissing((m) => m.filter((x) => x !== qKey))
  }
  const toggle = (q, value) => {
    const list = answers[q.key] ?? []
    set(q.key, list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  async function submit(e) {
    e.preventDefault()
    const empty = QUESTIONS.filter((q) => unanswered(q, answers)).map((q) => q.key)
    setMissing(empty)
    if (empty.length) {
      refs.current[empty[0]]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return setError(tr(`Masih ada ${empty.length} pertanyaan wajib yang belum dijawab.`, `${empty.length} required question${empty.length === 1 ? ' is' : 's are'} still unanswered.`))
    }
    setBusy(true)
    setError('')
    const payload = {}
    const clean = (v) => (typeof v === 'string' ? v.trim().slice(0, 2000) : v)
    for (const q of QUESTIONS) {
      const v = answers[q.key]
      if (!blank(v)) payload[q.key] = Array.isArray(v) ? v.map(clean) : clean(v)
      if (q.other && picked(q, answers)) payload[otherKey(q)] = clean(answers[otherKey(q)] ?? '')
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

      <p className="fb-hint">
        {tr('Perkiraan waktu pengisian 3–5 menit. Pilih satu jawaban kecuali dinyatakan lain.', 'Estimated completion time: 3–5 minutes. Please select one answer unless stated otherwise.')}
      </p>

      {QUESTIONS.map((q, i) => (
        <Fragment key={q.key}>
          {q.section && <h2 className="fb-section">{L(q.section)}</h2>}
          <fieldset ref={(el) => (refs.current[q.key] = el)} className={`fb-q ${missing.includes(q.key) ? 'missing' : ''}`}>
            <legend>
              <span className="fb-q-num">{i + 1}</span>
              <span>
                {L(q.label)}
                {q.optional ? <em>{tr(' (opsional)', ' (optional)')}</em> : <span className="fb-req" aria-label={tr('wajib', 'required')}> *</span>}
                {q.note && <small className="fb-q-note">{L(q.note)}</small>}
              </span>
            </legend>
            {q.type === 'rating' && (
              <div className="fb-rating">
                <div className="fb-rating-row">
                  {RATINGS.map((r, j) => (
                    <label key={j + 1} className={answers[q.key] === j + 1 ? 'active' : ''}>
                      <input type="radio" name={q.key} value={j + 1} checked={answers[q.key] === j + 1} onChange={() => set(q.key, j + 1)} />
                      <span aria-hidden="true">{'★'}</span>
                      <b>{j + 1}</b>
                      <small>{L(r)}</small>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {q.type === 'scale' && (
              <div className="fb-rating">
                <div className="fb-scale-row">
                  {Array.from({ length: 11 }, (_, n) => (
                    <label key={n} className={answers[q.key] === n ? 'active' : ''}>
                      <input type="radio" name={q.key} value={n} checked={answers[q.key] === n} onChange={() => set(q.key, n)} />
                      <b>{n}</b>
                    </label>
                  ))}
                </div>
                <div className="fb-rating-ends">
                  <span>{L(SCALE_ENDS.low)}</span>
                  <span>{L(SCALE_ENDS.high)}</span>
                </div>
              </div>
            )}
            {(q.type === 'choice' || q.type === 'multi') && (
              <div className={`fb-choices ${q.cols === 2 ? 'two' : ''}`}>
                {[...q.options, ...(q.other ? [opt(OTHER, 'Lainnya')] : [])].map((o) => {
                  const on = q.type === 'multi' ? (answers[q.key] ?? []).includes(o.value) : answers[q.key] === o.value
                  return (
                    <label key={o.value} className={on ? 'active' : ''}>
                      {q.type === 'multi' ? (
                        <input type="checkbox" value={o.value} checked={on} onChange={() => toggle(q, o.value)} />
                      ) : (
                        <input type="radio" name={q.key} value={o.value} checked={on} onChange={() => set(q.key, o.value)} />
                      )}
                      {L(o.label)}
                    </label>
                  )
                })}
              </div>
            )}
            {q.other && picked(q, answers) && (
              <input
                className="fb-other"
                type="text"
                maxLength={200}
                value={answers[otherKey(q)] ?? ''}
                onChange={(e) => set(otherKey(q), e.target.value, q.key)}
                placeholder={tr('Sebutkan lainnya', 'Please specify')}
                aria-label={tr('Lainnya, sebutkan', 'Other, please specify')}
              />
            )}
            {q.type === 'text' && (
              <textarea rows={3} maxLength={2000} value={answers[q.key] ?? ''} onChange={(e) => set(q.key, e.target.value)} aria-label={L(q.label)} />
            )}
            {missing.includes(q.key) && (
              <p className="fb-missing">
                {blank(answers[q.key]) ? tr('Pertanyaan ini wajib dijawab.', 'This question is required.') : tr('Isi kolom "Lainnya".', 'Please specify "Other".')}
              </p>
            )}
          </fieldset>
        </Fragment>
      ))}

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? tr('Mengirim…', 'Sending…') : tr('Kirim feedback & dapatkan sertifikat', 'Submit feedback & get certificate')}
      </button>
    </form>
  )
}

function DoneStep({ result, already }) {
  const [cert, setCert] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCert(null)
    setFailed(false)
    renderCertificate(result.name)
      .then((c) => {
        if (!cancelled) setCert(c)
      })
      .catch((err) => {
        console.error('Sertifikat gagal dibuat', err)
        if (!cancelled) setFailed(true)
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
        {cert ? (
          <img src={cert.preview} alt={tr(`Sertifikat keikutsertaan atas nama ${result.name}`, `Certificate of participation for ${result.name}`)} />
        ) : failed ? (
          <div className="fb-cert-error">
            <p className="fb-hint">{tr('Sertifikat gagal dimuat. Periksa koneksi lalu coba lagi.', 'The certificate could not be loaded. Check your connection and try again.')}</p>
            {/* Muat ulang halaman: status feedback tersimpan, dan versi aplikasi terbaru ikut terambil */}
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>{tr('Coba lagi', 'Try again')}</button>
          </div>
        ) : (
          <p className="fb-hint">{tr('Menyiapkan sertifikat…', 'Preparing certificate…')}</p>
        )}
      </div>
      <button className="btn btn-primary btn-block" disabled={!cert} onClick={() => downloadCertificate(cert)}>
        {tr('Unduh sertifikat (PDF)', 'Download certificate (PDF)')}
      </button>
      <p className="fb-hint">{tr('Nomor sertifikat', 'Certificate number')}: <b>{result.certificate_no}</b></p>
      <Link className="btn-link" to="/">{tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </section>
  )
}
