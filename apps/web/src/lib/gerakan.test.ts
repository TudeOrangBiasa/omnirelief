import { describe, expect, it } from "vitest";
import {
  validasiKendala,
  validasiKonfirmasi,
  validasiKetidaksesuaian,
  validasiPembatalan,
  validasiStatusTim,
} from "./validasi";

describe("validasi gerakan tim", () => {
  it("menerima empat status sah", () => {
    for (const status of ["KELUAR_GUDANG", "DALAM_PERJALANAN", "TIBA", "CHECKIN"]) {
      expect(validasiStatusTim({ manifest_id: 1, status })).toEqual({
        ok: true,
        manifest_id: 1,
        status,
        catatan: null,
      });
    }
    expect(validasiStatusTim({ manifest_id: 1, status: "TERBANG" }).ok).toBe(false);
  });

  it("kendala butuh isi, darurat jadi DARURAT", () => {
    expect(validasiKendala({ manifest_id: 1, kendala: "" }).ok).toBe(false);
    expect(validasiKendala({ manifest_id: 1, kendala: "ban bocor" })).toEqual({
      ok: true,
      manifest_id: 1,
      kendala: "ban bocor",
      status: "TERHAMBAT",
    });
    const darurat = validasiKendala({ manifest_id: 1, kendala: "banjir", darurat: true });
    expect(darurat.ok && darurat.status).toBe("DARURAT");
  });
});

describe("validasi koreksi terbuka", () => {
  it("konfirmasi butuh id", () => {
    expect(validasiKonfirmasi({ manifest_id: 7 }).ok).toBe(true);
    expect(validasiKonfirmasi({}).ok).toBe(false);
  });

  it("ketidaksesuaian butuh jenis sah dan keterangan", () => {
    expect(
      validasiKetidaksesuaian({ manifest_id: 1, jenis: "KURANG", keterangan: "10 basah" }).ok
    ).toBe(true);
    expect(
      validasiKetidaksesuaian({ manifest_id: 1, jenis: "HILANG", keterangan: "x" }).ok
    ).toBe(false);
    expect(
      validasiKetidaksesuaian({ manifest_id: 1, jenis: "KURANG", keterangan: " " }).ok
    ).toBe(false);
  });

  it("pembatalan butuh alasan, pengganti opsional", () => {
    expect(validasiPembatalan({ manifest_id: 1, alasan: "" }).ok).toBe(false);
    expect(
      validasiPembatalan({ manifest_id: 1, alasan: "salah posko", manifest_pengganti_id: 9 })
    ).toEqual({ ok: true, manifest_id: 1, alasan: "salah posko", manifest_pengganti_id: 9 });
  });
});
