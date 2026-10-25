import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const CHECK_EVERY = 15000 // ms: cek berkala ke server, karena Wi-Fi bisa tersambung tanpa internet
const REQUEST_TIMEOUT = 10000 // ms: permintaan yang menggantung dianggap gagal

// Fetch yang gagal: "Failed to fetch" (Chrome), "Load failed" (Safari), "NetworkError…" (Firefox), atau dibatalkan karena batas waktu
export const isNetworkError = (error) =>
  !navigator.onLine || /fetch|network|load failed|abort/i.test(String(error?.message || error))

// Batalkan permintaan Supabase yang tidak dijawab dalam batas waktu. Hasil diberi tanda timedOut.
export async function withTimeout(request, ms = REQUEST_TIMEOUT) {
  if (typeof request.abortSignal !== 'function') return request // klien demo tidak mendukung pembatalan
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await request.abortSignal(ctrl.signal)
    return { ...res, timedOut: ctrl.signal.aborted }
  } catch (error) {
    return { data: null, error, timedOut: ctrl.signal.aborted }
  } finally {
    clearTimeout(timer)
  }
}

// Status koneksi ke server: dari event online/offline browser, cek berkala, dan hasil permintaan terakhir
export function useConnection() {
  const [online, setOnline] = useState(() => navigator.onLine)

  const check = useCallback(async () => {
    if (!navigator.onLine) return setOnline(false)
    const { error } = await withTimeout(supabase.from('checkpoints').select('id').limit(1), 8000)
    setOnline(!(error && isNetworkError(error)))
  }, [])

  useEffect(() => {
    const goOffline = () => setOnline(false)
    window.addEventListener('online', check)
    window.addEventListener('offline', goOffline)
    const timer = setInterval(check, CHECK_EVERY)
    return () => {
      window.removeEventListener('online', check)
      window.removeEventListener('offline', goOffline)
      clearInterval(timer)
    }
  }, [check])

  return [online, setOnline]
}
