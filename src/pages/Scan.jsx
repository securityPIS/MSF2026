import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { supabase } from '../lib/supabase.js'
import { feedback } from '../lib/feedback.js'
import { cleanTerm, formatTime } from '../lib/format.js'
import KindIcon from '../components/KindIcon.jsx'
import { useAuth } from '../lib/auth.jsx'
import { canCheckpoint } from '../lib/permissions.js'

const STORAGE_KEY = 'msf2026.checkpoint'
const READER_ID = 'qr-reader'
const SAME_CODE_COOLDOWN = 5000 // ms: QR yang sama diabaikan selama kamera masih mengarah padanya

export default function Scan() {
  const { profile } = useAuth()
  const [checkpoints, setCheckpoints] = useState([])
  const [cpId, setCpId] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [camError, setCamError] = useState('')
  const [okCount, setOkCount] = useState(0)

  const cpRef = useRef(cpId)
  const lockRef = useRef(false)
  const lastRef = useRef({ code: '', t: 0 })

  useEffect(() => {
    cpRef.current = cpId
    if (cpId) localStorage.setItem(STORAGE_KEY, cpId)
  }, [cpId])

  useEffect(() => {
    supabase
      .from('checkpoints')
      .select('id,name,kind')
      .eq('is_active', true)
      .order('sort_order')
      .order('name')
      .then(({ data }) => {
        // Hanya checkpoint yang diizinkan role petugas ini
        const list = (data || []).filter((c) => canCheckpoint(profile, c.id))
        setCheckpoints(list)
        if (list.length && !list.some((c) => c.id === cpRef.current)) setCpId(list[0].id)
        if (!list.length) setCpId('')
      })
  }, [profile])

  // Hasil scan tetap tampil sampai petugas menekan Approve
  const dismiss = useCallback(() => {
    lastRef.current = { ...lastRef.current, t: Date.now() }
    setResult(null)
    lockRef.current = false
  }, [])

  const submitCode = useCallback(
    async (raw, { manual = false } = {}) => {
      const code = String(raw || '').trim().toLowerCase()
      if (!code || !cpRef.current || lockRef.current) return
      const now = Date.now()
      if (!manual && code === lastRef.current.code && now - lastRef.current.t < SAME_CODE_COOLDOWN) return

      lastRef.current = { code, t: now }
      lockRef.current = true
      setBusy(true)
      const { data, error } = await supabase.rpc('perform_checkin', {
        p_code: code,
        p_checkpoint_id: cpRef.current,
      })
      setBusy(false)

      const res = error ? { status: 'error', message: error.message } : data
      setResult(res)
      feedback(res.status)
      if (res.status === 'ok') setOkCount((n) => n + 1)
    },
    []
  )

  useEffect(() => {
    const scanner = new Html5Qrcode(READER_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    })
    let cancelled = false

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (w, h) => {
            const s = Math.floor(Math.min(w, h) * 0.72)
            return { width: s, height: s }
          },
        },
        (text) => submitCode(text),
        () => {}
      )
      .then(() => {
        if (cancelled) scanner.stop().then(() => scanner.clear()).catch(() => {})
      })
      .catch((err) => {
        if (!cancelled) setCamError(describeCameraError(err))
      })

    return () => {
      cancelled = true
      if (scanner.isScanning) scanner.stop().then(() => scanner.clear()).catch(() => {})
    }
  }, [submitCode])

  const current = checkpoints.find((c) => c.id === cpId)

  return (
    <div className="scan">
      <label className="cp-select">
        <span>Checkpoint aktif</span>
        <span className="cp-picker">
          {current && <KindIcon kind={current.kind} size="lg" />}
          <select value={cpId} onChange={(e) => setCpId(e.target.value)}>
            {checkpoints.length === 0 && <option value="">Belum ada checkpoint yang bisa Anda pakai</option>}
            {checkpoints.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </span>
      </label>

      <div className="viewfinder">
        <div id={READER_ID} />
        {camError && (
          <div className="cam-error">
            <p>{camError}</p>
          </div>
        )}
        {busy && <div className="busy">Memeriksa…</div>}
      </div>

      <p className="scan-count">{okCount} check-in berhasil sejak halaman ini dibuka</p>

      <ManualEntry onSubmit={submitCode} disabled={busy || !cpId} />

      {result && <ResultOverlay result={result} checkpoint={current} onClose={dismiss} />}
    </div>
  )
}

function describeCameraError(err) {
  const msg = String(err?.message || err)
  if (!window.isSecureContext) return 'Kamera hanya bisa dipakai lewat HTTPS. Buka aplikasi dengan alamat https://.'
  if (/NotAllowed|Permission/i.test(msg)) return 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu muat ulang halaman.'
  if (/NotFound|Requested device not found/i.test(msg)) return 'Kamera tidak ditemukan di perangkat ini. Gunakan pencarian manual di bawah.'
  if (/NotReadable|in use/i.test(msg)) return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut, lalu muat ulang halaman.'
  return `Kamera tidak bisa dibuka: ${msg}`
}

const RESULT_COPY = {
  ok: { tone: 'go', title: 'Check-in berhasil' },
  duplicate: { tone: 'hold', title: 'Sudah check-in' },
  no_badge: { tone: 'stop', title: 'Belum tukar badge' },
  not_found: { tone: 'stop', title: 'QR tidak terdaftar' },
  inactive: { tone: 'stop', title: 'Checkpoint nonaktif' },
  invalid_checkpoint: { tone: 'stop', title: 'Checkpoint tidak ditemukan' },
  forbidden: { tone: 'stop', title: 'Tidak punya akses' },
  error: { tone: 'stop', title: 'Gagal terhubung ke server' },
}

function ResultOverlay({ result, checkpoint, onClose }) {
  const copy = RESULT_COPY[result.status] || RESULT_COPY.error
  const p = result.participant

  let detail = ''
  if (result.status === 'duplicate') detail = `Sudah tercatat ${formatTime(result.previous_at)}.`
  else if (result.status === 'no_badge') detail = 'Arahkan peserta ke meja penukaran badge terlebih dulu.'
  else if (result.status === 'not_found') detail = `Kode "${result.code}" tidak ada di data peserta. Arahkan ke meja registrasi.`
  else if (result.status === 'inactive') detail = 'Pilih checkpoint lain atau minta admin mengaktifkannya.'
  else if (result.status === 'invalid_checkpoint') detail = 'Muat ulang halaman lalu pilih checkpoint lagi.'
  else if (result.status === 'forbidden') detail = 'Role Anda tidak diizinkan scan di checkpoint ini. Hubungi admin.'
  else if (result.status === 'error') detail = `${result.message}. Periksa koneksi internet, lalu scan ulang.`

  return (
    <div className={`overlay tone-${copy.tone}`} role="alertdialog" aria-live="assertive">
      <div className="overlay-inner">
        <p className="overlay-status">{copy.title}</p>
        {p && (
          <>
            <h2 className="overlay-name">{p.name}</h2>
            {p.organization && <p className="overlay-org">{p.organization}</p>}
            {p.category && <p className="overlay-cat">{p.category}</p>}
          </>
        )}
        {detail && <p className="overlay-detail">{detail}</p>}
        {checkpoint && (
          <p className="overlay-cp">
            <KindIcon kind={checkpoint.kind} plain />
            {checkpoint.name}
          </p>
        )}
        <button className="overlay-btn" onClick={onClose} autoFocus>Approve</button>
      </div>
    </div>
  )
}

function ManualEntry({ onSubmit, disabled }) {
  const [code, setCode] = useState('')
  const [q, setQ] = useState('')
  const [hits, setHits] = useState([])

  useEffect(() => {
    const term = cleanTerm(q)
    if (term.length < 2) {
      setHits([])
      return
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('participants')
        .select('id,qr_code,full_name,organization')
        .ilike('full_name', `%${term}%`)
        .order('full_name')
        .limit(8)
      setHits(data || [])
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <details className="manual">
      <summary>QR tidak terbaca? Cari manual</summary>
      <div className="manual-body">
        <form
          className="manual-row"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(code, { manual: true })
            setCode('')
          }}
        >
          <input
            aria-label="Unique ID"
            placeholder="Ketik Unique ID"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <button className="btn" disabled={disabled || !code.trim()}>Check-in</button>
        </form>
        <input aria-label="Cari nama peserta" type="search" placeholder="Cari nama peserta" value={q} onChange={(e) => setQ(e.target.value)} />
        {hits.length > 0 && (
          <ul className="hits">
            {hits.map((h) => (
              <li key={h.id}>
                <div>
                  <strong>{h.full_name}</strong>
                  {h.organization && <span>{h.organization}</span>}
                </div>
                <button className="btn" disabled={disabled} onClick={() => onSubmit(h.qr_code, { manual: true })}>
                  Check-in
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}
