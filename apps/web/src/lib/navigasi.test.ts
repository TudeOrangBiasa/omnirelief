import { describe, expect, it } from "vitest";
import { rutePublikTransparan, zonaDasbor } from "./navigasi";

describe("zonaDasbor", () => {
  it("tetap mencakup work zone internal", () => {
    for (const rute of ["/beranda", "/bpbd", "/bpbd/kirim", "/gudang", "/posko", "/tim", "/pengaturan", "/profil", "/admin", "/bantuan", "/audit"]) {
      expect(zonaDasbor(rute)).toBe(true);
    }
  });

  it("mencakup halaman publik transparan agar shell login bisa tampil", () => {
    for (const rute of ["/transparansi", "/dasbor", "/m/MNF-1", "/s/DNT-1"]) {
      expect(zonaDasbor(rute)).toBe(true);
    }
  });

  it("mengecualikan landing, masuk, dan halaman lain", () => {
    for (const rute of ["/", "/masuk", "/lain", "/masukan", "/makan"]) {
      expect(zonaDasbor(rute)).toBe(false);
    }
  });
});

describe("rutePublikTransparan", () => {
  it("hanya empat rute publik transparan", () => {
    expect(rutePublikTransparan("/transparansi")).toBe(true);
    expect(rutePublikTransparan("/dasbor")).toBe(true);
    expect(rutePublikTransparan("/m/MNF-1")).toBe(true);
    expect(rutePublikTransparan("/s/DNT-1")).toBe(true);
    expect(rutePublikTransparan("/beranda")).toBe(false);
    expect(rutePublikTransparan("/masuk")).toBe(false);
    expect(rutePublikTransparan("/")).toBe(false);
  });
});
