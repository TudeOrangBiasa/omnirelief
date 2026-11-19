export type AntreanJenis = "laporan" | "status" | "kendala";

export type AntreanItem = {
  id: string;
  jenis: AntreanJenis;
  url: string;
  badan: Record<string, unknown>;
  dibuat: string;
};

export type Penyimpanan = {
  getItem(kunci: string): string | null;
  setItem(kunci: string, nilai: string): void;
};

const KUNCI = "omnirelief-antrean";

export function muatAntrean(simpan: Penyimpanan): AntreanItem[] {
  try {
    const mentah = simpan.getItem(KUNCI);
    if (!mentah) return [];
    const daftar = JSON.parse(mentah) as unknown;
    if (!Array.isArray(daftar)) return [];
    return daftar.filter(
      (d): d is AntreanItem =>
        typeof d === "object" &&
        d !== null &&
        typeof (d as AntreanItem).url === "string" &&
        typeof (d as AntreanItem).badan === "object"
    );
  } catch {
    return [];
  }
}

export function tambahAntrean(
  simpan: Penyimpanan,
  jenis: AntreanJenis,
  url: string,
  badan: Record<string, unknown>
): AntreanItem[] {
  const daftar = muatAntrean(simpan);
  daftar.push({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    jenis,
    url,
    badan,
    dibuat: new Date().toISOString(),
  });
  simpan.setItem(KUNCI, JSON.stringify(daftar));
  return daftar;
}

export function hapusAntrean(simpan: Penyimpanan, id: string): AntreanItem[] {
  const sisa = muatAntrean(simpan).filter((d) => d.id !== id);
  simpan.setItem(KUNCI, JSON.stringify(sisa));
  return sisa;
}

export type Pengirim = (url: string, badan: Record<string, unknown>) => Promise<boolean>;

export async function kirimAntrean(
  simpan: Penyimpanan,
  kirim: Pengirim
): Promise<AntreanItem[]> {
  const daftar = muatAntrean(simpan);
  for (const item of daftar) {
    let terkirim = false;
    try {
      terkirim = await kirim(item.url, item.badan);
    } catch {
      terkirim = false;
    }
    if (!terkirim) break;
    hapusAntrean(simpan, item.id);
  }
  return muatAntrean(simpan);
}
