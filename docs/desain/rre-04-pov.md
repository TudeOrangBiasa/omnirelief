# RRE-04 — POV: kartu konten + label tipe + footer

Referensi: https://rre.com/rrepov (daftar sudut pandang: podcast).
Screenshot: `docs/referensi/rre/baru-04-full.png` (full-page),
`docs/referensi/rre/baru-04-card.png` (satu baris episode, setelah scroll),
`docs/referensi/rre/baru-04-featured.png` (visual besar RRE:POV, `.podcast_image` 480×480).
Metode token: `agent-browser eval` atas computed style (font, warna, ukuran, grid, rect).
Gagal diambil: nilai `gap` grid (kolom terlapor eksplisit, tanpa gap bermakna);
aturan hover baris (tidak ada rule `:hover` khusus — hanya link biasa);
gaya bingkai tombol platform (border CSS `0px none` — sudut evidenced "bracket"
dibuat dari gambar/SVG sudut, bukan border CSS, jadi tidak bisa dikutip sebagai token border);
tanggal episode (tidak ada tanggal di daftar — cek regex bulan/tahun atas body text: nihil).

## Copy (ringkas, bukan salinan)
- H1: "RRE POV" + sublabel "Podcast".
- Intro: satu paragraf — percakapan internal RRE + portofolio, host Will Porteous
  dan Raju Rishi, topik satelit, kesehatan digital, venture investing, dst.
- Distribusi: tiga tombol APPLE / SPOTIFY / TRANSISTOR (link keluar:
  podcasts.apple.com, open.spotify.com, feeds.transistor.fm).
- "Latest Episodes": hanya 2 baris saat ditangkap —
  "Unpacking Anthropic's S-1" dan "The AI Model Wars: Why One Winner Won't Take All"
  (link keluar ke podpage.com). Tanpa tanggal, tanpa deskripsi, tanpa durasi.
- Footer: tautan besar Home/Portfolio/Team; sitemap kecil (RRE POV, BLOG, X,
  LINKEDIN, JOBS); form "SUBSCRIBE TO RECEIVE NEWS AND UPDATES" +
  placeholder "Your Email Address" + tombol SUBSCRIBE; INFO@RRE.COM;
  alamat 130 E 59TH ST NEW YORK, NY + 5355 TOWN CENTER ROAD BOCA RATON, FL;
  tombol LIMITED PARTNER LOGIN / GENERAL PARTNER LOGIN (gpportal.com).

## Pola kartu konten
- Baris = satu `<div class="blogs_item w-dyn-item" role="listitem">` berisi
  `<a class="global_grid is-blog">` ke halaman episode; seluruh baris bisa diklik.
- Isi baris (kiri → kanan): thumbnail persegi 80×80 (`IMG.podcast_grid-image`,
  artwork RRE:POV) + judul H3 20px rata kiri + label tipe rata kanan.
- Judul: `H3.text-size-regular`, 20px, non-uppercase, putih.
- Label tipe: `DIV.text-size-small text-style-allcaps`, 15px, uppercase
  ("PODCAST" di kedua baris). Tanpa badge/pill — teks polos rata kanan.
- Pemisah baris: bukan border pada item (border item `0px none`); garis berasal
  dari `DIV.grid-horizontal-border is-blog` di dalam link. Radius 0 di semua level.
- Tinggi baris terukur ±80px, bentang konten x=80 lebar 1120 (rect browser 1280).
- Tidak ada varian visual BLOG/NEWS di halaman ini — pola label siap menampung
  tipe lain (satu label kapital kecil per baris).

## Hierarki list vs featured
- Featured bukan episode unggulan — visual merek besar `.podcast_image`
  (480×480, PNG "RRE POV1") di kanan intro, sejajar paragraf + tombol platform.
  Fungsinya identitas acara, bukan sorotan konten.
- Daftar ("Latest Episodes") di bawah, gaya baris ramping tanpa kartu berbingkai —
  hierarki dibentuk oleh ukuran (featured 480px vs thumb 80px), bukan oleh
  warna/elevasi. Featured = merek; list = isi.
- Peta ke OmniRelief terang: featured merek → panel identitas posko/command center
  (nama + logo + kontak), bukan foto dramatis; list ramping → feed riwayat.

## Footer
- Tiga lapis: (1) navigasi besar 56px (Home/Portfolio/Team) + marka RRE raksasa
  sebagai latar; (2) sitemap kecil + form subscribe satu baris (input email 20px
  transparan + tombol SUBSCRIBE sudut-bracket); (3) kontak — email, dua alamat
  fisik, dua tombol login mitra (LP/GP, sudut-bracket, link keluar gpportal).
- Warna footer = warisan halaman: teks putih di atas `#07020A`, tanpa panel
  pembeda. Input tanpa border CSS (border 0) — bingkai digambar elemen dekoratif.
- Peta ke OmniRelief terang: tiru tiga lapisnya (navigasi resmi + subscribe/
  notifikasi + kontak command center + login peran), bukan gayanya —
  footer resmi terang: tautan gelap, input berbingkai nyata, login
  peran operasional (verifikator/gudang/posko), alamat command center.

## Token (terukur)
- Latar: `rgb(7,2,10)` ≈ `#07020A`; teks: putih `rgb(255,255,255)`.
- Font: `"RRE Monument Grotesk Trial", Arial, sans-serif` di semua level.
- H1/H2: 56px/56px w400, letter-spacing −2px.
- Judul kartu H3: 20px; label tipe: 15px uppercase; tombol platform: 15px
  uppercase, padding 12px 16px; input email: 20px; tautan footer besar: 56px.
- Radius: 0px di mana-mana (kartu, label, input, tombol).
- Ritme: baris 80px + thumb 80px; hero marmer-gelap penuh lebar → konten
  di atas `#07020A`; footer menempel tanpa sekat panel.

## Peta ke OmniRelief terang
- Timeline riwayat manifest = feed: tiru baris ramping (thumb kecil + judul +
  label kanan) untuk entri riwayat manifest/bantuan — satu baris satu kejadian,
  seluruh baris bisa diklik ke detail, tanpa kartu berbingkai berat.
- Label tipe = badge status: label kapital-kecil kanan ("PODCAST") → badge status
  operasional (mis. DITERIMA / VERIFIKASI / DISALURKAN) — bedanya kita perlu
  badge berpill berwarna agar status terbaca sekilas, bukan teks putih polos.
- Tanpa tanggal di rre → kita wajib ada: tiap baris feed menampilkan
  tanggal-waktu kejadian (rre podcast abadi; logistik tidak).
- rre gelap `#07020A` → kita terang: baris putih/krem, judul gelap, thumb
  diganti ikon jenis-kejadian (bukan artwork), garis pemisah abu tipis nyata.
- Footer resmi + kontak command center: adopsi tiga lapis (navigasi + langganan
  notifikasi + email/alamat command center + login peran), gaya terang resmi.
