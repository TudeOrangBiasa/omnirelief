# Append-only terkendali untuk manifest

Ledger manifest tetap append-only di mata publik, tapi tiga UPDATE
terkendali lewat service_role diizinkan: publikasi (DRAFT → TERKUNCI_PUBLIK),
pembatalan (TERKUNCI_PUBLIK → DIBATALKAN/PUNYA_PENGGANTI), dan laporan
ketidaksesuaian (TERKUNCI_PUBLIK → PUNYA_LAPORAN).

Dipilih trigger `trg_kunci_status_manifest` (supabase/migrations/0002_kunci_status.sql)
karena RLS saja tidak membedakan service_role: tanpa trigger, kunci
API mana pun yang bocor bisa UPDATE kolom bebas. Trigger menolak transisi
di luar daftar sah dan menolak UPDATE kolom selain status/dipublikasikan_pada
(hash hanya boleh berubah saat penguncian DRAFT → TERKUNCI_PUBLIK).

Konsekuensi: apply ke database adalah langkah manusia (file ini hanya
tulisan, tanpa apply); skrip `bun scripts/uji-anti-manipulasi.mjs` membuktikan
probe anon/non-BPBD gagal dan rantai hash utuh. Kalau butuh transisi status
baru, ubah daftar di trigger + ADR ini, bukan UPDATE langsung.
