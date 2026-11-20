---
name: verify-ui-taste
description: Verifikasi selera UI (ikon Solar, token, tanpa lucide/hex) tiap ubah komponen web atau ui. Pakai setiap sentuh apps/web/src, packages/ui/src, atau docs/desain/design.md.
---

# Verifikasi selera UI

Properti: **selera `docs/desain/design.md` berlaku di semua kode UI** — bukan sampel. Pelanggaran merusak konsistensi visual dan lolos dari review karena tersebar satu-dua baris per file.

Bahaya bila dilanggar: ikon campur gaya, hex lepas token, ukuran ikon repetitif — juri melihat dua bahasa visual dalam satu layar.

## Jalankan

```sh
bun run check:ui   # dari akar repo
```

Hijau = 6 cek lolos di ~87 berkas. Merah = baris `GAGAL <cek> <berkas>:<baris>` + aturan design.md yang dilanggar. Perbaiki kodenya, bukan skripnya.

## Cakupan (sinkron per commit `HEAD` di bawah)

Skrip: `scripts/check-ui.ts`. Cakupan berkas: semua `.ts`/`.tsx` di `apps/web/src` + `packages/ui/src` (di luar `node_modules`, `.next`, `dist`).

| Cek | Aturan | Fungsi/kode yang dijaga |
|---|---|---|
| `larang-lucide` | design.md §Komponen Ikon | impor + dep: nol `lucide-react` |
| `nama-ikon-solar` | design.md §Komponen Ikon | tiap nama impor `@solar-icons/react/{linear,bold-duotone}` ada di `dist/icons/style/<gaya>.mjs` paket terpasang |
| `provider-ikon` | design.md §Komponen Ikon | `apps/web/src/components/providers.tsx`: `SolarProvider` + `size` + `strokeWidth` |
| `tanpa-prop-ukuran` | design.md §Komponen Ikon | nol `size=`/`strokeWidth=` pada `<*Icon>` (default provider yang berlaku) |
| `fondasi-tanpa-hex` | design.md Langkah #1 | `apps/web/src/{components,lib}` + `packages/ui/src/components`: nol hex (token hanya di `styles/globals.css`) |
| `tanpa-shadow-arbitrary` | design.md Langkah #1 | nol `shadow-[` di semua src |

Halaman rute (`apps/web/src/app/**`) SENGAJA di luar `fondasi-tanpa-hex` — migrasi token halaman ikut backlog `docs/PAGES.md`, bukan cek ini. Mempersempit cakupan agar lolos adalah melemahkan properti: jangan.

## Bedakan bug asli vs salah model

- `GAGAL` menunjuk berkas:baris nyata → bug asli, perbaiki kodenya.
- `GAGAL` pada impor dari entri utama `@solar-icons/react` (provider/hook) → salah model: nama itu bukan ikon. Skrip sudah mengabaikan entri utama; bila pola impor baru muncul (mis. subpath dinamis), perbaiki pola `pola` di skrip, bukan menonaktifkan cek.
- `GAGAL nama-ikon-solar` setelah upgrade paket ikon → nama berubah di upstream. Validasi ulang nama lewat berkas `dist` terpasang, bukan dari ingatan.

## Bila kode berubah sengaja

Cek ini menjaga properti di atas; perubahan yang memang mengubah properti (mis. gaya ikon baru) wajib memperbarui skrip + tabel cakupan di sini, lalu majukan commit sinkron di bawah HANYA setelah `bun run check:ui` hijau di commit baru.

## Rekaman sinkron

- Commit sinkron: `HEAD` saat skill ini ditulis (lihat riwayat untuk sha pasti).
- Terakhir dikonfirmasi hijau di commit tersebut untuk 6 cek di atas.
- Perubahan pada berkas cakupan sesudah commit itu berarti verifikasi perlu dilihat ulang.
