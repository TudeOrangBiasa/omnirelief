import { describe, expect, it } from "vitest";
import {
  GENESIS_HASH,
  hashLog,
  hashManifest,
  verifyLog,
  verifyManifest,
} from "./hash";

const ITEMS = [
  { batchKode: "DNT-2026-002", jumlah: 30 },
  { batchKode: "DNT-2026-001", jumlah: 10 },
];

describe("rantai hash manifest", () => {
  it("menerima hash seed demo yang sah", () => {
    expect(
      verifyManifest({
        kode: "MNF-2026-0001",
        poskoKode: "PB-001",
        items: ITEMS,
        prevHash: GENESIS_HASH,
        hash: "082cbccfb4cf33142171435b35fd9085f04368a3658ea0ec85a08a200bdc6b1e",
      })
    ).toBe(true);
  });

  it("menolak saat satu angka jumlah diubah", () => {
    const asli = hashManifest({
      kode: "MNF-2026-0001",
      poskoKode: "PB-001",
      items: ITEMS,
      prevHash: GENESIS_HASH,
    });
    expect(
      verifyManifest({
        kode: "MNF-2026-0001",
        poskoKode: "PB-001",
        items: [
          { batchKode: "DNT-2026-002", jumlah: 31 },
          { batchKode: "DNT-2026-001", jumlah: 10 },
        ],
        prevHash: GENESIS_HASH,
        hash: asli,
      })
    ).toBe(false);
  });

  it("rantai log terhubung ke hash manifest", () => {
    const manifestHash = hashManifest({
      kode: "MNF-2026-0001",
      poskoKode: "PB-001",
      items: ITEMS,
      prevHash: GENESIS_HASH,
    });
    const logHash = hashLog({
      manifestKode: "MNF-2026-0001",
      status: "DIPUBLIKASIKAN",
      prevHash: manifestHash,
    });
    expect(logHash).toBe(
      "4ef02bf7774dfd340a0a8dd05c0954e33db92c8cc256c788fdd4647cd4b5ca40"
    );
    expect(
      verifyLog({
        manifestKode: "MNF-2026-0001",
        status: "DITERIMA",
        prevHash: manifestHash,
        hash: logHash,
      })
    ).toBe(false);
  });
});
