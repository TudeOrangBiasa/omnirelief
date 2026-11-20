# Ikon tunggal Solar, larang lucide

Dipilih `@solar-icons/react` sebagai satu-satunya pustaka ikon di `apps/web` dan `packages/ui`; impor `lucide-react` dilarang dan dependensinya dicabut dari kedua paket. Alasan: satu bahasa garis (Linear 2px via `SolarProvider` global) agar bobot ikon konsisten di semua layar, dan varian `BoldDuotone` khusus status aktif navigasi memberi sorotan kedua selain warna+bobot teks. Nama komponen wajib diverifikasi dari `dist/icons/style/*.mjs` paket terpasang sebelum dipakai, karena ejaan Solar menyimpang (`Magnifier`, `WiFiOff`, `Lifebuoy` tidak ada — pakai `Help`).

## Considered Options

Bertahan di lucide ditolak karena dua set ikon dalam satu repo mengembalikan masalah dua bahasa visual yang sudah diputus di ADR-0005. Menggambar SVG tangan ditolak karena menambah aset biner tanpa nilai juri dan rawan inkonsistensi goresan.
