import { describe, expect, it } from "vitest";
import { normalisasiKode, ruteKode } from "./kode";

describe("normalisasiKode", () => {
  it("rapikan spasi, huruf kecil, dan tanda hubung hilang", () => {
    expect(normalisasiKode("  mnf20260001  ")).toBe("MNF-2026-0001");
    expect(normalisasiKode("mnf-2026-0001")).toBe("MNF-2026-0001");
    expect(normalisasiKode("DNT2026001")).toBe("DNT-2026-001");
    expect(normalisasiKode("  MNF-2026-0001 ")).toBe("MNF-2026-0001");
  });

  it("input tak berpola dikembalikan trim apa adanya", () => {
    expect(normalisasiKode("  MNF-9999-XXXX ")).toBe("MNF-9999-XXXX");
    expect(normalisasiKode("")).toBe("");
  });

  it("rute publik huruf kecil sesuai peran kode", () => {
    expect(ruteKode("MNF-2026-0001")).toBe("/m/MNF-2026-0001");
    expect(ruteKode("DNT-2026-001")).toBe("/s/DNT-2026-001");
  });
});
