import { describe, expect, it } from "vitest";
import {
  GENESIS_HASH,
  hashLog,
  hashManifest,
  verifyLog,
  verifyManifest,
} from "./hash";

// Properti rantai append-only (janji AGENTS.md butir 6: data terkunci hanya
// tambah riwayat, tidak ada edit diam-diam).
//
// Cakupan (bound eksplisit): rantai 0..12 baris, 200 rantai acak per properti,
// seed tetap 20261124 (reproducible). Status diambil dari himpunan nyata +
// string acak; kode acak alfanumerik. Properti ini memakai kode asli
// (lib/hash.ts), bukan model tiruan.
const SEED_AWAL = 20261124;
const CACAH_RANTAI = 200;
const PANJANG_MAKS = 12;

function mulberry32(benih: number): () => number {
  let a = benih >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ABJAD = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
const STATUS_ASLI = [
  "DIPUBLIKASIKAN",
  "DITERIMA",
  "DITOLAK",
  "MINTA_REVISI",
  "DIBATALKAN",
  "DIKIRIM",
];

type BarisLog = {
  manifestKode: string;
  status: string;
  prevHash: string;
  hash: string;
};

function acak(acak: () => number, panjang: number): string {
  let s = "";
  for (let i = 0; i < panjang; i++) s += ABJAD[Math.floor(acak() * ABJAD.length)];
  return s;
}

function bangunRantai(rnd: () => number): BarisLog[] {
  const n = Math.floor(rnd() * (PANJANG_MAKS + 1));
  const kode = `MNF-${acak(rnd, 3)}`;
  let prev = GENESIS_HASH;
  const keluar: BarisLog[] = [];
  for (let i = 0; i < n; i++) {
    const status =
      rnd() < 0.7
        ? STATUS_ASLI[Math.floor(rnd() * STATUS_ASLI.length)]
        : `X-${acak(rnd, 4)}`;
    const hash = hashLog({ manifestKode: kode, status, prevHash: prev });
    keluar.push({ manifestKode: kode, status, prevHash: prev, hash });
    prev = hash;
  }
  return keluar;
}

function rantaiSah(baris: BarisLog[]): boolean {
  return baris.every((b) =>
    verifyLog({
      manifestKode: b.manifestKode,
      status: b.status,
      prevHash: b.prevHash,
      hash: b.hash,
    })
  );
}

function rantaiTersambung(baris: BarisLog[]): boolean {
  return baris.every((b, i) =>
    i === 0 ? true : b.prevHash === baris[i - 1].hash
  );
}

describe("properti rantai append-only (input acak, kode asli)", () => {
  it("rantai utuh selalu terverifikasi dan tersambung", () => {
    const rnd = mulberry32(SEED_AWAL);
    for (let i = 0; i < CACAH_RANTAI; i++) {
      const rantai = bangunRantai(rnd);
      expect(rantaiSah(rantai)).toBe(true);
      expect(rantaiTersambung(rantai)).toBe(true);
    }
  });

  it("satu bit ubahan di mana pun membuat verifikasi gagal", () => {
    const rnd = mulberry32(SEED_AWAL + 1);
    for (let i = 0; i < CACAH_RANTAI; i++) {
      const rantai = bangunRantai(rnd);
      if (rantai.length === 0) continue;
      const korban = Math.floor(rnd() * rantai.length);
      const varian: BarisLog[] = rantai.map((b, j) => {
        if (j !== korban) return b;
        const pilih = Math.floor(rnd() * 4);
        if (pilih === 0) return { ...b, status: `${b.status}-UBAH` };
        if (pilih === 1) return { ...b, manifestKode: `${b.manifestKode}-X` };
        if (pilih === 2) return { ...b, prevHash: b.hash };
        return { ...b, hash: `${b.hash.slice(0, -1)}${b.hash.endsWith("0") ? "1" : "0"}` };
      });
      expect(rantaiSah(varian)).toBe(false);
    }
  });

  it("tukar urutan, buang tengah, atau ganda membuat sambungan putus", () => {
    const rnd = mulberry32(SEED_AWAL + 2);
    for (let i = 0; i < CACAH_RANTAI; i++) {
      const rantai = bangunRantai(rnd);
      if (rantai.length < 2) continue;
      const a = Math.floor(rnd() * rantai.length);
      let b = Math.floor(rnd() * rantai.length);
      if (b === a) b = (b + 1) % rantai.length;
      const tukar = rantai.map((x, j) =>
        j === a ? rantai[b] : j === b ? rantai[a] : x
      );
      expect(rantaiTersambung(tukar)).toBe(false);
      if (rantai.length > 2) {
        const tengah = Math.floor(rantai.length / 2);
        expect(rantaiTersambung(rantai.filter((_, j) => j !== tengah))).toBe(false);
      }
      const ganda = [...rantai, rantai[rantai.length - 1]];
      expect(rantaiTersambung(ganda)).toBe(false);
    }
  });

  it("masukan sama selalu menghasilkan hash sama (deterministik audit)", () => {
    const rnd = mulberry32(SEED_AWAL + 3);
    for (let i = 0; i < CACAH_RANTAI; i++) {
      const kode = `MNF-${acak(rnd, 4)}`;
      const items = [
        { batchKode: `DNT-2026-${acak(rnd, 3)}`, jumlah: Math.floor(rnd() * 500) },
      ];
      const a = hashManifest({ kode, poskoKode: "2", items, prevHash: GENESIS_HASH });
      const b = hashManifest({ kode, poskoKode: "2", items, prevHash: GENESIS_HASH });
      expect(a).toBe(b);
      expect(verifyManifest({ kode, poskoKode: "2", items, prevHash: GENESIS_HASH, hash: a })).toBe(true);
      const status = STATUS_ASLI[Math.floor(rnd() * STATUS_ASLI.length)];
      const l1 = hashLog({ manifestKode: kode, status, prevHash: a });
      const l2 = hashLog({ manifestKode: kode, status, prevHash: a });
      expect(l1).toBe(l2);
    }
  });

  it("status tak dikenal tetap mengikat rantai (tidak lolos diam-diam)", () => {
    const rnd = mulberry32(SEED_AWAL + 4);
    for (let i = 0; i < 50; i++) {
      const kode = `MNF-${acak(rnd, 4)}`;
      const aneh = `X-${acak(rnd, 6)}`;
      const h = hashLog({ manifestKode: kode, status: aneh, prevHash: GENESIS_HASH });
      expect(verifyLog({ manifestKode: kode, status: aneh, prevHash: GENESIS_HASH, hash: h })).toBe(true);
      expect(verifyLog({ manifestKode: kode, status: `${aneh}-BEDA`, prevHash: GENESIS_HASH, hash: h })).toBe(false);
    }
  });
});
