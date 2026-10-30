import { Fragment } from 'react'
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
import FeedbackSummary from './pages/admin/FeedbackSummary.jsx'
import Home from './pages/home/Home.jsx'
import Feedback from './pages/Feedback.jsx'
import Register from './pages/Register.jsx'
import { tr, useLang } from './lib/i18n.jsx'

export default function App() {
  const { lang } = useLang()
  if (!configured) {
    return (
      <FullMessage
        title={tr('Supabase belum dikonfigurasi', 'Supabase is not configured')}
        body={tr(
          'Salin .env.example menjadi .env, isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu jalankan ulang npm run dev.',
          'Copy .env.example to .env, fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.'
        )}
      />
    )
  }

  const admin = (el) => <RequireRole roles={['admin']}>{el}</RequireRole>
  const menu = (key, el) => <RequireMenu menu={key}>{el}</RequireMenu>

  return (
    <ConfirmProvider>
      <AuthProvider>
        {/* key: ganti bahasa menggambar ulang semua halaman dengan teks baru */}
        <Fragment key={lang}>
          {demo && <DemoBar />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/p/:code" element={<ParticipantHistory />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/register" element={<Register />} />
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
              <Route path="/admin/feedback" element={menu('dashboard', <FeedbackSummary />)} />
              <Route path="/admin/import" element={admin(<Import />)} />
              <Route path="/admin/checkpoints" element={admin(<Checkpoints />)} />
              <Route path="/admin/staff" element={admin(<Staff />)} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<StaffHome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Fragment>
      </AuthProvider>
    </ConfirmProvider>
  )
}

function DemoBar() {
  const confirm = useConfirm()
  async function reset() {
    const ok = await confirm({
      title: tr('Reset data demo?', 'Reset demo data?'),
      body: tr(
        'Semua check-in dan perubahan di browser ini dihapus, data kembali ke kondisi awal.',
        'All check-ins and changes in this browser are deleted and the data returns to its initial state.'
      ),
      confirmLabel: 'Reset',
      danger: true,
    })
    if (!ok) return
    resetDemo()
    window.location.reload()
  }
  return (
    <div className="demo-bar" role="note">
      <span><strong>{tr('Mode demo', 'Demo mode')}</strong> · {tr('data tiruan di browser ini', 'sample data in this browser')}</span>
      <button className="btn-link" onClick={reset}>Reset</button>
    </div>
  )
}

// Setelah login: arahkan ke halaman pertama yang boleh dibuka akun ini
function StaffHome() {
  const { session, profile, loading } = useAuth()
  if (loading) return <FullMessage title={tr('Memuat…', 'Loading…')} />
  if (!session) return <Navigate to="/login" replace />
  const path = homePath(profile)
  return path ? <Navigate to={path} replace /> : <NoAccess />
}
