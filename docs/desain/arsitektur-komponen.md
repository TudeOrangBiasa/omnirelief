# Arsitektur Komponen Revamp OmniRelief

SHA yang dirancang: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`.

Acuan IA: `docs/desain/arsitektur-pages.md` (14 routes, §1–§5).
Dependen visual: `docs/desain/audit-dashboard.md`, `docs/desain/audit-mobile-settings.md`.
Token: `docs/desain/token-warna-oklch.md` (light-only, status warna + label).
Tiket eksekusi: `docs/desain/tiket.md` (P0-01…P1-10).
Aturan mengikat: UI Indonesia sederhana, tombol/input min 48px (`min-h-12`),
status selalu warna + label teks, light-only, shadcn `@omnirelief/ui` + token
semantik (tanpa hex arbitrary), istilah `GLOSSARY.md`
(posko, penyintas, manifest `MNF-*`, sumbangan `DNT-*`, selisih, Perlu Dicek).

Sifat dokumen: rancangan modul (bukan kode app). Read-only terhadap
`apps/web`, `packages`, `supabase`.

---

## 0. Ringkasan lapisan

```text
packages/ui/src/components/*        ← primitif (tanpa istilah domain)
apps/web/src/components/domain/*    ← komposit domain, lower layer (lintas page)
apps/web/src/components/shell/*     ← komposit navigasi, lower layer
apps/web/src/app/<route>/_components/* ← upper layer (spesifik 1 page)
```

Aturan impor satu arah: upper boleh impor lower + primitif; lower tidak
boleh impor upper; primitif tidak boleh impor apa pun di `apps/web`.

---

## 1. Usage-first (pemakaian menurunkan props)

Tiap contoh di bawah adalah kontrak: kalau props tidak cukup menulis
contoh ini, props-nya salah.

### 1.1 `/transparansi` — kartu per posko (tiket P0-04)

```tsx
<KartuPosko
  nama="Posko Balikpapan Utara"
  butuh={120} dikirim={100} diterima={80}
  selisih={40}
/>
// selisih > 0 → badge merah "Kurang 40"; selisih = 0 → badge hijau "Aman"
```

Menurunkan props `KartuPosko`: `nama, butuh, dikirim, diterima, selisih`
(angka mentah, bukan string format) + `href?` opsional ke detail.
Format angka dan pilihan badge disembunyikan di dalam komponen.

### 1.2 `/transparansi` + `/bpbd` — badge status di mana-mana (P0-04, P0-09, P0-10)

```tsx
<StatusBadge status="kurang" selisih={40} />      // "Kurang 40", merah
<StatusBadge status="aman" />                     // "Aman", hijau
<StatusBadge status="perlu-dicek" />              // "Perlu Dicek", merah
<StatusBadge status="minta-revisi" />             // "Minta Revisi", kuning
<StatusBadge status="terkunci" />                 // "Terkunci", hijau
<StatusBadge status="menunggu-sinkron" antre={3} /> // "Menunggu Sinkronisasi · 3", netral
```

Menurunkan props `StatusBadge`: `status` union tertutup + angka
kontekstual opsional (`selisih`, `antre`). Tidak ada `className` warna —
warna dipetakan 1:1 dari `status` ke token semantik.

### 1.3 `/m/[kode]` — timeline hash chain (P0-05)

```tsx
<TimelineHash
  riwayat={[
    { hashPendek: "a3f9c1", label: "Manifest diterbitkan", waktu: "10:02" },
    { hashPendek: "77bd20", label: "Berangkat", waktu: "11:15" },
  ]}
  kode="MNF-2026-0142"
/>
```

Menurunkan props: array `riwayat` (tipe batas, bukan `any`), `kode`
untuk salin tautan. Tanpa tombol edit/hapus dalam kondisi apa pun
(kontrak IA §1 baris 3).

### 1.4 `/s/[kode]` — progress alokasi (P0-06)

```tsx
<ProgressAlokasi disalurkan={70} total={100} kode="DNT-2026-0088" />
// render: "70 dari 100 disalurkan (70%)" + bar + daftar manifest pemakai di bawah (children)
```

Menurunkan props: `disalurkan, total` (validasi `0 ≤ disalurkan ≤ total`
di `lib/validasi.ts`, bukan di komponen) + `kode`.

### 1.5 Global — banner offline (P0-15, P1-03)

```tsx
<BannerOffline daring={daring} antre={antre} />
// offline: "Koneksi lemah, data tersimpan dan terkirim otomatis (3 antre)."
// online + antre > 0: "3 data menunggu sinkronisasi."
// online + antre = 0: render null
```

Menggantikan `apps/web/src/components/banner-offline.tsx:50-57` (hari ini
hex arbitrary `#FEF3C7`/`#B45309` + tanpa deep-link). Versi baru: token
semantik warning + tautan "Atur notifikasi" → `/pengaturan#aksesibilitas`
(deep-link wajib per `audit-mobile-settings.md` §2).

### 1.6 Mobile — bottom nav (P0-02)

```tsx
<BottomNav
  peran="posko"
  aktif="/posko"
  badge={{ verifikasi: 0, perluDicek: 2, antreSinkron: 1 }}
/>
```

Menurunkan props: `peran` (union 6 peran IA §2), `aktif` (path saat ini),
`badge` (angka per jenis; nol = sembunyi, bukan titik). Tab ≤ 4 +
`Lainnya`; ikon + label selalu; `aria-current="page"`;
disembunyikan di `/m/*`, `/s/*`, dan mode formulir (kontrak IA §2).

### 1.7 `/posko` + `/gudang` — input angka (P0-12, P0-13)

```tsx
<StepperAngka label="Balita" nilai={nilai} min={0} onUbah={setNilai} />
// tombol − / + min-h-12, input rem-based agar ikut skala teks #aksesibilitas
```

Menurunkan props: `label` (Indonesia), `nilai, min?, max?, onUbah`.
Enam instance di form snapshot penyintas (bayi, balita, ibu hamil,
lansia, disabilitas, umum — kategori dari `audit-dashboard.md` §5 no. 3).

### 1.8 `/bpbd`, `/gudang`, `/admin` — tabel operasional (P0-09, P0-11, P1-01)

```tsx
<TabelPeran
  kolom={kolomAntrean}
  baris={antrean}
  kunciBaris={(a) => a.id}
  statusMuat="idle"
  kosong={{ judul: "Tidak ada antrean.", aksi: <a href="/bpbd/kirim">Buat manifest</a> }}
  onPilihMassal={setPilihan}
/>
```

Menurunkan props: `kolom` (definisi header + sortir + render sel),
`baris` (tipe batas per tabel), `kunciBaris`, `statusMuat`, `kosong`
(judul + aksi lanjutan wajib — menutup celah empty-tanpa-CTA di
`audit-dashboard.md` §1), seleksi massal + `eksporCsv?` opsional.
Tanpa `Row actions on hover` (dinilai ⚪/ditolak di audit §3: aksi kritis
selalu terlihat inline, min 48px).

---

## 2. Primitif (di atas shadcn, tanpa istilah domain)

Lower layer terbawah. Ciri: tidak mengenal kata posko/manifest/selisih;
reusable di semua page; prop API generik; styling hanya via token semantik.

| # | Primitif | Sumber shadcn yang dibungkus | Props inti | Catatan revamp |
|---|---|---|---|---|
| P1 | `Tombol` | `packages/ui/src/components/button.tsx:40-53` | `varian, ukuran, anak, onKlik, nonaktif?` | Tambah ukuran `lapang` = `min-h-12` default untuk semua CTA; ukuran `h-8/h-9` lama dilarang untuk aksi primer (kontrak 48px). |
| P2 | `Masukan` / `AreaTeks` / `Pilih` / `Label` | `input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx` | standar + `kesalahan?` | `aria-invalid` + `role="alert"` untuk error sudah ada di fondasi (audit-mobile-settings §5); kontrak: error selalu sebut nama bidang ("Jumlah wajib diisi"). |
| P3 | `Lencana` | `packages/ui/src/components/badge.tsx:29-49` (`badgeVariants`) | `varian, anak` | Hanya dipakai via `StatusBadge`; tidak dipakai langsung dengan teks domain. |
| P4 | `Kartu` (+ Header/Isi) | `card.tsx` | `judul?, anak, aksiHeader?` | Layout kartu generik; angka domain (butuh/dikirim/selisih) bukan di sini melainkan di `KartuPosko`. |
| P5 | `Kosong` | `packages/ui/src/components/empty.tsx:4-93` (`Empty`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`) | `judul, deskripsi?, aksi?` | `aksi` wajib di tabel/daftar operasional (CTA lanjutan). |
| P6 | `Rangka` (skeleton) | `skeleton.tsx` | `baris?` | Menutup celah loading di `audit-dashboard.md` §3 no. 9 / §4 no. 7: tiap fetch daftar (`muat()` tanpa flag loading hari ini) wajib render `Rangka`, bukan layar kosong. |
| P7 | `Umpan` (toast/status) | `sonner.tsx` | `judul, nada` | Untuk salin tautan + QR (P1-05), simpan akun (`role="status"`), kirim antrean. |
| P8 | `Saklar` | Switch shadcn | `label, aktif, onUbah` | Satu-satunya toggle (Pengaturan notifikasi/aksesibilitas). Jangan tiru UISwitch per-OS (audit-mobile-settings §2). |
| P9 | `DialogKonfirmasi` | dialog + button shadcn | `judul, dampak, butuhKetik?, onKonfirmasi` | Mengganti `window.prompt` pembatalan di `audit-dashboard.md` §7 no. 1: alasan wajib + ringkasan dampak + konfirmasi ketik kode untuk aksi destruktif (batal manifest, tolak verifikasi, nonaktifkan user — P1-04). |
| P10 | `BilahSisi` / `Tajuk` (slot navigasi) | baru di atas shadcn | `peran, aktif, anak` | Kerangka sidebar desktop + header (avatar → `/profil`, badge offline). Isi tab per peran diatur `BottomNav`, bukan di sini. |

Semua primitif: light-only, token dari `token-warna-oklch.md`
(`primary-solid`, `success-*`, `warning-*`, `destructive-*`, `info-*`,
`neutral-*`); larangan hex langsung; fokus `focus-visible` bawaan shadcn
dipertahankan dan diuji keyboard (audit-mobile-settings §5).

---

## 3. Komposit domain (8 wajib + 2 shell)

Setiap komposit: istilah domain diizinkan, props tertutup, state
didefinisikan, satu file modul.

### K1 `StatusBadge` — `apps/web/src/components/domain/status-badge.tsx`

- Props: `status: "aman" | "kurang" | "perlu-dicek" | "minta-revisi" | "menunggu-verifikasi" | "draf" | "terkunci" | "ditolak" | "dibatalkan" | "rusak" | "fefo-mendesak" | "menunggu-sinkron"` + `selisih?: number` (wajib bila `kurang`) + `antre?: number` (untuk `menunggu-sinkron`).
- Pemetaan (kontrak IA §3 + token §1): aman/terkunci → hijau; kurang/perlu-dicek → merah; minta-revisi/fefo → kuning; menunggu/draf → netral; ditolak/dibatalkan/rusak → merah tua + alasan terlihat (alasan via `children` atau prop `alasan?`).
- States: tidak punya loading/empty (atom sinkron); `selisih` negatif → error dev (`validasi.ts`); selalu warna + teks, tidak pernah warna saja.
- Contoh pemakaian: §1.2.

### K2 `KartuPosko` — `apps/web/src/components/domain/kartu-posko.tsx`

- Props: `{ nama: string; butuh: number; dikirim: number; diterima: number; selisih: number; href?: string }`.
- Render: 4 angka (Butuh / Dikirim / Diterima / Selisih) + `<StatusBadge>` turunan + `min-h-12` area sentuh bila `href` ada.
- States: `loading` → `Rangka` 3 baris; `empty` → `Kosong` ("Belum ada posko." + aksi reset filter); `error` → pesan + tombol muat ulang; `penuh` (selisih = 0 semua) → varian hijau ringkas, bukan kartu kosong.
- Dipakai: `/transparansi` (§1.1), Prioritas `/bpbd`.
- Larangan: angka tidak digabung antar posko (GLOSSARY: unit transparansi).

### K3 `TimelineHash` — `apps/web/src/components/domain/timeline-hash.tsx`

- Props: `{ kode: string; riwayat: Array<{ hashPendek: string; label: string; waktu: string }> }`.
- Render: daftar append-only (hash pendek + label + waktu) + tombol salin tautan + QR (QR via `children` slot agar lib QR bisa diganti tanpa ubah timeline).
- States: `empty` → "Belum ada riwayat." (bukan error); `error` → gagal muat riwayat + tombol coba lagi; tidak ada edit/hapus di semua state.
- Dipakai: `/m/[kode]` (§1.3).

### K4 `ProgressAlokasi` — `apps/web/src/components/domain/progress-alokasi.tsx`

- Props: `{ kode: string; disalurkan: number; total: number; pemakai?: Array<{ kode: string; jumlah: number }> }`.
- Render: teks "X dari Y disalurkan (Z%)" (teks selalu ada — bar bukan satu-satunya sinyal) + bar token primer + daftar manifest pemakai (`MNF-*` sebagai tautan).
- States: `total = 0` → empty ("Belum disalurkan."); `loading` → `Rangka`; `penuh` (100%) → hijau "Tersalurkan penuh".
- Dipakai: `/s/[kode]` (§1.4).

### K5 `BannerOffline` — `apps/web/src/components/domain/banner-offline.tsx`

- Props: `{ daring: boolean; antre: number }`.
- Render: `role="status"`, token warning; offline → teks antre + "terkirim otomatis"; online + antre > 0 → "N data menunggu sinkronisasi." + tombol "Kirim sekarang"; online + antre = 0 → `null`.
- States: ini sendiri state offline global; wajib deep-link "Atur notifikasi" → `/pengaturan#aksesibilitas`.
- Dipakai: header/shell semua route login + `/tim` (§1.5). Pengganti file lama `banner-offline.tsx:50-57`.

### K6 `BottomNav` — `apps/web/src/components/shell/bottom-nav.tsx`

- Props: `{ peran: "publik" | "bpbd" | "gudang" | "posko" | "tim" | "admin"; aktif: string; badge: { verifikasi: number; perluDicek: number; antreSinkron: number } }`.
- Render: ≤ 4 tab + `Lainnya` (sheet) per matriks IA §2; ikon + label Indonesia; aktif = warna primer + semibold + `aria-current`; badge angka dengan label aksesibel ("3 perlu dicek"), sembunyi bila nol.
- States: `offline` → tab tetap aktif + badge antreSinkron naik; disembunyikan (render `null`) di `/m/*`, `/s/*`, mode formulir agar tombol primer tidak tertutup.
- Dipakai: shell mobile semua peran (§1.6). Tiket P0-02.

### K7 `StepperAngka` — `apps/web/src/components/domain/stepper-angka.tsx`

- Props: `{ label: string; nilai: number; min?: number; max?: number; onUbah: (n: number) => void }`.
- Render: tombol − / + `min-h-12` + input angka; label Indonesia; `rem`-based agar ikut skala teks aksesibilitas; error (`nilai` di luar min/max) → `role="alert"` + sebut bidang.
- States: `nonaktif` (draf terkunci/sudah diverifikasi) → disabled + penjelasan, bukan hilang.
- Dipakai: form snapshot 6 angka `/posko` (§1.7), form intake `/gudang`.

### K8 `TabelPeran` — `apps/web/src/components/domain/tabel-peran.tsx`

- Props: `{ kolom: Kolom<T>[]; baris: T[]; kunciBaris: (b: T) => string; statusMuat: "idle" | "memuat" | "gagal"; kosong: { judul: string; aksi?: ReactNode }; pilih?: Set<string>; onPilihMassal?: (k: Set<string>) => void; eksporCsv?: () => void }`.
- Kolom: `{ id, judul, sortir?: (a: T, b: T) => number, render: (b: T) => ReactNode }` — sortir (umur/urgensi/selisih/exp FEFO), cari/filter, paginasi "1–50 dari N" diimplementasi sekali di sini, bukan per page.
- States: `memuat` → `Rangka` (bukan layar kosong); `kosong` → `Kosong` + aksi lanjutan; `gagal` → pesan + "Muat ulang"; `penuh` (ratusan batch `DNT-*`) → paginasi + filter wajib terlihat.
- Dipakai: antrean verifikasi + prioritas (`/bpbd`), tabel batch (`/bpbd/kirim`, `/gudang`), daftar user (`/admin`) (§1.8).
- Larangan turunan audit: tanpa aksi-hover tersembunyi; aksi kritis inline min 48px.

### (Shell, lower layer) `BilahSisi` + `TajukAplikasi`

- Modul: `apps/web/src/components/shell/bilah-sisi.tsx`, `apps/web/src/components/shell/tajuk.tsx`.
- Props: `{ peran, namaPosko?, aktif, antreSinkron }`. Sidebar desktop per peran (IA §2: selalu diawali Beranda); header: logo + nama peran/posko + `<BannerOffline>` ringkas + avatar → `/profil`. Tiket P0-01.

---

## 4. Seams (lower vs upper) + aturan copy-paste aman

### Lower layer (dipakai lintas page — jangan diduplikasi)

1. `packages/ui/*` (P1–P10): tanpa domain; perubahan di sini memengaruhi semua page → butuh persetujuan + uji kontras ulang bila sentuh token (§sampel 4–5 token doc).
2. `apps/web/src/components/domain/*` (K1–K5, K7–K8): mengenal domain tapi tidak mengenal route; boleh impor primitif + `lib/validasi.ts` + tipe `lib/supabase/baris.ts`; **dilarang** impor `next/navigation`, `lib/auth.ts`, fetch langsung. Data masuk via props.
3. `apps/web/src/components/shell/*` (K6 + BilahSisi/Tajuk): satu-satunya yang boleh tahu peta route IA §2; pemilik badge angka realtime (langganan Supabase di sini, bukan di tiap page).

### Upper layer (spesifik 1 page — boleh divergen)

- `apps/web/src/app/<route>/_components/*`: merakit lower + logika page (fetch, `requireRole`, aksi server). Contoh: `app/bpbd/_components/tabel-antrean.tsx` (kolom umur + kategori rentan + aksi 3 putusan), `app/posko/_components/form-snapshot.tsx` (6× `StepperAngka` + draf + banner verifikasi), `app/gudang/_components/form-intake.tsx`.
- Aturan: upper tidak boleh diimpor page lain. Butuh reuse? Naikkan ke `domain/` lewat tiket, jangan impor lintas `_components`.

### Aturan copy-paste aman untuk kontributor berikutnya

1. Butuh varian baru? Tambah `status`/prop ke komposit yang ada — jangan fork file (satu `StatusBadge`, satu `TabelPeran`).
2. Warna baru dilarang: petakan ke token `token-warna-oklch.md`; hex langsung = tolak review.
3. Teks baru wajib Indonesia + istilah GLOSSARY (`selisih` bukan defisit, `Perlu Dicek` bukan overdue, `ketidaksesuaian` bukan komplain, `konfirmasi terima` bukan serah terima) — sapu via P1-10.
4. Setiap daftar baru wajib tiga state: `Rangka` (memuat), `Kosong` + aksi, error + muat ulang. Setiap form baru wajib error `role="alert"` + sebut bidang.
5. Sentuh ≥ 48px: `min-h-12` untuk tombol/input/tab/stepper; pengecualian hanya teks-link inline.
6. Satu file ≤ 1000 baris (`AGENTS.md` no. 3, cek `bun run check:loc`); komposit gemuk → pecah kolom/render ke upper, bukan tambah prop.
7. Validasi murni di `lib/validasi.ts` (AGENTS.md no. 8); komponen hanya render hasil validasi.

---

## 5. Peta komposit → page → tiket

| Komposit | Pages (IA) | Tiket |
|---|---|---|
| `StatusBadge` | semua (badge Kurang/Aman/Perlu Dicek/Minta Revisi/Terkunci) | P0-04, P0-09, P0-10, P0-13 |
| `KartuPosko` | `/transparansi`, `/bpbd` prioritas | P0-04 |
| `TimelineHash` | `/m/[kode]` | P0-05 |
| `ProgressAlokasi` | `/s/[kode]` | P0-06 |
| `BannerOffline` | global, `/tim` | P0-15, P1-03 |
| `BottomNav` | shell mobile | P0-02 |
| `StepperAngka` | `/posko`, `/gudang` | P0-12, P0-13 |
| `TabelPeran` | `/bpbd`, `/bpbd/kirim`, `/gudang`, `/admin` | P0-09, P0-11, P1-01 |
| `BilahSisi`/`Tajuk` | shell desktop | P0-01 |

---

## 6. Bukti grounding (klaim repo = path + baris)

- 14 routes + matriks tab + kontrak status/48px: `docs/desain/arsitektur-pages.md:9-71`.
- 26 tiket berurutan: `docs/desain/tiket.md:6-38`.
- Token OKLCH light-only + 12/12 lolos + batas bawah sampel 4–5: `docs/desain/token-warna-oklch.md:12-81`.
- Tanpa bottom nav / tanpa settings / badge Perlu Dicek realtime / Switch shadcn / deep-link banner: `docs/desain/audit-mobile-settings.md:17-44,95-121`.
- Tanpa aktivitas terbaru / tanpa sortir-filter-paginasi-ekspor / tanpa loading / `window.prompt` pembatalan / kategori rentan tak di-render: `docs/desain/audit-dashboard.md:22-28,54-68,82-83,118-121`.
- Primitif ada: `packages/ui/src/components/button.tsx:40-53`, `badge.tsx:29-49`, `empty.tsx:4-93`; banner lama hex arbitrary: `apps/web/src/components/banner-offline.tsx:50-57`.
- Aturan repo: `AGENTS.md:9` (Indonesia, 48px, warna+label, light, shadcn+token); istilah: `GLOSSARY.md` (selisih, Perlu Dicek, ketidaksesuaian, konfirmasi terima, `MNF-*`, `DNT-*`).
