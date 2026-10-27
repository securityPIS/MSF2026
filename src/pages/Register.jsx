import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { tr } from '../lib/i18n.jsx'
import { COUNTRIES, toInternational, validPhone } from '../lib/countries.js'
import QrCode, { downloadQrCard } from '../components/QrCode.jsx'
import { FeedbackHeader } from './Feedback.jsx'
import { useRegistrationOpen } from '../lib/registration.js'
import { EVENT } from './home/content.js'

const EMPTY = { full_name: '', email: '', country: 'ID', phone: '', organization: '', division: '', job_title: '', attendance: '' }
const ATTENDANCE = [
  { value: 'attend', label: () => tr('Hadir', 'Attending') },
  { value: 'absent', label: () => tr('Tidak hadir', 'Not attending') },
]
const attendanceLabel = (v) => ATTENDANCE.find((a) => a.value === v)?.label() ?? '-'

// Ganti bahasa menggambar ulang seluruh halaman; isian dan hasil disimpan di sessionStorage supaya tidak hilang
const STATE_KEY = 'msf2026.register'
function readState() {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY)) || {}
  } catch {
    return {}
  }
}

// Fungsi database belum dibuat (migrasi registrasi belum dijalankan) atau gangguan lain
function describeError(error) {
  if (error?.code === 'PGRST202' || /function .* does not exist|Could not find the function/i.test(error?.message ?? '')) {
    return tr('Halaman registrasi belum aktif. Silakan hubungi panitia.', 'Registration is not open yet. Please contact the organisers.')
  }
  if (error?.code === '22023' || /tidak valid/i.test(error?.message ?? '')) {
    return tr('Data belum lengkap atau formatnya salah. Periksa lagi isian Anda.', 'Some details are missing or invalid. Please check your entries.')
  }
  return tr(`Gagal terhubung ke server: ${error?.message ?? ''}. Coba lagi.`, `Could not reach the server: ${error?.message ?? ''}. Please try again.`)
}

export default function Register() {
  const [saved] = useState(readState)
  const [form, setForm] = useState(saved.form ?? EMPTY)
  const [result, setResult] = useState(saved.result ?? null)
  const { open, markClosed } = useRegistrationOpen()

  useEffect(() => {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ form, result }))
    } catch { /* storage diblokir: status hanya bertahan selama halaman terbuka */ }
  }, [form, result])

  useEffect(() => {
    const prev = document.title
    document.title = tr('Registrasi', 'Registration') + ' · Maritime Security Forum 2026'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [result])

  return (
    <div className="fb">
      <FeedbackHeader />
      <main className="fb-main">
        {result ? (
          <DoneStep
            result={result}
            onAgain={() => {
              setForm(EMPTY)
              setResult(null)
            }}
          />
        ) : open === null ? (
          <section className="fb-card">
            <p className="fb-hint">{tr('Memuat…', 'Loading…')}</p>
          </section>
        ) : open ? (
          <FormStep form={form} setForm={setForm} onDone={setResult} onClosed={markClosed} />
        ) : (
          <ClosedStep />
        )}
      </main>
    </div>
  )
}

function FormStep({ form, setForm, onDone, onClosed }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [missingAttendance, setMissingAttendance] = useState(false)
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setError('')
  }
  const dial = COUNTRIES.find((c) => c.iso === form.country)?.dial ?? '62'
  const phone = toInternational(dial, form.phone)

  async function submit(e) {
    e.preventDefault()
    if (!form.attendance) {
      setMissingAttendance(true)
      return setError(tr('Pilih konfirmasi kehadiran Anda.', 'Please confirm whether you will attend.'))
    }
    if (!validPhone(phone)) {
      return setError(tr('Nomor telepon belum benar. Isi nomor tanpa kode negara, contoh 81234567890.', 'The phone number looks wrong. Enter it without the country code, e.g. 81234567890.'))
    }
    setBusy(true)
    setError('')
    const { data, error } = await supabase.rpc('register_participant', {
      p_full_name: form.full_name.trim(),
      p_email: form.email.trim(),
      p_phone: phone,
      p_attendance: form.attendance,
      p_organization: form.organization.trim(),
      p_division: form.division.trim(),
      p_job_title: form.job_title.trim(),
    })
    setBusy(false)
    if (error) return setError(describeError(error))
    // Admin menutup registrasi saat form masih terbuka
    if (data?.status === 'closed') return onClosed()
    if (data?.status === 'already_registered') {
      return setError(
        tr(
          'Email ini sudah terdaftar. Gunakan QR code dari registrasi sebelumnya, atau hubungi panitia kalau QR code Anda hilang.',
          'This email is already registered. Use the QR code from your earlier registration, or contact the organisers if you lost it.'
        )
      )
    }
    if (data?.status !== 'ok') return setError(describeError(null))
    onDone(data)
  }

  return (
    <form className="fb-card" onSubmit={submit}>
      <div>
        <p className="fb-eyebrow">{tr('Registrasi peserta', 'Participant registration')} · Cirebon, 29–30 {tr('Oktober', 'October')} 2026</p>
        <h1>Maritime Security Forum 2026</h1>
      </div>
      <p className="fb-lead">
        {tr(
          'Isi data diri Anda. Setelah mengirim, QR code peserta langsung tampil untuk ditunjukkan saat menukar badge di lokasi.',
          'Fill in your details. After you submit, your participant QR code appears right away. Show it when collecting your badge at the venue.'
        )}
      </p>

      <label>
        <span>{tr('Nama lengkap', 'Full name')}<span className="fb-req" aria-hidden="true"> *</span></span>
        <input required autoFocus autoComplete="name" maxLength={200} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder={tr('Contoh: Budi Santoso', 'Example: Budi Santoso')} />
      </label>
      <label>
        <span>Email<span className="fb-req" aria-hidden="true"> *</span></span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          required
          maxLength={200}
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder={tr('nama@perusahaan.com', 'name@company.com')}
        />
      </label>
      <div className="rg-field">
        <span id="rg-phone-label">{tr('Nomor telepon / WhatsApp', 'Phone / WhatsApp number')}<span className="fb-req" aria-hidden="true"> *</span></span>
        <div className="rg-phone" role="group" aria-labelledby="rg-phone-label">
          <select aria-label={tr('Kode negara', 'Country code')} autoComplete="tel-country-code" value={form.country} onChange={(e) => set('country', e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>+{c.dial} {tr(c.name.id, c.name.en)}</option>
            ))}
          </select>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            aria-label={tr('Nomor telepon tanpa kode negara', 'Phone number without country code')}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="81234567890"
          />
        </div>
        {phone && <small className="rg-preview">{tr('Tersimpan sebagai', 'Saved as')} <b>{phone}</b></small>}
      </div>
      <label>
        <span>Company <em className="rg-opt">{tr('(opsional)', '(optional)')}</em></span>
        <input autoComplete="organization" maxLength={200} value={form.organization} onChange={(e) => set('organization', e.target.value)} placeholder={tr('Contoh: Bakamla RI', 'Example: Bakamla RI')} />
      </label>
      <div className="rg-two">
        <label>
          <span>Department <em className="rg-opt">{tr('(opsional)', '(optional)')}</em></span>
          <input maxLength={200} value={form.division} onChange={(e) => set('division', e.target.value)} />
        </label>
        <label>
          <span>Job Title <em className="rg-opt">{tr('(opsional)', '(optional)')}</em></span>
          <input autoComplete="organization-title" maxLength={200} value={form.job_title} onChange={(e) => set('job_title', e.target.value)} />
        </label>
      </div>

      <fieldset className={`fb-q ${missingAttendance ? 'missing' : ''}`}>
        <legend>
          <span>
            {tr('Konfirmasi kehadiran', 'Attendance')}
            <span className="fb-req" aria-label={tr('wajib', 'required')}> *</span>
          </span>
        </legend>
        <div className="fb-choices rg-attendance">
          {ATTENDANCE.map((a) => (
            <label key={a.value} className={form.attendance === a.value ? 'active' : ''}>
              <input
                type="radio"
                name="attendance"
                value={a.value}
                checked={form.attendance === a.value}
                onChange={() => {
                  set('attendance', a.value)
                  setMissingAttendance(false)
                }}
              />
              {a.label()}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? tr('Mengirim…', 'Submitting…') : tr('Kirim registrasi', 'Submit registration')}
      </button>
      <Link className="fb-back" to="/">← {tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </form>
  )
}

// Tampil saat admin menutup registrasi dari menu pengaturan
function ClosedStep() {
  return (
    <section className="fb-card rg-closed">
      <div>
        <p className="fb-eyebrow">{tr('Registrasi peserta', 'Participant registration')} · Maritime Security Forum 2026</p>
        <h1>{tr('Pendaftaran Telah Ditutup', 'Registration Is Now Closed')}</h1>
      </div>
      <p>
        {tr(
          'Terima kasih atas perhatian dan minat Bapak/Ibu untuk berpartisipasi dalam Maritime Security Forum 2026.',
          'Thank you for your interest in participating in Maritime Security Forum 2026.'
        )}
      </p>
      <p>
        {tr(
          'Dengan hormat kami sampaikan bahwa pendaftaran peserta saat ini telah ditutup. Kami tidak lagi dapat menerima pendaftaran baru melalui halaman ini.',
          'We respectfully inform you that participant registration has now closed, and we are no longer able to accept new registrations through this page.'
        )}
      </p>
      <p>
        {tr(
          'Bagi Bapak/Ibu yang telah terdaftar, mohon membawa QR code peserta untuk ditunjukkan pada saat penukaran badge di lokasi acara. Untuk informasi lebih lanjut, silakan menghubungi panitia penyelenggara.',
          'Registered participants are kindly requested to bring their participant QR code to present when collecting their badge at the venue. For further information, please contact the organising committee.'
        )}
      </p>
      <p className="rg-event">
        <b>{tr('29–30 Oktober 2026', '29–30 October 2026')}</b>
        <span>{EVENT.venue}, Cirebon</span>
      </p>
      <p className="rg-sign">
        {tr('Hormat kami,', 'Yours sincerely,')}
        <br />
        <b>{tr('Panitia Maritime Security Forum 2026', 'The Organising Committee, Maritime Security Forum 2026')}</b>
      </p>
      <Link className="btn btn-primary btn-block" to="/">{tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </section>
  )
}

function DoneStep({ result, onAgain }) {
  const attending = result.attendance === 'attend'
  return (
    <section className="fb-card fb-done">
      <span className="fb-done-check" aria-hidden="true">✓</span>
      <h1>{tr(`Terima kasih, ${result.name}!`, `Thank you, ${result.name}!`)}</h1>
      <p className="fb-lead">
        {attending
          ? tr(
              'Registrasi Anda untuk Maritime Security Forum 2026 berhasil. Simpan QR code di bawah dan tunjukkan saat menukar badge di lokasi.',
              'You are registered for Maritime Security Forum 2026. Save the QR code below and show it when collecting your badge at the venue.'
            )
          : tr(
              'Terima kasih sudah mengonfirmasi. Kami mencatat Anda tidak dapat hadir. Kalau rencana berubah, QR code di bawah tetap bisa dipakai di lokasi.',
              'Thank you for letting us know. We have noted that you cannot attend. If your plans change, the QR code below still works at the venue.'
            )}
      </p>

      <QrCode code={result.qr_code} size={220} />
      <p className="fb-hint">Unique ID: <code>{result.qr_code}</code></p>
      <button className="btn btn-primary btn-block" onClick={() => downloadQrCard({ code: result.qr_code, name: result.name, organization: result.organization })}>
        {tr('Unduh kartu QR (PNG)', 'Download QR card (PNG)')}
      </button>

      <dl className="rg-data">
        <div><dt>{tr('Nama', 'Name')}</dt><dd>{result.name}</dd></div>
        <div><dt>Email</dt><dd>{result.email}</dd></div>
        <div><dt>{tr('Telepon', 'Phone')}</dt><dd>{result.phone}</dd></div>
        <div><dt>{tr('Kehadiran', 'Attendance')}</dt><dd className={attending ? 'rg-yes' : ''}>{attendanceLabel(result.attendance)}</dd></div>
        <div><dt>Company</dt><dd>{result.organization || '-'}</dd></div>
        <div><dt>Department</dt><dd>{result.division || '-'}</dd></div>
        <div><dt>Job Title</dt><dd>{result.job_title || '-'}</dd></div>
      </dl>

      <button className="btn-link" onClick={onAgain}>+ {tr('Daftarkan peserta lain', 'Register another participant')}</button>
      <Link className="fb-back" to="/">← {tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
    </section>
  )
}
