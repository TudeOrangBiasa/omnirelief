# Panduan Kontribusi

Terima kasih sudah tertarik berkontribusi pada OmniRelief. Proyek ini bersifat sumber terbuka (open source) di bawah lisensi MIT, dan kami menyambut kontribusi berupa perbaikan bug, peningkatan aksesibilitas, dokumentasi, maupun fitur baru yang selaras dengan [Peta Produk](ROADMAP.md).

## 1. Alur Kerja Kontribusi

1. Lakukan fork repositori ini ke akun GitHub Anda, lalu clone ke lingkungan lokal.
2. Buat branch baru dari `main` dengan nama yang jelas, misalnya `feat/filter-posko` atau `fix/validasi-batch`.
3. Siapkan lingkungan lokal sesuai [docs/SETUP.md](docs/SETUP.md) dan pahami struktur repositori melalui [Peta Codebase](docs/CODEBASE-MAP.md).
4. Lakukan perubahan secara terfokus pada satu topik per pull request.
5. Pastikan seluruh pemeriksaan lokal lolos sebelum membuka pull request.

## 2. Pemeriksaan Sebelum Mengajukan PR

Jalankan enam perintah berikut dari direktori root dan pastikan semuanya berhasil tanpa galat:

```bash
bun --filter web check-types
bun --filter web test
bun --filter web lint
bun run check:loc
bun run verify:formal
bun run build
```

Setiap berkas dibatasi maksimal 1000 baris (`check:loc`), sedangkan `verify:formal` memverifikasi invarian hash chain, mesin status, dan alokasi FEFO.

## 3. Prinsip Teknis yang Wajib Dijaga

1. **Tulis database melalui server:** Seluruh operasi tulis ke database harus melewati API route Next.js menggunakan `service_role`. Browser tidak pernah menulis langsung ke Supabase.
2. **Pertahankan sifat append-only dan hash chain:** Manifest yang sudah dipublikasikan dan log riwayat tidak boleh diedit atau dihapus. Setiap baris riwayat wajib mempertahankan integritas hash SHA-256 (`apps/web/src/lib/hash.ts`).
3. **Pisahkan validasi dan tipe batas:** Aturan validasi murni berada di `apps/web/src/lib/validasi.ts`, dan pembacaan data Supabase menggunakan tipe batas di `apps/web/src/lib/supabase/baris.ts` tanpa cast `as` inline.
4. **Ikuti Design System dan Glosarium:** Gunakan token semantik dari `packages/ui/src/styles/globals.css` dan istilah baku di [GLOSSARY.md](GLOSSARY.md) dengan kalimat pendek tanpa em-dash.
5. **Jaga aksesibilitas:** Kontrol interaktif memiliki ukuran area sentuh minimal 48px, kontras memenuhi standar WCAG 2.2 AA, fokus keyboard terlihat jelas, dan status selalu menampilkan warna bersama label teks.

## 4. Aturan Format Commit

Gunakan format Conventional Commits berbahasa Indonesia agar riwayat perubahan mudah dibaca:

```text
feat(web): tambah filter posko di halaman transparansi
fix(web): perbaiki antrean sinkronisasi offline tim
docs: lengkapi panduan instalasi lokal
```

Tipe yang digunakan: `feat`, `fix`, `docs`, `chore`, `refactor`, dan `test`.

## 5. Aturan Format Pull Request (PR)

Setiap PR wajib menggunakan template di `.github/PULL_REQUEST_TEMPLATE.md` dengan struktur `Summary`, `Evidence`, `Merge Danger`, dan `Checks Lokal`:

1. **Judul PR:** Gunakan format `<tipe>(<scope>): <ringkasan singkat>`, misalnya `fix(web): tangani timeout check-in tim`.
2. **Summary:** Sketsa perubahan (file atau diagram alur) beserta tautan issue (`closes #xx`). Tulis satu kalimat per klaim tanpa basa-basi.
3. **Evidence (Before / After):** Sertakan output sebelum dan sesudah perubahan. Untuk perubahan UI, wajib menampilkan tabel `Before | After` dengan gambar langsung di body PR, bukan di dalam `<details>`.
4. **Merge Danger:** Tentukan sifat perubahan (`one-way` jika sulit dibatalkan seperti migrasi skema atau format hash, `two-way` jika mudah di-revert) dan tulis satu baris **Blast Radius** yang menyebut pihak terdampak serta risiko kegagalannya.
5. **Checks Lokal:** Laporkan hasil nyata dari pemeriksaan statis (`check-types`, `lint`, `check:loc`, `build`), verifikasi formal dan unit (`verify:formal`, `web test`), serta E2E lokal jika mengubah alur utama.
