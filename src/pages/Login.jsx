import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { demo, supabase } from '../lib/supabase.js'
import { DEMO_ACCOUNTS } from '../lib/demo.js'
import { useAuth } from '../lib/auth.jsx'
import { tr, useLang } from '../lib/i18n.jsx'

export default function Login() {
  const { session, loading } = useAuth()
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/app" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? tr('Email atau kata sandi salah.', 'Wrong email or password.') : error.message)
    } else {
      navigate('/app', { replace: true })
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <img
          className="login-kv"
          src="/msf2026-kv.jpg"
          alt={tr('Maritime Security Forum 2026, Cirebon 29 sampai 30 Oktober 2026', 'Maritime Security Forum 2026, Cirebon 29 to 30 October 2026')}
        />
        <div className="login-body">
          <div className="login-head">
            <span className="login-event">{tr('Cirebon, 29–30 Oktober 2026', 'Cirebon, 29–30 October 2026')}</span>
            <h1>{tr('Checkpoint Petugas', 'Staff Checkpoint')}</h1>
            <p>{tr('Masuk sebagai petugas atau admin', 'Sign in as staff or admin')}</p>
          </div>
          <label>
            Email
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            {tr('Kata sandi', 'Password')}
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? tr('Memproses…', 'Signing in…') : tr('Masuk', 'Sign in')}</button>
          {demo && (
            <div className="demo-accounts">
              <p>{tr('Akun demo (kata sandi bebas):', 'Demo accounts (any password):')}</p>
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  type="button"
                  key={a.email}
                  className="btn"
                  onClick={() => {
                    setEmail(a.email)
                    setPassword('demo')
                  }}
                >
                  {a.role === 'admin' ? 'Admin' : tr('Petugas', 'Staff')}: {a.email}
                </button>
              ))}
            </div>
          )}
          <div className="segmented login-lang" role="group" aria-label={tr('Bahasa', 'Language')}>
            <button type="button" className={lang === 'id' ? 'active' : ''} aria-pressed={lang === 'id'} onClick={() => setLang('id')}>IDN</button>
            <button type="button" className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>ENG</button>
          </div>
          <Link className="login-home" to="/">← {tr('Kembali ke beranda MSF 2026', 'Back to the MSF 2026 home page')}</Link>
        </div>
      </form>
    </div>
  )
}
