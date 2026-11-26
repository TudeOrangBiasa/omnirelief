# Kontribusi

Dokumen ini untuk anggota tim OmniRelief. Repo ini tertutup untuk tim. Tidak ada proses kontribusi publik.

## Bahasa

Tulis Bahasa Indonesia. Ikuti istilah di `GLOSSARY.md`. Satu gagasan per kalimat. Tanpa em-dash. Istilah yang dilarang ada di tiap entri glosarium pada baris Avoid.

## Sebelum push

Jalankan lima perintah ini dari root. Semua harus hijau.

```bash
bun --filter web check-types
bun --filter web test
bun --filter web lint
bun run check:loc
bun run build
```

Satu file maksimal 1000 baris. Perintah `check:loc` menolak file yang lewat batas. Pecah file sebelum push.

## Aturan repo

Aturan lengkap ada di `AGENTS.md`. Poin yang paling sering dilanggar:

1. Stack dikunci pada Next.js plus Supabase plus Vercel. Jangan ganti di tengah jalan.
2. Semua tulis ke database lewat API route Next.js dengan service role. Browser tidak pernah tulis langsung.
3. Data terkunci hanya tambah riwayat. Manifest terpublikasi dan log status bersifat append-only. Tiap baris memakai hash SHA-256 yang terikat ke hash sebelumnya.
4. Hasil baca Supabase memakai tipe batas di `apps/web/src/lib/supabase/baris.ts`. Dilarang `as` inline saat membaca anggota data.
5. Validator murni ada di `apps/web/src/lib/validasi.ts`. Rute hanya memanggil.
6. Secret tidak masuk repo. `apps/web/.env` masuk gitignore. Contoh ada di `apps/web/.env.example`.
7. Token visual hanya di `packages/ui/src/styles/globals.css`. Jangan duplikasi nilai token di file lain.

## Gaya commit

Ikuti pola riwayat yang ada. Format berupa tipe, scope opsional, lalu deskripsi singkat Bahasa Indonesia.

```text
feat(web): tambah filter posko di transparansi
fix(web): perbaiki guard halaman gudang
docs: perbarui langkah seed di SETUP.md
```

Tipe yang dipakai: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

## Aset dan aksesibilitas

Logo hanya lewat komponen `apps/web/src/components/logo.tsx`. Jangan menulis teks brand manual. Jangan ubah warna atau proporsi logo. Komponen baru wajib lolos cek aksesibilitas: kontras cukup, fokus tampak, tiap kontrol punya nama aksesibel, target sentuh minimal 48px.
