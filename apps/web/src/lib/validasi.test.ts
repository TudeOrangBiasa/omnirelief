import { describe, expect, it } from "vitest";
import {
  validasiAktifPengguna,
  validasiPeranPengguna,
  validasiUndang,
} from "./validasi";

describe("validasiPeranPengguna", () => {
  it("terima id dan peran sah", () => {
    expect(validasiPeranPengguna({ id: "abc", peran: "GUDANG" })).toEqual({
      ok: true,
      id: "abc",
      peran: "GUDANG",
    });
  });

  it("tolak id kosong dan peran asing", () => {
    expect(validasiPeranPengguna({ id: "", peran: "GUDANG" }).ok).toBe(false);
    expect(validasiPeranPengguna({ id: "abc", peran: "RAJA" }).ok).toBe(false);
  });
});

describe("validasiAktifPengguna", () => {
  it("terima boolean aktif", () => {
    expect(validasiAktifPengguna({ id: "abc", aktif: false })).toEqual({
      ok: true,
      id: "abc",
      aktif: false,
    });
  });

  it("tolak aktif bukan boolean", () => {
    expect(validasiAktifPengguna({ id: "abc", aktif: "ya" }).ok).toBe(false);
    expect(validasiAktifPengguna({ id: "", aktif: true }).ok).toBe(false);
  });
});

describe("validasiUndang", () => {
  it("rapikan email dan batasi nama", () => {
    expect(
      validasiUndang({ email: "  Admin@Contoh.id ", nama: "Admin Sistem", peran: "ADMIN" })
    ).toEqual({ ok: true, email: "admin@contoh.id", nama: "Admin Sistem", peran: "ADMIN" });
  });

  it("tolak email aneh, nama kosong, peran asing", () => {
    expect(validasiUndang({ email: "bukan-email", nama: "A", peran: "BPBD" }).ok).toBe(false);
    expect(validasiUndang({ email: "a@b.id", nama: "  ", peran: "BPBD" }).ok).toBe(false);
    expect(validasiUndang({ email: "a@b.id", nama: "A", peran: "RAJA" }).ok).toBe(false);
  });
});
