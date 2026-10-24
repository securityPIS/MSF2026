import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { demo, supabase } from '../lib/supabase.js'
import { DEMO_ACCOUNTS } from '../lib/demo.js'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : error.message)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <img
          className="login-kv"
          src="/msf2026-kv.jpg"
          alt="Maritime Security Forum 2026, Cirebon 29 sampai 30 Oktober 2026"
        />
        <div className="login-body">
          <div className="login-head">
            <span className="login-event">Cirebon, 29–30 Oktober 2026</span>
            <h1>Checkpoint Petugas</h1>
            <p>Masuk sebagai petugas atau admin</p>
          </div>
          <label>
            Email
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Kata sandi
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
          {demo && (
            <div className="demo-accounts">
              <p>Akun demo (kata sandi bebas):</p>
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
                  {a.role === 'admin' ? 'Admin' : 'Petugas'}: {a.email}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
