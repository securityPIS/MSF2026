import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../lib/auth.jsx'
import { useConfirm } from '../../components/ConfirmDialog.jsx'
import RolesPanel from './Roles.jsx'
import { MENU_LABEL } from '../../lib/permissions.js'

const ROLE_LABEL = { officer: 'Petugas', admin: 'Admin', inactive: 'Nonaktif' }
const EMPTY = { full_name: '', email: '', password: '', role: 'officer', role_id: null }

// Label akses yang tampil di kartu akun
function accessLabel(p) {
  if (p.role === 'officer') return p.perm?.name ?? 'Petugas (akses penuh)'
  return ROLE_LABEL[p.role]
}

// Akun login hanya bisa dibuat/diubah/dihapus dengan service role, lewat Edge Function manage-staff
async function manageStaff(body) {
  const { data, error } = await supabase.functions.invoke('manage-staff', { body })
  if (!error) return { data }
  let message = error.message
  try {
    message = (await error.context.json()).error || message
  } catch { /* bukan respons JSON */ }
  return { error: message }
}

export default function Staff() {
  const { profile: me } = useAuth()
  const confirm = useConfirm()
  const [tab, setTab] = useState('accounts')
  const [list, setList] = useState([])
  const [roles, setRoles] = useState([])
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    const [{ data }, { data: r }] = await Promise.all([
      supabase.from('profiles').select('*, perm:roles(name)').order('full_name'),
      supabase.from('roles').select('id,name,menus').order('name'),
    ])
    setList(data || [])
    setRoles(r || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(p) {
    setNotice(null)
    setEditing(p)
    window.scrollTo({ top: 0 })
  }

  async function save(f) {
    const { error } = await manageStaff({ action: f.id ? 'update' : 'create', ...f })
    if (error) return error
    setEditing(null)
    setNotice({ type: 'ok', text: f.id ? `Akun ${f.full_name} diperbarui.` : `Akun ${f.full_name} dibuat. Bagikan email dan kata sandinya ke yang bersangkutan.` })
    load()
    return null
  }

  async function remove(p) {
    const ok = await confirm({
      title: `Hapus akun ${p.full_name}?`,
      body: 'Akun tidak bisa dipakai masuk lagi. Riwayat check-in yang pernah dibuatnya tetap tersimpan. Untuk menonaktifkan sementara, ubah perannya menjadi Nonaktif.',
      confirmLabel: 'Hapus akun',
      danger: true,
    })
    if (!ok) return
    const { error } = await manageStaff({ action: 'delete', id: p.id })
    setNotice(error ? { type: 'error', text: error } : { type: 'ok', text: `Akun ${p.full_name} dihapus.` })
    load()
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Pengaturan</p>
          <h1>Petugas &amp; admin</h1>
        </div>
      </div>

      {!editing && (
        <div className="segmented tabs-top" role="tablist">
          <button role="tab" aria-selected={tab === 'accounts'} className={tab === 'accounts' ? 'active' : ''} onClick={() => setTab('accounts')}>
            Akun ({list.length})
          </button>
          <button role="tab" aria-selected={tab === 'roles'} className={tab === 'roles' ? 'active' : ''} onClick={() => { setNotice(null); setTab('roles') }}>
            Role akses ({roles.length})
          </button>
        </div>
      )}

      {tab === 'roles' && !editing ? (
        <RolesPanel onChanged={load} />
      ) : editing ? (
        <StaffForm key={editing.id || 'new'} value={editing} roles={roles} isSelf={editing.id === me?.id} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <>
          <div className="actions" style={{ marginBottom: '1rem' }}>
            <button className="btn btn-primary btn-block" onClick={() => startEdit({ ...EMPTY })}>+ Tambah petugas</button>
          </div>
          {notice && <p className={`notice ${notice.type}`} role="status">{notice.text}</p>}
          <ul className="cards cols">
            {list.map((p) => {
              const self = p.id === me?.id
              const roleClass = p.role === 'officer' && p.role_id ? 'role-custom' : `role-${p.role}`
              return (
                <li key={p.id} className={`card ${p.role === 'inactive' ? 'muted' : ''}`}>
                  <div className="card-title-row">
                    <span className={`avatar ${roleClass}`} aria-hidden="true">{initials(p.full_name)}</span>
                    <div className="staff-name">
                      <h3 className="card-title">{p.full_name}</h3>
                      <p className="card-sub">{p.email}</p>
                      <div className="chips">
                        <span className={`chip role-chip ${roleClass}`}>{accessLabel(p)}</span>
                        {self && <span className="chip cyan">Anda</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn" onClick={() => startEdit(p)}>Ubah</button>
                    {!self && <button className="btn btn-danger" onClick={() => remove(p)}>Hapus</button>}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

function StaffForm({ value, roles, isSelf, onSave, onCancel }) {
  const isNew = !value.id
  const [f, setF] = useState({ ...value, password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = { id: f.id, full_name: f.full_name.trim(), email: f.email.trim(), role: f.role, role_id: f.role_id ?? null }
    if (f.password) payload.password = f.password
    const err = await onSave(payload)
    setBusy(false)
    if (err) setError(err)
  }

  // Pilihan akses: admin, petugas akses penuh, role buatan admin, nonaktif
  const options = [
    { key: 'admin', role: 'admin', role_id: null, label: 'Admin', hint: 'Semua menu termasuk pengaturan', cls: 'role-admin' },
    { key: 'officer', role: 'officer', role_id: null, label: 'Petugas (akses penuh)', hint: 'Scan semua checkpoint, dashboard, peserta', cls: 'role-officer' },
    ...roles.map((r) => ({
      key: `role:${r.id}`, role: 'officer', role_id: r.id, label: r.name,
      hint: r.menus.map((m) => MENU_LABEL[m]).join(', '), cls: 'role-custom',
    })),
    { key: 'inactive', role: 'inactive', role_id: null, label: 'Nonaktif', hint: 'Tidak bisa masuk aplikasi', cls: 'role-inactive' },
  ]
  const selected = f.role === 'officer' && f.role_id ? `role:${f.role_id}` : f.role

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <h2>{isNew ? 'Tambah petugas' : `Ubah akun ${value.full_name}`}</h2>
      <label className="full">
        Nama lengkap
        <input required autoFocus value={f.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Contoh: Rina Anggraini" />
      </label>
      <label className="full">
        Email (dipakai untuk masuk)
        <input required type="email" inputMode="email" autoCapitalize="none" autoComplete="off" value={f.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      <label className="full">
        {isNew ? 'Kata sandi awal' : 'Kata sandi baru'}
        <input
          type="password"
          required={isNew}
          minLength={8}
          autoComplete="new-password"
          value={f.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder={isNew ? 'Minimal 8 karakter' : 'Kosongkan jika tidak diganti'}
        />
      </label>
      <fieldset className="role-picker full" disabled={isSelf}>
        <legend>Peran &amp; akses{isSelf ? ' (tidak bisa mengubah peran sendiri)' : ''}</legend>
        {options.map((o) => (
          <label key={o.key} className={`role-option ${o.cls}`}>
            <input
              type="radio"
              name="role"
              value={o.key}
              checked={selected === o.key}
              onChange={() => setF((p) => ({ ...p, role: o.role, role_id: o.role_id }))}
            />
            <span>
              <b>{o.label}</b>
              <small>{o.hint}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {error && <p className="form-error full" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>Batal</button>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Menyimpan…' : isNew ? 'Buat akun' : 'Simpan perubahan'}</button>
      </div>
    </form>
  )
}

function initials(name = '') {
  const words = name.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
}
