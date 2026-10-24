import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { supabase } from '../../lib/supabase.js'
import { cleanTerm, formatTime } from '../../lib/format.js'
import KindIcon from '../../components/KindIcon.jsx'
import Pager from '../../components/Pager.jsx'
import QrCode, { downloadQrCard } from '../../components/QrCode.jsx'
import { useAuth } from '../../lib/auth.jsx'
import { useConfirm } from '../../components/ConfirmDialog.jsx'
import { canAddParticipants } from '../../lib/permissions.js'

const PAGE = 20
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const CATEGORIES = ['Umum', 'VIP', 'Pembicara', 'Media', 'Panitia']
const QR_UPLOAD_ID = 'qr-upload-reader'

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

  function pickLetter(l) {
    setLetter(l)
    setPage(0)
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
          <p className="eyebrow">Data peserta</p>
          <h1>Peserta</h1>
        </div>
        {!adding && (
          <div className="actions">
            {canAdd && <button className="btn btn-primary" onClick={startAdd}>+ Tambah peserta</button>}
            {isAdmin && <Link className="btn" to="/admin/import">Impor dari Excel</Link>}
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
        aria-label="Cari peserta"
        placeholder="Cari nama, instansi, atau kode QR"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setPage(0)
        }}
      />

      <div className="letters" role="group" aria-label="Saring berdasarkan huruf awal nama">
        <button className={`letter all ${letter === '' ? 'active' : ''}`} aria-pressed={letter === ''} onClick={() => pickLetter('')}>
          Semua
        </button>
        {LETTERS.map((l) => (
          <button key={l} className={`letter ${letter === l ? 'active' : ''}`} aria-pressed={letter === l} onClick={() => pickLetter(l)}>
            {l}
          </button>
        ))}
      </div>

      {total !== null && (
        <p className="hint">
          {total} peserta{letter ? ` berawalan ${letter}` : ''}
          {total > 0 ? `, menampilkan ${page * PAGE + 1}–${page * PAGE + rows.length}` : ''}
        </p>
      )}

      {empty ? (
        <p className="empty">
          Belum ada data peserta.{' '}
          {isAdmin ? 'Tambahkan peserta atau impor file Excel dari panitia untuk memulai.' : canAdd ? 'Tambahkan peserta untuk memulai.' : 'Admin perlu mengisi data peserta terlebih dulu.'}
        </p>
      ) : (
        <div className={`split ${selected ? 'has-selection' : ''}`}>
          <div className="list-col">
            {total === 0 ? (
              <p className="empty">Tidak ada peserta yang cocok.</p>
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
            <div className="detail empty">Pilih peserta untuk melihat QR code, lokasi, dan waktu check-in.</div>
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
  const [f, setF] = useState({ full_name: '', organization: '', category: 'Umum', email: '', phone: '', qr_code: '' })
  const [busy, setBusy] = useState(false)
  const [reading, setReading] = useState(false)
  const [qrNote, setQrNote] = useState(null)
  const [error, setError] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const ownCode = normalizeCode(f.qr_code)

  async function readQrImage(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // supaya file yang sama bisa dipilih lagi
    if (!file) return
    setReading(true)
    setQrNote(null)
    setError('')
    const reader = new Html5Qrcode(QR_UPLOAD_ID, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false })
    try {
      const code = normalizeCode(await reader.scanFile(file, false))
      if (!code) throw new Error('kosong')
      set('qr_code', code)
      const owner = await findByCode(code)
      setQrNote(owner
        ? { tone: 'error', text: `Kode ${code} sudah terdaftar atas nama ${owner.full_name}.` }
        : { tone: 'ok', text: `QR terbaca: ${code}. Kode ini yang akan dipakai, tidak dibuat QR baru.` })
    } catch {
      setQrNote({ tone: 'error', text: 'QR tidak terbaca dari gambar. Coba gambar yang lebih jelas, atau ketik kodenya.' })
    } finally {
      reader.clear()
      setReading(false)
    }
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = { full_name: f.full_name.trim() }
    for (const k of ['organization', 'category', 'email', 'phone']) payload[k] = f[k].trim() || null
    if (ownCode) payload.qr_code = ownCode

    // Tanpa kode sendiri, kode QR dibuat otomatis oleh database. Kalau kebetulan bentrok dengan kode lain, coba lagi.
    let result
    for (let attempt = 0; attempt < (ownCode ? 1 : 3); attempt++) {
      result = await supabase.from('participants').insert(payload).select('id,qr_code,full_name,organization,category').single()
      if (result.error?.code !== '23505') break
    }
    if (result.error?.code === '23505' && ownCode) {
      const owner = await findByCode(ownCode)
      setBusy(false)
      setError(`Kode QR ${ownCode} sudah dipakai${owner ? ` oleh ${owner.full_name}` : ' peserta lain'}. Periksa lagi gambar atau kodenya.`)
      return
    }
    setBusy(false)
    if (result.error) {
      setError(`Peserta gagal disimpan: ${result.error.message}`)
      return
    }
    onCreated({ ...result.data, existingQr: !!ownCode })
  }

  return (
    <form className="panel form-grid add-form" onSubmit={save}>
      <h2>Tambah peserta</h2>
      <p className="hint full">Sudah punya QR code? Upload gambarnya atau ketik kodenya. Kalau dikosongkan, kode QR dibuat otomatis setelah disimpan.</p>
      <div className="full qr-upload">
        <label>
          Kode QR yang sudah ada (opsional)
          <input
            value={f.qr_code}
            onChange={(e) => {
              set('qr_code', e.target.value)
              setQrNote(null)
              setError('')
            }}
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Kosongkan untuk buat QR baru"
          />
        </label>
        <label className={`btn ${reading ? 'disabled' : ''}`}>
          {reading ? 'Membaca…' : 'Upload gambar QR'}
          <input type="file" accept="image/*" hidden disabled={reading} onChange={readQrImage} />
        </label>
        {f.qr_code && (
          <button type="button" className="btn-ghost" onClick={() => { set('qr_code', ''); setQrNote(null) }}>Hapus</button>
        )}
        <div id={QR_UPLOAD_ID} hidden />
      </div>
      {qrNote && <p className={`full ${qrNote.tone === 'error' ? 'form-error' : 'hint'}`} role="status">{qrNote.text}</p>}
      <label className="full">
        Nama lengkap (wajib)
        <input required autoFocus value={f.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Contoh: Budi Santoso" />
      </label>
      <label className="full">
        Instansi
        <input value={f.organization} onChange={(e) => set('organization', e.target.value)} placeholder="Contoh: Bakamla RI" />
      </label>
      <label>
        Kategori
        <input list="participant-categories" value={f.category} onChange={(e) => set('category', e.target.value)} />
        <datalist id="participant-categories">
          {CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <label>
        Telepon
        <input type="tel" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08…" />
      </label>
      <label className="full">
        Email
        <input type="email" inputMode="email" autoCapitalize="none" value={f.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      {error && <p className="form-error full" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Batal</button>
        <button className="btn btn-primary" disabled={busy || reading}>
          {busy ? 'Menyimpan…' : ownCode ? 'Simpan dengan QR ini' : 'Simpan & buat QR'}
        </button>
      </div>
    </form>
  )
}

function CreatedCard({ p, onAgain, onOpen, onClose }) {
  return (
    <section className="panel created" style={{ marginTop: 0, marginBottom: '1.25rem' }} role="status">
      <p className="created-badge">✓ Peserta tersimpan, {p.existingQr ? 'memakai QR code yang sudah ada' : 'QR code siap'}</p>
      <QrCode code={p.qr_code} size={220} />
      <div className="created-info">
        <h2>{p.full_name}</h2>
        {p.organization && <p className="card-sub">{p.organization}</p>}
        <p><code>{p.qr_code}</code></p>
      </div>
      <div className="created-actions">
        <button className="btn btn-primary" onClick={() => downloadQrCard({ code: p.qr_code, name: p.full_name, organization: p.organization })}>
          Unduh kartu QR
        </button>
        <button className="btn" onClick={onAgain}>+ Tambah lagi</button>
        <button className="btn" onClick={onOpen}>Lihat detail</button>
        <button className="btn-ghost" onClick={onClose}>Tutup</button>
      </div>
    </section>
  )
}

function ParticipantDetail({ id, canCancel, onBack }) {
  const [p, setP] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [error, setError] = useState('')
  const confirm = useConfirm()

  const load = useCallback(async () => {
    const [{ data: pd }, { data: cd }] = await Promise.all([
      supabase.from('participants').select('*').eq('id', id).single(),
      supabase
        .from('checkins')
        .select('id, checked_in_at, checkpoint:checkpoints(name,kind), officer:profiles(full_name)')
        .eq('participant_id', id)
        .order('checked_in_at'),
    ])
    setP(pd)
    setCheckins(cd || [])
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function cancel(c) {
    const ok = await confirm({
      title: 'Batalkan check-in?',
      body: `Check-in "${c.checkpoint?.name}" pada ${formatTime(c.checked_in_at)} akan dihapus.`,
      confirmLabel: 'Batalkan check-in',
      danger: true,
    })
    if (!ok) return
    const { error } = await supabase.from('checkins').delete().eq('id', c.id)
    setError(error ? error.message : '')
    load()
  }

  if (!p) return <div className="detail">Memuat…</div>

  const link = `${window.location.origin}/p/${p.qr_code}`

  return (
    <div className="detail">
      <button className="btn-ghost detail-back" onClick={onBack}>← Kembali ke daftar</button>
      <h2>{p.full_name}</h2>
      <dl>
        <div><dt>Instansi</dt><dd>{p.organization || '-'}</dd></div>
        <div><dt>Kategori</dt><dd>{p.category || '-'}</dd></div>
        <div><dt>Email</dt><dd>{p.email || '-'}</dd></div>
        <div><dt>Telepon</dt><dd>{p.phone || '-'}</dd></div>
        <div><dt>Kode QR</dt><dd><code>{p.qr_code}</code></dd></div>
      </dl>

      <div className="detail-qr">
        <QrCode code={p.qr_code} size={140} />
        <button className="btn" onClick={() => downloadQrCard({ code: p.qr_code, name: p.full_name, organization: p.organization })}>
          Unduh kartu QR
        </button>
      </div>

      <h3>Riwayat check-in</h3>
      {error && <p className="notice error">{error}</p>}
      {checkins.length === 0 ? (
        <p className="empty">Belum pernah check-in di checkpoint mana pun.</p>
      ) : (
        <ol className="timeline with-icons">
          {checkins.map((c) => (
            <li key={c.id}>
              <KindIcon kind={c.checkpoint?.kind} size="sm" />
              <time>{formatTime(c.checked_in_at)}</time>
              <div>
                <strong>{c.checkpoint?.name}</strong>
                <span>Petugas: {c.officer?.full_name ?? 'tidak diketahui'}</span>
              </div>
              {canCancel && <button className="btn-link danger" onClick={() => cancel(c)}>Batalkan</button>}
            </li>
          ))}
        </ol>
      )}

      <p className="hint">
        Link riwayat untuk peserta: <a href={link} target="_blank" rel="noreferrer">{link}</a>
      </p>
    </div>
  )
}
