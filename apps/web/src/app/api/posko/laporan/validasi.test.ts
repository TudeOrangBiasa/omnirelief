import { describe, expect, it } from "vitest";
import { validasiLaporan, validasiVerifikasi } from "@/lib/validasi";

describe("validasi laporan posko", () => {
  it("menerima enam angka nol atau lebih", () => {
    const hasil = validasiLaporan({
      bayi: 8,
      balita: 15,
      ibu_hamil: 6,
      lansia: 10,
      disabilitas: 5,
      umum: 76,
    });
    expect(hasil).toEqual({
      ok: true,
      angka: {
        bayi: 8,
        balita: 15,
        ibu_hamil: 6,
        lansia: 10,
        disabilitas: 5,
        umum: 76,
      },
      status: "MENUNGGU_VERIFIKASI",
    });
  });

  it("menolak angka negatif, pecahan, dan medan hilang", () => {
    const penuh = {
      bayi: 1,
      balita: 1,
      ibu_hamil: 1,
      lansia: 1,
      disabilitas: 1,
      umum: 1,
    };
    expect(validasiLaporan({ ...penuh, bayi: -1 }).ok).toBe(false);
    expect(validasiLaporan({ ...penuh, bayi: 1.5 }).ok).toBe(false);
    expect(validasiLaporan({}).ok).toBe(false);
  });

  it("draf menyimpan status DRAFT", () => {
    const hasil = validasiLaporan({
      bayi: 1,
      balita: 0,
      ibu_hamil: 0,
      lansia: 0,
      disabilitas: 0,
      umum: 0,
      draft: true,
    });
    expect(hasil.ok && hasil.status).toBe("DRAFT");
  });
});

describe("validasi verifikasi BPBD", () => {
  it("menerima tiga keputusan sah", () => {
    expect(validasiVerifikasi({ snapshot_id: 3, keputusan: "DISETUJUI" })).toEqual({
      ok: true,
      snapshot_id: 3,
      keputusan: "DISETUJUI",
      alasan: null,
    });
    expect(
      validasiVerifikasi({ snapshot_id: 3, keputusan: "MINTA_REVISI", catatan: "data ganda" })
    ).toEqual({ ok: true, snapshot_id: 3, keputusan: "MINTA_REVISI", alasan: "data ganda" });
  });

  it("menolak id dan keputusan asing", () => {
    expect(validasiVerifikasi({ snapshot_id: 0, keputusan: "DISETUJUI" }).ok).toBe(false);
    expect(validasiVerifikasi({ snapshot_id: 1, keputusan: "HAPUS" }).ok).toBe(false);
  });

  it("mewajibkan alasan revisi dan penolakan", () => {
    expect(validasiVerifikasi({ snapshot_id: 1, keputusan: "MINTA_REVISI" }).ok).toBe(false);
    expect(validasiVerifikasi({ snapshot_id: 1, keputusan: "DITOLAK", catatan: "  " }).ok).toBe(
      false
    );
    expect(validasiVerifikasi({ snapshot_id: 1, keputusan: "DITOLAK", catatan: "no" }).ok).toBe(
      false
    );
    const hasil = validasiVerifikasi({ snapshot_id: 1, keputusan: "DITOLAK", catatan: "  data fiktif " });
    expect(hasil.ok && hasil.alasan).toBe("data fiktif");
  });
});
