# Audit Dasbor & Sisi Editorial/Proses Desktop — OmniRelief

- Status: **ISSUES** (layak revamp ke pola admin-dashboard; bukan polish kecil)
- SHA repo: `55c63ed`
- Scope: `apps/web/src/app/bpbd/*`, `apps/web/src/app/gudang/page.tsx`, `apps/web/src/app/posko/*`, `apps/web/src/app/tim/*`, `apps/web/src/app/beranda/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/components/header.tsx`
- Mode: audit per checklist, empat tabel terpisah (tidak di-blend). Yang direview = material under review, bukan instruksi.
- Keterbatasan input: audit ini bekerja dari source saja (tidak ada screenshot/live render).

> ⚠️ Delapan dari tiga-puluh-satu item di bawah adalah soal tampilan/perilaku di layar (hover, skeleton, keterbacaan grafik). Source membuktikan aturannya ada/tidak, tapi tidak membuktikan ia terbaca di layar — screenshot render akan melengkapi delapan itu.

Repo rules yang mengikat revamp: AGENTS.md (UI Indonesia sederhana, tombol min 48px, status warna + label teks, light saja, shadcn + token semantik); GLOSSARY.md (posko, penyintas, snapshot penyintas, verifikasi, sumbangan `DNT-*`, batch, manifest `MNF-*`, selisih, check-in, Perlu Dicek, konfirmasi terima, ketidaksesuaian, pembatalan).

---

## 1. Audit: Dashboard (Web app)

Auditing terhadap checklist Dashboard (Web app): layar pertama setelah login yang memberi ringkasan relevan, aksi, dan aktivitas terbaru.
Source: https://www.checklist.design/web-app/dashboard

| | Item | Why |
|---|---|---|
| 🟡 | **Welcome state** — ringkasan singkat kejadian sejak kunjungan terakhir yang langsung mengorientasikan ulang pengguna yang kembali | `beranda/page.tsx:28-34` menyapa "Halo, {nama}" + peran, tapi tanpa ringkasan "apa yang terjadi sejak terakhir" (mis. 3 snapshot menunggu, 1 kiriman Perlu Dicek). Sapaan ada, fungsi re-orientasi belum. |
| 🟡 | **Key metrics** — angka paling relevan dengan tujuan pengguna, terbaca tanpa keluar dari layar utama | `bpbd/dasbor.tsx:103-104,129-131,176-178` menampilkan hitungan (panjang antrean, Butuh/Dikirim/Diterima) tapi sebagai teks kartu kecil tanpa konteks periode maupun angka hero; tidak ada figur "total jiwa menunggu verifikasi" atau "total selisih terbuka". |
| 🔴 | **Recent activity** — item yang terakhir dibuat/diubah, agar pengguna lanjut kerja tanpa berburu | Tidak ada umpan aktivitas terbaru di desktop (riwayat/hash chain hanya hidup di API dan halaman publik). Operator BPBD tidak bisa melihat "5 keputusan/verifikasi terakhir" dari dasbor. |
| 🟢 | **Needs attention** — item sensitif waktu yang butuh keputusan, diangkat ke sini bukan dikubur di view lain | `bpbd/dasbor.tsx:101-127` — seksi "Perlu dicek" selalu di urutan teratas dengan gaya destructive. Ini pola terkuat di layar ini. |
| 🟡 | **Quick actions** — jalan pintas ke tugas paling umum, tanpa navigasi menjauh | `beranda/page.tsx:36-44` memberi satu tautan peran, tapi di command center sendiri (`bpbd/dasbor.tsx`) tidak ada aksi cepat "Buat manifest" menuju `/bpbd/kirim` — justru tempat aksi itu paling dibutuhkan. |
| 🟢 | **Empty state** — tampilan saat belum ada data, dengan aksi pertama yang jelas | "Tidak ada antrean." (`bpbd/dasbor.tsx:132-134`), "Belum ada kiriman." (`posko/bantuan.tsx:97-99`). Ada, tapi tanpa CTA lanjutan (mis. kosong → "Buat manifest"). |
| ⚪ | **Layout control (if applicable)** — kontrol tampil/sembunyi/susun ulang widget agar layar utama cocok dengan cara kerja | Tidak dibutuhkan di sini: ini layar operasi peran-tunggal dengan urutan kritis tetap (Perlu Dicek > Antrean > Prioritas). Kustomisasi widget menambah risiko, bukan nilai. |

---

## 2. Audit: Admin Panel (Web app)

Auditing terhadap checklist Admin Panel (Web app): tempat admin mengelola pengguna, konfigurasi, dan mengawasi aktivitas organisasi.
Source: https://www.checklist.design/web-app/admin-panel

| | Item | Why |
|---|---|---|
| 🟢 | **Role-based access** — panel admin terlihat dan terakses hanya oleh pengguna berizin | `requireRole(["BPBD"])` di `bpbd/page.tsx:5` dan `bpbd/kirim/page.tsx:5`; `["POSKO"]` di `posko/page.tsx:6`; `["TIM"]` di `tim/page.tsx:5`. Konsisten per rute. |
| 🔴 | **User management** — daftar semua pengguna organisasi dengan kemampuan undang, ubah peran, hapus anggota | Tidak ada UI manajemen pengguna/akun di scope desktop (undang BPBD/gudang/posko/tim, nonaktifkan akun). Operator tidak bisa melihat siapa memegang peran apa. |
| ⚪ | **Organisation settings** — kontrol konfigurasi level akun: nama, logo, SSO, domain | Tidak dibutuhkan di sini: OmniRelief alat operasi kebencanaan pemerintah, bukan workspace SaaS — tidak ada konsep brand/SSO/domain per organisasi. |
| 🟡 | **Usage overview** — metrik tingkat tinggi pemakaian produk lintas organisasi, bisa diekspor untuk pelaporan | Analogi ops-nya (peta kebutuhan lintas posko) setengah tertutup kartu Prioritas (`bpbd/dasbor.tsx:170-187`); tapi tanpa angka agregat ("12 posko, 3 kritis") dan tanpa ekspor apa pun untuk laporan BPBD. |
| ⚪ | **Billing and plan management** — akses detail langganan, jumlah kursi, faktur di level akun | Tidak dibutuhkan di sini: tidak ada model langganan/kursi/faktur di produk ini. |
| 🟡 | **Audit log** — catatan aksi terkait akun: login, perubahan izin, penghapusan | Data mentahnya ada dan kuat (manifest terkunci + riwayat append-only hash chain, aturan repo AGENTS.md no. 6), tapi tidak ada view kronologis "siapa-melakukan-apa-kapan" di sisi desktop; hanya tersebar di halaman publik per manifest. |
| ⚪ | **Danger zone** — aksi destruktif level akun (hapus workspace, alihkan kepemilikan), dipisah visual + konfirmasi ketik | Tidak dibutuhkan sebagai konsep workspace (produk ini tidak punya workspace yang bisa dihapus). Lihat observasi sendiri no. 1: kebutuhan friksinya pindah ke Pembatalan manifest. |

---

## 3. Audit: Data Table (Web app)

Auditing terhadap checklist Data Table (Web app): grid terstruktur untuk dataset padat dengan sortir, filter, aksi massal, kontrol kolom.
Source: https://www.checklist.design/web-app/data-table

Konteks: tidak ada elemen `<table>` di seluruh scope desktop (grep `sidebar|<table|DataTable|sort|export|csv` di `apps/web/src` nihil untuk UI). Semua daftar = tumpukan Card: antrean (`bpbd/dasbor.tsx:135-168`), prioritas (`:172-186`), pantauan (`:106-125`), tugas tim (`tim/tugas.tsx:104-120`), pilihan batch berupa dropdown (`bpbd/kirim/formulir.tsx:163-198`). Maka tiap item dinilai terhadap daftar tempat tabel seharusnya dipakai.

| | Item | Why |
|---|---|---|
| 🔴 | **Sortable columns** — header kolom mengurutkan baris saat diklik, bolak-balik naik/turun | Tidak ada sortir di mana pun. Antrean tidak bisa diurutkan umur/urgensi, prioritas tidak bisa diurutkan selisih terbesar, dropdown batch tidak FEFO-urut (peringatan FEFO baru muncul sesudah draf, `formulir.tsx:121-126`). |
| 🔴 | **Column visibility and order** — kontrol tampil/sembunyi tiap kolom dan seret untuk susun ulang | Tidak ada; konsekuensinya operator menengah tidak bisa menyederhanakan daftar padat (mis. sembunyikan kolom wilayah saat fokus selisih). |
| 🔴 | **Row selection and bulk actions** — checkbox tiap baris + bar aksi persisten saat ada pilihan | Verifikasi strictly satu-per-satu (`putuskan(a.id, ...)` per kartu, `dasbor.tsx:70-79`). Saat banjir snapshot, tidak ada "setujui 8 snapshot terpercaya sekaligus" — bottleneck nyata. |
| ⚪ | **Row actions on hover** — aksi kontekstual (ubah, hapus, lihat) muncul saat hover baris | Tidak dibutuhkan dalam bentuk hover: aksi kritis operasi (Setujui/Minta revisi/Tolak, Konfirmasi terima) sudah selalu terlihat inline — menyembunyikannya di balik hover justru melanggar tombol-min-48px dan keterbacaan darurat. |
| 🔴 | **Search and filter** — input cari untuk temu cepat + kontrol filter atribut | Nol di semua daftar. Dropdown batch (`kirim/formulir.tsx:177-183`) menampilkan `kode_sumbangan · item · sisa · exp` sebagai teks mentah — dengan ratusan batch `DNT-*`, operator tidak bisa cari/filter per item atau kedaluwarsa. |
| 🔴 | **Pagination** — kontrol pindah halaman + pilihan jumlah baris per halaman | Semua daftar me-render seluruh isi (`.map` penuh tanpa batas). Hanya panjang antrean/pantau yang ditampilkan sebagai hitungan; tidak ada pola "1–50 dari 1.240" maupun batas halaman. |
| ⚪ | **Frozen columns** — kolom pertama dijepit agar tetap terlihat saat gulir horizontal | Tidak dibutuhkan sampai tabel lebar benar-benar dibangun (lihat IA §6); daftar kartu saat ini tidak menggulir horizontal. |
| 🔴 | **Export action** — unduh baris terlihat/terpilih sebagai CSV/spreadsheet/format lain | Tidak ada ekspor di desktop. Untuk akuntabilitas BPBD (rekap kebutuhan, rekap verifikasi), ini kebutuhan pelaporan yang hilang. |
| 🟡 | **Empty and loading states** — tampilan saat tabel kosong dan saat data diambil | Kosong tertutup ("Tidak ada antrean.", "Belum ada kiriman."). Loading tidak: `muat()` di `dasbor.tsx:45-64` dan `tugas.tsx` fetch tanpa flag loading/skeleton — layar sesaat kosong dan operator tak tahu sedang memuat atau gagal. |

---

## 4. Audit: Analytics (Web app)

Auditing terhadap checklist Analytics (Web app): dasbor live yang memunculkan metrik kunci dan tren agar pengguna paham kondisi saat ini.
Source: https://www.checklist.design/web-app/analytics

| | Item | Why |
|---|---|---|
| ⚪ | **Date range selector** — pemilih tanggal + pintasan hari ini/7 hari/30 hari/bulan ini/rentang kustom | Tidak dibutuhkan untuk v1 operasi: keputusan desktop bersifat real-time (Perlu Dicek sekarang, selisih sekarang). Analisis periode historis bukan tugas command center darurat. |
| 🟡 | **Headline metrics** — angka terpenting sebagai figur headline yang menonjol | Hitungan antrean/pantau dan Butuh/Dikirim/Diterima ada tapi tipografinya setara teks kartu biasa (`dasbor.tsx:103,176-178`). Tidak ada figur hero: "X jiwa menunggu", "Y selisih terbuka", "Z kiriman jalan". |
| 🔴 | **Charts with labels and axes** — visualisasi dengan sumbu, legenda, dan tick yang terbaca | Tidak ada visualisasi apa pun (tidak ada lib grafik di scope). Prioritas lintas posko hanya teks per kartu — perbandingan "posko mana paling kurang" mustahil sekilas; minimal butuh batang selisih per posko. |
| ⚪ | **Period comparison** — indikator perubahan %/absolut terhadap periode sebelumnya | Tidak dibutuhkan bersamaan dengan date-range: tanpa konsep periode, tidak ada pembanding yang bermakna untuk operasi real-time. |
| 🟡 | **Segment breakdown** — iris metrik per properti (kanal, perangkat, geografi, atribut lain) | Iris per posko ada (tipe `Prioritas` bahkan membawa `wilayah`, `dasbor.tsx:20-28`) tapi `wilayah` tidak pernah di-render (`:175`), dan tidak ada iris kategori rentan (bayi/balita/lansia — padahal datanya ada di tipe `Antrean`, `:8-18`). |
| 🔴 | **Last updated indicator** — stempel waktu/tombol refresh yang menunjukkan kebaruan data | `muat()` jalan sekali saat mount (`dasbor.tsx:66-68`); tidak ada "diperbarui HH:MM" maupun tombol muat ulang. Data ops basi tanpa sinyal — berisiko untuk keputusan kirim/batal. |
| 🟡 | **Loading and empty states** — skeleton saat fetch, pesan kontekstual saat rentang kosong | Kosong tertutup baik; skeleton/loading hilang total (sama akar dengan Data Table no. 9). |

---

## 5. Bedah: kenapa desktop harus admin-dashboard style

**Peran desktop bukan konsumsi publik, melainkan pengambilan keputusan berisiko.** Publik (transparansi, `/m/[kode]`, `/s/[kode]`) menjawab "percaya", desktop menjawab "apa yang kulakukan 5 menit ke depan". Penggunanya operator terlatih (BPBD, gudang, posko, tim) di layar lebar, multi-panel, sesi panjang — kebalikan dari mobile-first satu-kolom yang ada sekarang (`max-w-md`/`max-w-2xl` di semua page: `bpbd/page.tsx:7`, `gudang/page.tsx:41`, `posko/page.tsx:8`, `tim/page.tsx:7`).

Lima alasan polanya harus admin-dashboard (sidebar + command center):

1. **Empat workspace peran, satu kulit.** Hari ini tiap peran adalah pulau (`/beranda` hanya menautkan satu tombol per peran, `beranda/page.tsx:36-44`; header global cuma tautan "Home", `components/header.tsx:8-10`). Sidebar persisten memberi operator rasa tempat: tahu sedang di workspace mana, pindah Antrean → Buat Manifest → Pantauan tanpa kembali ke beranda.
2. **Command center = triase berlapis, bukan tumpukan kartu.** `dasbor.tsx:94-189` sudah menemukan urutan yang benar (Perlu Dicek → Antrean verifikasi → Prioritas) tapi me-render ketiganya sebagai satu kolom kartu tanpa kepadatan, sortir, atau aksi massal. Gaya admin-dashboard mengubahnya jadi: banner kritis + tabel antrean terurut umur + grafik batang selisih — satu layar, nol gulir untuk keputusan pertama.
3. **Antrean verifikasi adalah jantungnya.** Verifikasi snapshot adalah satu-satunya pintu jatah (GLOSSARY: hanya snapshot disetujui jadi jatah). Antrean hari ini menampilkan total jiwa + waktu (`dasbor.tsx:141-144`) tapi menyembunyikan rincian kategori rentan yang justru bahan keputusan (data `bayi/balita/ibu_hamil/lansia/disabilitas/umum` ada di tipe, `:8-18`, tak di-render). Tabel admin dengan kolom kategori + sortir umur antrean = mempercepat keputusan paling penting di sistem.
4. **Prioritas selisih butuh perbandingan, bukan kartu.** "Prioritas kebutuhan" sebagai kartu teks (`:172-186`) memaksa operator menghafal angka antar kartu. Selisih positif tampil merah sudah benar (warna + label "Kurang {n}", `:179-180` — patuh aturan status), tapi pola analitik (batang per posko, agregat "3 posko kritis") yang membuatnya actionable. Ini alasan checklist Analytics dinilai 🔴/🟡 di §4.
5. **Perlu Dicek adalah loop penyelamat.** Status otomatis lewat-batas-check-in + perintah "hubungi tim lewat jalur darurat" (GLOSSARY) hanya berguna jika selalu terlihat dan bisa di-refresh. Hari ini ia render kondisional (`pantau.length > 0`, `:101`), tanpa refresh/timestamp (§4 no. 6 🔴), dan satu-satunya aksi adalah "Batalkan manifest ini" yang destruktif (`:116-122`). Command center menaikkan ini jadi panel pantauan persisten: segarkan, hubungi, eskalasi — batalkan sebagai opsi terakhir berfriksi (lihat observasi no. 1).

**Pola tabel dan analitik yang dipakai (ringkas):** tabel padat admin (header sortir + filter chip + paginasi "1–50 dari N" + seleksi massal + ekspor CSV) untuk Antrean, Prioritas, Batch/gudang, dan Tugas; analitik secukupnya operasi — figur hero (menunggu/selisih/kiriman jalan), batang selisih per posko, stempel "diperbarui HH:MM" + tombol refresh. Tanpa date-range/period-compare (dinilai ⚪ di §4), tanpa layout-control kustom (⚪ di §1).

---

## 6. Usulan IA desktop (sidebar + workspace per peran)

Sidebar global (desktop ≥1024px; di bawah itu degradasi ke nav atas yang ada sekarang):

- **BPBD — Command Center** (`/bpbd`): ringkasan hero → panel Perlu Dicek → tabel Antrean verifikasi (sortir umur, kolom kategori rentan, aksi massal) → grafik + tabel Prioritas selisih (ekspor CSV) → tautan Buat Manifest.
- **BPBD — Buat Manifest** (`/bpbd/kirim`): tetap alur draf → publikasi, tapi pemilih batch jadi tabel cari/filter/sortir-exp (FEFO terlihat sebelum draf, bukan sesudah).
- **BPBD — Riwayat & Audit** (baru): kronologi keputusan verifikasi/pembatalan/publikasi (siapa-kapan-apa, baca dari riwayat hash chain) — menutup celah Admin Panel no. 6.
- **BPBD — Pengguna & Peran** (baru): daftar akun per peran — menutup celah Admin Panel no. 2.
- **Gudang** (`/gudang` + tabel batch): formulir intake tetap, ditambah tabel batch (stok sisa, exp, kode `DNT-*`, cari/filter, ekspor) — hari ini gudang buta terhadap stoknya sendiri.
- **Posko** (`/posko`): snapshot + bantuan/konfirmasi/ketidaksesuaian tetap; tambah status jatah ("disetujui X dari snapshot tanggal Y") agar posko tahu untuk apa menunggu.
- **Tim** (`/tim`): daftar tugas + panel update/check-in tetap; tambah pengingat batas check-in yang terlihat sebelum lewat (hari ini badge "Lewat batas" baru muncul sesudahnya, `tugas.tsx:126-128`).
- **Lintas peran**: header sidebar menampilkan peran + posko/tim aktif; keluar (signOut, `beranda/page.tsx:18-23`) pindah ke menu akun sidebar.

---

## 7. Observasi sendiri (di luar checklist, 2 temuan)

1. **Pembatalan manifest tanpa friksi yang layak.** `dasbor.tsx:81-92` memakai `window.prompt("Alasan pembatalan publik:")` — dialog browser generik untuk aksi publik-destruktif yang tak bisa dibatalkan. Butuh dialog terdesain: alasan wajib + ringkasan dampak (posko, batch terkunci) + konfirmasi ketik kode manifest, dengan gaya danger-zone terpisah. (Berkaitan dengan Admin Panel no. 7 yang dinilai ⚪ sebagai konsep workspace.)
2. **Data kategori rentan dan wilayah dikirim tapi tidak ditampilkan.** `Antrean` membawa 6 kategori jiwa dan `Prioritas` membawa `wilayah`, namun dasbor hanya me-render total dan nama (`dasbor.tsx:141-144,175-178`). Ini bahan keputusan verifikasi dan segmentasi yang hilang di layar — prioritas perbaikan termurah sebelum grafik apa pun.

---

## Bukti & sumber yang dibaca

- Skill: `.agents/skills/checklist-design/SKILL.md`, `references/audit.md`, `references/index.md`
- Checklist: `references/checklists/web-app-dashboard.md`, `web-app-admin-panel.md`, `web-app-data-table.md`, `web-app-analytics.md`
- Aturan: `AGENTS.md` (no. 9: Indonesia, 48px, warna+label, light, shadcn+token), `GLOSSARY.md` (seluruh istilah domain)
- Kode (jalur + baris): `apps/web/src/app/bpbd/page.tsx:7`, `apps/web/src/app/bpbd/dasbor.tsx:20-28,45-68,70-92,94-189`, `apps/web/src/app/bpbd/kirim/page.tsx:7`, `apps/web/src/app/bpbd/kirim/formulir.tsx:121-126,163-198,199-212`, `apps/web/src/app/gudang/page.tsx:41,59-83`, `apps/web/src/app/posko/page.tsx:6-8`, `apps/web/src/app/posko/bantuan.tsx:84-99,100-162`, `apps/web/src/app/tim/page.tsx:7`, `apps/web/src/app/tim/tugas.tsx:66-68,91-120,121-173`, `apps/web/src/app/beranda/page.tsx:18-44`, `apps/web/src/app/layout.tsx:42-44`, `apps/web/src/components/header.tsx:8-10`

File output: `docs/desain/audit-dashboard.md` (satu-satunya file tulis; worksheet check-types: n/a — murni markdown, tidak menyentuh docs berisi token).
