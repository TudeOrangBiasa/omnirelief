/** Normalisasi kode publik (MNF/DNT) dari ketikan manusia.
 * Murni, bisa diuji tanpa Next. Aturan: trim, uppercase, sisipkan tanda
 * hubung yang hilang. Input tak berpola dikembalikan apa adanya (trim).
 */
export function normalisasiKode(mentah: string): string {
  const bersih = mentah.trim().toUpperCase().replace(/\s+/g, "");
  const cocok = /^(MNF|DNT)-?(\d{4})-?(\d+)$/.exec(bersih);
  if (!cocok) return mentah.trim();
  return `${cocok[1]}-${cocok[2]}-${cocok[3]}`;
}

/** Awalan rute publik untuk kode yang sudah dinormalisasi. */
export function ruteKode(kode: string): string {
  return `/${kode.startsWith("DNT") ? "s" : "m"}/${kode}`;
}
