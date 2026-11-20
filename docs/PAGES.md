# Peta halaman

Sumber: Bab 10 dan U4 dokumen tim. Status UI dicatat agar migrasi shadcn konsisten.

## Publik tanpa login

1. `/` landing. File `apps/web/src/app/page.tsx`. UI shadcn penuh. Hero 2 baris, kolom kode auto-deteksi MNF atau DNT, 3 statistik hidup, 4 janji, 3 langkah, footer resmi.
2. `/transparansi` dashboard per posko. File `apps/web/src/app/transparansi/page.tsx`. UI shadcn penuh. Kartu per posko butuh, dikirim, diterima, badge Kurang merah atau Aman hijau, 2 kolom cari.
3. `/m/[kode]` detail manifest. File `apps/web/src/app/m/[kode]/page.tsx`. UI tangan. Badge terkunci plus hash pendek, tabel item plus batch, timeline append-only, kartu pembatalan dan ketidaksesuaian, QR plus salin tautan. Tanpa tombol edit atau hapus dalam kondisi apa pun.
4. `/s/[kode]` detail sumbangan. File `apps/web/src/app/s/[kode]/page.tsx`. UI tangan. Kode, item, sumber hanya tampil bila izin, progress alokasi, daftar manifest pemakai.

## Internal login

5. `/masuk` login per peran. File `apps/web/src/app/masuk/page.tsx`. UI tangan. Email plus password, error jelas, info akun demo, lempar yang sudah login ke `/beranda`.
6. `/beranda` rumah peran. File `apps/web/src/app/beranda/page.tsx`. UI tangan. Nama, peran, satu tombol aksi per peran, keluar.
7. `/bpbd` dashboard command center. File `apps/web/src/app/bpbd/dasbor.tsx`. UI shadcn penuh. Antrean verifikasi 3 putusan, prioritas, seksi Perlu Dicek plus batalkan.
8. `/bpbd/kirim` buat manifest. File `apps/web/src/app/bpbd/kirim/formulir.tsx`. UI tangan. Pilih posko, pilih batch urutan FEFO, tambah baris, simpan draf, baca peringatan, publikasikan dan kunci.
9. `/gudang` intake. File `apps/web/src/app/gudang/page.tsx`. UI tangan. Form item, jumlah, kedaluwarsa, sumber, izin nama. Hasil tampilkan kode sumbangan.
10. `/posko` lapor plus terima. File `apps/web/src/app/posko/formulir.tsx` tangan dan `bantuan.tsx` shadcn. Form 6 angka plus draf, banner Minta Revisi implisit lewat status, daftar bantuan plus konfirmasi terima plus lapor masalah.
11. `/tim` antar plus kabar. File `apps/web/src/app/tim/tugas.tsx`. UI tangan. Tugas hari ini, 4 tombol status plus check-in, lapor kendala plus darurat, indikator antrean offline.

## Aturan migrasi

1. Urut backlog lint `no-arbitrary-values`, terbesar dulu. Terakhir: dasbor 0, bantuan 0, tugas 9, formulir 8, gudang 7, kirim 7.
2. Satu halaman selesai artinya nol peringatan di file itu plus build hijau.
3. Komponen dari `@omnirelief/ui`, token dari theme, tanpa warna arbitrary baru.
