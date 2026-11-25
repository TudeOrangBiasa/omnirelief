import { describe, expect, it } from "vitest";
import { kulitPublik } from "./kulit";

describe("kulitPublik", () => {
  it("anonim memakai teks putih di atas shader", () => {
    const k = kulitPublik(false);
    expect(k.teksJudul).toBe("text-white");
    expect(k.panelInfo).toContain("bg-white/10");
    expect(k.tombolPrimer).toContain("bg-white");
  });

  it("login memakai token terang dasbor", () => {
    const k = kulitPublik(true);
    expect(k.teksJudul).toBe("text-foreground");
    expect(k.panelInfo).toContain("garis-rambut-diam");
    expect(k.tombolPrimer).toContain("bg-primary");
  });

  it("dua kulit tidak berbagi kelas panel", () => {
    expect(kulitPublik(true).panelInfo).not.toBe(kulitPublik(false).panelInfo);
  });
});
