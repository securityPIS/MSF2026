// Sertifikat keikutsertaan MSF 2026: nama peserta ditulis di atas template PDF panitia (public/certificate),
// hasilnya diunduh sebagai PDF. Pratinjau di layar memakai gambar template yang sama dengan bentuk dan posisi nama yang sama.

// pdf-lib dan fontkit cukup besar, jadi baru dimuat saat sertifikat dibuat (tidak ikut bundle utama)
const libs = () => Promise.all([import('pdf-lib'), import('@pdf-lib/fontkit').then((m) => m.default)])

const TEMPLATE_PDF = '/certificate/template.pdf'
const TEMPLATE_IMG = '/certificate/template.jpg' // template.pdf yang dirender 150 dpi, hanya untuk pratinjau
const NAME_FONT = '/certificate/GreatVibes-Regular.ttf'

// Ukuran dalam point PDF; baseline diukur dari atas halaman (template A4 landscape 842,25 x 595,5 pt).
// Nama berada di ruang kosong di bawah "THIS CERTIFICATE IS PROUDLY PRESENTED TO".
const PAGE_W = 842.25
const NAME = { baseline: 280, maxSize: 58, minSize: 28, maxWidth: 600 }
const NAVY = [5, 73, 156] // warna biru tulisan "CERTIFICATE" di template

// Huruf kapital semua sulit dibaca dalam huruf tulisan tangan, jadi diubah ke huruf awal kapital.
// Kata bertitik (gelar, singkatan: S.T., H.) dibiarkan apa adanya.
export function certificateName(name) {
  const s = String(name || '').replace(/\s+/g, ' ').trim()
  if (s !== s.toUpperCase() && s !== s.toLowerCase()) return s
  return s
    .split(' ')
    .map((w) => (w.includes('.') ? w : w.toLowerCase().replace(/(^|[-'’])(\p{L})/gu, (m, p, c) => p + c.toUpperCase())))
    .join(' ')
}

export function certificateFileName(name) {
  const safe = certificateName(name).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').replace(/[.\s]+$/, '') || 'Peserta'
  return `MSF2026-Certificate-${safe}.pdf`
}

const FIX = (n) => Math.round(n * 100) / 100

// Nama disusun dengan fontkit (ligatur, kerning, glyph kontekstual Great Vibes) lalu diubah menjadi path SVG
// dalam satuan point: x dari ujung kiri nama, y dari baseline ke bawah. pdf-lib menulis teks tanpa posisi GPOS
// sehingga spasi huruf tulisan tangan berantakan; sebagai kurva, hasil PDF dan pratinjau sama persis.
function layoutName(text, font) {
  const run = font.layout(text)
  // Spasi bawaan Great Vibes sempit sehingga antarkata tampak menempel; tiap spasi dilebarkan 0,2 em
  const advance = (i) => run.positions[i].xAdvance + (run.glyphs[i].codePoints.includes(32) ? font.unitsPerEm * 0.2 : 0)
  const units = run.glyphs.reduce((sum, g, i) => sum + advance(i), 0)
  let size = NAME.maxSize
  while (size > NAME.minSize && (units * size) / font.unitsPerEm > NAME.maxWidth) size -= 1
  const k = size / font.unitsPerEm

  let pen = 0
  const d = []
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i]
    const ox = pen + pos.xOffset
    const oy = pos.yOffset
    const pt = (x, y) => `${FIX((ox + x) * k)} ${FIX(-(oy + y) * k)}`
    for (const { command, args } of glyph.path.commands) {
      if (command === 'moveTo') d.push(`M${pt(args[0], args[1])}`)
      else if (command === 'lineTo') d.push(`L${pt(args[0], args[1])}`)
      else if (command === 'quadraticCurveTo') d.push(`Q${pt(args[0], args[1])} ${pt(args[2], args[3])}`)
      else if (command === 'bezierCurveTo') d.push(`C${pt(args[0], args[1])} ${pt(args[2], args[3])} ${pt(args[4], args[5])}`)
      else if (command === 'closePath') d.push('Z')
    }
    pen += advance(i)
  })
  return { path: d.join(''), width: units * k }
}

export async function buildCertificatePdf(name, { template, font }) {
  const [{ PDFDocument, rgb }, fontkit] = await libs()
  const text = certificateName(name)
  const { path, width } = layoutName(text, fontkit.create(new Uint8Array(font)))
  const doc = await PDFDocument.load(template)
  const page = doc.getPage(0)
  const size = page.getSize()
  page.drawSvgPath(path, { x: (size.width - width) / 2, y: size.height - NAME.baseline, color: rgb(...NAVY.map((c) => c / 255)) })
  doc.setTitle(`MSF 2026 Certificate of Attendance - ${text}`)
  doc.setAuthor('Maritime Security Forum 2026')
  return doc.save()
}

async function fetchBytes(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Gagal memuat ${url} (${res.status})`)
  return res.arrayBuffer()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Gagal memuat ${src}`))
    img.src = src
  })
}

async function renderPreview(name, font) {
  const [, fontkit] = await libs()
  const img = await loadImage(TEMPLATE_IMG)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const { path, width } = layoutName(certificateName(name), fontkit.create(new Uint8Array(font)))
  const k = canvas.width / PAGE_W // piksel per point
  ctx.setTransform(k, 0, 0, k, ((PAGE_W - width) / 2) * k, NAME.baseline * k)
  ctx.fillStyle = `rgb(${NAVY.join(',')})`
  ctx.fill(new Path2D(path))
  return canvas.toDataURL('image/jpeg', 0.85)
}

// PDF dibuat di awal supaya tombol unduh langsung menyimpan file (browser HP sering menolak unduhan yang menunggu proses async)
export async function renderCertificate(name) {
  const [template, font] = await Promise.all([fetchBytes(TEMPLATE_PDF), fetchBytes(NAME_FONT)])
  const [pdf, preview] = await Promise.all([buildCertificatePdf(name, { template, font }), renderPreview(name, font)])
  return { preview, pdf: new Blob([pdf], { type: 'application/pdf' }), fileName: certificateFileName(name) }
}

export function downloadCertificate(cert) {
  const url = URL.createObjectURL(cert.pdf)
  const a = document.createElement('a')
  a.href = url
  a.download = cert.fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
