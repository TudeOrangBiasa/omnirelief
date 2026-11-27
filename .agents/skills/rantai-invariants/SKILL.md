---
name: rantai-invariants
description: "Formal verification of OmniRelief's hash chain integrity, validation state-machine boundaries, and FEFO allocation invariants. Run whenever editing apps/web/src/lib/hash.ts, riwayat.ts, fefo.ts, or validasi.ts."
---

# Rantai Invariants (Formal Verification)

This skill runs exhaustive property and state-space checks directly against OmniRelief's TypeScript domain modules using `bun scripts/verify-formal.ts`.

## Sync & Coverage Record

1. **Last verified commit:** `58ea3fb`
2. **Covered modules:**
   a. `apps/web/src/lib/hash.ts` (`GENESIS_HASH`, `hashManifest`, `verifyManifest`, `hashLog`, `verifyLog`)
   b. `apps/web/src/lib/fefo.ts` (`urutFEFO`, `ambilBatchFEFO`, `batchTerlewati`)
   c. `apps/web/src/lib/validasi.ts` (`validasiLaporan`, `validasiVerifikasi`, `validasiManifestDraft`, `validasiStatusTim`, `validasiKendala`)
   d. `apps/web/src/lib/riwayat.ts` (hash-chaining contract)
3. **Why TypeScript/Bun:** No external SMT/TLA+ solver (`tlc`, `z3`, `apalache`) is installed in the environment, so `scripts/verify-formal.ts` executes exhaustive checks directly on the real implementation instead of an uncoupled hand model.

## Properties Verified & Bounds

1. **Hash Chain Integrity & Tamper Detection:** Checks chains of length 1 through 8; verifies every untampered manifest and log node passes, and proves mutating any field (`kode`, `poskoKode`, `items`, `prevHash`, `status`, `hash`) fails verification.
2. **State Machine & Validation Boundaries:** Checks all 6 survivor columns against negative/non-integer values, all verification decisions (`DISETUJUI`, `MINTA_REVISI`, `DITOLAK`) with note length thresholds, team status transitions against terminal/forbidden states (`DITERIMA`, `DIBATALKAN`, `DRAFT`, `DIPUBLIKASIKAN`, `PERLU_DICEK`), and incident reports.
3. **FEFO Ordering & Stock Conservation:** Exhaustively checks all 24 permutations of a 4-batch pool (including `null` expiry) across demand values 0 through 16, proving earliest-expiry-first ordering, zero over-allocation, exact conservation `min(demand, totalAvailable)`, and `batchTerlewati` detection.

## How to Run

```bash
bun run verify:formal
```

To verify that the checker catches a broken invariant (self-test):

```bash
bun run verify:formal --self-test
```

## Updating After Code Changes

If a PR modifies any covered file above, run `bun run verify:formal`. If the change intentionally alters a domain rule (for example, adding a new status to `STATUS_TIM` in `validasi.ts`), update `scripts/verify-formal.ts` to match the new contract and advance the sync commit in this file only after `bun run verify:formal` passes.
