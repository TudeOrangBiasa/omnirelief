import { afterEach, describe, expect, it, vi } from "vitest";
import { bacaIdentitas, IDENTITAS_BAKU, simpanIdentitas } from "./identitas";

function pasangPenyimpanan(awal: Record<string, string> = {}) {
  const isi = new Map(Object.entries(awal));
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (kunci: string) => (isi.has(kunci) ? (isi.get(kunci) as string) : null),
      setItem: (kunci: string, nilai: string) => {
        isi.set(kunci, nilai);
      },
    },
  });
  return isi;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("bacaIdentitas", () => {
  it("baku bila kosong, rusak, atau tanpa window", () => {
    pasangPenyimpanan();
    expect(bacaIdentitas()).toEqual(IDENTITAS_BAKU);
    pasangPenyimpanan({ "omnirelief-identitas": "bukan-json" });
    expect(bacaIdentitas()).toEqual(IDENTITAS_BAKU);
    vi.stubGlobal("window", undefined as unknown as Window & typeof globalThis);
    expect(bacaIdentitas()).toEqual(IDENTITAS_BAKU);
  });

  it("rapikan dan batasi panjang, warna asing jadi baku", () => {
    pasangPenyimpanan({
      "omnirelief-identitas": JSON.stringify({
        nama: "  Koordinator Panjang Sekali Melebihi Batas Empat Puluh Karakter X  ",
        jabatan: "J",
        kontak: "08123456789012345678901234567890123",
        warna: "#ff0000",
      }),
    });
    const baca = bacaIdentitas();
    expect(baca.nama.length).toBeLessThanOrEqual(40);
    expect(baca.kontak.length).toBeLessThanOrEqual(30);
    expect(baca.warna).toBe("#0B1F2E");
  });
});

describe("simpanIdentitas", () => {
  it("tulis JSON rapi dan baca kembali sama", () => {
    const isi = pasangPenyimpanan();
    simpanIdentitas({ nama: "Tim 1", jabatan: "Supir", kontak: "08", warna: "#0F3B5F" });
    expect(isi.has("omnirelief-identitas")).toBe(true);
    expect(bacaIdentitas().nama).toBe("Tim 1");
  });
});
