# RRE-03 — Tim: kartu orang + grid + detail bio

Referensi: https://rre.com/team (daftar), https://rre.com/team/jim-robinson (detail).
Screenshot: `docs/referensi/rre/baru-03-full.png` (daftar full-page),
`docs/referensi/rre/baru-03-card.png` (grid kartu, setelah scroll),
`docs/referensi/rre/baru-03-bio.png` (detail bio full-page).
Metode token: `agent-browser eval` atas computed style (font, warna, grid, rect foto).
Gagal diambil: nilai `gap` grid (terlapor `normal` = 0, bentang kolom 300px rapat tanpa celah);
aturan hover kartu (tidak ada rule `:hover` khusus kartu di stylesheet — hanya link biasa).

## Copy (ringkas, bukan salinan)
- H1: "Team". Tanpa subjudul/intro — langsung grid orang.
- Kartu: Nama (mis. "James Robinson") + peran kapital kecil (mis. "FOUNDER AND GENERAL PARTNER").
  15 orang, dari Founder/General Partner sampai Receptionist, tanpa pengelompokan divisi.
- Detail: H1 nama (56px) + H2 peran (15px) + lead bio 32px satu kalimat,
  lalu tombol topik (AI, CONSUMER, CRYPTO, ENTERPRISE/SAAS, FINTECH, HEALTHCARE, MEDIA)
  + tautan X/LinkedIn pribadi.

## Pola kartu orang
- Kartu = satu `<a class="team_card-wrap">` ke `/team/<slug>`; seluruh kartu bisa diklik.
- Foto di atas, teks di bawah rata kiri: nama 20px putih + peran 12px putih uppercase.
- Foto: persegi 1:1 (±300px di grid, 560px di detail), AVIF, `overflow: clip`,
  radius 0, tanpa grayscale/filter (`filter: none`), tanpa overlay.
- Klik → navigasi penuh ke halaman detail, bukan modal/expand-in-place.
- Reveal: kartu mulai `opacity: 0; translate(0%,30%)` + foto `clip-path: inset(0 0 100%)`,
  teranimasi masuk saat scroll (Webflow). Tanpa JS animasi kartu tak terlihat —
  pola ini rapuh; jangan ditiru mentah-mentah.

## Grid
- `.team_cms-list`: CSS grid 4 kolom × 300px di desktop (`300px 300px 300px 300px`),
  tanpa gap (kartu rapat). Peta ke OmniRelief terang: pakai gap 16–24px agar kartu
  terang tidak menyatu.
- Latar daftar gelap pekat `#07020A` (rgb 7,2,10); teks kartu putih.
- H1 "Team": 56px, "RRE Monument Grotesk Trial", warna terang di atas gelap.

## Detail bio
- Panel terang di atas halaman gelap: `number_component` bg `#D3E7F1`
  (biru-abu terang), teks hampir-hitam `#07020A`.
- Tipografi: nama 56px / peran 15px / lead bio 32px, satu family yang sama.
- Foto 1:1 besar (560px) berdampingan dengan teks (layout dua kolom).
- Peta ke OmniRelief terang: detail bio sudah terang — tiru langsung pola
  panel terang + foto persegi + peran kecil uppercase.

## Peta ke OmniRelief terang
- Kartu peran operasional: nama → nama petugas; peran → fungsi
  (BPBD = verifikasi, gudang = batch/manifest, posko = konfirmasi terima,
  tim = check-in). Satu kartu satu peran, tanpa gabung antar posko.
- Halaman profil operasional: tiru struktur detail (nama + peran + satu kalimat
  tugas + kontak jalur darurat), bukan riwayat hidup panjang.
- Tanpa foto = avatar inisial (lingkaran, inisial nama, bg netral) —
  rre selalu berfoto; kita tidak boleh memaksa foto personel.
- Latar: rre gelap `#07020A` → kita terang (putih/krem); kartu putih dengan
  bingkai tipis + nama gelap + peran abu, bukan teks putih.
- Grid 4×300px rapat → 2–4 kolom responsif dengan gap 16–24px;
  tanpa foto dramatis, tanpa animasi hide-sebelum-scroll (render langsung terlihat).
