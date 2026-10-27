import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { tr } from '../lib/i18n.jsx'

export const QR_OPTS = { errorCorrectionLevel: 'M', margin: 1, color: { dark: '#03103a', light: '#ffffff' } }

// Gambar QR untuk ditampilkan di layar
export default function QrCode({ code, size = 200 }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(code, { ...QR_OPTS, width: size * 2 }).then((url) => !cancelled && setSrc(url))
    return () => {
      cancelled = true
    }
  }, [code, size])
  return (
    <div className="qr" style={{ width: size, height: size }}>
      {src && <img src={src} width={size} height={size} alt={`QR code ${code}`} />}
    </div>
  )
}

// Kartu PNG siap cetak: QR + nama + instansi + kode, untuk dikirim ke peserta atau dicetak di badge
export async function downloadQrCard({ code, name, organization }) {
  const W = 720
  const H = 960
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0a2f9a')
  bg.addColorStop(1, '#03103a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  await document.fonts?.ready
  const font = (weight, px) => `${weight} ${px}px Montserrat, 'Segoe UI', sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#48d6ff'
  ctx.font = font(700, 22)
  ctx.fillText('MARITIME SECURITY FORUM 2026', W / 2, 70)
  ctx.fillStyle = '#a8c0ec'
  ctx.font = font(500, 20)
  ctx.fillText(tr('Cirebon, 29–30 Oktober 2026', 'Cirebon, 29–30 October 2026'), W / 2, 102)

  const qrSize = 500
  const qrX = (W - qrSize) / 2
  const qrY = 140
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 24)
  ctx.fill()
  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, code, { ...QR_OPTS, margin: 0, width: qrSize })
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)

  ctx.fillStyle = '#ffffff'
  ctx.font = font(800, fitSize(ctx, name, 44, W - 80, (px) => font(800, px)))
  ctx.fillText(name, W / 2, qrY + qrSize + 92)
  if (organization) {
    ctx.fillStyle = '#a8c0ec'
    ctx.font = font(500, fitSize(ctx, organization, 26, W - 80, (px) => font(500, px)))
    ctx.fillText(organization, W / 2, qrY + qrSize + 134)
  }
  ctx.fillStyle = '#48d6ff'
  ctx.font = `600 28px ui-monospace, Consolas, monospace`
  ctx.fillText(code, W / 2, H - 50)

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `QR-MSF2026-${slug(name)}-${code}.png`
  a.click()
}

function fitSize(ctx, text, max, width, fontFor) {
  let px = max
  ctx.font = fontFor(px)
  while (px > 14 && ctx.measureText(text).width > width) {
    px -= 2
    ctx.font = fontFor(px)
  }
  return px
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'peserta'
