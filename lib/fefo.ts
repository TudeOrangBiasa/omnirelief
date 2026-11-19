export type BatchKandidat = {
  kode: string;
  kedaluwarsa: string | null;
  tersedia: number;
};

export function urutFEFO(batch: BatchKandidat[]): BatchKandidat[] {
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
