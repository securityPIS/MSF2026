import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase.js'

const FIELDS = [
  { key: 'qr_code', label: 'Kode QR', required: true, guess: ['kode qr', 'qr code', 'qr', 'barcode', 'kode', 'code', 'token'] },
  { key: 'full_name', label: 'Nama', required: true, guess: ['nama', 'nama lengkap', 'name', 'full name'] },
  { key: 'organization', label: 'Instansi', guess: ['instansi', 'organisasi', 'organization', 'perusahaan', 'company', 'institusi'] },
  { key: 'email', label: 'Email', guess: ['email', 'e-mail', 'surel'] },
  { key: 'phone', label: 'Telepon', guess: ['telepon', 'no hp', 'hp', 'phone', 'whatsapp', 'wa'] },
  { key: 'category', label: 'Kategori', guess: ['kategori', 'category', 'jenis', 'tipe', 'type'] },
]
// Instansi ditebak lebih dulu supaya kolom "Nama Instansi" tidak terbaca sebagai nama peserta
const GUESS_ORDER = ['qr_code', 'organization', 'full_name', 'email', 'phone', 'category']
const BATCH = 500

function guessMapping(headers) {
  const norm = headers.map((h) => String(h).toLowerCase().trim())
  const used = new Set()
  const map = {}
  for (const key of GUESS_ORDER) {
    const f = FIELDS.find((x) => x.key === key)
    let idx = norm.findIndex((h, i) => !used.has(i) && f.guess.includes(h))
    if (idx < 0) idx = norm.findIndex((h, i) => !used.has(i) && f.guess.some((g) => h.includes(g)))
    if (idx >= 0) used.add(idx)
    map[key] = idx
  }
  return map
}

function analyze(rows, map) {
  const valid = []
  const issues = []
  const seen = new Map()
  const cell = (r, k) => (map[k] >= 0 ? String(r[map[k]] ?? '').trim() : '')
  const optional = FIELDS.filter((f) => !f.required && map[f.key] >= 0).map((f) => f.key)
  const now = new Date().toISOString()

  rows.forEach((r, i) => {
    const line = i + 2 // baris 1 = header
    const code = cell(r, 'qr_code').toLowerCase()
    const name = cell(r, 'full_name')
    if (!code) return issues.push(`Baris ${line}: kode QR kosong`)
    if (!name) return issues.push(`Baris ${line}: nama kosong`)
    if (seen.has(code)) return issues.push(`Baris ${line}: kode ${code} sama dengan baris ${seen.get(code)}, dilewati`)
    seen.set(code, line)
    const rec = { qr_code: code, full_name: name, updated_at: now }
    for (const k of optional) rec[k] = cell(r, k) || null
    valid.push(rec)
  })
  return { valid, issues }
}

export default function Import() {
  const [book, setBook] = useState(null)
  const [fileName, setFileName] = useState('')
  const [sheet, setSheet] = useState('')
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [map, setMap] = useState({})
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState(null)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus(null)
    try {
      const wb = XLSX.read(await file.arrayBuffer())
      setBook(wb)
      setFileName(file.name)
      pickSheet(wb, wb.SheetNames[0])
    } catch (err) {
      setStatus({ type: 'error', text: `File tidak bisa dibaca: ${err.message}` })
    }
  }

  function pickSheet(wb, name) {
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: false })
    const hdr = (aoa[0] || []).map((h) => String(h).trim())
    const body = aoa.slice(1).filter((r) => r.some((c) => String(c).trim() !== ''))
    setSheet(name)
    setHeaders(hdr)
    setRows(body)
    setMap(guessMapping(hdr))
  }

  const { valid, issues } = useMemo(() => analyze(rows, map), [rows, map])
  const mappingReady = map.qr_code >= 0 && map.full_name >= 0

  async function runImport() {
    setBusy(true)
    setStatus(null)
    setProgress(0)
    for (let i = 0; i < valid.length; i += BATCH) {
      const chunk = valid.slice(i, i + BATCH)
      const { error } = await supabase.from('participants').upsert(chunk, { onConflict: 'qr_code' })
      if (error) {
        setBusy(false)
        setStatus({ type: 'error', text: `Impor berhenti: ${error.message}. ${i} peserta sudah tersimpan sebelum error.` })
        return
      }
      setProgress(i + chunk.length)
    }
    setBusy(false)
    setStatus({
      type: 'ok',
      text: `${valid.length} peserta tersimpan. Peserta dengan kode QR yang sudah ada diperbarui, bukan diduplikasi.`,
    })
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Peserta</p>
          <h1>Impor dari Excel</h1>
        </div>
        <div className="actions">
          <Link className="btn" to="/admin/participants">Kembali ke Peserta</Link>
        </div>
      </div>

      <ol className="steps">
        <li className="panel">
          <h2>1. Pilih file</h2>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} />
          {book && book.SheetNames.length > 1 && (
            <label>
              Sheet
              <select value={sheet} onChange={(e) => pickSheet(book, e.target.value)}>
                {book.SheetNames.map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
          )}
          {fileName && <p className="hint">{fileName}: {rows.length} baris data</p>}
        </li>

        {headers.length > 0 && (
          <li className="panel">
            <h2>2. Cocokkan kolom</h2>
            <p className="hint">Kolom sudah ditebak otomatis dari judul kolom. Periksa dan ubah bila perlu.</p>
            <div className="form-grid">
              {FIELDS.map((f) => (
                <label key={f.key}>
                  {f.label}{f.required ? ' (wajib)' : ''}
                  <select value={map[f.key] ?? -1} onChange={(e) => setMap((m) => ({ ...m, [f.key]: Number(e.target.value) }))}>
                    <option value={-1}>Tidak dipakai</option>
                    {headers.map((h, i) => <option key={i} value={i}>{h || `Kolom ${i + 1}`}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </li>
        )}

        {headers.length > 0 && mappingReady && (
          <li className="panel">
            <h2>3. Periksa lalu impor</h2>
            <p>
              <strong>{valid.length}</strong> peserta siap diimpor
              {issues.length > 0 && <>, <strong>{issues.length}</strong> baris dilewati</>}.
            </p>
            {issues.length > 0 && (
              <ul className="issues">
                {issues.slice(0, 50).map((m, i) => <li key={i}>{m}</li>)}
                {issues.length > 50 && <li>…dan {issues.length - 50} lainnya</li>}
              </ul>
            )}
            {valid.length === 0 && issues.length > 0 && (
              <p className="hint">
                Kalau semua kode QR kosong, kemungkinan kolom QR di Excel berisi gambar, bukan teks. Kode perlu diubah dulu menjadi teks.
              </p>
            )}
            {valid.length > 0 && (
              <>
                <p className="hint">Contoh {Math.min(5, valid.length)} peserta pertama:</p>
                <ul className="cards cols preview">
                  {valid.slice(0, 5).map((r) => (
                    <li key={r.qr_code} className="card">
                      <dl>
                        {FIELDS.filter((f) => map[f.key] >= 0).map((f) => (
                          <div key={f.key}>
                            <dt>{f.label}</dt>
                            <dd>{r[f.key] || '-'}</dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="actions">
              <button className="btn btn-primary btn-block" onClick={runImport} disabled={busy || valid.length === 0}>
                {busy ? `Mengimpor ${progress}/${valid.length}…` : `Impor ${valid.length} peserta`}
              </button>
            </div>
          </li>
        )}
      </ol>

      {status && <p className={`notice ${status.type}`} role="status">{status.text}</p>}
    </div>
  )
}
