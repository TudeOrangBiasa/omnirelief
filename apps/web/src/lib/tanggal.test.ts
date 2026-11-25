import { describe, expect, it } from "vitest";
import {
  catatanRamah,
  formatHariLokal,
  formatTanggalLokal,
  formatWaktuID,
  jamSejak,
  labelStatusRiwayat,
  persenPemenuhan,
  sisaHariKalender,
} from "./tanggal";

describe("formatTanggalLokal", () => {
  it("memformat ISO menjadi tanggal lokal rapi plus zona", () => {
    expect(formatTanggalLokal("2026-11-21T01:47:00.000Z")).toBe(
      "21 Nov 2026, 09.47 WITA"
    );
  });

  it("memakai titik sebagai pemisah jam, bukan titik dua", () => {
    expect(formatTanggalLokal("2026-01-05T00:05:00.000Z")).toContain("08.05");
  });

  it("mengembalikan mentah bila bukan tanggal valid", () => {
    expect(formatTanggalLokal("bukan-tanggal")).toBe("bukan-tanggal");
  });
});

describe("sisaHariKalender", () => {
  it("menghitung selisih tanggal kalender, bukan 24 jam", () => {
    expect(sisaHariKalender("2026-11-25", new Date("2026-11-23T12:00:00+08:00"))).toBe(2);
  });

  it("nol untuk hari yang sama walau jam berbeda", () => {
    expect(sisaHariKalender("2026-11-23", new Date("2026-11-23T22:00:00+08:00"))).toBe(0);
  });

  it("negatif untuk tanggal lewat", () => {
    expect(sisaHariKalender("2026-11-20", new Date("2026-11-23T12:00:00+08:00"))).toBe(-3);
  });
});

describe("labelStatusRiwayat", () => {
  it("memanusiakan kode status internal", () => {
    expect(labelStatusRiwayat("PERLU_DICEK")).toBe("Perlu dicek");
    expect(labelStatusRiwayat("DIPUBLIKASIKAN")).toBe("Dipublikasikan");
    expect(labelStatusRiwayat("DITERIMA")).toBe("Diterima");
  });

  it("mengembalikan apa adanya bila kode tak dikenal", () => {
    expect(labelStatusRiwayat("SESUATU_BARU")).toBe("SESUATU_BARU");
  });
});

describe("catatanRamah", () => {
  it("mengganti timestamp mesin dengan tanggal lokal rapi", () => {
    expect(
      catatanRamah("Lewat batas check-in 2026-11-21T01:47:10.404307+00:00 tanpa kabar")
    ).toBe("Lewat batas check-in 21 Nov 2026, 09.47 WITA tanpa kabar");
  });

  it("membiarkan catatan tanpa timestamp", () => {
    expect(catatanRamah("Paket diterima lengkap")).toBe("Paket diterima lengkap");
  });

  it("meneruskan null", () => {
    expect(catatanRamah(null)).toBe(null);
  });
});

describe("formatHariLokal", () => {
  it("memformat tanggal kedaluwarsa tanpa jam", () => {
    expect(formatHariLokal("2026-12-31")).toBe("31 Des 2026");
  });
});

describe("jamSejak", () => {
  it("menghitung jam lewat sejak timestamp", () => {
    expect(jamSejak("2026-11-23T10:00:00+08:00", new Date("2026-11-24T12:00:00+08:00"))).toBe(26);
  });

  it("negatif untuk waktu depan", () => {
    expect(jamSejak("2026-11-25T10:00:00+08:00", new Date("2026-11-24T10:00:00+08:00"))).toBe(-24);
  });
});

describe("persenPemenuhan", () => {
  it("menghitung persen biasa", () => {
    expect(persenPemenuhan(100, 75)).toBe(75);
  });

  it("nol bila butuh nol", () => {
    expect(persenPemenuhan(0, 10)).toBe(0);
  });

  it("mentok di 100", () => {
    expect(persenPemenuhan(100, 150)).toBe(100);
  });
});

describe("formatWaktuID", () => {
  it("memformat Date ala id-ID", () => {
    expect(formatWaktuID(new Date("2026-11-25T13:29:00+08:00"))).toContain("2026");
  });
});

describe("tepi tanggal", () => {
  it("formatHariLokal kembalikan mentah bila bukan tanggal", () => {
    expect(formatHariLokal("bukan-tanggal")).toBe("bukan-tanggal");
  });
  it("jamSejak NaN bila ISO rusak", () => {
    expect(jamSejak("bukan-tanggal")).toBeNaN();
  });
  it("persenPemenuhan nol bila input tak hingga", () => {
    expect(persenPemenuhan(Number.NaN, 5)).toBe(0);
    expect(persenPemenuhan(0, 0)).toBe(0);
  });
  it("sisaHariKalender NaN bila tanggal rusak", () => {
    expect(sisaHariKalender("xx")).toBeNaN();
  });
});
