# Peta produk

OmniRelief adalah produk yang menyelesaikan masalah nyata. Bukan sekadar proyek lomba. Masalahnya: aliran bantuan pangan sulit dilacak dari gudang sampai posko, dan data bisa diubah diam-diam. Produk ini menjawab dengan pencatatan append-only yang bisa dicek publik per daerah.

Dokumen ini hidup dan terbuka terhadap perubahan. Fase bisa bergeser mengikuti umpan balik lapangan. Status versi ada di `CHANGELOG.md`. Versi ditahan di `0.1.x` sampai kode matang.

## Visi

Setiap daerah punya catatan bantuan pangan yang bisa diperiksa siapa pun. Donatur melacak sumbangannya lewat kode. Posko membuktikan jatahnya kurang dengan angka terbuka. Pemerintah daerah mereplikasi pola ini tanpa membangun sistem baru dari nol.

## Fase 1: fondasi tepercaya

Target: klaim kepercayaan terbukti oleh mesin, bukan oleh janji.

1. E2E hijau untuk 3 alur kritis: buat lalu publikasi lalu cek publik, antar lalu check-in lalu terima, lapor rusak lalu tampil publik.
2. Coverage 80 persen untuk modul murni di `apps/web/src/lib`.
3. Uji anti manipulasi Bab 16.5 lolos: update manifest terpublikasi gagal, ubah angka merusak hash chain, halaman publik tampil tanpa data pribadi.
4. Halaman publik di bawah 1,5 MB.

## Fase 2: pilot daerah

Target: dipakai nyata di 1 sampai 2 daerah bersama BPBD setempat.

1. Operasi harian oleh peran asli: gudang, posko, tim, BPBD.
2. Kumpulkan umpan balik soal alur offline dan keterbacaan halaman publik.
3. Perbaiki prioritas penyaluran berdasarkan data lapangan.
4. Dokumentasikan pola replikasi: langkah membuka daerah baru dari schema sampai seed.

## Fase 3: skala dan keberlanjutan

Target: pola yang sama berjalan di banyak daerah tanpa beban operasional besar.

1. Kandidat fitur berdasarkan kebutuhan pilot: pengingat check-in, dukungan multi gudang, ringkasan per wilayah.
2. Pengerasan operasional: keepalive, cadangan, dan runbook insiden.
3. Tata kelola data: retensi, arsip periode lama, dan audit berkala hash chain.

Urutan kandidat pada fase 3 ditentukan oleh hasil fase 2. Tidak ada janji tanggal pada dokumen ini.
