import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../lib/auth.jsx'
import { useConfirm } from '../../components/ConfirmDialog.jsx'
import RolesPanel from './Roles.jsx'
import { MENU_LABEL } from '../../lib/permissions.js'
import { tr } from '../../lib/i18n.jsx'

const ROLE_LABEL = {
  get officer() { return tr('Petugas', 'Staff') },
  admin: 'Admin',
  get inactive() { return tr('Nonaktif', 'Inactive') },
}
const EMPTY = { full_name: '', email: '', password: '', role: 'officer', role_id: null }

// Label akses yang tampil di kartu akun
function accessLabel(p) {
  if (p.role === 'officer') return p.perm?.name ?? tr('Petugas (akses penuh)', 'Staff (full access)')
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
    setNotice({
      type: 'ok',
      text: f.id
        ? tr(`Akun ${f.full_name} diperbarui.`, `Account ${f.full_name} updated.`)
        : tr(`Akun ${f.full_name} dibuat. Bagikan email dan kata sandinya ke yang bersangkutan.`, `Account ${f.full_name} created. Share the email and password with them.`),
    })
    load()
    return null
  }

  async function remove(p) {
    const ok = await confirm({
      title: tr(`Hapus akun ${p.full_name}?`, `Delete account ${p.full_name}?`),
      body: tr(
        'Akun tidak bisa dipakai masuk lagi. Riwayat check-in yang pernah dibuatnya tetap tersimpan. Untuk menonaktifkan sementara, ubah perannya menjadi Nonaktif.',
        'The account can no longer sign in. Check-ins it recorded are kept. To disable it temporarily, change its role to Inactive.'
      ),
      confirmLabel: tr('Hapus akun', 'Delete account'),
      danger: true,
    })
    if (!ok) return
    const { error } = await manageStaff({ action: 'delete', id: p.id })
    setNotice(error ? { type: 'error', text: error } : { type: 'ok', text: tr(`Akun ${p.full_name} dihapus.`, `Account ${p.full_name} deleted.`) })
    load()
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{tr('Pengaturan', 'Settings')}</p>
          <h1>{tr('Petugas & admin', 'Staff & admins')}</h1>
        </div>
      </div>

      {!editing && (
        <div className="segmented tabs-top" role="tablist">
          <button role="tab" aria-selected={tab === 'accounts'} className={tab === 'accounts' ? 'active' : ''} onClick={() => setTab('accounts')}>
            {tr('Akun', 'Accounts')} ({list.length})
          </button>
          <button role="tab" aria-selected={tab === 'roles'} className={tab === 'roles' ? 'active' : ''} onClick={() => { setNotice(null); setTab('roles') }}>
            {tr('Role akses', 'Access roles')} ({roles.length})
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
            <button className="btn btn-primary btn-block" onClick={() => startEdit({ ...EMPTY })}>+ {tr('Tambah petugas', 'Add staff')}</button>
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
                        {self && <span className="chip cyan">{tr('Anda', 'You')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn" onClick={() => startEdit(p)}>{tr('Ubah', 'Edit')}</button>
                    {!self && <button className="btn btn-danger" onClick={() => remove(p)}>{tr('Hapus', 'Delete')}</button>}
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
    { key: 'admin', role: 'admin', role_id: null, label: 'Admin', hint: tr('Semua menu termasuk pengaturan', 'All menus including settings'), cls: 'role-admin' },
    {
      key: 'officer', role: 'officer', role_id: null, label: tr('Petugas (akses penuh)', 'Staff (full access)'),
      hint: tr('Scan semua checkpoint, monitoring, peserta', 'Scan at every checkpoint, monitoring, participants'), cls: 'role-officer',
    },
    ...roles.map((r) => ({
      key: `role:${r.id}`, role: 'officer', role_id: r.id, label: r.name,
      hint: r.menus.map((m) => MENU_LABEL[m]).join(', '), cls: 'role-custom',
    })),
    { key: 'inactive', role: 'inactive', role_id: null, label: tr('Nonaktif', 'Inactive'), hint: tr('Tidak bisa masuk aplikasi', 'Cannot sign in'), cls: 'role-inactive' },
  ]
  const selected = f.role === 'officer' && f.role_id ? `role:${f.role_id}` : f.role

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <h2>{isNew ? tr('Tambah petugas', 'Add staff') : tr(`Ubah akun ${value.full_name}`, `Edit account ${value.full_name}`)}</h2>
      <label className="full">
        {tr('Nama lengkap', 'Full name')}
        <input required autoFocus value={f.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder={tr('Contoh: Rina Anggraini', 'Example: Rina Anggraini')} />
      </label>
      <label className="full">
        {tr('Email (dipakai untuk masuk)', 'Email (used to sign in)')}
        <input required type="email" inputMode="email" autoCapitalize="none" autoComplete="off" value={f.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      <label className="full">
        {isNew ? tr('Kata sandi awal', 'Initial password') : tr('Kata sandi baru', 'New password')}
        <input
          type="password"
          required={isNew}
          minLength={8}
          autoComplete="new-password"
          value={f.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder={isNew ? tr('Minimal 8 karakter', 'At least 8 characters') : tr('Kosongkan jika tidak diganti', 'Leave empty to keep the current one')}
        />
      </label>
      <fieldset className="role-picker full" disabled={isSelf}>
        <legend>{tr('Peran & akses', 'Role & access')}{isSelf ? tr(' (tidak bisa mengubah peran sendiri)', ' (you cannot change your own role)') : ''}</legend>
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
        <button type="button" className="btn" onClick={onCancel}>{tr('Batal', 'Cancel')}</button>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? tr('Menyimpan…', 'Saving…') : isNew ? tr('Buat akun', 'Create account') : tr('Simpan perubahan', 'Save changes')}
        </button>
      </div>
    </form>
  )
}

function initials(name = '') {
  const words = name.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
}
