import { describe, expect, it } from "vitest";
import { ambilBatchFEFO, urutFEFO } from "./fefo";

describe("FEFO", () => {
  it("kedaluwarsa terdekat keluar duluan, tanpa tanggal paling belakang", () => {
    const hasil = urutFEFO([
      { kode: "A", kedaluwarsa: "2026-12-31", tersedia: 10 },
      { kode: "B", kedaluwarsa: null, tersedia: 10 },
      { kode: "C", kedaluwarsa: "2026-11-24", tersedia: 10 },
    ]).map((b) => b.kode);
    expect(hasil).toEqual(["C", "A", "B"]);
  });

  it("mengambil dari batch terdekat dulu lalu sisanya", () => {
    expect(
      ambilBatchFEFO(
        [
          { kode: "DEKAT", kedaluwarsa: "2026-11-24", tersedia: 30 },
          { kode: "JAUH", kedaluwarsa: "2027-01-19", tersedia: 500 },
        ],
        40
      )
    ).toEqual([
      { kode: "DEKAT", ambil: 30 },
      { kode: "JAUH", ambil: 10 },
    ]);
  });

  it("melewati batch kosong dan berhenti saat cukup", () => {
    expect(
      ambilBatchFEFO(
        [
          { kode: "KOSONG", kedaluwarsa: "2026-11-20", tersedia: 0 },
          { kode: "ISI", kedaluwarsa: "2026-12-01", tersedia: 100 },
          { kode: "LEBIH", kedaluwarsa: "2027-01-01", tersedia: 100 },
        ],
        20
      )
    ).toEqual([{ kode: "ISI", ambil: 20 }]);
  });

  it("stok kurang mengembalikan semua yang ada", () => {
    const hasil = ambilBatchFEFO(
      [{ kode: "SATU", kedaluwarsa: "2026-12-01", tersedia: 5 }],
      40
    );
    expect(hasil).toEqual([{ kode: "SATU", ambil: 5 }]);
  });
});
