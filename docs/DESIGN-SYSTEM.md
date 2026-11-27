# Design System, Token Visual, dan Makna Logo

Dokumen ini menjelaskan prinsip desain antarmuka OmniRelief, daftar token semantik yang digunakan di seluruh aplikasi, standar aksesibilitas, serta makna filosofi logo resmi OmniRelief. Seluruh nilai token aktual didefinisikan secara terpusat di `packages/ui/src/styles/globals.css`.

## 1. Filosofi Visual

Antarmuka OmniRelief dibangun dengan tiga prinsip utama agar mudah dibaca dalam situasi darurat maupun oleh publik:

1. **Napas:** Ruang kosong (whitespace) yang lega antar-bagian (`--space-section: clamp(4rem, 8vw, 8rem)`) dan kepadatan informasi yang terkendali sehingga mata pengguna tidak cepat lelah.
2. **Datar:** Tampilan editorial terang tanpa bayangan bertumpuk atau efek dekoratif berlebihan. Pemisahan antar-elemen mengandalkan ruang kosong dan garis tipis (`#d7dde7`), dengan radius kartu yang konsisten (`--radius: 0.75rem`).
3. **Sorot-tunggal:** Setiap layar hanya memiliki satu fokus aksi utama agar pengguna langsung tahu langkah terpenting yang harus dilakukan, sementara warna status selalu dipasangkan dengan label teks yang jelas.

## 2. Token Warna dan Semantik

OmniRelief hanya menggunakan tema terang (light mode) untuk menjaga keterbacaan di luar ruangan maupun pada layar dengan kontras rendah.

### A. Warna Dasar dan Merek

| Token | Nilai Hex | Fungsi |
| --- | --- | --- |
| `--background` | `#ffffff` | Latar utama halaman dan kartu |
| `--muted` | `#f4f7fb` | Permukaan sekunder, panel tabel, dan area netral |
| `--foreground` | `#232e40` | Teks utama dengan kontras tinggi |
| `--muted-foreground` | `#5f6a7b` | Teks pendukung, label metadata, dan keterangan |
| `--border` / `--input` | `#d7dde7` | Garis pemisah tipis dan batas kolom input |
| `--primary` | `#3a538d` | Warna merek utama (navy), tombol aksi primer, dan ring fokus |
| `--primary-bg` | `#e1eafb` | Latar sorotan lembut untuk elemen aktif |
| `--accent` / `--aksen` | `#236292` / `#0f79b8` | Aksen interaktif dan tautan sekunder |

### B. Warna Status Operasional

Setiap status wajib menampilkan warna sekaligus label teks agar tidak bergantung pada persepsi warna semata:

| Status | Token Utama | Nilai Teks / Aksen | Nilai Latar | Pemakaian di Aplikasi |
| --- | --- | --- | --- | --- |
| **Bahaya / Kurang** | `--destructive` | `#a04037` (`#972f27` badge) | `#ffe0db` (`#fed2cc` badge) | Status Kurang, Perlu Dicek, Minta Revisi, Ditolak, Pembatalan |
| **Aman / Sukses** | `--success` | `#1f744f` (`#0f6441` badge) | `#d8f3e3` (`#c2e9d3` badge) | Status Aman, Disetujui, Diterima, Terkunci Publik |
| **Peringatan** | `--warning` | `#836412` (`#735603` badge) | `#feedc9` (`#f4dfb4` badge) | Peringatan FEFO (7 hari atau kurang), Draf, Ketidaksesuaian |
| **Informasi** | `--info` | `#236292` | `#dbeefe` | Penjelasan alur, bantuan, dan status sinkronisasi |

## 3. Tipografi, Skala, dan Ikonografi

1. **Jenis huruf:** Seluruh antarmuka menggunakan satu keluarga huruf grotesk yaitu `Inter Variable` (`--font-sans`). Angka pada statistik dan tabel menggunakan pengaturan tabular agar kolom angka sejajar rapi.
2. **Skala ukuran dan spasi huruf:**
   a. Display: `--text-display: clamp(2.5rem, 6vw, 5rem)` dengan tracking `--tracking-display: -0.05em`.
   b. Heading 1: `--text-h1: clamp(1.875rem, 4vw, 3.5rem)` dengan tracking `--tracking-heading: -0.035em`.
   c. Heading 2: `--text-h2: clamp(1.5rem, 3vw, 2.5rem)` dengan tracking `--tracking-heading: -0.035em`.
   d. Label mikro: tracking `--tracking-micro: 0.08em`.
3. **Ikonografi:** Seluruh aplikasi menggunakan satu keluarga ikon dari `@solar-icons/react` (gaya linear untuk elemen umum dan bold-duotone untuk navigasi aktif) guna menjaga konsistensi ketebalan garis.

## 4. Standar Aksesibilitas

1. **Target WCAG 2.2 AA:** Kombinasi warna teks dan latar badge dirancang memenuhi rasio kontras AA (misalnya teks peringatan `#836412` pada latar `#feedc9` dan teks aman `#1f744f` pada `#d8f3e3`).
2. **Ukuran sentuh minimal 48px:** Seluruh tombol aksi, tab navigasi, dan kontrol formulir memiliki tinggi minimal 48px (`min-h-12`) agar tetap nyaman ditekan oleh petugas lapangan di perangkat seluler dalam kondisi terburu-buru.
3. **Navigasi keyboard dan pembaca layar:** Setiap kontrol memiliki nama aksesibel, indikator fokus `:focus-visible` yang jelas, serta pesan kesalahan formulir dengan `role="alert"`.

## 5. Makna Logo dan Panduan Pemakaian

<p align="center">
  <img src="../apps/web/public/logo/logo.svg" alt="Logo OmniRelief" width="180" />
</p>

Logo OmniRelief bernama **Cincin Cetak Ganda**, memadukan simbol geometris dua cincin yang saling bertautan dengan tulisan merek berkarakter tegas (Geist SemiBold).

### A. Makna Filosofi Simbol dan Warna

1. **Cincin Cetak Ganda (Dua Lingkaran Bertautan):** Melambangkan dua pihak yang saling terikat dalam satu janji transparansi, yaitu penyedia bantuan (donatur, gudang, dan BPBD) di satu sisi serta penerima manfaat (posko dan penyintas) di sisi lain. Bentuk cincin tertutup tanpa celah mencerminkan rantai pencatatan append-only yang tidak terputus dan tidak dapat disisipi perubahan diam-diam.
2. **Efek Cetak Ganda (Offset Ring):** Menggambarkan jejak verifikasi berlapis (hash chain SHA-256) di mana setiap catatan baru mengunci dan mengonfirmasi catatan sebelumnya, seperti cap segel resmi pada dokumen publik.
3. **Warna Navy (`#3A538D`):** Mewakili ketegasan, tata kelola yang akuntabel, dan keandalan data publik yang dapat dipertanggungjawabkan.
4. **Warna Kuning Emas (`#F2B705`):** Mewakili kewaspadaan, harapan, dan energi pangan darurat yang harus bergerak cepat menjangkau posko yang membutuhkan.

### B. Aset Resmi dan Aturan Pemakaian

Seluruh aset logo final disimpan di `apps/web/public/logo/`:

1. `logo.svg`: logo penuh dengan teks untuk latar belakang terang.
2. `logo-putih.svg`: logo penuh dengan teks untuk latar belakang gelap.
3. `logo-simbol.svg`: ikon Cincin Cetak Ganda saja untuk latar terang (favicon, avatar, atau ruang sempit).
4. `logo-simbol-putih.svg`: ikon Cincin Cetak Ganda saja untuk latar gelap.

Aturan penggunaan: selalu gunakan varian warna untuk latar terang dan varian putih untuk latar gelap, serta jangan mengubah proporsi, sudut putar, maupun kode warna resmi `#3A538D` dan `#F2B705`.
