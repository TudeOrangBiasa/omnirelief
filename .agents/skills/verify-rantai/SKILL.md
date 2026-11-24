---
name: verify-rantai
description: Verifikasi rantai hash append-only OmniRelief (lib/hash.ts, lib/riwayat.ts) plus gerbang selera pemilik. Pakai setiap mengubah kode rantai, tulis riwayat, halaman audit, atau komponen yang menampilkan status hash.
---

# Verify Rantai

Properti: **setiap baris riwayat terikat ke baris sebelumnya lewat SHA-256, dan satu bit ubahan di mana pun membuat verifikasi gagal.** Kalau ini jebol, edit diam-diam lolos tanpa jejak — rantai pasok kehilangan bukti anti-korupsinya.

## Cakupan (jangan lebarkan diam-diam)

- Kode: `apps/web/src/lib/hash.ts` (`hashLog`, `verifyLog`, `hashManifest`, `verifyManifest`, `GENESIS_HASH`), disiplin rantai di `apps/web/src/lib/riwayat.ts` (`tambahLog`: prev = hash baris terakhir / hash manifest / `GENESIS_HASH`), pembaca `/audit` (`apps/web/src/app/audit/page.tsx`, verifikasi + label).
- Batas eksplisit: rantai 0–12 baris, 200 rantai acak per properti, seed tetap (`SEED_AWAL` di `rantai.test.ts`), status dari himpunan nyata + string acak.
- Asumsi: SHA-256 tahan preimage/kolisi; `Date`/`Math.random` tidak dipakai (PRNG seed tetap); RLS DB di luar cakupan (lihat skrip Bab 16.5 di `docs/GOALS.md`).
- Di luar cakupan: konkurensi tulis DB ganda (butuh skenario integrasi + Supabase hidup), kebijakan RLS itu sendiri, dan performa.

## Cara menjalankan (satu perintah)

```bash
bun --filter web test -- rantai
```

Verifikasi selera pemilik (wajib ikut tiap perubahan visual di area ini):

```bash
bun run check:tajam
```

Aturan rasa yang dijaga file ini: `docs/desain/design.md` §Bentuk & garis — label mono `text-[11px]` minimal `text-.../70` di atas terang (batas ukur 4.5:1, pasangan `Daring`/pil redup), `rounded-none` kecuali titik/dot/avatar/switch/progres/badge-angka/FAB, tanpa tooltip ganda (bantuan hanya dari tombol `?`).

## Bedakan bug asli vs salah model

- Gagal di `satu bit ubahan…`, `tukar/ganda…`, `ransum deterministik`, atau `status tak dikenal`: **bug** — rantai bisa dipalsukan atau verifikasi tidak stabil. Laporkan urutan langkahnya dalam bahasa kode (`tambahLog` → `hashLog(prev=…)` → `verifyLog`), bukan bahasa model.
- Gagal karena mutasi no-op (mis. hash berakhiran `0` lalu diganti `0`, korban indeks 0 yang prev-nya memang GENESIS, atau buang elemen sehingga sisa = prefix sah): **salah model** — perbaiki testnya (lihat riwayat commit file ini untuk contoh), jangan lunakkan propertinya.

## Bukti check ini bisa gagal (wajib diulang kalau properti berubah)

Rusak `hashLog` di `lib/hash.ts` (buang `prev:${…}` dari input hash) → 3 tes merah (`hash.test.ts` + 2 properti rantai). Kembalikan → hijau 50/50. Jangan commit versi rusaknya.

## Kalau kode berubah

Ikuti `/maintain-formal-verification`: baca diff file cakupan sejak commit sinkron di bawah, sesuaikan model/harness (file test ini), rerun, putuskan drift vs bug. Pindahkan commit sinkron hanya setelah check di atas hijau di kode baru.

## Commit sinkron

- Sinkron pada: `6f2237d`
  (HEAD saat skill ditulis; cakupan di atas sudah lolos penuh di commit ini:
  `bun --filter web test` 50/50 termasuk 5 properti rantai.)
