import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { supabase } from '../lib/supabase.js'
import { feedback } from '../lib/feedback.js'
import { formatTime } from '../lib/format.js'
import KindIcon from '../components/KindIcon.jsx'
import { useAuth } from '../lib/auth.jsx'
import { canCheckpoint } from '../lib/permissions.js'
import { isNetworkError, useConnection, withTimeout } from '../lib/connection.js'
import { tr } from '../lib/i18n.jsx'

const STORAGE_KEY = 'msf2026.checkpoint'
const READER_ID = 'qr-reader'
const SAME_CODE_COOLDOWN = 5000 // ms: QR yang sama diabaikan selama kamera masih mengarah padanya
const RETRYABLE = ['offline', 'timeout', 'error'] // gagal karena koneksi: QR yang sama boleh langsung di-scan ulang

export default function Scan() {
  const { profile } = useAuth()
  const [checkpoints, setCheckpoints] = useState([])
  const [cpId, setCpId] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [camError, setCamError] = useState('')
  const [okCount, setOkCount] = useState(0)
  const [online, setOnline] = useConnection()

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
    async (raw) => {
      const code = String(raw || '').trim().toLowerCase()
      if (!code || !cpRef.current || lockRef.current) return
      const now = Date.now()
      if (code === lastRef.current.code && now - lastRef.current.t < SAME_CODE_COOLDOWN) return

      lastRef.current = { code, t: now }
      lockRef.current = true
      let res
      if (!navigator.onLine) res = { status: 'offline' }
      else {
        setBusy(true)
        const { data, error, timedOut } = await withTimeout(
          supabase.rpc('perform_checkin', { p_code: code, p_checkpoint_id: cpRef.current })
        )
        setBusy(false)
        if (error && isNetworkError(error)) res = { status: timedOut ? 'timeout' : 'offline' }
        else res = error ? { status: 'error', message: error.message } : data
      }
      setOnline(res.status !== 'offline' && res.status !== 'timeout')
      if (RETRYABLE.includes(res.status)) lastRef.current = { code: '', t: 0 }
      setResult(res)
      feedback(res.status)
      if (res.status === 'ok') setOkCount((n) => n + 1)
    },
    [setOnline]
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
        <span>{tr('Checkpoint aktif', 'Active checkpoint')}</span>
        <span className="cp-picker">
          {current && <KindIcon kind={current.kind} size="lg" />}
          <select value={cpId} onChange={(e) => setCpId(e.target.value)}>
            {checkpoints.length === 0 && <option value="">{tr('Belum ada checkpoint yang bisa Anda pakai', 'No checkpoint available to you yet')}</option>}
            {checkpoints.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </span>
      </label>

      {online ? (
        <p className="conn on">{tr('Terhubung ke server', 'Connected to server')}</p>
      ) : (
        <p className="conn off" role="alert">
          {tr('Tidak ada internet. Scan tidak akan tercatat sampai koneksi kembali.', 'No internet. Scans will not be recorded until the connection is back.')}
        </p>
      )}

      <div className="viewfinder">
        <div id={READER_ID} />
        {camError && (
          <div className="cam-error">
            <p>{camError}</p>
          </div>
        )}
        {busy && <div className="busy">{tr('Memeriksa…', 'Checking…')}</div>}
      </div>

      <p className="scan-count">{tr(`${okCount} check-in berhasil sejak halaman ini dibuka`, `${okCount} successful check-in${okCount === 1 ? '' : 's'} since this page was opened`)}</p>

      {result && <ResultOverlay result={result} checkpoint={current} onClose={dismiss} />}
    </div>
  )
}

function describeCameraError(err) {
  const msg = String(err?.message || err)
  if (!window.isSecureContext) return tr('Kamera hanya bisa dipakai lewat HTTPS. Buka aplikasi dengan alamat https://.', 'The camera only works over HTTPS. Open the app with an https:// address.')
  if (/NotAllowed|Permission/i.test(msg)) return tr('Izin kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu muat ulang halaman.', 'Camera permission denied. Allow camera access in the browser settings, then reload the page.')
  if (/NotFound|Requested device not found/i.test(msg)) return tr('Kamera tidak ditemukan di perangkat ini. Pakai perangkat yang punya kamera.', 'No camera found on this device. Use a device with a camera.')
  if (/NotReadable|in use/i.test(msg)) return tr('Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut, lalu muat ulang halaman.', 'The camera is in use by another app. Close that app, then reload the page.')
  return tr(`Kamera tidak bisa dibuka: ${msg}`, `The camera could not be opened: ${msg}`)
}

const RESULT_COPY = {
  ok: { tone: 'go', get title() { return tr('Check-in berhasil', 'Check-in successful') } },
  duplicate: { tone: 'hold', get title() { return tr('Sudah check-in', 'Already checked in') } },
  no_badge: { tone: 'stop', get title() { return tr('Belum tukar badge', 'Badge not collected') } },
  not_found: { tone: 'stop', get title() { return tr('QR tidak terdaftar', 'QR not registered') } },
  inactive: { tone: 'stop', get title() { return tr('Checkpoint nonaktif', 'Checkpoint inactive') } },
  invalid_checkpoint: { tone: 'stop', get title() { return tr('Checkpoint tidak ditemukan', 'Checkpoint not found') } },
  forbidden: { tone: 'stop', get title() { return tr('Tidak punya akses', 'No access') } },
  offline: { tone: 'stop', get title() { return tr('Tidak ada internet', 'No internet') } },
  timeout: { tone: 'stop', get title() { return tr('Server tidak merespons', 'Server not responding') } },
  error: { tone: 'stop', get title() { return tr('Gagal terhubung ke server', 'Could not reach the server') } },
}

function ResultOverlay({ result, checkpoint, onClose }) {
  const copy = RESULT_COPY[result.status] || RESULT_COPY.error
  const p = result.participant

  let detail = ''
  if (result.status === 'duplicate') detail = tr(`Sudah tercatat ${formatTime(result.previous_at)}.`, `Already recorded ${formatTime(result.previous_at)}.`)
  else if (result.status === 'no_badge') detail = tr('Arahkan peserta ke meja penukaran badge terlebih dulu.', 'Send the participant to the badge desk first.')
  else if (result.status === 'not_found') detail = tr(`Kode "${result.code}" tidak ada di data peserta. Arahkan ke meja registrasi.`, `Code "${result.code}" is not in the participant list. Send them to the registration desk.`)
  else if (result.status === 'inactive') detail = tr('Pilih checkpoint lain atau minta admin mengaktifkannya.', 'Choose another checkpoint or ask an admin to activate it.')
  else if (result.status === 'invalid_checkpoint') detail = tr('Muat ulang halaman lalu pilih checkpoint lagi.', 'Reload the page and choose the checkpoint again.')
  else if (result.status === 'forbidden') detail = tr('Role Anda tidak diizinkan scan di checkpoint ini. Hubungi admin.', 'Your role may not scan at this checkpoint. Contact an admin.')
  else if (result.status === 'offline') detail = tr('Scan belum tercatat. Periksa Wi-Fi atau data seluler, lalu scan ulang.', 'The scan was not recorded. Check Wi-Fi or mobile data, then scan again.')
  else if (result.status === 'timeout') detail = tr('Status check-in belum pasti. Scan ulang: kalau ternyata sudah tercatat, hasilnya "Sudah check-in".', 'The check-in status is uncertain. Scan again: if it was already recorded, the result is "Already checked in".')
  else if (result.status === 'error') detail = tr(`${result.message}. Periksa koneksi internet, lalu scan ulang.`, `${result.message}. Check the internet connection, then scan again.`)

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
