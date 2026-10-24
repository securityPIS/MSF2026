-- Checkpoint awal (bisa diubah atau ditambah lewat menu Checkpoint di aplikasi)
insert into public.checkpoints (name, kind, repeat_rule, requires_badge, sort_order) values
  ('Penukaran Badge ID', 'badge',    'once',  false, 1),
  ('Lunch',              'lunch',    'daily', true,  2),
  ('Souvenir',           'souvenir', 'once',  true,  3),
  ('Booth 1',            'booth',    'once',  true,  10),
  ('Booth 2',            'booth',    'once',  true,  11);

-- Peserta uji: kode sama dengan contoh QR dari panitia, untuk tes scan
insert into public.participants (qr_code, full_name, organization, category)
values ('e883d05a5a', 'Peserta Uji', 'PT Pertamina International Shipping', 'Umum')
on conflict (qr_code) do nothing;
