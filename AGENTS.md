# OmniRelief — aturan repo

Sumber kebenaran konsep: `docs/OmniRelief-Dokumen-Tim-Lengkap.pdf`. Konflik soal deadline dan scope selalu dimenangkan dokumen itu.

1. Setup satu perintah: `bun run setup`. Isi env Supabase di `apps/web/.env`, lihat `docs/SETUP.md`.
2. Perintah harian: `bun run dev:web`, `bun run check-types`, `bun --filter web test`, `bun --filter web lint`, `bun run build`. Bukti tiap kriteria juri di `docs/GOALS.md`.
3. Satu file maksimal 1000 baris. Cek dengan `bun run check:loc`, gagalkan sebelum commit kalau merah.
4. Stack dikunci: Next.js + Supabase + Vercel. Tidak ganti stack di tengah sprint (Bab 5 dokumen tim).
5. Semua tulis database lewat API route Next.js pakai service role. Browser tidak pernah tulis langsung, RLS menolak update dan delete.
6. Data terkunci hanya tambah riwayat, tidak ada edit diam-diam. Manifest terpublikasi dan log status append-only, tiap baris hash SHA-256 terikat ke hash sebelumnya (`apps/web/src/lib/hash.ts`, tulis lewat `apps/web/src/lib/riwayat.ts`).
7. Hasil Supabase dibaca lewat tipe batas di `apps/web/src/lib/supabase/baris.ts`. Tidak ada `as` inline di akses member.
8. Validator murni di `apps/web/src/lib/validasi.ts` agar bisa diuji tanpa Next. Rute hanya panggil.
9. Bahasa UI Indonesia sederhana ikut `GLOSSARY.md` (istilah + kalimat pendek tanpa em-dash), tombol minimal 48px, status selalu warna plus label teks. Komponen shadcn plus token semantik, light saja, tanpa mode gelap.
10. Secret tidak pernah masuk repo. `apps/web/.env` gitignored, contoh di `apps/web/.env.example`.
11. Selera visual dan token UI: `docs/desain/design.md` (napas, datar, sorot-tunggal). Nilai token hanya di `packages/ui/src/styles/globals.css`, jangan diduplikasi.
13. Logo final: O = Cincin Cetak Ganda (navy `#3A538D` + kuning `#F2B705`), kata outline Geist SemiBold (`docs/logo/v1/ad-kuning-outline.svg`). Aset di `apps/web/public/logo/` (`logo.svg`, `logo-putih.svg`, `logo-simbol.svg`, `logo-simbol-putih.svg`). UI pakai komponen `apps/web/src/components/logo.tsx` (`varian warna|putih`, `simbol`), jangan tulis teks brand manual. Putih untuk latar gelap, warna untuk latar terang, jangan ubah warna atau proporsi.
