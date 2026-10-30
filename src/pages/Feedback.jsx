import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { tr, useLang } from '../lib/i18n.jsx'
import BrandMark from '../components/BrandMark.jsx'
import { downloadCertificate, renderCertificate } from '../lib/certificate.js'
import { L, OTHER, QUESTIONS, RATINGS, SCALE_ENDS, blank, opt, otherKey, picked, unanswered } from '../lib/feedbackForm.js'

// Ganti bahasa menggambar ulang seluruh halaman; status disimpan di sessionStorage supaya jawaban tidak hilang
const STATE_KEY = 'msf2026.feedback.v2' // v2: langkah email diganti nama
function readState() {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY)) || {}
  } catch {
    return {}
  }
}

// Fungsi database belum dibuat (migrasi 20261030000000_feedback_by_name.sql belum dijalankan) atau gangguan lain
function describeError(error) {
  if (error?.code === 'PGRST202' || /function .* does not exist|Could not find the function/i.test(error?.message ?? '')) {
    return tr('Halaman feedback belum aktif. Silakan hubungi panitia.', 'The feedback page is not active yet. Please contact the organisers.')
  }
  return tr(`Gagal terhubung ke server: ${error?.message ?? ''}. Coba lagi.`, `Could not reach the server: ${error?.message ?? ''}. Please try again.`)
}

export default function Feedback() {
  const [saved] = useState(readState)
  const [step, setStep] = useState(saved.step ?? 'name') // name → form → done
  const [name, setName] = useState(saved.name ?? '')
  const [answers, setAnswers] = useState(saved.answers ?? {})
  const [result, setResult] = useState(saved.result ?? null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ step, name, answers, result }))
    } catch { /* storage diblokir: status hanya bertahan selama halaman terbuka */ }
  }, [step, name, answers, result])

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
            ['name', tr('Nama', 'Name')],
            ['form', tr('Feedback', 'Feedback')],
            ['done', tr('Sertifikat', 'Certificate')],
          ].map(([key, label], i) => (
            <li key={key} className={step === key ? 'current' : ['name', 'form', 'done'].indexOf(step) > i ? 'done' : ''} aria-current={step === key ? 'step' : undefined}>
              <span>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        {step === 'name' && (
          <NameStep
            initial={name}
            onNext={(n) => {
              setName(n)
              setStep('form')
            }}
          />
        )}
        {step === 'form' && (
          <FormStep
            name={name}
            answers={answers}
            setAnswers={setAnswers}
            onBack={() => setStep('name')}
            onDone={(r) => {
              setResult(r)
              setStep('done')
            }}
          />
        )}
        {step === 'done' && result && <DoneStep result={result} />}
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

// Nama tidak dicek ke data peserta; nama ini yang tercetak di sertifikat
function NameStep({ initial, onNext }) {
  const [value, setValue] = useState(initial)

  function submit(e) {
    e.preventDefault()
    const n = value.replace(/\s+/g, ' ').trim()
    if (n) onNext(n)
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
        {tr('Nama lengkap', 'Full name')}
        <input
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          required
          autoFocus
          maxLength={120}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={tr('Nama Anda', 'Your name')}
        />
      </label>
      <p className="fb-hint">{tr('Tulis nama beserta gelar bila perlu. Nama ini akan tercetak di sertifikat.', 'Include any titles you want shown. This name will be printed on your certificate.')}</p>
      <button className="btn btn-primary btn-block" disabled={!value.trim()}>
        {tr('Lanjut', 'Continue')}
      </button>
      <Link className="fb-back" to="/">← {tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </form>
  )
}

function FormStep({ name, answers, setAnswers, onBack, onDone }) {
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
    const { data, error } = await supabase.rpc('submit_feedback_by_name', { p_name: name, p_answers: payload })
    setBusy(false)
    if (error) return setError(describeError(error))
    if (data?.status !== 'done') return setError(tr('Feedback gagal disimpan. Coba lagi.', 'Your feedback could not be saved. Please try again.'))
    onDone(data)
  }

  return (
    <form className="fb-card fb-form" onSubmit={submit} noValidate>
      <div className="fb-person">
        <div>
          <p className="fb-eyebrow">{tr('Mengisi sebagai', 'Answering as')}</p>
          <h1>{name}</h1>
        </div>
        <button type="button" className="btn-ghost" onClick={onBack}>{tr('Ganti nama', 'Change name')}</button>
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

function DoneStep({ result }) {
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
      <h1>{tr('Terima kasih atas feedback Anda!', 'Thank you for your feedback!')}</h1>
      <p className="fb-lead">{tr('Sertifikat keikutsertaan Anda sudah siap.', 'Your certificate of participation is ready.')}</p>
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
