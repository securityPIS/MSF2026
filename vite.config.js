import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// HTTPS + host:true supaya kamera HP bisa dipakai saat uji di jaringan lokal.
// `npm run dev:http` mematikan HTTPS untuk dibuka di laptop saja (localhost tetap boleh akses kamera).
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'http' ? [] : [basicSsl()])],
  server: { host: true, port: 5173 },
}))
