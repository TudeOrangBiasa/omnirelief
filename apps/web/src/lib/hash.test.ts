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
        poskoKode: "2",
        items: ITEMS,
        prevHash: GENESIS_HASH,
        hash: "ef679a113709f5f1f1f60f0f3bad1920534f12fc246a93161ea757e3350b5837",
      })
    ).toBe(true);
  });

  it("menolak saat satu angka jumlah diubah", () => {
    const asli = hashManifest({
      kode: "MNF-2026-0001",
      poskoKode: "2",
      items: ITEMS,
      prevHash: GENESIS_HASH,
    });
    expect(
      verifyManifest({
        kode: "MNF-2026-0001",
        poskoKode: "2",
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
      poskoKode: "2",
      items: ITEMS,
      prevHash: GENESIS_HASH,
    });
    const logHash = hashLog({
      manifestKode: "MNF-2026-0001",
      status: "DIPUBLIKASIKAN",
      prevHash: manifestHash,
    });
    expect(logHash).toBe(
      "13a887eb320fb6d77ee5ffaf3d11eb61a2482a027aac47af06e60136d8747c0b"
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
