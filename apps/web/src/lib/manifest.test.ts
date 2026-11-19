import { describe, expect, it } from "vitest";
import { validasiManifestDraft } from "./validasi";
import { batchTerlewati } from "./fefo";
import { petaTerpakai } from "./stok";

describe("validasi draf manifest", () => {
  const penuh = {
    posko_id: 2,
    tim: "Tim Antar 1",
    eta: "2026-11-30T10:00:00Z",
    batas_checkin: "2026-11-29T10:00:00Z",
    items: [{ batch_id: 1, jumlah: 40 }],
  };

  it("menerima draf lengkap", () => {
    expect(validasiManifestDraft(penuh)).toEqual({
      ok: true,
      posko_id: 2,
      tim: "Tim Antar 1",
      eta: "2026-11-30T10:00:00Z",
      batas_checkin: "2026-11-29T10:00:00Z",
      items: [{ batch_id: 1, jumlah: 40 }],
    });
  });

  it("menolak posko, tim, tanggal, dan item rusak", () => {
    expect(validasiManifestDraft({ ...penuh, posko_id: 0 }).ok).toBe(false);
    expect(validasiManifestDraft({ ...penuh, tim: "  " }).ok).toBe(false);
    expect(validasiManifestDraft({ ...penuh, eta: "kapan" }).ok).toBe(false);
    expect(validasiManifestDraft({ ...penuh, items: [] }).ok).toBe(false);
    expect(
      validasiManifestDraft({ ...penuh, items: [{ batch_id: 1, jumlah: 0 }] }).ok
    ).toBe(false);
  });

  it("eta dan batas boleh kosong", () => {
    const hasil = validasiManifestDraft({ ...penuh, eta: "", batas_checkin: undefined });
    expect(hasil.ok && hasil.eta).toBe(null);
    expect(hasil.ok && hasil.batas_checkin).toBe(null);
  });
});

describe("peringatan FEFO", () => {
  const batch = [
    { kode: "DEKAT", kedaluwarsa: "2026-11-24", tersedia: 30, sisa: 30 },
    { kode: "JAUH", kedaluwarsa: "2027-01-19", tersedia: 500, sisa: 500 },
  ];

  it("diam saat batch terdekat yang dipakai", () => {
    expect(batchTerlewati(batch, ["DEKAT"])).toEqual([]);
  });

  it("menandai batch dekat yang dilewati", () => {
    expect(batchTerlewati(batch, ["JAUH"])).toEqual(["DEKAT"]);
  });

  it("mengabaikan batch yang sudah habis", () => {
    const habis = [
      { kode: "HABIS", kedaluwarsa: "2026-11-20", tersedia: 10, sisa: 0 },
      ...batch,
    ];
    expect(batchTerlewati(habis, ["JAUH"])).toEqual(["DEKAT"]);
  });
});

describe("peta terpakai", () => {
  it("menjumlahkan alokasi aktif dan membuang yang batal", () => {
    const peta = petaTerpakai([
      { batch_id: 1, jumlah: 30, batal: false },
      { batch_id: 1, jumlah: 10, batal: false },
      { batch_id: 2, jumlah: 99, batal: true },
    ]);
    expect(peta.get(1)).toBe(40);
    expect(peta.has(2)).toBe(false);
  });
});
