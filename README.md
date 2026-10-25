# MSF 2026 Checkpoint (prototype)

Webapp check-in peserta Maritime Security Forum 2026. Petugas scan QR peserta lewat kamera HP,
sistem memvalidasi aturan tiap checkpoint, admin memantau semuanya secara langsung.

Stack: React 18 + Vite, Supabase (Auth, Postgres, Realtime), html5-qrcode, SheetJS.

## Peran

- **Admin**: semua yang bisa dilakukan petugas, ditambah impor peserta dari Excel, kelola checkpoint dan peran petugas, batalkan check-in, reset semua check-in per checkpoint dari Dashboard.
- **Petugas**: pilih checkpoint, scan QR, lihat hasil validasi (hijau berhasil, kuning sudah pernah, merah ditolak) lalu tekan Approve untuk scan berikutnya (ada tanda koneksi; saat internet putus, scan ditolak dengan jelas, bukan diam-diam hilang), lihat dashboard real-time, unduh laporan Excel, cari peserta dan riwayat check-in-nya, tambah peserta baru (isi Unique ID yang tertulis di QR peserta, atau kosongkan supaya dibuat otomatis; QR bisa diunduh sebagai kartu PNG).
- **Peserta**: tanpa login. Riwayat check-in bisa dibuka di `/p/<kode-qr>`.

## Role akses

Di menu **Petugas > Role akses**, admin bisa membuat role untuk akun petugas, misalnya "Petugas Booth" yang hanya
bisa scan di Booth 1 dan Booth 2. Tiap role mengatur:

- Menu yang bisa dibuka: Scan, Dashboard, Peserta (minimal satu), dan apakah boleh menambah peserta.
- Checkpoint yang ditangani: semua, atau pilih tertentu. Ini membatasi scan sekaligus data yang terlihat: statistik
  dan check-in terbaru di Dashboard, laporan Excel, dan riwayat check-in peserta hanya untuk checkpoint tersebut.

Role dipasang ke akun lewat form akun. Petugas tanpa role khusus memakai **Petugas (akses penuh)**. Role yang masih
dipakai akun tidak bisa dihapus. Aturan scan, dashboard, dan tambah peserta juga dijaga di database
(`can_see_checkpoint`, `can_use_checkpoint`, `has_menu`, `can_add_participants`), bukan hanya disembunyikan di tampilan.

## Aturan checkpoint

| Tipe | Aturan bawaan | Wajib badge |
|---|---|---|
| Badge | Sekali per peserta (hanya boleh satu checkpoint badge) | Tidak |
| Booth | Sekali per peserta per booth | Ya |
| Lunch | Sekali per hari | Ya |
| Souvenir | Sekali per peserta | Ya |
| Lainnya | Bebas diatur admin | Bebas |

Validasi dijalankan di database (fungsi `perform_checkin`) dengan lock, jadi dua petugas yang scan
peserta yang sama bersamaan tetap hanya menghasilkan satu check-in.

## Setup

Butuh Node.js 18 atau lebih baru.

1. **Buat project Supabase** (region Singapore paling dekat ke Indonesia).
2. Buka **SQL Editor**, jalankan isi `supabase/schema.sql`, lalu `supabase/seed.sql`.
   Database yang dibuat sebelum ada kolom Department (division) dan Job Title: jalankan juga
   `supabase/migrations/20261024000000_participant_division_job_title.sql`.
3. Buat akun admin: **Authentication > Users > Add user** (centang *Auto Confirm User*). Lalu di SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'email-admin@contoh.com';
   ```
   Akun petugas berikutnya bisa dibuat admin langsung dari menu **Petugas** di aplikasi, setelah Edge Function
   `manage-staff` di-deploy (langkah berikut).
4. Deploy Edge Function untuk kelola akun petugas (tambah, ubah, hapus). Butuh [Supabase CLI](https://supabase.com/docs/guides/cli):
   ```bash
   supabase login
   supabase functions deploy manage-staff --project-ref <ref-project>
   ```
   Service role key otomatis tersedia di dalam Edge Function, tidak pernah dikirim ke browser.
5. Salin `.env.example` menjadi `.env`, isi URL dan anon key dari **Project Settings > API**.
6. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
   Buka `https://localhost:5173` dan terima peringatan sertifikat (sertifikat lokal untuk development).

## Jaga project Supabase tetap aktif

Project Supabase paket gratis berhenti sendiri kalau tidak dipakai sekitar seminggu. Workflow
`.github/workflows/supabase-keepalive.yml` menjalankan satu query ringan setiap hari pukul 08:17 WIB.
Isi dua secret di GitHub, **Settings > Secrets and variables > Actions**: `SUPABASE_URL` dan `SUPABASE_ANON_KEY`
(nilainya sama dengan `.env`). Coba sekali lewat tab **Actions > Jaga Supabase tetap aktif > Run workflow**.

## Mode demo (tanpa Supabase)

Untuk melihat tampilan tanpa database: jalankan `npm run dev` **tanpa** file `.env`. Aplikasi memakai data tiruan
yang tersimpan di browser (banner kuning "Mode demo" di atas). Di halaman login ada tombol akun demo
`admin@demo.msf` dan `petugas@demo.msf`, kata sandi bebas. Aturan check-in sama dengan fungsi `perform_checkin`.
Tombol **Reset** di banner mengembalikan data awal. Mode demo bisa dipaksa dengan `VITE_DEMO=1`.

Kalau browser menolak sertifikat lokal, pakai `npm run dev:http` lalu buka `http://localhost:5174`
(tanpa HTTPS; kamera tetap jalan di localhost, tapi tidak bisa dibuka dari HP).

## Uji scan dari HP

Kamera browser hanya jalan lewat HTTPS. Dua pilihan:

- **Jaringan lokal**: HP dan laptop di Wi-Fi yang sama, buka `https://<IP-laptop>:5173` di HP
  (alamat Network yang tampil saat `npm run dev`), terima peringatan sertifikat, izinkan kamera.
- **Vercel**: push ke Git lalu import ke Vercel, isi dua environment variable yang sama. `vercel.json` sudah disiapkan.

Seed berisi peserta uji dengan kode `e883d05a5a` (sama dengan contoh QR panitia). Alur uji singkat:

1. Login admin, buka **Scan**, pilih *Lunch*, scan QR uji: hasilnya merah *Belum tukar badge*.
2. Pilih *Penukaran Badge ID*, scan: hijau. Scan lagi: kuning *Sudah check-in*.
3. Pilih *Lunch*, scan: hijau. Buka **Dashboard** di laptop dan lihat angka bertambah langsung.

## Impor peserta

Menu **Peserta > Impor dari Excel**. Kolom ditebak otomatis dari judul (Unique ID, Nama, Company, Department,
Job Title, Email, Telepon, Kategori) dan bisa diubah manual. Impor memakai upsert berdasarkan Unique ID, jadi file susulan
dari panitia bisa diimpor ulang tanpa duplikat. Unique ID disimpan dalam huruf kecil.

Kolom Unique ID harus berupa **teks** (contoh `e883d05a5a`), bukan gambar QR.

## Struktur

```
supabase/schema.sql      tabel, RLS, fungsi check-in, statistik, realtime
supabase/seed.sql        checkpoint awal + peserta uji
src/pages/Scan.jsx       scanner petugas + layar hasil
src/pages/admin/*        dashboard, peserta, impor, checkpoint, petugas
src/pages/ParticipantHistory.jsx   halaman publik peserta
```

## Belum ada di prototype

- Penugasan petugas ke checkpoint tertentu (sekarang petugas bisa memilih semua checkpoint aktif).
- Mode offline dengan antrean sinkronisasi.
- Kuota stok lunch/souvenir.
