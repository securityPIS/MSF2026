import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { FullMessage } from '../lib/auth.jsx'
import { formatTime } from '../lib/format.js'
import KindIcon from '../components/KindIcon.jsx'

// Halaman publik peserta: /p/<kode-qr>
export default function ParticipantHistory() {
  const { code } = useParams()
  const [data, setData] = useState(undefined)

  useEffect(() => {
    supabase.rpc('participant_history', { p_code: code }).then(({ data, error }) => setData(error ? null : data))
  }, [code])

  if (data === undefined) return <FullMessage title="Memuat…" />
  if (!data) return <FullMessage title="Kode tidak ditemukan" body="Periksa kembali link Anda atau tanyakan ke meja registrasi." />

  const booths = data.checkins.filter((c) => c.kind === 'booth').length

  return (
    <div className="public">
      <img className="public-kv" src="/msf2026-kv.jpg" alt="Maritime Security Forum 2026, Cirebon 29 sampai 30 Oktober 2026" />
      <div className="public-body">
        <p className="login-event">Riwayat kunjungan peserta</p>
        <h1>{data.name}</h1>
        {data.organization && <p className="public-org">{data.organization}</p>}
        <p className="public-summary"><b>{booths}</b> booth dikunjungi</p>
        {data.checkins.length === 0 ? (
          <p className="empty">Belum ada check-in. Tunjukkan QR Anda di meja penukaran badge untuk memulai.</p>
        ) : (
          <ol className="timeline with-icons">
            {data.checkins.map((c, i) => (
              <li key={i}>
                <KindIcon kind={c.kind} size="sm" />
                <time>{formatTime(c.at)}</time>
                <div><strong>{c.checkpoint}</strong></div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
