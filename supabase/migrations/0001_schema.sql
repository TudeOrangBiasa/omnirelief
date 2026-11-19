-- OmniRelief schema, Bab 8 dokumen tim. Terapkan sekali per project Supabase.
-- Aturan tulis: semua tulis lewat API route Next.js pakai service_role.
-- Browser tidak pernah tulis langsung ke database.

-- 1. profil pengguna (terhubung ke auth.users)
create table profil (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  peran text not null check (peran in ('BPBD','GUDANG','POSKO','TIM')),
  posko_id bigint,
  dibuat_pada timestamptz not null default now()
);

-- 2. posko / daerah
create table posko (
  id bigint generated always as identity primary key,
  nama text not null,
  wilayah text not null,
  kontak text,
  catatan text,
  dibuat_pada timestamptz not null default now()
);

alter table profil
  add constraint profil_posko_id_fkey foreign key (posko_id) references posko(id);

-- 3. snapshot data penyintas per periode laporan
create table penyintas_snapshot (
  id bigint generated always as identity primary key,
  posko_id bigint not null references posko(id),
  bayi int not null default 0,
  balita int not null default 0,
  ibu_hamil int not null default 0,
  lansia int not null default 0,
  disabilitas int not null default 0,
  umum int not null default 0,
  status text not null default 'MENUNGGU_VERIFIKASI'
    check (status in ('DRAFT','MENUNGGU_VERIFIKASI','DISETUJUI','MINTA_REVISI','DITOLAK','MENUNGGU_SINKRONISASI')),
  dibuat_oleh uuid references profil(id),
  dibuat_pada timestamptz not null default now()
);

-- 4. item pangan (katalog)
create table item_pangan (
  id bigint generated always as identity primary key,
  nama text not null,
  kategori text not null check (kategori in ('SIAP_SAJI','BAHAN_POKOK','PROTEIN','SUSU_BAYI','KHUSUS','AIR')),
  satuan text not null
);

-- 5. batch stok (satu pencatatan = satu batch = satu kode sumbangan)
create table stok_batch (
  id bigint generated always as identity primary key,
  item_id bigint not null references item_pangan(id),
  jumlah int not null check (jumlah >= 0),
  tgl_masuk date not null default current_date,
  kedaluwarsa date,
  sumber text not null,
  tampilkan_nama boolean not null default false,
  kode_sumbangan text unique not null,
  status text not null default 'TERSEDIA'
    check (status in ('TERSEDIA','DIALOKASIKAN','DIKIRIM','DITERIMA','KRITIS','HABIS'))
);

-- 6. manifest / pengiriman (INTI TERKUNCI, hanya INSERT)
create table manifest (
  id bigint generated always as identity primary key,
  kode text unique not null,
  posko_id bigint not null references posko(id),
  tim text not null,
  eta timestamptz,
  batas_checkin timestamptz,
  hash text not null,
  status text not null default 'TERKUNCI_PUBLIK'
    check (status in ('DRAFT','TERKUNCI_PUBLIK','DIBATALKAN','PUNYA_PENGGANTI','PUNYA_LAPORAN')),
  dipublikasikan_pada timestamptz not null default now()
);

-- 7. isi manifest (bagian dari data terkunci)
create table manifest_item (
  manifest_id bigint not null references manifest(id),
  batch_id bigint not null references stok_batch(id),
  jumlah int not null check (jumlah > 0),
  primary key (manifest_id, batch_id)
);

-- 8. riwayat status (APPEND-ONLY, hanya INSERT)
create table manifest_log (
  id bigint generated always as identity primary key,
  manifest_id bigint not null references manifest(id),
  status text not null,
  catatan text,
  dibuat_oleh uuid references profil(id),
  dibuat_pada timestamptz not null default now(),
  hash text not null
);

-- 9a. pembatalan publik (koreksi sebelum berangkat)
create table pembatalan (
  id bigint generated always as identity primary key,
  manifest_id bigint not null references manifest(id),
  alasan text not null,
  manifest_pengganti_id bigint references manifest(id),
  dibuat_pada timestamptz not null default now()
);

-- 9b. laporan ketidaksesuaian (masalah sesudah berangkat atau sampai)
create table ketidaksesuaian (
  id bigint generated always as identity primary key,
  manifest_id bigint not null references manifest(id),
  jenis text not null check (jenis in ('KURANG','RUSAK','TIDAK_SESUAI','TIDAK_DITERIMA','KIRIM_ULANG')),
  keterangan text not null,
  dibuat_oleh uuid references profil(id),
  dibuat_pada timestamptz not null default now()
);

create index manifest_kode_idx on manifest(kode);
create index manifest_posko_idx on manifest(posko_id);
create index manifest_log_manifest_idx on manifest_log(manifest_id);
create index stok_batch_kode_idx on stok_batch(kode_sumbangan);
create index snapshot_posko_idx on penyintas_snapshot(posko_id);

-- RLS: aktif di semua tabel. Anon dan authenticated TIDAK dapat policy
-- UPDATE/DELETE di tabel mana pun, dan TIDAK dapat policy INSERT langsung
-- ke manifest, manifest_item, manifest_log, pembatalan, ketidaksesuaian.
-- Semua tulis lewat API route dengan service_role.
alter table profil enable row level security;
alter table posko enable row level security;
alter table penyintas_snapshot enable row level security;
alter table item_pangan enable row level security;
alter table stok_batch enable row level security;
alter table manifest enable row level security;
alter table manifest_item enable row level security;
alter table manifest_log enable row level security;
alter table pembatalan enable row level security;
alter table ketidaksesuaian enable row level security;

create policy profil_select_own on profil
  for select to authenticated using (auth.uid() = id);

create policy posko_select_internal on posko
  for select to authenticated using (true);

create policy item_select_internal on item_pangan
  for select to authenticated using (true);

create policy snapshot_select_internal on penyintas_snapshot
  for select to authenticated using (true);

create policy batch_select_internal on stok_batch
  for select to authenticated using (true);

-- View publik 1: ringkasan per posko (butuh, dikirim, diterima, selisih).
-- View berjalan dengan hak owner sehingga anon cukup diberi SELECT ke view.
create view v_publik_dashboard as
with latest_snapshot as (
  select distinct on (posko_id) posko_id,
    (coalesce(bayi,0) + coalesce(balita,0) + coalesce(ibu_hamil,0)
      + coalesce(lansia,0) + coalesce(disabilitas,0) + coalesce(umum,0)) as butuh
  from penyintas_snapshot
  where status = 'DISETUJUI'
  order by posko_id, dibuat_pada desc
),
kirim as (
  select m.posko_id, sum(mi.jumlah) as dikirim
  from manifest m join manifest_item mi on mi.manifest_id = m.id
  where m.status not in ('DRAFT','DIBATALKAN')
  group by m.posko_id
),
terima as (
  select m.posko_id, sum(mi.jumlah) as diterima
  from manifest m
  join manifest_item mi on mi.manifest_id = m.id
  where exists (
    select 1 from manifest_log l
    where l.manifest_id = m.id and l.status = 'DITERIMA'
  )
  group by m.posko_id
)
select
  p.id as posko_id,
  p.nama as posko_nama,
  p.wilayah,
  coalesce(s.butuh, 0) as butuh,
  coalesce(k.dikirim, 0) as dikirim,
  coalesce(t.diterima, 0) as diterima,
  coalesce(s.butuh, 0) - coalesce(t.diterima, 0) as selisih
from posko p
left join latest_snapshot s on s.posko_id = p.id
left join kirim k on k.posko_id = p.id
left join terima t on t.posko_id = p.id;

-- View publik 2: detail manifest terpublikasi (tanpa DRAFT).
create view v_publik_manifest as
select
  m.kode, m.status, m.tim, m.eta, m.batas_checkin,
  m.hash, m.dipublikasikan_pada,
  p.nama as posko_nama, p.wilayah
from manifest m
join posko p on p.id = m.posko_id
where m.status <> 'DRAFT';

grant select on v_publik_dashboard to anon, authenticated;
grant select on v_publik_manifest to anon, authenticated;
