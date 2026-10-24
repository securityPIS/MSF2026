import { useCallback, useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase.js'
import { KIND_LABEL, formatTime, pct } from '../../lib/format.js'
import KindIcon from '../../components/KindIcon.jsx'
import Pager from '../../components/Pager.jsx'
import { useAuth } from '../../lib/auth.jsx'
import { isCheckpointScoped } from '../../lib/permissions.js'

const FEED_PAGE = 5

export default function Dashboard() {
  const { profile } = useAuth()
  const scoped = isCheckpointScoped(profile)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [live, setLive] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [tick, setTick] = useState(0) // naik setiap ada check-in baru, memicu muat ulang feed
  const debounce = useRef(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('dashboard_stats')
    if (error) setError(error.message)
    else {
      setStats(data)
      setError('')
    }
    setTick((n) => n + 1)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('dashboard-checkins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => {
        clearTimeout(debounce.current)
        debounce.current = setTimeout(load, 600)
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))
    const interval = setInterval(load, 30000)
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
      clearTimeout(debounce.current)
    }
  }, [load])

  async function exportExcel() {
    setExporting(true)
    const rows = []
    const pageSize = 1000
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from('checkins')
        .select('checked_in_at, participant:participants(*), checkpoint:checkpoints(name), officer:profiles(full_name)')
        .order('checked_in_at')
        .range(from, from + pageSize - 1)
      if (error) {
        setError(error.message)
        setExporting(false)
        return
      }
      rows.push(...data)
      if (data.length < pageSize) break
    }
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Waktu: new Date(r.checked_in_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        Checkpoint: r.checkpoint?.name,
        Nama: r.participant?.full_name,
        Company: r.participant?.organization,
        Division: r.participant?.division,
        'Job Title': r.participant?.job_title,
        Kategori: r.participant?.category,
        'Kode QR': r.participant?.qr_code,
        Petugas: r.officer?.full_name,
      }))
    )
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'Check-in')
    XLSX.writeFile(book, `MSF2026-checkin-${new Date().toISOString().slice(0, 10)}.xlsx`)
    setExporting(false)
  }

  if (!stats) {
    return (
      <div className="page">
        <p>{error || 'Memuat dashboard…'}</p>
      </div>
    )
  }

  const total = stats.total_participants
  const badge = stats.checkpoints.find((c) => c.kind === 'badge')
  const arrived = badge?.unique_participants ?? 0

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Maritime Security Forum 2026</p>
          <h1>Dashboard</h1>
        </div>
        <div className="actions">
          <span className={`live ${live ? 'on' : ''}`}>{live ? 'Update langsung' : 'Menyambungkan…'}</span>
          <button className="btn" onClick={exportExcel} disabled={exporting}>
            {exporting ? 'Menyiapkan…' : 'Unduh laporan Excel'}
          </button>
        </div>
      </div>
      {error && <p className="notice error">{error}</p>}
      {scoped && (
        <p className="scope-note">
          Data sesuai role <b>{profile.perm.name}</b>: {stats.checkpoints.map((c) => c.name).join(', ') || 'belum ada checkpoint'}
        </p>
      )}

      {badge && (
        <section className="hero" style={{ marginTop: 0 }}>
          <p className="hero-label">Kedatangan peserta</p>
          <p className="hero-figure">
            <strong>
              {arrived} <small>/ {total}</small>
            </strong>
            peserta sudah menukar badge ({pct(arrived, total)})
          </p>
          <div className="bar" role="progressbar" aria-valuenow={arrived} aria-valuemin={0} aria-valuemax={total}>
            <span style={{ width: pct(arrived, total) }} />
          </div>
        </section>
      )}

      <section>
        <h2>Per checkpoint</h2>
        <ul className="cards cols cp-list">
          {stats.checkpoints.map((c) => (
            <li key={c.id} className={`card cp-row ${c.is_active ? '' : 'muted'}`}>
              <KindIcon kind={c.kind} />
              <div className="cp-row-name">
                <h3 className="card-title">{c.name}</h3>
                <p className="card-sub">
                  {KIND_LABEL[c.kind]}
                  {!c.is_active && ' · Nonaktif'}
                </p>
              </div>
              <div className="cp-row-stat"><b>{c.total_scans}</b><span>Total scan</span></div>
              <div className="cp-row-stat"><b>{c.today}</b><span>Hari ini</span></div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Check-in terbaru</h2>
        <RecentFeed tick={tick} />
      </section>
    </div>
  )
}

function RecentFeed({ tick }) {
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    const from = page * FEED_PAGE
    supabase
      .from('checkins')
      .select(
        'id, checked_in_at, participant:participants(full_name,organization), checkpoint:checkpoints(name,kind), officer:profiles(full_name)',
        { count: 'exact' }
      )
      .order('checked_in_at', { ascending: false })
      .range(from, from + FEED_PAGE - 1)
      .then(({ data, count }) => {
        if (cancelled) return
        setRows(data || [])
        setTotal(count ?? 0)
      })
    return () => {
      cancelled = true
    }
  }, [page, tick])

  if (rows === null) return <p className="hint">Memuat…</p>
  if (total === 0) {
    return <p className="empty">Belum ada check-in. Aktivitas scan petugas akan muncul di sini secara langsung.</p>
  }

  return (
    <>
      <p className="hint">
        {total} check-in, menampilkan {page * FEED_PAGE + 1}–{page * FEED_PAGE + rows.length}
      </p>
      <ul className="feed">
        {rows.map((r) => (
          <li key={r.id}>
            <KindIcon kind={r.checkpoint?.kind} size="sm" />
            <span className="feed-name">{r.participant?.full_name}</span>
            <span className="feed-meta">
              {r.checkpoint?.name}
              {r.officer?.full_name ? `, oleh ${r.officer.full_name}` : ''}
              {r.participant?.organization ? ` · ${r.participant.organization}` : ''}
            </span>
            <time>{formatTime(r.checked_in_at)}</time>
          </li>
        ))}
      </ul>
      <Pager page={page} total={total} pageSize={FEED_PAGE} onChange={setPage} />
    </>
  )
}
