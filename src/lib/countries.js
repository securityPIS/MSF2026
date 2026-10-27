// Kode telepon negara untuk isian nomor di halaman registrasi. Indonesia di atas karena paling banyak dipakai.
// [kode ISO, kode telepon, nama Indonesia, nama Inggris]
export const COUNTRIES = [
  ['ID', '62', 'Indonesia', 'Indonesia'],
  ['SG', '65', 'Singapura', 'Singapore'],
  ['MY', '60', 'Malaysia', 'Malaysia'],
  ['BN', '673', 'Brunei Darussalam', 'Brunei Darussalam'],
  ['TH', '66', 'Thailand', 'Thailand'],
  ['PH', '63', 'Filipina', 'Philippines'],
  ['VN', '84', 'Vietnam', 'Vietnam'],
  ['KH', '855', 'Kamboja', 'Cambodia'],
  ['LA', '856', 'Laos', 'Laos'],
  ['MM', '95', 'Myanmar', 'Myanmar'],
  ['TL', '670', 'Timor Leste', 'Timor-Leste'],
  ['AU', '61', 'Australia', 'Australia'],
  ['NZ', '64', 'Selandia Baru', 'New Zealand'],
  ['PG', '675', 'Papua Nugini', 'Papua New Guinea'],
  ['CN', '86', 'Tiongkok', 'China'],
  ['HK', '852', 'Hong Kong', 'Hong Kong'],
  ['TW', '886', 'Taiwan', 'Taiwan'],
  ['JP', '81', 'Jepang', 'Japan'],
  ['KR', '82', 'Korea Selatan', 'South Korea'],
  ['IN', '91', 'India', 'India'],
  ['PK', '92', 'Pakistan', 'Pakistan'],
  ['BD', '880', 'Bangladesh', 'Bangladesh'],
  ['LK', '94', 'Sri Lanka', 'Sri Lanka'],
  ['AE', '971', 'Uni Emirat Arab', 'United Arab Emirates'],
  ['SA', '966', 'Arab Saudi', 'Saudi Arabia'],
  ['QA', '974', 'Qatar', 'Qatar'],
  ['OM', '968', 'Oman', 'Oman'],
  ['TR', '90', 'Turki', 'Türkiye'],
  ['EG', '20', 'Mesir', 'Egypt'],
  ['ZA', '27', 'Afrika Selatan', 'South Africa'],
  ['GB', '44', 'Inggris', 'United Kingdom'],
  ['NL', '31', 'Belanda', 'Netherlands'],
  ['DE', '49', 'Jerman', 'Germany'],
  ['FR', '33', 'Prancis', 'France'],
  ['NO', '47', 'Norwegia', 'Norway'],
  ['DK', '45', 'Denmark', 'Denmark'],
  ['GR', '30', 'Yunani', 'Greece'],
  ['IT', '39', 'Italia', 'Italy'],
  ['ES', '34', 'Spanyol', 'Spain'],
  ['US', '1', 'Amerika Serikat', 'United States'],
  ['CA', '1', 'Kanada', 'Canada'],
  ['BR', '55', 'Brasil', 'Brazil'],
].map(([iso, dial, id, en]) => ({ iso, dial, name: { id, en } }))

// Gabungkan kode negara + nomor lokal menjadi format internasional (+628123456789).
// Nol di depan nomor lokal dibuang; nomor yang diketik lengkap dengan "+" dipakai apa adanya.
export function toInternational(dial, local) {
  const raw = String(local ?? '').trim()
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return raw.startsWith('+') ? `+${digits}` : `+${dial}${digits.replace(/^0+/, '')}`
}

export const validPhone = (intl) => /^\+[1-9][0-9]{6,14}$/.test(intl)
