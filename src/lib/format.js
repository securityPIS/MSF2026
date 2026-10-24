export const KIND_LABEL = {
  badge: 'Badge',
  booth: 'Booth',
  lunch: 'Lunch',
  souvenir: 'Souvenir',
  custom: 'Lainnya',
}

export const REPEAT_LABEL = {
  once: 'Sekali per peserta',
  daily: 'Sekali per hari',
  unlimited: 'Tanpa batas',
}

export function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function pct(part, whole) {
  if (!whole) return '0%'
  return `${Math.min(100, Math.round((part / whole) * 100))}%`
}

// Buang karakter yang mengganggu filter PostgREST
export function cleanTerm(q) {
  return q.trim().replace(/[,()%*\\]/g, '')
}
