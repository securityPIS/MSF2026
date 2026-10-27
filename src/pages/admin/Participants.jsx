import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { cleanTerm, formatTime } from '../../lib/format.js'
import KindIcon from '../../components/KindIcon.jsx'
import Pager from '../../components/Pager.jsx'
import QrCode, { downloadQrCard } from '../../components/QrCode.jsx'
import { useAuth } from '../../lib/auth.jsx'
import { useConfirm } from '../../components/ConfirmDialog.jsx'
import { canAddParticipants } from '../../lib/permissions.js'
import { tr } from '../../lib/i18n.jsx'

const PAGE = 5
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const CATEGORIES = ['Umum', 'VIP', 'Pembicara', 'Media', 'Panitia']

export default function Participants() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const canAdd = canAddParticipants(profile)
  const [q, setQ] = useState('')
  const [letter, setLetter] = useState('')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [adding, setAdding] = useState(false)
  const [created, setCreated] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false // jawaban lama tidak boleh menimpa hasil saringan yang lebih baru
    const t = setTimeout(async () => {
      const term = cleanTerm(q)
      const from = page * PAGE
      let query = supabase
        .from('participants')
        .select('id,qr_code,full_name,organization,category', { count: 'exact' })
        .order('full_name')
        .range(from, from + PAGE - 1)
      if (letter) query = query.ilike('full_name', `${letter}%`)
      if (term) query = query.or(`full_name.ilike.%${term}%,organization.ilike.%${term}%,qr_code.ilike.%${term}%`)
      const { data, count } = await query
      if (cancelled) return
      setRows(data || [])
      setTotal(count ?? 0)
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, letter, page, reload])

  function pickLetter(l, el) {
    setLetter(l)
    setPage(0)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  function open(id) {
    setSelected(id)
    setCreated(null)
    setAdding(false)
    window.scrollTo({ top: 0 })
  }

  function startAdd() {
    setAdding(true)
    setCreated(null)
    setSelected(null)
    window.scrollTo({ top: 0 })
  }

  function onCreated(p) {
    setAdding(false)
    setCreated(p)
    setReload((n) => n + 1)
    window.scrollTo({ top: 0 })
  }

  const empty = total === 0 && !q && !letter

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{tr('Data peserta', 'Participant data')}</p>
          <h1>{tr('Peserta', 'Participants')}</h1>
        </div>
        {!adding && (
          <div className="actions">
            {canAdd && <button className="btn btn-primary" onClick={startAdd}>+ {tr('Tambah peserta', 'Add participant')}</button>}
            {isAdmin && <Link className="btn" to="/admin/import">{tr('Impor dari Excel', 'Import from Excel')}</Link>}
          </div>
        )}
      </div>

      {adding && <AddParticipant onCancel={() => setAdding(false)} onCreated={onCreated} />}
      {created && (
        <CreatedCard
          p={created}
          onAgain={startAdd}
          onOpen={() => open(created.id)}
          onClose={() => setCreated(null)}
        />
      )}

      <input
        className="search"
        type="search"
        aria-label={tr('Cari peserta', 'Search participants')}
        placeholder={tr('Cari nama, company, atau Unique ID', 'Search name, company, or Unique ID')}
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setPage(0)
        }}
      />

      <div className="letters" role="group" aria-label={tr('Saring berdasarkan huruf awal nama', 'Filter by first letter of name')}>
        <button className={`letter all ${letter === '' ? 'active' : ''}`} aria-pressed={letter === ''} onClick={(e) => pickLetter('', e.currentTarget)}>
          {tr('Semua', 'All')}
        </button>
        {LETTERS.map((l) => (
          <button key={l} className={`letter ${letter === l ? 'active' : ''}`} aria-pressed={letter === l} onClick={(e) => pickLetter(l, e.currentTarget)}>
            {l}
          </button>
        ))}
      </div>

      {total !== null && (
        <p className="hint">
          {tr(`${total} peserta`, `${total} participant${total === 1 ? '' : 's'}`)}
          {letter ? tr(` berawalan ${letter}`, ` starting with ${letter}`) : ''}
          {total > 0 ? tr(`, menampilkan ${page * PAGE + 1}–${page * PAGE + rows.length}`, `, showing ${page * PAGE + 1}–${page * PAGE + rows.length}`) : ''}
        </p>
      )}

      {empty ? (
        <p className="empty">
          {tr('Belum ada data peserta.', 'No participants yet.')}{' '}
          {isAdmin
            ? tr('Tambahkan peserta atau impor file Excel dari panitia untuk memulai.', 'Add participants or import the organizers’ Excel file to get started.')
            : canAdd
              ? tr('Tambahkan peserta untuk memulai.', 'Add participants to get started.')
              : tr('Admin perlu mengisi data peserta terlebih dulu.', 'An admin needs to add participant data first.')}
        </p>
      ) : (
        <div className={`split ${selected ? 'has-selection' : ''}`}>
          <div className="list-col">
            {total === 0 ? (
              <p className="empty">{tr('Tidak ada peserta yang cocok.', 'No matching participants.')}</p>
            ) : (
              <ul className="list">
                {rows.map((r) => (
                  <li key={r.id}>
                    <button className={selected === r.id ? 'active' : ''} onClick={() => open(r.id)}>
                      <strong>{r.full_name}</strong>
                      <span>{[r.organization, r.category].filter(Boolean).join(', ') || r.qr_code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Pager page={page} total={total ?? 0} pageSize={PAGE} onChange={(n) => { setPage(n); window.scrollTo({ top: 0 }) }} />
          </div>
          {selected ? (
            <ParticipantDetail key={selected} id={selected} canCancel={isAdmin} onBack={() => setSelected(null)} />
          ) : (
            <div className="detail empty">{tr('Pilih peserta untuk melihat QR code, lokasi, dan waktu check-in.', 'Choose a participant to see their QR code, check-in locations, and times.')}</div>
          )}
        </div>
      )}
    </div>
  )
}

// Kode disimpan dengan aturan yang sama seperti saat scan dan impor Excel
const normalizeCode = (s) => String(s || '').trim().toLowerCase()

async function findByCode(code) {
  const { data } = await supabase.from('participants').select('full_name').eq('qr_code', code).maybeSingle()
  return data
}

function AddParticipant({ onCancel, onCreated }) {
  const [f, setF] = useState({ full_name: '', organization: '', division: '', job_title: '', category: 'Umum', email: '', phone: '', qr_code: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const ownCode = normalizeCode(f.qr_code)

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = { full_name: f.full_name.trim() }
    // Isian kosong tidak dikirim, kolomnya otomatis null di database
    for (const k of ['organization', 'division', 'job_title', 'category', 'email', 'phone']) {
      const v = f[k].trim()
      if (v) payload[k] = v
    }
    if (ownCode) payload.qr_code = ownCode

    // Tanpa Unique ID, kode dibuat otomatis oleh database. Kalau kebetulan bentrok dengan kode lain, coba lagi.
    let result
    for (let attempt = 0; attempt < (ownCode ? 1 : 3); attempt++) {
      result = await supabase.from('participants').insert(payload).select('id,qr_code,full_name,organization,category').single()
      if (result.error?.code !== '23505') break
    }
    if (result.error?.code === '23505' && ownCode) {
      const owner = await findByCode(ownCode)
      setBusy(false)
      setError(
        tr(
          `Unique ID ${ownCode} sudah dipakai${owner ? ` oleh ${owner.full_name}` : ' peserta lain'}. Periksa lagi Unique ID-nya.`,
          `Unique ID ${ownCode} is already used${owner ? ` by ${owner.full_name}` : ' by another participant'}. Check the Unique ID again.`
        )
      )
      return
    }
    setBusy(false)
    if (result.error) {
      setError(tr(`Peserta gagal disimpan: ${result.error.message}`, `Could not save the participant: ${result.error.message}`))
      return
    }
    onCreated({ ...result.data, existingQr: !!ownCode })
  }

  return (
    <form className="panel form-grid add-form" onSubmit={save}>
      <h2>{tr('Tambah peserta', 'Add participant')}</h2>
      <p className="hint full">
        {tr(
          'Isi Unique ID yang tertulis di QR code peserta. Kalau dikosongkan, Unique ID dan QR code dibuat otomatis.',
          'Enter the Unique ID written on the participant’s QR code. If left empty, a Unique ID and QR code are created automatically.'
        )}
      </p>
      <label className="full">
        {tr('Unique ID (opsional)', 'Unique ID (optional)')}
        <input
          value={f.qr_code}
          onChange={(e) => {
            set('qr_code', e.target.value)
            setError('')
          }}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          placeholder={tr('Kosongkan untuk buat otomatis', 'Leave empty to generate one')}
        />
      </label>
      <label className="full">
        {tr('Nama lengkap (wajib)', 'Full name (required)')}
        <input required autoFocus value={f.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder={tr('Contoh: Budi Santoso', 'Example: Budi Santoso')} />
      </label>
      <label className="full">
        Company
        <input value={f.organization} onChange={(e) => set('organization', e.target.value)} placeholder={tr('Contoh: Bakamla RI', 'Example: Bakamla RI')} />
      </label>
      <label>
        Department
        <input value={f.division} onChange={(e) => set('division', e.target.value)} placeholder={tr('Contoh: Operasi Laut', 'Example: Maritime Operations')} />
      </label>
      <label>
        Job Title
        <input value={f.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder={tr('Contoh: Kepala Seksi', 'Example: Section Head')} />
      </label>
      <label>
        {tr('Kategori', 'Category')}
        <input list="participant-categories" value={f.category} onChange={(e) => set('category', e.target.value)} />
        <datalist id="participant-categories">
          {CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <label>
        {tr('Telepon', 'Phone')}
        <input type="tel" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08…" />
      </label>
      <label className="full">
        Email
        <input type="email" inputMode="email" autoCapitalize="none" value={f.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      {error && <p className="form-error full" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>{tr('Batal', 'Cancel')}</button>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? tr('Menyimpan…', 'Saving…') : ownCode ? tr('Simpan dengan Unique ID ini', 'Save with this Unique ID') : tr('Simpan & buat QR', 'Save & create QR')}
        </button>
      </div>
    </form>
  )
}

function CreatedCard({ p, onAgain, onOpen, onClose }) {
  return (
    <section className="panel created" style={{ marginTop: 0, marginBottom: '1.25rem' }} role="status">
      <p className="created-badge">
        ✓ {tr('Peserta tersimpan', 'Participant saved')}, {p.existingQr ? tr('memakai Unique ID yang sudah ada', 'using the existing Unique ID') : tr('QR code siap', 'QR code ready')}
      </p>
      <QrCode code={p.qr_code} size={220} />
      <div className="created-info">
        <h2>{p.full_name}</h2>
        {p.organization && <p className="card-sub">{p.organization}</p>}
        <p><code>{p.qr_code}</code></p>
      </div>
      <div className="created-actions">
        <button className="btn btn-primary" onClick={() => downloadQrCard({ code: p.qr_code, name: p.full_name, organization: p.organization })}>
          {tr('Unduh kartu QR', 'Download QR card')}
        </button>
        <button className="btn" onClick={onAgain}>+ {tr('Tambah lagi', 'Add another')}</button>
        <button className="btn" onClick={onOpen}>{tr('Lihat detail', 'View details')}</button>
        <button className="btn-ghost" onClick={onClose}>{tr('Tutup', 'Close')}</button>
      </div>
    </section>
  )
}

function ParticipantDetail({ id, canCancel, onBack }) {
  const [p, setP] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [feedback, setFeedback] = useState(undefined) // undefined = tabel feedback belum ada / gagal dimuat
  const [error, setError] = useState('')
  const [tab, setTab] = useState('info')
  const confirm = useConfirm()

  const load = useCallback(async () => {
    const [{ data: pd }, { data: cd }, fb] = await Promise.all([
      supabase.from('participants').select('*').eq('id', id).single(),
      supabase
        .from('checkins')
        .select('id, checked_in_at, checkpoint:checkpoints(name,kind), officer:profiles(full_name)')
        .eq('participant_id', id)
        .order('checked_in_at'),
      supabase.from('feedback').select('submitted_at, answers').eq('participant_id', id).maybeSingle(),
    ])
    setP(pd)
    setCheckins(cd || [])
    setFeedback(fb.error ? undefined : fb.data)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function cancel(c) {
    const ok = await confirm({
      title: tr('Batalkan check-in?', 'Cancel this check-in?'),
      body: tr(
        `Check-in "${c.checkpoint?.name}" pada ${formatTime(c.checked_in_at)} akan dihapus.`,
        `The "${c.checkpoint?.name}" check-in at ${formatTime(c.checked_in_at)} will be deleted.`
      ),
      confirmLabel: tr('Batalkan check-in', 'Cancel check-in'),
      danger: true,
    })
    if (!ok) return
    const { error } = await supabase.from('checkins').delete().eq('id', c.id)
    setError(error ? error.message : '')
    load()
  }

  if (!p) return <div className="detail">{tr('Memuat…', 'Loading…')}</div>

  const link = `${window.location.origin}/p/${p.qr_code}`

  return (
    <div className="detail">
      <div className="detail-bar">
        <button className="btn-ghost detail-back" onClick={onBack}>← {tr('Kembali ke daftar', 'Back to list')}</button>
        <div className="segmented detail-tabs" role="tablist" aria-label={tr('Detail peserta', 'Participant details')}>
          {[
            ['info', 'Info'],
            ['history', `${tr('Riwayat', 'History')} (${checkins.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              id={`pd-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`pd-panel-${key}`}
              className={tab === key ? 'active' : ''}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <h2>{p.full_name}</h2>

      {tab === 'info' ? (
        <div id="pd-panel-info" role="tabpanel" aria-labelledby="pd-tab-info">
          <dl>
            <div><dt>Company</dt><dd>{p.organization || '-'}</dd></div>
            <div><dt>Department</dt><dd>{p.division || '-'}</dd></div>
            <div><dt>Job Title</dt><dd>{p.job_title || '-'}</dd></div>
            <div><dt>{tr('Kategori', 'Category')}</dt><dd>{p.category || '-'}</dd></div>
            <div><dt>{tr('Kehadiran', 'Attendance')}</dt><dd>{p.attendance === 'attend' ? tr('Hadir', 'Attending') : p.attendance === 'absent' ? tr('Tidak hadir', 'Not attending') : '-'}</dd></div>
            <div><dt>Email</dt><dd>{p.email || '-'}</dd></div>
            <div><dt>{tr('Telepon', 'Phone')}</dt><dd>{p.phone || '-'}</dd></div>
            <div><dt>Unique ID</dt><dd><code>{p.qr_code}</code></dd></div>
          </dl>

          <div className="detail-qr">
            <QrCode code={p.qr_code} size={140} />
            <button className="btn" onClick={() => downloadQrCard({ code: p.qr_code, name: p.full_name, organization: p.organization })}>
              {tr('Unduh kartu QR', 'Download QR card')}
            </button>
          </div>

          <p className="hint">
            {tr('Link riwayat untuk peserta:', 'History link for the participant:')} <a href={link} target="_blank" rel="noreferrer">{link}</a>
          </p>
        </div>
      ) : (
        <div id="pd-panel-history" role="tabpanel" aria-labelledby="pd-tab-history">
          <h3>{tr('Riwayat check-in', 'Check-in history')}</h3>
          {error && <p className="notice error">{error}</p>}
          {checkins.length === 0 ? (
            <p className="empty">{tr('Belum pernah check-in di checkpoint mana pun.', 'Has not checked in at any checkpoint yet.')}</p>
          ) : (
            <ol className="timeline with-icons">
              {checkins.map((c) => (
                <li key={c.id}>
                  <KindIcon kind={c.checkpoint?.kind} size="sm" />
                  <time>{formatTime(c.checked_in_at)}</time>
                  <div>
                    <strong>{c.checkpoint?.name}</strong>
                    <span>{tr('Petugas', 'Staff')}: {c.officer?.full_name ?? tr('tidak diketahui', 'unknown')}</span>
                  </div>
                  {canCancel && <button className="btn-link danger" onClick={() => cancel(c)}>{tr('Batalkan', 'Cancel')}</button>}
                </li>
              ))}
            </ol>
          )}

          {feedback !== undefined && (
            <>
              <h3>Feedback</h3>
              {feedback ? (
                <p className="feedback-status done">
                  ✓ {tr(`Sudah mengisi feedback · ${formatTime(feedback.submitted_at)}`, `Feedback submitted · ${formatTime(feedback.submitted_at)}`)}
                  {feedback.answers?.overall && <span>{tr('Penilaian keseluruhan', 'Overall rating')}: {feedback.answers.overall}/5</span>}
                </p>
              ) : (
                <p className="feedback-status">{tr('Belum mengisi feedback.', 'Has not submitted feedback yet.')}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
