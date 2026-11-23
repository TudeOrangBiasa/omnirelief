import { describe, expect, it } from "vitest";
import {
  hapusAntrean,
  kirimAntrean,
  kirimSatuAntrean,
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

describe("kirimSatuAntrean", () => {
  it("2xx terkirim, 4xx tuntas dengan laporan, 5xx dan jaringan ulang lagi", async () => {
    const asli = globalThis.fetch;
    const lapor: string[] = [];
    try {
      globalThis.fetch = (async () => new Response("{}", { status: 200 })) as typeof fetch;
      expect(await kirimSatuAntrean("/x", {}, (m) => void lapor.push(m))).toBe(true);
      globalThis.fetch = (async () =>
        new Response(JSON.stringify({ ok: false, galat: "pengiriman sudah selesai" }), {
          status: 409,
        })) as typeof fetch;
      expect(await kirimSatuAntrean("/x", {}, (m) => void lapor.push(m))).toBe(true);
      globalThis.fetch = (async () => new Response("salah", { status: 500 })) as typeof fetch;
      expect(await kirimSatuAntrean("/x", {})).toBe(false);
      globalThis.fetch = (async () => {
        throw new Error("putus");
      }) as typeof fetch;
      expect(await kirimSatuAntrean("/x", {})).toBe(false);
    } finally {
      globalThis.fetch = asli;
    }
    expect(lapor).toEqual(["pengiriman sudah selesai"]);
  });
});
