# Pemetaan checklist-design → rancangan OmniRelief

- SHA yang dirancang: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`.
- IA acuan: `docs/desain/arsitektur-pages.md` (14 routes). Rincian visual per
  checklist dikerjakan file audit peer (`docs/desain/audit-*.md`); file ini
  memetakan tiap page grup ke checklist yang menutup temuan audit kemarin.
- Aturan mengikat (dari `AGENTS.md` + `GLOSSARY.md`): UI Indonesia sederhana,
  tombol/input min 48px (`min-h-12`), status selalu warna + label teks, light
  saja, shadcn `@omnirelief/ui` + token semantik, istilah baku (posko,
  penyintas, snapshot penyintas, verifikasi, sumbangan `DNT-*`, batch, manifest
  `MNF-*`, hash chain, FEFO, selisih, check-in, Perlu Dicek, konfirmasi terima,
  ketidaksesuaian, pembatalan).
- Checklist dibaca (lokal, tanpa fetch): `website-landing-page.md`,
  `web-app-dashboard.md`, `web-app-admin-panel.md`, `web-app-data-table.md`,
  `mobile-tab-bar-navigation.md`, `mobile-settings.md`, `mobile-account.md`,
  `web-app-login.md`, `website-login.md`, `web-app-empty-state.md`,
  `web-app-settings.md`, `web-app-account.md`, `web-app-single-item-detail.md`,
  `web-app-list-view.md`, `design-system-typography.md`,
  `design-system-color-system.md`, `design-system-accessibility.md` +
  `SKILL.md`, `references/audit.md`, `references/index.md`.
- Temuan audit kemarin yang ditutup file ini: `docs/desain/audit-dashboard.md`
  (31 item: Dashboard 7, Admin Panel 7, Data Table 9, Analytics 7) +
  `docs/desain/audit-mobile-settings.md` (34 item: Tab Bar 7, Settings 8,
  Account 5, Profile 6, Accessibility 8).

## Aturan keterbacaan global (semua page)

1. **Hierarki tipe** (dari `design-system-typography.md`): satu H1 per layar
   (nama page / kode `MNF-*` / `DNT-*`), H2 per section, body untuk isi, label
   kecil hanya untuk metadata (waktu, kode, versi). Bobot/ukuran — bukan warna
   saja — yang membedakan primer vs sekunder.
2. **Panjang baris**: teks baca (deskripsi, alasan, bantuan) maks ~65–75 karakter
   per baris; kartu angka dan tabel tidak dibatasi panjang baris tapi satu angka
   satu makna (tidak ada dua metrik dalam satu sel).
3. **Kontras** (dari `docs/desain/token-warna-oklch.md`, 12/12 lolos AA):
   teks isi `#232e40` di atas putih 13.64; teks sekunder `#5f6a7b` 5.51;
   tombol primer putih di atas `#3a538d` 7.54; info `#236292`/`#dbeefe` 5.46;
   sukses `#1f744f`/`#d8f3e3` 4.84; peringatan `#836412`/`#feedc9` 4.80;
   bahaya `#a04037`/`#ffe0db` 5.15. Badge (teks + label) ≥ 3.0, semua ≥ 5.2.
   Batas bawah: sampel warning (4.80) dan success (4.84) — jangan gelapkan tint
   tanpa menggelapkan fg.
4. **Target sentuh**: semua tombol/CTA/tab/input `min-h-12` (48px). Pengecualian
   hanya teks-link inline.

## Aturan HIGHLIGHT global (satu sorotan primer per layar)

- Tiap layar punya **tepat satu sorotan primer**: CTA primer navy
  (`#3a538d`, putih di atasnya 7.54) ATAU banner kritis merah — tidak keduanya
  menonjol sekaligus. Elemen lain netral.
- **Merah** (`destructive`) hanya untuk: selisih > 0 (`Kurang {n}`), Perlu Dicek
  kritis, Minta Revisi/Ditolak/Dibatalkan, zona berbahaya. Selalu + label teks.
- **Kuning** (`warning`) hanya untuk: kartu ketidaksesuaian, FEFO ≤ 7 hari
  (`FEFO: kedaluwarsa X hari`), peringatan draf/belum kunci. Selalu + label teks.
- **Hijau** (`success`) hanya untuk: Aman/Diterima/Disetujui/Terkunci dan konfirmasi
  tersimpan (`role="status"`). Selalu + label teks.
- **Netral/abu** untuk: Draf, Menunggu Verifikasi, Menunggu Sinkronisasi.
- Info/bantuan memakai tint info biru, tidak pernah memakai merah/kuning/hijau.

## 1. Landing `/` — Website Landing Page + Empty State + Typography + Color

Sections berurutan:

1. Hero: H1 2 baris (janji selisih terlihat) + subheadline 1 baris + kolom kode
   auto-deteksi `MNF-*`/`DNT-*` + **satu CTA primer** (tiket `P0-03`).
2. 3 statistik hidup (posko terpantau, selisih terbuka, manifest terkunci hari ini).
3. 4 janji (outcome, bukan fitur).
4. 3 langkah (cek → kirim → terima).
5. Footer resmi (Bantuan, Kebijakan Privasi, Syarat Layanan, versi).
6. CTA bawah berulang (CTA primer yang sama, tanpa CTA ganda sejajar).

Fokus layar: (1) H1 + kolom kode, (2) CTA primer, (3) statistik.
Keterbacaan: H1 display 1.2 line-height; subheadline body 1.5; statistik = angka
hero + label kecil (headline-metrics); panjang baris janji ≤ 75 karakter.
Highlight: sorotan primer = CTA primer navy. Hijau/merah dilarang di landing
(kecuali badge kecil di statistik selisih bila > 0 → merah + label `Kurang`).
Checklist → temuan ditutup: Landing Page (Headline, Subheadline, Hero visual →
kolom kode hidup sebagai visual produk, Primary CTA tunggal, Social proof →
statistik hidup, Key benefits → 4 janji, Objection handling → FAQ "ribet?" di
Pengaturan/Bantuan, Repeated CTA). Empty State tidak berlaku (landing selalu ada
isi). Typography: skala display/body/label + min-size mobile.

## 2. Transparansi grup (`/transparansi`, `/m/[kode]`, `/s/[kode]`) — List View + Single Item Detail + Empty State + Data Table (cari/filter)

`/transparansi` sections:

1. Filter/cari 2 kolom (cari posko + filter status: Semua/Kurang/Aman).
2. Kartu per posko: butuh, dikirim, diterima, selisih + badge `Kurang` merah /
   `Aman` hijau (tiket `P0-04`).
3. Empty state (cari tanpa hasil → bedakan nol-hasil vs kosong + tombol reset
   filter; belum ada posko → CTA ke Bantuan).

`/m/[kode]` sections:

1. Header: kode + badge TERKUNCI hijau + hash pendek + tombol salin tautan + QR.
2. Tabel item + batch (kolom: item, jumlah, batch `DNT-*`, kedaluwarsa).
3. Timeline append-only (siapa-kapan-apa, dari hash chain).
4. Kartu pembatalan (bila ada, merah + alasan + manifest pengganti).
5. Kartu ketidaksesuaian kuning (bila ada). Nol tombol edit/hapus dalam kondisi
   apa pun (tiket `P0-05`).

`/s/[kode]` sections:

1. Header kode + item + sumber (hanya bila izin tampil nama).
2. Progress alokasi (terpakai X dari Y).
3. Daftar manifest pemakai (tiket `P0-06`).

Fokus layar: (1) status (badge Kurang/Aman/TERKUNCI), (2) angka (selisih /
progress), (3) riwayat (timeline / daftar pemakai).
Keterbacaan: kode mono + H1; tabel item mengikuti Data Table (header sortir,
filter chip, paginasi `1–50 dari N`, skeleton saat muat); kontras badge
destructive 5.58 / sukses 5.47 / warning 5.26.
Highlight: sorotan primer = badge status (satu per layar). Merah hanya bila
selisih > 0; kuning hanya kartu ketidaksesuaian/FEFO; hijau hanya Aman/Terkunci.
Checklist → temuan ditutup: List View (Primary info hierarchy → nama posko/kode
paling menonjol, Secondary metadata ≤ 3–4, Sort/filter, Empty/first-use states);
Single Item Detail (Clear title → kode, Status indicator → TERKUNCI + label,
Key details, Related items/activity → timeline hash chain, Breadcrumb/back →
kembali ke Transparansi, Destructive → tidak ada edit/hapus = keputusan sadar);
Empty State (illustration kontekstual, heading jelas, zero vs no-results dibedakan,
error variant terpisah dari kosong); Data Table Search/filter + Pagination +
Empty/loading (skeleton, bukan layar kosong) — menutup Dashboard §3 no. 5 dan
§4 no. 7 (`muat()` tanpa loading) dari `audit-dashboard.md`.

## 3. Masuk `/masuk` — Web App Login (+ Website Login) + input-error flow

Sections berurutan:

1. Logo + judul "Masuk" + penanda peran (teks: akun dibuat admin, tanpa daftar
   publik — Sign up link dinilai ⚪ `Not needed here`).
2. Email + password + tampil/sembunyi password + ingat saya.
3. Error jelas per bidang (`role="alert"`, sebut bidangnya).
4. Info akun demo (tanpa mengetik password di layar saat demo video).
5. SSO dinilai ⚪ (login hanya email+password internal, tanpa OAuth).
6. Lempar yang sudah login ke `/beranda` (tiket `P0-07`).

Fokus layar: (1) judul + email, (2) password + tombol Masuk primer, (3) error /
info demo.
Keterbacaan: label di atas input (bukan placeholder saja); error merah
`#a04037`/`#ffe0db` 5.15 + teks; panjang baris info demo ≤ 75 karakter.
Highlight: sorotan primer = tombol Masuk navy. Merah hanya untuk error form;
hijau/kuning dilarang di layar ini.
Checklist → temuan ditutup: Login Web App (Email+password, Show/hide toggle,
Remember me, Error messages; Forgot password → alur via admin karena akun
operasional; SSO/Sign-up → ⚪ beralasan) + flow Showing input error (visual
kuat + komunikasi jelas + state change).

## 4. Beranda `/beranda` — Web App Dashboard (Welcome, Metrics, Activity, Actions)

Sections berurutan (tiket `P0-08`):

1. Sapaan + nama + peran (welcome state: ringkasan "sejak kunjungan terakhir").
2. Ringkasan angka hero per peran (Antrean saya / Perlu Dicek bila ada).
3. Satu tombol aksi primer per peran.
4. Aktivitas terakhir (5 item + tautan sumber, tiket `P1-06`).
5. Tombol Keluar (pindah ke zona Pengaturan saat revamp; sementara di sini).

Fokus layar: (1) sapaan + ringkasan sejak-terakhir, (2) aksi primer, (3) aktivitas.
Keterbacaan: angka hero besar + label kecil + konteks periode (hari ini);
aktivitas = daftar 5 baris (waktu + teks + tautan), bukan tabel.
Highlight: sorotan primer = aksi primer navy; bila ada Perlu Dicek, banner
merah menjadi sorotan primer dan CTA turun ke sekunder. Hijau hanya untuk angka
"Aman"; kuning dilarang kecuali FEFO mendesak.
Checklist → temuan ditutup (`audit-dashboard.md` §1): Welcome state 🟡→🟢
(ringkasan sejak-terakhir), Key metrics 🟡→🟢 (figur hero + konteks), Recent
activity 🔴→🟢 (5 aktivitas + tautan), Needs attention 🟢 dipertahankan (Perlu
Dicek di atas), Quick actions 🟡→🟢 (satu aksi primer per peran + "Buat manifest"
di command center), Empty state 🟢 + CTA lanjutan, Layout control ⚪ (urutan
kritis tetap, tanpa kustomisasi widget).

## 5. BPBD (`/bpbd`, `/bpbd/kirim`) — Dashboard + Data Table + Analytics + Admin Panel (sebagian)

`/bpbd` command center sections (tiket `P0-09`, `P0-10`):

1. Ringkasan metrik hero: menunggu verifikasi, selisih merah terbuka, terkunci
   hari ini + stempel "diperbarui HH:MM" + tombol muat ulang.
2. Panel Perlu Dicek (persisten, bukan kondisional; aksi hubungi/eskalasi;
   batalkan = opsi terakhir berfriksi dengan dialog alasan + konfirmasi ketik).
3. Tabel antrean verifikasi: kolom kategori rentan (bayi/balita/ibu hamil/lansia/
   disabilitas/umum) + sortir umur + seleksi massal + 3 putusan (setujui, minta
   revisi, tolak; alasan wajib untuk revisi/tolak).
4. Grafik batang selisih per posko + tabel Prioritas (sortir selisih terbesar,
   kolom wilayah di-render, ekspor CSV).
5. Tautan Buat Manifest (quick action yang hilang kemarin).

`/bpbd/kirim` sections (tiket `P0-11`):

1. Pilih posko.
2. Pilih batch dari tabel cari/filter/sortir-exp (FEFO terlihat SEBELUM draf —
   menutup `formulir.tsx:121-126`).
3. Tambah baris + simpan draf + baca peringatan FEFO kuning.
4. Publikasikan dan kunci → kode `MNF-*` + QR + badge terkunci.

Fokus layar: (1) Perlu Dicek / metrik hero, (2) antrean verifikasi, (3) prioritas
selisih.
Keterbacaan: tabel padat admin (header sortir + indikator arah, filter chip,
paginasi, skeleton rows anti layout-shift); batang selisih berlabel angka
(bukan warna saja); kolom ≤ 7, wilayah + kategori rentan selalu tampil.
Highlight: sorotan primer = panel Perlu Dicek (merah) bila ada; bila kosong,
sorotan = CTA "Buat manifest" navy. Kuning hanya peringatan FEFO/pembatalan;
hijau hanya Disetujui/Terkunci.
Checklist → temuan ditutup (`audit-dashboard.md` §2–§4): Data Table 6🔴→🟢
(sortir, cari/filter, paginasi, seleksi massal, ekspor CSV; column visibility
untuk operator menengah; hover-actions tetap ⚪ — aksi kritis selalu inline
demi 48px); Analytics (Headline metrics 🟡→🟢, Charts 🔴→🟢 batang selisih,
Segment 🟡→🟢 wilayah + kategori rentan di-render, Last updated 🔴→🟢 stempel +
refresh, Loading 🟡→🟢 skeleton; Date-range/Period-compare tetap ⚪ real-time);
Admin Panel Usage 🟡→🟢 agregat "N posko, M kritis" + ekspor; observasi
pembatalan tanpa friksi → dialog terdesain (alasan wajib + dampak + ketik kode).

## 6. Gudang `/gudang` — Dashboard (tugas) + Data Table (batch) + Empty State

Sections berurutan (tiket `P0-12`):

1. Formulir intake: item + jumlah + kedaluwarsa + sumber + izin tampil nama
   (validasi inline per bidang).
2. Hasil: kode sumbangan `DNT-*` + salin tautan (sorotan sukses sesaat).
3. Tabel batch hari ini: stok sisa, exp, kode `DNT-*`, cari/filter, ekspor
   (gudang buta stoknya sendiri → ditutup).
4. Empty state: belum ada batch hari ini → CTA "Catat sumbangan".

Fokus layar: (1) formulir intake, (2) kode `DNT-*` hasil, (3) tabel batch.
Keterbacaan: input 48px + label + contoh format tanggal; tabel batch mengikuti
kontrak tabel BPBD (sortir exp default FEFO, chip filter item, skeleton).
Highlight: sorotan primer = tombol "Catat" navy; sesaat setelah simpan, sorotan
= kartu hasil hijau `DNT-*`. Merah dilarang kecuali error validasi; kuning hanya
peringatan exp dekat saat input.
Checklist → temuan ditutup: Dashboard Quick actions + Empty state; Data Table
Search/filter + Sortable (exp) + Export; Empty State Primary action (CTA
menciptakan item pertama, bukan tautan generik).

## 7. Posko `/posko` — Dashboard (tugas) + Multi-step-ish form + Empty State

Sections berurutan (tiket `P0-13`, `P0-14`):

1. Form snapshot penyintas 6 angka (kategori GLOSSARY) + simpan draf.
2. Banner status verifikasi (Menunggu netral / Minta Revisi merah-kuning eksplisit
   + alasan + CTA perbaiki).
3. Status jatah ("disetujui X dari snapshot tanggal Y") agar posko tahu untuk apa
   menunggu (baru — menutup buta status).
4. Daftar bantuan + konfirmasi terima (tombol primer per kiriman).
5. Lapor masalah: 5 jenis ketidaksesuaian (kurang/rusak/tidak sesuai/tidak
   diterima/kirim ulang) → kartu kuning publik di `/m/[kode]`.

Fokus layar: (1) banner status verifikasi bila Minta Revisi, (2) form snapshot /
konfirmasi terima, (3) status jatah.
Keterbacaan: 6 angka = 6 input stepper 48px + label kategori + total otomatis;
banner `role="status"`; alasan revisi teks penuh ≤ 75 karakter/baris.
Highlight: sorotan primer = banner Minta Revisi (merah/kuning) bila ada,
kalau tidak = tombol "Kirim snapshot"/"Konfirmasi terima" navy. Hijau hanya
untuk Diterima/Disetujui; kuning hanya ketidaksesuaian.
Checklist → temuan ditutup: Dashboard Needs attention (banner revisi di atas),
Quick actions (konfirmasi terima inline, selalu terlihat — hover-actions ⚪),
Empty state (belum ada bantuan → "Belum ada kiriman." + penjelasan kapan
datang); input-error flow (error per angka + total tak cocok).

## 8. Tim `/tim` — Mobile Dashboard + Tab Bar badge + Notifications

Sections berurutan (tiket `P0-15`):

1. Tugas hari ini (daftar kiriman + batas check-in terlihat SEBELUM lewat —
   menutup `tugas.tsx:126-128` yang baru merah sesudahnya).
2. 4 tombol status + check-in (48px, full-width mobile).
3. Lapor kendala + darurat (darurat = merah + konfirmasi, bukan satu ketuk).
4. Indikator antrean offline (Menunggu Sinkronisasi netral → terkirim otomatis
   + tombol "kirim sekarang" + deep-link ke Pengaturan bila gagal).

Fokus layar: (1) tugas hari ini + batas check-in, (2) check-in, (3) status offline.
Keterbacaan: tiap tugas = kartu (tujuan posko + kode + batas waktu + badge
status); tombol status berlabel teks penuh Indonesia.
Highlight: sorotan primer = check-in navy; bila lewat batas → banner Perlu Dicek
merah jadi sorotan. Kuning hanya peringatan "batas < 1 jam"; hijau hanya
check-in terkirim.
Checklist → temuan ditutup: Mobile Dashboard (glanceable + leads ke detail);
Tab Bar Badge counts (angka Perlu Dicek realtime, warna + angka bukan titik
saja); Fixed presence (tab disembunyi di alur formulir agar tombol primer tak
tertutup); Tap target 48px (melebihi 44pt); Haptic ❔ tetap (uji perangkat,
opsional — `navigator.vibrate` inkonsisten di iOS).

## 9. Pengaturan `/pengaturan` — Web/Mobile Settings + Help + Legal

Sections berurutan = grouped list (tiket `P0-16`, `P1-08`; `#aksesibilitas`
adalah section, bukan route):

1. Akun (tautan ke `/profil` — jangkar "akun siapa ini" selalu di atas).
2. Notifikasi & sinkron (toggle per jenis: Perlu Dicek, verifikasi diputus,
   manifest terbit; status PWA + "kirim antrean sekarang"; deep-link dari banner
   offline ke sini).
3. Aksesibilitas `#aksesibilitas`: ukuran teks (Standar/Besar/Sangat besar
   1/1.125/1.25 + pratinjau), kontras tinggi (toggle, tetap light-only),
   kurangi gerakan (toggle + hormati `prefers-reduced-motion`).
4. Bantuan (hubungi command center + FAQ "ribet?" + kirim masukan).
5. Tentang & legal (Kebijakan Privasi, Syarat Layanan, versi app + hash build).
6. Zona berbahaya (paling bawah, teks merah + label): Keluar. Tanpa hapus akun
   mandiri — milik admin + tercatat (mobile-account Delete → ⚪ beralasan).

Fokus layar: (1) jangkar akun, (2) grup yang dituju via deep-link, (3) zona
berbahaya hanya bila dicari (di bawah, tak menonjol).
Keterbacaan: tiap grup = heading + baris 48px; toggle shadcn Switch + nama
aksesibel Indonesia ("Kontras tinggi, nonaktif"); versi + sisa antrean selalu
terlihat di Bantuan.
Highlight: sorotan primer = tidak ada (layar netral — benar menurut checklist);
merah hanya zona Keluar; hijau/kuning dilarang kecuali status sinkron.
Checklist → temuan ditutup (`audit-mobile-settings.md` §2 + §5): Grouped layout
🔴→🟢, Native toggle (Switch shadcn konsisten, bukan tiruan per-OS) 🔴→🟢,
Destructive grouped 🔴→🟢, Account anchor 🔴→🟢 (nama+email+peran+posko),
Deep link 🔴→🟢 (banner offline → Notifikasi; prompt teks → `#aksesibilitas`),
Support 🔴→🟢, App version 🔴→🟢, Legal 🔴→🟢; Accessibility 8 item (target
WCAG 2.2 AA ditulis di panduan, kontras 12/12 terukur, fokus `focus-visible`,
pola keyboard, pustaka ARIA error/status/badge, uji TalkBack + VoiceOver,
annotation kit, 5 baris kontribusi).

## 10. Profil `/profil` — Web/Mobile Account + Profile (identitas operasional)

Sections berurutan (tiket `P0-16`):

1. Avatar inisial + nama + email + peran/posko (baca-saja kecuali password —
   "nama operasional, ubah via admin").
2. Ubah password (wajib autentikasi ulang: password lama + baru + konfirmasi).
3. Konfirmasi tersimpan (inline/`sonner`, tombol nonaktif sampai ada perubahan).
4. Bukan tempat data penyintas per orang (agregat saja — BZ).

Fokus layar: (1) jangkar identitas, (2) ubah password, (3) konfirmasi.
Keterbacaan: email ditampilkan penuh (jangkar identitas); password = 3 input +
aturan kekuatan singkat; tanpa foto profil (inisial cukup — mobile-profile
Photo/Bio/Links/Preview → ⚪ beralasan: tanpa profil publik antar-pengguna).
Highlight: sorotan primer = tombol Simpan navy (nonaktif sampai ada perubahan).
Merah hanya error/validasi; hijau hanya konfirmasi tersimpan; kuning dilarang.
Checklist → temuan ditutup (`audit-mobile-settings.md` §3–§4): Account Email
🔴→🟢 (tampil; ubah via admin), Password change 🔴→🟢 (+autentikasi ulang),
Save confirmation 🔴→🟢, Linked accounts ⚪ (tanpa OAuth), Delete/deactivate ⚪
(milik admin + audit log); Profile Public-fields-only 🟢 dipertahankan
(identitas operasional ≠ pengaturan akun), Display name 🟡→🟢 (aturan
publik-vs-internal tertulis).

## 11. Admin `/admin` — Admin Panel + Audit Log + User Management (desktop saja)

Sections berurutan (tiket `P1-01`, `P1-07`; guard peran admin; desktop saja —
di layar kecil tampil sebagai halaman biasa tanpa sidebar/tab):

1. Gambaran pemakaian (agregat lintas posko + ekspor CSV).
2. Manajemen user (undang, ubah peran, nonaktifkan — tanpa hapus mandiri).
3. Log audit kronologis (login, ubah peran, publikasi, pembatalan:
   siapa-kapan-apa dari hash chain).
4. Zona berbahaya terpisah (tutup workspace + konfirmasi ketik).

Fokus layar: (1) pemakaian + ekspor, (2) user bermasalah, (3) log terbaru.
Keterbacaan: tabel user + log mengikuti kontrak Data Table; zona berbahaya
terpisah visual + konfirmasi ketik (menutup observasi `window.prompt` di
`dasbor.tsx:81-92`).
Highlight: sorotan primer = ringkasan pemakaian (netral); merah hanya zona
berbahaya + nonaktifkan user; hijau/kuning mengikuti badge status yang sama.
Checklist → temuan ditutup (`audit-dashboard.md` §2): Role-based access 🟢
dipertahankan, User management 🔴→🟢, Usage overview 🟡→🟢 (+ekspor),
Audit log 🟡→🟢 (view kronologis), Danger zone (workspace → Pembatalan berfriksi
+ tutup workspace admin) 🟢; Organisation settings/Billing tetap ⚪ (bukan
workspace SaaS, tanpa langganan).

## Tabel ringkas: page → sections → checklist → temuan → fokus → highlight

| Page | Sections (berurutan) | Checklist menutup temuan apa | Fokus 1-2-3 | Highlight |
|---|---|---|---|---|
| `/` landing | Hero+kode+CTA; statistik; janji; langkah; footer; CTA bawah | Landing Page 8 item; Typography; Color | H1+kolom kode; CTA; statistik | Primer navy CTA; merah/kuning/hijau dilarang |
| `/transparansi` | Filter/cari; kartu selisih; empty state | List View; Empty State; Data Table cari/filter/paginasi/loading | Badge status; angka selisih; filter | Badge = sorotan; merah bila Kurang |
| `/m/[kode]` | Header TERKUNCI+QR; tabel item; timeline; pembatalan; ketidaksesuaian | Single Item Detail 7 item; Data Table | Status kunci; item; timeline | Badge TERKUNCI hijau; kuning kartu masalah |
| `/s/[kode]` | Header+izin sumber; progress; pemakai | Single Item Detail; List View | Kode; progress; pemakai | Progress netral; hijau bila penuh |
| `/masuk` | Logo+judul; email+password+ingat; error; demo; redirect | Login Web App 7 item; input-error flow | Judul+email; password+Masuk; error | Primer navy Masuk; merah hanya error |
| `/beranda` | Sapaan+ringkasan; hero angka; aksi primer; aktivitas; Keluar | Dashboard 7 item (Welcome🟡 Metrics🟡 Activity🔴 Actions🟡) | Ringkasan; aksi; aktivitas | Aksi navy; merah bila Perlu Dicek |
| `/bpbd` | Metrik+refresh; Perlu Dicek; tabel antrean; batang+prioritas+ekspor; Buat Manifest | Data Table 9; Analytics 7; Dashboard | Perlu Dicek; antrean; prioritas | Perlu Dicek merah; FEFO kuning; Setuju hijau |
| `/bpbd/kirim` | Posko; tabel batch FEFO; draf+peringatan; kunci→MNF+QR | Data Table; Multi-step form; Empty/loading | Posko; batch; kunci | Primer navy Kunci; kuning FEFO |
| `/gudang` | Intake; hasil DNT; tabel batch; empty | Dashboard; Data Table; Empty State | Form; kode DNT; tabel | Catat navy; hasil hijau |
| `/posko` | Snapshot 6 angka; banner verifikasi; jatah; terima; ketidaksesuaian | Dashboard; input-error; Empty State | Banner revisi; form/terima; jatah | Revisi merah; terima navy; Diterima hijau |
| `/tim` | Tugas+batas; check-in; kendala/darurat; offline | Mobile Dashboard; Tab Bar badge/fixed/tap | Tugas; check-in; offline | Check-in navy; lewat-batas merah |
| `/pengaturan` | Akun→profil; notifikasi; `#aksesibilitas`; bantuan; legal+versi; zona Keluar | Settings Web+Mbl 15 item; Accessibility 8; Help | Jangkar akun; grup tujuan; zona bawah | Netral; merah hanya Keluar |
| `/profil` | Identitas; password+reauth; konfirmasi | Account Web+Mbl; Profile (Photo/Bio/Preview/Links ⚪) | Identitas; password; konfirmasi | Simpan navy; hijau tersimpan |
| `/admin` | Pemakaian+ekspor; user; log audit; danger ketik | Admin Panel 7; Audit Log; User Mgmt | Pemakaian; user; log | Netral; merah danger/nonaktif |

## Status

- **PASS** — 14/14 page terpetakan (9 grup tugasan + `/beranda` + `/admin`
  eksplisit; `#aksesibilitas` tetap section `/pengaturan`, bukan route).
- Temuan tertutup: **65 item checklist** (31 `audit-dashboard.md`: Dashboard 7,
  Admin Panel 7, Data Table 9, Analytics 7; 34 `audit-mobile-settings.md`:
  Tab Bar 7, Settings 8, Account 5, Profile 6, Accessibility 8). Item ⚪
  (SSO, Sign-up, Billing, Organisation settings, Date-range, Hover-actions,
  foto/bio profil, hapus-akun mandiri) dicatat sebagai keputusan sadar dengan
  alasan, bukan kegagalan. `Can't tell` tersisa: haptic tab (uji perangkat),
  render akhir kontras/fokus (perlu screenshot — sesuai `references/audit.md`).
