# Audit Mobile: navigasi + settings + profil + aksesibilitas — OmniRelief

- SHA repo: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`
- Status: **ISSUES** (tidak ada bottom nav, tidak ada layar settings/akun/profil; fondasi sentuh & status sudah kuat)
- Mode: audit per checklist, terpisah per tabel. Urutan baris = urutan checklist, tanpa gabung/lewat.
- Yang direview (source-only): `apps/web/src/components/header.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/beranda/page.tsx`, `apps/web/src/app/masuk/page.tsx`, `apps/web/src/app/{bpbd,gudang,posko,tim}/*`, `apps/web/src/components/banner-offline.tsx`, `apps/web/src/lib/auth.ts`, `packages/ui/src/styles/globals.css` + komponen shadcn.
- Skill: `.agents/skills/checklist-design` (`SKILL.md`, `references/audit.md`, `references/index.md`).

> ⚠️ Audit ini dikerjakan murni dari source, tanpa screenshot atau perangkat. Baris soal tampilan nyata (kontras ter-render, bobot ikon aktif, haptic, perilaku keyboard) saya tandai ❔ + apa yang bisa memastikannya.

Aturan repo yang mengikat semua usulan: UI Indonesia sederhana, tombol min 48px (`min-h-12`), status selalu warna + label teks, light saja tanpa mode gelap, shadcn + token semantik (`AGENTS.md` butir 9). Istilah ikut `GLOSSARY.md` (posko, penyintas, manifest `MNF-*`, sumbangan `DNT-*`, selisih, Perlu Dicek).

## 1. Tab Bar Navigation — Mobile app

Sumber checklist: `mobile-tab-bar-navigation.md` — https://www.checklist.design/mobile/tab-bar-navigation

Fakta dasar: tidak ada bottom tab bar di repo. Navigasi hari ini = `header.tsx:4-15` (satu link "Home") + hub peran di `beranda/page.tsx:7-45` (satu CTA per peran + tombol Keluar). Jadi semua baris di bawah adalah keputusan greenfield, bukan penilaian layar yang ada.

| | Item | Why |
|---|---|---|
| 🔴 | **Tab count** — Limited to the most important destinations — 3 to 5 items is the typical range | Tidak ada tab bar sama sekali; navigasi tersebar (header 1 link, hub 1 CTA). Ikuti batas: usulan di bawah pakai 4 destinasi. |
| 🔴 | **Icon and label** — Each tab paired with both an icon and a text label | Tidak ada tab; tidak ada pasangan ikon+label. Saat bangun, wajib keduanya (label Indonesia, bukan ikon saja) karena ikon peran operasional tidak semuanya jelas. |
| 🔴 | **Active and default states** — Active should be visually distinct whether it's colour, border or icon weight | Tidak ada state aktif karena tidak ada tab. Token `--primary`/`--accent` sudah ada untuk dipakai; jangan andalkan warna saja — tambah bobot ikon/label. |
| 🔴 | **Badge counts** — Useful for tabs with unread counts like messages and notifications, updating in real time | Tidak ada badge. Peluang nyata: angka "Perlu Dicek" / tugas menunggu di tab Tugas (realtime via Supabase), bukan sekadar dekorasi. |
| 🔴 | **Fixed presence** — For the sections the tab bar applies to, tab bar should remain visible, and can be hidden on any page a level deeper | Tidak ada pola fixed/hide. Layout hari ini `layout.tsx:42-45` grid header+konten tanpa footer nav. Tentukan: tab tampil di 4 destinasi utama, sembunyi di alur dalam (formulir kirim, detail manifest). |
| 🟡 | **Tap target size** — Each tab at least 44×44pt to be reliably tappable with a thumb in any grip position | Belum ada tab untuk diukur, tapi standar repo (`min-h-12` = 48px di semua tombol/input: `beranda/page.tsx:40,49`, `masuk/page.tsx:48,58,63`) sudah melebihi 44pt — tinggal terapkan pola yang sama ke tab. |
| ❔ | **Haptic feedback** — A subtle tap haptic on tab selection confirming the action | Source tidak bisa menjawab rasa haptic. Web/PWA hanya punya `navigator.vibrate` yang kasar dan inkonsisten di iOS — perlu uji di perangkat; perlakukan sebagai opsional, bukan janji. Screenshot tidak membantu; uji perangkat yang menentukan. |

## 2. Settings — Mobile app

Sumber checklist: `mobile-settings.md` — https://www.checklist.design/mobile/settings

Fakta dasar: tidak ada layar settings. Satu-satunya "pengaturan akun" hari ini = tombol Keluar (`beranda/page.tsx:46-53`). Tidak ada pengelolaan notifikasi, preferensi, dukungan, versi, atau legal di aplikasi.

| | Item | Why |
|---|---|---|
| 🔴 | **Grouped table layout** — Settings organised into clearly labelled sections (Account, Notifications, Privacy, Support) using the native grouped list pattern | Tidak ada layar settings, jadi tidak ada pengelompokan. Usulan struktur ada di §6 — pakai pola grouped list web (section + heading), bukan satu daftar panjang. |
| 🔴 | **Native toggle controls** — Binary settings presented with the platform-native toggle switch (UISwitch on iOS, Material Switch on Android) | Tidak ada toggle di produk (PWA web). Produk web harus pakai Switch shadcn + token, konsisten di semua platform — jangan meniru UISwitch per-OS. |
| 🔴 | **Destructive actions grouped** — Log out, delete account, and other irreversible actions in their own section at the bottom, visually distinguished in red | Keluar ada tapi terpisah di hub (`beranda/page.tsx:46-53`), tanpa zona destruktif. Hapus-akun mandiri memang belum tentu cocok (akun operasional dikelola command center) — tapi Keluar tetap harus pindah ke zona bawah berlatar merah + label teks. |
| 🔴 | **Account details at top** — The user's avatar, name, and email shown prominently at the top of settings, a clear anchor for whose account is being managed | Hub hanya menampilkan nama + peran (`beranda/page.tsx:28-34`), tanpa email dan tanpa avatar. Jangkar "akun siapa ini" belum ada. |
| 🔴 | **Deep link to specific settings** — A direct link from relevant in-app prompts to the specific settings screen they reference — notification preferences, privacy, and so on. | Tidak ada layar tujuan untuk di-link. Kasus nyata: banner offline (`banner-offline.tsx:50-57`) dan prompt notifikasi (`pendaftaran-sw.tsx`) hanya teks — harus jadi link langsung ke bagian Notifikasi/PWA di settings. |
| 🔴 | **Support and feedback access** — A clear path to contact support, submit feedback, or access help documentation, accessible from within settings. | Tidak ada jalur bantuan di aplikasi. Kontak darurat command center + panduan per peran wajib ada — pengguna lapangan (posko, tim) tidak boleh menghafal nomor. |
| 🔴 | **App version** — The current app version shown at the bottom of settings — essential for support conversations and identifying build-specific issues. | Tidak ada versi di UI. Padahal PWA + antrean offline (`lib/offline.ts`) membuat "kamu di build berapa" penting saat lapor masalah sinkronisasi. |
| 🔴 | **Legal links** — Links to the Privacy Policy and Terms of Service accessible within settings, as required by app stores. | Tidak ada link Kebijakan Privasi / Syarat Layanan di aplikasi. Wajib sebelum rilis toko/PWA publik; berlaku juga untuk halaman transparansi publik. |

## 3. Account — Mobile app

Sumber checklist: `mobile-account.md` — https://www.checklist.design/mobile/account

Konteks produk: akun OmniRelief bersifat operasional (diterbitkan command center per peran: BPBD/GUDANG/POSKO/TIM, lihat `lib/auth.ts:4-11` + `masuk/page.tsx:68-71`), bukan akun yang dibuat sendiri. Ini mengubah bobot beberapa baris — tapi tidak menghapus kebutuhan dasarnya.

| | Item | Why |
|---|---|---|
| 🔴 | **Email** — The current email address displayed with an option to update it | Email tidak pernah ditampilkan (`getProfil` hanya ambil `id,nama,peran,posko_id` — `auth.ts:19-24`; hub hanya tulis nama). Ganti email mandiri tidak cocok untuk akun operasional, tapi *menampilkan* email saat ini wajib sebagai jangkar identitas. |
| 🔴 | **Password change** — A way for users to update their account password. | Tidak ada ganti password di aplikasi. Akun bersama per posko/tim membuat ini penting: kredensial bocor = peran operasional disalahgunakan. Minimal: ganti password dengan konfirmasi password lama. |
| ⚪ | **Linked accounts** — A view of which third-party accounts are connected for sign-in or data access, with ability to disconnect | Not needed here — login hanya email+password Supabase internal (`masuk/page.tsx:16-25`), tanpa OAuth/pihak ketiga. Menambahkannya justru permukaan serang baru. |
| 🔴 | **Save confirmation** — Clear feedback that changes have been saved, either inline or as a toast | Tidak ada perubahan yang bisa disimpan, jadi tidak ada konfirmasi. Pola yang benar sudah ada untuk ditiru: `role="status"` + token success (`posko/formulir.tsx:95`, `posko/bantuan.tsx:88`) dan `sonner.tsx` — pakai saat layar akun dibangun. |
| 🔴 | **Delete or deactivate account** — Options to deactivate or permanently delete the account, clearly separated from other settings | Tidak ada, dan untuk akun operasional ini benar milik admin/BPBD, bukan tombol mandiri. Yang dibutuhkan: admin menonaktifkan akun per peran + audit log-nya — jangan taruh "hapus akun saya" di tangan tim lapangan. |

## 4. Profile — Mobile app

Sumber checklist: `mobile-profile.md` — https://www.checklist.design/mobile/profile

Konteks produk: checklist ini soal identitas *publik* yang dilihat orang lain. OmniRelief tidak punya profil publik antar-pengguna — wajah publiknya adalah posko, manifest, dan sumbangan (halaman `/transparansi`, `/m/[kode]`, `/s/[kode]`), bukan orang. Jadi hampir semua baris ⚪ dengan sengaja, dan "profil" di sini harus dibaca sebagai *identitas operasional* (nama + peran + posko).

| | Item | Why |
|---|---|---|
| ⚪ | **Profile photo** — An option to set an avatar image, either from the camera roll or by taking a new photo | Not needed here — tidak ada identitas publik antar-pengguna; avatar foto menambah biaya (kamera, crop, storage) tanpa nilai transparansi. Inisial nama + label peran cukup. |
| 🟡 | **Display name and/or username** — The name shown publicly and the handle used to identify the account in @mentions or search | Ada sebagian: `profil.nama` + `peran` tampil di hub (`beranda/page.tsx:28-34`). Tapi tidak ada aturan mana yang publik vs internal, dan tidak bisa diedit — cukupkan sebagai "nama operasional (baca-saja, ubah via admin)". |
| ⚪ | **Bio** — A short text field where users can describe themselves or their work | Not needed here — bio personal tidak relevan untuk rantai pasok darurat; yang dideskripsikan adalah posko, bukan orang. |
| 🟢 | **Public fields only** — The screen contains only information visible to other users, private account settings are kept on a separate screen | Terpenuhi secara struktural hari ini: tidak ada layar campuran karena tidak ada layar profil sama sekali, dan data sensitif (stok, verifikasi) terkunci per peran via `requireRole`. Saat membangun, pertahankan: identitas operasional ≠ pengaturan akun. |
| ⚪ | **Profile preview** — A read-only view of how the profile will appear to other users, available before saving. | Not needed here — tanpa profil publik yang bisa diedit, tidak ada pratinjau yang perlu dibuat. |
| ⚪ | **External links (if relevant)** — Optional fields for linking to a website, portfolio, or other social accounts | Not needed here — tautan eksternal personal tidak ada tempatnya di produk ini. |

## 5. Accessibility — Design system

Sumber checklist: `design-system-accessibility.md` — https://www.checklist.design/design-system/accessibility

Fakta dasar: fondasi komponen bagus (shadcn: `focus-visible` ring, `aria-invalid`, `role="alert"/"status"` dipakai konsisten), tapi tidak ada target, standar, atau pengujian aksesibilitas yang terdokumentasi di repo.

| | Item | Why |
|---|---|---|
| 🔴 | **Target conformance level** — The WCAG conformance target the team has committed to documented and referenced in contribution guidelines. AA as a baseline for most products, with AAA achievable for specific criteria such as text contrast. | Tidak ada target WCAG di `AGENTS.md`, `docs/`, atau `packages/ui`. Usul: tetapkan **WCAG 2.2 AA** sebagai baseline, tulis satu baris di `AGENTS.md` + checklist kontribusi. |
| 🟡 | **Colour contrast standards** — The contrast ratios verified across all text and interactive element colour combinations (4.5:1 for normal text, 3:1 for large text and UI components) | Token punya pasangan bg+fg (`--success-bg`/`--success`, `--warning-bg`/`--warning`, `--info-bg`/`--info`, `globals.css:24-29`) dan status selalu warna+label (aturan repo) — arahnya benar. Tapi tidak ada bukti rasio terverifikasi; pasangan seperti `--warning #b45309` di atas `#fef3c7` dan `--muted-foreground #5b6b7f` perlu diukur, bukan diasumsikan. ❔ untuk angka pastinya sampai ada uji kontras ter-render. |
| 🟡 | **Focus indicator design** — A visible, high-contrast focus indicator designed for every interactive component | Komponen shadcn membawa `focus-visible:ring-*` (`button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`) dan base memakai `outline-ring/50` (`globals.css:99-108`) — hadir di kode. Tapi tanpa screenshot/keyboard-walkthrough, tidak bisa konfirmasi terlihat jelas di atas semua latar (khususnya tombol primer `#0F3B5F`). |
| 🔴 | **Keyboard navigation patterns** — Standard keyboard interaction patterns documented and applied consistently e.g. arrow keys for menus and listboxes, Enter and Space for activation, Escape for dismissal | Tidak ada pola keyboard yang didokumentasikan. Dropdown/select shadcn mewarisi perilaku Radix, tapi tidak ada yang menyatakannya sebagai kontrak — alur formulir posko/gudang (pengguna keyboard + perangkat murah) butuh urutan Tab yang disengaja. |
| 🟡 | **ARIA pattern library** — Attributes that make web content accessible to those who use assistive technologies with roles, states, and properties defined for every interactive component pattern | Fondasi ada (`role="alert"` di semua error form, `role="status"` di banner antrean, `aria-invalid` di input) tapi tidak ada pustaka/kontrak tertulis — tiap layar mengulang pola sendiri. Tulis satu tabel pola (error, status sinkron, badge status) agar konsisten. |
| 🔴 | **Screen reader testing** — Components tested with at least VoiceOver on Safari and NVDA on Chrome before shipping | Tidak ada bukti uji screen reader di repo. Targetkan TalkBack (Android murah lapangan) + VoiceOver; skrip uji minimal: masuk → input snapshot → baca status selisih → badge Perlu Dicek. |
| 🔴 | **Accessibility annotations in design** — A shared annotation kit used in design files to specify ARIA labels, roles, reading order, and focus behaviour | Tidak ada annotation kit. Untuk revamp ini, tiap desain settings/nav harus mencantumkan label aksesibel, urutan baca, dan perilaku fokus — bukan sekadar tampilan. |
| 🔴 | **Accessibility in contribution guidelines** — Ensuring accessibility requirements are part of the component contribution checklist | `AGENTS.md` menyebut 48px + warna+label (bagus) tapi tanpa checklist kontribusi aksesibilitas: kontras, fokus, nama aksesibel, uji keyboard/SR. Tambahkan 5 baris itu. |

Pengamatan di luar checklist (satu saja): tidak ada `prefers-reduced-motion` di CSS dan tidak ada kontrol gerak/teks di produk — padahal PWA lapangan dipakai di perangkat murah dengan animasi yang mengganggu. Masuk ke usulan §7.

## 6. Bedah: bottom nav max 4 destinasi

Prinsip: satu peran = satu tugas utama. Tab sama untuk semua peran (konsisten, mudah diajarkan), isi tab ke-2 mengikuti peran. Tab tampil di 4 destinasi; sembunyi di layar dalam (formulir kirim, detail manifest/sumbangan, alur masuk).

| # | Tab (label ID) | Ikon | Isi | Kapan muncul |
|---|---|---|---|---|
| 1 | Beranda | Home | Ringkasan peran: angka butuh/dikirim/selisih posko saya (atau pantauan BPBD), CTA utama | Selalu; default saat buka |
| 2 | Tugas | ClipboardList (BPBD/GUDANG/POSKO) · Truck (TIM) | Tugas peran: verifikasi (BPBD), intake batch (GUDANG), snapshot + bantuan (POSKO), daftar kiriman + check-in (TIM). **Badge angka** = hal menunggu (Perlu Dicek / belum verifikasi) | Selalu; badge hanya bila ada tunggakan, sembunyi bila nol |
| 3 | Lacak | Search (dengan QR) | Pelacakan publik `MNF-*`/`DNT-*` — kolom kode + hasil, sama untuk semua peran | Selalu |
| 4 | Akun | User | Jangkar identitas (nama, email, peran, posko) + link ke Pengaturan + Keluar | Selalu; pengaturan sebagai layar dalam dari sini |

Aturan main: ikon + label Indonesia selalu berpasangan; tab aktif beda warna primer + ikon filled/bold + label semibold (jangan warna saja); tiap tab `min-h-12` (48px, ikut standar repo) dengan `aria-current="page"`; badge berupa angka dengan label aksesibel ("3 perlu dicek"), titik hanya untuk status non-hitung.

## 7. Bedah: settings vs pengaturan profil — pemisahan

Satu layar "Akun" (tab 4) sebagai pintu, dua layar dalam yang berbeda tujuan:

**A. Profil operasional** (siapa saya di rantai pasok — sebagian besar baca-saja):
- Nama, email, peran, posko terdaftar (inisial + teks, tanpa foto).
- Ubah nama/email → diajukan ke admin/BPBD (bukan edit langsung — akun operasional).
- Ganti password (wajib isi password lama) — satu-satunya edit mandiri.

**B. Pengaturan** (bagaimana aplikasi berperilaku — grouped list):
1. **Notifikasi & sinkron** — toggle push per peristiwa (Perlu Dicek, verifikasi diputus, manifest terbit); status PWA/offline + tombol "kirim antrean sekarang"; deep-link dari banner offline ke sini.
2. **Aksesibilitas** (detail §8) — ukuran teks, kontras tinggi, kurangi gerakan.
3. **Bantuan** — hubungi command center (jalur darurat), panduan per peran, kirim masukan, versi aplikasi + status sinkron (build + sisa antrean).
4. **Tentang & legal** — Kebijakan Privasi, Syarat Layanan, hash build.
5. **Zona berbahaya** (paling bawah, teks merah + label) — Keluar. Tanpa "hapus akun saya" (milik admin BPBD + tercatat).

## 8. Bedah: accessibility settings

Tetap light-only (aturan repo) — "kontras tinggi" berarti memperkuat pasangan light, bukan mode gelap.

- **Ukuran teks** — 3 pilihan: Standar / Besar / Sangat besar (skala `1 / 1.125 / 1.25` via class di `<html>`, `rem`-based). Pratinjau langsung satu kalimat + tombol contoh. Default Standar; tersimpan per perangkat.
- **Kontras tinggi** — toggle yang menaikkan pasangan teks ke ≥ 7:1 (muted-foreground digelapkan, badge status jadi teks pekat di atas tint + border). Selalu pertahankan warna + label teks (jangan hapus warna saat kontras naik). Hormati juga `prefers-contrast: more` dari OS bila toggle belum disentuh.
- **Target sentuh 48px** — bukan pengaturan, melainkan jaminan: semua kontrol interaktif (termasuk tab dan item settings) min 48×48, sesuai standar repo hari ini. Tidak boleh ada opsi "mode ringkas" yang mengecilkannya.
- **Kurangi gerakan** — toggle + hormati `prefers-reduced-motion`: matikan animasi/transisi non-esensial (loading, slide banner), pertahankan umpan balik status instan. Default ikut OS.
- **Navigasi keyboard & SR** — bukan toggle, tapi kontrak: urutan Tab logis di settings, setiap toggle punya nama aksesibel Indonesia ("Kontras tinggi, nonaktif"), badge tab dibaca ("Tugas, 3 perlu dicek"), error form `role="alert"` + sebut bidangnya.

## 9. Risiko & langkah berikut

1. Tanpa layar settings, utang aksesibilitas menumpuk di tempat tak terlihat (legal, versi, bantuan) — bangun Akun+Pengaturan sebelum menambah fitur peran.
2. Badge "Perlu Dicek" realtime adalah nilai terbesar tab bar; tanpa itu tab bar hanya hiasan — prioritaskan umpan data badge, bukan pixel tab.
3. Verifikasi kontras pasangan tint (`warning-bg`, `success-bg`, `info-bg`) + keyboard-walkthrough + satu sesi TalkBack sebelum klaim AA.

---

- File output: `docs/desain/audit-mobile-settings.md` (satu-satunya file yang ditulis).
- Checklist dibaca: `mobile-tab-bar-navigation.md`, `mobile-settings.md`, `mobile-account.md`, `mobile-profile.md`, `design-system-accessibility.md` + `SKILL.md`, `references/audit.md`, `references/index.md`, `AGENTS.md`, `GLOSSARY.md`.
- Worksheet check-types: n/a (murni markdown, tanpa sentuh token/kode).
