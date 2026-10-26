// Izin akses di sisi tampilan. Aturan yang sama dijaga di database (has_menu, can_use_checkpoint,
// can_add_participants di schema.sql). Admin boleh semua; petugas tanpa role boleh semua menu petugas.
import { tr } from './i18n.jsx'

export const MENUS = [
  { key: 'scan', label: 'Scan', path: '/scan' },
  { key: 'dashboard', label: 'Monitoring', path: '/admin' },
  { key: 'participants', get label() { return tr('Peserta', 'Participants') }, path: '/admin/participants' },
]

export const MENU_LABEL = Object.defineProperties({}, Object.fromEntries(
  MENUS.map((m) => [m.key, { enumerable: true, get: () => m.label }])
))

const isAdmin = (p) => p?.role === 'admin'
const isOfficer = (p) => p?.role === 'officer'

export function canMenu(profile, menu) {
  if (isAdmin(profile)) return true
  if (!isOfficer(profile)) return false
  return !profile.perm || profile.perm.menus.includes(menu)
}

// Checkpoint yang ditangani: data monitoring dan riwayat hanya untuk checkpoint ini
export function canSeeCheckpoint(profile, checkpointId) {
  if (isAdmin(profile)) return true
  if (!isOfficer(profile)) return false
  const r = profile.perm
  return !r || r.all_checkpoints || r.checkpoint_ids.includes(checkpointId)
}

// Boleh scan di checkpoint ini
export function canCheckpoint(profile, checkpointId) {
  return canMenu(profile, 'scan') && canSeeCheckpoint(profile, checkpointId)
}

// true kalau data yang terlihat dibatasi ke sebagian checkpoint
export function isCheckpointScoped(profile) {
  return isOfficer(profile) && Boolean(profile.perm) && !profile.perm.all_checkpoints
}

export function canAddParticipants(profile) {
  if (isAdmin(profile)) return true
  if (!isOfficer(profile)) return false
  return !profile.perm || profile.perm.can_add_participants
}

// Halaman pertama setelah masuk
export function homePath(profile) {
  if (isAdmin(profile)) return '/admin'
  return MENUS.find((m) => canMenu(profile, m.key))?.path ?? null
}
