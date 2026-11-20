# Audit Fondasi Design System + shadcn — OmniRelief

- SHA: `55c63ed20feb15d03d6ae8c164aebe46a7467ed8`
- Tanggal: 2026-11-20
- Mode: audit per checklist, item-by-item, urutan asli tiap checklist, nama dan deskripsi item dipertahankan.
- Yang direview (material, bukan instruksi): `packages/ui/src/styles/globals.css`, `packages/ui/src/components/` (`button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `badge.tsx`, `skeleton.tsx`, `attachment.tsx`, `input-group.tsx`), `packages/ui/components.json`, `packages/ui/package.json`, styling `apps/web/src/**` (terutama `app/page.tsx`, `app/beranda/page.tsx`, `app/masuk/page.tsx`, `app/m/[kode]/page.tsx`, `app/s/[kode]/page.tsx`, `app/posko/*`, `app/gudang/page.tsx`, `app/bpbd/*`, `app/tim/*`, `app/transparansi/page.tsx`, `app/components/banner-offline.tsx`), `AGENTS.md` aturan 9 (UI Indonesia sederhana, tombol min 48px, status warna+label teks, shadcn + token semantik, light saja), `GLOSSARY.md`.
- Batasan input: audit dikerjakan dari source saja tanpa screenshot/render. Item yang menilai tampilan di layar (kontras aktual, hover terbaca, offset badge, ritme visual) ditandai ❔ dengan keterangan apa yang bisa dipastikan dari kode dan apa yang butuh screenshot.

## 1. Tokens — https://www.checklist.design/design-system/tokens

| | Item | Why |
|---|---|---|
| 🟡 | **Three-tier token architecture** — Tokens organised into primitive, semantic, and component tiers — primitives store raw values, semantic tokens describe purpose, component tokens scope decisions to a specific element | Tingkat semantik ada (`--primary`, `--success`, `--warning-bg`, `--radius`, dipetakan di `@theme inline`), tapi tidak ada tingkat primitif (hex mentah ditulis langsung di `:root`, mis. `--primary: #0f3b5f`) dan token komponen nyaris tidak ada (hanya `--card-spacing` di `card.tsx`). |
| 🔴 | **Naming convention** — A consistent, predictable naming pattern so any token name communicates its purpose without needing documentation. | Tidak ada konvensi terdokumentasi; nama campuran (`--success-bg` vs `--destructive/10` opacity inline, `--card-spacing` vs `--radius-*`). Contoh: `blue-500` vs `color-interactive-primary-default` dari checklist — repo masih di level nama nilai, bukan nama pakai. |
| 🔴 | **Token documentation** — Each semantic token documented with its intended use, example contexts, and what it can and cannot be used for | Tidak ada dokumentasi token di repo; tidak ada file yang menjelaskan kapan memakai `accent` vs `secondary`, atau `warning-bg` vs `destructive/10`. |
| 🔴 | **Token governance** — A clear rule for what constitutes a token versus a hardcoded value, and a process for reviewing and approving new tokens before they are added to the system | Tidak ada aturan token-vs-hardcode; buktinya hardcoded `text-[#0F3B5F]`, `text-[#5B6B7F]`, `bg-[#0F3B5F]`, `border-[#1B7FBF]`, `bg-[#FEE2E2]` tersebar di `beranda/page.tsx`, `masuk/page.tsx`, `m/[kode]/page.tsx`, `s/[kode]/page.tsx`, `posko/page.tsx`, `tim/page.tsx`, `banner-offline.tsx`. |
| ⚪ | **Design tool sync** — Tokens maintained in your design tool of choice as variables | Not needed here — belum ada design tool / variabel Figma yang disinkronkan; arah revamp baru belum menetapkan tool. Dicatat agar disiapkan saat revamp. |
| 🔴 | **Versioning and changelog** — Token changes versioned and communicated in a way that teams consuming the token system can know when values change and what the impact will be on their surfaces | Tidak ada versioning/changelog token; `globals.css` tidak mencantumkan versi dan tidak ada `docs/desain/` saat audit ini ditulis. |

## 2. Typography — https://www.checklist.design/design-system/typography

| | Item | Why |
|---|---|---|
| 🔴 | **Type scale** — A defined set of font sizes with a consistent ratio between them, covering everything from captions to display headings | Tidak ada skala terdefinisi; ukuran dipakai ad hoc (`text-xs` hampir di semua primitif, `text-sm`, `text-lg`, `text-2xl`, `text-3xl`, `text-4xl` di pages). Tidak ada rasio modular (1.25/1.333/1.5). |
| 🔴 | **Semantic text styles** — Named styles that describe role rather than size so usage is driven by meaning, not pixel values e.g. display-large, body-default, label-small, caption | Tidak ada gaya semantik; `card.tsx:40` memakai kelas `cn-font-heading` yang tidak terdefinisi di `globals.css` (typo kemungkinan maksud `font-heading`), selebihnya pages memakai ukuran mentah (`text-2xl font-bold`). |
| 🟡 | **Typeface selection and loading** — The chosen typefaces detailing style and weight e.g. Inclusive Sans Medium | `globals.css:52` menetapkan `--font-sans: "Inter Variable", sans-serif`, tapi `apps/web/src/app/layout.tsx:10-15` memuat Geist (`--font-geist-sans`, `--font-geist-mono`). Dua keputusan typeface berjalan paralel tanpa penetapan mana yang dipakai. |
| 🔴 | **Line height per style** — Line height defined explicitly for every text style since tightly spaced headings and readable body text require different values | Tidak ada line-height per gaya; hanya insidental (`leading-tight` di `app/page.tsx:84`, `leading-none` di label, `text-xs/relaxed` di card). Tidak ada pola 1.5 body / 1.2 heading / 1.1 display. |
| 🔴 | **Letter spacing per style** — Letter spacing defined per style where needed | Tidak ada `tracking-*` per gaya di primitif maupun `globals.css`. |
| 🔴 | **Responsive type behaviour** — How text styles respond to viewport size, whether through fluid type scaling, breakpoint-based overrides, or fixed sizes with responsive layout compensation | Tidak ada aturan responsif; satu-satunya penyesuaian adalah `md:text-xs` di `input.tsx:11`/`textarea.tsx:9` (malah mengunci ukuran, bukan skala). |
| 🟡 | **Minimum readable size** — The smallest text size in use across the system, and how readability at that size is validated in the actual rendering environment | Ukuran terkecil adalah `text-xs` (12px) dipakai sebagai default body di button/input/card — di bawah ambang baca nyaman untuk bahasa Indonesia sederhana; belum ada validasi di lingkungan render. Masih 🟡 karena 12px dapat diterima untuk label/keterangan, tapi sebagai default body itu masalah. |
| 🔴 | **Accessibility responsiveness** — How text styles behave at 200% browser zoom, and whether any style communicates meaning through colour variation alone | Tidak ada ketentuan zoom 200%; status seperti selisih/Perlu Dicek memakai warna + label teks di beberapa tempat (sesuai AGENTS.md 9) tapi belum dijadikan aturan tipografi (mis. status tidak boleh mengandalkan warna saja). |

## 3. Spacing / Grid — https://www.checklist.design/design-system/spacing-and-grid

| | Item | Why |
|---|---|---|
| 🟡 | **Spacing scale** — A defined set of spacing values (typically base-4 or base-8, covering 4, 8, 12, 16, 24, 32, 48, 64, 96) used for all margin, padding, and gap decisions | Skala implisit Tailwind (base-4) dipakai (`p-6`, `gap-6`, `px-2.5`), tapi tidak didefinisikan sebagai keputusan sistem; `card.tsx:14` memakai `--spacing(4)`/`--spacing(3)` yang bagus tapi satu-satunya contoh. |
| 🔴 | **Semantic spacing tokens** — Named tokens for spacing that describe purpose (space-component-padding-sm, space-layout-section-gap) so spacing decisions are intentional, not arbitrary | Tidak ada token spasi semantik; angka mentah di semua pages (`p-6`, `gap-6`, `gap-10` di `app/page.tsx:79`). |
| 🔴 | **Column grid** — A defined column grid for each major breakpoint (typically 4 columns mobile, 8 tablet, 12 desktop) with gutter and margin values specified | Tidak ada definisi grid kolom/gutter/margin; layout hanya `mx-auto max-w-*` + flex. |
| 🔴 | **Breakpoints** — A named set of breakpoints (sm, md, lg, xl) that are shared between design and code, so responsive behaviour is described in consistent terms across both disciplines | Memakai breakpoint bawaan Tailwind tanpa penetapan bersama; tidak ada token/konvensi breakpoint di repo. |
| 🟡 | **Component vs layout spacing** — A clear distinction between spacing used inside components and spacing used to compose layouts, since different scales often apply to each | Cikal bakal ada: `--card-spacing` (dalam-komponen) vs `gap-6`/`p-6` (layout) — tapi tidak dijadikan aturan, sehingga padding tombol (`px-2.5`) dan gap section (`gap-10`) hidup di skala yang sama tanpa pembedaan. |
| ⚪ | **Density variants** — Where applicable, defined compact and comfortable density modes, common in data-heavy products where users need to choose between information density and breathing room | Not needed here — produk operasional posko/gudang belum membutuhkan mode densitas ganda; satu densitas lapang lebih tepat untuk pengguna lapangan. |
| 🔴 | **Baseline grid alignment** — Text baselines and component heights designed to align to the base unit, so stacking elements produces predictable, harmonious vertical rhythm | Tidak ada baseline grid; tinggi komponen campuran (`h-5` badge, `h-8` input/button, `h-9` button-lg) tidak kelipatan unit yang sama dengan ritme teks. |

## 4. Button — https://www.checklist.design/design-system/button

| | Item | Why |
|---|---|---|
| 🟢 | **Base style** — Your default style, one of the following: fill, outline, underline | Ada dan jelas: default fill (`bg-primary`, `button.tsx:10`), plus outline/secondary/ghost/destructive/link. |
| 🟡 | **Shape** — Visual properties of a button: padding, border, border radius, shadow | Properti ada (padding/size, border, radius, tanpa shadow — wajar untuk gaya flat), tapi radius tidak konsisten: primitif `rounded-none` (`button.tsx:6`), pages menimpa `rounded-xl` (`app/page.tsx:107,114,120`) dan `rounded` (`beranda/page.tsx:40,49`, `masuk/page.tsx:63`). |
| 🟢 | **Variants** — Each visual type to represent button structure e.g. primary and secondary buttons | Enam varian terdefinisi dengan peran jelas; pemakaian di pages konsisten (primer untuk aksi utama, outline untuk sekunder). |
| ❔ | **Copy** — Instructional text that details what will happen if you click the button | Dari kode terlihat copy generik yang berkonteks ("Masuk", "Buat manifest") — tepat menurut tip checklist; tapi apakah copy selalu menjelaskan akibat (mis. "Kunci & publikasikan" vs "Simpan draf") perlu screenshot pages untuk dipastikan. |
| 🟡 | **States** — How the button changes based on the interaction: hover, focused, disabled | Hover/focus-visible/disabled/`aria-invalid` ada (`button.tsx:6`); yang kurang: (1) tidak ada gaya `active`/pressed selain `translate-y-px`, (2) disabled hanya `opacity-50` tanpa perubahan kursor/teks yang jelas, (3) tidak ada state loading — penting untuk aksi append-only/hash-chain yang lambat. |

Catatan di luar checklist (observasi sendiri): tinggi default `h-8` (32px, `button.tsx:22`) melanggar AGENTS.md aturan 9 (tombol minimal 48px); pages menambal dengan `min-h-12` satu per satu — ini rapuh dan harus naik ke token ukuran tombol.

## 5. Card — https://www.checklist.design/design-system/card

| | Item | Why |
|---|---|---|
| 🟡 | **Style** — Consider default background, border, shadow | Latar `bg-card` + `ring-1 ring-foreground/10` sebagai pengganti border/shadow ada (`card.tsx:14`), tapi `rounded-none` bertabrakan dengan `rounded-xl` pages; tidak ada keputusan shadow vs ring yang eksplisit. |
| 🟡 | **Consistency** — Ensure you have one base style for all cards | Satu komponen dasar dipakai, tapi ada varian `size: sm/default` tanpa panduan kapan memakai; pages publik (`m/[kode]`, `s/[kode]`) memakai `div.rounded`/`border-2` sendiri, bukan `Card`. |
| 🟢 | **Spacing** — A framework to sort your padding levels by | Ada: `--card-spacing` (`--spacing(4)` default, `--spacing(3)` untuk sm, `card.tsx:14`) — pola token komponen yang benar dan bisa jadi contoh untuk komponen lain. |
| ❔ | **Responsiveness** — Consider the structure of the content in all various screen sizes | Struktur `CardHeader` grid + `@container` ada di kode, tapi tanpa render mobile tidak bisa dipastikan apakah konten menumpuk top-down dengan benar. Screenshot mobile yang menyelesaikan ini. |
| 🟡 | **Content hierarchy** — The primary action/s you want users to perform | Slot `CardAction`/`CardFooter` tersedia, tapi tidak ada aturan aksi primer di akhir kartu; pemakaian di pages menaruh aksi di luar kartu (formulir terpisah). |

## 6. Input Field — https://www.checklist.design/design-system/input-field

| | Item | Why |
|---|---|---|
| 🟢 | **Input field** — Interactive text field for user to enter their data into | `Input` dan `Textarea` ada dengan gaya konsisten (`h-8`/`min-h-16`, `border-input`, `px-2.5`) dan state fokus/disabled/invalid. |
| 🟡 | **Label** — Stating what information the user is meant to provide | Komponen `Label` ada, tapi (1) tidak ada pengaitan programatik bawaan (tanpa `htmlFor` otomatis/`aria-labelledby`), (2) gaya `text-xs` menyulitkan pengguna dengan literasi/usia beragam di lapangan. |
| 🟢 | **Placeholder text** — Text inside the input field acting as an example of what you want the user to enter | Placeholder memakai `placeholder:text-muted-foreground` — terlihat lebih terang dari teks isi, sesuai tip checklist. |
| 🟡 | **Data format** — Set text fields to allow the relevant text values e.g. numeric only for phone number | `type` diteruskan ke primitif, tapi tidak terlihat `inputMode`/`pattern`/`autocomplete` untuk field posko (jumlah penyintas = numerik, kode MNF/DNT = format khusus); perlu audit per formulir. |
| ⚪ | **Illustration or icon** — A visual cue can help break up a long list of text fields | Not needed here — formulir lapangan (snapshot penyintas, batch sumbangan) pendek dan berurutan; ikon per field menambah noise. Slot ikon tersedia via `input-group.tsx` bila nanti dibutuhkan. |
| 🔴 | **Hint** — Elaborate on the title of the text field incase a user struggles to know what to enter | Tidak ada komponen/pola hint/deskripsi (`aria-describedby`, teks bantuan seperti format `DNT-2026-0001`); pengguna yang bingung tidak punya pegangan selain label. |

## 7. Badge — https://www.checklist.design/design-system/badge

| | Item | Why |
|---|---|---|
| 🟡 | **Detail** — A badge can have a numeric value, or a basic shape | Struktur mendukung ikon + teks (`badge.tsx:7`), tapi tinggi dikunci `h-5` dan tidak ada varian dot-only untuk "satu pembaruan" vs angka. |
| 🟡 | **Color** — Badges can represent your standard states - error, success, warning | Hanya `default/secondary/destructive/outline/ghost/link`; varian `success`/`warning`/`info` hilang padahal tokennya ada di `globals.css:24-29` — akibatnya status sukses/peringatan di pages memakai `div.rounded-xl` ad hoc (`posko/bantuan.tsx:88`, `tugas.tsx:100`) bukan Badge. |
| ❔ | **Offset position** — A badge should sit outside it's relevant element to gain attention easier | Tidak ada utilitas/pola offset di kode; apakah badge tumpang-tindih ikon dengan benar hanya bisa dinilai dari render. Screenshot contoh badge di atas ikon yang menyelesaikannya. |

## Bedah: primitif vs komposit, dan struktur token usulan

### Primitif (reusable, tidak tahu konteks bisnis)

Yang sudah benar sebagai primitif: `Button` (+`buttonVariants`), `Input`, `Textarea`, `Label`, `Badge` (+`badgeVariants`), `Skeleton`, `Tooltip`, `Checkbox`, `Select`, `DropdownMenu`, `Sonner`, `Card` dasar. Primitif tidak boleh menyebut istilah domain (posko, manifest, selisih) dan tidak boleh mengunci alur.

### Komposit (milik fitur, boleh menyebut domain)

Belum ada — dan ini akar banyak masalah: `attachment.tsx`, `bubble.tsx`, `message.tsx`, `message-scroller.tsx`, `marker.tsx`, `empty.tsx`, `input-group.tsx` hidup di folder yang sama dengan primitif tanpa pembedaan. Usulan: pindahkan komposit ke `packages/ui/src/composites/` (atau biarkan di `apps/web` bila hanya dipakai satu rute), dengan contoh yang harus dibangun saat revamp: `StatusBadge` (selisih nol/positif, Perlu Dicek, verifikasi), `HashChainLine` (baris riwayat + hash), `StockProgress` (alokasi batch vs jatah), `OfflineBanner`, `EmptyPosko`.

### Bug fondasi yang harus dibetulkan dulu (urut)

1. `globals.css:7` menulis `::root` — harus `:root`. Selama salah, seluruh token bisa gagal di-resolve sesuai harapan di browser tertentu.
2. `badge.tsx:4` mengimpor `cn` dari `"cn"` — harus `@omnirelief/ui/lib/utils` seperti komponen lain; alias `cn` bukan path impor yang valid.
3. Kartu memakai `cn-font-heading` (`card.tsx:40`) yang tidak didefinisikan — ganti dengan token tipografi semantik saat dibangun.
4. `dark:` variant tersebar di button/input/textarea/badge (`button.tsx:12-19`, `input.tsx:11`, dsb.) padahal AGENTS.md menetapkan light saja — hapus agar tidak ada tema gelap setengah jadi.

### Struktur token usulan (3 tingkat, nama `kategori-peran-konteks-kondisi`)

```
--primitive-{warna,spasi,tipe,radius}      → nilai mentah, satu-satunya tempat hex/angka hidup
  contoh: --primitive-blue-900: #0f3b5f; --primitive-slate-500: #5b6b7f;
          --primitive-space-050..--primitive-space-1600 (0,2,4,8,12,16,24,32,48,64,96)
          --primitive-font-sans: "Inter Variable", system-ui, sans-serif;
--semantic-{bg,fg,border,status}-*         → maksud, tanpa menyebut komponen
  contoh: --semantic-bg-page, --semantic-bg-card, --semantic-fg-default,
          --semantic-fg-muted, --semantic-action-primary(-hover,-fg),
          --semantic-status-ok/--semantic-status-ok-bg, -waspada(-bg),
          -bahaya(-bg), -info(-bg), --semantic-ring-focus
--component-{button,card,input,badge}-*     → cakupan satu elemen
  contoh: --component-button-height-md: 48px; --component-button-radius;
          --component-card-spacing; --component-input-height;
          --component-badge-height; --component-focus-ring-width: 2px;
```

Aturan pemakaian: pages hanya boleh memakai token `semantic-*`/`component-*` (via utilitas Tailwind yang dipetakan di `@theme inline`); hex mentah dan angka spasi mentah hanya hidup di tingkat `primitive-*`. Larangan ini yang menjawab item Token governance yang merah. Radius: tetapkan `--radius: 12px` (0.75rem) sebagai dasar, turunkan `sm/md/lg/xl` dari situ seperti sekarang, dan putuskan satu sikap `rounded-none` vs `rounded-xl` (usulan: pertahankan lengkung 12px untuk sentuh ramah, hapus `rounded-none` dari primitif).

### Aturan whitespace & balance (skala spasi, max-width, ritme vertikal)

1. **Skala spasi tunggal base-8**: 4, 8, 12, 16, 24, 32, 48, 64, 96 (lock `px-2.5`/`gap-1.5` hanya untuk inset dalam-komponen yang optically centered seperti teks tombol; selain itu kelipatan 4/8).
2. **Pembedaan dua level**: inset komponen (`component-*-spacing`: button 12–16px horizontal, card 12/16px, input 10–12px) vs ritme layout (`layout-section-gap: 32px`, `layout-page-padding: 24px`, `layout-stack-sm/md/lg: 8/16/24px`). Jangan campur.
3. **Max-width konsisten**: halaman baca/formulir sempit `max-w-md` (posko, gudang, masuk, beranda — sudah benar); halaman operasional `max-w-2xl` (dasbor, manifest, transparansi — sudah benar). Jangan tambah `max-w` baru; konten tabel/hash-wrap memakai scroll horizontal dalam kartu, bukan memperlebar halaman.
4. **Ritme vertikal**: satu pola stack per halaman — judul (display) → deskripsi (body, `margin-top: 4px`) → konten (`margin-top: 24px`) → aksi (`margin-top: 24px`, tombol full-width di mobile, `min-height: 48px`). Baseline: tinggi baris body 1.5, heading 1.2, display 1.1; tinggi komponen kelipatan 8 (badge 24, input/button 40–48, tombol utama 48).
5. **Kepadatan satu mode**: nyaman (comfortable) untuk semua peran lapangan; tidak ada density compact sampai ada permintaan eksplisit dari pengguna gudang/BPBD.

## Verdict per checklist

- Tokens: ISSUES (2/6 merah-or-kuning struktural + 3 merah tata kelola; tanpa primitif, tanpa konvensi, tanpa dokumentasi).
- Typography: ISSUES (tanpa skala, tanpa gaya semantik, typeface ganda, tanpa line-height/letter-spacing responsif).
- Spacing/Grid: ISSUES (tanpa token semantik, tanpa grid, tanpa breakpoint bernama, tanpa baseline).
- Button: ISSUES (bentuk tidak konsisten + tinggi default 32px melanggar aturan 48px AGENTS.md).
- Card: ISSUES (gaya dasar goyah + pages membangun kartu sendiri).
- Input Field: ISSUES (tanpa hint; label dan format data lemah).
- Badge: ISSUES (tanpa varian success/warning/info; tanpa pola offset).

## Sumber yang dibaca (bukti path + baris)

- `.agents/skills/checklist-design/SKILL.md:1-85`, `references/audit.md:1-66`, `references/index.md:1-162`
- `references/checklists/design-system-tokens.md:9-33`, `design-system-typography.md:9-41`, `design-system-spacing-and-grid.md:9-36`, `design-system-button.md:9-24`, `design-system-card.md:9-28`, `design-system-input-field.md:9-33`, `design-system-badge.md:9-20`
- `packages/ui/src/styles/globals.css:1-109` (token, `@theme inline`, `@layer base`)
- `packages/ui/src/components/button.tsx:1-55`, `card.tsx:1-84`, `input.tsx:1-18`, `badge.tsx:1-51`, `label.tsx:1-19`, `textarea.tsx:1-17`, `skeleton.tsx:1-12`
- `packages/ui/components.json:1-19`, `packages/ui/package.json:1-38`
- `apps/web/src/app/page.tsx:79-162`, `beranda/page.tsx:26-49`, `masuk/page.tsx:28-68`, `m/[kode]/page.tsx:73-105`, `s/[kode]/page.tsx:41-70`, `posko/page.tsx:8-11`, `posko/bantuan.tsx:86-93`, `posko/formulir.tsx:95-148`, `gudang/page.tsx:40-55`, `bpbd/page.tsx:7-10`, `bpbd/dasbor.tsx:97-175`, `bpbd/kirim/formulir.tsx:104-120`, `tim/page.tsx:7-10`, `tim/tugas.tsx:95-111`, `transparansi/page.tsx:32-34`, `app/components/banner-offline.tsx:52`, `app/layout.tsx:10-23`
- `AGENTS.md:1-10` (aturan 9), `GLOSSARY.md:1-69`
