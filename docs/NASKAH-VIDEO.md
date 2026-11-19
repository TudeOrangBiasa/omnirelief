# Naskah video demo 5 menit

Judul upload: `Nama Tim | SoftDev-SEVENT X National Competition`. Maksimal 5 menit.

## Menit 0-1: masalahnya nyata

1. Buka `/transparansi`. Tunjuk dua kartu posko.
2. Narasi: "Posko Balai Desa Sari aman, selisih nol. Posko Sekolah Harapan kurang 40 paket. Ini yang kami jawab: siapa kurang, terlihat."
3. Tampil di layar: dashboard per posko, angka butuh, dikirim, diterima, selisih merah.

## Menit 1-2: buat manifest dan kunci

1. Buka `/bpbd/kirim` sebagai `bpbd@demo`.
2. Pilih Posko Sekolah Harapan. Tunjuk batch susu formula kedaluwarsa 5 hari di urutan atas, label FEFO.
3. Pilih 30 susu plus 10 sembako. Simpan draf, baca peringatan FEFO kalau ada.
4. Tekan publikasikan. Tunjuk kode `MNF-2026-XXXX` dan badge TERKUNCI PUBLIK.
5. Narasi: "Batch yang dekat kedaluwarsa keluar duluan. Sekali kunci, tidak bisa diubah."

## Menit 2-3: cek publik tanpa login

1. Buka tab penyamaran, tempel tautan manifest.
2. Tunjuk detail, timeline, hash pendek. Tunjuk tidak ada tombol edit atau hapus.
3. Narasi: "Siapa pun bisa verifikasi tanpa login. Data terkunci terlihat terkunci."

## Menit 3-4: antar sampai terima

1. Sebagai `tim@demo`, update Dalam Perjalanan, Check-in, Tiba.
2. Sebagai `posko-b@demo`, tekan Konfirmasi terima.
3. Kembali ke dashboard: selisih Posko Sekolah Harapan jadi nol.
4. Narasi: "Selisih menutup di depan mata, bukan di laporan."

## Menit 4-5: simulasi rusak dan tutup donatur

1. Sebagai `posko-b@demo`, lapor 10 paket rusak. Tunjuk kartu kuning tampil publik di detail manifest.
2. Buka `/s/DNT-2026-002` sebagai donatur. Tunjuk progress alokasi dan daftar manifest pemakai.
3. Narasi penutup: "Donatur melihat alirannya, lalu berani berdonasi lagi. Itu OmniRelief."

## Checklist rekam

1. Data seed segar sesuai `supabase/seed.sql` sebelum take.
2. Sembunyikan password akun demo, jangan ketik di layar.
3. Satu take per menit, sambung di editor. Total di bawah 5 menit.
