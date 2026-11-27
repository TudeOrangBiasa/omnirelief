# Peta Codebase untuk Kontributor dan Agen

Dokumen ini menjadi peta navigasi cepat bagi kontributor manusia maupun agen AI yang ingin memahami struktur kode OmniRelief dan menemukan berkas yang tepat untuk diubah.

## 1. Ringkasan Monorepo

| Direktori | Peran |
| --- | --- |
| `apps/web/` | Aplikasi utama Next.js App Router (antarmuka publik, ruang kerja peran, dan API route) |
| `packages/ui/` | Sistem desain, token semantik (`src/styles/globals.css`), dan komponen UI shadcn |
| `packages/db/` | Skema Drizzle untuk akses SQL langsung bila diperlukan |
| `packages/config/` | Konfigurasi TypeScript dan lint bersama |
| `supabase/` | Migrasi skema Postgres, kebijakan RLS (`migrations/`), dan data contoh (`seed.sql`) |
| `scripts/` | Skrip pemeriksaan otomatis (`check-loc.ts`, `check-ui.ts`, `check-tajam.ts`, `verify-formal.ts`) |
| `docs/` | Dokumentasi sistem, design system, panduan instalasi, dan panduan juri |

## 2. Alur Eksekusi dan Batas Sistem

1. **Halaman Publik dan Peran (`apps/web/src/app/`):** Komponen halaman merender antarmuka dan memanggil API route Next.js, tidak pernah menulis langsung ke Supabase dari browser.
2. **API Route (`apps/web/src/app/api/`):** Terbagi per peran (`admin/`, `bpbd/`, `gudang/`, `posko/`, `tim/`, `publik/`). Setiap handler memvalidasi sesi, memanggil validator murni di `lib/validasi.ts`, lalu menulis ke database lewat `lib/supabase/admin.ts` (`service_role`).
3. **Logika Domain Murni (`apps/web/src/lib/`):** Seluruh aturan bisnis yang krusial dipisahkan agar mudah diuji dan diverifikasi secara formal tanpa menjalankan Next.js.

## 3. Modul Domain Inti (`apps/web/src/lib/`)

| Berkas | Tanggung Jawab | Uji Terkait |
| --- | --- | --- |
| `hash.ts` | Perhitungan dan verifikasi hash SHA-256 untuk manifest dan log riwayat | `hash.test.ts`, `rantai.test.ts` |
| `riwayat.ts` | Penambahan log status append-only yang terikat ke hash sebelumnya | `riwayat.test.ts` |
| `fefo.ts` | Pengurutan batch kedaluwarsa terdekat (`urutFEFO`), alokasi (`ambilBatchFEFO`), dan deteksi batch terlewati | `fefo.test.ts` |
| `validasi.ts` | Validator murni untuk laporan penyintas, verifikasi BPBD, draf manifest, status tim, dan kendala | `validasi.test.ts` |
| `offline.ts` | Pengelolaan antrean aksi tim saat offline (`Menunggu Sinkronisasi`) | `offline.test.ts` |
| `auth.ts` & `identitas.ts` | Pemeriksaan sesi, peran pengguna, dan pengalihan rute peran | `auth.test.ts`, `identitas.test.ts` |
| `supabase/baris.ts` | Tipe batas (boundary parser) untuk hasil baca Supabase tanpa cast `as` inline | `supabase/baris.test.ts` |

## 4. Peta Halaman Aplikasi (`apps/web/src/app/`)

| Rute | Berkas Utama | Akses |
| --- | --- | --- |
| `/` | `page.tsx` | Publik |
| `/transparansi` | `transparansi/page.tsx`, `transparansi/isi.tsx` | Publik |
| `/m/[kode]` | `m/[kode]/page.tsx` | Publik |
| `/s/[kode]` | `s/[kode]/page.tsx` | Publik |
| `/masuk` | `masuk/page.tsx`, `masuk/formulir.tsx` | Publik / Login |
| `/beranda` | `beranda/page.tsx`, `beranda/isi.tsx` | Semua peran |
| `/gudang` | `gudang/page.tsx` | Gudang |
| `/posko` | `posko/page.tsx`, `posko/formulir.tsx`, `posko/bantuan.tsx` | Posko |
| `/bpbd` | `bpbd/page.tsx`, `bpbd/dasbor.tsx` | BPBD |
| `/bpbd/kirim` | `bpbd/kirim/page.tsx` | BPBD |
| `/tim` | `tim/page.tsx`, `tim/tugas.tsx` | Tim Distribusi |
| `/admin` | `admin/page.tsx`, `admin/isi.tsx` | Admin |

## 5. Panduan Cepat: Di Mana Harus Mengubah Kode

| Kebutuhan Tugas | Lokasi yang Dituju |
| --- | --- |
| Menambah aturan validasi input baru | `apps/web/src/lib/validasi.ts` dan `validasi.test.ts` |
| Mengubah logika alokasi FEFO | `apps/web/src/lib/fefo.ts` lalu jalankan `bun run verify:formal` |
| Mengubah format hash chain | `apps/web/src/lib/hash.ts` dan `riwayat.ts` lalu jalankan `bun run verify:formal` |
| Menambah atau mengubah endpoint tulis | `apps/web/src/app/api/<peran>/` |
| Mengubah warna, tipografi, atau spasi global | `packages/ui/src/styles/globals.css` (jangan duplikasi di `apps/web`) |
| Mengubah skema tabel atau kebijakan RLS | `supabase/migrations/` (tambah file migrasi baru) |
| Mengubah data demo awal | `supabase/seed.sql` |

## 6. Perintah Verifikasi untuk Kontributor dan Agen

```bash
bun --filter web check-types
bun --filter web test
bun --filter web lint
bun run check:loc
bun run verify:formal
bun run build
```
