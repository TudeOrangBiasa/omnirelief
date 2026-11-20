# RRE Beranda — referensi visual revamp OmniRelief

Sumber: https://rre.com/ (dibuka 2026-11-20, snapshot -i -u).
Screenshot: `docs/referensi/rre/baru-01-full.png` (full page), `baru-01-hero.png`,
`baru-01-stats.png`, `baru-01-depth.png`.
Metode token: `agent-browser eval` → `getComputedStyle()` per selektor.
Gagal diambil: aturan `clamp()`/media-query headline (stylesheet Webflow cross-origin,
`cssRules` diblokir); ukuran mobile H1 tidak terverifikasi; warna aksen khusus
tidak ada (situs monokrom).

## Token global

- Font: `"RRE Monument Grotesk Trial", Arial, sans-serif` — dipakai headline, body,
  nav, CTA (satu family di semua peran).
- Body: 20px / lh 28px / weight 400; bg `rgb(7,2,10)` (hitam pekat keunguan),
  teks `rgb(255,255,255)`.
- H1: 80px / lh 88px / weight 400 / letter-spacing -4px / putih.
  Peta ke OmniRelief terang: satu family grotesk (pengganti: Inter/Space Grotesk),
  H1 ± clamp(40px, 6vw, 80px), letter-spacing negatif ketat (-0.05em), teks tinta
  di atas putih, bukan putih di atas hitam.
- H2 section: 56px / lh 56px / ls -2px, warna konteks (putih di hero, `#07020a`
  di section terang).
  Peta ke OmniRelief terang: H2 ± clamp(30px, 4vw, 56px), ls -0.035em.
- CTA "OUR PORTFOLIO": 15px, uppercase, padding 12px 16px, tanpa radius/border
  (teks bergaris/btn ghost).
  Peta ke OmniRelief terang: CTA primer tombol penuh warna primer + radius kecil;
  pertahankan label uppercase 15px untuk gaya sekunder.
- Label mikro (nav PORTFOLIO/TEAM, tag NEWS/PODCAST/BLOG di kartu Latest):
  15px, uppercase, weight 400, spacing normal.
  Peta ke OmniRelief terang: label segmen GLOSSARY uppercase 12–13px, ls +0.08em,
  warna primer/aksen sebagai penanda taksonomi.
- Stat `$2.5B+`: 56px / weight 400, warna section (gelap `#07020a` di pita terang).
  Peta ke OmniRelief terang: angka dampak 56px → clamp(32px, 4vw, 56px), warna
  primer, label kecil di bawahnya.
- Section hero: padding 128px atas/bawah.
  Peta ke OmniRelief terang: ritme section 128px desktop / 64px mobile.
- Kartu Latest: judul 20px (sama dengan body), bg transparan, radius 0
  (kartu editorial datar, pemisah whitespace, bukan shadow).
  Peta ke OmniRelief terang: kartu Berita/Pembaruihan datar dengan label
  kategori uppercase + judul 20px; bayangan hanya saat hover.

## Struktur sections + copy + adaptasi

1. Hero (video bg via iframe embed, teks putih di atas gelap).
   H1 "Backing the best for the distance", H2 "The confidence to commit early",
   CTA "OUR PORTFOLIO" → /portfolio.
   Peta ke OmniRelief terang: hero terang tanpa video dramatis — headline misi +
   sub-headline + CTA primer "Lihat Program"/"Donasi"; kekosongan putih sebagai
   "ruang napas", bukan overlay gelap.
2. Pita statistik: $2.5B+ / 125+ / 400+ (AUM / perusahaan / investasi — angka
   implisit dari konteks VC).
   Peta ke OmniRelief terang: pita dampak "RpXM tersalur / N penerima / K kota"
   dengan angka besar + label kecil, di atas putih/garis tipis.
3. Investment areas: AI, CONSUMER, CRYPTO, ENTERPRISE/SAAS, FINTECH, HARDWARE,
   HEALTHCARE, MEDIA, ROBOTICS, SPACE (link pil/chip).
   Peta ke OmniRelief terang: chip Fokus Bantuan (Bencana, Kesehatan, Pendidikan…)
   sebagai filter/pintasan ke Katalog Bantuan.
4. Our difference? Depth. — 4 panel: Deeper Experience / Deeper relationships /
   Deeper commitment / Amplified by AI (klik untuk expand).
   Peta ke OmniRelief terang: blok "Mengapa OmniRelief" 3–4 kartu nilai
   (Transparan, Cepat, Tepat sasaran) dengan pola expand yang sama.
5. Quotes carousel (Prev/Next slide): testimoni founder + lightbox video.
   Peta ke OmniRelief terang: carousel Testimoni Penerima/Relawan dengan kontrol
   prev/next yang sama; foto diganti ilustrasi/inisial (tanpa foto dramatis).
6. Latest from RRE: kartu NEWS/PODCAST/BLOG (judul: "Pedestal AI Emerges From
   Stealth…", "Unpacking Anthropic's S-1", "Graphon Announces $35M Series A…",
   "The AI Model Wars…", "Deutsche Bank Deploys Farsight…",
   "From Scarcity to Ambience…", "Helogen Announces October Missions…").
   Peta ke OmniRelief terang: daftar Pembaruan/Kabar dengan tag kategori yang
   sama polanya (BERITA/PODCAST/BLOG → KABAR/LAPORAN/ CERITA).
7. Footer + subscribe: nav (Home, Portfolio, Team, RRE POV, BLOG, X, LINKEDIN,
   JOBS), input "Your Email Address" + SUBSCRIBE, INFO@RRE.COM,
   "LIMITED PARTNER LOGIN" / "GENERAL PARTNER LOGIN".
   Peta ke OmniRelief terang: footer terang dengan kolom navigasi + form
   langganan kabar (email + tombol), kontak, dan tautan portal Donatur/Relawan
   setara login LP/GP.
