// Sertifikat keikutsertaan MSF 2026, digambar di canvas (A4 landscape) lalu diunduh sebagai PNG
const W = 2000
const H = 1414
const NAVY = '#0a1f5c'
const GREY = '#4a5b7d'

const font = (weight, px) => `${weight} ${px}px Montserrat, 'Segoe UI', sans-serif`

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null) // logo gagal dimuat: sertifikat tetap dibuat tanpa logo itu
    img.src = src
  })
}

function fitFont(ctx, text, weight, max, width) {
  let px = max
  ctx.font = font(weight, px)
  while (px > 18 && ctx.measureText(text).width > width) {
    px -= 2
    ctx.font = font(weight, px)
  }
}

function spaced(ctx, px) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
}

function drawWaves(ctx, top, color, count) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  for (let i = 0; i < count; i++) {
    const y = top + i * 22
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(400, y - 40, 700, y + 50, 1000, y)
    ctx.bezierCurveTo(1300, y - 50, 1600, y + 40, W, y - 10)
    ctx.stroke()
  }
  ctx.restore()
}

export async function renderCertificate({ name, organization, certificateNo, submittedAt }) {
  await Promise.all(['800 96px', '700 40px', '600 36px', '500 30px'].map((f) => document.fonts?.load(`${f} Montserrat`)))
  const [logo, danantara, pertamina] = await Promise.all([
    loadImage('/brand/msf-logo.png'),
    loadImage('/landing/logos/danantara.webp'),
    loadImage('/landing/logos/pertamina-patra-niaga.webp'),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'

  // Latar putih + bingkai navy
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Pita atas navy dengan logo
  const band = ctx.createLinearGradient(0, 0, W, 330)
  band.addColorStop(0, '#1659f0')
  band.addColorStop(0.45, '#0a2f9a')
  band.addColorStop(1, '#03103a')
  ctx.fillStyle = band
  ctx.fillRect(0, 0, W, 330)
  drawWaves(ctx, 250, 'rgba(255, 255, 255, 0.12)', 4)

  if (logo) {
    const lh = 200
    ctx.drawImage(logo, 110, 65, (logo.width / logo.height) * lh, lh)
  }
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = font(800, 52)
  ctx.fillText('MARITIME SECURITY', 330, 160)
  ctx.fillStyle = '#48d6ff'
  ctx.font = font(700, 36)
  spaced(ctx, 10)
  ctx.fillText('FORUM 2026', 332, 215)
  spaced(ctx, 0)

  let x = W - 110
  for (const img of [pertamina, danantara]) {
    if (!img) continue
    const h = 64
    const w = (img.width / img.height) * h
    x -= w
    ctx.drawImage(img, x, 133, w, h)
    x -= 50
  }

  // Bingkai halus di area isi
  ctx.strokeStyle = '#d6e2fb'
  ctx.lineWidth = 3
  ctx.strokeRect(50, 380, W - 100, H - 430)
  ctx.strokeStyle = '#0a2f9a'
  ctx.lineWidth = 18
  ctx.strokeRect(9, 9, W - 18, H - 18)

  // Isi
  const cx = W / 2
  ctx.textAlign = 'center'
  ctx.fillStyle = NAVY
  ctx.font = font(800, 62)
  spaced(ctx, 8)
  ctx.fillText('CERTIFICATE OF PARTICIPATION', cx, 495)
  spaced(ctx, 4)
  ctx.fillStyle = '#1659f0'
  ctx.font = font(600, 28)
  ctx.fillText('SERTIFIKAT KEIKUTSERTAAN', cx, 548)
  spaced(ctx, 0)

  ctx.fillStyle = GREY
  ctx.font = font(500, 32)
  ctx.fillText('This certificate is proudly presented to', cx, 650)

  ctx.fillStyle = NAVY
  fitFont(ctx, name, 800, 100, 1650)
  ctx.fillText(name, cx, 785)

  const line = ctx.createLinearGradient(cx - 480, 0, cx + 480, 0)
  line.addColorStop(0, 'rgba(72, 214, 255, 0)')
  line.addColorStop(0.5, '#1f86ff')
  line.addColorStop(1, 'rgba(72, 214, 255, 0)')
  ctx.fillStyle = line
  ctx.fillRect(cx - 480, 818, 960, 4)

  if (organization) {
    ctx.fillStyle = GREY
    fitFont(ctx, organization, 600, 36, 1500)
    ctx.fillText(organization, cx, 880)
  }

  ctx.fillStyle = NAVY
  ctx.font = font(600, 36)
  ctx.fillText('for participating in the Maritime Security Forum 2026', cx, 990)
  ctx.fillStyle = GREY
  fitFont(ctx, '“Navigating Uncertainty: Building Resilient Maritime Security in a Changing Risk Landscape”', 500, 30, 1700)
  ctx.fillText('“Navigating Uncertainty: Building Resilient Maritime Security in a Changing Risk Landscape”', cx, 1045)
  ctx.font = font(500, 28)
  ctx.fillText('29–30 October 2026 · Patra Cirebon Hotel & Convention, Cirebon, Indonesia', cx, 1100)

  // Kaki: nomor sertifikat dan tanggal terbit
  drawWaves(ctx, 1260, 'rgba(22, 89, 240, 0.08)', 4)
  const issued = new Date(submittedAt || Date.now()).toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })
  ctx.font = font(600, 26)
  ctx.fillStyle = NAVY
  ctx.textAlign = 'left'
  ctx.fillText(`Certificate No. ${certificateNo}`, 110, 1300)
  ctx.textAlign = 'right'
  ctx.fillText(`Issued ${issued}`, W - 110, 1300)

  return canvas
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'peserta'

export function downloadCertificate(canvas, name) {
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `Sertifikat-MSF2026-${slug(name)}.png`
  a.click()
}
