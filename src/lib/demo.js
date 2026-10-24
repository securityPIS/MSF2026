// Mode demo: tiruan klien Supabase yang menyimpan data di localStorage browser.
// Dipakai saat development tanpa .env (atau VITE_DEMO=1) supaya tampilan bisa dicoba tanpa database.
// Hanya meniru bagian API yang dipakai aplikasi ini, termasuk aturan perform_checkin di schema.sql.

const DB_KEY = 'msf2026.demo.db'
const SESSION_KEY = 'msf2026.demo.session'

export const DEMO_ACCOUNTS = [
  { email: 'admin@demo.msf', role: 'admin', full_name: 'Admin Demo' },
  { email: 'petugas@demo.msf', role: 'officer', full_name: 'Petugas Demo' },
]

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
const clone = (v) => JSON.parse(JSON.stringify(v))

function seed() {
  const now = Date.now()
  const ago = (min) => new Date(now - min * 60000).toISOString()
  const profiles = DEMO_ACCOUNTS.map((a, i) => ({
    id: `demo-${a.role}`,
    email: a.email,
    full_name: a.full_name,
    role: a.role,
    created_at: ago(5000 - i),
  }))
  profiles.push({ id: 'demo-officer-2', email: 'rina@demo.msf', full_name: 'Rina (Booth)', role: 'officer', created_at: ago(4000) })

  const cp = (name, kind, repeat_rule, requires_badge, sort_order) => ({
    id: uid(), name, kind, repeat_rule, requires_badge, is_active: true, sort_order, created_at: ago(3000),
  })
  const checkpoints = [
    cp('Penukaran Badge ID', 'badge', 'once', false, 1),
    cp('Lunch', 'lunch', 'daily', true, 2),
    cp('Souvenir', 'souvenir', 'once', true, 3),
    cp('Booth 1', 'booth', 'once', true, 10),
    cp('Booth 2', 'booth', 'once', true, 11),
  ]

  const people = [
    ['e883d05a5a', 'Peserta Uji', 'PT Pertamina International Shipping', 'Umum'],
    ['a1c94e02b7', 'Budi Santoso', 'Bakamla RI', 'Pembicara'],
    ['b27f0d9e31', 'Siti Rahmawati', 'Kementerian Perhubungan', 'Umum'],
    ['c3d8a61f04', 'Andi Pratama', 'TNI AL', 'VIP'],
    ['d4e9b72a15', 'Dewi Lestari', 'Pelindo', 'Umum'],
    ['e5fa083b26', 'Rudi Hartono', 'KPLP', 'Umum'],
    ['f60b194c37', 'Maya Sari', 'Universitas Pertahanan', 'Media'],
    ['071c2a5d48', 'Agus Wijaya', 'PT PAL Indonesia', 'Umum'],
    ['182d3b6e59', 'Lina Marlina', 'Polairud', 'Umum'],
    ['293e4c7f6a', 'Hendra Kusuma', 'Bea Cukai', 'Pembicara'],
    ['3a4f5d8071', 'Fitri Handayani', 'Kemenko Marves', 'VIP'],
    ['4b506e9182', 'Yusuf Maulana', 'Basarnas', 'Umum'],
    ['5c617e0a93', 'Ahmad Fauzi', 'Bakamla RI', 'Umum'],
    ['5c617e2982', 'Bambang Sutrisno', 'TNI AL', 'Umum'],
    ['5c617e4871', 'Citra Kirana', 'Pelindo', 'VIP'],
    ['5c617e6760', 'Dimas Anggara', 'KPLP', 'Pembicara'],
    ['5c617e864f', 'Eko Prasetyo', 'Kementerian Perhubungan', 'Media'],
    ['5c617ea53e', 'Fajar Nugroho', 'PT PAL Indonesia', 'Umum'],
    ['5c617ec42d', 'Gita Savitri', 'Universitas Pertahanan', 'Umum'],
    ['5c617ee31c', 'Hadi Purnomo', 'Polairud', 'Umum'],
    ['5c617f020b', 'Indah Permata', 'Bea Cukai', 'VIP'],
    ['5c617f20fa', 'Joko Susilo', 'Basarnas', 'Pembicara'],
    ['5c617f3fe9', 'Kartika Dewi', 'Kemenko Marves', 'Media'],
    ['5c617f5ed8', 'Lukman Hakim', 'PT Pertamina International Shipping', 'Umum'],
    ['5c617f7dc7', 'Mega Utami', 'Pertamina Patra Niaga', 'Umum'],
    ['5c617f9cb6', 'Nanda Saputra', 'Danantara Indonesia', 'Umum'],
    ['5c617fbba5', 'Oki Setiawan', 'TNI AL', 'VIP'],
    ['5c617fda94', 'Putri Ayu', 'Pelni', 'Pembicara'],
    ['5c617ff983', 'Rahmat Hidayat', 'Bakamla RI', 'Media'],
    ['5c61801872', 'Sari Wulandari', 'KKP', 'Umum'],
    ['5c61803761', 'Taufik Ismail', 'Pelindo', 'Umum'],
    ['5c61805650', 'Umar Said', 'KPLP', 'Umum'],
    ['5c6180753f', 'Vina Melati', 'Media Indonesia', 'VIP'],
    ['5c6180942e', 'Wahyu Saputra', 'Polairud', 'Pembicara'],
    ['5c6180b31d', 'Yanti Kusuma', 'Kementerian Luar Negeri', 'Media'],
    ['5c6180d20c', 'Zainal Arifin', 'Basarnas', 'Umum'],
    ['5c6180f0fb', 'Arief Rahman', 'Pertamina Patra Niaga', 'Umum'],
    ['5c61810fea', 'Bayu Aji', 'PT PAL Indonesia', 'Umum'],
    ['5c61812ed9', 'Cahya Lestari', 'Kompas', 'VIP'],
    ['5c61814dc8', 'Dian Sastro', 'Kemenko Marves', 'Pembicara'],
    ['5c61816cb7', 'Rina Anggraini', 'Bea Cukai', 'Media'],
    ['5c61818ba6', 'Sigit Wibowo', 'TNI AL', 'Umum'],
  ]
  const participants = people.map(([qr_code, full_name, organization, category]) => ({
    id: uid(), qr_code, full_name, organization, category, email: null, phone: null,
    created_at: ago(3000), updated_at: ago(3000),
  }))

  // Beberapa check-in awal supaya dashboard tidak kosong. Peserta Uji sengaja belum check-in.
  const [badge, lunch, , booth1, booth2] = checkpoints
  const checkins = []
  const add = (p, c, min, officer = 'demo-officer') =>
    checkins.push({
      id: checkins.length + 1, participant_id: participants[p].id, checkpoint_id: c.id,
      officer_id: officer, checked_in_at: ago(min), event_date: today(),
    })
  ;[1, 2, 3, 4, 5, 6, 7].forEach((p, i) => add(p, badge, 180 - i * 12))
  ;[1, 2, 3, 5].forEach((p, i) => add(p, lunch, 50 - i * 6))
  add(1, booth1, 40, 'demo-officer-2')
  add(3, booth1, 25, 'demo-officer-2')
  add(2, booth2, 15, 'demo-officer-2')

  // Contoh role akses: hanya scan di booth, tanpa dashboard. Dipakai akun Rina.
  const roles = [
    {
      id: uid(), name: 'Petugas Booth', menus: ['scan'], can_add_participants: false,
      all_checkpoints: false, checkpoint_ids: [booth1.id, booth2.id], created_at: ago(3500),
    },
  ]
  profiles.find((p) => p.id === 'demo-officer-2').role_id = roles[0].id

  return { roles, profiles, participants, checkpoints, checkins, nextCheckinId: checkins.length + 1 }
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return { roles: [], ...JSON.parse(raw) }
  } catch { /* data rusak atau storage diblokir: mulai dari seed */ }
  return seed()
}

let db = load()
const persist = () => {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { /* abaikan */ }
}
persist()

export function resetDemo() {
  db = seed()
  persist()
  notifyChange('checkins')
}

// ---------- Realtime tiruan (juga antar-tab lewat event storage) ----------
const channels = new Set()
function notifyChange(table) {
  for (const ch of channels) ch.handlers.filter((h) => h.table === table).forEach((h) => h.cb({}))
}
window.addEventListener('storage', (e) => {
  if (e.key === DB_KEY && e.newValue) {
    db = JSON.parse(e.newValue)
    notifyChange('checkins')
  }
})

// ---------- Auth tiruan ----------
let session = null
try { session = JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { session = null }
const authListeners = new Set()
function setSession(s) {
  session = s
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else localStorage.removeItem(SESSION_KEY)
  } catch { /* abaikan */ }
  authListeners.forEach((cb) => cb(s ? 'SIGNED_IN' : 'SIGNED_OUT', s))
}
const me = () => db.profiles.find((p) => p.id === session?.user?.id)
const isStaff = () => ['admin', 'officer'].includes(me()?.role)
const myRole = () => db.roles.find((r) => r.id === me()?.role_id)
const hasMenu = (m) => me()?.role === 'admin' || (me()?.role === 'officer' && (!myRole() || myRole().menus.includes(m)))
const canSeeCheckpoint = (id) => {
  if (me()?.role === 'admin') return true
  if (me()?.role !== 'officer') return false
  const r = myRole()
  return !r || r.all_checkpoints || r.checkpoint_ids.includes(id)
}
const canUseCheckpoint = (id) => hasMenu('scan') && canSeeCheckpoint(id)
const canAddParticipants = () => me()?.role === 'admin' || (me()?.role === 'officer' && (!myRole() || myRole().can_add_participants))

const auth = {
  async getSession() {
    return { data: { session }, error: null }
  },
  onAuthStateChange(cb) {
    authListeners.add(cb)
    return { data: { subscription: { unsubscribe: () => authListeners.delete(cb) } } }
  },
  async signInWithPassword({ email }) {
    const p = db.profiles.find((x) => x.email === String(email).trim().toLowerCase())
    if (!p) return { data: null, error: { message: 'Invalid login credentials' } }
    setSession({ user: { id: p.id, email: p.email } })
    return { data: { session }, error: null }
  },
  async signOut() {
    setSession(null)
    return { error: null }
  },
}

// ---------- Query builder tiruan ----------
// Relasi yang dipakai di select() dengan alias, mis. "participant:participants(full_name)"
const RELATIONS = {
  profiles: {
    roles: (r) => db.roles.find((x) => x.id === r.role_id),
  },
  checkins: {
    participants: (r) => db.participants.find((p) => p.id === r.participant_id),
    checkpoints: (r) => db.checkpoints.find((c) => c.id === r.checkpoint_id),
    profiles: (r) => db.profiles.find((p) => p.id === r.officer_id),
  },
}

const likeRegex = (pattern) =>
  new RegExp(`^${String(pattern).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`, 'i')

function matchOp(row, col, op, val) {
  if (op === 'eq') return String(row[col]) === String(val)
  if (op === 'ilike') return likeRegex(val).test(row[col] ?? '')
  return false
}

function compare(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'id')
}

// Tiruan RLS select: riwayat check-in hanya untuk checkpoint yang ditangani role (policy checkins_select)
const ROW_POLICIES = {
  checkins: (k) => (hasMenu('dashboard') || hasMenu('participants')) && canSeeCheckpoint(k.checkpoint_id),
}

class Query {
  constructor(table) {
    this.table = table
    this.action = 'select'
    this.columns = '*'
    this.filters = []
    this.orders = []
    this.from = 0
    this.to = Infinity
    this.mode = null
    this.count = null
  }
  select(columns = '*', opts = {}) {
    if (this.action !== 'select') this.returning = true
    this.columns = columns
    if (opts.count) this.count = opts.count
    return this
  }
  insert(rows) { this.action = 'insert'; this.payload = [].concat(rows); return this }
  upsert(rows, opts = {}) { this.action = 'upsert'; this.payload = [].concat(rows); this.conflict = opts.onConflict || 'id'; return this }
  update(patch) { this.action = 'update'; this.payload = patch; return this }
  delete() { this.action = 'delete'; return this }
  eq(col, val) { this.filters.push((r) => matchOp(r, col, 'eq', val)); return this }
  ilike(col, val) { this.filters.push((r) => matchOp(r, col, 'ilike', val)); return this }
  or(expr) {
    const parts = expr.split(',').map((s) => {
      const [col, op, ...rest] = s.split('.')
      return [col, op, rest.join('.')]
    })
    this.filters.push((r) => parts.some(([col, op, val]) => matchOp(r, col, op, val)))
    return this
  }
  order(col, { ascending = true } = {}) { this.orders.push([col, ascending]); return this }
  limit(n) { this.to = this.from + n - 1; return this }
  range(a, b) { this.from = a; this.to = b; return this }
  single() { this.mode = 'strict'; return this }
  maybeSingle() { this.mode = 'maybe'; return this }
  then(resolve, reject) {
    return Promise.resolve().then(() => this.run()).then(resolve, reject)
  }

  rows() {
    const policy = ROW_POLICIES[this.table] ?? (() => true)
    return db[this.table].filter((r) => policy(r) && this.filters.every((f) => f(r)))
  }

  shape(row) {
    const out = clone(row)
    const rel = RELATIONS[this.table]
    if (!rel) return out
    for (const m of this.columns.matchAll(/(\w+):(\w+)\(/g)) {
      const target = rel[m[2]]?.(row)
      out[m[1]] = target ? clone(target) : null
    }
    return out
  }

  run() {
    try {
      const result = this[`exec_${this.action}`]()
      persist()
      return result
    } catch (e) {
      return { data: null, error: { message: e.message, code: e.code } }
    }
  }

  exec_select() {
    let rows = this.rows()
    for (const [col, asc] of [...this.orders].reverse()) {
      rows = [...rows].sort((a, b) => (asc ? 1 : -1) * compare(a[col], b[col]))
    }
    const count = rows.length
    rows = rows.slice(this.from, this.to + 1).map((r) => this.shape(r))
    if (this.mode) {
      if (this.mode === 'strict' && rows.length !== 1) return { data: null, error: { message: 'Row not found' } }
      return { data: rows[0] ?? null, error: null }
    }
    return { data: rows, error: null, count: this.count ? count : null }
  }

  exec_insert() {
    const now = new Date().toISOString()
    if (this.table === 'participants' && !canAddParticipants()) {
      throw Object.assign(new Error('new row violates row-level security policy for table "participants"'), { code: '42501' })
    }
    const added = this.payload.map((r) => ({ id: uid(), created_at: now, ...DEFAULTS[this.table]?.(now), ...r }))
    for (const r of added) checkConstraints(this.table, r)
    db[this.table].push(...added)
    if (!this.returning) return { data: null, error: null }
    const out = added.map((r) => this.shape(r))
    return { data: this.mode ? out[0] : out, error: null }
  }

  exec_upsert() {
    const now = new Date().toISOString()
    for (const r of this.payload) {
      const existing = db[this.table].find((x) => x[this.conflict] === r[this.conflict])
      if (existing) Object.assign(existing, r)
      else db[this.table].push({ id: uid(), created_at: now, ...r })
    }
    return { data: null, error: null }
  }

  exec_update() {
    for (const r of this.rows()) {
      checkConstraints(this.table, { ...r, ...this.payload }, r.id)
      Object.assign(r, this.payload)
    }
    return { data: null, error: null }
  }

  exec_delete() {
    const gone = new Set(this.rows().map((r) => r.id))
    if (this.table === 'roles' && db.profiles.some((p) => gone.has(p.role_id))) {
      throw Object.assign(new Error('update or delete on table "roles" violates foreign key constraint'), { code: '23503' })
    }
    db[this.table] = db[this.table].filter((r) => !gone.has(r.id))
    if (this.table === 'checkpoints') db.checkins = db.checkins.filter((k) => !gone.has(k.checkpoint_id))
    if (this.table === 'participants') db.checkins = db.checkins.filter((k) => !gone.has(k.participant_id))
    if (this.table === 'checkins' || this.table === 'checkpoints' || this.table === 'participants') notifyChange('checkins')
    return { data: null, error: null }
  }
}

// Nilai bawaan kolom seperti di schema.sql
const DEFAULTS = {
  participants: (now) => ({
    qr_code: uid().replace(/-/g, '').slice(0, 10),
    updated_at: now, organization: null, email: null, phone: null, category: null,
  }),
}

function checkConstraints(table, row, selfId) {
  if (table === 'participants' && db.participants.some((p) => p.qr_code === row.qr_code && p.id !== (selfId ?? row.id))) {
    throw Object.assign(new Error('duplicate key value violates unique constraint "participants_qr_code_key"'), { code: '23505' })
  }
  if (table === 'checkpoints' && row.kind === 'badge' && db.checkpoints.some((c) => c.kind === 'badge' && c.id !== (selfId ?? row.id))) {
    throw Object.assign(new Error('duplicate key value violates unique constraint "checkpoints_single_badge"'), { code: '23505' })
  }
}

// ---------- RPC tiruan (port dari fungsi di schema.sql) ----------
const RPC = {
  perform_checkin({ p_code, p_checkpoint_id }) {
    if (!isStaff()) throw new Error('Akses ditolak')
    const code = String(p_code ?? '').trim().toLowerCase()
    const cp = db.checkpoints.find((c) => c.id === p_checkpoint_id)
    if (!cp) return { status: 'invalid_checkpoint' }
    if (!canUseCheckpoint(cp.id)) return { status: 'forbidden', checkpoint: cp.name }
    if (!cp.is_active) return { status: 'inactive', checkpoint: cp.name }
    const p = db.participants.find((x) => x.qr_code === code)
    if (!p) return { status: 'not_found', code, checkpoint: cp.name }
    const participant = { name: p.full_name, organization: p.organization, category: p.category }

    if (cp.requires_badge && cp.kind !== 'badge') {
      const badge = db.checkpoints.find((c) => c.kind === 'badge')
      if (badge && !db.checkins.some((k) => k.participant_id === p.id && k.checkpoint_id === badge.id)) {
        return { status: 'no_badge', participant, checkpoint: cp.name }
      }
    }

    if (cp.repeat_rule !== 'unlimited') {
      const prev = db.checkins
        .filter((k) => k.participant_id === p.id && k.checkpoint_id === cp.id && (cp.repeat_rule === 'once' || k.event_date === today()))
        .map((k) => k.checked_in_at)
        .sort()
        .pop()
      if (prev) return { status: 'duplicate', participant, checkpoint: cp.name, previous_at: prev }
    }

    const at = new Date().toISOString()
    db.checkins.push({
      id: db.nextCheckinId++, participant_id: p.id, checkpoint_id: cp.id,
      officer_id: session?.user?.id ?? null, checked_in_at: at, event_date: today(),
    })
    notifyChange('checkins')
    return { status: 'ok', participant, checkpoint: cp.name, checked_in_at: at }
  },

  dashboard_stats() {
    if (!hasMenu('dashboard')) throw new Error('Akses ditolak')
    const day = today()
    const checkpoints = db.checkpoints
      .filter((c) => canSeeCheckpoint(c.id))
      .sort((a, b) => a.sort_order - b.sort_order || compare(a.name, b.name))
      .map((c) => {
        const ks = db.checkins.filter((k) => k.checkpoint_id === c.id)
        return {
          id: c.id, name: c.name, kind: c.kind, is_active: c.is_active,
          unique_participants: new Set(ks.map((k) => k.participant_id)).size,
          total_scans: ks.length,
          today: ks.filter((k) => k.event_date === day).length,
        }
      })
    return { total_participants: db.participants.length, checkpoints }
  },

  participant_history({ p_code }) {
    const p = db.participants.find((x) => x.qr_code === String(p_code ?? '').trim().toLowerCase())
    if (!p) return null
    const checkins = db.checkins
      .filter((k) => k.participant_id === p.id)
      .sort((a, b) => compare(a.checked_in_at, b.checked_in_at))
      .map((k) => {
        const c = db.checkpoints.find((x) => x.id === k.checkpoint_id)
        return { checkpoint: c?.name, kind: c?.kind, at: k.checked_in_at }
      })
    return { name: p.full_name, organization: p.organization, checkins }
  },
}

// ---------- Edge Function tiruan (port dari supabase/functions/manage-staff) ----------
const FUNCTIONS = {
  'manage-staff'({ action, id, full_name, email, password, role, role_id }) {
    const caller = me()
    if (caller?.role !== 'admin') throw new Error('Hanya admin yang boleh mengelola petugas')
    full_name = full_name?.trim()
    email = email?.trim().toLowerCase()
    if (role !== undefined && !['admin', 'officer', 'inactive'].includes(role)) throw new Error('Peran tidak dikenal')
    role_id = role === 'officer' ? role_id || null : null
    if (role_id && !db.roles.some((r) => r.id === role_id)) throw new Error('Role akses tidak ditemukan')
    if (password && password.length < 8) throw new Error('Kata sandi minimal 8 karakter')
    if (id === caller.id && (action === 'delete' || (role !== undefined && role !== 'admin'))) {
      throw new Error('Anda tidak bisa menghapus atau menurunkan peran akun sendiri')
    }
    const emailTaken = () => db.profiles.some((p) => p.email === email && p.id !== id)

    if (action === 'create') {
      if (!full_name || !email || !password) throw new Error('Nama, email, dan kata sandi wajib diisi')
      if (emailTaken()) throw new Error('Email sudah dipakai akun lain')
      const nid = uid()
      db.profiles.push({ id: nid, email, full_name, role: role ?? 'officer', role_id, created_at: new Date().toISOString() })
      return { id: nid }
    }
    const target = db.profiles.find((p) => p.id === id)
    if (!target) throw new Error('Akun tidak ditemukan')
    if (action === 'update') {
      if (!full_name || !email) throw new Error('Nama dan email wajib diisi')
      if (emailTaken()) throw new Error('Email sudah dipakai akun lain')
      Object.assign(target, { full_name, email }, role ? { role, role_id } : {})
      return { id }
    }
    if (action === 'delete') {
      db.profiles = db.profiles.filter((p) => p.id !== id)
      db.checkins.forEach((k) => { if (k.officer_id === id) k.officer_id = null })
      return { id }
    }
    throw new Error('Aksi tidak dikenal')
  },
}

export function createDemoClient() {
  return {
    auth,
    from: (table) => new Query(table),
    async rpc(name, args = {}) {
      await new Promise((r) => setTimeout(r, 250)) // jeda kecil supaya status "Memeriksa…" terlihat
      try {
        const data = RPC[name](args)
        persist()
        return { data, error: null }
      } catch (e) {
        return { data: null, error: { message: e.message } }
      }
    },
    // Tiruan Edge Function (supabase/functions/*). Error meniru FunctionsHttpError: pesan ada di context.json()
    functions: {
      async invoke(name, { body } = {}) {
        await new Promise((r) => setTimeout(r, 300))
        try {
          const data = FUNCTIONS[name](body || {})
          persist()
          return { data, error: null }
        } catch (e) {
          return { data: null, error: { message: 'Edge Function returned a non-2xx status code', context: { json: async () => ({ error: e.message }) } } }
        }
      },
    },
    channel() {
      const ch = {
        handlers: [],
        on(_type, filter, cb) {
          ch.handlers.push({ table: filter.table, cb })
          return ch
        },
        subscribe(cb) {
          channels.add(ch)
          setTimeout(() => cb?.('SUBSCRIBED'), 0)
          return ch
        },
      }
      return ch
    },
    removeChannel(ch) {
      channels.delete(ch)
    },
  }
}
