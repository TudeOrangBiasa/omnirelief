# Setup OmniRelief

Setup repo satu perintah (install, env awal, generate tipe env):

```bash
bun run setup
```

Panduan sekali jalan untuk fondasi hari 1 sampai 2.

## 0. Project Supabase live

Project `omnirelief`, ref `pmckelqxvfwbiuwlftod`, region ap-south-1, URL `https://pmckelqxvfwbiuwlftod.supabase.co`.
Schema `supabase/migrations/0001_schema.sql`, seed `supabase/seed.sql`, akun `supabase/akun-demo.sql` sudah teraplikasi.
Kunci API dan DB password tersimpan di Vercel env dan `apps/web/.env` lokal, tidak di repo.
## 1. Supabase project

1. Buka https://supabase.com/dashboard/projects, buat project baru `omnirelief`.
2. Catat `Project URL` dan `anon public key` dari Settings, API.
3. Salin `apps/web/.env.example` ke `apps/web/.env`, isi URL dan anon key.
4. `service_role key` hanya untuk server: isi di `apps/web/.env` lokal dan Vercel env, jangan commit.

## 2. Schema dan seed

1. Buka SQL Editor project, jalankan `supabase/migrations/0001_schema.sql`.
2. Jalankan `supabase/seed.sql`.
3. Verifikasi cepat: `select * from v_publik_dashboard;` harus tampil 2 posko.

## 3. Akun demo

Buat di Authentication, Users (centang auto-confirm email), lalu tambah baris di `profil`.
Atau otomatis: buat user via Auth Admin API lalu jalankan `supabase/seed.sql` + `supabase/akun-demo.sql`.

1. `bpbd@demo` peran BPBD.
2. `gudang@demo` peran GUDANG.
3. `posko-a@demo` peran POSKO, posko_id Posko Balai Desa Sari.
4. `posko-b@demo` peran POSKO, posko_id Posko Sekolah Harapan.
5. `tim@demo` peran TIM.
6. `admin@demo` peran ADMIN.

Password bagikan internal saja, jangan commit.

## 4. Vercel

Project `omnirelief` sudah link ke repo ini dan auto-deploy tiap push ke `main`.
Proteksi SSO dimatikan agar URL bisa dibuka juri tanpa login.
Env yang terpasang sekarang masih dummy agar pipeline terbukti hijau.
Ganti dengan nilai asli setelah project Supabase jadi:

1. `bunx vercel env rm NAMA production` lalu `echo "asli" | bunx vercel env add NAMA production` untuk `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Push commit apa pun untuk picu deploy ulang, atau `bunx vercel deploy --yes`.
3. Cek `curl -s -o /dev/null -w "%{http_code}" https://deployment-aktif/` harus 200.

Catatan: env harus terdaftar di `turbo.json` `globalEnv` kalau tidak build tidak melihatnya (strict mode).

## 5. Keepalive anti pause

1. Isi GitHub repo secrets: `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
2. Workflow `supabase-keepalive.yml` jalan tiap hari 07.00 WIB plus bisa manual via workflow_dispatch.
3. Cek tab Actions setelah push pertama, pastikan run hijau.

## 6. Uji anti manipulasi (Bab 16.5)

1. Coba UPDATE manifest terpublikasi via API dan via SQL langsung, keduanya harus gagal.
2. Ubah satu angka di DB lalu verifikasi hash chain gagal.
3. Buka halaman publik tanpa login, semua tampil tanpa data pribadi.
