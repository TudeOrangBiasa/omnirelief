# Audit BPBD Command Center — iterasi 2

- Scope: `apps/web/src/app/bpbd/dasbor.tsx`, `apps/web/src/app/bpbd/page.tsx`, `apps/web/src/app/bpbd/kirim/formulir.tsx`, `apps/web/src/app/bpbd/kirim/page.tsx`
- Rute GET dibaca (READ-ONLY, tak diubah): `api/bpbd/antrean`, `api/bpbd/prioritas`, `api/bpbd/pantauan`, `api/bpbd/posko`, `api/bpbd/manifest` (POST saja — tanpa GET), `api/gudang/batch`
- Acuan rancangan: `docs/desain/pemetaan-checklist.md` §5. Checklist dibaca lokal dari `~/.agents/skills/checklist-design/references/checklists/`
- Status: **SELESAI** — 5 gap penting ditutup di kode; 3 sub-tugas dinyatakan ⚪ beralasan

## Ringkasan gap

| # | Gap (tugas) | Sebelum | Sesudah |
|---|---|---|---|
| 1 | Metrik hero + stempel + muat ulang | Tidak ada | `dasbor.tsx:381-431` — 3 kartu + `Diperbarui HH:MM` + tombol muat ulang |
| 2 | Antrean tabel padat + sortir + bulk | Kartu, tanpa sortir/seleksi | `dasbor.tsx:546-652` — tabel 6 kolom, sortir umur/total, checkbox + `Setujui terpilih` |
| 3 | Prioritas batang + wilayah + CSV | Kartu tanpa batang/ekspor | `dasbor.tsx:654-744` + `unduhCsv` `:316-337` |
| 4 | CTA Buat manifest | Sudah ada, dipertahankan | `dasbor.tsx:433-437` |
| 5 | FEFO terlihat + tabel cari | Hanya opsi dropdown + peringatan | `formulir.tsx:308-382` — tabel FEFO + cari + tombol Pakai |

## 1. Dashboard (web-app-dashboard)

| | Item | Bukti |
|---|---|---|
| 🟢 | Welcome state | H1 + deskripsi peran di `page.tsx:9-12`; hero angka menggantikan sapaan personal — cocok untuk layar operasi |
| 🟢 | Key metrics | 3 kartu `dasbor.tsx:384-415`: menunggu verifikasi, selisih terbuka (dengan hitung posko kritis), perlu dicek |
| ⚪ | Recent activity | Tidak ada umpan aktivitas; riwayat hanya hidup di API + halaman publik. Dinyatakan tidak-penting: operator butuh antrean, bukan log klik |
| 🟢 | Needs attention | Panel Perlu Dicek persisten di atas `dasbor.tsx:439-493`, merah + badge bila ada, Empty eksplisit bila kosong |
| 🟢 | Quick actions | Satu CTA primer `Buat manifest` `dasbor.tsx:433-437` menuju `/bpbd/kirim` |
| 🟢 | Empty state | Tiga Empty kontekstual (terpantau/antrean/prioritas) + Empty hasil-nol pencarian batch `formulir.tsx:324-328` |
| ⚪ | Layout control | Tidak dibutuhkan: urutan kritis tetap (Ringkasan > Perlu Dicek > Antrean > Prioritas) |

Catatan penting: metrik ketiga memakai **perlu dicek**, bukan "terkunci hari ini" — tidak ada endpoint GET manifest yang bisa dibaca (rute manifest hanya POST, dilarang bikin endpoint baru). Alasan ditulis di sini, bukan disembunyikan.

## 2. Data Table (web-app-data-table)

| | Item | Bukti |
|---|---|---|
| 🟢 | Sortable columns | Antrean: Total + Umur `dasbor.tsx:559-578` (`aria-sort` + ikon arah + label). Prioritas: selisih terbesar dulu, dijamin di klien `dasbor.tsx:341` (API sudah mengurutkan) |
| ⚪ | Column visibility and order | Tidak dipasang: 6 kolom antrean / 6 kolom prioritas sudah muat tanpa scroll berlebih; preferensi operator bukan kebutuhan juri |
| 🟢 | Row selection and bulk actions | Checkbox per baris + header `dasbor.tsx:550,586`; bar persisten `N snapshot dipilih` `dasbor.tsx:494-517`; `setujuiTerpilih` `:214-234` memanggil verifikasi satu-per-satu berurutan + toast rekap |
| ⚪ | Row actions on hover | Sengaja tidak dipakai: 3 putusan selalu inline `dasbor.tsx:610-647` demi target 48px di sentuh |
| 🟢 | Search and filter | Tabel batch kirim: `cari-batch` + filter kode/barang `formulir.tsx:314-323,130-134`. Antrean tanpa cari: N ≤ 50 (limit API), sortir + bulk menutup kebutuhan |
| 🟡 | Pagination | Tidak dipasang — data kecil: antrean dibatasi 50 oleh API, prioritas = jumlah posko. Bila > 50 baris, kontraknya `1–50 dari N` client-side (belum dibutuhkan) |
| ⚪ | Frozen columns | Tidak dibutuhkan: tabel ≤ 6 kolom, `overflow-x-auto` bawaan Table cukup |
| 🟢 | Export action | `Unduh CSV` `dasbor.tsx:660-669`, blob client-side `prioritas-selisih.csv` `:316-337`, mencerminkan urutan tampil |
| 🟢 | Empty and loading states | Skeleton baris tabel `dasbor.tsx:131-139,519-535`; Empty per seksi |

Deviasi jujur: sortir antrean memakai **umur + total jiwa**, bukan umur + selisih — respons `GET antrean` tidak membawa selisih per snapshot, dan join posko-nama rapuh. Selisih tetap tersortir di tabel Prioritas.

## 3. Analytics (web-app-analytics)

| | Item | Bukti |
|---|---|---|
| ⚪ | Date range selector | Real-time command center; tidak ada histori per periode di API |
| 🟢 | Headline metrics | 3 kartu ringkasan `dasbor.tsx:384-415` |
| 🟢 | Charts with labels and axes | Batang selisih div-CSS + label angka `Kurang N` `dasbor.tsx:714-733`, `role="img"` + `aria-label` nilai — tanpa lib grafik |
| ⚪ | Period comparison | Tidak ada data periode pembanding; stempel Diperbarui menggantikan fungsi kesegaran |
| 🟢 | Segment breakdown | Kolom wilayah selalu tampil `dasbor.tsx:704`; kategori rentan per baris antrean `dasbor.tsx:594-603` |
| 🟢 | Last updated indicator | `Diperbarui HH:MM` + tombol `Muat ulang` `dasbor.tsx:417-430` |
| 🟢 | Loading and empty states | Skeleton + Empty seperti §2 |

## 4. Table (design-system-table)

| | Item | Bukti |
|---|---|---|
| 🟢 | Table header | Header jelas di kedua tabel antrean + prioritas + batch (`TableHead` di `dasbor.tsx:546-580,690-704`, `formulir.tsx:330-338`) |
| 🟢 | Row style | `data-state="selected"` untuk baris terpilih `dasbor.tsx:584`; varian semantik lain tidak dipakai agar sorotan tunggal terjaga |
| 🟢 | Spacing | Sel Table bawaan + `whitespace-nowrap` untuk umur `dasbor.tsx:607` |
| 🟢 | Search | Lihat §2 |
| 🟢 | Actions | 3 putusan inline per baris; `Pakai`/`Dipilih` di tabel batch `formulir.tsx:358-376` |
| 🟢 | Filter and sort | Lihat §2 |
| 🟢 | Responsiveness | `Table` scroll horizontal di dalam `max-w-4xl` (`page.tsx:7`); tombol putusan menumpuk vertikal di sel sempit |
| 🟡 | Pagination | Lihat §2 — sengaja ditunda dengan alasan tercatat |

## 5. Loading (design-system-loading)

| | Item | Bukti |
|---|---|---|
| 🟢 | Visual indicator | Skeleton kartu + baris tabel; label `Memuat...` pada tombol refresh `:428` |
| 🟢 | Text | Spesifik per konteks (`Memuat...`, `Menyetujui...`, `Belum pernah dimuat`) |
| 🟢 | Time | Skeleton hanya saat daftar kosong (`memuatAwal` `:344`); refresh berikutnya tidak mengosongkan daftar — tanpa kedip |
| 🟢 | Accessibility | Skeleton `aria-hidden`, status di `role="status"` `:418,496` |
| ⚪ | Visuals | Ilustrasi hiburan tidak cocok untuk layar operasi darurat |

## 6. Skeleton (design-system-skeleton)

| | Item | Bukti |
|---|---|---|
| 🟢 | Match content structure | `BarisMuatTabel` `:131-139` meniru 6 kolom tabel, bukan kartu generik |
| 🟢 | Animation | Animasi bawaan Skeleton ui-package (tidak ditimpa) |
| 🟢 | Style | Bentuk datar `h-5 w-full` per sel |
| 🟢 | Color scheme | Token `Skeleton` bawaan (netral, kontras cukup di light) |
| 🟢 | Transition to real content | Daftar lama dipertahankan saat refresh; skeleton hanya untuk muat awal |

## 7. Showing input error (flows-showing-input-error)

| | Item | Bukti |
|---|---|---|
| 🟢 | Keep default state | Alasan baru dinilai saat tekan konfirmasi (`konfirmasiPutusan` `:237-257`, `konfirmasiBatal` `:275-298`), bukan saat ketik |
| 🟢 | Allow entering information | Textarea bebas ketik; tombol Batal selalu tersedia |
| 🟢 | Signal after loss of focus | Galat tampil pasca-submit dengan `role="alert"` + ikon + teks syarat (`dasbor.tsx:770,823`) |
| 🟢 | Return to default on reattempt | Galat dihapus saat pengguna mengetik ulang (`dasbor.tsx:764,817`) |

## Perbaikan kebenaran data (penting)

- `Tim {w.tim}` pada kartu Perlu Dicek dirender `undefined`: respons `GET pantauan` tidak membawa `tim` (hanya `kode/posko_nama/batas_checkin/log_terakhir/ditandai`). Diganti info yang benar-benar ada: batas check-in + kabar terakhir (`dasbor.tsx:463-464`). API tidak diubah (READ-ONLY).

## Berkas diubah

- `apps/web/src/app/bpbd/dasbor.tsx` (495 → 846 baris): hero, tabel antrean + sortir + bulk, tabel prioritas + batang + CSV, perbaiki `tim`, galat hilang saat ketik ulang
- `apps/web/src/app/bpbd/kirim/formulir.tsx` (336 → 453 baris): tabel stok FEFO + cari + tombol Pakai sebelum draf
- `apps/web/src/app/bpbd/page.tsx`: `max-w-2xl` → `max-w-4xl` untuk kepadatan tabel
- `docs/desain/audit-bpbd-iter2.md` (baru): berkas ini

## Sisa terbuka (disengaja, beralasan)

1. Paginasi client `1–50 dari N` — belum dibutuhkan (antrean ≤ 50 via API, prioritas = jumlah posko); pasang saat data melewati 50 baris.
2. Metrik "terkunci hari ini" — butuh endpoint GET manifest; dilarang bikin endpoint. Kartu ketiga memakai perlu-dicek.
3. Sortir antrean per selisih — butuh selisih di respons antrean; API READ-ONLY. Tertutup via tabel Prioritas.
4. Visibilitas kolom, kolom beku, rentang tanggal, perbandingan periode — ⚪ di tabel masing-masing.
