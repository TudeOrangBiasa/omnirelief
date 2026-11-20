# Migrasi penuh shadcn, light saja

Dipilih migrasi penuh ke komponen shadcn dengan token semantik dari brief agar aturan lint `no-arbitrary-values` bisa dinyalakan dan UI konsisten. Mode gelap dicabut karena brief menuntut kontras tinggi di bawah matahari dan toggle menambah state uji tanpa nilai juri.

## Considered Options

Hibrida ditolak karena dua bahasa visual dalam satu sprint kecil membingungkan juri dan menggandakan kerja uji.
