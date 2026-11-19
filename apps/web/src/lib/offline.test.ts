import { describe, expect, it } from "vitest";
import {
  hapusAntrean,
  kirimAntrean,
  muatAntrean,
  tambahAntrean,
  type Penyimpanan,
} from "./offline";

function ingatan(isi: Record<string, string> = {}): Penyimpanan {
  return {
    getItem: (k) => isi[k] ?? null,
    setItem: (k, v) => {
      isi[k] = v;
    },
  };
}

describe("antrean offline", () => {
  it("mulai kosong dan rusak tetap aman", () => {
    expect(muatAntrean(ingatan())).toEqual([]);
    expect(muatAntrean(ingatan({ "omnirelief-antrean": "bukan json" }))).toEqual([]);
  });

  it("tambah lalu hapus per id", () => {
    const simpan = ingatan();
    const sesudah = tambahAntrean(simpan, "laporan", "/api/posko/laporan", { bayi: 1 });
    expect(sesudah).toHaveLength(1);
    expect(muatAntrean(simpan)).toHaveLength(1);
    expect(hapusAntrean(simpan, sesudah[0].id)).toEqual([]);
  });

  it("kirim berhenti di item gagal dan lanjutkan sisanya nanti", async () => {
    const simpan = ingatan();
    tambahAntrean(simpan, "laporan", "/api/posko/laporan", { bayi: 1 });
    tambahAntrean(simpan, "status", "/api/tim/status", { manifest_id: 2 });
    let panggil = 0;
    const sisa = await kirimAntrean(simpan, async () => {
      panggil += 1;
      return panggil > 1;
    });
    expect(sisa).toHaveLength(2);
    const sisa2 = await kirimAntrean(simpan, async () => true);
    expect(sisa2).toEqual([]);
  });
});
