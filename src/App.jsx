import { Navigate, Route, Routes } from 'react-router-dom'
import { configured, demo } from './lib/supabase.js'
import { resetDemo } from './lib/demo.js'
import { ConfirmProvider, useConfirm } from './components/ConfirmDialog.jsx'
import { AuthProvider, FullMessage, NoAccess, RequireMenu, RequireRole, useAuth } from './lib/auth.jsx'
import { homePath } from './lib/permissions.js'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Scan from './pages/Scan.jsx'
import ParticipantHistory from './pages/ParticipantHistory.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Participants from './pages/admin/Participants.jsx'
import Import from './pages/admin/Import.jsx'
import Checkpoints from './pages/admin/Checkpoints.jsx'
import Staff from './pages/admin/Staff.jsx'

export default function App() {
  if (!configured) {
    return (
      <FullMessage
        title="Supabase belum dikonfigurasi"
        body="Salin .env.example menjadi .env, isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu jalankan ulang npm run dev."
      />
    )
  }

  const admin = (el) => <RequireRole roles={['admin']}>{el}</RequireRole>
  const menu = (key, el) => <RequireMenu menu={key}>{el}</RequireMenu>

  return (
    <ConfirmProvider>
      <AuthProvider>
        {demo && <DemoBar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/p/:code" element={<ParticipantHistory />} />
          <Route
            element={
              <RequireRole roles={['admin', 'officer']}>
                <Layout />
              </RequireRole>
            }
          >
            <Route path="/scan" element={menu('scan', <Scan />)} />
            <Route path="/admin" element={menu('dashboard', <Dashboard />)} />
            <Route path="/admin/participants" element={menu('participants', <Participants />)} />
            <Route path="/admin/import" element={admin(<Import />)} />
            <Route path="/admin/checkpoints" element={admin(<Checkpoints />)} />
            <Route path="/admin/staff" element={admin(<Staff />)} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </ConfirmProvider>
  )
}

function DemoBar() {
  const confirm = useConfirm()
  async function reset() {
    const ok = await confirm({
      title: 'Reset data demo?',
      body: 'Semua check-in dan perubahan di browser ini dihapus, data kembali ke kondisi awal.',
      confirmLabel: 'Reset',
      danger: true,
    })
    if (!ok) return
    resetDemo()
    window.location.reload()
  }
  return (
    <div className="demo-bar" role="note">
      <span><strong>Mode demo</strong> · data tiruan di browser ini</span>
      <button className="btn-link" onClick={reset}>Reset</button>
    </div>
  )
}

function Home() {
  const { session, profile, loading } = useAuth()
  if (loading) return <FullMessage title="Memuat…" />
  if (!session) return <Navigate to="/login" replace />
  const path = homePath(profile)
  return path ? <Navigate to={path} replace /> : <NoAccess />
}
