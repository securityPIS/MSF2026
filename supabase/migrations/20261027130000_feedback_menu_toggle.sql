-- Saklar tampil/sembunyikan menu Feedback untuk admin. Jalankan sekali di SQL Editor Supabase. Aman dijalankan ulang.
-- Tabel app_settings juga dibuat oleh 20261027120000_registration_toggle.sql; dibuat di sini juga supaya urutan
-- menjalankan kedua file tidak berpengaruh.

create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id) on delete set null
);
alter table public.app_settings enable row level security;
insert into public.app_settings (key, value) values ('feedback_menu_visible', 'true') on conflict (key) do nothing;

-- Tampil/sembunyikan link Feedback di menu landing page. Halaman /feedback tetap bisa dibuka lewat link langsung.
create or replace function public.feedback_menu_visible()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (value)::text::boolean from public.app_settings where key = 'feedback_menu_visible'), true)
$$;

create or replace function public.set_feedback_menu_visible(p_visible boolean)
returns boolean
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh mengubah menu feedback' using errcode = '42501';
  end if;
  insert into public.app_settings (key, value, updated_at, updated_by)
  values ('feedback_menu_visible', to_jsonb(coalesce(p_visible, true)), now(), auth.uid())
  on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  return coalesce(p_visible, true);
end $$;

revoke execute on function public.feedback_menu_visible() from public;
grant  execute on function public.feedback_menu_visible() to anon, authenticated;
revoke execute on function public.set_feedback_menu_visible(boolean) from public, anon;
grant  execute on function public.set_feedback_menu_visible(boolean) to authenticated;

notify pgrst, 'reload schema';
