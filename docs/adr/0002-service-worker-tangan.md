# Service worker tangan

Butuh PWA dasar: cache halaman publik dan aset `_next`. Dipilih service worker 40 baris tanpa dependensi karena Serwist belum pasti cocok dengan Turbopack di Next 16, dan kebutuhan tidak sampai ke precache build-time. Kalau butuh background sync betulan, ganti Serwist dan catat di sini.
