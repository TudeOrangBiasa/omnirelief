// Sel CSV: kutip bila ada koma, petik, atau baris baru; petik digandakan. Murni.
export function selCsv(nilai: string | number): string {
  const teks = String(nilai);
  return /[",\n]/.test(teks) ? `"${teks.replace(/"/g, '""')}"` : teks;
}
