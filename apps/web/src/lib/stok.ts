export type AlokasiRow = {
  batch_id: number;
  jumlah: number;
  batal: boolean;
};

export function petaTerpakai(rows: AlokasiRow[]): Map<number, number> {
  const peta = new Map<number, number>();
  for (const r of rows) {
    if (r.batal) continue;
    peta.set(r.batch_id, (peta.get(r.batch_id) ?? 0) + r.jumlah);
  }
  return peta;
}
