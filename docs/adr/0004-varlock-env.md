# Env terenkripsi varlock

Template Better-T-Stack memvalidasi env saat build lewat varlock. Build Vercel gagal tanpa `_VARLOCK_ENV_KEY` karena blob env beku tidak bisa dienkripsi. Kunci dibuat sekali dengan `varlock generate-key` dan dipasang di production plus preview. Nilai dummy diganti nilai asli tanpa ganti kunci.
