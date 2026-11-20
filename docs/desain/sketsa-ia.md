# Sketsa IA — dua kandidat + rekomendasi sintesis

- SHA yang dirancang: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`
- IA acuan yang digantikan/dilanjutkan: `docs/desain/arsitektur-pages.md` (14 routes, §1–§5).
- Sifat dokumen: rancangan IA (docs), bukan kode app. Read-only terhadap `apps/web`, `packages`, `supabase`.
- Aturan mengikat: UI Indonesia sederhana, tombol/input min 48px (`min-h-12`), status selalu warna + label teks, light-only, shadcn `@omnirelief/ui` + token semantik, istilah `GLOSSARY.md` (posko, penyintas, manifest `MNF-*`, sumbangan `DNT-*`, selisih, Perlu Dicek).

---

## Kandidat A — role-workspace IA (satu workspace per peran)

Struktur: satu workspace = satu peran = satu direktori route. Sidebar desktop dan 4 tab mobile mengikuti peran yang login.

### Peta route (turunan `arsitektur-pages.md` §1, tanpa menambah objek baru)

- Publik: `/` (landing + kolom kode auto-deteksi MNF/DNT), `/transparansi` (kartu selisih per posko), `/m/[kode]` (detail manifest terkunci, tanpa tombol edit/hapus dalam kondisi apa pun), `/s/[kode]` (detail sumbangan + progress alokasi), `/masuk` (tanpa daftar akun publik, tanpa SSO).
- `/beranda` — rumah peran: sapaan + nama + peran, ringkasan sejak kunjungan terakhir (Antrean saya / Perlu Dicek), satu tombol aksi primer per peran, aktivitas terakhir, tombol Keluar.
- `/bpbd` command center: antrean verifikasi 3 putusan (setujui / minta revisi / tolak) + prioritas + seksi Perlu Dicek + ringkasan metrik. `/bpbd/kirim`: pilih posko → pilih batch urutan FEFO berlabel kedaluwarsa → tambah baris → simpan draf → peringatan FEFO → publikasikan dan kunci → kode `MNF-*` + QR.
- `/gudang` intake: form item + jumlah + kedaluwarsa + sumber + izin tampil nama → kode `DNT-*` + riwayat batch hari ini.
- `/posko`: form snapshot penyintas 6 angka + simpan draf + banner status verifikasi (Minta Revisi eksplisit); daftar bantuan + konfirmasi terima + lapor masalah (ketidaksesuaian: kurang / rusak / tidak sesuai / tidak diterima / kirim ulang).
- `/tim`: tugas hari ini + 4 tombol status + check-in + lapor kendala/darurat + indikator antrean offline (Menunggu Sinkronisasi → terkirim otomatis).
- `/pengaturan` hub (Akun → `/profil`; Notifikasi; Aksesibilitas di `#aksesibilitas`; Bantuan + versi + legal; zona berbahaya: Keluar, tanpa hapus akun mandiri) + `/profil` (avatar inisial + nama + email + peran/posko, ubah password wajib autentikasi ulang).
- `/admin` (Admin, desktop saja): pemakaian + ekspor, undang/ubah peran/nonaktifkan user, log audit, zona berbahaya terpisah (konfirmasi ketik).

### Navigasi

- Desktop sidebar per peran, selalu diawali Beranda (sesuai `arsitektur-pages.md` §2):
  - BPBD: Beranda, BPBD `/bpbd`, Buat manifest `/bpbd/kirim`, Transparansi, Pengaturan.
  - Gudang: Beranda, Gudang `/gudang`, Transparansi, Pengaturan.
  - Posko: Beranda, Posko `/posko`, Transparansi, Pengaturan.
  - Tim: Beranda, Tugas `/tim`, Transparansi, Pengaturan.
  - Admin: Beranda, Admin `/admin`, Transparansi, Pengaturan.
- Header desktop: logo + nama peran/posko + badge offline (Menunggu Sinkronisasi, bila ada) + avatar (tautan `/profil`).
- Mobile bottom-nav maks 4 tab + `Lainnya` (sheet). Contoh: BPBD = Beranda, Verifikasi `/bpbd` (badge angka antrean), Kirim `/bpbd/kirim`, Lainnya; Tim = Beranda, Tugas `/tim` (badge Perlu Dicek), Check-in (aksi dalam `/tim`), Lainnya. Aturan tab: ikon + label selalu, tab aktif kontras tegas (warna + bobot), badge angka warna + angka (bukan titik saja), tab bar disembunyikan di `/m/*`, `/s/*`, dan mode formulir agar tombol primer tidak tertutup.

### Sections per workspace (pola berulang tiap workspace)

1. Hero ringkas peran (siapa saya + satu angka yang menentukan aksi hari ini).
2. Antrean/daftar kerja (satu-satunya daftar panjang di workspace itu).
3. Aksi primer (satu tombol full-width min 48px: publikasikan, catat, simpan snapshot, check-in).
4. Riwayat/aktivitas terakhir (tautan ke sumbernya).
5. Bantuan kontekstual (satu kalimat + tautan ke `/pengaturan` Bantuan).

### Kelebihan kandidat A

- Satu layar = satu tugas peran; mudah diajarkan ke operator lapangan ("punyamu yang ini saja").
- Guard peran 1:1 dengan route — `requireRole(["BPBD"])` di `apps/web/src/app/bpbd/page.tsx:5`, `["POSKO"]` di `apps/web/src/app/posko/page.tsx:6`, `["TIM"]` di `apps/web/src/app/tim/page.tsx:5` — tetap berlaku tanpa refactor izin.
- Badge antrean per tab memberi sinyal "ada kerjaan" tanpa membuka halaman (temuan `audit-mobile-settings.md` §6: badge Perlu Dicek adalah nilai terbesar tab bar).

### Kelemahan kandidat A

- Objek yang sama (satu manifest `MNF-*`) tampil di 3 workspace berbeda (BPBD kirim, Tim antar, Posko terima) dengan 3 salinan status — risiko status basi/tidak konsisten antar salinan.
- Duplikasi pola daftar + kartu status di tiap workspace (antren BPBD, riwayat gudang, bantuan posko, tugas tim) — kontributor cenderung copy-paste dan menyimpang.

---

## Kandidat B — journey/object-centric IA (objek inti sebagai pusat, peran sebagai izin aksi)

Struktur: tiga objek inti menjadi halaman pusat yang sama untuk semua peran; peran hanya menentukan **aksi mana yang terlihat/aktif** di atas objek yang sama (satu URL = satu kebenaran). Navigasi utama = objek + alur, bukan peran.

### Tiga objek pusat

1. **Manifest `MNF-*`** — `/manifest/[kode]` (pengganti `/m/[kode]` + gabungan status operasional):
   - Header: kode + badge TERKUNCI + hash pendek + QR + salin tautan; status selalu warna + label (Terkunci hijau, Perlu Dicek merah, Menunggu Sinkronisasi netral, Dibatalkan merah tua + alasan).
   - Timeline append-only (hash chain, tulis lewat `apps/web/src/lib/riwayat.ts`; aturan repo `AGENTS.md` butir 6: tidak ada edit diam-diam) + kartu pembatalan + kartu ketidaksesuaian kuning; nol tombol edit/hapus dalam kondisi apa pun.
   - Aksi kontekstual per peran di objek yang sama: BPBD = batalkan (dialog berfriksi: alasan wajib + ringkasan dampak + konfirmasi ketik kode — menutup temuan `audit-dashboard.md` §7 observasi 1 soal `window.prompt` di `apps/web/src/app/bpbd/dasbor.tsx:81-92`); Tim = check-in + lapor kendala/darurat; Posko = konfirmasi terima + lapor ketidaksesuaian. Peran tanpa izin melihat aksi sebagai tombol disabled berlabel alasan ("Hanya BPBD", "Hanya posko tujuan") — bukan tombol hilang — agar expected-behavior jelas.
2. **Posko** — `/posko/[id]` (gabungan kartu transparansi + snapshot + bantuan):
   - Header: nama posko + badge Kurang merah / Aman hijau + angka butuh / dikirim / diterima / selisih (angka tidak pernah digabung antar posko — `GLOSSARY.md`: posko = unit transparansi).
   - Sections: kebutuhan & selisih (grafik batang + tabel), snapshot penyintas + status verifikasi (banner Minta Revisi), bantuan masuk + konfirmasi terima, ketidaksesuaian terbuka.
   - Aksi per peran: Posko = lapor snapshot + konfirmasi terima; BPBD = verifikasi snapshot + buat manifest untuk posko ini; Gudang/Tim = baca-saja + lacak batch terkait.
3. **Sumbangan `DNT-*` / batch** — `/sumbangan/[kode]` (pengganti `/s/[kode]` + tabel batch gudang):
   - Header kode + item + sumber (hanya bila izin tampil nama) + progress alokasi + daftar manifest pemakai.
   - Sections: sisa per batch + kedaluwarsa + label FEFO (`FEFO: kedaluwarsa X hari`, kuning + label), riwayat pemakaian batch, intake baru (Gudang saja).

### Navigasi object-centric

- Desktop sidebar global (sama untuk semua peran): Beranda, Manifest, Posko, Sumbangan, Transparansi, Pengaturan. Peran memengaruhi **badge dan aksi**, bukan struktur: BPBD melihat badge angka verifikasi di tab Manifest; Tim melihat badge Perlu Dicek di Manifest; Posko melihat badge Minta Revisi di Posko saya.
- Mobile 4 tab (sama untuk semua peran — konsisten, mudah diajarkan, sesuai usulan `audit-mobile-settings.md` §6): Beranda, Tugas (antrean kerja saya lintas objek — verifikasi / intake / lapor / antar), Lacak (kolom kode MNF/DNT + hasil, sama untuk semua peran), Akun (jangkar identitas + tautan Pengaturan + Keluar). `Lainnya` tidak perlu — Pengaturan dijangkau dari Akun.
- `/beranda` menjadi "Tugas saya lintas objek" (bukan hub pindah workspace): sapaan + peran + daftar kerja gabungan (urut kritis: Perlu Dicek > Minta Revisi > antrean) + aktivitas terakhir. Satu pola daftar, satu pola badge, dipakai semua peran.

### Sections per halaman objek (pola tunggal, dipakai ulang)

1. Header objek (kode/nama + badge status + aksi salin/QR).
2. Status & angka (hero figures: selisih / sisa / progress alokasi).
3. Timeline/riwayat append-only.
4. Aksi kontekstual (daftar aksi yang diizinkan peranku; yang lain disabled beralasan).
5. Bantuan + legal mini (satu baris).

### Kelebihan kandidat B

- Satu URL = satu kebenaran: tidak ada tiga salinan status manifest; publik (`/m/[kode]`) dan operator melihat objek yang sama — kepercayaan transparansi naik (kriteria juri 5–6 di `tiket.md` P0-05).
- Pola halaman tunggal → kontributor yang copy contoh terdekat tetap benar karena contohnya cuma satu.
- Alur demo 5 menit (`docs/NASKAH-VIDEO.md`, dipetakan di `arsitektur-pages.md` §5: Transparansi → Kirim → cek publik → antar-terima → rusak + donatur) menjadi navigasi linear antar objek, bukan lompat workspace.

### Kelemahan kandidat B

- Guard peran tidak lagi 1:1 dengan route — izin harus turun ke level aksi/komponen (mis. tombol Batalkan hanya BPBD), pola yang hari ini tidak ada di repo (repo hanya `requireRole` per rute: `apps/web/src/app/bpbd/page.tsx:5`, `apps/web/src/app/bpbd/kirim/page.tsx:5`). Perlu komponen `AksiPeran` baru + uji izin — permukaan bug otorisasi lebih besar.
- Daftar kerja lintas objek ("Tugas saya") butuh agregasi 3 sumber (snapshot menunggu + manifest Perlu Dicek + tugas antar) — query dan loading-state lebih kompleks daripada daftar tunggal per workspace.
- Operator lapangan yang hanya kenal satu tugas bisa kebingungan melihat objek penuh ("kenapa saya lihat tombol BPBD yang disabled?") bila empty/disabled-state tidak dirancang tegas.

---

## Tabel banding (4 dimensi yang diminta)

| Dimensi | Kandidat A (role-workspace) | Kandidat B (object-centric) | Pemenang |
|---|---|---|---|
| **Interface depth** (kompleksitas tersembunyi di balik permukaan kecil menang) | Permukaan kecil per peran (3–5 item sidebar, 4 tab), tapi kompleksitas **terduplikasi**: 4 workspace × (daftar + kartu status + riwayat). Total permukaan sistem = 14 routes (`arsitektur-pages.md` §1) dengan 4 pola daftar yang mirip-tapi-beda. | Permukaan kecil global (6 item sidebar, 4 tab sama semua peran); kompleksitas disembunyikan **di dalam** halaman objek (sections collapsible, aksi kontekstual). Total pola = 3 halaman objek + 1 pola aksi-izin. | **B** — satu pola daftar + satu pola aksi; duplikasi A adalah kompleksitas yang tidak tersembunyi, melainkan digandakan. |
| **Agent-copy robustness** (kontributor buka satu file lalu copy contoh terdekat — mana yang tetap benar) | Buruk: contoh terdekat adalah workspace lain yang polanya mirip tapi aturannya beda (mis. copy kartu antrean BPBD `apps/web/src/app/bpbd/dasbor.tsx:135-168` ke posko → tombol verifikasi ikut tercopy ke peran yang salah; copy `window.prompt` pembatalan `dasbor.tsx:81-92` → friksi hilang). Status warna+label juga diulang per file (`dasbor.tsx:179-180` pola "Kurang {n}" hanya di satu tempat) — mudah terlewat saat copy. | Baik: hanya ada satu contoh halaman manifest, satu contoh badge status, satu komponen aksi-izin. Copy terdekat = copy yang benar. Aturan "nol tombol edit/hapus di objek terkunci" dan "status = warna + label" hidup di satu komponen (`BadgeStatus`, `AksiPeran`) sehingga copy otomatis mewarisi kontrak. Risiko tersisa: lupa membungkus aksi dengan izin → diatasi dengan default-deny (aksi tanpa izin = tidak render tombol aktif). | **B** — dengan syarat komponen izin default-deny. |
| **Jumlah tap alur demo 5-menit** (Transparansi → Kirim → cek publik → antar-terima → rusak + donatur) | ±18 tap: Beranda → Transparansi (1) → kembali → Beranda → BPBD → Kirim (3: pindah workspace 2× + isi form) → publikasikan → salin kode → keluar → cek publik `/m/*` (2) → masuk Tim → Tugas → check-in (3) → masuk Posko → terima (2) → lapor rusak (2) → cek donatur `/s/*` (2) + 3× ganti peran/login. Setiap pindah workspace = kembali ke Beranda dulu (`beranda/page.tsx:36-44` satu CTA per peran; header cuma tautan "Home" `apps/web/src/components/header.tsx:8-10`). | ±12 tap: Transparansi → Manifest baru (dari tombol "Buat manifest untuk posko ini" di halaman posko, 1) → publikasikan → QR/cek publik (objek yang sama, 0 pindah) → check-in sebagai Tim di objek yang sama (1 ganti peran, tanpa pindah route) → konfirmasi terima + lapor rusak di objek yang sama (2) → Sumbangan pemakai (1 tautan dari manifest). Ganti peran tetap ada (demo multi-peran), tapi **tanpa pindah route** — URL objek tetap, hanya aksi yang berubah. | **B** (−6 tap, −3 pindah workspace). |
| **Kecocokan offline-first** (antrean `lib/offline.ts`, banner `banner-offline.tsx:50-57`, indikator Menunggu Sinkronisasi) | Baik: antrean offline terkurung per workspace (Tim: check-in tertunda; Posko: draf snapshot; Gudang: intake). Konflik kecil karena tiap workspace menulis tabelnya sendiri. Banner offline per workspace jelas pemiliknya. | Sedang-baik: antrean lintas objek butuh satu outbox global (semua aksi tertunda — check-in, terima, lapor — dalam satu daftar "Menunggu Sinkronisasi" di Beranda). Lebih sederhana bagi pengguna (satu tempat melihat yang tertunda), tapi butuh desain outbox + urutan replay (terima sebelum lapor-rusak?) yang hari ini tidak ada (`lib/offline.ts` hanya dipakai alur Tim, `tiket.md` P0-15). Resolusi konflik (dua peran ubah objek yang sama offline) harus dirancang. | **A** (sempit) — kurungan per-workspace hari ini lebih cocok dengan `lib/offline.ts` yang ada; B butuh outbox global baru. |

Skor: B menang 3 dari 4 dimensi (depth, copy-robustness, tap demo); A menang offline-first.

---

## Rekomendasi sintesis (graft — yang dipakai)

**Pemenang: Kandidat B sebagai struktur informasi, dengan kurungan offline + guard route Kandidat A yang dipertahankan (graft A→B).**

Alasan satu kalimat: objek tunggal menghilangkan tiga salinan status dan memangkas 6 tap demo, sementara guard route dan antrean per-workspace yang sudah terbukti di kode (`requireRole` per rute, `lib/offline.ts` alur Tim) dipertahankan agar tidak membuka lubang otorisasi dan konflik sinkronisasi baru.

### Yang diambil dari B (inti)

1. Tiga halaman objek sebagai kebenaran tunggal: Manifest, Posko, Sumbangan — satu URL dilihat publik dan operator, aksi dibedakan per peran (disabled beralasan, bukan hilang).
2. Navigasi global sama semua peran (Beranda, Manifest, Posko, Sumbangan, Transparansi, Pengaturan) + mobile 4 tab seragam (Beranda, Tugas, Lacak, Akun) sesuai `audit-mobile-settings.md` §6.
3. Satu komponen `BadgeStatus` (warna + label, token `token-warna-oklch.md`) dan satu komponen `AksiPeran` default-deny — fondasi agent-copy robustness.
4. `/beranda` = "Tugas saya lintas objek" (urut kritis: Perlu Dicek > Minta Revisi > antrean), bukan hub pindah workspace.

### Yang dicangkok dari A (graft)

1. **Guard route per peran tetap** (`requireRole` di tiap route aksi: `/bpbd/kirim`, verifikasi, intake) sebagai lapis luar; `AksiPeran` hanya lapis dalam untuk aksi di halaman objek bersama. Alasan: pola route-guard sudah ada dan teruji (`apps/web/src/app/bpbd/page.tsx:5`, `apps/web/src/app/posko/page.tsx:6`, `apps/web/src/app/tim/page.tsx:5`); izin level-aksi tanpa guard route adalah permukaan bug otorisasi baru.
2. **Antrean offline per-workspace dipertahankan** (`lib/offline.ts` milik Tim; draf snapshot Posko; intake Gudang) — tidak digabung jadi outbox global di revamp ini. Daftar "Menunggu Sinkronisasi" boleh diagregasi tampilannya di Beranda (baca-saja), tapi replay tetap per-workspace agar urutan tulis tidak berubah.
3. **Sidebar desktop boleh menampilkan grup peran** (label "Command Center", "Gudang saya") di atas navigasi objek global — memberi rasa tempat operator tanpa menduplikasi route.
4. **Pembatalan manifest berfriksi** (dialog: alasan wajib + ringkasan dampak + konfirmasi ketik kode, gaya danger-zone terpisah) — temuan `audit-dashboard.md` §7.1 — dibangun sekali di halaman objek Manifest, bukan di tiap workspace.

### Konsekuensi tiket (`tiket.md`)

- P0-01/P0-02 (shell + bottom-nav): sidebar/tab mengikuti navigasi global B (6 item desktop, 4 tab seragam mobile), bukan sidebar per peran.
- P0-05/P0-06 (detail manifest/sumbangan): menjadi fondasi halaman objek — bangun `BadgeStatus` + `AksiPeran` di sini dulu sebelum P0-09…P0-15.
- P0-09…P0-15 (aksi peran): menjadi aksi kontekstual di halaman objek + route aksi ber-guard tetap ada (graft 1).
- Tidak ada outbox global baru (graft 2) — P1, bukan P0.

### Risiko sintesis (jujur, 2 butir)

1. Izin dua lapis (route-guard + `AksiPeran`) bisa divergen — mitigasi: satu tabel izin ("peran × aksi × objek") di docs, satu sumber kode (`lib/izin.ts`), uji tiap tombol aksi.
2. Halaman objek Manifest menjadi halaman paling berat (timeline + QR + 3 set aksi peran) — mitigasi: sections collapsible, budget halaman publik < 1,5 MB (`tiket.md` P1-09), tab bar disembunyikan di detail agar tombol primer tidak tertutup.
