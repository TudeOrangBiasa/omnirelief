# RRE-02 Portfolio — pola kartu + grid + filter

Sumber: https://rre.com/portfolio (diakses 2026-11-20, sesi agent-browser `rre-portfolio-*`).
Screenshot: `docs/referensi/rre/baru-02-full.png` (full-page), `baru-02-grid.png` (grid kartu, state Featured), `baru-02-filter.png` (state filter AI aktif).
Copy hero: "Ideas matter. But we back people first — early-stage founders with the vision, conviction, and imagination to reshape their industries…" + H1 "Portfolio".

## 1. Pola kartu perusahaan

Struktur DOM per kartu (`.portfolio_company-card.is-filtered`):
`img.portfolio_company-logo` + `div.portfolio_company-info` > `h3[name]` + `div.portfolio_investment` > daftar `.portfolio_category[category]` (satu perusahaan bisa multi-kategori, mis. "AI" + "Enterprise/Saas"). Kartu tidak berisi `<a>`; seluruh kartu `cursor: pointer` (klik membuka detail — terverifikasi via pointer, URL tujuan tidak diintrospeksi).
- Kartu: `background: rgb(7,2,10)` (menyatu dengan body), pemisah antar-kartu hanya `border-top: 1px solid #fff`, `border-radius: 0`, padding `36.8px 16px 24px 32px`, layout kolom `flex` dengan `gap: 56px` (jarak logo → blok info besar, napas lega).
- Logo: `max-width: 100%`, dimensi terukur 0×0 saat lazy-load di luar viewport (gagal diambil — gambar `*.avif` lazy; pola visual: logo monokrom kecil di atas nama).
- Nama perusahaan (`h3.text-size-regular`): RRE Monument Grotesk Trial, 20px, weight 400, putih. Contoh: "Bark (NYSE: BARK)" — status publik ditulis langsung di nama.
- Kategori: 12px, uppercase, weight 400, putih, tanpa pill/badge (teks polos di bawah nama).
- Hover: tidak diukur (gagal diambil — perlu hover + re-read computed style; pola teramati tidak ada perubahan radius/bg).
- Peta ke OmniRelief terang: kartu posko memakai struktur sama (logo/inisial posko → nama posko 20px semibold → baris kategori), tetapi di atas kartu terang (`--surface`, radius 12–16px) dengan pemisah berupa gap grid, bukan garis putih; badge status Kurang/Aman menggantikan teks kategori polos — badge berbentuk pill kecil (12px, uppercase) karena di rre kategori mudah terlewat mata. Klik seluruh kartu membuka detail posko (sesuai GLOSSARY: posko = titik distribusi bantuan).

## 2. Pola grid

- `.portfolio_company-list`: `display: grid`, 3 kolom sama lebar (~315px di viewport desktop), `gap/row-gap/column-gap: 0` — jarak visual murni dari padding kartu + border-top.
- Jumlah: Featured ±18–24 kartu; filter "AI" menampilkan 58 kartu (grid tumbuh vertikal, tanpa paginasi teramati).
- Peta ke OmniRelief terang: grid kartu posko butuh/dikirim/diterima 3 kolom di desktop → 1 kolom di seluler, tetapi dengan `gap: 16–24px` nyata antar-kartu (bukan gap 0), karena kartu terang butuh bayangan/pemisah sendiri; ritme vertikal section mengikuti padding kartu rre (±32px sisi, ±24–36px vertikal).

## 3. Pola filter kategori

- Kontrol berupa radio tersamar sebagai label teks: Featured, AI, Consumer, Crypto, Enterprise/Saas, Fintech, Hardware, Healthcare, Media, Robotics, Space (+ "ALL"); label 20px uppercase Monument Grotesk, `cursor: pointer`, tanpa border/radius.
- Status aktif ditandai blok highlight: `background: rgb(211,231,241)` (biru es muda) + teks gelap `rgb(7,2,10)`; non-aktif teks putih transparan bg. Terverifikasi interaktif: klik "AI" mengubah grid (Featured → 58 kartu AI: 1up, Anomaly, Anto…); klik "Featured" mengembalikan.
- Ada kolom pencarian teks (`input.portfolio_search`, Finsweet `fs-list-field="*"`, placeholder kosong) di samping filter.
- Peta ke OmniRelief terang: filter status/kebutuhan posko meniru pola ini — radio tersamar sebagai tab teks uppercase; tab aktif memakai blok warna aksen muda + teks gelap (bukan outline saja) agar terbaca di tema terang; sediakan juga kolom cari nama posko seperti `portfolio_search`.

## 4. Token desain (metode: `agent-browser eval` computed style)

| Token | Nilai rre | Catatan |
|---|---|---|
| bg halaman | `rgb(7,2,10)` (ungu-hitam) | body |
| teks | `#fff` | body |
| aksen terpilih | `rgb(211,231,241)` (biru es) | bg label filter aktif |
| font | `"RRE Monument Grotesk Trial", Arial, sans-serif` | seluruh halaman |
| H1 "Portfolio" | 56px / 400 / `-2px` letter-spacing | |
| Nama kartu | 20px / 400 / putih | |
| Kategori | 12px / uppercase / 400 / putih | |
| Radius | 0 di kartu + pill filter | |
| Pemisah kartu | `border-top: 1px solid #fff` | |

Gagal diambil: dimensi logo (lazy-load 0×0), gaya hover kartu, warna fokus aksesibilitas radio.
