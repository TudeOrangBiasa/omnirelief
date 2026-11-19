# Kerangka proposal (maks 20 halaman isi)

Ikuti template panitia untuk cover, daftar pustaka, dan lampiran. Isi patuh Bab 12 dokumen tim: tidak ada klaim di luar MVP.

1. Latar belakang. Kelaparan saat bencana muncul dari supply chain putus: menumpuk di satu posko, kurang di posko lain, kedaluwarsa di gudang, kiriman hilang kabar, donatur berhenti.
2. Rumusan masalah. Data permintaan lewat chat tidak bisa dibandingkan. Angka gabungan menutupi kekurangan per daerah. Data kirim bisa diubah tanpa jejak.
3. Tujuan. Satu alur tertutup gudang ke posko yang tercatat, terverifikasi, terkunci, dan bisa dicek publik per daerah.
4. Sub-tema Zero Hunger. Fokus pada distribusi pangan darurat yang adil: FEFO menekan kedaluwarsa, prioritas menutup selisih terbesar dulu.
5. Arsitektur. Next.js App Router plus Tailwind, Supabase Postgres plus Auth plus Storage, Vercel. Semua tulis lewat API route, baca publik lewat view read-only.
6. Model data. 9 tabel Bab 8: profil, posko, snapshot penyintas agregat, item, batch, manifest, isi manifest, log append-only, pembatalan, ketidaksesuaian.
7. Alur 8 tahap. Donatur ke gudang, input penyintas, verifikasi, alokasi FEFO, publikasi QR terkunci, antar plus check-in, konfirmasi, cek publik.
8. Janji anti-korupsi. Empat pertanyaan per posko: jatah, terkirim, diterima, anomali. Aturan keras: terkunci tidak bisa edit, koreksi hanya lewat dokumen publik baru.
9. MVP vs roadmap. Wajib jadi Bab 12 lawan roadmap: multi-BPBD, peta, foto bukti, tanda tangan digital, GPS realtime, aplikasi native, chat internal, donasi uang.
10. Pemetaan 5 kriteria. Kesesuaian Tema 25, Fungsionalitas 30, Inovasi 20, Urgensi 15, UI/UX 10. Tiap kriteria tunjuk ke halaman dan skrip demo Bab 11.

## Batas klaim

1. Tulis hash chain SHA-256, bukan blockchain.
2. Foto bukti dan GPS masuk roadmap, jangan tulis seolah jadi.
3. Angka demo dari `supabase/seed.sql`, labeli sebagai data contoh.
