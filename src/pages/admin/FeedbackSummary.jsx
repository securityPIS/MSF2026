import { useCallback, useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase.js'
import { formatTime, pct } from '../../lib/format.js'
import Pager from '../../components/Pager.jsx'
import { locale, tr } from '../../lib/i18n.jsx'
import { L, OTHER, QUESTIONS, RATINGS, otherKey } from '../../lib/feedbackForm.js'

// Ringkasan isian /feedback: angka utama, distribusi tiap pertanyaan sesuai urutan formulir, jawaban terbuka,
// dan unduh Excel. Data dibaca langsung dari tabel feedback (policy feedback_staff_select).
const PAGE_SIZE = 1000
const TEXT_PAGE = 5
const NPS_GROUPS = [
  { key: 'det', min: 0, max: 6, cls: 'neg', label: { id: 'Tidak merekomendasikan (0–6)', en: 'Detractors (0–6)' } },
  { key: 'pas', min: 7, max: 8, cls: 'mid', label: { id: 'Netral (7–8)', en: 'Passives (7–8)' } },
  { key: 'pro', min: 9, max: 10, cls: 'pos', label: { id: 'Merekomendasikan (9–10)', en: 'Promoters (9–10)' } },
]

const qNum = (q) => QUESTIONS.indexOf(q) + 1
const nameOf = (r) => r.name || r.participant?.full_name || '—'
const certNo = (r) => `MSF2026-${String(r.id).padStart(4, '0')}`
const fmt1 = (n) => (n == null ? '–' : n.toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
const jakartaDay = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max
const otherText = (v) => String(v ?? '').trim()

async function fetchAll() {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*, participant:participants(full_name)')
      .order('submitted_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

// Hitung ringkasan per pertanyaan. Jawaban dari versi formulir lama tanpa key yang sama diabaikan.
function summarize(rows) {
  const today = jakartaDay(Date.now())
  const out = { total: rows.length, today: rows.filter((r) => jakartaDay(r.submitted_at) === today).length, questions: {} }
  for (const q of QUESTIONS) {
    const answers = rows.map((r) => r.answers ?? {})
    if (q.type === 'rating') {
      const vals = answers.map((a) => a[q.key]).filter((v) => isInt(v, 1, 5))
      const counts = [1, 2, 3, 4, 5].map((n) => vals.filter((v) => v === n).length)
      out.questions[q.key] = { n: vals.length, counts, avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null }
    } else if (q.type === 'scale') {
      const vals = answers.map((a) => a[q.key]).filter((v) => isInt(v, 0, 10))
      const counts = Array.from({ length: 11 }, (_, n) => vals.filter((v) => v === n).length)
      const groups = Object.fromEntries(NPS_GROUPS.map((g) => [g.key, vals.filter((v) => v >= g.min && v <= g.max).length]))
      const nps = vals.length ? Math.round(((groups.pro - groups.det) / vals.length) * 100) : null
      out.questions[q.key] = { n: vals.length, counts, groups, nps, avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null }
    } else if (q.type === 'choice' || q.type === 'multi') {
      const values = [...q.options.map((o) => o.value), ...(q.other ? [OTHER] : [])]
      const picks = answers.map((a) => (q.type === 'multi' ? (Array.isArray(a[q.key]) ? a[q.key] : []) : a[q.key] ? [a[q.key]] : []))
      const answered = picks.filter((p) => p.length).length
      const items = values.map((value) => ({
        value,
        label: value === OTHER ? { id: 'Lainnya', en: 'Other' } : q.options.find((o) => o.value === value).label,
        count: picks.filter((p) => p.includes(value)).length,
      }))
      // Isian "Lainnya": dikelompokkan tanpa membedakan huruf besar/kecil
      const others = new Map()
      for (const a of answers) {
        const t = otherText(a[otherKey(q)])
        if (!t) continue
        const k = t.toLowerCase()
        others.set(k, { text: others.get(k)?.text ?? t, count: (others.get(k)?.count ?? 0) + 1 })
      }
      out.questions[q.key] = { n: answered, items, others: [...others.values()].sort((a, b) => b.count - a.count) }
    } else if (q.type === 'text') {
      const list = rows
        .map((r) => ({ id: r.id, name: nameOf(r), at: r.submitted_at, text: otherText(r.answers?.[q.key]) }))
        .filter((x) => x.text)
      out.questions[q.key] = { n: list.length, list }
    }
  }
  const ratingQs = QUESTIONS.filter((q) => q.type === 'rating').map((q) => out.questions[q.key])
  const all = ratingQs.reduce((acc, s) => ({ sum: acc.sum + (s.avg ?? 0) * s.n, n: acc.n + s.n }), { sum: 0, n: 0 })
  out.ratingAvg = all.n ? all.sum / all.n : null
  return out
}

function exportExcel(rows) {
  const sheet = XLSX.utils.json_to_sheet(
    rows.map((r) => {
      const a = r.answers ?? {}
      const row = {
        [tr('No. sertifikat', 'Certificate no.')]: certNo(r),
        [tr('Waktu', 'Time')]: new Date(r.submitted_at).toLocaleString(locale(), { timeZone: 'Asia/Jakarta' }),
        [tr('Nama', 'Name')]: nameOf(r),
      }
      for (const q of QUESTIONS) {
        const v = a[q.key]
        row[`${qNum(q)}. ${L(q.label)}`] = Array.isArray(v) ? v.join('; ') : v ?? ''
        if (q.other) row[`${qNum(q)}. ${tr('Lainnya', 'Other')}`] = a[otherKey(q)] ?? ''
      }
      return row
    })
  )
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Feedback')
  XLSX.writeFile(book, `MSF2026-feedback-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export default function FeedbackSummary() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await fetchAll())
      setError('')
      setUpdated(new Date())
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [load])

  const sum = useMemo(() => (rows ? summarize(rows) : null), [rows])

  if (!sum) {
    return (
      <div className="page">
        <p>{error ? `${tr('Gagal memuat feedback', 'Could not load feedback')}: ${error}` : tr('Memuat ringkasan feedback…', 'Loading feedback summary…')}</p>
      </div>
    )
  }

  const overall = sum.questions.overall
  const rec = sum.questions.recommend

  return (
    <div className="page fbs">
      <div className="page-head">
        <div>
          <p className="eyebrow">Maritime Security Forum 2026</p>
          <h1>{tr('Ringkasan feedback', 'Feedback summary')}</h1>
        </div>
        <div className="actions">
          <button className="btn" onClick={load} disabled={loading}>{loading ? tr('Memuat…', 'Loading…') : tr('Muat ulang', 'Refresh')}</button>
          <button className="btn" onClick={() => exportExcel(rows)} disabled={!rows.length}>{tr('Unduh Excel', 'Download Excel')}</button>
        </div>
      </div>
      {error && <p className="notice error">{tr('Gagal memuat ulang', 'Could not refresh')}: {error}</p>}
      {updated && <p className="hint fbs-updated">{tr('Diperbarui', 'Updated')} {formatTime(updated.toISOString())} · {tr('otomatis tiap menit', 'refreshes every minute')}</p>}

      <ul className="fbs-tiles">
        <li className="fbs-tile">
          <span>{tr('Respons masuk', 'Responses')}</span>
          <b>{sum.total}</b>
          <small>{tr(`${sum.today} hari ini`, `${sum.today} today`)}</small>
        </li>
        <li className="fbs-tile">
          <span>{tr('Kepuasan keseluruhan', 'Overall satisfaction')}</span>
          <b>{fmt1(overall.avg)}<i>/5</i></b>
          <small>{tr(`Pertanyaan ${qNum(QUESTIONS.find((q) => q.key === 'overall'))} · ${overall.n} jawaban`, `Question ${qNum(QUESTIONS.find((q) => q.key === 'overall'))} · ${overall.n} answers`)}</small>
        </li>
        <li className="fbs-tile">
          <span>Net Promoter Score</span>
          <b>{rec.nps == null ? '–' : rec.nps > 0 ? `+${rec.nps}` : rec.nps}</b>
          <small>{tr(`Skala −100 s.d. +100 · ${rec.n} jawaban`, `Scale −100 to +100 · ${rec.n} answers`)}</small>
        </li>
        <li className="fbs-tile">
          <span>{tr('Rata-rata semua rating', 'Average of all ratings')}</span>
          <b>{fmt1(sum.ratingAvg)}<i>/5</i></b>
          <small>{tr(`${QUESTIONS.filter((q) => q.type === 'rating').length} pertanyaan rating`, `${QUESTIONS.filter((q) => q.type === 'rating').length} rating questions`)}</small>
        </li>
      </ul>

      {sum.total === 0 ? (
        <p className="empty">{tr('Belum ada feedback masuk. Ringkasan akan muncul setelah peserta mengisi /feedback.', 'No feedback yet. The summary appears once participants fill in /feedback.')}</p>
      ) : (
        <Sections sum={sum} />
      )}
    </div>
  )
}

// Pertanyaan dikelompokkan sesuai bagian A–D di formulir
function Sections({ sum }) {
  const groups = []
  for (const q of QUESTIONS) {
    if (q.section || !groups.length) groups.push({ title: q.section, questions: [] })
    groups.at(-1).questions.push(q)
  }
  return groups.map((g) => (
    <section key={g.questions[0].key} className="fbs-section">
      {g.title && <h2>{L(g.title)}</h2>}
      {g.questions.some((q) => q.type === 'rating') && <RatingLegend />}
      <div className="fbs-grid">
        {g.questions.map((q) => (
          <Question key={q.key} q={q} s={sum.questions[q.key]} />
        ))}
      </div>
    </section>
  ))
}

function Question({ q, s }) {
  const wide = q.type === 'text' || q.type === 'scale' || q.type === 'multi'
  return (
    <article className={`panel fbs-q ${wide ? 'wide' : ''}`}>
      <header>
        <span className="fbs-num">{qNum(q)}</span>
        <h3>{L(q.label)}</h3>
      </header>
      {q.type === 'rating' && <Rating s={s} />}
      {q.type === 'scale' && <Nps s={s} />}
      {(q.type === 'choice' || q.type === 'multi') && <Bars q={q} s={s} />}
      {q.type === 'text' && <Texts s={s} />}
    </article>
  )
}

function RatingLegend() {
  return (
    <ul className="fbs-legend" aria-label={tr('Keterangan warna rating', 'Rating colour key')}>
      {RATINGS.map((r, i) => (
        <li key={i}>
          <span className={`fbs-swatch r${i + 1}`} aria-hidden="true" />
          {i + 1} {L(r)}
        </li>
      ))}
    </ul>
  )
}

// Distribusi 1–5 sebagai satu bar bertumpuk 100%: merah (buruk) – abu (cukup) – biru (baik)
function Rating({ s }) {
  if (!s.n) return <p className="hint">{tr('Belum ada jawaban.', 'No answers yet.')}</p>
  const desc = s.counts.map((c, i) => `${i + 1} ${L(RATINGS[i])}: ${c}`).join(', ')
  return (
    <div className="fbs-rating">
      <p className="fbs-avg">
        <b>{fmt1(s.avg)}</b>
        <span>/5 · {tr(`${s.n} jawaban`, `${s.n} answer${s.n === 1 ? '' : 's'}`)}</span>
      </p>
      <div className="fbs-stack" role="img" aria-label={desc}>
        {s.counts.map((c, i) =>
          c ? (
            <span
              key={i}
              className={`r${i + 1}`}
              style={{ flexGrow: c }}
              data-tip={`${i + 1} ${L(RATINGS[i])}: ${c} (${pct(c, s.n)})`}
              tabIndex={0}
            >
              {c / s.n >= 0.1 ? c : ''}
            </span>
          ) : null
        )}
      </div>
    </div>
  )
}

function Nps({ s }) {
  if (!s.n) return <p className="hint">{tr('Belum ada jawaban.', 'No answers yet.')}</p>
  const max = Math.max(...s.counts, 1)
  const group = (n) => NPS_GROUPS.find((g) => n >= g.min && n <= g.max)
  return (
    <div className="fbs-nps">
      <p className="fbs-avg">
        <b>{s.nps > 0 ? `+${s.nps}` : s.nps}</b>
        <span>NPS · {tr(`rata-rata ${fmt1(s.avg)} · ${s.n} jawaban`, `average ${fmt1(s.avg)} · ${s.n} answer${s.n === 1 ? '' : 's'}`)}</span>
      </p>
      <ul className="fbs-legend">
        {NPS_GROUPS.map((g) => (
          <li key={g.key}>
            <span className={`fbs-swatch ${g.cls}`} aria-hidden="true" />
            {L(g.label)}: <b>{s.groups[g.key]}</b> ({pct(s.groups[g.key], s.n)})
          </li>
        ))}
      </ul>
      <div className="fbs-cols" role="img" aria-label={s.counts.map((c, n) => `${n}: ${c}`).join(', ')}>
        {s.counts.map((c, n) => (
          <div key={n} className="fbs-col" data-tip={`${tr('Skor', 'Score')} ${n}: ${c} (${pct(c, s.n)})`} tabIndex={0}>
            <small>{c || ''}</small>
            <span className={group(n).cls} style={{ height: `${(c / max) * 75}%` }} />
            <b>{n}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

// Satu seri, jadi satu warna; urut dari jumlah terbanyak, "Lainnya" selalu terakhir
function Bars({ q, s }) {
  if (!s.n) return <p className="hint">{tr('Belum ada jawaban.', 'No answers yet.')}</p>
  const items = [...s.items].sort((a, b) => (a.value === OTHER) - (b.value === OTHER) || b.count - a.count)
  const max = Math.max(...items.map((i) => i.count), 1)
  return (
    <>
      <p className="hint">
        {q.type === 'multi'
          ? tr(`${s.n} responden · boleh pilih lebih dari satu, persen dari responden`, `${s.n} respondents · multiple choice, % of respondents`)
          : tr(`${s.n} jawaban`, `${s.n} answer${s.n === 1 ? '' : 's'}`)}
      </p>
      <ul className="fbs-bars">
        {items.map((it) => (
          <li key={it.value} data-tip={`${L(it.label)}: ${it.count} (${pct(it.count, s.n)})`} tabIndex={0}>
            <span className="fbs-bar-label">{L(it.label)}</span>
            <span className="fbs-bar-track">
              <span style={{ width: `${(it.count / max) * 100}%` }} />
            </span>
            <span className="fbs-bar-value">
              <b>{it.count}</b> {pct(it.count, s.n)}
            </span>
          </li>
        ))}
      </ul>
      {s.others.length > 0 && (
        <p className="fbs-others">
          <b>{tr('Isian "Lainnya"', '"Other" answers')}:</b> {s.others.map((o) => (o.count > 1 ? `${o.text} (${o.count})` : o.text)).join(' · ')}
        </p>
      )}
    </>
  )
}

function Texts({ s }) {
  const [page, setPage] = useState(0)
  if (!s.n) return <p className="hint">{tr('Belum ada jawaban.', 'No answers yet.')}</p>
  const shown = s.list.slice(page * TEXT_PAGE, page * TEXT_PAGE + TEXT_PAGE)
  return (
    <>
      <p className="hint">{tr(`${s.n} jawaban, terbaru di atas`, `${s.n} answer${s.n === 1 ? '' : 's'}, newest first`)}</p>
      <ul className="fbs-texts">
        {shown.map((x) => (
          <li key={x.id}>
            <p>{x.text}</p>
            <small>
              {x.name} · <time>{formatTime(x.at)}</time>
            </small>
          </li>
        ))}
      </ul>
      <Pager page={page} total={s.n} pageSize={TEXT_PAGE} onChange={setPage} />
    </>
  )
}
