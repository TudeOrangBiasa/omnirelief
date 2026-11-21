# Durabilitas operasional OmniRelief

Sumber: peta mode kegagalan + pola termurah (swarm scout, read-only, Nov 2026).
Acuan: `pemetaan-checklist.md`, `uji-tekan.md`. Prinsip: tanpa dependensi baru,
tulis tetap via API route service role, riwayat tetap append-only.

## P0 — sebelum operasi nyata (~2-3 jam)

1. **Antrean offline berbatas.** Cap 50 item + tolak dengan toast jelas,
   tambah jenis `konfirmasi`/`ketidaksesuaian` (hari ini `bantuan.tsx` gagal
   luring tanpa jejak), replay aman saat 409 final, validasi ketat baris korup.
   Berkas: `lib/offline.ts`, `posko/bantuan.tsx`, `api/posko/konfirmasi`.
2. **Fetch berbatas waktu.** Helper `lib/fetch.ts` (timeout 8 dtk, retry GET,
   tanpa retry POST buta) dipakai di 3 muat kritis (BPBD, tim, posko);
   `dasbor.tsx` `Promise.all` jadi `allSettled` + render parsial per panel.
3. **Sesi berakhir dengan jelas.** `proxy.ts` tambah `?next=`, halaman bedakan
   401 (masuk ulang, antrean lokal tetap tersimpan) dari 500, jangan hapus
   antrean saat 401.
4. **Zona waktu check-in.** Simpan `batas_checkin` sebagai ISO ber-offset,
   bandingkan selalu via `getTime()`, tolak `batas_checkin` lampau di validator.
   Tanpa ini status Perlu Dicek meleset 7-9 jam di Indonesia timur.

## P1 — minggu operasi 1 (~3-4 jam)

5. **Idempotensi ujung-ke-ujung.** `Idempotency-Key` per niat-klik untuk
   terima, publikasi, catat, kirim; server kembalikan respons lama untuk kunci
   sama (mulai dari konfirmasi terima yang sudah setengah jalan via 409).
6. **Kesegaran seragam.** Stempel `Diperbarui HH:MM` + tombol muat ulang di
   transparansi dan beranda (ikuti pola dasbor); tulis sukses selalu `muat()`
   dulu sebelum toast.
7. **Paginasi klien + label jujur.** `slice` + `Muat 20 lagi` + teks
   `1-20 dari N` di transparansi/antrean/prioritas/batch; labeli limit API
   yang ada ("20 terbaru"); param server menyusul bila N > 500.
8. **Mode baca-lokal.** Simpan muat-terakhir-baik di localStorage; saat gagal
   tampilkan cache + badge netral + matikan tombol tulis.
9. **Galat yang memandu.** Bedakan 400 (perbaiki input) / 401 (masuk ulang) /
   409 (sudah selesai, muat ulang) / 500 (coba lagi); 409 status tim
   auto-`muat()` + info, bukan toast error.

## P2 — penguatan (~2-3 jam)

10. Replay darurat didahulukan; auto-refresh saat tab kembali fokus.
11. Versi SW naik tiap rilis + tanggal build di Pengaturan (cache basi
    permanen hari ini); `qrcode` lazy-import agar halaman publik ringan.
12. Ingat-saya yang jujur: masa berlaku terlihat, atau hapus checkbox bila
    tetap default Supabase. Draf form tersimpan lokal sebelum redirect login.
13. Samakan pesan validasi client/server (impor validator tunggal);
    perbandingan tanggal lokal vs UTC disatukan.

## Bukan target

Validasi server sudah benar (pola `validasi.ts` murni dipertahankan).
SSO, sign-up publik, hapus akun mandiri tetap dinilai tidak perlu.
Date-range analitik dan kustomisasi layout tetap tidak dibutuhkan operasi
real-time.
