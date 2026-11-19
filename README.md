# OmniRelief

Sistem supply chain pangan darurat yang transparan dan anti-korupsi. Dibangun untuk SEVENT X Software Development, sub-tema Zero Hunger. Target internal: freeze dan submit awal 28 November 2026.

## Status sprint

Hari 1 sampai 2: fondasi. Next.js App Router plus Tailwind plus Supabase plus deploy Vercel. Schema 9 tabel, RLS append-only, hash chain SHA-256, seed demo 2 posko.

## Mulai cepat

```bash
bun install
cp apps/web/.env.example apps/web/.env
bun run dev:web
```

Isi env Supabase dulu, lihat `docs/SETUP.md` untuk schema, seed, akun demo, dan keepalive.

Perintah berguna: `bun run build` (semua paket), `bun run check-types`, `bun --filter web test`.

## Struktur

1. `apps/web/src/app/` rute Next.js (4 publik, 6 internal, lihat Bab 10 dokumen tim).
2. `apps/web/src/lib/` hash chain, FEFO, auth, client Supabase.
3. `packages/db/` drizzle untuk akses SQL langsung (cadangan; query aplikasi lewat Supabase client agar RLS tetap berlaku).
4. `supabase/migrations/` schema RLS plus view publik.
5. `supabase/seed.sql` data demo Lampiran A.
6. `.github/workflows/` keepalive harian anti pause.
7. `docs/` PDF dokumen tim plus `SETUP.md`.

Scaffold: Better-T-Stack (`bts.jsonc`, perintah reproduksi di dalamnya).

Sumber kebenaran: `docs/OmniRelief-Dokumen-Tim-Lengkap.pdf`. Kalau konflik soal deadline dan scope, dokumen itu yang menang.
