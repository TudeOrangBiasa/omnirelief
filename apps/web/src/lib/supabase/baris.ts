export type ItemKatalogRow = {
  id: number;
  nama: string;
  satuan: string;
};

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

export type AntreanRow = {
  id: number;
  dibuat_pada: string;
  posko: { nama: string } | null;
};

export type PantauRow = {
  id: number;
  kode: string;
  posko_nama: string;
  batas_checkin: string;
  log_terakhir: string | null;
  ditandai: boolean;
};

export type PrioritasRow = {
  posko_id: number;
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

export type BantuanRow = {
  id: number;
  kode: string;
  tim: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

export type TugasRow = {
  id: number;
  kode: string;
  tim: string;
  eta: string | null;
  batas_checkin: string | null;
  posko_nama: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

export type LaporanRow = {
  id: number;
  status: string;
  dibuat_pada: string;
};

export type BatchLihatRow = {
  id: number;
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  jumlah: number;
  kedaluwarsa: string | null;
  status: string;
  sisa: number;
};
export type GudangBatchRow = {
  id: number;
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  jumlah: number;
  kedaluwarsa: string | null;
  sumber: string;
  tampilkan_nama: boolean;
  status: string;
  terpakai: number;
  sisa: number;
};

export function tunggal<T>(data: unknown): T | null {
  return typeof data === "object" && data !== null ? (data as T) : null;
}
