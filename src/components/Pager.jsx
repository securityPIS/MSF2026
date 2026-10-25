import { tr } from '../lib/i18n.jsx'

// Navigasi halaman sederhana: Sebelumnya / Halaman x dari y / Berikutnya
export default function Pager({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <nav className="pager" aria-label={tr('Navigasi halaman', 'Page navigation')}>
      <button className="btn" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        ‹ {tr('Sebelumnya', 'Previous')}
      </button>
      <span className="pager-info">
        {tr('Halaman', 'Page')} <b>{page + 1}</b> {tr('dari', 'of')} {pages}
      </span>
      <button className="btn" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>
        {tr('Berikutnya', 'Next')} ›
      </button>
    </nav>
  )
}
