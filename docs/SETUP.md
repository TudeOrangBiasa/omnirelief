# Panduan Instalasi dan Pengaturan

Panduan ini menjelaskan langkah menjalankan OmniRelief secara lokal maupun memeriksa konfigurasi deployment. Jalankan perintah berikut untuk menginstal dependensi dan menyiapkan file `.env` awal:

```bash
bun run setup
```

## 1. Membuat Project Supabase Baru

1. Buka [Supabase Dashboard](https://supabase.com/dashboard/projects), lalu buat project baru bernama `omnirelief`.
2. Catat `Project URL` dan `anon public key` dari menu Settings, lalu bagian API.
3. Salin `apps/web/.env.example` menjadi `apps/web/.env`, kemudian isi URL dan anon key tersebut.
4. Simpan `service_role key` hanya di sisi server dengan mengisinya di `apps/web/.env` lokal dan variabel lingkungan Vercel. Jangan pernah menyimpan kunci ini di repositori.

## 2. Menerapkan Skema dan Data Awal (Seed)

1. Buka SQL Editor pada project Supabase Anda, lalu jalankan isi `supabase/migrations/0001_schema.sql`.
2. Jalankan isi `supabase/seed.sql` untuk mengisi dua posko contoh (Posko Balai Desa Sari dan Posko Sekolah Harapan) beserta batch dan manifest awal.
3. Lakukan verifikasi cepat dengan menjalankan `select * from v_publik_dashboard;`, dan pastikan hasil kueri menampilkan dua posko.

## 3. Menyiapkan Akun Demo

Buat akun pengguna di menu Authentication, bagian Users (pastikan opsi auto-confirm email dicentang), lalu tambahkan baris yang sesuai ke tabel `profil`. Sebagai alternatif otomatis, buat pengguna melalui Auth Admin API lalu jalankan `supabase/seed.sql` dan `supabase/akun-demo.sql`.

1. `bpbd@demo` dengan peran `BPBD`.
2. `gudang@demo` dengan peran `GUDANG`.
3. `posko-a@demo` dengan peran `POSKO` untuk Posko Balai Desa Sari.
4. `posko-b@demo` dengan peran `POSKO` untuk Posko Sekolah Harapan.
5. `tim@demo` dengan peran `TIM`.
6. `admin@demo` dengan peran `ADMIN`.

Bagikan kata sandi hanya melalui jalur internal dan jangan pernah menyimpannya di dalam repositori.

## 4. Menjalankan Server Lokal

```bash
bun run dev
```

Setelah server aktif, buka `http://localhost:3001` di browser.

## 5. Konfigurasi Vercel

Project `omnirelief` terhubung ke repositori ini dengan deployment otomatis setiap ada pembaruan ke branch utama. Proteksi SSO dimatikan agar juri dan publik dapat membuka aplikasi tanpa hambatan.

Catatan konfigurasi: setiap variabel lingkungan baru wajib didaftarkan di bagian `globalEnv` pada `turbo.json` agar terbaca saat proses build.

## 6. Menjaga Supabase Tetap Aktif (Keepalive)

1. Tambahkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke GitHub repository secrets.
2. Workflow `supabase-keepalive.yml` berjalan otomatis setiap hari pukul 07.00 WIB dan dapat dijalankan manual melalui `workflow_dispatch`.
3. Periksa tab Actions setelah push pertama untuk memastikan workflow berjalan sukses.
