## Summary

<Sketsa perubahan: file atau diagram alur + closes #xx / depends on #xx. Satu kalimat per klaim.>

## Checklist Format

- [ ] Judul PR memakai tag `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, atau `test:`
- [ ] Deskripsi menjelaskan apa yang berubah dan kenapa
- [ ] Jika menyentuh UI, lampirkan tabel screenshot Before | After langsung di body PR (bukan di dalam `<details>`)

## Evidence

**Before:** <output test gagal / keadaan sebelum perubahan>
**After:** <output test hijau / keadaan sesudah perubahan>

## Screenshots UI (wajib jika ubah UI)

| Before | After |
| --- | --- |
| ![before](tempel-gambar-sebelum) | ![after](tempel-gambar-sesudah) |

## Merge Danger

**Door:** one-way atau two-way (hapus yang tidak sesuai).

**Blast Radius:** <satu baris: peran atau rute yang terdampak + apa yang bisa rusak jika perubahan ini gagal>

## Checks Lokal yang Sudah Jalan

**Static (`check-types`, `lint`, `check:loc`, `build`):** <lulus / gagal + catatan>
**Formal & Unit (`verify:formal`, `web test`):** <jumlah kasus terverifikasi + lulus / gagal>
**Keamanan & Integritas (RLS, hash chain, tanpa em-dash / token UI):** <lulus / tidak menyentuh>
**E2E Lokal (jika ubah flow):** <skenario yang dijalankan / tidak menyentuh>
