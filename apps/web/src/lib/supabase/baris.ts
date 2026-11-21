export type BatchRow = {
  id: number;
  kode_sumbangan: string;
  jumlah: number;
  kedaluwarsa: string | null;
  sumber: string;
  tampilkan_nama: boolean;
  status: string;
  item: { nama: string; satuan: string } | null;
};

export type AlokasiRow = {
  batch_id: number;
  jumlah: number;
  manifest: { status: string } | null;
};

export type ManifestRow = {
  id: number;
  kode: string;
  posko_id: number;
  tim: string;
  status: string;
};

export type ManifestItemRow = {
  batch_id: number;
  jumlah: number;
};

export type DashboardRow = {
  posko_id: number;
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};
export function baris<T>(data: unknown): T[] {
  return Array.isArray(data) ? data.filter((r) => typeof r === "object" && r !== null) as T[] : [];
}

export function tunggal<T>(data: unknown): T | null {
  return typeof data === "object" && data !== null ? (data as T) : null;
}
