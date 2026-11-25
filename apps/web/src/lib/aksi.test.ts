import { describe, expect, it } from "vitest";
import { AKSI_PERAN, daftarAksi } from "./aksi";

describe("daftarAksi", () => {
  it("utama selalu aksi pertama tiap peran", () => {
    for (const peran of Object.keys(AKSI_PERAN) as Array<keyof typeof AKSI_PERAN>) {
      const daftar = daftarAksi(peran);
      expect(daftar.length).toBeGreaterThan(0);
      expect(daftar[0]?.utama).toBe(true);
    }
  });

  it("admin mengarah ke dasbor admin", () => {
    expect(daftarAksi("ADMIN")).toEqual([{ label: "Buka admin", href: "/admin", utama: true }]);
  });
});
