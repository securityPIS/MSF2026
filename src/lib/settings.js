import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { tr } from './i18n.jsx'

// Saklar on/off yang diatur admin dari menu pengaturan. Tiap saklar dibaca dan diubah lewat fungsi database sendiri.
const SWITCHES = {
  // Saat ditutup, register_participant juga menolak pendaftaran baru
  registration: { get: 'registration_open', set: 'set_registration_open', arg: 'p_open', migration: '20261027120000_registration_toggle.sql' },
  // Hanya menyembunyikan link Feedback di menu landing page; halaman /feedback tetap bisa dibuka
  feedbackMenu: { get: 'feedback_menu_visible', set: 'set_feedback_menu_visible', arg: 'p_visible', migration: '20261027130000_feedback_menu_toggle.sql' },
}

// on: true/false, atau null selama dimuat. Kalau fungsi belum ada (migrasi belum dijalankan) atau gagal dimuat,
// saklar dianggap menyala seperti perilaku sebelum ada saklar.
export function useAppSwitch(name) {
  const s = SWITCHES[name]
  const [on, setOn] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc(s.get).then(({ data, error }) => {
      if (!cancelled) setOn(error ? true : data !== false)
    })
    return () => {
      cancelled = true
    }
  }, [s])

  // Khusus admin. Mengembalikan pesan error, atau '' kalau berhasil.
  const set = useCallback(
    async (next) => {
      const { data, error } = await supabase.rpc(s.set, { [s.arg]: next })
      if (error?.code === 'PGRST202' || /Could not find the function|does not exist/i.test(error?.message ?? '')) {
        return tr(
          `fungsi belum ada di database. Jalankan supabase/migrations/${s.migration} di SQL Editor Supabase.`,
          `the function is missing from the database. Run supabase/migrations/${s.migration} in the Supabase SQL Editor.`
        )
      }
      if (error) return error.message
      setOn(data !== false)
      return ''
    },
    [s]
  )

  return { on, set, markOff: () => setOn(false) }
}
