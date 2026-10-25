import { locale, tr } from './i18n.jsx'

// Getter: label dibaca ulang setiap kali dipakai, jadi ikut bahasa yang aktif
export const KIND_LABEL = {
  badge: 'Badge',
  booth: 'Booth',
  lunch: 'Lunch',
  souvenir: 'Souvenir',
  get custom() { return tr('Lainnya', 'Other') },
}

export const REPEAT_LABEL = {
  get once() { return tr('Sekali per peserta', 'Once per participant') },
  get daily() { return tr('Sekali per hari', 'Once per day') },
  get unlimited() { return tr('Tanpa batas', 'Unlimited') },
}

export function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(locale(), {
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
