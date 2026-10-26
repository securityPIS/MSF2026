// Lambang perisai MSF 2026: perisai, bintang kompas, haluan kapal, ombak (putih, dengan efek glow lewat CSS)
export default function BrandMark({ size = 32, className = '' }) {
  return (
    <img
      className={`brand-mark ${className}`}
      src="/brand/msf-logo.webp"
      width={Math.round(size * 1.1 * 0.937)}
      height={Math.round(size * 1.1)}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  )
}
