-- Baris profil untuk 6 akun demo. Jalankan SETELAH membuat 6 user di
-- Authentication > Users dengan email di bawah. Idempotent, aman diulang.
-- Password diatur di dashboard Auth, tidak di sini.

insert into profil (id, nama, peran, posko_id)
select u.id, 'Koordinator BPBD', 'BPBD', null
from auth.users u where u.email = 'bpbd@demo'
on conflict (id) do update set nama = excluded.nama, peran = excluded.peran, posko_id = excluded.posko_id;

insert into profil (id, nama, peran, posko_id)
select u.id, 'Petugas Gudang', 'GUDANG', null
from auth.users u where u.email = 'gudang@demo'
on conflict (id) do update set nama = excluded.nama, peran = excluded.peran, posko_id = excluded.posko_id;

insert into profil (id, nama, peran, posko_id)
select u.id, 'Relawan Posko A', 'POSKO',
  (select id from posko where nama = 'Posko Balai Desa Sari')
from auth.users u where u.email = 'posko-a@demo'
on conflict (id) do update set nama = excluded.nama, peran = excluded.peran, posko_id = excluded.posko_id;

insert into profil (id, nama, peran, posko_id)
select u.id, 'Relawan Posko B', 'POSKO',
  (select id from posko where nama = 'Posko Sekolah Harapan')
from auth.users u where u.email = 'posko-b@demo'
on conflict (id) do update set nama = excluded.nama, peran = excluded.peran, posko_id = excluded.posko_id;

insert into profil (id, nama, peran, posko_id)
select u.id, 'Tim Antar 1', 'TIM', null
from auth.users u where u.email = 'tim@demo'
on conflict (id) do update set nama = excluded.nama, peran = excluded.peran, posko_id = excluded.posko_id;

insert into profil (id, nama, peran, posko_id)
select u.id, 'Admin Sistem', 'ADMIN', null
from auth.users u where u.email = 'admin@demo'
on conflict (id) do update set nama = excluded.nama, peran = excluded.peran, posko_id = excluded.posko_id;
