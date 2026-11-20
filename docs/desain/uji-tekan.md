# Uji-tekan komponen revamp OmniRelief

- SHA yang dirancang: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`
- Sifat: spesifikasi uji-tekan tahap desain (docs), bukan kode app. Tidak ada route/harness di `apps/web` — harness throwaway dibangun saat implementasi.
- Acuan: `docs/desain/arsitektur-pages.md`, `docs/desain/tiket.md`, `docs/desain/token-warna-oklch.md`, `docs/desain/audit-mobile-settings.md`, `docs/desain/audit-dashboard.md`, `AGENTS.md`, `GLOSSARY.md`.
- Sumbu skenario: `craft-break` `SKILL.md` + `SCENARIOS.md` (Content length, Content shape, Quantity, Container, State, Environment).
- `arsitektur-komponen.md` belum ada saat dokumen ini ditulis — daftar sasaran memakai daftar kontrak: StatusBadge, KartuPosko, TimelineHash, ProgressAlokasi, BannerOffline, BottomNav, StepperAngka, tabel.
- Aturan mengikat tiap keputusan: UI Indonesia sederhana, tombol/input min 48px (`min-h-12`), status selalu warna + label teks, light-only, shadcn + token semantik, istilah GLOSSARY (posko, penyintas, manifest `MNF-*`, sumbangan `DNT-*`, selisih, Perlu Dicek).
- Tanda `[HARNESS]` = wajib diverifikasi visual di halaman throwaway saat implementasi (satu route buang, komponen asli diimpor utuh, satu kolom + label per skenario, hapus setelah selesai). Tanpa tanda = cukup diputuskan di desain/review kode.

---

## 1. StatusBadge

Menerima kunci status + label Indonesia, me-render lencana warna + teks (tidak pernah warna saja), tinggal di kartu posko, tabel antrean, timeline manifest, tab/bottom-nav, banner verifikasi.

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 1.1 | Label terpanjang nyata: `Menunggu Sinkronisasi` vs `Perlu Dicek` vs `FEFO: kedaluwarsa 2 hari` dalam kartu 320px. | Content length | Truncation dilarang untuk kata status — wrap ke 2 baris, badge tumbuh vertikal, min 48px sentuh tetap. [HARNESS] |
| 1.2 | Kode/nama posko terpanjang menempel badge: nama posko 80 karakter + badge `Kurang 12.450` satu baris. | Content length | Badge tidak menyusut: `shrink-0`, angka pakai tabular-nums, nama yang wrap/truncate (bukan badge). [HARNESS] |
| 1.3 | Angka ekstrem: `Kurang 1.250.000` dan `Kurang 0` berdampingan. | Content shape (angka) | Format `id-ID` dengan pemisah ribuan, lebar badge elastis; `Kurang 0` dilarang tampil — ganti `Aman` hijau. Tanpa tanda harness (aturan logika, cukup unit test). |
| 1.4 | Badge angka antrean di tab: `9` vs `99` vs `1.240`. | Quantity + Container | Maks 2 digit + `99+` di tab (`99+ perlu dicek`, label aksesibel lengkap), angka penuh hanya di page. [HARNESS] |
| 1.5 | Status ganda bertumpuk: `Perlu Dicek` + `FEFO mendesak` + `Minta Revisi` pada satu kartu. | State | Maks 2 badge terlihat + `+1` chip ekspandabel; urutan: bahaya > peringatan > netral. [HARNESS] |
| 1.6 | Kontras di atas tiap latar (tint kartu, foto header, putih): badge kuning `Minta Revisi` di atas `warning-tint`. | Environment (light) | Pakai pasangan badge dari token (`warning-badge-fg` on `warning-badge-bg`, rasio ≥ 3.0 per `token-warna-oklch.md` §3) + border 1px; kuning murni dilarang. Tanpa harness desain (sudah terukur 5.26) — cek ulang hanya bila token berubah. |

Sumbu yang dibuang: Content shape RTL/emoji (label status dikontrol codebase, bukan teks pengguna — cue gagal) dan Environment dark-mode/haptic (repo light-only, web tanpa haptic janji — `audit-mobile-settings.md:27`).

---

## 2. KartuPosko

Menerima satu posko `{nama, butuh, dikirim, diterima, selisih + badge Kurang/Aman}`, me-render kartu selisih di `/transparansi` (2 kolom desktop, 1 kolom mobile).

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 2.1 | Nama posko 100 karakter tanpa spasi putus (`PoskoBalaiDesaSukamajuKecamatan...`). | Content length (unbreakable) | Nama wrap dengan `break-words`, min 2 baris disediakan; kartu tetangga tidak bergeser — grid `items-start`. [HARNESS] |
| 2.2 | Angka ekstrem: butuh `9.999.999`, dikirim `0`, selisih `9.999.999` vs semua nol. | Content shape (angka) | Angka tabular-nums rata kanan, label satuan `paket/jiwa` selalu di bawah angka (bukan di samping, agar tidak pepet); nol tampil `0`, bukan strip. [HARNESS] |
| 2.3 | Daftar 0 posko (filter tak cocok), 1 posko, 100 posko. | Quantity | Empty-state copy baku: judul `Tidak ada posko yang cocok`, isi `Ubah kata kunci atau kosongkan filter.`, tombol `Atur ulang filter` 48px; 100 posko = paginasi `1–20 dari N`, bukan render semua (`audit-dashboard.md:63`). [HARNESS untuk 0 dan 100] |
| 2.4 | Kartu di kontainer 320px vs kolom lebar desktop. | Container | Satu kolom 320px: 4 angka jadi 2×2 grid; lebar: 4 sebaris; badge selisih selalu baris sendiri full-width agar tidak terjepit sibling flex. [HARNESS] |
| 2.5 | State loading daftar (fetch Supabase lambat). | State | Skeleton kartu (4 baris abu berdenyut, `aria-busy`, teks `Memuat data posko…`), bukan spinner tengah dan bukan layar kosong (`audit-dashboard.md:66`). Tanpa harness throwaway (pola skeleton baku shadcn, cukup review). |
| 2.6 | State error fetch + offline. | State | Kartu error per seksi: `Gagal memuat. Periksa koneksi.` + tombol `Coba lagi` 48px; warna bukan satu-satunya sinyal (ikon + teks). Tanpa harness (pola error baku). |

Sumbu yang dibuang: Content shape RTL penuh (nama posko Indonesia/LTR; cukup tangani campuran arah bila ada nama Arab — tidak perlu harness khusus) dan Environment reduced-motion di luar skeleton (skeleton ikut `prefers-reduced-motion`, tanpa animasi denyut).

---

## 3. TimelineHash

Menerima daftar riwayat append-only `{waktu, aktor, aksi, hash pendek, hash sebelumnya}`, me-render garis waktu vertikal di `/m/[kode]` (publik, tanpa tombol edit/hapus dalam kondisi apa pun).

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 3.1 | Alasan pembatalan / ketidaksesuaian 500 karakter (satu paragraf panjang). | Content length | Teks wrap penuh, hash pendek `9f3a…c1` di baris meta terpisah `truncate` + tombol salin; isi laporan tidak pernah truncate (bukti publik). [HARNESS] |
| 3.2 | Hash 64 hex penuh vs hash pendek + kode `MNF-2026-000147` panjang. | Content length (unbreakable) | Tampil hash pendek 12 karakter + tooltip/salin penuh; kode `MNF-*` boleh `break-all` di mobile 320px. [HARNESS] |
| 3.3 | Riwayat 0 baris (manifest baru terkunci, belum ada peristiwa), 1 baris, 100 baris. | Quantity | 0 baris = empty-state `Belum ada riwayat. Manifest baru dikunci.` (bukan ruang kosong); 100 baris = daftar gulir penuh tanpa paginasi (append-only, publik harus bisa gulir utuh) + tautan lompat `Ke peristiwa terbaru`. [HARNESS untuk 100] |
| 3.4 | Nama aktor anonim: donatur tanpa izin tampil nama. | Content shape | Teks baku `Donatur anonim` (abu + label, bukan kosong/strip); tidak ada slot nama yang collapse saat string kosong. Tanpa harness (aturan copy). |
| 3.5 | Timeline di 320px: titik + garis + kartu berdampingan. | Container | Titik garis `shrink-0`, kartu `min-w-0 flex-1`; garis tidak putus saat kartu 3 baris. [HARNESS] |
| 3.6 | State kartunya: kartu pembatalan merah + kartu ketidaksesuaian kuning + baris normal campur. | State | Kartu status full-width dengan warna + label + alasan terlihat; pembatalan selalu di atas dengan `border-destructive`, tidak bisa dilipat-sembunyikan. [HARNESS] |

Sumbu yang dibuang: State loading-spinner (timeline publik di-render server dengan data; skeleton hanya untuk angka hero, bukan riwayat) dan Environment zoom di luar 320px (kontainer 320px sudah mewakili zoom 200%).

---

## 4. ProgressAlokasi

Menerima total batch sumbangan + pemakaian per manifest, me-render bilah progres alokasi di `/s/[kode]` + daftar manifest pemakai.

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 4.1 | Persen ekstrem: `0%`, `1%`, `99%`, `100%`, dan over-alokasi `>100%` (data salah). | Content shape (angka) | Label persen selalu di luar bilah (teks, bukan di dalam fill); `0%` = trek kosong + label `Belum dialokasikan`; `>100%` = bilah penuh merah + label `Perlu Dicek: data melebihi batch` (jangan potong visual). [HARNESS] |
| 4.2 | Daftar manifest pemakai: 0, 1, 50 pemakai. | Quantity | 0 = `Belum dipakai manifest mana pun.`; 50 = daftar кольor dengan `Lihat semua (50)` ekspansi, 5 pertama terlihat. [HARNESS untuk 50] |
| 4.3 | Nama item sumbangan 120 karakter + kode `DNT-2026-009931` di header 320px. | Content length + Container | Kode `DNT-*` satu baris `truncate` + tombol salin; nama item wrap 2 baris; progres di bawahnya full-width (tidak sejajar kode). [HARNESS] |
| 4.4 | State loading progres. | State | Skeleton bilah (trek abu statis + teks `Menghitung alokasi…`), bukan spinner; `role="progressbar"` dengan `aria-valuenow` sejak awal agar SR tidak baca lompatan. Tanpa harness. |

Sumbu yang dibuang: Content shape emoji/RTL (nama item pangan Indonesia; cukup `break-words`) dan Environment dark-mode (light-only).

---

## 5. BannerOffline

Menerima status koneksi + jumlah antrean `Menunggu Sinkronisasi`, me-render banner global (header desktop + atas konten mobile) dengan deep-link ke `/pengaturan#notifikasi`.

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 5.1 | Teks antrean ekstrem: `1 menunggu` vs `1.240 menunggu sinkronisasi`. | Content length + angka | Copy baku `Menunggu Sinkronisasi: N kiriman (terkirim otomatis)`; angka tabular, banner tumbuh 2 baris, tombol `Kirim sekarang` tetap 48px di kanan (wrap ke bawah di 320px, bukan pepet). [HARNESS] |
| 5.2 | Banner menempel di atas header + bottom-nav + tombol primer formulir. | Container | Banner `sticky top-0` di atas konten, tidak menutup CTA: CTA formulir punya `padding-bottom` cadangan; di mobile banner tidak menutupi tab ke-4. [HARNESS] |
| 5.3 | Offline total vs online tapi antrean belum terkirim vs gagal kirim. | State | Tiga copy berbeda (bukan satu): `Tidak ada koneksi — data tersimpan di perangkat.`, `N menunggu — terkirim otomatis.`, `Gagal mengirim N. Coba lagi.` + tombol aksi; warna + teks + ikon selalu bertiga. Tanpa harness (aturan copy, cukup review). |
| 5.4 | Pengguna mengetuk banner (target sentuh). | State | Seluruh banner bukan tombol raksasa: hanya tautan `Atur notifikasi` + tombol `Kirim sekarang` yang 48px; sisanya teks biasa (hindari salah ketuk darurat). Tanpa harness. |

Sumbu yang dibuang: Content shape RTL/emoji (copy banner dikontrol codebase) dan Quantity daftar (banner agregat satu angka, bukan list).

---

## 6. BottomNav

Menerima 4 tab per peran + isi sheet `Lainnya` + badge angka (antrean/Perlu Dicek/Menunggu Sinkronisasi), me-render tab bar mobile; disembunyikan di `/m/*`, `/s/*`, dan mode formulir.

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 6.1 | Label tab terpanjang: `Transparansi` vs `Tugas` + badge `99+` dalam 320px (4 tab × 80px). | Content length + Container | Label 11px max 2 kata, truncate tengah dilarang — singkatan baku (`Transparansi` tetap, ukuran tab fleksibel); badge angka di sudut ikon, bukan di label. [HARNESS] |
| 6.2 | Badge `0` vs `3` vs `1.240` + titik status non-hitung. | Quantity + angka | Badge sembunyi bila nol (bukan `0`); `99+` di atas 99; titik hanya untuk status non-hitung (offline), tidak untuk antrean. Tanpa harness (aturan logika). |
| 6.3 | Sheet `Lainnya`: 4 item vs 9 item (peran BPBD penuh). | Quantity | Sheet gulir vertikal max 80vh + pegangan; tiap baris 48px ikon + label; Keluar di zona bawah merah terpisah. [HARNESS untuk 9] |
| 6.4 | Tab aktif vs nonaktif bagi pengguna buta warna. | Environment | Aktif = warna primer + ikon filled/bold + label semibold + `aria-current="page"` (bukan warna saja, per `audit-mobile-settings.md:105`). [HARNESS: screenshot + keyboard-walkthrough] |
| 6.5 | Halaman detail `/m/MNF-…` dan formulir kirim: tab harus hilang. | State | Sembunyi total (bukan collapse) + CTA formulir full-width 48px; tidak ada tab mengambang menutup tombol `Publikasikan`. Tanpa harness (aturan routing, cukup review). |

Sumbu yang dibuang: Content shape emoji/RTL (label tab dikontrol codebase, Indonesia) dan State loading (tab statis per peran, badge angka update realtime tanpa skeleton tab).

---

## 7. StepperAngka

Menerima nilai + batas min/maks, me-render kontrol kurang/nilai/tambah untuk 6 angka snapshot penyintas di `/posko` (bayi, balita, ibu hamil, lansia, disabilitas, umum) + jumlah di form gudang.

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 7.1 | Nilai ekstrem: `0`, `999.999`, dan ketikan manual `abc` / `-5` / `1,5`. | Content shape (angka) | Input `inputmode="numeric"`, tolak huruf (tidak masuk state), clamp min 0 + pesan `role="alert"` sebut bidang (`Jumlah bayi tidak boleh kurang dari 0`); format ribuan `id-ID` saat blur, angka mentah saat fokus. [HARNESS] |
| 7.2 | Label kategori terpanjang (`Penyintas disabilitas`) + stepper di 320px. | Content length + Container | Label di atas (bukan samping), kontrol 3 kolom `48px-1fr-48px`; tombol −/+ tidak menyusut (`shrink-0`). [HARNESS] |
| 7.3 | Tekan-tahan tambah 50× cepat (ketuk beruntun lapangan). | State | Tiap ketuk update optimistis + debounce simpan draf; tidak ada kunci fokus hilang (fokus tetap di tombol). Tanpa harness throwaway (uji manual perangkat, bukan visual). |
| 7.4 | State disabled saat snapshot terkunci (menunggu verifikasi) + error `wajib diisi`. | State | Disabled = abu + label `Terkunci — menunggu verifikasi` (kontras tetap ≥ 3:1, bukan hilang); error = `aria-invalid` + teks merah + bidang disebut. Tanpa harness (pola form baku). |

Sumbu yang dibuang: Quantity list (6 bidang tetap, bukan list dinamis) dan Environment dark-mode (light-only).

---

## 8. Tabel (Antrean verifikasi / Prioritas selisih / Batch gudang)

Menerima baris + kolom sortir/filter + paginasi + seleksi massal + ekspor CSV, me-render tabel admin desktop padat (`/bpbd`, `/gudang`); di bawah 1024px degradasi ke kartu.

| # | Skenario (satu baris) | Sumbu | Keputusan desain yang dipaksa |
|---|---|---|---|
| 8.1 | Sel terpanjang: nama posko 80 karakter + kode `DNT-2026-009931 · Beras 50kg · sisa 1.240 · exp 12-02-2027` satu sel. | Content length (unbreakable) | Kolom kode/item `min-w-0 truncate` + tooltip + salin; kolom angka `whitespace-nowrap tabular-nums` rata kanan; baris tidak membesar — tinggi baris tetap, overflow di sel teks. [HARNESS] |
| 8.2 | Baris 0, 1, 1.240 (banjir snapshot) + filter tak cocok. | Quantity | Empty-state per tabel (`Tidak ada antrean.` + CTA `Buat manifest`) vs empty-filter (`Tidak cocok — Atur ulang filter`); 1.240 = paginasi `1–50 dari 1.240` + pilihan 25/50/100, tidak render semua (`audit-dashboard.md:63`). [HARNESS untuk 0-filter dan 1.240] |
| 8.3 | Sortir umur/urgensi + kolom kategori rentan (6 kolom angka) di layar 1024px. | Container | Header sortir dengan `aria-sort`, kolom kategori `hidden xl:table-cell` bertahap; tabel gulir horizontal dengan kolom pertama (nama/kode) sticky; tidak ada kolom yang hilang tanpa kontrol visibilitas. [HARNESS] |
| 8.4 | Seleksi massal 0 vs 8 vs 1.240 + aksi `Setujui terpilih`. | State | Bar aksi persisten `8 dipilih — Setujui / Minta revisi` (48px), alasan wajib untuk revisi/tolak; 1.240 = seleksi per halaman + `Pilih semua 1.240` eksplisit dua tahap. Tanpa harness (aturan interaksi). |
| 8.5 | State loading 1.240 baris + error + `diperbarui HH:MM`. | State | Skeleton 10 baris (bukan spinner), stempel `Diperbarui 14:32` + tombol `Muat ulang` 48px; error = baris penuh `Gagal memuat + Coba lagi`. Tanpa harness (pola baku). |
| 8.6 | Selisih `Kurang 12.450` merah di sel tabel bagi buta warna. | Environment | Warna + label teks + ikon (kontrak status); tidak ada sel warna saja. Tanpa harness (kontrak, bukan visual baru). |

Sumbu yang dibuang: Content shape emoji/RTL/di email (isi tabel kode + angka + nama posko Indonesia; campuran arah ditangani `truncate` umum) dan Environment gerak (tabel tanpa animasi non-esensial).

---

## Rekap

- Komponen: 8 (StatusBadge, KartuPosko, TimelineHash, ProgressAlokasi, BannerOffline, BottomNav, StepperAngka, Tabel).
- Skenario: 41 (6 + 6 + 6 + 4 + 4 + 5 + 4 + 6).
- Butuh halaman harness throwaway saat implementasi: 26 skenario bertanda [HARNESS] (1.1, 1.2, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.5, 3.6, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.3, 6.4, 7.1, 7.2, 8.1, 8.2, 8.3).
- Tidak butuh harness (cukup unit test/review copy): aturan angka `Kurang 0 → Aman`, copy empty-state/error/offline, `aria-sort`/`aria-current`, pola skeleton baku.
- Sumbu global yang selalu dibuang: dark-mode (repo light-only, `AGENTS.md` butir 9), haptic (opsional web, `audit-mobile-settings.md:27`), profil publik/bio (⚪ untuk produk ini, `audit-mobile-settings.md` §4).
