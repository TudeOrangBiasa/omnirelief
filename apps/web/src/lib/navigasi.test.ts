import { describe, expect, it } from "vitest";
import { grupSidebar, peranDariString, rutePublikTransparan, sembunyikanTabBar, tabAktif, zonaDasbor } from "./navigasi";

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

describe("peranDariString", () => {
  it("kenal 6 peran, asing jadi PUBLIK", () => {
    expect(peranDariString("ADMIN")).toBe("ADMIN");
    expect(peranDariString("BPBD")).toBe("BPBD");
    expect(peranDariString("RAJA")).toBe("PUBLIK");
    expect(peranDariString(null)).toBe("PUBLIK");
  });
});

describe("tabAktif", () => {
  it("cocok dasar dan jangkar", () => {
    expect(tabAktif("/posko", "", "/posko")).toBe(true);
    expect(tabAktif("/posko", "#lapor", "/posko#lapor")).toBe(true);
    expect(tabAktif("/posko", "#bantuan", "/posko#lapor")).toBe(false);
    expect(tabAktif("/posko", "", "/tim")).toBe(false);
  });
});

describe("sembunyikanTabBar", () => {
  it("sembunyi hanya di alur kirim", () => {
    expect(sembunyikanTabBar("/bpbd/kirim")).toBe(true);
    expect(sembunyikanTabBar("/bpbd/kirim/5")).toBe(true);
    expect(sembunyikanTabBar("/bpbd")).toBe(false);
  });
});

describe("grupSidebar", () => {
  it("kelompokkan Utama, Operasional, Pantau, Akun", () => {
    const grup = grupSidebar("BPBD");
    expect(grup.map((g) => g.judul)).toEqual(["Utama", "Operasional", "Pantau", "Akun"]);
    expect(grup.flatMap((g) => g.item).some((i) => i.href === "/transparansi")).toBe(true);
  });
});
