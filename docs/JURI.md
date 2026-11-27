# Panduan Juri

Dokumen ini disiapkan sebagai panduan cepat bagi juri untuk menilai fungsi utama, alur antar peran, dan mekanisme integritas data pada OmniRelief. Rincian arsitektur dan fitur tersedia di [docs/SISTEM-DAN-FITUR.md](SISTEM-DAN-FITUR.md), panduan desain di [docs/DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), dan daftar istilah di [GLOSSARY.md](../GLOSSARY.md).

## 1. Evaluasi Halaman Publik (Tanpa Login)

Seluruh halaman publik dapat diakses langsung tanpa akun:

1. `/` menampilkan formulir cek kode manifest (`MNF`) dan kode sumbangan (`DNT`), ringkasan KPI distribusi, alur kerja sistem, serta daftar pertanyaan umum.
2. `/transparansi` menampilkan kartu status untuk setiap posko berisi angka kebutuhan, dikirim, diterima, serta badge Kurang (merah) atau Aman (hijau).
3. `/m/[kode]` menampilkan detail manifest terkunci beserta hash pendek, tabel item dan batch, timeline riwayat append-only, kode QR, serta kartu pembatalan atau ketidaksesuaian bila ada. Halaman ini tidak memiliki tombol edit maupun hapus.
4. `/s/[kode]` menampilkan detail sumbangan berupa kode sumbangan, progres alokasi barang, dan daftar manifest yang menyalurkan batch tersebut.

## 2. Evaluasi Alur Antar Peran (Dengan Akun Demo)

Daftar akun demo dan langkah penyiapannya tersedia di [docs/SETUP.md](SETUP.md). Anda dapat masuk melalui `/masuk` menggunakan akun berikut: `bpbd@demo`, `gudang@demo`, `posko-a@demo`, `posko-b@demo`, `tim@demo`, dan `admin@demo`.

1. **Gudang (`/gudang`):** Catat sumbangan pangan baru beserta tanggal kedaluwarsanya, lalu catat kode sumbangan (`DNT-*`) yang terbit untuk dilacak di `/s/[kode]`.
2. **Posko (`/posko`):** Kirim snapshot penyintas untuk satu periode dan pantau status verifikasinya.
3. **BPBD (`/bpbd` dan `/bpbd/kirim`):** Verifikasi snapshot penyintas dengan tiga pilihan keputusan (disetujui, minta revisi, atau ditolak), lalu susun dan publikasikan manifest dengan aturan FEFO di `/bpbd/kirim`.
4. **Tim Distribusi (`/tim`):** Perbarui status pengantaran dan kirim check-in. Jika tim melewati batas waktu tanpa kabar, status kiriman otomatis berubah menjadi Perlu Dicek pada dashboard BPBD.
5. **Konfirmasi dan Ketidaksesuaian (`/posko`):** Lakukan konfirmasi terima untuk menutup selisih posko, atau laporkan ketidaksesuaian (misalnya barang rusak atau kurang) dan periksa kemunculannya pada halaman publik `/m/[kode]`.

## 3. Uji Anti-Manipulasi dan Integritas Data

1. **Uji imutabilitas manifest:** Coba kirim permintaan pembaruan (`UPDATE`) pada manifest yang sudah dipublikasikan melalui API maupun SQL langsung. Sistem dan kebijakan RLS database akan menolak perubahan tersebut.
2. **Uji rantai hash (hash chain):** Ubah satu angka secara langsung pada tabel database, lalu jalankan pemeriksaan integritas hash chain. Sistem akan mendeteksi ketidaksesuaian dan menyatakan verifikasi gagal.
3. **Uji privasi halaman publik:** Buka seluruh rute publik dalam mode penyamaran (tanpa login) dan pastikan tidak ada data pribadi penyintas maupun petugas yang terekspos.
