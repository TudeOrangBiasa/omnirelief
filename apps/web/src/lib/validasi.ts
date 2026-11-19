const KOLOM_LAPORAN = [
  "bayi",
  "balita",
  "ibu_hamil",
  "lansia",
  "disabilitas",
  "umum",
] as const;

export type AngkaLaporan = Record<(typeof KOLOM_LAPORAN)[number], number>;

export function validasiLaporan(body: Record<string, unknown>) {
  const angka: AngkaLaporan = {
    bayi: 0,
    balita: 0,
    ibu_hamil: 0,
    lansia: 0,
    disabilitas: 0,
    umum: 0,
  };
  for (const k of KOLOM_LAPORAN) {
    const v = Number(body[k]);
    if (!Number.isInteger(v) || v < 0)
      return { ok: false as const, galat: `${k} harus bilangan bulat >= 0` };
    angka[k] = v;
  }
  const draft = body.draft === true;
  return {
    ok: true as const,
    angka,
    status: draft ? "DRAFT" : "MENUNGGU_VERIFIKASI",
  };
}

const KEPUTUSAN = ["DISETUJUI", "MINTA_REVISI", "DITOLAK"] as const;

export function validasiVerifikasi(body: Record<string, unknown>) {
  const snapshot_id = Number(body.snapshot_id);
  if (!Number.isInteger(snapshot_id) || snapshot_id <= 0)
    return { ok: false as const, galat: "snapshot_id tidak valid" };
  const keputusan = body.keputusan;
  if (
    typeof keputusan !== "string" ||
    !(KEPUTUSAN as readonly string[]).includes(keputusan)
  )
    return {
      ok: false as const,
      galat: "keputusan harus DISETUJUI, MINTA_REVISI, atau DITOLAK",
    };
  return { ok: true as const, snapshot_id, keputusan };
}
