export type BatchKandidat = {
  kode: string;
  kedaluwarsa: string | null;
  tersedia: number;
};

export function urutFEFO<T extends BatchKandidat>(batch: T[]): T[] {
  return [...batch].sort((a, b) => {
    if (a.kedaluwarsa === null && b.kedaluwarsa === null) return 0;
    if (a.kedaluwarsa === null) return 1;
    if (b.kedaluwarsa === null) return -1;
    return a.kedaluwarsa < b.kedaluwarsa ? -1 : 1;
  });
}

export function ambilBatchFEFO(
  batch: BatchKandidat[],
  butuh: number
): { kode: string; ambil: number }[] {
  const hasil: { kode: string; ambil: number }[] = [];
  let sisa = butuh;
  for (const b of urutFEFO(batch)) {
    if (sisa <= 0) break;
    const ambil = Math.min(b.tersedia, sisa);
    if (ambil > 0) {
      hasil.push({ kode: b.kode, ambil });
      sisa -= ambil;
    }
  }
  return hasil;
}

export type BatchSisa = BatchKandidat & { sisa: number };

export function batchTerlewati(batch: BatchSisa[], dipilih: string[]): string[] {
  const dipilihSet = new Set(dipilih);
  const tersedia = urutFEFO(batch).filter((b) => b.sisa > 0);
  const posisi = tersedia
    .map((b, i) => (dipilihSet.has(b.kode) ? i : -1))
    .filter((i) => i >= 0);
  if (posisi.length === 0) return [];
  const batas = Math.max(...posisi);
  return tersedia
    .filter((b, i) => i < batas && !dipilihSet.has(b.kode))
    .map((b) => b.kode);
}
