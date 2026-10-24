// Navigasi halaman sederhana: Sebelumnya / Halaman x dari y / Berikutnya
export default function Pager({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <nav className="pager" aria-label="Navigasi halaman">
      <button className="btn" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        ‹ Sebelumnya
      </button>
      <span className="pager-info">
        Halaman <b>{page + 1}</b> dari {pages}
      </span>
      <button className="btn" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>
        Berikutnya ›
      </button>
    </nav>
  )
}
