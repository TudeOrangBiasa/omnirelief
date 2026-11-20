# OmniRelief

Sistem supply chain pangan darurat yang tercatat dari gudang sampai posko dan bisa dicek publik per daerah.

## Language

**Posko**:
Tempat penampungan penyintas yang menjadi unit transparansi. Angka tidak pernah digabung antar posko.
_Avoid_: lokasi, titik, site

**Penyintas**:
Jiwa terdampak yang dilayani satu posko, dicatat agregat per kategori.
_Avoid_: korban, pengungsi, penerima

**Snapshot penyintas**:
Laporan jumlah penyintas satu posko untuk satu periode, menunggu verifikasi sebelum dipakai sebagai jatah.
_Avoid_: sensus, form, data mentah

**Verifikasi**:
Keputusan BPBD atas snapshot: disetujui, minta revisi, atau ditolak. Hanya snapshot disetujui yang jadi jatah.
_Avoid_: approval, validasi

**Sumbangan**:
Pemberian pangan dari donatur yang masuk lewat gudang, dilacak lewat kode sumbangan.
_Avoid_: donasi uang, hibah

**Batch**:
Satu pencatatan sumbangan: satu item, satu jumlah, satu kedaluwarsa, satu kode sumbangan.
_Avoid_: paket, lot, stok

**Kode sumbangan**:
Identitas publik satu batch, format `DNT-TAHUN-NOMOR`. Donatur melacak alirannya lewat kode ini.
_Avoid_: ID batch, nomor donasi

**Manifest**:
Rencana pengiriman terkunci untuk satu posko: daftar batch, tim, dan batas check-in.
_Avoid_: DO, surat jalan, shipment

**Hash chain**:
Rantai SHA-256 yang mengikat tiap manifest dan tiap baris riwayat ke hash sebelumnya. Bukti tidak ada ubah diam-diam.
_Avoid_: blockchain, enkripsi, tanda tangan

**FEFO**:
Aturan keluar duluan untuk batch yang kedaluwarsanya paling dekat.
_Avoid_: FIFO, prioritas kedaluwarsa

**Selisih**:
Jatah dikurangi yang sudah diterima. Nol berarti aman, positif berarti kurang dan tampil merah.
_Avoid_: gap, defisit, kekurangan

**Check-in**:
Kabar berkala tim distribusi selama perjalanan. Lewat batas tanpa kabar memicu status Perlu Dicek.
_Avoid_: ping, update lokasi, GPS

**Perlu Dicek**:
Tanda otomatis bahwa kiriman lewat batas check-in tanpa kabar. Perintahnya: hubungi tim lewat jalur darurat.
_Avoid_: overdue, telat, hilang

**Konfirmasi terima**:
Pernyataan posko bahwa kiriman sampai. Menutup selisih.
_Avoid_: tanda terima, serah terima

**Ketidaksesuaian**:
Laporan publik posko atas masalah sesudah berangkat: kurang, rusak, tidak sesuai, tidak diterima, atau kirim ulang.
_Avoid_: komplain, klaim, retur

**Pembatalan**:
Dokumen publik yang membatalkan manifest sebelum berangkat, dengan alasan dan opsional manifest pengganti.
_Avoid_: cancel, hapus kiriman, void
