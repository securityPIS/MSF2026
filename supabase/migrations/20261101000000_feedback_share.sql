-- Link publik read-only untuk ringkasan feedback: /hasil-feedback/<token>, tanpa login.
-- Jalankan sekali di SQL Editor Supabase (setelah 20261030000000_feedback_by_name.sql). Aman dijalankan ulang.
-- Token acak disimpan di app_settings ('feedback_share_token'); tanpa baris itu link tidak dibagikan.
-- Membuat link baru mengganti token, jadi link lama langsung tidak berlaku.

-- Token aktif (hanya admin), untuk ditampilkan di halaman ringkasan feedback
create or replace function public.feedback_share_token()
returns text
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh melihat link feedback' using errcode = '42501';
  end if;
  return (select value #>> '{}' from public.app_settings where key = 'feedback_share_token');
end $$;

-- p_enabled true: buat token baru; false: hentikan berbagi. Mengembalikan token aktif (null bila dihentikan).
create or replace function public.set_feedback_share(p_enabled boolean)
returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  v_token text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh membagikan hasil feedback' using errcode = '42501';
  end if;
  if coalesce(p_enabled, false) then
    v_token := replace(gen_random_uuid()::text, '-', '');
    insert into public.app_settings (key, value, updated_at, updated_by)
    values ('feedback_share_token', to_jsonb(v_token), now(), auth.uid())
    on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  else
    delete from public.app_settings where key = 'feedback_share_token';
  end if;
  return v_token;
end $$;

-- Isian feedback untuk link publik: hanya jawaban dan waktu, tanpa nama pengisi. Null bila token salah atau dihentikan.
create or replace function public.feedback_shared(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_token text := (select value #>> '{}' from public.app_settings where key = 'feedback_share_token');
begin
  if v_token is null or p_token is null or p_token <> v_token then
    return null;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', f.id, 'answers', f.answers, 'submitted_at', f.submitted_at)
                     order by f.submitted_at desc)
    from public.feedback f), '[]'::jsonb);
end $$;

revoke execute on function public.feedback_share_token() from public, anon;
revoke execute on function public.set_feedback_share(boolean) from public, anon;
revoke execute on function public.feedback_shared(text) from public;
grant  execute on function public.feedback_share_token() to authenticated;
grant  execute on function public.set_feedback_share(boolean) to authenticated;
grant  execute on function public.feedback_shared(text) to anon, authenticated;

notify pgrst, 'reload schema';
