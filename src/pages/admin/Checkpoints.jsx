import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { KIND_LABEL, REPEAT_LABEL } from '../../lib/format.js'
import KindIcon from '../../components/KindIcon.jsx'
import { useConfirm } from '../../components/ConfirmDialog.jsx'
import { tr } from '../../lib/i18n.jsx'

const EMPTY = { name: '', kind: 'booth', repeat_rule: 'once', requires_badge: true, is_active: true, sort_order: 100 }
const KIND_DEFAULTS = {
  badge: { repeat_rule: 'once', requires_badge: false },
  booth: { repeat_rule: 'once', requires_badge: true },
  lunch: { repeat_rule: 'daily', requires_badge: true },
  souvenir: { repeat_rule: 'once', requires_badge: true },
  custom: {},
}

export default function Checkpoints() {
  const [list, setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const confirm = useConfirm()

  const load = useCallback(async () => {
    const { data } = await supabase.from('checkpoints').select('*').order('sort_order').order('name')
    setList(data || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save(cp) {
    setError('')
    const payload = {
      name: cp.name.trim(),
      kind: cp.kind,
      repeat_rule: cp.repeat_rule,
      requires_badge: cp.kind === 'badge' ? false : cp.requires_badge,
      is_active: cp.is_active,
      sort_order: Number(cp.sort_order) || 100,
    }
    const { error } = cp.id
      ? await supabase.from('checkpoints').update(payload).eq('id', cp.id)
      : await supabase.from('checkpoints').insert(payload)
    if (error) {
      setError(error.code === '23505' ? tr('Hanya boleh ada satu checkpoint bertipe Badge.', 'There can be only one checkpoint of type Badge.') : error.message)
      return
    }
    setEditing(null)
    load()
  }

  async function toggle(cp) {
    await supabase.from('checkpoints').update({ is_active: !cp.is_active }).eq('id', cp.id)
    load()
  }

  // Form tampil di atas daftar: gulir ke atas supaya langsung terlihat, terutama di HP
  function startEdit(cp) {
    setError('')
    setEditing(cp)
    window.scrollTo({ top: 0 })
  }

  async function remove(cp) {
    const ok = await confirm({
      title: tr(`Hapus "${cp.name}"?`, `Delete "${cp.name}"?`),
      body: tr(
        'Semua riwayat check-in di checkpoint ini ikut terhapus. Untuk menutup sementara, gunakan Nonaktifkan.',
        'All check-in history at this checkpoint is deleted too. To close it temporarily, use Deactivate.'
      ),
      confirmLabel: tr('Hapus checkpoint', 'Delete checkpoint'),
      danger: true,
    })
    if (!ok) return
    const { error } = await supabase.from('checkpoints').delete().eq('id', cp.id)
    if (error) setError(error.message)
    load()
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{tr('Pengaturan', 'Settings')}</p>
          <h1>Checkpoint</h1>
        </div>
        {!editing && (
          <div className="actions">
            <button className="btn btn-primary" onClick={() => startEdit({ ...EMPTY })}>{tr('Tambah checkpoint', 'Add checkpoint')}</button>
          </div>
        )}
      </div>
      {error && <p className="notice error">{error}</p>}
      {editing && <CheckpointForm key={editing.id || 'new'} value={editing} onSave={save} onCancel={() => setEditing(null)} />}

      {editing ? null : list.length === 0 ? (
        <p className="empty">{tr('Belum ada checkpoint. Tambahkan checkpoint pertama, misalnya Penukaran Badge ID.', 'No checkpoints yet. Add the first one, for example the Badge ID desk.')}</p>
      ) : (
        <ul className="cards cols">
          {list.map((cp) => (
            <li key={cp.id} className={`card ${cp.is_active ? '' : 'muted'}`}>
              <div className="card-head">
                <div className="card-title-row">
                  <KindIcon kind={cp.kind} />
                  <div>
                    <h3 className="card-title">{cp.name}</h3>
                    <p className="card-sub">{REPEAT_LABEL[cp.repeat_rule]}</p>
                  </div>
                </div>
                <span className={`chip ${cp.is_active ? 'on' : 'off'}`}>{cp.is_active ? tr('Aktif', 'Active') : tr('Nonaktif', 'Inactive')}</span>
              </div>
              <div className="chips">
                <span className={`chip kind-tag kind-${cp.kind}`}>{KIND_LABEL[cp.kind]}</span>
                <span className="chip">{cp.requires_badge ? tr('Wajib badge', 'Badge required') : tr('Tanpa badge', 'No badge needed')}</span>
                <span className="chip">{tr('Urutan', 'Order')} {cp.sort_order}</span>
              </div>
              <div className="card-actions">
                <button className="btn" onClick={() => startEdit(cp)}>{tr('Ubah', 'Edit')}</button>
                <button className="btn" onClick={() => toggle(cp)}>{cp.is_active ? tr('Nonaktifkan', 'Deactivate') : tr('Aktifkan', 'Activate')}</button>
                <button className="btn btn-danger" onClick={() => remove(cp)}>{tr('Hapus', 'Delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CheckpointForm({ value, onSave, onCancel }) {
  const [f, setF] = useState(value)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  return (
    <form
      className="panel form-grid"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(f)
      }}
    >
      <h2>{f.id ? tr('Ubah checkpoint', 'Edit checkpoint') : tr('Checkpoint baru', 'New checkpoint')}</h2>
      <label>
        {tr('Nama', 'Name')}
        <input required value={f.name} onChange={(e) => set('name', e.target.value)} placeholder={tr('Contoh: Booth Bakamla', 'Example: Bakamla Booth')} />
      </label>
      <fieldset className="kind-picker full">
        <legend>{tr('Tipe', 'Type')}</legend>
        {Object.entries(KIND_LABEL).map(([k, v]) => (
          <label key={k} className={`kind-option kind-${k}`}>
            <input
              type="radio"
              name="kind"
              value={k}
              checked={f.kind === k}
              onChange={() => setF((p) => ({ ...p, kind: k, ...KIND_DEFAULTS[k] }))}
            />
            <KindIcon kind={k} />
            <span>{v}</span>
          </label>
        ))}
      </fieldset>
      <label>
        {tr('Aturan check-in', 'Check-in rule')}
        <select value={f.repeat_rule} onChange={(e) => set('repeat_rule', e.target.value)}>
          {Object.entries(REPEAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>
        {tr('Urutan tampil', 'Display order')}
        <input type="number" value={f.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
      </label>
      <label className="check full">
        <input
          type="checkbox"
          checked={f.kind === 'badge' ? false : f.requires_badge}
          disabled={f.kind === 'badge'}
          onChange={(e) => set('requires_badge', e.target.checked)}
        />
        {tr('Peserta wajib sudah tukar badge', 'Participant must have collected a badge')}
      </label>
      <label className="check full">
        <input type="checkbox" checked={f.is_active} onChange={(e) => set('is_active', e.target.checked)} />
        {tr('Aktif (muncul di pilihan petugas)', 'Active (shown in the staff checkpoint list)')}
      </label>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>{tr('Batal', 'Cancel')}</button>
        <button className="btn btn-primary">{tr('Simpan checkpoint', 'Save checkpoint')}</button>
      </div>
    </form>
  )
}
