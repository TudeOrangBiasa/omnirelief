# rre.com vs OmniRelief — perbandingan 1:1 bersumber primer

- Tanggal ukur: 2026-11-22 (UTC). Sesi agent-browser sendiri: `riset-rre-*` (tidak menyentuh `omnirelief-*`).
- Metode browser: `agent-browser open` + `agent-browser eval` → `getComputedStyle()` per selektor + `getBoundingClientRect()` untuk gutter, di dua viewport via `agent-browser set viewport 1440 900` dan `390 844`.
- Catatan jujur: flag `screenshot --full-page` tidak didukung CLI ini (argumen dibaca sebagai path), jadi bukti gambar berupa screenshot viewport `/tmp/rre-1440.png` (1440×900) dan `/tmp/rre-390.png` (390×844); tinggi section/padding diverifikasi via `eval`, bukan dari gambar full-page.
- Dev server `http://localhost:3000/` dan `/transparansi` hidup (keduanya HTTP 200 via curl) dan diukur dengan metode yang sama.
- Aturan main: tiap angka 1:1 berpasangan dengan sumber; tiap aturan docs dikutip verbatim + path:baris. Klaim tanpa sumber = gagal.

## 1. Tipografi (angka 1:1)

| Dimensi | rre.com (primer: `eval` getComputedStyle, 2026-11-22) | OmniRelief `/` (primer: `eval` getComputedStyle, 2026-11-22) | Verdict + penyebab |
|---|---|---|---|
| H1 desktop 1440 | `h1`: 80px / lh 88px / weight 400 / ls -4px / putih `rgb(255,255,255)`; teks "Backing the best for the distance" | `h1.t-display`: 80px / lh 88px / weight **700** / ls -4px / primer `rgb(58,83,141)` (`#3a538d`); teks "Tiap paket tercatat, tiap posko terlihat"; kelas verbatim `t-display t-balance font-bold text-primary` | DEKAT (ukuran + ls identik; beda bobot 400→700 dan warna putih→primer — penyebab: token terang + pilihan implementasi `font-bold` di hero, padahal `packages/ui/src/styles/globals.css:189-194` mengunci `.t-display` weight 400) |
| H1 mobile 390 | `h1`: 48px / lh 52.8px / ls -2px; gutter 20px, lebar 350px; hero pad 48px/64px | `h1`: 40px / lh 44px; gutter 20px, lebar 350px | DEKAT (gutter identik 20px; H1 OmniRelief 8px lebih kecil — penyebab: `clamp(2.5rem, 6vw, 5rem)` di `globals.css:53`, 6vw dari 390px = 23.4px → lantai 40px, bukan tiruan titik rre) |
| H2 section | `h2`: 56px / lh 56px / ls -2px / weight 400 ("The confidence to commit early") | `h2`: 40px / lh 46px / ls -1.4px / weight 700 ("Uang dan barang publik…") | DEKAT (pola ls negatif dipertahankan; angka lebih kecil — penyebab: `--text-h2: clamp(1.5rem, 3vw, 2.5rem)` di `globals.css:55` + `font-bold` implementasi vs `.t-h2` weight 400 di `globals.css:201-206`) |
| Body | `body`: 20px / lh 28px / weight 400; family `"RRE Monument Grotesk Trial", Arial, sans-serif`; bg `rgb(7,2,10)`, teks putih | `.t-body`: 20px / lh 28px (`1.25rem/1.75rem` di `globals.css:207-210`); family `"Inter Variable", sans-serif` (`globals.css:75`); bg `#ffffff`, teks `#232e40` (`globals.css:9-10`) | SAMA (ukuran + lh identik; family/bW dibalik sesuai peta terang di `docs/desain/rre-01-beranda.md:18-20`) |
| Mikro/nav | Nav header `PORTFOLIO`/`TEAM`: 15px / weight 400 / tanpa text-transform (huruf kapital literal); CTA "our portfolio": 15px, padding 12px 16px, border 0, radius 0 | `.t-micro`: 12px (`0.75rem`), uppercase, ls `0.08em` (`globals.css:211-215`); tombol/filter shadcn `rounded-none`, shadow `none` (terukur di `/transparansi`: input/button `radius: 0px`, `shadow: none`) | DEKAT (pola "label uppercase kecil + CTA tanpa radius" ditiru; angka mikro 15px→12px + ls +0.08em — penyebab: peta di `rre-01-beranda.md:28-31`: "label segmen GLOSSARY uppercase 12–13px, ls +0.08em") |
| Stat/angka | Pita `$2.5B+ / 125+ / 400+` 56px / weight 400 (sumber: `docs/desain/rre-01-beranda.md:32-34`, capture 2026-11-20 — `eval` 2026-11-22 tidak menemukan node angka mandiri, dilaporkan apa adanya) | Pita statistik `/`: section `grid-cols-3 divide-x` pad 32px/32px (terukur); peta angka 56px → `clamp(32px, 4vw, 56px)` warna primer (`rre-01-berbeda.md:32-34` maaf — `rre-01-beranda.md:32-34`) | DEKAT (pola angka-besar + label-kecil + pemisah garis dipakai; tanpa foto/overlay — penyebab: larangan foto dramatis, lihat §4) |

## 2. Spasial: padding section, gutter, max-width (angka 1:1)

| Dimensi | rre.com (primer browser) | OmniRelief (primer browser + repo) | Verdict + penyebab |
|---|---|---|---|
| Hero padding desktop | `section.section_home-hero`: pad-atas 128px / pad-bawah 128px / pad-kiri 80px (`eval` 1440×900) | Hero `/`: pad-atas 80px (`pt-12 md:pt-20`) / pad-bawah 64px (`pb-16`); section `.section-napas`: 115.2px/115.2px (terukur; = `clamp(4rem, 8vw, 8rem)` di `globals.css:59`, 8vw×1440 = 115.2px) | DEKAT (ritual 128/64 rre dipetakan ke token `--space-section` di `globals.css:59`; hero aktual 80/64 karena memakai utilitas Tailwind, bukan `.section-napas` — variansi implementasi, bukan aturan) |
| Hero padding mobile | Hero: 48px atas / 64px bawah / kiri 20px (`eval` 390px) | H1 gutter 20px terukur; ritme mobile token 64px (`design.md:10` "napas (ritme lega 128/64)") | SAMA (20px gutter + 64px identik) |
| Gutter + max-width | Gutter konten 80px dari tepi di 1440 (lebar H1 480px, `max-width: none` — rre full-bleed ber-padding) | Gutter 248px di 1440 (konten di tengah, `main` max 1152px terukur; kandidat `.max-w-6xl` = 1152px, `.max-w-5xl` = 1024px); mobile gutter 20px | BEDA TERDOKUMENTASI (rre edge-to-edge 80px vs OmniRelief kontainer tengah 1152px — penyebab: keputusan IA dashboard-terang repo, bukan tiruan; rre `maxW: none` vs OmniRelief `max-w-6xl`) |
| Jeda antar-section | Section non-hero rre: pad 0/0 (rapat, tinggi 345–835px bervariasi, bg transparan kecuali satu `rgb(7,2,10)`) | `.section-napas` 115.2px simetris; statistik 32px/32px | DEKAT (OmniRelief menyeragamkan jeda; rre memakai tinggi konten bervariasi — penyebab: aturan `design.md:87-89`: "Separator tick kecil rata tengah (40px…) + padding atas-bawah seimbang; Jeda antar-zona seragam — diukur di browser") |

## 3. Kartu / editorial (angka 1:1)

| Dimensi | rre.com (primer browser) | OmniRelief (primer browser + repo) | Verdict + penyebab |
|---|---|---|---|
| Kartu editorial | bg transparan, radius 0px, shadow `none`, border `0px none` (terukur pada kartu induk tautan NEWS/PODCAST/BLOG) | shadcn Card terukur `radius: 0px`, `shadow: none`, border `1px solid rgb(215,221,231)` (= `--border #d7dde7`, `globals.css:44`); `.garis-rambut` = shadow cincin 1px `rgba(35,46,64,0.08)` + bayangan 1–2px (`globals.css:237-243`), menebal saat hover (`globals.css:244-249`) | SAMA POLA, BEDA ANGKA TOKEN (pola "datar, pemisah bukan elevasi" sama; radius repo 12–16 per `design.md:50-51` vs terukur 0px di komponen transparansi — implementasi shadcn `rounded-none` menyimpang dari token `--radius: 0.75rem` di `globals.css:52`; lihat §4) |
| Judul kartu = ukuran body | 20px = body 20px (rre-01-beranda.md:37-40) | Aturan `design.md:16,51`: "judul = ukuran body", "judul kartu = ukuran body" | SAMA (aturan diadopsi verbatim) |

## 4. Lapisan background hero + gerak (primer browser)

- rre.com: tidak ada `<video>` (0 node); 1 `<iframe>` embed video (`https://app.vidzflow.com/v/tU86pvvwPo?...&muted=true&loop=true&controls=false`, `eval` 2026-11-22). Rantai induk iframe: `DIV.page_bg_embed … pos=absolute` di dalam `DIV.page_bg-wrapper pos=fixed z=-1` — selektor verbatim dari `eval`. Hero `main section` `pos=relative`, bg transparan. Uji scroll: `top` wrapper tetap 0px pada scrollY 0/400/800 → **fixed, bukan parallax-gerak** (latar diam menempel viewport; konten menggulir di atasnya).
- OmniRelief `/`: hero terang tanpa video/embed (tidak ada iframe/video pada hero; satu-satunya gerak global = keyframes `aurora-1/2/3` + `.animate-enter` 800ms `cubic-bezier(0.25, 0.46, 0.45, 0.94)` sekali-jalan + `prefers-reduced-motion` mematikan — `globals.css:138-174,273-283`). Tidak ada lapisan `fixed z=-1`.
- Verdict: BEDA DISENGAJA — penyebab terdokumentasi: `rre-01-beranda.md:47-49` memetakan "hero terang tanpa video dramatis … kekosongan putih sebagai 'ruang napas', bukan overlay gelap"; `design.md:22` "Tidak diambil: … foto dramatis … reveal-on-scroll".

## 5. Exc Divisors — aturan tertulis yang MENGHALANGI tampilan kaya-rre

Tiap butir dikutip verbatim + path:baris persis:

1. `docs/desain/design.md:9-10` — "**datar** (flat, garis rambut, tanpa elevasi)". Menghalangi: shadow/elevasi kartu alaivin kaya dimensi.
2. `docs/desain/design.md:22-23` — "Tidak diambil: mode gelap, radius/gap 0, reveal-on-scroll, foto dramatis, label status polos, feed tanpa tanggal." Menghalangi: mode gelap, foto dramatis, radius 0 sebagai gaya, reveal-on-scroll.
3. `docs/desain/design.md:27-29` — "Token saja — kelas semantik (`bg-primary`, `t-h1`, `section-napas`, `garis-rambut`); nol hex, nol arbitrary, nol bayangan kustom." Menghalangi: bayangan/elevasi kustom apa pun di file baru.
4. `docs/desain/design.md:50-51` — "Editorial terang: putih, permukaan `#f4f7fb`, teks `#232e40`, satu grotesk. Kartu datar radius 12–16, gap 16–24." Menghalangi: kartu gelap/foto-penuh; mengunci radius pada rentang token.
5. `docs/desain/design.md:74-77` — "Tepat satu sorotan primer per layar (CTA navy ATAU banner kritis). Merah: selisih/… Hijau: Aman/… Netral: … Info/bantuan = tint biru. Semua + label teks." Menghalangi: keynote multi-warna/aksen dekoratif gaya rre-monokrom-diwarnai.
6. `docs/desain/design.md:80-81` — "kontras AA (lantai warning 4.80 / success 4.84 — jangan gelapkan tint tanpa fg-nya)". Menghalangi: tint pastel sembarang — batas bawah terukur di `docs/desain/token-warna-oklch.md:71-72` (sampel 4: 4.80; sampel 5: 4.84) dan `token-warna-oklch.md:81` ("Margin tersempit … jangan menggelapkan tint tanpa menggelapkan fg-nya").
7. `docs/desain/token-warna-oklch.md:51-54` — "komponen **tidak** boleh memakai hex langsung (item *Semantic color tokens* + *Token governance*)" + "status umpan balik memakai pasangan warna + label teks … bukan warna saja". Menghalangi: warna bebas + status warna-saja.
8. `packages/ui/src/styles/globals.css:8-52` (`:root` — satu-satunya kebenaran nilai per `design.md:3-4`) mengunci: `--background #ffffff`, `--foreground #232e40`, `--primary #3a538d`, `--muted #f4f7fb`, `--border #d7dde7`, `--radius 0.75rem`, `--text-display clamp(2.5rem, 6vw, 5rem)`, `--text-h1 clamp(1.875rem, 4vw, 3.5rem)`, `--text-h2 clamp(1.5rem, 3vw, 2.5rem)`, `--tracking-display -0.05em`, `--tracking-heading -0.035em`, `--tracking-micro 0.08em`, `--space-section clamp(4rem, 8vw, 8rem)`. Menghalangi: angka di luar kurva clamp/tracking ini tanpa ubah token.
9. `AGENTS.md:13` — "Bahasa UI Indonesia sederhana, tombol minimal 48px, status selalu warna plus label teks. Komponen shadcn plus token semantik, light saja, tanpa mode gelap." Menghalangi: mode gelap (mengunci latar terang + teks Inggris-gaya rre).
10. `AGENTS.md:11` — "Selera visual dan token UI: `docs/desain/design.md` (napas, datar, sorot-tunggal). Nilai token hanya di `packages/ui/src/styles/globals.css`, jangan diduplikasi." Menghalangi: duplikasi/fork angka gaya di luar token.
11. `docs/desain/rre-01-beranda.md:47-49` + `:63-64` — "Peta ke OmniRelief terang: hero terang tanpa video dramatis" dan "foto diganti ilustrasi/inisial (tanpa foto dramatis)". Menghalangi langsung: video-bg hero dan fotografi dramatis rre.
12. `docs/desain/design.md:141` — "Selalu dibuang: dark-mode, haptic, profil publik/bio." Menghalangi: dark-mode sekalipun sebagai eksperimen.

## 6. Aturan em-dash / tanda baca Indonesia

- Hasil pencarian jujur: **tidak ditemukan aturan em-dash/tanda baca Indonesia** di `GLOSSARY.md` (69 baris, dibaca penuh — hanya berisi pasangan istilah↔hindari: posko, penyintas, snapshot penyintas, verifikasi, sumbangan `DNT-*`, batch, manifest `MNF-*`, selisih, check-in, Perlu Dicek, konfirmasi terima, ketidaksesuaian, pembatalan), `AGENTS.md` (15 baris, dibaca penuh), `docs/desain/design.md`, `docs/desain/riset-pola.md`, `docs/desain/arsitektur-komponen.md` (grep `em-dash|em dash|tanda baca|tanda hubung|Bahasa Indonesia` — nihil selain "UI Bahasa Indonesia sederhana" di `token-warna-oklch.md:6` dan `AGENTS.md:13` yang sudah dikutip di butir 9 §5).
- Satu-satunya aturan kemurnian teks yang tertulis: `design.md:36-38` — "Teks Indonesia + istilah GLOSSARY (`selisih`, `Perlu Dicek`, `ketidaksesuaian`, `konfirmasi terima`, `MNF-*`, `DNT-*`). Selesai bila sapu istilah asing nihil." Artinya: tidak ada divisor/divergen terdokumentasi soal em-dash — penulis bebas memakai tanda baca baku Indonesia (— / –) selama istilah GLOSSARY dipatuhi.

## 7. Tabel verdict per dimensi

| Dimensi | Verdict | Penyebab terdokumentasi |
|---|---|---|
| H1 desktop | DEKAT | Ukuran+ls identik; bobot/warna beda via `font-bold text-primary` vs token `.t-display` 400 |
| H1 mobile | DEKAT | Gutter 20px sama; 48px→40px via lantai clamp token |
| H2 | DEKAT | Pola ls-negatif dipertahankan; skala clamp token |
| Body | SAMA | 20px/28px/400 + satu-grotesk, warna dipetakan terang |
| Mikro/nav/CTA | DEKAT | 15px→12px + ls +0.08em sesuai peta `rre-01-beranda.md:28-31`; radius 0 dipertahankan |
| Stat | DEKAT | Pola angka-besar + divider dipakai; tanpa dramatisasi (divisor butir 11) |
| Hero padding | DEKAT | Token `--space-section`; hero aktual pakai utilitas (80/64) bukan `.section-napas` |
| Gutter/max-width | BEDA | Full-bleed rre vs kontainer 1152px — keputusan IA repo |
| Jeda section | DEKAT | Penyeragaman via aturan `design.md:87-89` |
| Kartu | SAMA POLA | Datar + judul=body; radius terukur 0px menyimpang dari token 12–16 (catatan implementasi, bukan aturan) |
| Background hero | BEDA DISENGAJA | Divisor butir 2 + 11 (tanpa video/foto dramatis, tanpa fixed-bg) |
| Parallax | BEDA DISENGAJA | rre fixed `z=-1` (diam, bukan parallax); repo menolak reveal-on-scroll (divisor butir 2) |
| Bahasa/istilah | SAMA ATURAN | Indonesia + GLOSSARY dikunci (`AGENTS.md:13`, `design.md:36-38`) |
| Em-dash/tanda baca | TIDAK DIATUR | Tidak ada aturan tertulis (pencarian nihil, §6) — bukan divisor |

## 8. Sumber primer — daftar tutup

- Browser rre.com: `eval` getComputedStyle/getBoundingClientRect sesi `riset-rre-*`, viewport 1440×900 (H1 80px/gutter 80px/hero-pad 128px; iframe vidzflow; `.page_bg-wrapper pos=fixed z=-1`; scroll 0/400/800 top tetap 0) dan 390×844 (H1 48px/gutter 20px/hero-pad 48/64); screenshot `/tmp/rre-1440.png`, `/tmp/rre-390.png`.
- Browser OmniRelief: `eval` sesi sama — `/` H1 `t-display t-balance font-bold text-primary` 80px/lh 88px/700/-4px/`rgb(58,83,141)` gutter 248px; hero-pad 80/64; `.section-napas` 115.2px; `main` max 1152px; `/transparansi` H1 56px gutter 248px, komponen `rounded-none`/`shadow: none`; mobile `/` H1 40px gutter 20px.
- Repo: `docs/desain/design.md` (dibaca penuh 153 baris), `docs/desain/rre-01-beranda.md` (penuh 76 baris), `docs/desain/token-warna-oklch.md` (penuh 88 baris), `packages/ui/src/styles/globals.css` (penuh 290 baris), `GLOSSARY.md` (penuh 69 baris), `AGENTS.md` (penuh 15 baris).
