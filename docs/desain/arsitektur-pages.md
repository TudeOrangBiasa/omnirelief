# Arsitektur pages OmniRelief (IA final)

SHA diaudit: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`.
Sumber: `docs/PAGES.md`, `docs/GOALS.md`, `GLOSSARY.md`, `docs/NASKAH-VIDEO.md`, `AGENTS.md`, `apps/web/src/app/*` (read-only).
Checklist: Landing Page (Website), Dashboard (Web app), Login (Web app), Settings (Web app), Admin Panel (Web app), Tab Bar Navigation + Settings (Mobile app). Mode: penetapan IA — bukan audit item-per-item; detail visual per checklist dikerjakan file audit peer (`docs/desain/audit-*.md`, milik worker lain) dan menjadi dependen tiket di `docs/desain/tiket.md`.

Aturan global yang mengikat semua page (dari `AGENTS.md`): UI Indonesia sederhana, tombol min 48px (`min-h-12`), status selalu warna + label teks, light saja, komponen `@omnirelief/ui` + token semantik, tanpa warna arbitrary baru. Istilah ikut `GLOSSARY.md`: posko, penyintas, snapshot penyintas, verifikasi, sumbangan (`DNT-*`), batch, manifest (`MNF-*`), hash chain, FEFO, selisih, check-in, Perlu Dicek, konfirmasi terima, ketidaksesuaian, pembatalan.

## 1. Daftar pages final (14 routes)

| # | Route | Peran | Tujuan (1 kalimat) | Sections |
|---|---|---|---|---|
| 1 | `/` landing | Publik | Meyakinkan pengunjung bahwa selisih per posko terlihat dan bisa dilacak. | Hero 2 baris + kolom kode auto-deteksi MNF/DNT + CTA; 3 statistik hidup; 4 janji; 3 langkah; footer resmi; CTA bawah berulang |
| 2 | `/transparansi` | Publik | Menjawab "posko mana yang kurang" dalam sekali lihat. | Filter/cari 2 kolom; kartu per posko (butuh, dikirim, diterima, selisih + badge Kurang merah / Aman hijau); empty state |
| 3 | `/m/[kode]` detail manifest | Publik | Membuktikan satu kiriman terkunci dan riwayatnya utuh. | Header kode + badge TERKUNCI + hash pendek + QR + salin tautan; tabel item + batch; timeline append-only; kartu pembatalan; kartu ketidaksesuaian kuning; tanpa tombol edit/hapus dalam kondisi apa pun |
| 4 | `/s/[kode]` detail sumbangan | Publik/donatur | Menunjukkan ke mana satu sumbangan mengalir. | Header kode + item + sumber (hanya bila izin); progress alokasi; daftar manifest pemakai |
| 5 | `/masuk` | Publik (menuju internal) | Mengantar tiap peran masuk tanpa tebak-tebakan. | Email + password + tampil/sembunyi password; ingat saya; error jelas; info akun demo (password tidak diketik di layar saat demo); lempar yang sudah login ke `/beranda`; tanpa daftar akun publik / tanpa SSO (⚪, akun dibuat admin) |
| 6 | `/beranda` rumah peran | Semua login | Mengorientasi ulang: siapa saya, apa satu aksi berikutnya. | Sapaan + nama + peran; ringkasan sejak kunjungan terakhir (Antrean saya / Perlu Dicek bila ada); satu tombol aksi primer per peran; aktivitas terakhir; tombol Keluar |
| 7 | `/bpbd` command center | BPBD | Memutuskan verifikasi dan mengejar yang telat. | Antrean verifikasi (3 putusan: setujui, minta revisi, tolak) + prioritas; seksi Perlu Dicek + batalkan; ringkasan metrik (menunggu, selisih merah, terkunci hari ini) |
| 8 | `/bpbd/kirim` buat manifest | BPBD | Menerbitkan kiriman yang terkunci dan bisa di-QR. | Pilih posko; pilih batch urutan FEFO (label kedaluwarsa); tambah baris; simpan draf; baca peringatan FEFO; publikasikan dan kunci → kode `MNF-*` + QR |
| 9 | `/gudang` intake | Gudang | Mencatat sumbangan masuk dan menerbitkan kode lacaknya. | Form item + jumlah + kedaluwarsa + sumber + izin tampil nama; hasil: kode sumbangan `DNT-*`; riwayat batch hari ini |
| 10 | `/posko` lapor + terima | Posko | Melapor kebutuhan dan menutup selisih saat barang tiba. | Form snapshot penyintas 6 angka + simpan draf + status verifikasi (banner Minta Revisi); daftar bantuan + konfirmasi terima + lapor masalah (ketidaksesuaian: kurang/rusak/tidak sesuai/tidak diterima/kirim ulang) |
| 11 | `/tim` antar + kabar | Tim | Mengantar hari ini dan memberi kabar agar tidak dicek darurat. | Tugas hari ini; 4 tombol status + check-in; lapor kendala + darurat; indikator antrean offline (Menunggu Sinkronisasi → terkirim otomatis) |
| 12 | `/pengaturan` settings hub | Semua login | Satu tempat mengatur akun, notifikasi, dan aksesibilitas. | Akun (tautan ke `/profil`); notifikasi per jenis; aksesibilitas (anchor `#aksesibilitas`: ukuran teks, kontras, gerak); bantuan + versi app + legal; zona berbahaya (Keluar; tanpa hapus akun mandiri — lewat admin) |
| 13 | `/profil` akun privat | Semua login | Melihat dan mengubah data diri sendiri. | Avatar + nama + email + peran/posko; ubah password (wajib autentikasi ulang); BZ: tanpa data penyintas per orang (agregat saja) |
| 14 | `/admin` dashboard admin | Admin, desktop saja | Mengelola orang dan melihat pemakaian tanpa campur ke operasional. | Gambaran pemakaian + ekspor; manajemen user (undang, ubah peran, nonaktifkan); log audit (login, ubah peran, publikasi, pembatalan); zona berbahaya terpisah (tutup workspace, konfirmasi ketik) |

Catatan: `/aksesibilitas` bukan route sendiri — ia section `#aksesibilitas` di dalam `/pengaturan` (satu pola settings, sesuai checklist Settings Web/Mobile). `/profil` route sendiri agar anchor "akun siapa ini" selalu di atas (checklist mobile-settings: account details at top).

## 2. Navigasi desktop (sidebar) vs mobile (4 tab + Lainnya)

Prinsip: sidebar desktop boleh lengkap per peran; bottom-nav mobile maksimal 4 tab (checklist Tab Bar: 3–5, tiap tab ikon + label, target ≥44pt — repo menaikkan ke 48px).

Desktop sidebar (per peran, selalu diawali Beranda):

- Publik (belum login): Landing `/`, Transparansi `/transparansi`, Masuk `/masuk`.
- BPBD: Beranda, BPBD `/bpbd`, Buat manifest `/bpbd/kirim`, Transparansi, Pengaturan.
- Gudang: Beranda, Gudang `/gudang`, Transparansi, Pengaturan.
- Posko: Beranda, Posko `/posko`, Transparansi, Pengaturan.
- Tim: Beranda, Tugas `/tim`, Transparansi, Pengaturan.
- Admin: Beranda, Admin `/admin`, Transparansi, Pengaturan. (`/admin` desktop saja; di layar kecil tampil sebagai halaman biasa tanpa sidebar, bukan tab.)

Header desktop: logo + nama peran/posko + badge offline (Menunggu Sinkronisasi, bila ada) + avatar (tautan `/profil`).

Mobile bottom-nav (maks 4 tab + `Lainnya`):

| Peran | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Isi `Lainnya` (sheet) |
|---|---|---|---|---|---|
| Publik | Beranda `/` | Cek kode (fokus ke kolom hero `/`) | Transparansi | Lainnya | Masuk, Bantuan, Tentang |
| BPBD | Beranda | Verifikasi `/bpbd` (badge jumlah antrean) | Kirim `/bpbd/kirim` | Lainnya | Transparansi, Profil, Pengaturan, Keluar |
| Gudang | Beranda | Catat `/gudang` | Transparansi | Lainnya | Profil, Pengaturan, Keluar |
| Posko | Beranda | Lapor `/posko` | Bantuan `/posko` (tab dalam page: terima) | Lainnya | Transparansi, Profil, Pengaturan, Keluar |
| Tim | Beranda | Tugas `/tim` (badge Perlu Dicek bila ada) | Check-in (aksi dalam `/tim`) | Lainnya | Transparansi, Profil, Pengaturan, Keluar |

Aturan tab: ikon + label selalu (jangan ikon saja); tab aktif kontras tegas (warna + bobot, bukan warna saja); badge angka untuk antrean (verifikasi, Perlu Dicek, Menunggu Sinkronisasi — warna + angka, bukan titik saja); tab bar tetap di 4 rute atas, disembunyikan di halaman detail (`/m/*`, `/s/*`) dan alur formulir dalam agar tombol primer tidak tertutup.

Posisi settings/profile/accessibility: ikon avatar/settings selalu membuka `Lainnya` → Profil (`/profil`, data diri di atas) → Pengaturan (`/pengaturan`, grup: Akun, Notifikasi, Aksesibilitas, Bantuan, Tentang & versi, Keluar). Aksesibilitas = grup section di `/pengaturan#aksesibilitas` + deep-link dari tiap prompt terkait (mis. dari banner offline "butuh teks lebih besar? atur di sini" menaut langsung ke anchor itu).

## 3. Status warna + label (kontrak tiap page)

Setiap status tampil sebagai badge: warna + teks, tidak pernah warna saja. Pemetaan baku:

- Aman / Diterima / Disetujui / Terkunci: hijau + label.
- Kurang (selisih > 0) / Perlu Dicek / Minta Revisi: merah/kuning + label (`Kurang 40`, `Perlu Dicek`, `Minta Revisi`).
- Menunggu Verifikasi / Menunggu Sinkronisasi / Draf: abu/netral + label.
- Ditolak / Dibatalkan / Rusak (ketidaksesuaian): merah tua + label + alasan terlihat.
- FEFO mendesak (kedaluwarsa ≤ 7 hari): kuning + label `FEFO: kedaluwarsa X hari`.

## 4. Tombol 48px (kontrak tiap page)

Semua target sentuh primer/CTA/tab/bottom-nav `min-h-12` (48px). Pengecualian hanya teks-link inline; semua tombol aksi (verifikasi, publikasikan, konfirmasi terima, check-in, lapor darurat) full-width di mobile dan min 48px di desktop. Tidak ada CTA ganda sejajar yang memaksa target < 48px.

## 5. Keterkaitan dengan 9 kriteria juri (`docs/GOALS.md`)

1 → `/s/[kode]`; 2 → `/posko` + badge status; 3 → `/bpbd` 3 putusan + prioritas; 4 → `/bpbd/kirim` draf→kunci + QR; 5 → `/m/[kode]` tanpa edit/hapus + RLS; 6 → `/m/[kode]` + `/transparansi` timeline; 7 → `/tim` + `/bpbd` Perlu Dicek; 8 → `/posko` terima/lapor → kartu kuning `/m/[kode]`; 9 → antrean offline `/tim` (Menunggu Sinkronisasi). Alur video 5 menit (`docs/NASKAH-VIDEO.md`) dipetakan berurutan: Transparansi → Kirim → cek publik → antar-terima → rusak + donatur.

Worksheet check-types: n/a (murni markdown, tanpa token).
