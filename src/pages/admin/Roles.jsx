import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { MENUS, MENU_LABEL } from '../../lib/permissions.js'
import { useConfirm } from '../../components/ConfirmDialog.jsx'
import KindIcon from '../../components/KindIcon.jsx'
import { tr } from '../../lib/i18n.jsx'

const EMPTY = { name: '', menus: ['scan'], can_add_participants: false, all_checkpoints: true, checkpoint_ids: [] }
const MENU_HINT = {
  get scan() { return tr('Scan QR di checkpoint yang ditangani', 'Scan QR codes at assigned checkpoints') },
  get dashboard() { return tr('Statistik, check-in terbaru, dan laporan untuk checkpoint yang ditangani', 'Stats, latest check-ins, and reports for assigned checkpoints') },
  get participants() { return tr('Cari peserta dan riwayat check-in', 'Search participants and their check-in history') },
}

// Daftar role akses + form tambah/ubah. Dipakai di halaman Petugas (tab "Role akses").
export default function RolesPanel({ onChanged }) {
  const confirm = useConfirm()
  const [roles, setRoles] = useState([])
  const [usage, setUsage] = useState({})
  const [checkpoints, setCheckpoints] = useState([])
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    const [{ data: r }, { data: p }, { data: c }] = await Promise.all([
      supabase.from('roles').select('*').order('name'),
      supabase.from('profiles').select('role_id'),
      supabase.from('checkpoints').select('id,name,kind').order('sort_order').order('name'),
    ])
    setRoles(r || [])
    setCheckpoints(c || [])
    const count = {}
    for (const row of p || []) if (row.role_id) count[row.role_id] = (count[row.role_id] || 0) + 1
    setUsage(count)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(r) {
    setNotice(null)
    setEditing(r)
    window.scrollTo({ top: 0 })
  }

  async function save(r) {
    const payload = {
      name: r.name.trim(),
      menus: MENUS.map((m) => m.key).filter((k) => r.menus.includes(k)),
      can_add_participants: r.menus.includes('participants') && r.can_add_participants,
      all_checkpoints: r.all_checkpoints,
      checkpoint_ids: r.all_checkpoints ? [] : r.checkpoint_ids,
    }
    const { error } = r.id
      ? await supabase.from('roles').update(payload).eq('id', r.id)
      : await supabase.from('roles').insert(payload)
    if (error) return error.code === '23505' ? tr('Nama role sudah dipakai.', 'That role name is already taken.') : error.message
    setEditing(null)
    setNotice({
      type: 'ok',
      text: r.id
        ? tr(`Role ${payload.name} diperbarui.`, `Role ${payload.name} updated.`)
        : tr(`Role ${payload.name} dibuat. Pasang ke akun lewat tab Akun.`, `Role ${payload.name} created. Assign it to accounts in the Accounts tab.`),
    })
    load()
    onChanged?.()
    return null
  }

  async function remove(r) {
    const ok = await confirm({
      title: tr(`Hapus role ${r.name}?`, `Delete role ${r.name}?`),
      body: tr('Role ini tidak dipakai akun mana pun, jadi aman dihapus.', 'No account uses this role, so it is safe to delete.'),
      confirmLabel: tr('Hapus role', 'Delete role'),
      danger: true,
    })
    if (!ok) return
    const { error } = await supabase.from('roles').delete().eq('id', r.id)
    setNotice(
      error
        ? {
            type: 'error',
            text: error.code === '23503'
              ? tr('Role masih dipakai akun. Ganti role akun tersebut dulu.', 'The role is still used by an account. Change that account’s role first.')
              : error.message,
          }
        : { type: 'ok', text: tr(`Role ${r.name} dihapus.`, `Role ${r.name} deleted.`) }
    )
    load()
    onChanged?.()
  }

  const cpName = (id) => checkpoints.find((c) => c.id === id)

  if (editing) {
    return <RoleForm key={editing.id || 'new'} value={editing} checkpoints={checkpoints} onSave={save} onCancel={() => setEditing(null)} />
  }

  return (
    <>
      <div className="actions" style={{ marginBottom: '1rem' }}>
        <button className="btn btn-primary btn-block" onClick={() => startEdit({ ...EMPTY })}>+ {tr('Tambah role', 'Add role')}</button>
      </div>
      {notice && <p className={`notice ${notice.type}`} role="status">{notice.text}</p>}
      <p className="hint">
        {tr(
          'Role mengatur menu dan checkpoint yang boleh dipakai akun petugas. Admin selalu punya akses penuh, dan petugas tanpa role khusus memakai ',
          'A role sets which menus and checkpoints a staff account may use. Admins always have full access, and staff without a custom role use '
        )}
        <b>{tr('Petugas (akses penuh)', 'Staff (full access)')}</b>.
      </p>
      {roles.length === 0 ? (
        <p className="empty">
          {tr(
            'Belum ada role khusus. Contoh: role "Petugas Booth" yang hanya bisa scan di booth tertentu.',
            'No custom roles yet. Example: a "Booth Staff" role that can only scan at certain booths.'
          )}
        </p>
      ) : (
        <ul className="cards cols">
          {roles.map((r) => {
            const used = usage[r.id] || 0
            return (
              <li key={r.id} className="card">
                <div className="card-head">
                  <div>
                    <h3 className="card-title">{r.name}</h3>
                    <p className="card-sub">{used ? tr(`Dipakai ${used} akun`, `Used by ${used} account${used === 1 ? '' : 's'}`) : tr('Belum dipakai akun', 'Not used by any account')}</p>
                  </div>
                </div>
                <div className="perm-block">
                  <span className="perm-label">Menu</span>
                  <div className="chips">
                    {r.menus.map((m) => <span key={m} className="chip cyan">{MENU_LABEL[m]}</span>)}
                    {r.can_add_participants && <span className="chip">+ {tr('Tambah peserta', 'Add participants')}</span>}
                  </div>
                </div>
                <div className="perm-block">
                  <span className="perm-label">{tr('Checkpoint yang ditangani', 'Assigned checkpoints')}</span>
                  <div className="chips">
                    {r.all_checkpoints ? (
                      <span className="chip">{tr('Semua checkpoint', 'All checkpoints')}</span>
                    ) : r.checkpoint_ids.length === 0 ? (
                      <span className="chip off">{tr('Belum dipilih', 'None selected')}</span>
                    ) : (
                      r.checkpoint_ids.map((id) => {
                        const c = cpName(id)
                        return c ? (
                          <span key={id} className={`chip kind-tag kind-${c.kind}`}>{c.name}</span>
                        ) : null
                      })
                    )}
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn" onClick={() => startEdit(r)}>{tr('Ubah', 'Edit')}</button>
                  <button
                    className="btn btn-danger"
                    disabled={used > 0}
                    title={used > 0 ? tr('Ganti role akun yang memakainya dulu', 'Change the role of the accounts using it first') : undefined}
                    onClick={() => remove(r)}
                  >
                    {tr('Hapus', 'Delete')}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function RoleForm({ value, checkpoints, onSave, onCancel }) {
  const [f, setF] = useState(value)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const toggle = (k, item) => setF((p) => ({ ...p, [k]: p[k].includes(item) ? p[k].filter((x) => x !== item) : [...p[k], item] }))

  async function submit(e) {
    e.preventDefault()
    if (f.menus.length === 0) return setError(tr('Pilih minimal satu menu.', 'Choose at least one menu.'))
    if (!f.all_checkpoints && f.checkpoint_ids.length === 0) {
      return setError(tr('Pilih minimal satu checkpoint, atau izinkan semua checkpoint.', 'Choose at least one checkpoint, or allow all checkpoints.'))
    }
    setBusy(true)
    setError('')
    const err = await onSave(f)
    setBusy(false)
    if (err) setError(err)
  }

  const participants = f.menus.includes('participants')

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <h2>{value.id ? tr(`Ubah role ${value.name}`, `Edit role ${value.name}`) : tr('Tambah role', 'Add role')}</h2>
      <label className="full">
        {tr('Nama role', 'Role name')}
        <input required autoFocus value={f.name} onChange={(e) => set('name', e.target.value)} placeholder={tr('Contoh: Petugas Booth, Panitia Lunch', 'Example: Booth Staff, Lunch Crew')} />
      </label>

      <fieldset className="check-group full">
        <legend>{tr('Menu yang bisa dibuka', 'Menus it can open')}</legend>
        {MENUS.map((m) => (
          <label key={m.key} className="check-card">
            <input type="checkbox" checked={f.menus.includes(m.key)} onChange={() => toggle('menus', m.key)} />
            <span>
              <b>{m.label}</b>
              <small>{MENU_HINT[m.key]}</small>
            </span>
          </label>
        ))}
        <label className={`check-card sub ${participants ? '' : 'disabled'}`}>
          <input
            type="checkbox"
            disabled={!participants}
            checked={participants && f.can_add_participants}
            onChange={(e) => set('can_add_participants', e.target.checked)}
          />
          <span>
            <b>{tr('Boleh tambah peserta', 'May add participants')}</b>
            <small>{participants ? tr('Tombol + Tambah peserta di menu Peserta', 'The + Add participant button in the Participants menu') : tr('Aktifkan menu Peserta dulu', 'Enable the Participants menu first')}</small>
          </span>
        </label>
      </fieldset>

      {f.menus.length > 0 && (
        <fieldset className="check-group full">
          <legend>{tr('Checkpoint yang ditangani', 'Assigned checkpoints')}</legend>
          <p className="hint" style={{ margin: '0 0 0.25rem' }}>
            {tr(
              'Berlaku untuk scan, data di Monitoring, laporan Excel, dan riwayat check-in peserta.',
              'Applies to scanning, Monitoring data, the Excel report, and participant check-in history.'
            )}
          </p>
          <div className="segmented">
            <button type="button" className={f.all_checkpoints ? 'active' : ''} aria-pressed={f.all_checkpoints} onClick={() => set('all_checkpoints', true)}>
              {tr('Semua checkpoint', 'All checkpoints')}
            </button>
            <button type="button" className={!f.all_checkpoints ? 'active' : ''} aria-pressed={!f.all_checkpoints} onClick={() => set('all_checkpoints', false)}>
              {tr('Pilih tertentu', 'Choose specific')}
            </button>
          </div>
          {!f.all_checkpoints &&
            checkpoints.map((c) => (
              <label key={c.id} className="check-card">
                <input type="checkbox" checked={f.checkpoint_ids.includes(c.id)} onChange={() => toggle('checkpoint_ids', c.id)} />
                <KindIcon kind={c.kind} size="sm" />
                <span>
                  <b>{c.name}</b>
                </span>
              </label>
            ))}
        </fieldset>
      )}

      {error && <p className="form-error full" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>{tr('Batal', 'Cancel')}</button>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? tr('Menyimpan…', 'Saving…') : value.id ? tr('Simpan role', 'Save role') : tr('Buat role', 'Create role')}
        </button>
      </div>
    </form>
  )
}
