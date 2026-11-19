# OmniRelief

Sistem supply chain pangan darurat yang transparan dan anti-korupsi. Dibangun untuk SEVENT X Software Development, sub-tema Zero Hunger. Target internal: freeze dan submit awal 28 November 2026.

## Status sprint

Hari 1 sampai 2: fondasi. Next.js App Router plus Tailwind plus Supabase plus deploy Vercel. Schema 9 tabel, RLS append-only, hash chain SHA-256, seed demo 2 posko.

## Mulai cepat

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi env Supabase dulu, lihat `docs/SETUP.md` untuk schema, seed, akun demo, dan keepalive.

## Struktur

1. `app/` rute Next.js (4 publik, 6 internal, lihat Bab 10 dokumen tim).
2. `lib/hash.ts` hash chain SHA-256 manifest dan log.
3. `lib/supabase/` client browser dan server.
4. `supabase/migrations/` schema RLS plus view publik.
5. `supabase/seed.sql` data demo Lampiran A.
6. `.github/workflows/` keepalive harian anti pause.
7. `docs/` PDF dokumen tim plus `SETUP.md`.

Sumber kebenaran: `docs/OmniRelief-Dokumen-Tim-Lengkap.pdf`. Kalau konflik soal deadline dan scope, dokumen itu yang menang.
