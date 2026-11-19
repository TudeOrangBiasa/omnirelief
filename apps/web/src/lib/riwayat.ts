import { GENESIS_HASH, hashLog } from "@/lib/hash";
import { tunggal } from "./supabase/baris";
import type { AdminClient } from "./supabase/admin";

export async function tambahLog(
  admin: AdminClient,
  args: {
    manifest_id: number;
    manifest_kode: string;
    status: string;
    catatan: string | null;
    dibuat_oleh: string | null;
  }
): Promise<{ ok: true; hash: string } | { ok: false; galat: string }> {
  const { data: mentah } = await admin
    .from("manifest_log")
    .select("hash")
    .eq("manifest_id", args.manifest_id)
    .order("id", { ascending: false })
    .limit(1)
    .single();
  let prev = tunggal<{ hash: string }>(mentah)?.hash ?? null;
  if (!prev) {
    const { data: mentahManifest } = await admin
      .from("manifest")
      .select("hash")
      .eq("id", args.manifest_id)
      .single();
    prev = tunggal<{ hash: string }>(mentahManifest)?.hash ?? GENESIS_HASH;
  }
  const hash = hashLog({
    manifestKode: args.manifest_kode,
    status: args.status,
    prevHash: prev,
  });
  const { error } = await admin.from("manifest_log").insert({
    manifest_id: args.manifest_id,
    status: args.status,
    catatan: args.catatan,
    dibuat_oleh: args.dibuat_oleh,
    hash,
  });
  if (error) return { ok: false, galat: "gagal mencatat riwayat" };
  return { ok: true, hash };
}

export const LOG_FINAL = ["DITERIMA", "DIBATALKAN"];

export async function statusTerakhir(
  admin: AdminClient,
  manifest_id: number
): Promise<string | null> {
  const { data: mentah } = await admin
    .from("manifest_log")
    .select("status")
    .eq("manifest_id", manifest_id)
    .order("id", { ascending: false })
    .limit(1)
    .single();
  return tunggal<{ status: string }>(mentah)?.status ?? null;
}
