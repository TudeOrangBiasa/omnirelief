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

export type ItemDraft = { batch_id: number; jumlah: number };

export function validasiManifestDraft(body: Record<string, unknown>) {
  const posko_id = Number(body.posko_id);
  if (!Number.isInteger(posko_id) || posko_id <= 0)
    return { ok: false as const, galat: "posko_id tidak valid" };
  const tim = typeof body.tim === "string" ? body.tim.trim() : "";
  if (tim === "") return { ok: false as const, galat: "tim wajib diisi" };
  for (const k of ["eta", "batas_checkin"] as const) {
    const v = body[k];
    if (v !== undefined && v !== null && v !== "") {
      if (typeof v !== "string" || Number.isNaN(Date.parse(v)))
        return { ok: false as const, galat: `${k} bukan tanggal valid` };
    }
  }
  const mentah = body.items;
  if (!Array.isArray(mentah) || mentah.length === 0)
    return { ok: false as const, galat: "items minimal satu batch" };
  const items: ItemDraft[] = [];
  for (const m of mentah) {
    if (typeof m !== "object" || m === null)
      return { ok: false as const, galat: "satu item tidak valid" };
    const r = m as Record<string, unknown>;
    const batch_id = Number(r.batch_id);
    const jumlah = Number(r.jumlah);
    if (!Number.isInteger(batch_id) || batch_id <= 0)
      return { ok: false as const, galat: "batch_id tidak valid" };
    if (!Number.isInteger(jumlah) || jumlah <= 0)
      return { ok: false as const, galat: "jumlah harus lebih dari 0" };
    items.push({ batch_id, jumlah });
  }
  return {
    ok: true as const,
    posko_id,
    tim,
    eta: typeof body.eta === "string" && body.eta !== "" ? body.eta : null,
    batas_checkin:
      typeof body.batas_checkin === "string" && body.batas_checkin !== ""
        ? body.batas_checkin
        : null,
    items,
  };
}

const STATUS_TIM = ["KELUAR_GUDANG", "DALAM_PERJALANAN", "TIBA", "CHECKIN"] as const;

export function validasiStatusTim(body: Record<string, unknown>) {
  const manifest_id = Number(body.manifest_id);
  if (!Number.isInteger(manifest_id) || manifest_id <= 0)
    return { ok: false as const, galat: "manifest_id tidak valid" };
  const status = body.status;
  if (typeof status !== "string" || !(STATUS_TIM as readonly string[]).includes(status))
    return { ok: false as const, galat: "status tidak dikenal" };
  const catatan = typeof body.catatan === "string" ? body.catatan.trim() : "";
  return { ok: true as const, manifest_id, status, catatan: catatan === "" ? null : catatan };
}

export function validasiKendala(body: Record<string, unknown>) {
  const manifest_id = Number(body.manifest_id);
  if (!Number.isInteger(manifest_id) || manifest_id <= 0)
    return { ok: false as const, galat: "manifest_id tidak valid" };
  const kendala = typeof body.kendala === "string" ? body.kendala.trim() : "";
  if (kendala === "") return { ok: false as const, galat: "kendala wajib diisi" };
  const darurat = body.darurat === true;
  return { ok: true as const, manifest_id, kendala, status: darurat ? "DARURAT" : "TERHAMBAT" };
}

export function validasiKonfirmasi(body: Record<string, unknown>) {
  const manifest_id = Number(body.manifest_id);
  if (!Number.isInteger(manifest_id) || manifest_id <= 0)
    return { ok: false as const, galat: "manifest_id tidak valid" };
  const catatan = typeof body.catatan === "string" ? body.catatan.trim() : "";
  return { ok: true as const, manifest_id, catatan: catatan === "" ? null : catatan };
}

const JENIS_LAPOR = ["KURANG", "RUSAK", "TIDAK_SESUAI", "TIDAK_DITERIMA", "KIRIM_ULANG"] as const;

export function validasiKetidaksesuaian(body: Record<string, unknown>) {
  const manifest_id = Number(body.manifest_id);
  if (!Number.isInteger(manifest_id) || manifest_id <= 0)
    return { ok: false as const, galat: "manifest_id tidak valid" };
  const jenis = body.jenis;
  if (typeof jenis !== "string" || !(JENIS_LAPOR as readonly string[]).includes(jenis))
    return { ok: false as const, galat: "jenis laporan tidak dikenal" };
  const keterangan = typeof body.keterangan === "string" ? body.keterangan.trim() : "";
  if (keterangan === "")
    return { ok: false as const, galat: "keterangan wajib diisi" };
  return { ok: true as const, manifest_id, jenis, keterangan };
}

export function validasiPembatalan(body: Record<string, unknown>) {
  const manifest_id = Number(body.manifest_id);
  if (!Number.isInteger(manifest_id) || manifest_id <= 0)
    return { ok: false as const, galat: "manifest_id tidak valid" };
  const alasan = typeof body.alasan === "string" ? body.alasan.trim() : "";
  if (alasan === "") return { ok: false as const, galat: "alasan wajib diisi" };
  const mentahPengganti = body.manifest_pengganti_id;
  const manifest_pengganti_id =
    mentahPengganti === undefined || mentahPengganti === null || mentahPengganti === ""
      ? null
      : Number(mentahPengganti);
  if (manifest_pengganti_id !== null && (!Number.isInteger(manifest_pengganti_id) || manifest_pengganti_id <= 0))
    return { ok: false as const, galat: "manifest pengganti tidak valid" };
  return { ok: true as const, manifest_id, alasan, manifest_pengganti_id };
}
