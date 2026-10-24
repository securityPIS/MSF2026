// Lambang perisai MSF 2026 (versi sederhana): perisai, bintang kompas, haluan kapal, ombak
export default function BrandMark({ size = 32, className = '' }) {
  return (
    <svg
      className={`brand-mark ${className}`}
      width={size}
      height={size * 1.08}
      viewBox="0 0 48 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M24 3 44 9.5V26c0 11.5-8.6 19.6-20 23C12.6 45.6 4 37.5 4 26V9.5Z" />
      <path d="M24 9.5 26.3 19.7 36 21.8 26.3 23.9 24 26.5 21.7 23.9 12 21.8 21.7 19.7Z" fill="currentColor" stroke="none" />
      <path d="M15.5 31.5 24 26.8l8.5 4.7-2.6 3.6H18.1Z" fill="currentColor" stroke="none" />
      <path d="M11.5 38.5c3.6-2.8 7.4 2.4 12.5-.2s8.6-2.6 12.5.2" />
      <path d="M15 43c2.8-1.8 5.6 1.6 9-.2s6.2-1.6 9 .2" />
    </svg>
  )
}
