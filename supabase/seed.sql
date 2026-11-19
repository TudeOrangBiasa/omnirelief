-- Seed demo konsisten dengan Lampiran A dokumen tim.
-- Jalankan setelah 0001_schema.sql. Hash dihitung dengan lib/hash.ts.

insert into posko (nama, wilayah) values
  ('Posko Balai Desa Sari', 'Desa Sari'),
  ('Posko Sekolah Harapan', 'Kec. Harapan');

insert into item_pangan (nama, kategori, satuan) values
  ('Beras', 'BAHAN_POKOK', 'kg'),
  ('Mie Instan', 'SIAP_SAJI', 'pcs'),
  ('Kornet', 'PROTEIN', 'kaleng'),
  ('Susu Formula', 'SUSU_BAYI', 'kaleng'),
  ('Air Minum', 'AIR', 'liter'),
  ('Paket Sembako', 'BAHAN_POKOK', 'paket');

insert into stok_batch (item_id, jumlah, kedaluwarsa, sumber, tampilkan_nama, kode_sumbangan, status) values
  ((select id from item_pangan where nama = 'Paket Sembako'), 500, current_date + 60, 'Donatur Warga', false, 'DNT-2026-001', 'TERSEDIA'),
  ((select id from item_pangan where nama = 'Susu Formula'), 100, current_date + 5, 'CSR', true, 'DNT-2026-002', 'TERSEDIA');

insert into penyintas_snapshot (posko_id, bayi, balita, ibu_hamil, lansia, disabilitas, umum, status) values
  ((select id from posko where nama = 'Posko Balai Desa Sari'), 8, 15, 6, 10, 5, 76, 'DISETUJUI'),
  ((select id from posko where nama = 'Posko Sekolah Harapan'), 20, 30, 12, 20, 10, 108, 'DISETUJUI');

insert into manifest (kode, posko_id, tim, eta, batas_checkin, hash, status) values
  ('MNF-2026-0001',
   (select id from posko where nama = 'Posko Sekolah Harapan'),
   'Tim Antar 1',
   now() + interval '2 days',
   now() + interval '1 day',
   '082cbccfb4cf33142171435b35fd9085f04368a3658ea0ec85a08a200bdc6b1e',
   'TERKUNCI_PUBLIK');

insert into manifest_item (manifest_id, batch_id, jumlah) values
  ((select id from manifest where kode = 'MNF-2026-0001'),
   (select id from stok_batch where kode_sumbangan = 'DNT-2026-002'), 30),
  ((select id from manifest where kode = 'MNF-2026-0001'),
   (select id from stok_batch where kode_sumbangan = 'DNT-2026-001'), 10);

insert into manifest_log (manifest_id, status, catatan, hash) values
  ((select id from manifest where kode = 'MNF-2026-0001'),
   'DIPUBLIKASIKAN', 'Publikasi awal demo',
   '4ef02bf7774dfd340a0a8dd05c0954e33db92c8cc256c788fdd4647cd4b5ca40');
