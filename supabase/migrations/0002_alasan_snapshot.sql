-- Alasan verifikasi snapshot agar Minta Revisi/Ditolak tampil penuh di posko.
-- Append-only tetap: status boleh UPDATE (verifikasi), alasan ditulis bersama keputusan.
alter table penyintas_snapshot
  add column if not exists alasan text;
