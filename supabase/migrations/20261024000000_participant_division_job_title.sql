-- Kolom Division dan Job Title untuk peserta. Untuk database yang dibuat dari schema.sql versi sebelumnya:
-- jalankan sekali di SQL Editor Supabase. Aman dijalankan ulang.
alter table public.participants add column if not exists division text;
alter table public.participants add column if not exists job_title text;

-- Supaya API Supabase langsung mengenali kolom baru
notify pgrst, 'reload schema';
