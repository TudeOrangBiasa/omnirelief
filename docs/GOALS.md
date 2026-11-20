# Goals verifikasi

Sumber: Bab 15 dokumen tim. Tiap kriteria juri punya bukti. Kolom Live hijau hanya setelah project Supabase hidup dan skrip Bab 16.5 lolos.

## Kriteria juri

1. Donatur dapat kode sumbangan dan melacak alokasinya. Bukti: `/s/[kode]` tampil di produksi plus uji rantai hash.
2. Posko input penyintas dan lihat status verifikasi. Bukti: 5 uji `validasiLaporan` plus tangkapan `/posko`.
3. BPBD setujui, revisi, tolak, dan lihat prioritas. Bukti: uji `validasiVerifikasi` plus tangkapan `/bpbd`.
4. BPBD buat draf dan publikasikan jadi QR. Bukti: uji hash sama dengan seed plus tangkapan `/bpbd/kirim`.
5. Manifest terpublikasi tanpa tombol edit atau hapus, database menolak update dan delete. Bukti: snapshot `/m/[kode]` tanpa tombol plus skrip RLS Bab 16.5.
6. Halaman publik tampilkan detail plus timeline riwayat. Bukti: snapshot `/m/[kode]` dan `/transparansi`.
7. Tim update status plus check-in, telat memicu Perlu Dicek. Bukti: uji antrean offline plus tangkapan `/tim` dan `/bpbd` seksi Perlu Dicek.
8. Posko konfirmasi terima atau lapor ketidaksesuaian yang tampil publik. Bukti: tangkapan seksi bantuan plus kartu kuning di `/m/[kode]`.
9. Data offline tersimpan sebagai Menunggu Sinkronisasi lalu terkirim otomatis. Bukti: 3 uji antrean plus uji manual mode offline.

## Budget teknik

1. E2E 3 alur kritis: buat plus publikasi plus cek publik, antar plus check-in plus terima, lapor rusak tampil publik. Butuh Supabase hidup.
2. Coverage 80 persen untuk modul murni `apps/web/src/lib`. Perintah: `bun --filter web test`.
3. Halaman publik di bawah 1,5 MB sesuai U6. Cek via build output dan tab jaringan.

## Perintah gerbang

```bash
bun run check-types
bun --filter web test
bun --filter web lint
bun run check:loc
bun run build
```
