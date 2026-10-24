-- =====================================================================
-- MSF 2026 Checkpoint — skema database Supabase
-- Jalankan sekali di Supabase SQL Editor, lalu jalankan seed.sql
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- Tabel ----------
-- Role akses buatan admin untuk akun petugas: menu apa saja dan checkpoint mana yang boleh dipakai.
-- Petugas tanpa role (role_id kosong) = akses penuh petugas.
create table public.roles (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null unique check (btrim(name) <> ''),
  menus                 text[] not null default '{scan}'
                        check (cardinality(menus) > 0 and menus <@ array['scan', 'dashboard', 'participants']),
  can_add_participants  boolean not null default false,
  all_checkpoints       boolean not null default true,
  checkpoint_ids        uuid[] not null default '{}',
  created_at            timestamptz not null default now()
);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'officer' check (role in ('admin', 'officer', 'inactive')),
  -- Role yang sedang dipakai akun tidak bisa dihapus, supaya akses petugas tidak diam-diam melebar
  role_id     uuid references public.roles(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create table public.participants (
  id            uuid primary key default gen_random_uuid(),
  -- Kode dari panitia diimpor apa adanya; peserta yang ditambah manual dapat 10 karakter hex acak
  qr_code       text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
                check (qr_code = lower(btrim(qr_code)) and qr_code <> ''),
  full_name     text not null,
  organization  text,          -- tampil sebagai "Company" di aplikasi
  division      text,
  job_title     text,
  email         text,
  phone         text,
  category      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.checkpoints (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  kind            text not null default 'custom'
                  check (kind in ('badge', 'booth', 'lunch', 'souvenir', 'custom')),
  repeat_rule     text not null default 'once'
                  check (repeat_rule in ('once', 'daily', 'unlimited')),
  requires_badge  boolean not null default true,
  is_active       boolean not null default true,
  sort_order      int not null default 100,
  created_at      timestamptz not null default now()
);
-- Hanya boleh satu checkpoint penukaran badge
create unique index checkpoints_single_badge on public.checkpoints (kind) where kind = 'badge';

create table public.checkins (
  id              bigint generated always as identity primary key,
  participant_id  uuid not null references public.participants(id) on delete cascade,
  checkpoint_id   uuid not null references public.checkpoints(id) on delete cascade,
  officer_id      uuid references public.profiles(id) on delete set null,
  checked_in_at   timestamptz not null default now(),
  event_date      date not null default (now() at time zone 'Asia/Jakarta')::date
);
create index checkins_participant_idx on public.checkins (participant_id);
create index checkins_checkpoint_idx on public.checkins (checkpoint_id, checked_in_at desc);

-- ---------- Helper peran ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'officer') from public.profiles where id = auth.uid()), false)
$$;

-- Izin per menu dan per checkpoint. Admin selalu boleh; petugas tanpa role boleh semua menu petugas.
create or replace function public.has_menu(p_menu text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case when p.role = 'admin' then true
                when p.role <> 'officer' then false
                when r.id is null then true
                else p_menu = any(r.menus) end
    from public.profiles p left join public.roles r on r.id = p.role_id
    where p.id = auth.uid()), false)
$$;

-- Checkpoint yang ditangani role: membatasi scan, statistik dashboard, dan riwayat check-in yang terlihat
create or replace function public.can_see_checkpoint(p_checkpoint uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case when p.role = 'admin' then true
                when p.role <> 'officer' then false
                when r.id is null then true
                else r.all_checkpoints or p_checkpoint = any(r.checkpoint_ids) end
    from public.profiles p left join public.roles r on r.id = p.role_id
    where p.id = auth.uid()), false)
$$;

create or replace function public.can_use_checkpoint(p_checkpoint uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_menu('scan') and public.can_see_checkpoint(p_checkpoint)
$$;

create or replace function public.can_add_participants() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case when p.role = 'admin' then true
                when p.role <> 'officer' then false
                when r.id is null then true
                else r.can_add_participants end
    from public.profiles p left join public.roles r on r.id = p.role_id
    where p.id = auth.uid()), false)
$$;

-- Profil otomatis untuk setiap akun baru (default: petugas)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.roles        enable row level security;
alter table public.profiles     enable row level security;
alter table public.participants enable row level security;
alter table public.checkpoints  enable row level security;
alter table public.checkins     enable row level security;

create policy "roles_staff_select" on public.roles
  for select using (public.is_staff());
create policy "roles_admin_write" on public.roles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

create policy "participants_staff_select" on public.participants
  for select using (public.is_staff());
create policy "participants_admin_write" on public.participants
  for all using (public.is_admin()) with check (public.is_admin());
-- Petugas yang role-nya mengizinkan boleh menambah peserta baru (tidak boleh mengubah atau menghapus)
create policy "participants_staff_insert" on public.participants
  for insert with check (public.can_add_participants());

create policy "checkpoints_staff_select" on public.checkpoints
  for select using (public.is_staff());
create policy "checkpoints_admin_write" on public.checkpoints
  for all using (public.is_admin()) with check (public.is_admin());

-- Check-in hanya bisa dibuat lewat fungsi perform_checkin (tidak ada policy insert)
create policy "checkins_select" on public.checkins
  for select using ((public.has_menu('dashboard') or public.has_menu('participants'))
                    and public.can_see_checkpoint(checkpoint_id));
create policy "checkins_admin_delete" on public.checkins
  for delete using (public.is_admin());

-- ---------- Fungsi check-in (inti aturan checkpoint) ----------
create or replace function public.perform_checkin(p_code text, p_checkpoint_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_code     text := lower(btrim(coalesce(p_code, '')));
  v_today    date := (now() at time zone 'Asia/Jakarta')::date;
  v_p        public.participants%rowtype;
  v_cp       public.checkpoints%rowtype;
  v_pj       jsonb;
  v_badge_id uuid;
  v_prev     timestamptz;
begin
  if not public.is_staff() then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;

  select * into v_cp from public.checkpoints where id = p_checkpoint_id;
  if not found then
    return jsonb_build_object('status', 'invalid_checkpoint');
  end if;
  if not public.can_use_checkpoint(v_cp.id) then
    return jsonb_build_object('status', 'forbidden', 'checkpoint', v_cp.name);
  end if;
  if not v_cp.is_active then
    return jsonb_build_object('status', 'inactive', 'checkpoint', v_cp.name);
  end if;

  select * into v_p from public.participants where qr_code = v_code;
  if not found then
    return jsonb_build_object('status', 'not_found', 'code', v_code, 'checkpoint', v_cp.name);
  end if;

  v_pj := jsonb_build_object('name', v_p.full_name, 'organization', v_p.organization,
                             'category', v_p.category);

  -- Cegah dobel check-in saat dua petugas scan peserta yang sama bersamaan
  perform pg_advisory_xact_lock(hashtextextended(v_p.id::text || v_cp.id::text, 0));

  if v_cp.requires_badge and v_cp.kind <> 'badge' then
    select id into v_badge_id from public.checkpoints where kind = 'badge';
    if v_badge_id is not null and not exists (
      select 1 from public.checkins where participant_id = v_p.id and checkpoint_id = v_badge_id
    ) then
      return jsonb_build_object('status', 'no_badge', 'participant', v_pj, 'checkpoint', v_cp.name);
    end if;
  end if;

  if v_cp.repeat_rule = 'once' then
    select max(checked_in_at) into v_prev from public.checkins
    where participant_id = v_p.id and checkpoint_id = v_cp.id;
  elsif v_cp.repeat_rule = 'daily' then
    select max(checked_in_at) into v_prev from public.checkins
    where participant_id = v_p.id and checkpoint_id = v_cp.id and event_date = v_today;
  end if;

  if v_prev is not null then
    return jsonb_build_object('status', 'duplicate', 'participant', v_pj,
                              'checkpoint', v_cp.name, 'previous_at', v_prev);
  end if;

  insert into public.checkins (participant_id, checkpoint_id, officer_id, event_date)
  values (v_p.id, v_cp.id, auth.uid(), v_today);

  return jsonb_build_object('status', 'ok', 'participant', v_pj,
                            'checkpoint', v_cp.name, 'checked_in_at', now());
end $$;

-- ---------- Statistik dashboard (admin dan petugas) ----------
create or replace function public.dashboard_stats()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
begin
  if not public.has_menu('dashboard') then
    raise exception 'Akses ditolak' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_participants', (select count(*) from public.participants),
    'checkpoints', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'name', c.name, 'kind', c.kind, 'is_active', c.is_active,
        'unique_participants', (select count(distinct k.participant_id) from public.checkins k where k.checkpoint_id = c.id),
        'total_scans', (select count(*) from public.checkins k where k.checkpoint_id = c.id),
        'today', (select count(*) from public.checkins k where k.checkpoint_id = c.id and k.event_date = v_today)
      ) order by c.sort_order, c.name)
      from public.checkpoints c
      where public.can_see_checkpoint(c.id)), '[]'::jsonb)
  );
end $$;

-- ---------- Riwayat untuk peserta (tanpa login, berbasis kode QR acak) ----------
create or replace function public.participant_history(p_code text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_p public.participants%rowtype;
begin
  select * into v_p from public.participants where qr_code = lower(btrim(coalesce(p_code, '')));
  if not found then return null; end if;

  return jsonb_build_object(
    'name', v_p.full_name,
    'organization', v_p.organization,
    'checkins', coalesce((
      select jsonb_agg(jsonb_build_object('checkpoint', c.name, 'kind', c.kind, 'at', k.checked_in_at)
                       order by k.checked_in_at)
      from public.checkins k join public.checkpoints c on c.id = k.checkpoint_id
      where k.participant_id = v_p.id), '[]'::jsonb)
  );
end $$;

-- ---------- Hak eksekusi fungsi ----------
revoke execute on function public.perform_checkin(text, uuid) from public, anon;
revoke execute on function public.dashboard_stats() from public, anon;
grant  execute on function public.perform_checkin(text, uuid) to authenticated;
grant  execute on function public.dashboard_stats() to authenticated;
grant  execute on function public.participant_history(text) to anon, authenticated;

-- ---------- Realtime untuk dashboard ----------
alter publication supabase_realtime add table public.checkins;
