import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LangProvider } from './lib/i18n.jsx'
import './styles.css'

// Setelah deploy baru, chunk JS lama (mis. pdf-lib untuk sertifikat) sudah tidak ada di server. Halaman yang dibuka
// sebelum deploy gagal memuatnya, jadi muat ulang sekali ke versi terbaru. Status /feedback tersimpan di sessionStorage.
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'msf2026.reloadedAt'
  try {
    if (Date.now() - Number(sessionStorage.getItem(KEY) || 0) < 30_000) return // baru saja dimuat ulang: jangan berulang
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    return // storage diblokir: tanpa penanda, reload bisa berulang terus
  }
  event.preventDefault()
  window.location.reload()
})

// Tanpa StrictMode: library kamera tidak suka di-mount dua kali saat development
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LangProvider>
      <App />
    </LangProvider>
  </BrowserRouter>
)
