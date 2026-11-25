import { describe, expect, it, vi } from "vitest";
import { LOG_FINAL, statusTerakhir, tambahLog } from "./riwayat";

type Respons = { data: unknown; error: unknown };

function rantai(akhir: Respons, sisip: Respons = { data: null, error: null }) {
  const satu = { single: vi.fn().mockResolvedValue(akhir) };
  const rantaiAkhir: Record<string, unknown> = {};
  rantaiAkhir.single = satu.single;
  rantaiAkhir.eq = vi.fn().mockReturnValue(rantaiAkhir);
  rantaiAkhir.order = vi.fn().mockReturnValue(rantaiAkhir);
  rantaiAkhir.limit = vi.fn().mockReturnValue(rantaiAkhir);
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(rantaiAkhir),
      insert: vi.fn().mockResolvedValue(sisip),
    }),
  };
}
describe("tambahLog", () => {
  it("sambung hash ke log terakhir", async () => {
    const admin = rantai({ data: { hash: "sebelum" }, error: null });
    const hasil = await tambahLog(admin as never, {
      manifest_id: 1,
      manifest_kode: "MNF-2026-0001",
      status: "DITERIMA",
      catatan: null,
      dibuat_oleh: null,
    });
    expect(hasil.ok).toBe(true);
    expect(admin.from).toHaveBeenCalledWith("manifest_log");
  });

  it("pakai hash manifest bila log kosong, gagal bila sisip gagal", async () => {
    const gagal = rantai({ data: null, error: null }, { data: null, error: new Error("db mati") });
    const hasil = await tambahLog(gagal as never, {
      manifest_id: 1,
      manifest_kode: "MNF-2026-0001",
      status: "DITERIMA",
      catatan: "ok",
      dibuat_oleh: "siapa",
    });
    expect(hasil).toEqual({ ok: false, galat: "gagal mencatat riwayat" });
  });
});

describe("statusTerakhir", () => {
  it("ambil status teratas atau null", async () => {
    expect(await statusTerakhir(rantai({ data: { status: "TIBA" }, error: null }) as never, 1)).toBe("TIBA");
    expect(await statusTerakhir(rantai({ data: null, error: null }) as never, 1)).toBeNull();
    expect(LOG_FINAL).toContain("DITERIMA");
  });
});
