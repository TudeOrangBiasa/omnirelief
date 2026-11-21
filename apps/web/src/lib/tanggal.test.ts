import { describe, expect, it } from "vitest";
import { formatHariLokal, formatTanggalLokal } from "./tanggal";

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

describe("formatHariLokal", () => {
  it("memformat tanggal kedaluwarsa tanpa jam", () => {
    expect(formatHariLokal("2026-12-31")).toBe("31 Des 2026");
  });
});
