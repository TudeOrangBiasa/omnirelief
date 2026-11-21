# Audit publik + gudang — iterasi 2

Cakupan: `transparansi/page.tsx`, `m/[kode]/page.tsx`, `s/[kode]/page.tsx`, `gudang/page.tsx`
+ rute GET `api/publik/dashboard|manifest|sumbangan`, `api/gudang/batch` (read-only, diverifikasi tanpa diubah).
Checklist dibaca lokal dari `.agents/skills/checklist-design/references/checklists/`
di worktree utama. Keputusan ⚪ checklist lama (tanpa pagination server, tanpa edit/hapus
di `/m`, tanpa SSO) dipertahankan — lihat baris "Alasan" tiap tabel.

## 1. List View — `/transparansi`

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Primary info hierarchy | `transparansi/page.tsx:141` — `CardTitle` nama posko | Nama posko paling menonjol, wilayah sekunder di bawahnya |
| 🟢 | Secondary metadata | `transparansi/page.tsx:142,145` — wilayah + angka butuh/dikirim/diterima | ≤3–4 field sekunder, angka `t-angka` |
| ⚪ | Item actions on hover | — | Kartu publik read-only; tidak ada aksi per item yang perlu disembunyikan |
| ⚪ | Bulk selection | — | Tidak ada aksi massal di layar publik |
| 🟢→🟢 | Sort and filter controls | `transparansi/page.tsx:135-176` cari + chip Semua/Kurang/Aman `aria-pressed`; reset `aturUlang` (:91) | **Gap iterasi 1 ditutup**: filter teks + status + tombol reset; status aktif terlihat via varian tombol |
| ⚪ | Infinite scroll / load more | — | Data kecil (satu baris per posko); pagination server tidak sepadan — catat, bukan tunda |
| ⚪ | Group / section headers | — | Satu grup homogen, tidak ada kategori waktu/status yang perlu sticky header |
| 🟢→🟢 | Empty and first-use states | `transparansi/page.tsx:213,229` dibedakan: belum-ada + CTA `Ke Bantuan` (:219) vs nol-hasil + `Atur ulang pencarian` (:234) | **Gap iterasi 1 ditutup** |

## 2. Single Item Detail — `/m/[kode]`, `/s/[kode]`

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Clear title | `m/[kode]/page.tsx:232`, `s/[kode]/page.tsx:164` — kode mono H1 | Kode `MNF-*`/`DNT-*` menonjol di atas |
| 🟢 | Status indicator | `m/...:226` TERKUNCI + `229` DIBATALKAN; `s/...:188,192` Penuh/Terpakai | Selalu warna + label teks, bukan warna saja |
| 🟢 | Key details | `m/...:239-244` tim/waktu/hash; `s/...:167-172` jumlah/masuk/kedaluwarsa/sumber | Primer di kartu atas, sekunder di bawah |
| ⚪ | Edit action | — | Keputusan sadar: manifest terkunci append-only, nol tombol edit/hapus di kondisi apa pun |
| 🟡 | Related items / activity | `m/...:305-330` timeline status + catatan + waktu; pemakai `s/...:209-233` kode + jumlah + posko + tanggal + hitungan `(N)` | Timeline lengkap untuk **apa + kapan**; **siapa (aktor) hilang** — payload `manifest_log` hanya `status,catatan,dibuat_pada` (`api/publik/manifest/route.ts:58-63`, API read-only, tidak diakali) |
| 🟢 | Breadcrumb / back | `m/...:169-175`, `s/...:109-115` — kembali ke Transparansi | Sudah ada sebelum iterasi 2, dipertahankan |
| ⚪ | Destructive actions | — | Layar publik; pembatalan milik BPBD dan tercatat sebagai dokumen, bukan aksi di sini |

Kolom kedaluwarsa di tabel item `/m`: **sengaja tidak ditambah**. Payload `items` hanya
`jumlah, kode_sumbangan, item_nama, satuan` (`api/publik/manifest/route.ts:86-91`).
Menambah kolom tanpa data = akal-akalan; dicatat di sini sesuai instruksi.

## 3. Empty State — keempat layar

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Illustration / icon | `EmptyMedia variant="icon"` + ikon Solar linear di tiap empty | Kontekstual (kaca pembesar untuk tidak-ditemukan) |
| 🟢 | Clear heading | `Belum ada data posko` / `Tidak ada hasil` / `Belum ada batch` / `Manifest tidak ditemukan` | Menamai yang hilang, bukan "kosong" generik |
| 🟢 | Supporting description | Tiap empty punya deskripsi 1 kalimat (kapan data muncul / apa arti nol-hasil) | — |
| 🟢 | Primary action | `transparansi:219` Ke Bantuan; `gudang:372` Catat sumbangan (scroll + fokus, bukan tautan) | CTA menciptakan/meneruskan langkah, bukan tautan generik |
| 🟢→🟢 | Zero vs no-results | `transparansi:213` vs `:229`; `gudang:367` vs `:383` | **Gap iterasi 1 ditutup**: nol-hasil selalu bawa jalan keluar (atur ulang) |
| 🟢 | Error variant | `transparansi:195`, `m/...:191`, `s/...:131`, `gudang:350` — Alert + `Coba lagi` | Terpisah dari kosong; tanpa-akses gudang (`gudang:334`) punya varian sendiri + CTA Masuk |

## 4. Filtering Items — `/transparansi`, `/gudang`

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Show action near collection | Cari + chip tepat di atas daftar kartu/tabel | Satu layar, umpan balik langsung |
| 🟢 | Show available filter options | Chip Semua/Kurang/Aman (`transparansi:145-167`); cari kode/barang/sumber (`gudang:314-322`) | Opsi paling umum di depan; tanpa halaman filter terpisah |
| 🟢 | Consider different filter types | Chip status (pilihan tunggal) + kolom teks bebas | Tipe sesuai properti; dropdown/sortir manual berlebihan untuk data kecil |
| 🟢 | Show active filters | Varian tombol terisi + `aria-pressed` + hitungan hasil | Status aktif terlihat setiap saat |
| 🟢→🟢 | Easy filter removal | `Atur ulang` (`transparansi:171-176`, syarat `adaFilter` :89) dan `Atur ulang pencarian` di tiap nol-hasil | **Gap iterasi 1 ditutup**: reset satu ketuk + tiap dead-end |
| 🟢→🟢 | Show result count | `transparansi:184` `N posko · M kurang`; `gudang:325` `N batch · sisa M` | **Gap iterasi 1 ditutup**: hitungan menyempitkan rasa terlalu-sempit/luas |
| 🟢 | Empty state | Nol-hasil dengan saran + reset (lihat §3) | — |

## 5. Submitting a Form — form intake `/gudang`

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Submit button | `gudang:287` `Simpan batch`, min-h-12, label sesuai aksi | — |
| 🟢 | Loading state | `sibuk` → `Menyimpan...` + `disabled` (`gudang:88,287`) + skeleton tabel batch | Tombol + daftar sama-sama memberi umpan balik |
| 🟢 | Success message | `toast.success` kode + kartu hijau `Intake tersimpan` (`gudang:175,131`) + tabel batch dimuat ulang (`muatBatch` :180) | Hasil `DNT-*` + bukti di tabel, bukan sekadar toast |
| 🟢 | Error message | Alert `Gagal menyimpan` + pesan server (`gudang:146-151`) | — |
| 🟢 | Wrong-information error | `galatField` per bidang + `role="alert"` + `aria-describedby` (`gudang:163-218`) | Menyebut bidang + cara betulkan |

## 6. Searchbar — kolom cari publik + gudang

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Input field | `Input` min-h-12 di tiap layar | Wadah jelas untuk mengetik |
| 🟢 | Label / placeholder | `aria-label` + placeholder contoh (`Cari posko atau wilayah...`, format `MNF-...`/`DNT-...`) | Placeholder beri contoh, bukan satu-satunya label |
| ⚪ | Autocomplete / suggestions | — | Korpus kecil (saringan client-side instan); saran mengetik tidak sepadan |
| ⚪ | Submit search button | Fasilitas MNF/DNT pakai tombol `Cek`; cari posko/batch memfilter langsung | Filter instan tidak butuh submit; dua pola disengaja per jenis cari |
| ⚪ | Previous searches | — | Tanpa akun di layar publik; riwayat sesi tidak dibutuhkan |
| 🟢 | Appropriate visibility | Tiap kolom cari terikat ke daftar tepat di bawahnya (`aria-label` seksi) | Cakupan jelas: posko, batch, atau lompat-kode |

## 7. Toast — umpan balik gudang + salin tautan

| | Item | Bukti | Alasan |
|---|---|---|---|
| 🟢 | Copy | `Intake tersimpan. Kode DNT-...` / `Tautan disalin` — status + objek | Jelas, ringkas, Indonesia |
| 🟢 | Placement | Sonner sudut (`packages/ui/src/components/sonner.tsx`) | Non-disruptif, bukan fokus |
| 🟢 | Usage | Hanya sesudah aksi (simpan intake, salin kode/tautan) | — |
| 🟢 | Variants | `toast.success` hijau + ikon; `toast.error` merah + ikon | Ikon + teks, bukan warna saja |
| 🟢 | Length of appearance | Default Sonner, cukup dibaca sekali lafaz | — |
| ⚪ | Dismissable | — | Default auto-hilang Sonner; konten pendek tidak butuh tutup manual |

## Perbaikan iterasi 2 (file milik sendiri)

- `transparansi/page.tsx` — cari posko + chip Semua/Kurang/Aman + reset; hitungan
  `N posko · M kurang`; empty nol-hasil vs belum-ada + CTA Bantuan (`/pengaturan#bantuan`).
- `s/[kode]/page.tsx` — badge `Penuh · 100%` hijau vs `Terpakai N%` netral di atas
  progress; hitungan `(N)` di heading pemakai. Catat: batang `Progress` primitif selalu
  `bg-primary` (netral) — warna status dibawa badge agar patuh batas ui-package read-only.
- `gudang/page.tsx` — tabel batch dari `GET batch` (kode, barang + jumlah, sisa,
  kedaluwarsa) + cari client-side + sortir FEFO default via `urutFEFO` lib (API sudah
  `ORDER BY kedaluwarsa ASC NULLS LAST` sebagai sabuk kedua); badge kuning
  `FEFO: kedaluwarsa X hari` (≤7 hari) dan merah `Kedaluwarsa`; empty belum-ada + CTA
  `Catat sumbangan` (scroll + fokus ke `#gudang-item`, bukan tautan); varian
  tanpa-akses (401/403) + CTA Masuk; tabel dimuat ulang tiap intake sukses.
- `lib/supabase/baris.ts` — tipe baru `GudangBatchRow` (termasuk `sumber`, `terpakai`);
  konsumsi via `baris<T>()`/`tunggal<T>()`, tanpa `as` inline.

## Sisa terbuka (jujur)

1. Timeline `/m` tanpa aktor — butuh kolom pelaku di `manifest_log`; menunggu perubahan
   API di luar wewenang iterasi ini.
2. Tanpa pagination server — disengaja untuk data kecil; bila posko > 100, daftar
   client-side perlu paginasi/`load more` (List View baris 6 jadi 🔴 saat itu).
3. Warna batang progress `/s` tidak berubah hijau saat penuh (batas primitif UI);
   status hijau dibawa badge — setara makna, beda piksel.

## Tindak lanjut — 4 gap ditutup (`6d0582c`, terverifikasi browser 21 Nov 2026)

1. **Aktor timeline**: `manifest_log.dibuat_oleh` ternyata sudah ada di skema
   (diisi semua penulis kecuali penanda sistem pantauan) — gap hanya di baca:
   `api/publik/manifest` kini join `profil(nama)`; timeline tampilkan
   `oleh {nama}` / `oleh sistem`.
2. **Kedaluwarsa item**: `manifest_item → stok_batch.kedaluwarsa` tersedia tanpa
   migrasi — rute kini memilihnya; tabel `/m` tambah kolom Kedaluwarsa
   (`id-ID`, `—` bila tanpa tanggal).
3. **Alasan revisi**: migrasi `0002_alasan_snapshot.sql` (`penyintas_snapshot.alasan`,
   teraplikasi live); `validasiVerifikasi` wajibkan alasan ≥5 huruf untuk
   MINTA_REVISI/DITOLAK (+2 uji); rute verifikasi simpan; GET laporan kembalikan;
   banner posko tampilkan `Alasan BPBD:` (revisi + tolak). Data sementara saat
   verifikasi dikembalikan (snapshot id=1).
4. **Progress penuh hijau**: primitif `Progress` tambah `indicatorClassName`
   (aditif); `/s` oper `bg-success` saat 100%. Kasus penuh belum ada di seed —
   cabang hijau terverifikasi kode + gerbang, belum tangkapan layar.
