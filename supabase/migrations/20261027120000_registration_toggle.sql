-- Tombol buka/tutup registrasi untuk admin. Jalankan sekali di SQL Editor Supabase. Aman dijalankan ulang.
-- Sudah termasuk isi migrasi registrasi (20261027000000_registration.sql), jadi cukup jalankan file ini
-- kalau migrasi registrasi belum pernah dijalankan.

alter table public.participants add column if not exists attendance text;
alter table public.participants drop constraint if exists participants_attendance_check;
alter table public.participants add constraint participants_attendance_check
  check (attendance in ('attend', 'absent'));

-- Pengaturan aplikasi yang diubah admin dari menu pengaturan (ikon gerigi), mis. buka/tutup registrasi.
-- Dibaca dan diubah hanya lewat fungsi di bawah, jadi tabelnya tidak punya policy.
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id) on delete set null
);
alter table public.app_settings enable row level security;
insert into public.app_settings (key, value) values ('registration_open', 'true') on conflict (key) do nothing;

-- Status registrasi untuk halaman publik (landing page dan /register)
create or replace function public.registration_open()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (value)::text::boolean from public.app_settings where key = 'registration_open'), true)
$$;

-- Buka/tutup registrasi, khusus admin
create or replace function public.set_registration_open(p_open boolean)
returns boolean
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh mengubah status registrasi' using errcode = '42501';
  end if;
  insert into public.app_settings (key, value, updated_at, updated_by)
  values ('registration_open', to_jsonb(coalesce(p_open, true)), now(), auth.uid())
  on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  return coalesce(p_open, true);
end $$;

create or replace function public.register_participant(
  p_full_name text, p_email text, p_phone text, p_attendance text,
  p_organization text default null, p_division text default null, p_job_title text default null)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_name  text := btrim(coalesce(p_full_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_org   text := nullif(btrim(coalesce(p_organization, '')), '');
  v_div   text := nullif(btrim(coalesce(p_division, '')), '');
  v_job   text := nullif(btrim(coalesce(p_job_title, '')), '');
  v_p public.participants%rowtype;
begin
  -- Admin bisa menutup registrasi dari menu pengaturan aplikasi
  if not public.registration_open() then
    return jsonb_build_object('status', 'closed');
  end if;

  if v_name = '' or length(v_name) > 200
     or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 200
     or v_phone !~ '^\+[1-9][0-9]{6,14}$'
     or p_attendance is null or p_attendance not in ('attend', 'absent')
     or length(coalesce(v_org, '')) > 200 or length(coalesce(v_div, '')) > 200 or length(coalesce(v_job, '')) > 200 then
    raise exception 'Data registrasi tidak valid' using errcode = '22023';
  end if;

  -- Satu registrasi per email. Lock supaya dua kiriman bersamaan dengan email sama tidak dobel.
  -- Kode QR peserta yang sudah ada tidak dikembalikan, karena email saja bukan bukti pemilik.
  perform pg_advisory_xact_lock(hashtext('register:' || v_email));
  if exists (select 1 from public.participants where lower(btrim(email)) = v_email) then
    return jsonb_build_object('status', 'already_registered');
  end if;

  -- Kode QR dibuat otomatis oleh default kolom; kalau kebetulan bentrok, coba lagi
  for i in 1..3 loop
    begin
      insert into public.participants (full_name, email, phone, organization, division, job_title, category, attendance)
      values (v_name, v_email, v_phone, v_org, v_div, v_job, 'Umum', p_attendance)
      returning * into v_p;
      exit;
    exception when unique_violation then
      if i = 3 then raise; end if;
    end;
  end loop;

  return jsonb_build_object(
    'status', 'ok', 'qr_code', v_p.qr_code, 'name', v_p.full_name, 'email', v_p.email, 'phone', v_p.phone,
    'organization', v_p.organization, 'division', v_p.division, 'job_title', v_p.job_title,
    'attendance', v_p.attendance, 'registered_at', v_p.created_at);
end $$;

revoke execute on function public.registration_open() from public;
grant  execute on function public.registration_open() to anon, authenticated;
revoke execute on function public.set_registration_open(boolean) from public, anon;
grant  execute on function public.set_registration_open(boolean) to authenticated;
revoke execute on function public.register_participant(text, text, text, text, text, text, text) from public;
grant  execute on function public.register_participant(text, text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
