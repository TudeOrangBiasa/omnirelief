# Design OmniRelief — satu-satunya doc yang dibuka saat kerja UI

Nilai (satu-satunya kebenaran): `packages/ui/src/styles/globals.css`
(`:root` + `@theme inline` + `.t-*` + `.garis-rambut` + `.animate-enter`).
Asal gaya: rre.com — capture `docs/referensi/rre/baru-*` (13 file) + catatan
`docs/desain/rre-0*.md`; rincian jakub.kr/details-that-make-interfaces-feel-better.
Aturan repo: `AGENTS.md` butir 9–11; istilah `GLOSSARY.md`.

Tiga kata: **napas** (ritme lega 128/64), **datar** (flat, garis rambut,
tanpa elevasi), **sorot-tunggal** (satu highlight primer per layar).

## Asal gaya (rre.com — pola yang ditiru, bukan warnanya)

1. Satu grotesk di semua peran; headline kontras lewat ukuran + letter-spacing
   negatif, bukan bobot tebal.
2. Kartu editorial datar: pemisah = whitespace/garis rambut; judul = ukuran body.
3. Hierarki dari ukuran (featured 480px vs thumb 80px), bukan warna/elevasi.
4. Filter = radio tersamar label uppercase; aktif = blok muda + teks gelap.
5. Seluruh kartu/baris diklik ke detail (navigasi penuh, bukan modal).
6. Footer tiga lapis: navigasi resmi + langganan + kontak + login portal.
7. Label tipe uppercase tanpa pill untuk daftar editorial (bukan status).
8. Tidak diambil: mode gelap, radius/gap 0, reveal-on-scroll, foto dramatis,
   label status polos, feed tanpa tanggal.

## Langkah kerja UI baru

1. Token saja — kelas semantik (`bg-primary`, `t-h1`, `section-napas`,
   `garis-rambut`); nol hex, nol arbitrary, nol bayangan kustom.
   Selesai bila `grep` pola `#[0-9a-f]` dan `shadow-` di file baru nihil.
2. Rakit dari komposit (§Komponen) — butuh varian baru? Tambah status/prop,
   jangan fork file. Warna baru dilarang: petakan ke token.
   Selesai bila tidak ada file `_components` yang diimpor page lain.
3. Teks Indonesia + istilah GLOSSARY (`selisih`, `Perlu Dicek`,
   `ketidaksesuaian`, `konfirmasi terima`, `MNF-*`, `DNT-*`).
   Selesai bila sapu istilah asing nihil.
4. Tiga state tiap daftar (Rangka/Kosong+aksi/error+muat-ulang);
   tiap form error `role="alert"` + sebut bidang; sentuh `min-h-12`.
   Selesai bila 4 aturan §Rasa butir 4–6 terpenuhi.
5. Bukti visual — screenshot browser tiap perubahan CSS/tata letak sebelum
   diklaim selesai. Selesai bila file bukti ada di `docs/bukti-ui/`.

## Rasa yang dijaga

1. Editorial terang: putih, permukaan `#f4f7fb`, teks `#232e40`, satu grotesk.
   Kartu datar radius 12–16, gap 16–24. Hierarki dari ukuran + napas, bukan
   bobot tebal; judul kartu = ukuran body.
2. Judul `.t-balance`, paragraf `.t-pretty`; angka berubah `.t-angka`;
   radius konsentris (luar = dalam + padding); ikon disejajarkan optis.
3. Gerak: transisi untuk interaksi (bisa diinterupsi); `.animate-enter` +
   `--stagger` hanya adegan sekali-jalan; keluar lebih halus dari masuk;
   tunduk `prefers-reduced-motion`. Foto selalu `.bingkai-foto`.
4. Tepat satu sorotan primer per layar (CTA navy ATAU banner kritis).
   Merah: selisih/Perlu Dicek/revisi/tolak/batal/danger. Kuning: FEFO ≤ 7 hari,
   draf, ketidaksesuaian. Hijau: Aman/Diterima/Disetujui/Terkunci.
   Netral: draf/menunggu/sinkron. Info/bantuan = tint biru. Semua + label teks.
5. Keterbacaan: satu H1 per layar; baris baca ≤ 75 karakter; label kecil hanya
   metadata; kontras AA (lantai warning 4.80 / success 4.84 — jangan gelapkan
   tint tanpa fg-nya); badge ≥ 3.0.
6. Fokus layar 1-2-3: status/kode dulu, angka kedua, riwayat/aksi ketiga.
   Landing: H1+kolom kode, CTA, statistik. Detail: badge status, angka, timeline.

## Komponen (props tertutup, satu file per modul)

Primitif (`packages/ui`, tanpa domain): Tombol (`lapang` = min-h-12 default),
Masukan/AreaTeks/Pilih/Label (+`kesalahan?`), Lencana (hanya via StatusBadge),
Kartu, Kosong (aksi wajib), Rangka, Umpan, Saklar, DialogKonfirmasi
(pengganti `window.prompt`), BilahSisi/Tajuk.
Komposit (`apps/web/src/components/domain|shell`, data via props, dilarang
impor navigasi/auth/fetch): StatusBadge (union tertutup + selisih/antre),
KartuPosko, TimelineHash (tanpa edit/hapus apa pun), ProgressAlokasi,
BannerOffline (+deep-link pengaturan), BottomNav (≤4 tab + Lainnya, badge
99+, sembunyi di detail/formulir), StepperAngka (rem-based), TabelPeran
(sortir/cari/paginasi/50 per halaman/ekspor; aksi kritis inline, tanpa hover).
Ikon: satu-satunya `@solar-icons/react` (ADR-0006, larang lucide); impor dari `@solar-icons/react/linear`, aktif navigasi dari `@solar-icons/react/bold-duotone`; default global (`size`, `strokeWidth`) di `SolarProvider`, tanpa `size`/`strokeWidth` repetitif; nama diverifikasi dari `dist` paket terpasang.
Upper (`app/<route>/_components`): rakitan spesifik 1 page; dilarang diimpor
page lain; validasi murni tetap di `lib/validasi.ts`.

## Pages (sections berurutan → sorotan)

`/` hero+kode+CTA, statistik, 4 janji, 3 langkah, footer, CTA bawah.
`/transparansi` filter/cari, kartu selisih + badge, empty+reset.
`/m/[kode]` header TERKUNCI+QR+salin, tabel item-batch, timeline, kartu
batal/merah + ketidaksesuaian/kuning. `/s/[kode]` header+izin sumber,
progress "X dari Y", daftar pemakai. `/masuk` judul, email+password+ingat,
error per bidang, info demo, redirect. `/beranda` sapaan+ringkasan,
angka hero, aksi primer, aktivitas 5 baris. `/bpbd` metrik+refresh,
Perlu Dicek persisten, tabel antrean massal+3 putusan, batang+prioritas+ekspor,
Buat Manifest. `/bpbd/kirim` posko, tabel batch FEFO sebelum draf,
peringatan kuning, kunci→MNF+QR. `/gudang` intake, hasil DNT hijau sesaat,
tabel batch, empty+CTA. `/posko` snapshot 6 angka, banner verifikasi,
status jatah, terima, lapor 5 jenis. `/tim` tugas+batas, check-in,
kendala/darurat konfirmasi, offline + kirim-sekarang. `/pengaturan`
akun→profil, notifikasi, `#aksesibilitas` (teks 3 tingkat, kontras tinggi,
kurangi gerakan), bantuan, legal+versi, zona Keluar. `/profil` identitas,
password+reauth, konfirmasi. `/admin` desktop: pemakaian+ekspor, user,
log audit, danger ketik.

## Verifikasi (cek sebelum klaim selesai)

- Screenshot browser tiap layar berubah (`docs/bukti-ui/`).
- Harness throwaway untuk 26 skenario: badge panjang/wrap/shrink-0/99+/
  tumpuk-2+`+1`; kartu nama-100-karakter/angka-9-juta/0-dan-100/grid-320;
  timeline alasan-500/hash-pendek/100-baris/320px/kartu-campur;
  progress 0–100–over/50-pemakai/header-320; banner 1240-antre/sticky-tidak-
  tutup-CTA; tab `Transparansi`+99+/sheet-9/aktif-bukan-warna-saja;
  stepper abc/-5/disabled-terkunci; tabel sel-panjang/1240-baris/sortir-1024.
- Tanpa harness (unit/review cukup): `Kurang 0 → Aman`; copy empty/error/
  offline; `aria-sort`/`aria-current`; skeleton baku; `Kurang 0` logika.
- Selalu dibuang: dark-mode, haptic, profil publik/bio.
- `Can't tell` tersisa: haptic tab (uji perangkat), render akhir kontras/fokus.

## Rujukan dalam (buka hanya bila cabangmu butuh)

- Angka + metode kontras: `docs/desain/token-warna-oklch.md`.
- Contoh pemakaian komposit per page: `arsitektur-komponen.md` §1.
- Tabel page→checklist→temuan (65 item): `pemetaan-checklist.md` §11.
- Skenario penuh 41: `uji-tekan.md`. IA + tiket: `arsitektur-pages.md`, `tiket.md`.
