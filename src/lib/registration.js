import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { tr } from './i18n.jsx'

// Status buka/tutup registrasi yang diatur admin. null = masih dimuat.
// Kalau fungsi belum ada (migrasi belum dijalankan) atau gagal dimuat, registrasi dianggap terbuka seperti sebelumnya;
// fungsi register_participant tetap menolak sendiri saat registrasi ditutup.
export function useRegistrationOpen() {
  const [open, setOpenState] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('registration_open').then(({ data, error }) => {
      if (!cancelled) setOpenState(error ? true : data !== false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Khusus admin. Mengembalikan pesan error, atau '' kalau berhasil.
  const setOpen = useCallback(async (next) => {
    const { data, error } = await supabase.rpc('set_registration_open', { p_open: next })
    if (error?.code === 'PGRST202' || /Could not find the function|does not exist/i.test(error?.message ?? '')) {
      return tr(
        'fungsi belum ada di database. Jalankan supabase/migrations/20261027120000_registration_toggle.sql di SQL Editor Supabase.',
        'the function is missing from the database. Run supabase/migrations/20261027120000_registration_toggle.sql in the Supabase SQL Editor.'
      )
    }
    if (error) return error.message
    setOpenState(data !== false)
    return ''
  }, [])

  return { open, setOpen, markClosed: () => setOpenState(false) }
}
