# Peta Produk

OmniRelief dibangun untuk menyelesaikan persoalan nyata di lapangan, yaitu aliran bantuan pangan yang sulit dilacak dari gudang ke posko serta risiko perubahan data secara diam-diam. Produk ini menjawab masalah tersebut melalui pencatatan append-only yang dapat diperiksa publik per daerah.

Dokumen ini bersifat terbuka terhadap penyesuaian mengikuti umpan balik dari lapangan dan evaluasi penggunaan.

## Visi

Setiap daerah memiliki catatan bantuan pangan yang dapat diperiksa oleh siapa saja. Donatur dapat melacak sumbangan mereka melalui kode sumbangan, posko dapat membuktikan kekurangan jatah dengan angka terbuka, dan pemerintah daerah dapat mereplikasi sistem ini tanpa membangun dari awal.

## Fase 1: Fondasi Tepercaya (Saat Ini)

Target fase ini adalah memastikan seluruh klaim integritas dan keandalan alur distribusi terbukti oleh sistem, meliputi:

1. Alur end-to-end berjalan lengkap dari pencatatan gudang, laporan penyintas posko, verifikasi dan manifest FEFO oleh BPBD, pengantaran dengan antrean offline tim, hingga konfirmasi terima dan cek publik.
2. Kebijakan Row Level Security (RLS) dan rantai hash SHA-256 mencegah pembaruan diam-diam pada manifest terpublikasi maupun log riwayat.
3. Halaman publik tampil tanpa mengekspos data pribadi dan menjaga ukuran muatan tetap ringan.

## Fase 2: Pilot Daerah

Target fase ini adalah penggunaan nyata di satu hingga dua daerah bersama BPBD setempat:

1. Operasional harian dijalankan oleh peran asli di lapangan, yaitu gudang, posko, tim distribusi, dan BPBD.
2. Pengumpulan umpan balik terkait keandalan mode offline di area minim sinyal dan keterbacaan halaman publik oleh masyarakat.
3. Penyempurnaan logika prioritas penyaluran berdasarkan data aktual di lapangan.
4. Penyusunan panduan replikasi untuk membuka instansi daerah baru dari tahap skema hingga data awal.

## Fase 3: Skala dan Keberlanjutan

Target fase ini adalah menjalankan pola yang sama di banyak daerah tanpa beban operasional yang besar:

1. Pengembangan fitur lanjutan berdasarkan kebutuhan pilot, seperti pengingat check-in otomatis, dukungan multi-gudang, peta distribusi, dan ringkasan lintas wilayah.
2. Penguatan bukti lapangan seperti lampiran foto penerimaan dan pencatatan koordinat saat konfirmasi terima.
3. Tata kelola data jangka panjang mencakup retensi data, pengarsipan periode lama, dan audit berkala terhadap hash chain.
