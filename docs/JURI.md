# Panduan juri

Mulai dari sini untuk menilai OmniRelief. Bukti tiap kriteria ada di `docs/GOALS.md`. Peta halaman ada di `docs/PAGES.md`. Istilah produk ada di `GLOSSARY.md`.

## Cek publik tanpa login

Empat rute bisa dibuka tanpa akun.

1. `/` berisi form cek kode `MNF` dan `DNT`, KPI, cara kerja, dan FAQ.
2. `/transparansi` berisi kartu per posko: butuh, dikirim, diterima, badge Kurang merah atau Aman hijau.
3. `/m/[kode]` berisi detail manifest: badge terkunci, tabel item dan batch, timeline riwayat, QR, kartu pembatalan dan ketidaksesuaian. Tidak ada tombol edit atau hapus.
4. `/s/[kode]` berisi detail sumbangan: kode, progress alokasi, daftar manifest pemakai.

## Cek peran dengan akun demo

Daftar akun ada di `docs/SETUP.md`. Peran yang tersedia: BPBD, gudang, dua posko, tim, admin. Kata sandi dibagikan lewat jalur internal.

1. Posko kirim laporan penyintas lalu pantau status verifikasi di `/posko`.
2. BPBD verifikasi dengan tiga putusan di `/bpbd`, lalu buat dan publikasikan manifest di `/bpbd/kirim`.
3. Gudang catat sumbangan dan terima kode sumbangan di `/gudang`.
4. Tim perbarui status dan kirim check-in di `/tim`. Keterlambatan kabar memicu status Perlu Dicek di dashboard BPBD.

## Cek anti manipulasi

Acuan uji ada di Bab 16.5 dokumen tim (`docs/OmniRelief-Dokumen-Tim-Lengkap.pdf`).

1. Coba update manifest terpublikasi lewat API dan lewat SQL langsung. Keduanya harus gagal.
2. Ubah satu angka lalu verifikasi hash chain. Verifikasi harus gagal.
3. Buka halaman publik tanpa login. Semua tampil tanpa data pribadi.

## Bukti kriteria

Sembilan kriteria juri dan buktinya dirinci di `docs/GOALS.md`. Contoh bukti: uji `validasiLaporan` dan `validasiVerifikasi`, uji rantai hash, tangkapan `/posko` dan `/bpbd`, snapshot `/m/[kode]`, uji antrean offline. Budget teknik: E2E 3 alur kritis, coverage 80 persen modul murni, halaman publik di bawah 1,5 MB.
