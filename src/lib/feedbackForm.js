// Daftar pertanyaan feedback, dipakai halaman /feedback dan ringkasan feedback (admin)
import { tr } from './i18n.jsx'

// Pertanyaan sesuai formulir panitia "MSF2026 Participant Feedback & Event Evaluation".
// Jawaban disimpan apa adanya di kolom feedback.answers; nilai pilihan memakai label bahasa Inggris supaya mudah direkap.
// Key "overall" (pertanyaan 12) juga dibaca di detail peserta (admin).
export const L = (x) => tr(x.id, x.en)
export const OTHER = 'Other'
export const opt = (en, id) => ({ value: en, label: { id, en } })
const rating = (key, en, id) => ({ key, type: 'rating', label: { id, en } })
export const QUESTIONS = [
  {
    key: 'sector', type: 'choice', cols: 2, other: true,
    section: { id: 'A. Informasi Peserta', en: 'A. Participant Information' },
    label: { id: 'Sektor apa yang paling mewakili organisasi Anda?', en: 'Which sector best represents your organization?' },
    options: [
      opt('Energy / Oil & Gas', 'Energi / Migas'),
      opt('Shipping / Maritime Industry', 'Pelayaran / Industri Maritim'),
      opt('Government / Regulatory Authority', 'Pemerintah / Regulator'),
      opt('Military / Law Enforcement', 'Militer / Penegak Hukum'),
      opt('Security / Technology Provider', 'Penyedia Jasa Keamanan / Teknologi'),
      opt('Academia / Research', 'Akademisi / Riset'),
    ],
  },
  {
    key: 'days_attended', type: 'choice',
    label: { id: 'Hari forum mana yang Anda hadiri?', en: 'Which day(s) of the forum did you attend?' },
    options: [opt('Day 1 – October 29', 'Hari 1 – 29 Oktober'), opt('Day 2 – October 30', 'Hari 2 – 30 Oktober'), opt('Both days', 'Kedua hari')],
  },
  {
    ...rating('topic_relevance',
      'How relevant were the forum topics to your professional responsibilities and industry challenges?',
      'Seberapa relevan topik forum dengan tanggung jawab profesional dan tantangan industri Anda?'),
    section: { id: 'B. Materi Forum & Pembicara', en: 'B. Forum Content & Speakers' },
  },
  rating('speakers', 'How would you rate the quality and expertise of the speakers?', 'Bagaimana penilaian Anda terhadap kualitas dan keahlian para pembicara?'),
  rating('emerging_threats',
    'How effectively did the sessions address emerging maritime security threats and challenges?',
    'Seberapa efektif sesi-sesi membahas ancaman dan tantangan keamanan maritim yang sedang berkembang?'),
  rating('insights',
    'How useful were the insights and discussions for your professional decision-making?',
    'Seberapa bermanfaat wawasan dan diskusi forum untuk pengambilan keputusan profesional Anda?'),
  {
    key: 'most_valuable', type: 'text', optional: true,
    label: { id: 'Topik atau sesi mana yang paling bermanfaat bagi Anda, dan mengapa?', en: 'Which topic or session did you find most valuable, and why?' },
  },
  {
    ...rating('organization',
      'How satisfied were you with the overall event organization and coordination?',
      'Seberapa puas Anda dengan penyelenggaraan dan koordinasi acara secara keseluruhan?'),
    section: { id: 'C. Penyelenggaraan & Pengalaman Acara', en: 'C. Event Organization & Experience' },
  },
  rating('registration',
    'How would you rate the registration process and participant information provided before the event?',
    'Bagaimana penilaian Anda terhadap proses registrasi dan informasi peserta yang diberikan sebelum acara?'),
  rating('venue', 'How satisfied were you with the venue, facilities, and event arrangements?', 'Seberapa puas Anda dengan venue, fasilitas, dan pengaturan acara?'),
  rating('networking',
    'How valuable were the networking and collaboration opportunities provided during the forum?',
    'Seberapa berharga kesempatan networking dan kolaborasi yang tersedia selama forum?'),
  {
    ...rating('overall', 'Overall, how satisfied were you with Maritime Security Forum 2026?', 'Secara keseluruhan, seberapa puas Anda dengan Maritime Security Forum 2026?'),
    section: { id: 'D. Evaluasi Keseluruhan & Harapan ke Depan', en: 'D. Overall Evaluation & Future Expectations' },
  },
  {
    key: 'recommend', type: 'scale',
    label: {
      id: 'Seberapa besar kemungkinan Anda merekomendasikan forum ini kepada rekan kerja atau jaringan profesional Anda?',
      en: 'How likely are you to recommend this forum to your colleagues or professional network?',
    },
  },
  {
    key: 'future_topics', type: 'multi', cols: 2, other: true,
    label: { id: 'Topik apa yang ingin Anda lihat di Maritime Security Forum berikutnya?', en: 'What topics would you like to see covered in future Maritime Security Forums?' },
    note: { id: 'Boleh pilih lebih dari satu.', en: 'Select all that apply.' },
    options: [
      opt('Maritime Threat Intelligence & Risk Assessment', 'Intelijen Ancaman & Penilaian Risiko Maritim'),
      opt('Cybersecurity in Maritime Operations', 'Keamanan Siber dalam Operasi Maritim'),
      opt('Geopolitical Risks & Regional Security', 'Risiko Geopolitik & Keamanan Kawasan'),
      opt('Maritime Security Technology & Innovation', 'Teknologi & Inovasi Keamanan Maritim'),
      opt('Port & Vessel Security', 'Keamanan Pelabuhan & Kapal'),
      opt('Crisis Management & Emergency Response', 'Manajemen Krisis & Tanggap Darurat'),
      opt('Maritime Security Regulations & Compliance', 'Regulasi & Kepatuhan Keamanan Maritim'),
    ],
  },
  {
    key: 'suggestion', type: 'text', optional: true,
    label: { id: 'Perbaikan atau saran apa yang Anda rekomendasikan untuk acara berikutnya?', en: 'What improvements or suggestions would you recommend for future events?' },
  },
]
export const RATINGS = [
  { id: 'Sangat buruk', en: 'Very Poor' },
  { id: 'Buruk', en: 'Poor' },
  { id: 'Cukup', en: 'Fair' },
  { id: 'Baik', en: 'Good' },
  { id: 'Sangat baik', en: 'Excellent' },
]
export const SCALE_ENDS = { low: { id: '0 = Sangat tidak mungkin', en: '0 = Not at all likely' }, high: { id: '10 = Sangat mungkin', en: '10 = Extremely likely' } }

// Jawaban "Other" disimpan di <key>_other
export const otherKey = (q) => `${q.key}_other`
export const picked = (q, answers) => (q.type === 'multi' ? (answers[q.key] ?? []).includes(OTHER) : answers[q.key] === OTHER)
export const blank = (v) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
export function unanswered(q, answers) {
  if (q.optional) return false
  if (blank(answers[q.key])) return true
  return q.other && picked(q, answers) && !String(answers[otherKey(q)] ?? '').trim()
}
