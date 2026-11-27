# Catatan Perubahan

Seluruh perubahan penting pada OmniRelief dicatat dalam dokumen ini. Penomoran versi mengikuti Semantic Versioning (`0.x.y`) selama fase `0.1.x` menuju rilis stabil pertama.

## [Unreleased]

### Ditambahkan
1. Alur pencatatan sumbangan gudang dengan penerbitan kode pelacakan `DNT-TAHUN-NOMOR` dan halaman publik `/s/[kode]`.
2. Pelaporan snapshot penyintas per posko, verifikasi BPBD dalam tiga keputusan (disetujui, minta revisi, ditolak), serta penyusunan manifest dengan aturan FEFO.
3. Penguncian manifest terpublikasi (`/m/[kode]`) dengan kode QR, kebijakan RLS penolak ubah/hapus, dan rantai hash SHA-256 append-only.
4. Dashboard transparansi publik (`/transparansi`) per posko dengan status selisih Aman atau Kurang tanpa login.
5. Ruang kerja tim distribusi (`/tim`) dengan dukungan check-in berkala, deteksi keterlambatan `Perlu Dicek`, serta antrean offline `Menunggu Sinkronisasi`.
6. Pelaporan ketidaksesuaian oleh posko dan pembatalan manifest secara terbuka di halaman publik.
7. Dokumentasi sistem dan fitur (`docs/SISTEM-DAN-FITUR.md`), dokumentasi design system beserta makna logo (`docs/DESIGN-SYSTEM.md`), panduan juri (`docs/JURI.md`), dan panduan kontribusi sumber terbuka (`CONTRIBUTING.md`).
