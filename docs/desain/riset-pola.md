# Riset Pola UX — Revamp OmniRelief

- SHA repo yang dirancang: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`.
- Sifat: dokumen riset (bukan kode app). Satu-satunya file yang ditulis worker ini.
- Grounding repo (wajib baca, klaim repo sebut path+baris):
  - `docs/desain/arsitektur-pages.md:1-7` — 14 routes, aturan global (Indonesia sederhana, tombol min 48px, status warna+label, light saja, shadcn+token, istilah GLOSSARY).
  - `docs/desain/arsitektur-pages.md:30-57` — sidebar desktop per peran vs bottom-nav mobile maks 4 tab + `Lainnya`; aturan ikon+label, aktif tegas, badge angka antrean, tab bar sembunyi di detail `/m/*` `/s/*` dan alur form.
  - `docs/desain/tiket.md:1-4` — 26 tiket (16 P0 + 10 P1), dependen audit peer.
  - `docs/desain/token-warna-oklch.md:64-81` — 12 sampel kontras diukur, 12/12 lolos (teks ≥ 4.5:1, badge ≥ 3.0).
  - `docs/desain/audit-mobile-settings.md:19-27` — tidak ada bottom tab bar di repo (`header.tsx:4-15`, `beranda/page.tsx:7-45`); usulan 4 tab di §6.
  - `docs/desain/audit-dashboard.md:89-99` — desktop harus admin-dashboard (sidebar + triase), bukan satu kolom `max-w-md/2xl`.
  - `AGENTS.md:9` — Indonesia sederhana, 48px, warna+label, light saja, shadcn+token.
  - `GLOSSARY.md` — posko, penyintas, snapshot penyintas, verifikasi, sumbangan `DNT-*`, batch, manifest `MNF-*`, selisih, check-in, Perlu Dicek, konfirmasi terima, ketidaksesuaian, pembatalan.

Aturan desain mengikat (diwarisi, bukan temuan baru): UI Indonesia sederhana, tombol/input min 48px, status selalu warna+label teks, light-only, shadcn + token semantik, istilah GLOSSARY.

---

## Sumber primer yang dipakai (hanya primer)

| # | Sumber | URL | Bagian yang dikutip |
|---|---|---|---|
| S1 | Apple HIG — Tab bars | https://developer.apple.com/design/human-interface-guidelines/tab-bars | Best practices (navigation not actions; visible; number of tabs; avoid overflow/More; don't disable; labels; badges) |
| S2 | Apple HIG — Accessibility | https://developer.apple.com/design/human-interface-guidelines/accessibility | Vision (larger text, contrast table, convey with more than color), Mobility (control size table, spacing), Cognitive (simple actions, reduce motion) |
| S3 | Material 3 — Navigation bar | https://m3.material.io/components/navigation-bar (+ `/guidelines`, `/accessibility`, `/specs`) | "Navigation bars provide access to three to five destinations… Each destination is represented by an icon and label text" (cuplikan hasil cari situs primer; body penuh JS-heavy, tidak ter-render oleh reader) |
| S4 | Material 3 — Badges | https://m3.material.io/components/badges/guidelines | "Badges show…" (halaman terindeks; body JS-heavy) — dipakai hanya untuk klaim keberadaan pola badge M3, detail perilaku diambil dari S1+S8 |
| S5 | shadcn/ui — Button | https://ui.shadcn.com/docs/components/base/button | "Displays a button or a component that looks like a button", `size` prop, `variant` |
| S6 | shadcn/ui — Badge | https://ui.shadcn.com/docs/components/base/badge | "Displays a badge or a component that looks like a badge", `variant="default \| outline \| secondary \| destructive"`, badge dgn ikon |
| S7 | shadcn/ui — Dialog | https://ui.shadcn.com/docs/components/base/dialog | "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert", komposisi Dialog→Trigger→Content→Header/Title/Description→Footer |
| S8 | shadcn/ui — Sheet | https://ui.shadcn.com/docs/components/base/sheet | "Extends the Dialog component to display content that complements the main content of the screen", `side` = top/right/bottom/left |
| S9 | shadcn/ui — Sidebar | https://ui.shadcn.com/docs/components/base/sidebar | Komposisi SidebarProvider→Sidebar→Header/Content/Group/Menu→Footer→Rail→Inset→Trigger; Header sticky branding, Footer sticky user menu, Content scrollable |
| S10 | shadcn/ui — Switch | https://ui.shadcn.com/docs/components/base/switch | "A control that allows the user to toggle between checked and not checked" |
| S11 | shadcn/ui — Empty | https://ui.shadcn.com/docs/components/base/empty | "Use the Empty component to display an empty state", komposisi Empty→Header/Media/Title/Description→Content (aksi) |
| S12 | WCAG 2.2 — SC 1.4.3 Contrast (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html | Teks 4.5:1, teks besar 3:1; §Intent; pengecualian inaktif/dekoratif/logo |
| S13 | WCAG 2.2 — SC 1.4.11 Non-text Contrast | https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | Komponen UI dan grafik bermakna 3:1 terhadap warna adjacent; fokus indicator tunduk pada 1.4.11 |
| S14 | WCAG 2.2 — SC 1.4.1 Use of Color | https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html | "Color is not used as the only visual means of conveying information…" |
| S15 | WCAG 2.2 — SC 2.5.8 Target Size (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | Target ≥ 24×24 CSS px, pengecualian spacing/equivalent/inline/UA/essential |
| S16 | WCAG 2.2 — SC 2.4.7 Focus Visible | https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html | Setiap UI keyboard-operable wajib punya mode fokus yang terlihat, tidak time-limited |
| S17 | WCAG 2.2 — SC 2.4.13 Focus Appearance (AAA) | https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html | Indikator ≥ perimeter 2px + perubahan kontras 3:1 pada piksel yang sama (rujukan target ideal, bukan syarat AA) |
| S18 | NN/g — Status Trackers and Progress Updates: 16 Design Guidelines (Rosala, 2019) | https://www.nngroup.com/articles/status-tracker-progress-update | Tabel pull-vs-push; 16 pedoman (latest-first, plain language, scannable, reference number, error diagnostik, link tracker saat selesai, update berkala, riwayat, link langsung, pilih jenis update, jangan banjiri, stop) |
| S19 | GOV.UK Design System — Confirmation pages | https://design-system.service.gov.uk/patterns/confirmation-pages/ | "Use this pattern to let users know they've completed a transaction"; wajib: reference number, what-happens-next, contact, next links, feedback link, simpan rekaman (PDF); bookmarkable |

Yang sengaja TIDAK dipakai: tulisan sekunder/blog/checklist-design (hanya jadi penunjuk jalan, bukan kutipan).

---

## Temuan pola (12 pola)

Konvensi tiap pola: Perilaku expected → Kapan dipakai → Batasan → Contoh familiar → Implikasi OmniRelief (kode rute/istilah GLOSSARY).

### P1 — Bottom navigation 3–5 destinasi, ikon + label, selalu terlihat di level atas

- Perilaku expected: bar bawah menavigasi antar *section* (bukan aksi). Tiap tab = ikon + label kata tunggal. Tab bar tetap terlihat saat pindah section; hanya modal/alur dalam yang boleh menutupinya. Jumlah tab dijaga sedikit (semakin sedikit semakin mudah). [S1 Best practices: "Use a tab bar to support navigation, not to provide actions", "Make sure the tab bar is visible… exception modal", "Use the appropriate number of tabs… easier to navigate among fewer tabs", "Include tab labels… single words whenever possible".] M3 menetapkan rentang yang sama: 3–5 destinasi, tiap destinasi ikon+label. [S3.]
- Kapan dipakai: aplikasi handheld, 3–5 section top-level yang sering dikunjungi, tiap peran punya "rumah" berbeda. [S1+S3.]
- Batasan: jangan tab overflow (`More`) — item tersembunyi sulit ditemukan; jangan disable/sembunyikan tombol tab (kelihatan tidak stabil); jangan taruh aksi (check-in, publikasikan) sebagai tab. [S1: "Avoid overflow tabs… limit scenarios", "Don't disable or hide tab bar buttons".]
- Contoh familiar: tab Clock iOS (Alarm/Stopwatch/Timer) [S1]; tab Music iPad yang bisa jadi sidebar [S1 iPadOS]; pola yang sama dipakai Gojek/Grab (Beranda/Pesanan/Bantuan/Akun) dan mobile banking.
- Implikasi OmniRelief: kunci arsitektur `arsitektur-pages.md:45-56` (maks 4 tab + `Lainnya` sebagai sheet, ikon+label selalu, sembunyi di `/m/*` `/s/*` dan form). Tab ke-2 mengikuti peran (Tugas/Verifikasi/Catat/Lapor); `Lainnya` = sheet [S8], bukan tab ke-5.

### P2 — Badge angka hanya untuk informasi kritis

- Perilaku expected: badge = oval merah berisi teks putih angka/tanda seru di atas tab; menandai info baru yang butuh perhatian. Cadangan untuk kritis agar tidak kehilangan makna. [S1: "Use a badge to indicate that critical information is available… red oval containing white text and either a number or an exclamation point… Reserve badges for critical information".]
- Kapan dipakai: antrean verifikasi, Perlu Dicek, Menunggu Sinkronisasi — angka yang memicu aksi. [S1.]
- Batasan: bukan dekorasi; nol = badge hilang (bukan "0"); titik saja tanpa angka dilarang di kontrak repo (butuh label aksesibel "3 perlu dicek"). Badge M3 ada sebagai pola sejenis [S4], tetapi aturan cadang-kritis ikut S1.
- Contoh familiar: badge App Store/iMessage; badge "pesanan aktif" Gojek/Grab; lencana antrean BPBD di desain (§2 arsitektur).
- Implikasi OmniRelief: badge angka hanya di tab Tugas/Verifikasi (`Perlu Dicek`, antrean belum verifikasi, `Menunggu Sinkronisasi`) — warna + angka + label, sesuai `arsitektur-pages.md:55`.

### P3 — Sidebar command-center desktop (navigasi persisten + triase)

- Perilaku expected: sidebar = kulit persisten antar workspace; Header sticky (brand/workspace switcher), Content scrollable berisi grup menu berlabel, Footer sticky (user/settings), Rail pengatur lebar opsional. [S9 Composition/Structure.] Di iPadOS, tab bar boleh beradaptasi menjadi sidebar untuk hierarki kompleks. [S1 iPadOS: "tab bar that adapts to a sidebar as an alternative for an app with a complex information structure", "Prefer a tab bar… provide the option to convert to sidebar".]
- Kapan dipakai: operator terlatih, layar lebar, sesi panjang, multi-panel, keputusan berisiko — kebalikan konsumsi publik. (Konteks dari `audit-dashboard.md:89-99`; perilaku komponen dari S9.)
- Batasan: jangan paksakan kustomisasi widget/layout-control bila urutan kritis tetap (Perlu Dicek > Antrean > Prioritas); sidebar di layar kecil jadi halaman biasa, bukan tab (keputusan `arsitektur-pages.md:41`).
- Contoh familiar: admin e-commerce/SaaS (sidebar grup + badge + footer akun); Music iPad sidebar [S1]; pola command-center BPBD.
- Implikasi OmniRelief: sidebar per peran selalu diawali Beranda (`arsitektur-pages.md:34-41`); `/admin` desktop saja; isian sidebar = grup S9 (Antrean, Prioritas, Riwayat, Pengguna untuk BPBD; Batch untuk Gudang).

### P4 — Pelacakan publik: status-terkini-di-atas + riwayat append-only + bahasa polos + scannable

- Perilaku expected: tracker = pull — pengguna cek kapan saja; berisi status terkini + update lampau kronologis. [S18 tabel pull-vs-push + definisi "latest status and prior updates, displayed in chronological order".] Aturan isi: (a) prioritaskan update terkini, jangan kubur di teks; (b) bahasa polos tanpa jargon backend ("label created" = gagal); (c) scannable — baris visually distinct, 2 kolom lega dengan tanggal; (d) tampilkan SEMUA update lampau + tanggal, bukan hanya terkini; (e) pembaruan berkala walau granularitas rendah saat antre panjang; (f) akurat — bila backend manual, tunda tracker dan kirim email/SMS dulu. [S18 pedoman 2,3,4,9,10,11; contoh gagal Echo vs lolos Royal Mail/UCAS/HMPO di artikel.]
- Kapan dipakai: setiap ada jeda antara janji dan bukti (kirim → terima; lapor → verifikasi). [S18 intro anxiety/control.]
- Batasan: tracker tanpa update lama kehilangan nilai → pengguna menelepon; jargon backend memicu kontak support; tabel sempit tanggal-wrap tidak scannable. [S18.]
- Contoh familiar: FedEx/UPS/USPS tracker, Amazon embedded tracker + link ke tracker carrier [S18 pedoman 1], Royal Mail rows, UCAS vertical log terbaru-di-atas, HMPO "Joined the processing queue".
- Implikasi OmniRelief: `/m/[kode]` = header TERKUNCI + hash pendek + QR + salin tautan, lalu timeline append-only + kartu pembatalan/ketidaksesuaian; `/s/[kode]` = header `DNT-*` + progress alokasi + daftar manifest pemakai; tanpa tombol edit/hapus (`arsitektur-pages.md:13-14`). Tracker publik wajib link langsung dari email/update (bukan suruh ketik ulang kode) [S18 pedoman 13].

### P5 — Konfirmasi transaksi: nomor referensi + apa-berikutnya + bisa di-bookmark

- Perilaku expected: halaman konfirmasi menutup transaksi: panel konfirmasi + nomor referensi + "what happens next and when" + kontak + link kebutuhan-berikut + link feedback + cara simpan rekaman (PDF). [S19 "How it works" list.] Pengguna mem-bookmark halaman konfirmasi sebagai kwitansi — layani kunjungan ulang (link lacak/aplikasi-baru/kontak-bila-bermasalah). [S19 "Help users who bookmark the page".]
- Kapan dipakai: akhir setiap penerbitan/pencatatan (MNF terbit, DNT terbit, snapshot terkirim). [S19 "at the end of a transaction".]
- Batasan: jangan taruh elemen interaktif di dalam panel hijau konfirmasi tanpa perbaikan kontras (min 3:1) [S19]; riset lanjutan masih terbuka untuk transaksi-bagian-dari-tugas-lebih-besar [S19 Known gaps].
- Contoh familiar: "Application complete HDJ2123F" GOV.UK [S19 contoh HTML]; email konfirmasi J.Crew/Club Monaco berisi link tracker [S18].
- Implikasi OmniRelief: layar sukses `/bpbd/kirim` → kode `MNF-*` + QR + tombol salin tautan + "pantau di `/m/[kode]`"; layar sukses `/gudang` → kode `DNT-*`; layar sukses posko → status verifikasi + cara cek. Semua deep-linkable dan toast `role="status"`.

### P6 — Driver-task mobile: satu daftar tugas hari ini + satu aksi primer + kabar-berkala

- Perilaku expected: pola turunan P1+P2+P4 untuk peran antar: (a) daftar tugas hari ini terurut (bukan kartu acak); (b) satu aksi primer per tugas (check-in/konfirmasi) full-width; (c) kabar berkala menenangkan (tracker pull + update push [S18]); (d) opsi hentikan update dari update itu sendiri (SMS "STOP", email kelola preferensi) [S18 pedoman 14,16]; (e) jangan banjiri duplikat carrier+platform [S18 pedoman 15]. Kontrol cukup besar + jarak cukup (lihat P11).
- Kapan dipakai: tim distribusi di jalan, satu tangan, perangkat murah, jaringan putus-sambung.
- Batasan: tanpa umpan data badge realtime, tab Tugas hanya hiasan (temuan `audit-mobile-settings.md` risiko 2); tanpa antrean offline yang jujur, pengguna mengulang kirim.
- Contoh familiar: daftar tugas driver Gojek/Grab (tugas → navigasi → status → kabar); update Deliveroo via WhatsApp + rider bernama [S18]; preferensi UPS "manage preferences" [S18].
- Implikasi OmniRelief: `/tim` = Tugas hari ini + 4 tombol status + check-in + lapor kendala/darurat + indikator `Menunggu Sinkronisasi → terkirim otomatis` (`tiket.md:P0-15`); tab Tugas ber-badge Perlu Dicek bila lewat batas.

### P7 — Settings sebagai grouped list: Akun di atas, toggle biner, zona berbahaya di bawah

- Perilaku expected: settings = daftar grup berlabel (Account, Notifications, Privacy/Support), bukan satu daftar panjang; toggle biner untuk on/off; aksi destruktif (keluar/hapus) di section sendiri paling bawah, dibedakan visual; Ia boleh membuka layar tujuan langsung (deep-link dari prompt terkait). Komponen: Switch toggle checked/unchecked [S10]; Sheet/Dialog untuk `Lainnya`/konfirmasi [S7+S8]; Empty untuk list kosong [S11]. (Struktur grup + deep-link + zona-bawah adalah temuan audit-mobile-settings §2 yang diadopsi arsitektur; perilaku toggle/sheet/dialog dari S7/S8/S10.)
- Kapan dipakai: semua preferensi perilaku app (notifikasi, aksesibilitas, bantuan, legal, versi). Identitas operasional (nama/email/peran/posko) tampil di atas sebagai jangkar "akun siapa ini".
- Batasan: akun operasional ≠ akun swadaftar — ganti email/nama via admin, satu-satunya edit mandiri = ganti password (wajib password lama); tanpa hapus-akun mandiri. Jangan tiru UISwitch per-OS di PWA — satu Switch konsisten.
- Contoh familiar: Settings iOS (grup + toggle + destructive bawah); sheet `Lainnya`; halaman `/pengaturan` + `/profil` + anchor `#aksesibilitas` (`arsitektur-pages.md:24-28,57`).
- Implikasi OmniRelief: `/pengaturan` grup = Akun(→`/profil`) → Notifikasi → Aksesibilitas(`#aksesibilitas`) → Bantuan → Tentang&legal → Zona berbahaya(Keluar); `/profil` = avatar inisial + nama + email + peran/posko + ubah password.

### P8 — Status selalu warna + label teks (bukan warna saja)

- Perilaku expected: informasi yang disampaikan beda warna wajib tersedia juga sebagai teks/ikon/bentuk. [S14 SC: "Color is not used as the only visual means…"; teknik G14/G182.] Apple: tawarkan indikator visual berbeda (bentuk/ikon) selain warna; contoh benar = lingkaran hijau+centang vs oktagon merah+silang; dukung kustomisasi skema. [S2 Vision "Convey information with more than color alone".] Kuning-putih tipis di atas putih gagal 1.2:1; isi-penuh yang kontras lolos [S13 Fig 6–7].
- Kapan dipakai: semua badge status (Aman/Kurang/Perlu Dicek/Minta Revisi/Ditolak/FEFO) dan grafik (batang selisih per posko).
- Batasan: beda terang-gelap ≥ 3:1 boleh jadi pembeda tambahan, tetapi bila makna = "valid vs invalid" tetap butuh indikator non-warna [S14 Note]. Logo dikecualikan, tetapi bila logo jadi kontrol interaktif pilih varian kontras [S13 Logos].
- Contoh familiar: label "Kurang 40" merah + teks (bukan titik merah saja); bintang terisi + border tebal [S13].
- Implikasi OmniRelief: kontrak `arsitektur-pages.md:59-67` (Aman hijau, Kurang merah + angka, Perlu Dicek/Minta Revisi kuning/merah + label, FEFO kuning + `kedaluwarsa X hari`); token `token-warna-oklch.md:40-48` menggelapkan sisi teks kuning (`warning-fg`) agar lolos.

### P9 — Kontras: teks 4.5:1, komponen/grafik 3:1, fokus terlihat

- Perilaku expected: teks normal 4.5:1, teks besar 3:1 (18pt / 14pt-bold ≈ 24px/18.5px CSS). [S12.] Komponen UI pembatas/keadaan dan objek grafik bermakna 3:1 terhadap warna adjacent. [S13.] Fokus keyboard harus terlihat dan tidak time-limited [S16]; ukuran/kontras ideal AAA = perimeter 2px + beda 3:1 pada piksel yang sama [S17] (diadopsi sebagai target mutu, syarat rilis = AA). Apple memakai ambang yang sama sebagai panduan (4.5:1 / 3:1 / bold 3:1) dan mewajibkan cek di light+dark bila ada dark mode [S2 tabel Vision].
- Kapan dipakai: seluruh pasangan fg/bg token + badge + ikon bermakna + indikator fokus.
- Batasan: teks inaktif/dekoratif/logo dibebaskan [S12]; komponen inaktif dibebaskan [S13]; thin-font + antialiasing bisa lolos nominal tetapi gagal praktik — pilih font lebih tebal atau naikkan rasio [S12 Intent].
- Contoh familiar: tombol primer putih-di-atas-navy 7.54 [dokumen token no.12]; pasangan warningentan 4.80 sebagai batas bawah.
- Implikasi OmniRelief: 12/12 pasangan token lolos (`token-warna-oklch.md:66-81`); jangan gelapkan tint tanpa gelapkan fg; verifikasi ulang pasangan `--warning-bg`/`--success-bg` ter-render + keyboard-walkthrough + satu sesi TalkBack sebelum klaim AA (sisa `audit-mobile-settings.md:82-91`).

### P10 — Target sentuh: WCAG min 24px, Apple 44pt, repo 48px; jarak = ukuran

- Perilaku expected: WCAG AA menuntut target pointer ≥ 24×24 CSS px ATAU spasi lingkaran-24px yang tidak tumpang-tindih; inline/UA/essential dikecualikan. [S15 + Fig 5–8.] Apple menaikkan ke default 44×44pt (iOS), min 28×28pt; padding ~12pt ber-bezel / ~24pt tanpa bezel. [S2 Mobility.] Repo mengunci 48px (`min-h-12`) untuk semua tombol/tab/input — melebihi keduanya (`audit-mobile-settings.md` baris tap-target).
- Kapan dipakai: semua kontrol primer/CTA/tab/bottom-nav; pengecualian hanya teks-link inline [S15 Inline + kontrak `arsitektur-pages.md:69-71`].
- Batasan: tidak ada CTA ganda sejajar yang memaksa target < 48px; tidak ada "mode ringkas" yang mengecilkan target (keputusan `audit-mobile-settings.md:129`).
- Contoh familiar: tombol penuh-lebar Gojek/Grab; tab bar 48px dengan `aria-current="page"`.
- Implikasi OmniRelief: semua aksi verifikasi/publikasikan/konfirmasi/check-in/darurat full-width mobile + min 48px desktop (`arsitektur-pages.md:71`).

### P11 — Form jujur: error diagnostik spesifik + konfirmasi aksi destruktif + tanpa hapus diam-diam

- Perilaku expected: bila login/lacak butuh kode, (a) beri tahu sejak awal info apa yang dibutuhkan dan di mana mencarinya (hint "lihat email konfirmasi"); (b) error spesifik dan diagnostik — bedakan "belum bisa dilacak (terlalu dini)" vs "kode salah ketik". [S18 pedoman 6,7.] Konfirmasi/destruktif memakai dialog modal yang membuat konten bawah inert, berisi Title + Description + aksi eksplisit. [S7.] Pola GOV.UK menutup loop: referensi + next-step + kontak [S19].
- Kapan dipakai: masuk, kolom kode MNF/DNT, verifikasi (revisi/tolak wajib alasan), pembatalan manifest (publik, tak bisa dibatalkan), nonaktifkan user.
- Batasan: `window.prompt` generik untuk aksi publik-destruktif tidak cukup (temuan `audit-dashboard.md:120`); dialog konfirmasi bukan sekadar "yakin?" — wajib ringkas dampak (posko, batch terkunci) + konfirmasi ketik kode.
- Contoh familiar: HMPO "reference number — find this in confirmation email" [S18]; dialog shadcn Title/Description/Footer [S7]; panel konfirmasi GOV.UK [S19].
- Implikasi OmniRelief: `tiket.md:P0-07,P1-04` (error jelas, ingat saya, redirect `/beranda`; alasan wajib + jejak riwayat untuk batalkan/tolak/nonaktifkan).

### P12 — Empty / loading / offline yang memberi aksi pertama

- Perilaku expected: empty state = Media + Title + Description + aksi pertama di Content, bukan teks telanjang. [S11 Composition.] Tracker yang lama tanpa update membuat pengguna mengira rusak → beri pesan berkala + next-step [S18 pedoman 9]. Konfirmasi harus bisa disimpan (PDF) dan dikunjungi ulang [S19].
- Kapan dipakai: antrean kosong, belum ada kiriman, pencarian tanpa hasil, antrean offline.
- Batasan: skeleton/loading hilang = layar sesaat kosong dan operator tak tahu memuat vs gagal (celah `audit-dashboard.md` Data Table 9 / Analytics 7); banner offline hanya teks tanpa link = mati (perlu deep-link ke Pengaturan).
- Contoh familiar: Empty "No data — Add data" [S11]; Monzo "we'll notify you" saat waitlist [S18]; USPS "opt in 6 kinds of updates via SMS/email" [S18].
- Implikasi OmniRelief: empty tiap daftar + CTA lanjutan ("kosong → Buat manifest"); banner offline global `Menunggu Sinkronisasi` + tombol "kirim antrean sekarang" + deep-link `#aksesibilitas` bila perlu teks lebih besar; stempel "diperbarui HH:MM" + refresh di command-center.

---

## Matriks cakupan (tugas → pola)

| Tugas | Pola |
|---|---|
| Pelacakan bantuan/paket publik | P4, P5, P8, P9, P12 |
| Driver-task mobile (Gojek/Grab-style) | P1, P2, P6, P10, P12 |
| Admin dashboard command-center | P3, P8, P9, P11, P12 |
| Bottom-nav max-4 | P1, P2, P10 |
| Settings + aksesibilitas | P7, P8, P9, P10, P11 |

## Keputusan yang dikunci untuk perancang (warisan + riset)

1. 4 tab + `Lainnya`-sheet; tab bukan aksi; badge angka kritis saja (P1+P2).
2. Desktop = sidebar S9; mobile = tab; `/admin` desktop saja (P3).
3. Tracker publik = terkini-di-atas + riwayat penuh + bahasa polos + link langsung (P4+P5).
4. Status = warna + label + ikon/bentuk; kuning teks digelapkan (P8+P9).
5. Semua target 48px; fokus terlihat; dialog destruktif berfriksi (P10+P11).
6. Settings grup + toggle S10 + zona berbahaya bawah; aksesibilitas fungsional (ukuran teks 3 tingkat, kontras tinggi light-only, kurangi gerak + hormati `prefers-reduced-motion`/`prefers-contrast`) — perilaku hormati-OS dari S2 (Increase Contrast, Reduce Motion, Dynamic Type 200%).

---

- Jumlah pola: 12. Sumber primer dipakai: 19 (S1–S19 di atas).
- File output: `docs/desain/riset-pola.md` (satu-satunya file tulis).
- Worksheet check-types: n/a (murni markdown, tanpa token).
