# Audit peran + pengaturan — iterasi 2 (Z)

- Scope: `apps/web/src/app/posko/**`, `tim/**`, `beranda/**`, `pengaturan/**`,
  `profil/**`, `masuk/**`. Rute API dan `validasi.ts` READ-ONLY (tidak diubah).
- Checklist dibaca lokal dari repo induk
  (`.agents/skills/checklist-design/references/checklists/`, tidak tersedia di worktree ini):
  `web-app-dashboard`, `web-app-settings`, `web-app-account`, `mobile-account`,
  `flows-showing-input-error`, `flows-submitting-a-form`, `flows-saving-changes`,
  `design-system-toggle`, `design-system-toast`, `design-system-modal`.
- Pemetaan acuan: `docs/desain/pemetaan-checklist.md` §4, §7, §8, §9, §10.
- Legenda: ✅ present · 🟡 sebagian · 🔴 hilang→diperbaiki · ⚪ keputusan sadar (tetap).

## 1. `/posko` — dashboard tugas + form + empty

| # | Item (asal checklist) | Status | Bukti jalur:baris |
|---|---|---|---|
| 1 | Needs attention: banner Minta Revisi di atas | 🟡→🟢 | `posko/formulir.tsx:204-235` banner merah/kuning + tanggal + total jiwa + CTA |
| 2 | Alasan revisi teks penuh + CTA perbaiki (scroll+focus) | 🟡 sebagian | `posko/formulir.tsx:204-221` CTA `Perbaiki sekarang` → `fokusFormulir` (scroll + focus `#posko-bayi`); **teks alasan TIDAK tampil — data tidak ada** (lihat §6.1) |
| 3 | Status jatah disetujui X dari snapshot tanggal Y | 🔴→🟢 | `posko/formulir.tsx:238-250` kartu `Status jatah` dari GET laporan yang ada |
| 4 | Quick action konfirmasi terima inline | ✅ | `posko/bantuan.tsx:185-206` tombol primer per kiriman |
| 5 | Empty state kiriman | ✅ | `posko/bantuan.tsx:158-167` + CTA implisit (menunggu publikasi BPBD) |
| 6 | Input-error per bidang sebut nama | ✅ | `posko/formulir.tsx:155-160` `role="alert"` + `posko/bantuan.tsx:235-239` keterangan wajib |
| 7 | Submit: loading + sukses + galat | ✅ | `posko/formulir.tsx:126-142,163-178` + toast; draf via saving-changes |

## 2. `/tim` — mobile dashboard + tab badge + notifikasi

| # | Item | Status | Bukti |
|---|---|---|---|
| 1 | Batas check-in terlihat SEBELUM lewat | 🟡→🟢 | `tim/tugas.tsx:253-257` baris `Batas check-in:` per kartu + `tim/tugas.tsx:284-288` di detail |
| 2 | Peringatan kuning batas < 1 jam | 🔴→🟢 | `tim/tugas.tsx:230-247,276-280` badge `Check-in N mnt lagi` (`bg-warning-bg`) |
| 3 | Lewat batas = Perlu Dicek merah | ✅ dipertahankan | `tim/tugas.tsx:242,275` badge destructive + counter `tim/tugas.tsx:226-229` |
| 4 | Tombol kirim sekarang saat antrean gagal | 🔴→🟢 | `tim/tugas.tsx:141-150,163-188` `kirimSekarang()` pakai `kirimAntrean` lib offline (read-only) + deep-link `Atur notifikasi → /pengaturan#notifikasi` |
| 5 | Darurat = merah + konfirmasi dialog, bukan satu ketuk | 🔴→🟢 | `tim/tugas.tsx:312-379` label merah + tombol destructive + `Dialog` konfirmasi (`Ya, kirim darurat` / `Batal`) |
| 6 | Toast varian + copy jelas + dismissable | ✅ | `sonner` sukses/error/info di `tugas.tsx:96,104,124,128,144,148` |
| 7 | Tap target 48px | ✅ | semua tombol/textarea `min-h-12` |

## 3. `/pengaturan` — settings web/mobile + legal + danger

| # | Item | Status | Bukti |
|---|---|---|---|
| 1 | Grouped layout + account anchor di atas | ✅ | `pengaturan/page.tsx:44-62` jangkar akun → `/profil` |
| 2 | Native toggle Switch (bukan tiruan) | 🔴→🟢 | `pengaturan/notifikasi.tsx:56-75`, `pengaturan/aksesibilitas.tsx:91-117` `Switch` shadcn + `aria-label` aktif/nonaktif Indonesia |
| 3 | Toggle berfungsi nyata (bukan pajangan) | 🔴→🟢 | localStorage `omnirelief-notifikasi` / `omnirelief-aksesibilitas` dipertahankan; terapkan font-size + `.a11y-kontras` + `.a11y-gerak` |
| 4 | Ukuran teks 3 pilihan | 🟡→🟢 | Segmented buttons `aria-pressed` + pratinjau (`aksesibilitas.tsx:68-90`) — ⚪ Switch hanya untuk on/off (sesuai tip checklist toggle) |
| 5 | Deep-link banner offline → Notifikasi | ⚪ dicatat | `components/banner-offline.tsx:52-66` **tanpa tautan**; berkas bukan milik Z → TIDAK disentuh. Pengganti dalam scope: antrean `/tim` → `/pengaturan#notifikasi` (`tugas.tsx:180-185`); card diberi `id="notifikasi"` (`page.tsx:64`) |
| 6 | Prompt → `#aksesibilitas` | 🟡→🟢 | Tidak ada prompt(existing) di file milik Z → tambah prompt di Notifikasi (`notifikasi.tsx:77-79` tautan `Buka aksesibilitas`) |
| 7 | Versi app + hash build, tanpa hardcode palsu | 🔴→🟢 | `pengaturan/page.tsx:20-21,139-140` baca `NEXT_PUBLIC_APP_VERSION` + `VERCEL_GIT_COMMIT_SHA[0:7]`; fallback jujur `dev`/`lokal` bila env absen |
| 8 | Bantuan + FAQ ribet | ✅ | `pengaturan/page.tsx:125-156` |
| 9 | Zona Keluar paling bawah | ✅ | `pengaturan/page.tsx:146-157` Alert terakhir; tanpa hapus-akun mandiri (⚪ milik admin, dipertahankan) |

## 4. `/profil` — account + profile operasional

| # | Item | Status | Bukti |
|---|---|---|---|
| 1 | Email tampil penuh; ubah via admin | ✅ | `profil/page.tsx:60-81` inisial + nama + email + peran |
| 2 | Password + autentikasi ulang | ✅ | server action `ubahPassword` (`page.tsx:31-46`) sign-in ulang password lama |
| 3 | Simpan nonaktif sampai ada perubahan | 🔴→🟢 | `profil/formulir-password.tsx:33,107` `disabled={!kotor}` (dirty tracking) + loading `Menyimpan...` (saving-changes) |
| 4 | Konfirmasi tersimpan inline + toast | 🔴→🟢 | `formulir-password.tsx:42-46` `role="status"` + `toast.success` |
| 5 | 3 input (lama + baru + konfirmasi) | 🟡→🟢 | tambah konfirmasi + validasi cocok client (`formulir-password.tsx:76-98`); server action tak berubah (API read-only) |
| 6 | Photo/Bio/Links/Preview, Linked accounts, hapus mandiri | ⚪ | Tanpa profil publik antar-pengguna; tanpa OAuth; nonaktifkan milik admin — dipertahankan dari iterasi lalu |

## 5. `/masuk` + `/beranda` — login + dashboard

| # | Item | Status | Bukti |
|---|---|---|---|
| 1 | Error per bidang sebut nama bidang | 🟡→🟢 | `masuk/formulir.tsx:47-52` `role="alert"` + pesan menyebut Email/password; kedua input `aria-invalid` + `aria-describedby="masuk-galat"`; autofocus email saat galat. Validasi per-bidang server sejati butuh rute baru — di luar scope (API read-only) |
| 2 | Show/hide + ingat saya + info demo + redirect | ✅ | tidak berubah; SSO tetap ⚪ (email+password internal) |
| 3 | Welcome sejak-terakhir | ✅ | `beranda/isi.tsx:333-336` + H1 (satu per layar) |
| 4 | Hero angka + konteks periode | 🟡→🟢 | `beranda/isi.tsx:337-339` `Angka hari ini · diperbarui HH:MM` via `diperbarui` (`isi.tsx:98,314-316`) |
| 5 | Aktivitas terakhir 5 + tautan | ✅ | tidak berubah |
| 6 | Layout control/widget kustom | ⚪ | urutan kritis tetap — dipertahankan |

## 6. Gap data / milik orang lain (tidak diperbaiki di sini)

1. **Alasan Minta Revisi tak tersimpan di mana pun.** `api/bpbd/verifikasi/route.ts:14-27`
   hanya update `status`; `validasiVerifikasi` (`lib/validasi.ts`) bahkan tidak menerima
   `catatan`; `GET api/posko/laporan` (`api/posko/laporan/route.ts:48-53`) select tanpa kolom
   alasan. Banner posko kini menampilkan info terbaik yang didukung data (tanggal + total +
   CTA). Perlu pemilik API menambah kolom + select bila teks penuh wanted.
2. **`banner-offline.tsx` tanpa deep-link** (`components/banner-offline.tsx:52-66`) —
   berkas bukan milik Z, tidak disentuh sesuai instruksi.
3. **Checklist `references/checklists/` tidak ada di worktree ini** — dibaca dari repo induk
   lokal (`/home/todayz/Workspaces/omnirelief`), tanpa fetch.

## 7. Verifikasi

- `bun --filter web check-types` exit 0.
- `bun --filter web lint` exit 0, nol baris menyebut berkas Z.
- `bun --filter web test` hijau (6 file, 27 test).
- Tidak `build`/dev-server sesuai instruksi.
