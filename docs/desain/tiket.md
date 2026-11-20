# Tiket eksekusi OmniRelief (berurutan)

SHA diaudit: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`.
IA acuan: `docs/desain/arsitektur-pages.md` (14 routes). Rincian visual per checklist dikerjakan file audit peer (`docs/desain/audit-*.md`, milik worker lain) — tiap tiket di bawah mencantumkannya sebagai dependen, tanpa menduplikasi isinya. Aturan tiap tiket: shadcn `@omnirelief/ui` + token semantik, light saja, tombol min 48px, status warna + label teks, istilah `GLOSSARY.md`. Selesai = `bun run check-types` + `bun --filter web lint` + build hijau untuk file yang disentuh. Total: **16 P0 + 10 P1 = 26 tiket**.

## P0 — alur juri + navigasi (berurutan)

1. `P0-01 Shell navigasi desktop` — Tambah sidebar per peran + header (avatar → `/profil`, badge offline) di `apps/web/src/app/layout.tsx` + `components/header`. Dependen: audit mobile-tab-bar (peer). Kriteria juri: semua.
2. `P0-02 Bottom-nav mobile 4 tab + Lainnya` — Tab per peran sesuai §2 arsitektur (ikon + label, aktif tegas, badge angka antrean), sembunyi di `/m/*`, `/s/*`, dan mode formulir. Dependen: audit mobile-tab-bar (peer).
3. `P0-03 Landing CTA tunggal` — DIKERJAKAN TERAKHIR setelah P0-16 (desain landing ditetapkan belakangan; dasbor + fitur utama dulu). Satu CTA primer + CTA bawah berulang, kolom kode auto-deteksi MNF/DNT; tanpa CTA ganda sejajar. Dependen: audit landing (peer). Juri: — (masuk alur).
4. `P0-04 Transparansi kartu selisih` — Kartu per posko: butuh/dikirim/diterima + badge Kurang merah / Aman hijau + cari 2 kolom + empty state. Dependen: audit transparansi (peer). Juri: 6.
5. `P0-05 Detail manifest terkunci` — Badge TERKUNCI + hash pendek + QR + salin tautan + timeline append-only + kartu pembatalan/ketidaksesuaian; pastikan nol tombol edit/hapus. Dependen: audit transparansi grup (peer). Juri: 5, 6.
6. `P0-06 Detail sumbangan` — Header `DNT-*` + sumber (hanya bila izin) + progress alokasi + daftar manifest pemakai. Dependen: audit transparansi grup (peer). Juri: 1.
7. `P0-07 Login jelas` — Tampil/sembunyi password + ingat saya + error jelas + info akun demo (tanpa ketik password di demo video) + redirect `/beranda`. Dependen: audit masuk (peer). Juri: —.
8. `P0-08 Beranda orientasi` — Sapaan + peran + ringkasan "sejak terakhir" (antrean/Perlu Dicek) + satu aksi primer per peran + aktivitas terakhir + Keluar. Dependen: audit dashboard (peer). Juri: —.
9. `P0-09 BPBD antrean 3 putusan` — Setujui / minta revisi / tolak + prioritas + alasan wajib untuk revisi/tolak. Dependen: audit bpbd (peer). Juri: 3.
10. `P0-10 BPBD seksi Perlu Dicek` — Daftar telat check-in + aksi hubungi/batalkan + badge angka ke tab mobile. Dependen: audit bpbd (peer). Juri: 7.
11. `P0-11 Kirim FEFO → kunci` — Pilih posko + batch urutan FEFO berlabel + tambah baris + draf + peringatan FEFO + publikasikan → `MNF-*` + QR + badge terkunci. Dependen: audit bpbd (peer). Juri: 4.
12. `P0-12 Gudang intake → DNT` — Form item/jumlah/kedaluwarsa/sumber/izin nama + hasil kode `DNT-*` + riwayat hari ini. Dependen: audit gudang (peer). Juri: 1.
13. `P0-13 Posko lapor 6 angka` — Form snapshot + draf + banner status verifikasi (Minta Revisi eksplisit). Dependen: audit posko (peer). Juri: 2.
14. `P0-14 Posko terima + lapor masalah` — Konfirmasi terima + 5 jenis ketidaksesuaian → kartu kuning publik di `/m/[kode]`. Dependen: audit posko (peer). Juri: 8.
15. `P0-15 Tim tugas + check-in` — 4 tombol status + check-in + lapor kendala/darurat + indikator Menunggu Sinkronisasi → terkirim otomatis. Dependen: audit tim/mobile (peer). Juri: 7, 9.
16. `P0-16 Pengaturan + profil + aksesibilitas` — `/pengaturan` hub (Akun→`/profil`, Notifikasi, `#aksesibilitas`, Bantuan, versi+legal, Keluar) + `/profil` (avatar/nama/email/peran, ubah password + autentikasi ulang). Tanpa hapus akun mandiri. Dependen: audit settings/account (peer). Juri: —.

## P1 — admin, ketahanan, polish (setelah P0)

17. `P1-01 Admin dashboard desktop` — `/admin` khusus desktop: pemakaian + ekspor, undang/ubah peran/nonaktifkan, log audit, zona berbahaya terpisah + konfirmasi ketik. Guard peran admin. Dependen: audit admin-panel (peer).
18. `P1-02 Aksesibilitas fungsional` — Ukuran teks + kontras + kurangi gerak di `#aksesibilitas` benar-benar mengubah tampilan (bukan pajangan) + deep-link dari prompt terkait.
19. `P1-03 Empty/error/offline states` — Empty state tiap daftar + error jelas tiap form + banner offline global konsisten (label, bukan warna saja).
20. `P1-04 Konfirmasi aksi destruktif` — Batalkan manifest, tolak verifikasi, nonaktifkan user: dialog konfirmasi + alasan + jejak riwayat.
21. `P1-05 Salin tautan + QR` — Salin tautan `/m/*` dan `/s/*` dengan umpan balik toast + unduh/cetak QR manifest.
22. `P1-06 Riwayat aktivitas beranda` — 5 aktivitas terakhir per peran di `/beranda` (tautan ke sumbernya).
23. `P1-07 Ekspor admin` — Ekspor CSV pemakaian + log audit di `/admin` untuk bukti juri.
24. `P1-08 Bantuan dalam Pengaturan` — Jalur hubungi bantuan + FAQ singkat (menjawab keberatan "ribet?") di `/pengaturan`, tautan dari `Lainnya` mobile.
25. `P1-09 Budget halaman publik` — `/`, `/transparansi`, `/m/*`, `/s/*` di bawah 1,5 MB (cek build + tab jaringan, `docs/GOALS.md` U6).
26. `P1-10 Glosarium di UI` — Label UI memakai istilah baku (selisih, Perlu Dicek, ketidaksesuaian, konfirmasi terima); sapu istilah lama (defisit, overdue, komplain, serah terima).

Urutan kerja: P0-01 → P0-02 → P0-04…P0-16 berurutan (shell dulu, lalu publik non-landing, masuk/beranda, peran, pengaturan), P0-03 landing dikerjakan terakhir, baru P1-01…P1-10. Jangan kerjakan P1-01 sebelum P0-01/P0-02 (guard + nav bergantung shell).

Worksheet check-types: n/a (murni markdown, tanpa token).
