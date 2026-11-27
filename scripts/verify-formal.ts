import assert from "node:assert/strict";
import {
  GENESIS_HASH,
  hashLog,
  hashManifest,
  verifyLog,
  verifyManifest,
} from "../apps/web/src/lib/hash";
import {
  ambilBatchFEFO,
  batchTerlewati,
  urutFEFO,
  type BatchKandidat,
  type BatchSisa,
} from "../apps/web/src/lib/fefo";
import {
  validasiKendala,
  validasiLaporan,
  validasiManifestDraft,
  validasiStatusTim,
  validasiVerifikasi,
} from "../apps/web/src/lib/validasi";

const SELF_TEST = process.argv.includes("--self-test");

type CheckResult = {
  name: string;
  casesChecked: number;
  passed: boolean;
  counterexample?: string;
};

function checkHashChainExhaustive(): CheckResult {
  let casesChecked = 0;
  const statuses = ["KELUAR_GUDANG", "DALAM_PERJALANAN", "CHECKIN", "TIBA", "DITERIMA"];

  for (let len = 1; len <= 8; len++) {
    const manifestArgs = {
      kode: `MNF-2026-000${len}`,
      poskoKode: `PSK-0${len}`,
      items: [
        { batchKode: `DNT-2026-00${len}`, jumlah: 10 * len },
        { batchKode: `DNT-2026-01${len}`, jumlah: 5 + len },
      ],
      prevHash: GENESIS_HASH,
    };
    const mHash = hashManifest(manifestArgs);
    casesChecked++;
    if (!verifyManifest({ ...manifestArgs, hash: mHash })) {
      return {
        name: "Hash Chain Integrity & Tamper Detection",
        casesChecked,
        passed: false,
        counterexample: `Valid manifest ${manifestArgs.kode} failed verifyManifest`,
      };
    }

    // Tampering any manifest field must fail verification
    const tamperedManifests = [
      { ...manifestArgs, kode: `${manifestArgs.kode}-X`, hash: mHash },
      { ...manifestArgs, poskoKode: `${manifestArgs.poskoKode}-X`, hash: mHash },
      {
        ...manifestArgs,
        items: [{ batchKode: manifestArgs.items[0].batchKode, jumlah: 9999 }],
        hash: mHash,
      },
      { ...manifestArgs, prevHash: "TAMPERED", hash: mHash },
      { ...manifestArgs, hash: mHash.replace(/^./, mHash[0] === "0" ? "1" : "0") },
    ];

    for (const bad of tamperedManifests) {
      casesChecked++;
      if (verifyManifest(bad)) {
        return {
          name: "Hash Chain Integrity & Tamper Detection",
          casesChecked,
          passed: false,
          counterexample: `Tampered manifest accepted: ${JSON.stringify(bad)}`,
        };
      }
    }

    let prev = mHash;
    for (let i = 0; i < len; i++) {
      const status = statuses[i % statuses.length];
      const lHash = hashLog({
        manifestKode: manifestArgs.kode,
        status,
        prevHash: prev,
      });
      casesChecked++;
      if (
        !verifyLog({
          manifestKode: manifestArgs.kode,
          status,
          prevHash: prev,
          hash: lHash,
        })
      ) {
        return {
          name: "Hash Chain Integrity & Tamper Detection",
          casesChecked,
          passed: false,
          counterexample: `Valid log step ${i} failed verifyLog`,
        };
      }

      // Tampering any log field must fail verification
      const badLogs = [
        { manifestKode: "MNF-9999-9999", status, prevHash: prev, hash: lHash },
        { manifestKode: manifestArgs.kode, status: "DIBATALKAN", prevHash: prev, hash: lHash },
        { manifestKode: manifestArgs.kode, status, prevHash: "WRONG_PREV", hash: lHash },
      ];
      for (const badLog of badLogs) {
        casesChecked++;
        if (verifyLog(badLog)) {
          return {
            name: "Hash Chain Integrity & Tamper Detection",
            casesChecked,
            passed: false,
            counterexample: `Tampered log accepted: ${JSON.stringify(badLog)}`,
          };
        }
      }
      prev = lHash;
    }
  }

  return {
    name: "Hash Chain Integrity & Tamper Detection",
    casesChecked,
    passed: true,
  };
}

function checkValidationAndStateMachine(): CheckResult {
  let casesChecked = 0;

  // 1. Report validation boundary checks across all 6 columns
  const cols = ["bayi", "balita", "ibu_hamil", "lansia", "disabilitas", "umum"] as const;
  const baseValid: Record<string, unknown> = {
    bayi: 1,
    balita: 2,
    ibu_hamil: 0,
    lansia: 3,
    disabilitas: 0,
    umum: 10,
    draft: false,
  };

  casesChecked++;
  const okReport = validasiLaporan(baseValid);
  if (!okReport.ok || okReport.status !== "MENUNGGU_VERIFIKASI") {
    return {
      name: "State Machine & Validation Invariants",
      casesChecked,
      passed: false,
      counterexample: `Valid report rejected: ${JSON.stringify(okReport)}`,
    };
  }

  for (const col of cols) {
    for (const badVal of [-1, 1.5, NaN, "abc"]) {
      casesChecked++;
      const res = validasiLaporan({ ...baseValid, [col]: badVal });
      if (res.ok) {
        return {
          name: "State Machine & Validation Invariants",
          casesChecked,
          passed: false,
          counterexample: `Invalid ${col}=${String(badVal)} accepted`,
        };
      }
    }
  }

  // 2. Verification decisions: non-DISETUJUI requires alasan >= 5 chars
  for (const keputusan of ["DISETUJUI", "MINTA_REVISI", "DITOLAK", "LAINNYA"]) {
    for (const catatan of ["", "abc", "kurang jelas"]) {
      casesChecked++;
      const res = validasiVerifikasi({ snapshot_id: 1, keputusan, catatan });
      const shouldPass =
        keputusan === "DISETUJUI" ||
        ((keputusan === "MINTA_REVISI" || keputusan === "DITOLAK") && catatan.trim().length >= 5);
      if (res.ok !== shouldPass) {
        return {
          name: "State Machine & Validation Invariants",
          casesChecked,
          passed: false,
          counterexample: `validasiVerifikasi mismatch for (${keputusan}, "${catatan}")`,
        };
      }
    }
  }

  // 3. Team status & terminal state guard: DITERIMA / DIBATALKAN are not team-settable
  const allowedTeamStatuses = ["KELUAR_GUDANG", "DALAM_PERJALANAN", "TIBA", "CHECKIN"];
  const forbiddenStatuses = ["DRAFT", "DIPUBLIKASIKAN", "DITERIMA", "DIBATALKAN", "PERLU_DICEK"];
  for (const s of [...allowedTeamStatuses, ...forbiddenStatuses]) {
    casesChecked++;
    const res = validasiStatusTim({ manifest_id: 1, status: s });
    const expected = allowedTeamStatuses.includes(s);
    if (res.ok !== expected) {
      return {
        name: "State Machine & Validation Invariants",
        casesChecked,
        passed: false,
        counterexample: `validasiStatusTim(${s}) returned ok=${res.ok}, expected ${expected}`,
      };
    }
  }

  // 4. Incident validation requires non-empty kendala
  for (const kendala of ["", "   ", "Jembatan putus"]) {
    for (const darurat of [true, false]) {
      casesChecked++;
      const res = validasiKendala({ manifest_id: 1, kendala, darurat });
      const expected = kendala.trim().length > 0;
      if (res.ok !== expected) {
        return {
          name: "State Machine & Validation Invariants",
          casesChecked,
          passed: false,
          counterexample: `validasiKendala("${kendala}", ${darurat}) returned ok=${res.ok}`,
        };
      }
    }
  }

  // 5. Manifest draft requires positive integer posko_id, non-empty tim, non-empty valid items
  casesChecked++;
  if (validasiManifestDraft({ posko_id: 1, tim: "Tim A", items: [] }).ok) {
    return {
      name: "State Machine & Validation Invariants",
      casesChecked,
      passed: false,
      counterexample: "Empty items manifest draft accepted",
    };
  }

  return {
    name: "State Machine & Validation Invariants",
    casesChecked,
    passed: true,
  };
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) {
      out.push([arr[i], ...p]);
    }
  }
  return out;
}

function checkFefoExhaustive(): CheckResult {
  let casesChecked = 0;
  const basePool: BatchSisa[] = [
    { kode: "B-NEAR", kedaluwarsa: "2026-12-01", tersedia: 3, sisa: 3 },
    { kode: "B-MID", kedaluwarsa: "2026-12-10", tersedia: 4, sisa: 4 },
    { kode: "B-FAR", kedaluwarsa: "2027-01-15", tersedia: 5, sisa: 5 },
    { kode: "B-NULL", kedaluwarsa: null, tersedia: 2, sisa: 2 },
  ];

  const perms = permutations(basePool);
  for (const pool of perms) {
    casesChecked++;
    const sorted = urutFEFO(pool);
    // Invariant 1: non-null dates are strictly sorted ascending, null dates are last
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].kedaluwarsa;
      const curr = sorted[i].kedaluwarsa;
      if (prev === null && curr !== null) {
        return {
          name: "FEFO Ordering & Stock Conservation",
          casesChecked,
          passed: false,
          counterexample: `Null expiry placed before ${curr}`,
        };
      }
      if (prev !== null && curr !== null && prev > curr) {
        return {
          name: "FEFO Ordering & Stock Conservation",
          casesChecked,
          passed: false,
          counterexample: `Later expiry ${prev} placed before ${curr}`,
        };
      }
    }

    // Invariant 2: stock conservation across all demand values 0..16
    const totalAvailable = pool.reduce((s, b) => s + b.tersedia, 0);
    for (let demand = 0; demand <= 16; demand++) {
      casesChecked++;
      const alloc = ambilBatchFEFO(pool as BatchKandidat[], demand);
      const totalAlloc = alloc.reduce((s, a) => s + a.ambil, 0);
      if (totalAlloc !== Math.min(demand, totalAvailable)) {
        return {
          name: "FEFO Ordering & Stock Conservation",
          casesChecked,
          passed: false,
          counterexample: `Demand ${demand} allocated ${totalAlloc}, expected ${Math.min(demand, totalAvailable)}`,
        };
      }
      for (const a of alloc) {
        const src = pool.find((b) => b.kode === a.kode);
        if (!src || a.ambil <= 0 || a.ambil > src.tersedia) {
          return {
            name: "FEFO Ordering & Stock Conservation",
            casesChecked,
            passed: false,
            counterexample: `Over-allocated batch ${a.kode}: ${a.ambil}`,
          };
        }
      }
    }

    // Invariant 3: skipping earlier non-empty batch is always flagged
    casesChecked++;
    const skipped = batchTerlewati(pool, ["B-FAR"]);
    if (!skipped.includes("B-NEAR") || !skipped.includes("B-MID")) {
      return {
        name: "FEFO Ordering & Stock Conservation",
        casesChecked,
        passed: false,
        counterexample: `batchTerlewati missed earlier batches: ${JSON.stringify(skipped)}`,
      };
    }
  }

  return {
    name: "FEFO Ordering & Stock Conservation",
    casesChecked,
    passed: true,
  };
}

function runSelfTest(): void {
  const manifest = {
    kode: "MNF-2026-0001",
    poskoKode: "PSK-01",
    items: [{ batchKode: "DNT-2026-001", jumlah: 10 }],
    prevHash: GENESIS_HASH,
  };
  const validHash = hashManifest(manifest);
  // Deliberately break the manifest amount (10 -> 11) and verify it fails
  const brokenOk = verifyManifest({
    ...manifest,
    items: [{ batchKode: "DNT-2026-001", jumlah: 11 }],
    hash: validHash,
  });
  assert.equal(brokenOk, false, "Self-test expected tampered manifest to fail verification");
  console.log("SELF-TEST PASSED: broken manifest mutation (jumlah 10 -> 11) was caught.");
}

function main(): void {
  if (SELF_TEST) {
    runSelfTest();
    return;
  }

  const results = [
    checkHashChainExhaustive(),
    checkValidationAndStateMachine(),
    checkFefoExhaustive(),
  ];

  let totalCases = 0;
  let allPassed = true;
  for (const r of results) {
    totalCases += r.casesChecked;
    const status = r.passed ? "PASS" : "FAIL";
    console.log(`[${status}] ${r.name} (${r.casesChecked} cases checked)`);
    if (!r.passed) {
      allPassed = false;
      console.error(`  Counterexample: ${r.counterexample}`);
    }
  }

  console.log(`Total formal cases verified: ${totalCases}`);
  if (!allPassed) {
    process.exit(1);
  }
}

main();
