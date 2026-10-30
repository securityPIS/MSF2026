-- Feedback cukup dengan nama: halaman /feedback tidak lagi mencari peserta dari email.
-- Jalankan sekali di SQL Editor Supabase (setelah 20261026000000_feedback.sql). Aman dijalankan ulang.
-- feedback_lookup dan submit_feedback (email) tetap ada untuk data lama.

alter table public.feedback alter column participant_id drop not null;
alter table public.feedback add column if not exists name text;

-- Feedback lama (lewat email) ikut diberi nama supaya rekap memakai satu kolom
update public.feedback f set name = p.full_name
from public.participants p
where f.participant_id = p.id and f.name is null;

-- Simpan feedback atas nama yang diketik peserta (nama ini yang tercetak di sertifikat). Tiap kiriman = satu sertifikat.
create or replace function public.submit_feedback_by_name(p_name text, p_answers jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_name text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_f public.feedback%rowtype;
begin
  if v_name = '' or char_length(v_name) > 120 then
    raise exception 'Nama tidak valid' using errcode = '22023';
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or pg_column_size(p_answers) > 20000 then
    raise exception 'Jawaban tidak valid' using errcode = '22023';
  end if;

  insert into public.feedback (name, answers) values (v_name, p_answers) returning * into v_f;

  return jsonb_build_object('status', 'done', 'name', v_name,
                            'certificate_no', 'MSF2026-' || lpad(v_f.id::text, 4, '0'),
                            'submitted_at', v_f.submitted_at);
end $$;

revoke execute on function public.submit_feedback_by_name(text, jsonb) from public;
grant  execute on function public.submit_feedback_by_name(text, jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
