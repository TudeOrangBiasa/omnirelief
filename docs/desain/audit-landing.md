# Audit Landing `/` — OmniRelief

- SHA audit: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`
- Status: **ISSUES**
- Mode: audit (checklist-design v3.2.6), material under review dibaca read-only
- Yang diaudit: `apps/web/src/app/page.tsx` (hero + form cek MNF/DNT + 3 statistik + 4 janji + 3 langkah + footer mini), `apps/web/src/app/layout.tsx` (metadata + Header), `apps/web/src/components/header.tsx`, screenshot `docs/bukti-ui/01-landing.jpg` (hanya paruh atas / above-the-fold)
- Checklist: `website-landing-page.md`, `website-footer.md`, `website-features.md` di `.agents/skills/checklist-design/references/checklists/`
- Batasan lihat: screenshot hanya menampilkan hero + statistik, jadi penilaian visual below-the-fold (janji, langkah, footer) bersumber dari kode, bukan render piksel — tidak ada tebakan tampilan di tabel.

## 1. Audit Landing Page — Website

Auditing this against the Landing Page checklist (Website) — https://www.checklist.design/website/landing-page.

| | Item | Why |
|---|---|---|
| 🟢 | **Headline** — A single, clear statement of what the product does or the value it delivers | Headline "Tiap paket tercatat, tiap posko terlihat" (`page.tsx:84-86`) satu klaim jelas yang cocok dengan janji transparansi per posko. |
| 🟢 | **Subheadline** — A supporting line that adds context or specificity to the headline claim | Subheadline (`page.tsx:87-90`) menambah spesifik: cek publik tanpa login + data terkunci anti-ubah-diam-diam. |
| 🟡 | **Hero visual** — An image, illustration, or product screenshot that reinforces the headline and makes the page feel tangible | Tidak ada visual hero sama sekali — form cek + angka tampil langsung, jadi halaman terasa nyata tapi tanpa bukti visual produk. |
| 🟢 | **Primary CTA** — One clear action for the visitor to take (sign up, start a trial, book a demo) | Form "Ketik kode MNF-... atau DNT-..." + tombol "Cek" (`page.tsx:91-110`) adalah satu aksi primer yang dominan dan sesuai misi cek-publik. |
| 🔴 | **Social proof** — Customer logos, testimonials, review scores, or user counts that validate the claim. | Tidak ada logo, testimoni, atau hitungan pengguna — pengunjung skeptis tidak punya alasan kedua untuk percaya klaim hero. |
| 🟡 | **Key benefits** — A concise breakdown of the main reasons a visitor should care, focused on outcomes not features. | "Empat janji kami" (`page.tsx:154-172`) ada dan ringkas, tapi bahasanya mekanistik ("FEFO", "hash", "selisih") bukan outcome warga/relawan. |
| 🔴 | **Objection handling** — Content that addresses the most common reasons a visitor would not convert e.g. price, complexity, commitment | Tidak ada FAQ/antikeberatan: "kalau kode hilang?", "kalau angka tidak cocok?", "butuh login?" — ketiganya pasti muncul di lapangan. |
| 🔴 | **Repeated CTA** — The primary CTA repeated at the bottom of the page for visitors who scroll all the way through | Form cek hanya ada di hero; pengunjung yang scroll sampai 4 janji + 3 langkah tidak diberi jalan cek kedua. |

## 2. Audit Footer — Website

Auditing this against the Footer checklist (Website) — https://www.checklist.design/website/footer.

| | Item | Why |
|---|---|---|
| 🟡 | **Size and responsiveness** — Define footer width (full or contained) | Footer (`page.tsx:186-195`) mengikuti `max-w-2xl` halaman sehingga konsisten, tapi tidak terdefinisi sebagai footer penuh/konten yang disengaja. |
| 🟡 | **Style** — Colours, font sizes, visual brand elements | Ada pemisah `border-t` + teks kecil, namun nyaris tak berkasta dari isi — tidak ada kontras yang menandai "kamu sampai di footer". |
| 🟡 | **Content links** — Visuals, states and destinations of all links | Tiga link (Beranda/Transparansi/Masuk) punya destinasi jelas, tapi tanpa state hover/fokus yang terlihat di kode. |
| 🔴 | **Legal and compliance links** — Pages like privacy policy, terms and other legal content are typically located here | Tidak ada tautan privasi/ketentuan — untuk produk data publik + hash ini lubang kepercayaan. |
| 🟡 | **Logo or name of business** — For brand consistency and as a link back to homepage | Nama "OmniRelief" muncul hanya di catatan demo, bukan sebagai merek/tautan beranda yang tegas. |
| 🟡 | **Hierarchy and layout** — Footers should be balanced between logo, links and additional actions | Nav + satu paragraf catatan tersusun, tapi belum seimbang: tidak ada grup tautan bermakna, hanya tiga link sebaris. |
| ⚪ | **Social media** — Logos and/or links to social media platforms you are active on | Tidak ada kanal sosmed aktif yang diketahui untuk produk tanggap darurat ini, jadi tidak dibutuhkan di sini. |
| ⚪ | **Mobile app download actions (if applicable)** — If product is a mobile app, including links to download at Apple or Google stores | Produk ini web + PWA (`manifest.webmanifest` di `layout.tsx:22`), bukan aplikasi toko, jadi badge toko tidak berlaku. |
| 🟡 | **Regulatory and trust certifications** — Badges or logos that show certification of a certain security or trust measure that has been enforced | Klaim "terkunci/hash" adalah fondasi kepercayaan, tapi footer tidak menampilkan lencana/cara verifikasi hash apa pun. |
| ⚪ | **Back to top button** — If your content is exceptionally long and you think the user is likely to want to return | Halaman pendek satu kolom, tombol kembali ke atas tidak dibutuhkan. |
| 🔴 | **Contact methods** — An email, phone number or form to complete for support | Tidak ada email/telepon/formulir kontak — warga yang menemukan selisih tidak tahu harus menghubungi siapa dari landing. |
| ⚪ | **Partner logos** — A suitable place for partners to be shared so they are easily visible on every page | Satu baris "untuk SEVENT X" adalah konteks demo, bukan logo mitra yang perlu dipajang permanen. |
| ⚪ | **Accepted payment methods (if applicable)** — Relevant for any e-commerce experience | Bukan e-commerce, tidak ada pembayaran, jadi tidak berlaku. |

## 3. Audit Features — Website

Auditing this against the Features checklist (Website) — https://www.checklist.design/website/features.

| | Item | Why |
|---|---|---|
| 🟡 | **Feature grouping** — Capabilities organised into logical themes or categories so the page is scannable and not a wall of bullet points | Empat janji (Terdata/Terverifikasi/Terkunci/Terbuka) adalah pengelompokan yang bisa dipindai, tapi keempatnya menaut ke `/transparansi` yang sama sehingga bukan kategori yang mengarah ke pendalaman. |
| 🟡 | **Feature descriptions** — Each feature explained in one or two sentences from the user's perspective, what they can do, not what the system does | Tiap janji 1 kalimat (`page.tsx:25-50`), namun ditulis dari sudut sistem ("FEFO", "append-only implisit") bukan dari sudut "kamu bisa apa". |
| 🔴 | **Feature visuals** — Screenshots, GIFs, or short video clips showing each feature in action | Tidak ada screenshot/GIF/DNT-MNF-contoh per janji — klaim hash, timeline, selisih semuanya abstrak tanpa gambar. |
| 🟡 | **Benefits framing** — Each feature connected explicitly to an outcome and/or benefit, not just the capability | "Terkunci" dan "Terbuka" menyiratkan anti-korupsi, tapi outcome-nya tidak pernah ditulis eksplisit ("uang/donasi tidak bisa disunat diam-diam"). |
| 🔴 | **Social proof per feature** — A relevant customer quote placed alongside the feature it relates to, making the case more concrete. | Nol kutipan per janji — tidak ada suara posko/relawan/donatur yang mengkonkretkan satu pun klaim. |
| 🟡 | **CTA** — A conversion point at the bottom and optionally inline throughout, for visitors who are convinced mid-page | Janji-janji menaut ke `/transparansi`, tapi tidak ada CTA "cek kode sekarang" inline/di akhir yang menangkap pengunjung yang baru yakin. |

## 4. Bedah branding & hooking (bukan tweak UI lama)

Value prop 10-detik hari ini: "Tiap paket tercatat, tiap posko terlihat — cek tanpa login, data terkunci." Ini sudah di atas rata-rata: spesifik, bisa diuji dalam 10 detik (ada kolom ceknya langsung), dan skeptis-friendly.

Mana yang hooking, mana yang generik:

- Hooking: form cek MNF/DNT di hero (aksi nyata, bukan "Pelajari lebih lanjut"); angka "Masih kurang" berwarna merah — satu-satunya angka yang berani jujur; janji "Terkunci" (koreksi hanya lewat dokumen publik baru) — klaim anti-korupsi yang konkret dan bisa dipegang.
- Generik: badge "Sistem supply chain pangan darurat" (label kategori, bukan janji); "Empat janji kami" bernomor 01–04 dengan ikon seragam — terlihat seperti template SaaS; 3 statistik tanpa satuan/konteks ("320 … apa? paket? jiwa?"); "Cara cek dalam 3 langkah" yang semuanya berikon QR sama dan berakhir di "cocokkan sendiri" tanpa contoh hasil cek yang benar vs bermasalah.

Arah revamp editorial (ganti pendekatan, bukan poles warna):

1. Hero hook: buka dengan tuduhan yang bisa diverifikasi — "Jangan percaya halaman ini. Cek satu kode." — lalu contoh kode MNF/DNT yang bisa diklik (bukan placeholder kosong), sehingga skeptis 3-detik langsung melihat bukti, bukan janji.
2. Bukti angka: ubah 3 kartu menjadi narasi jujur — "2 posko terpantau · 0 paket diterima · 320 masih kurang" plus satu kalimat konteks ("data demo SEVENT X, update …") dan tautan "lihat posko dengan selisih terbesar", karena angka tanpa cerita membuat produk terlihat rusak, bukan transparan.
3. Alur cek: tunjukkan ujungnya dulu — mini cuplikan hasil cek (isi + timeline + hash + status "Aman / Perlu Dicek") sebelum menjelaskan langkah, lalu 3 langkah ditulis sebagai "ketik → buka → cocokkan", masing-masing dengan contoh layar, plus FAQ keberatan (kode hilang, angka beda, lapor masalah) dan CTA cek kedua di bawah.

Observasi sendiri (di luar checklist): header global (`header.tsx:8-10`) hanya berisi link "Home" — navigasi Transparansi/Masuk yang ada di landing tidak konsisten di seluruh situs, jadi revamp harus menetapkan navigasi global dulu sebelum memoles landing.

## 5. Ringkasan temuan

| Area | Temuan | Dampak |
|---|---|---|
| Landing | Tanpa social proof + tanpa FAQ keberatan + tanpa CTA bawah | Pengunjung skeptis tidak punya alasan kedua untuk percaya dan tidak punya jalan pulang setelah scroll |
| Landing | Tanpa hero visual / cuplikan hasil cek | Klaim "terkunci/transparan" tetap abstrak, padahal itu diferensiasi utama |
| Features | 4 janji mekanistik, semua menaut ke halaman yang sama, tanpa visual/contoh | Pengunjung paham "sistemnya canggih" tapi tidak paham "untungnya buat saya apa" |
| Footer | Tanpa legal, kontak, dan merek tegas; hanya 3 link | Kepercayaan (privasi, lapor selisih, siapa pengelola) tidak terjawab di halaman paling publik |
| Header | Navigasi global minimal ("Home" saja) | Inkonsisten dengan nav landing; revamp landing harus bareng navigasi global |

## 6. Revamp Nov 2026 (10 band, rre right-dock)

- File: `apps/web/src/app/page.tsx` ditulis ulang; `bilah-nav.tsx` header landing diselaraskan (Transparansi, Cara Kerja, Keamanan, FAQ, Masuk Portal corner-bracket). Dock mobile tetap kapsul kaca 4 sel.
- Menutup temuan: ada FAQ keberatan (5), CTA bawah ganda (publik + petugas), legal tanpa dead-link (3 dialog), merek + status di footer, padding seragam + border-l sumbu di tiap section, shader fixed full-viewport.
- Verifikasi: `bun --filter web check-types` hijau, `lint` exit 0, screenshot desktop 1440 + mobile 390 + dialog legal + PDF cetak di `docs/bukti-ui/landing-*.png`, `landing-report.pdf`. Akordeon cara kerja + FAQ diuji klik (satu terbuka per grup). KPI hidup 2/0/320 dari `/api/publik/dashboard`.
- Catatan: `bun run check:ui` merah 4 baris di `bilah-nav.tsx` + `sidebar.tsx` yang sudah ada sebelum perubahan ini (hex/shadow pola lama); tidak ditambah pelanggaran baru.


## 7. Bukti video 13 rute (22 Nov 2026, pengganti PDF stale)

- `OmniRelief-UI-Design-Report.pdf` dihapus dari worktree: stale dan screenshot beku menghilangkan shader. Bukti baru: rekaman layar per rute (shader live terkomposit di frame video).
- `docs/bukti-video/`: 26 webm (`d-*` desktop 1440x900, `m-*` mobile 390x844, 4 fps), 26 contact sheet `sheets/` (6 frame merata per rute via `scripts/potong-bukti.py`), `laporan-bukti.pdf` 41 halaman (cetak galeri sheet), `galeri.html` sumber cetak.
- Akun audit temporer (`audit-*@demo`) dibuat via service key, dipakai login form asli per peran, lalu dihapus total (verifikasi: 0 sisa). Screenshot beku `landing-*.png` + `landing-report.pdf` ikut dihapus agar tidak dipakai lagi.
- Batasan: load mesin 25+ saat rekam membuat encoder 30/8 fps rontok; 4 fps stabil. Satu take `d-04-sumbangan` sempat gagal 2x di 6 fps, lolos di 4 fps.
Worksheet check-types: n/a (file murni markdown, tidak menyentuh token/kode).
