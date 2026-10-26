-- Feedback peserta + sertifikat. Jalankan sekali di SQL Editor Supabase. Aman dijalankan ulang.
-- Peserta tidak punya akun: halaman /feedback memanggil dua fungsi security definer di bawah dengan email peserta.

create table if not exists public.feedback (
  id            bigint generated always as identity primary key,
  participant_id uuid not null unique references public.participants(id) on delete cascade,
  answers       jsonb not null,
  submitted_at  timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Petugas yang boleh membuka Peserta atau Dashboard bisa melihat status feedback; isi hanya lewat submit_feedback
drop policy if exists "feedback_staff_select" on public.feedback;
create policy "feedback_staff_select" on public.feedback
  for select using (public.has_menu('participants') or public.has_menu('dashboard'));
drop policy if exists "feedback_admin_delete" on public.feedback;
create policy "feedback_admin_delete" on public.feedback
  for delete using (public.is_admin());

-- Cari peserta dari email. Hanya mengembalikan nama, instansi, dan status feedback (bukan kode QR).
create or replace function public.feedback_lookup(p_email text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_p public.participants%rowtype;
  v_f public.feedback%rowtype;
begin
  if v_email = '' then return jsonb_build_object('status', 'not_found'); end if;
  select * into v_p from public.participants
  where lower(btrim(email)) = v_email order by created_at limit 1;
  if not found then return jsonb_build_object('status', 'not_found'); end if;

  select * into v_f from public.feedback where participant_id = v_p.id;
  if not found then
    return jsonb_build_object('status', 'pending', 'name', v_p.full_name, 'organization', v_p.organization);
  end if;
  return jsonb_build_object('status', 'done', 'name', v_p.full_name, 'organization', v_p.organization,
                            'certificate_no', 'MSF2026-' || lpad(v_f.id::text, 4, '0'),
                            'submitted_at', v_f.submitted_at);
end $$;

-- Simpan feedback sekali per peserta. Kalau sudah pernah, jawaban lama dipertahankan dan sertifikat dikembalikan.
create or replace function public.submit_feedback(p_email text, p_answers jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_p public.participants%rowtype;
  v_f public.feedback%rowtype;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or pg_column_size(p_answers) > 20000 then
    raise exception 'Jawaban tidak valid' using errcode = '22023';
  end if;
  if v_email = '' then return jsonb_build_object('status', 'not_found'); end if;
  select * into v_p from public.participants
  where lower(btrim(email)) = v_email order by created_at limit 1;
  if not found then return jsonb_build_object('status', 'not_found'); end if;

  insert into public.feedback (participant_id, answers) values (v_p.id, p_answers)
  on conflict (participant_id) do nothing;
  select * into v_f from public.feedback where participant_id = v_p.id;

  return jsonb_build_object('status', 'done', 'name', v_p.full_name, 'organization', v_p.organization,
                            'certificate_no', 'MSF2026-' || lpad(v_f.id::text, 4, '0'),
                            'submitted_at', v_f.submitted_at);
end $$;

-- Riwayat peserta (/p/<kode>) ikut menampilkan kapan feedback diisi
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
    'feedback_at', (select f.submitted_at from public.feedback f where f.participant_id = v_p.id),
    'checkins', coalesce((
      select jsonb_agg(jsonb_build_object('checkpoint', c.name, 'kind', c.kind, 'at', k.checked_in_at)
                       order by k.checked_in_at)
      from public.checkins k join public.checkpoints c on c.id = k.checkpoint_id
      where k.participant_id = v_p.id), '[]'::jsonb)
  );
end $$;

revoke execute on function public.feedback_lookup(text) from public;
revoke execute on function public.submit_feedback(text, jsonb) from public;
grant  execute on function public.feedback_lookup(text) to anon, authenticated;
grant  execute on function public.submit_feedback(text, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
