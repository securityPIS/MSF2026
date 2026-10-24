import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase.js'
import { canMenu } from './permissions.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = belum diketahui
  const [profile, setProfile] = useState(null)
  const [profileFor, setProfileFor] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setProfileFor(null)
      return
    }
    let cancelled = false
    supabase
      .from('profiles')
      .select('*, perm:roles(*)') // role akses buatan admin, kosong = akses penuh petugas
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setProfile(data)
        setProfileFor(userId)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const loading = session === undefined || (Boolean(userId) && profileFor !== userId)
  const value = { session, profile, loading, signOut: () => supabase.auth.signOut() }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function FullMessage({ title, body, action }) {
  return (
    <div className="full-message">
      <h1>{title}</h1>
      {body && <p>{body}</p>}
      {action}
    </div>
  )
}

export function NoAccess() {
  const { session, signOut } = useAuth()
  return (
    <FullMessage
      title="Akun belum punya akses"
      body={`Akun ${session?.user?.email ?? ''} belum diberi peran petugas atau admin. Minta admin mengatur peran di menu Petugas.`}
      action={<button className="btn" onClick={signOut}>Keluar</button>}
    />
  )
}

export function RequireRole({ roles, children }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullMessage title="Memuat…" />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!profile || !['admin', 'officer'].includes(profile.role)) return <NoAccess />
  if (!roles.includes(profile.role)) {
    return <FullMessage title="Halaman khusus admin" body="Halaman ini hanya bisa dibuka admin." />
  }
  return children
}

// Untuk menu yang bisa diatur per role (Scan, Dashboard, Peserta)
export function RequireMenu({ menu, children }) {
  const { profile } = useAuth()
  return (
    <RequireRole roles={['admin', 'officer']}>
      {canMenu(profile, menu) ? (
        children
      ) : (
        <FullMessage title="Menu tidak tersedia" body={`Role ${profile?.perm?.name ?? 'Anda'} tidak punya akses ke menu ini.`} />
      )}
    </RequireRole>
  )
}
