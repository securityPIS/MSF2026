// Ikon per tipe checkpoint. Warna tiap tipe diatur di styles.css (.kind-badge, .kind-booth, dst).
const PATHS = {
  // Kartu ID dengan klip lanyard
  badge:
    'M6 6.5h12a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2ZM10 3.5h4v5h-4ZM12 10.5a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6ZM8 18.5c.7-1.6 2.2-2.4 4-2.4s3.3.8 4 2.4',
  // Stan pameran dengan kanopi bergelombang
  booth:
    'M3.5 9.5 5.5 4h13l2 5.5M3.5 9.5a2.8 2.8 0 0 0 5.67 0 2.8 2.8 0 0 0 5.66 0 2.8 2.8 0 0 0 5.67 0M5 12v8.5h14V12M9.5 20.5v-5h5v5',
  // Garpu dan pisau
  lunch: 'M6 3v6a2.5 2.5 0 0 0 5 0V3M8.5 3v18M18 21V3c-2.3 1.4-3.5 4.2-3.5 7.5V14H18',
  // Kotak hadiah dengan pita
  souvenir:
    'M3.5 8h17v4h-17ZM5 12v9h14v-9M12 8v13M12 8C10.7 5.2 7 4 7 6.4 7 7.7 9.3 8 12 8Zm0 0c1.3-2.8 5-4 5-1.6C17 7.7 14.7 8 12 8Z',
  // Bendera penanda
  custom: 'M5.5 21V3.5M5.5 4h12l-2.5 4.25L17.5 12.5h-12',
}

export default function KindIcon({ kind, size = 'md', plain = false }) {
  const d = PATHS[kind] || PATHS.custom
  return (
    <span className={`kind-icon kind-${PATHS[kind] ? kind : 'custom'} ${size} ${plain ? 'plain' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  )
}
