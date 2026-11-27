# Dokumentasi Sistem dan Fitur

Dokumen ini menjelaskan cara kerja arsitektur OmniRelief, mekanisme pengamanan data, aturan distribusi pangan, serta rincian fitur untuk setiap peran pengguna.

## 1. Arsitektur Sistem

OmniRelief dibangun menggunakan Next.js App Router (React) sebagai antarmuka dan server API, Supabase (Postgres, Auth, dan Row Level Security) sebagai basis data, serta Vercel sebagai platform deployment.

1. **Pemisahan baca dan tulis:** Seluruh penulisan data diproses melalui API route Next.js menggunakan `service_role` di sisi server setelah melewati validasi peran dan aturan bisnis. Browser tidak pernah menulis langsung ke tabel database.
2. **Akses baca publik:** Halaman publik membaca data melalui view dan query terbatas yang hanya mengekspos angka agregat penyintas, detail batch pangan, manifest, dan riwayat status tanpa data pribadi.
3. **Validasi terpusat:** Seluruh aturan validasi input (laporan penyintas, keputusan verifikasi, penyusunan manifest, dan status pengiriman) dipisahkan dalam modul fungsi murni di `apps/web/src/lib/validasi.ts` agar teruji secara konsisten.

## 2. Mekanisme Kepercayaan dan Keamanan Data

1. **Pencatatan append-only:** Kebijakan Row Level Security (RLS) pada database menolak operasi `UPDATE` dan `DELETE` pada manifest yang sudah dipublikasikan serta tabel log riwayat. Koreksi kesalahan di lapangan tidak pernah menimpa data lama, melainkan dicatat sebagai dokumen publik baru (pembatalan atau ketidaksesuaian).
2. **Rantai hash SHA-256 (hash chain):** Setiap manifest yang dipublikasikan dan setiap baris riwayat status menghitung hash SHA-256 yang menyertakan nilai hash dari baris sebelumnya. Jika ada pihak yang memodifikasi satu angka secara langsung di database, rangkaian hash tidak lagi cocok dan verifikasi integritas otomatis gagal.
3. **Pemisahan data per posko:** Setiap posko berdiri sebagai unit transparansi mandiri. Angka kebutuhan, pengiriman, dan penerimaan satu posko tidak pernah digabung dengan posko lain sehingga ketimpangan di satu wilayah langsung terlihat.

## 3. Aturan Distribusi dan Operasional Lapangan

1. **Alokasi FEFO (First Expired, First Out):** Saat BPBD menyusun draf manifest, sistem mengurutkan stok batch di gudang berdasarkan tanggal kedaluwarsa terdekat. Batch yang paling cepat kedaluwarsa diprioritaskan keluar terlebih dahulu untuk menekan risiko pangan terbuang.
2. **Perhitungan selisih transparan:** Selisih kebutuhan dihitung dari jumlah jatah yang telah disetujui dikurangi jumlah bantuan yang sudah dikonfirmasi terima oleh posko. Nilai nol menampilkan status Aman (hijau), sedangkan nilai positif menampilkan status Kurang (merah).
3. **Deteksi keterlambatan (Perlu Dicek):** Setiap manifest memiliki batas waktu check-in. Jika tim distribusi melewati batas waktu tersebut tanpa mengirim kabar, sistem otomatis menandai kiriman sebagai Perlu Dicek agar BPBD segera menghubungi tim melalui jalur darurat.
4. **Antrean offline untuk tim lapangan:** Ketika tim distribusi memperbarui status atau mengirim check-in tanpa koneksi internet, aplikasi menyimpan catatan tersebut di antrean lokal browser dengan status Menunggu Sinkronisasi. Begitu koneksi pulih, data dikirim otomatis ke server secara berurutan.

## 4. Rincian Fitur dan Halaman

### A. Halaman Publik (Tanpa Login)

1. **Halaman Utama (`/`):** Menyediakan kolom pencarian cepat kode manifest (`MNF-*`) dan kode sumbangan (`DNT-*`), ringkasan KPI distribusi langsung, penjelasan alur kerja, serta daftar pertanyaan umum.
2. **Dashboard Transparansi (`/transparansi`):** Menampilkan kartu per posko yang memuat jumlah kebutuhan, barang dikirim, barang diterima, selisih, serta status Aman atau Kurang beserta kolom pencarian.
3. **Detail Manifest (`/m/[kode]`):** Menampilkan badge status terkunci beserta hash pendek, tabel rincian item dan batch, timeline riwayat status append-only, kode QR, tombol salin tautan, serta kartu informasi pembatalan atau ketidaksesuaian jika ada. Halaman ini tidak menyediakan tombol edit maupun hapus.
4. **Detail Sumbangan (`/s/[kode]`):** Menampilkan rincian barang sumbangan, nama sumber (hanya tampil bila donatur memberi izin), progres persentase alokasi, dan daftar manifest yang menggunakan batch tersebut.

### B. Halaman Internal Per Peran (Login di `/masuk`)

1. **Beranda Peran (`/beranda`):** Menampilkan identitas pengguna, peran aktif, dan satu tombol aksi utama menuju ruang kerja masing-masing peran.
2. **Gudang (`/gudang`):** Menyediakan formulir pencatatan sumbangan masuk meliputi jenis item, jumlah, tanggal kedaluwarsa, asal sumber, dan opsi izin tampil nama. Setelah tersimpan, sistem langsung menampilkan kode sumbangan untuk diberikan kepada donatur.
3. **Posko (`/posko`):** Menyediakan formulir pengiriman snapshot penyintas per periode (mendukung penyimpanan draf dan revisi bila diminta BPBD) serta daftar bantuan masuk lengkap dengan tombol Konfirmasi Terima dan Lapor Ketidaksesuaian (kurang, rusak, tidak sesuai, tidak diterima, atau kirim ulang).
4. **BPBD (`/bpbd` dan `/bpbd/kirim`):**
   a. Di `/bpbd`, BPBD meninjau antrean snapshot penyintas dengan tiga pilihan keputusan (Disetujui, Minta Revisi, atau Ditolak), memantau daftar prioritas posko berdasarkan selisih terbesar, dan mengawasi kiriman berstatus Perlu Dicek beserta opsi pembatalan.
   b. Di `/bpbd/kirim`, BPBD menyusun manifest untuk satu posko, memilih batch sesuai urutan FEFO, menyimpan draf, lalu memublikasikan dan mengunci manifest menjadi kode QR.
5. **Tim Distribusi (`/tim`):** Menampilkan daftar tugas pengantaran hari ini, tombol pembaruan status pengiriman, tombol check-in berkala, pelaporan kendala darurat, serta indikator antrean offline.
