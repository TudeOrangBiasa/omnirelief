# Token Warna OKLCH — Revamp OmniRelief (Light-only)

- SHA repo yang diaudit: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`
- Syarat checklist: `design-system-color-system.md` + `design-system-accessibility.md` (dibaca lokal, tanpa fetch web).
- Sifat dokumen: usulan token revamp, **bukan** acuan visual UI sekarang. Tidak mengubah kode tema.
- Aturan repo yang dipegang: light saja (tanpa mode gelap), shadcn + token semantik, status selalu warna + label teks, UI Bahasa Indonesia sederhana.

## 1. Palet primitif OKLCH (light-only)

Tiap warna ditulis `oklch(L C H)` + padanan hex sRGB (semua nilai di dalam gamut sRGB, tanpa clipping).

### Netral

| Token primitif | OKLCH | Hex | Peran |
|---|---|---|---|
| `neutral-bg` | `oklch(1.000 0.000 0)` | `#ffffff` | Latar utama |
| `neutral-surface` | `oklch(0.975 0.006 260)` | `#f4f7fb` | Latar kartu / permukaan sekunder |
| `neutral-border` | `oklch(0.895 0.015 260)` | `#d7dde7` | Garis batas, pembatas |
| `neutral-text` | `oklch(0.300 0.035 260)` | `#232e40` | Teks isi |
| `neutral-muted` | `oklch(0.520 0.030 260)` | `#5f6a7b` | Teks sekunder / penjelasan |

### Primer (navy) + aksen info

| Token primitif | OKLCH | Hex | Peran |
|---|---|---|---|
| `primary-solid` | `oklch(0.450 0.100 265)` | `#3a538d` | Tombol primer, teks primer |
| `primary-tint` | `oklch(0.935 0.025 265)` | `#e1eafb` | Latar seksi primer |
| `primary-badge-fg` | `oklch(0.400 0.110 265)` | `#2a4482` | Teks badge primer |
| `primary-badge-bg` | `oklch(0.915 0.035 265)` | `#d8e3fb` | Latar badge primer |
| `info-fg` | `oklch(0.480 0.100 245)` | `#236292` | Teks info |
| `info-tint` | `oklch(0.940 0.030 245)` | `#dbeefe` | Latar info |

### Umpan balik (success / warning / destructive)

| Token primitif | OKLCH | Hex | Peran |
|---|---|---|---|
| `success-fg` | `oklch(0.500 0.100 160)` | `#1f744f` | Teks sukses |
| `success-tint` | `oklch(0.940 0.035 160)` | `#d8f3e3` | Latar sukses |
| `success-badge-fg` | `oklch(0.445 0.095 160)` | `#0f6441` | Teks badge sukses |
| `success-badge-bg` | `oklch(0.900 0.050 160)` | `#c2e9d3` | Latar badge sukses |
| `warning-fg` | `oklch(0.520 0.100 85)` | `#836412` | Teks peringatan (cokelat, bukan kuning murni agar kontras) |
| `warning-tint` | `oklch(0.950 0.050 85)` | `#feedc9` | Latar peringatan |
| `warning-badge-fg` | `oklch(0.470 0.095 85)` | `#735603` | Teks badge peringatan |
| `warning-badge-bg` | `oklch(0.910 0.060 85)` | `#f4dfb4` | Latar badge peringatan |
| `destructive-fg` | `oklch(0.500 0.130 28)` | `#a04037` | Teks bahaya / selisih positif |
| `destructive-tint` | `oklch(0.930 0.035 28)` | `#ffe0db` | Latar bahaya |
| `destructive-badge-fg` | `oklch(0.460 0.140 28)` | `#972f27` | Teks badge bahaya |
| `destructive-badge-bg` | `oklch(0.900 0.050 28)` | `#fed2cc` | Latar badge bahaya |

Catatan keputusan:

- Kuning peringatan dibuat gelap-kecokelatan di sisi teks (`warning-fg`) — kuning murni tidak pernah lolos 4.5:1 di atas tint terang.
- Token semantik (mis. `color-text-danger`, `color-background-primary`) memetakan 1:1 ke primitif di atas saat implementasi; komponen **tidak** boleh memakai hex langsung (item *Semantic color tokens* + *Token governance*).
- Buta warna: status umpan balik memakai pasangan warna + label teks sesuai aturan repo (mis. "Perlu Dicek", "Selisih kurang"), bukan warna saja (item *Color blindness considerations*).

## 2. Metode ukur kontras

- SHA: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`.
- 12 sampel, masing-masing satu pasangan foreground/background. Urutan ukur **dari pasangan berlatar paling terang ke paling gelap** (diurut berdasar luminansi relatif latar, no. 1–3 berbagi latar putih `#ffffff`).
- Konversi tiap sampel: `oklch(L C H)` → linear sRGB (via OKLab) → sRGB gamma → **luminansi relatif WCAG** (`0.2126·R + 0.7152·G + 0.0722·B` setelah linearisasi kanal) → rasio `(Lterang + 0.05) / (Lgelap + 0.05)`.
- Target (WCAG AA, item *Contrast ratios* + *Colour contrast standards*): teks normal ≥ **4.5:1** (sampel 1–7, 12); badge ≥ **3.0:1** (sampel 8–11, badge = komponen UI kecil berlabel teks, bukan teks isi).
- Dihitung dengan skrip (Python, rumus di atas), bukan perkiraan visual.

## 3. Tabel 12 sampel (terang → gelap)

| No | Sampel (fg on bg) | OKLCH fg | OKLCH bg | Hex fg on bg | Rasio | Target | Hasil |
|---|---|---|---|---|---|---|---|
| 1 | Teks isi / latar utama | `oklch(0.300 0.035 260)` | `oklch(1.000 0.000 0)` | `#232e40` on `#ffffff` | 13.64 | ≥ 4.5 | Lolos |
| 2 | Teks muted / latar utama | `oklch(0.520 0.030 260)` | `oklch(1.000 0.000 0)` | `#5f6a7b` on `#ffffff` | 5.51 | ≥ 4.5 | Lolos |
| 3 | Primer / putih | `oklch(0.450 0.100 265)` | `oklch(1.000 0.000 0)` | `#3a538d` on `#ffffff` | 7.54 | ≥ 4.5 | Lolos |
| 4 | Warning-fg / warning-tint | `oklch(0.520 0.100 85)` | `oklch(0.950 0.050 85)` | `#836412` on `#feedc9` | 4.80 | ≥ 4.5 | Lolos |
| 5 | Success-fg / success-tint | `oklch(0.500 0.100 160)` | `oklch(0.940 0.035 160)` | `#1f744f` on `#d8f3e3` | 4.84 | ≥ 4.5 | Lolos |
| 6 | Info-fg / info-tint | `oklch(0.480 0.100 245)` | `oklch(0.940 0.030 245)` | `#236292` on `#dbeefe` | 5.46 | ≥ 4.5 | Lolos |
| 7 | Destructive-fg / destructive-tint | `oklch(0.500 0.130 28)` | `oklch(0.930 0.035 28)` | `#a04037` on `#ffe0db` | 5.15 | ≥ 4.5 | Lolos |
| 8 | Badge primer | `oklch(0.400 0.110 265)` | `oklch(0.915 0.035 265)` | `#2a4482` on `#d8e3fb` | 7.28 | ≥ 3.0 | Lolos |
| 9 | Badge warning | `oklch(0.470 0.095 85)` | `oklch(0.910 0.060 85)` | `#735603` on `#f4dfb4` | 5.26 | ≥ 3.0 | Lolos |
| 10 | Badge sukses | `oklch(0.445 0.095 160)` | `oklch(0.900 0.050 160)` | `#0f6441` on `#c2e9d3` | 5.47 | ≥ 3.0 | Lolos |
| 11 | Badge destructive | `oklch(0.460 0.140 28)` | `oklch(0.900 0.050 28)` | `#972f27` on `#fed2cc` | 5.58 | ≥ 3.0 | Lolos |
| 12 | Putih / primer-solid (tombol) | `oklch(1.000 0.000 0)` | `oklch(0.450 0.100 265)` | `#ffffff` on `#3a538d` | 7.54 | ≥ 4.5 | Lolos |

**Ringkasan: 12/12 Lolos.** Margin tersempit ada di sampel 4 (warning, 4.80) dan 5 (success, 4.84) — keduanya warna umpan balik di atas tint terang; jangan menggelapkan tint tanpa menggelapkan fg-nya.

## 4. Keputusan

1. Palet di atas **disetujui sebagai primitif revamp light-only** — seluruh pasangan teks lolos AA, seluruh badge melampaui ambang badge (bahkan ≥ 5.2, di atas syarat 3.0).
2. Sampel 4–5 ditetapkan sebagai batas bawah: perubahan tint/fg hijau-kuning wajib diukur ulang sebelum dipakai.
3. Item checklist yang belum bisa dibuktikan dari dokumen token saja (per audit.md, butuh tangkapan layar): *Interactive state colors* (hover/pressed/focus/disabled), *Focus indicator design*, dan *Dark and light mode definition* — tidak relevan karena repo light-only. Itu `Can't tell` dari sumber ini, bukan kegagalan palet.
4. Palet ini sudah diimplementasikan di `packages/ui/src/styles/globals.css` (`:root` + `@theme inline`, hex = padanan sRGB di atas). Dokumen ini tetap acuan metode + batas bawah sampel 4–5; angka jangan diduplikasi ke tempat lain.
