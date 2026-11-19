import { createHash } from "node:crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function hashManifest(args: {
  kode: string;
  poskoKode: string;
  items: { batchKode: string; jumlah: number }[];
  prevHash: string;
}): string {
  const itemPart = args.items
    .map((i) => `${i.batchKode}:${i.jumlah}`)
    .join(",");
  return sha256Hex(
    `manifest|${args.kode}|posko:${args.poskoKode}|items:${itemPart}|prev:${args.prevHash}`
  );
}

export function hashLog(args: {
  manifestKode: string;
  status: string;
  prevHash: string;
}): string {
  return sha256Hex(
    `log|${args.manifestKode}|${args.status}|prev:${args.prevHash}`
  );
}

export const GENESIS_HASH = "GENESIS";

export function verifyManifest(args: {
  kode: string;
  poskoKode: string;
  items: { batchKode: string; jumlah: number }[];
  prevHash: string;
  hash: string;
}): boolean {
  return (
    hashManifest({
      kode: args.kode,
      poskoKode: args.poskoKode,
      items: args.items,
      prevHash: args.prevHash,
    }) === args.hash
  );
}

export function verifyLog(args: {
  manifestKode: string;
  status: string;
  prevHash: string;
  hash: string;
}): boolean {
  return (
    hashLog({
      manifestKode: args.manifestKode,
      status: args.status,
      prevHash: args.prevHash,
    }) === args.hash
  );
}
