# Drizzle sebagai cadangan

Better-T-Stack memaksa ORM begitu database dipilih, jadi `drizzle` ikut terscaffold. Semua query aplikasi tetap lewat Supabase client agar RLS berlaku, tidak ada satu query drizzle pun di kode. Drizzle hanya dipakai kalau nanti butuh SQL langsung, misalnya skrip seed.

## Considered Options

Prisma ditolak karena server tambahan dan skema terpisah dari SQL yang sudah jalan di dashboard Supabase.
